---
title: Virtual Threads
description: The thread-per-request problem, virtual threads and carrier threads, creation, mounting and unmounting on blocking operations, when virtual threads help and when they do not, pinning, limiting concurrency, ThreadLocal and ScopedValue, structured concurrency.
---

## Why Virtual Threads

The simplest way to write server code is **thread per request**: each request is handled in a separate thread by ordinary sequential code that blocks on the network and the database. The problem is the count: a platform thread is an OS thread with a large stack, and thousands of such threads exhaust memory long before the CPU is exhausted. Most of the time these threads do nothing — they just **wait** for I/O.

Asynchronous chains (`CompletableFuture`) solve the problem, but at a price: the code is split into continuations, the ordinary call stack is lost, and `try/catch` and loops have to be expressed with combinators.

**Virtual threads** (Java 21) give both advantages: code is written in the blocking style, and the OS thread is not occupied while waiting.

* A virtual thread is a `Thread` object managed by the **JVM**, not by the OS. Its stack is stored on the heap and grows as needed, so creating one costs a few hundred bytes.
* A virtual thread runs on one of a few platform **carrier threads** — a `ForkJoinPool` with as many threads as there are cores.
* When a virtual thread reaches a **blocking** operation (`sleep`, reading from a socket, `BlockingQueue.take`, `lock()`), the JVM **unmounts** it from the carrier: it saves its stack on the heap and frees the carrier for another virtual thread. When the operation completes, the thread is **mounted** again on a free carrier and continues from the same place.

```text
        virtual threads (millions)         VT1   VT2   VT3   VT4   ...
                                             │           │
                                     mounted ▼           ▼     the rest wait on the heap
        carrier threads (= cores)         [ carrier-1 ] [ carrier-2 ]
                                             │           │
        OS threads                        [ OS thread ] [ OS thread ]
```

> [!NOTE]
> Saving the stack and resuming execution from the same place is the same idea of a **continuation** as in asynchronous chains. The difference is that here the JVM creates the continuation automatically, rather than the programmer by hand.

## Creating

```java
Thread vt = Thread.ofVirtual().name("virtual-", 0).start(() -> System.out.println("hello"));
vt.join();

Thread.startVirtualThread(() -> System.out.println("a shorter form"));

System.out.println(vt.isVirtual());            // true

try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<String> f = executor.submit(() -> download(url));   // a new virtual thread per task
    System.out.println(f.get());
}
```

Virtual threads are always daemon threads (they do not keep the JVM alive) and have the same priority. The rest of the API — `join`, `interrupt`, `ThreadLocal`, `synchronized` — works as with ordinary threads.

## Scale

Ten thousand tasks, each of which "waits for the network" for a second:

```java
Instant start = Instant.now();
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> executor.submit(() -> {
        Thread.sleep(Duration.ofSeconds(1));
        return i;
    }));
}
System.out.println("Time: " + Duration.between(start, Instant.now()).toMillis() + " ms");   // ~1000 ms
```

The program finishes in about a second. With `Executors.newFixedThreadPool(200)` it would take 50 seconds (10,000 / 200), and creating 10,000 platform threads would put a noticeable load on the system.

## When Virtual Threads Help

* **They help** when there are many tasks and they mostly **wait**: HTTP servers, REST and database clients, message queue processing. Throughput grows because millions of tasks can wait in parallel.
* **They do not help** with computations (CPU-bound): there will not be more cores, and a computing virtual thread occupies its carrier just like a platform thread. For computations — parallel Stream API streams and `ForkJoinPool` (the next page).
* Virtual threads do not make code faster: an individual operation takes just as long. Only the number of simultaneous operations grows.

## Usage Rules

### Do Not Pool Virtual Threads

A pool exists to reuse **expensive** resources. A virtual thread is cheap, so one is created per task and thrown away. A pool of virtual threads merely limits the number of simultaneous tasks, and there is a better tool for that.

### Limit Concurrency with a Semaphore

If an external resource can withstand a limited number of simultaneous requests (e.g. 10 database connections), the number of virtual threads is limited not with a pool but with a **semaphore**:

```java
private final Semaphore dbPermits = new Semaphore(10);

String query(String sql) throws InterruptedException {
    dbPermits.acquire();                  // the virtual thread waits without occupying a carrier
    try {
        return database.execute(sql);
    } finally {
        dbPermits.release();
    }
}
```

### Pinning

A virtual thread cannot be unmounted if it is **pinned** to its carrier. Then a blocking operation blocks the carrier itself, and if there are as many such threads as carriers, the remaining virtual threads stop running. Pinning occurs when the thread executes native code (via JNI or FFM). Before Java 24, blocking inside `synchronized` also caused pinning, which is why code for older versions was advised to use `ReentrantLock`. Since Java 24 `synchronized` no longer pins virtual threads.

Diagnostics: `-Djdk.tracePinnedThreads=full` (before Java 24) or the JFR event `jdk.VirtualThreadPinned`.

### ThreadLocal and ScopedValue

`ThreadLocal` works in virtual threads too, but with millions of threads millions of copies of cached objects take a lot of memory. For passing context down the call stack (the current user, a request ID) there is **`ScopedValue`** (Java 25): an immutable value visible only within a given call.

```java
private static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

void handle(Request request) {
    ScopedValue.where(REQUEST_ID, request.id()).run(() -> processRequest(request));
}

void log(String message) {
    System.out.println("[" + REQUEST_ID.get() + "] " + message);   // available without passing it as a parameter
}
```

## Structured Concurrency

When a task starts several subtasks in parallel, ordinary `Future`s are not linked to each other: if one subtask fails, the others keep running, and if the parent task is interrupted, the subtasks do not find out. **Structured concurrency** (`StructuredTaskScope`, a preview API in Java 21–25, with details of the API changing between versions) ties the lifetime of subtasks to a block of code, just as a `try` block ties the lifetime of a resource:

```java
Response handle(int userId) throws InterruptedException {
    try (var scope = StructuredTaskScope.open()) {                 // Java 25 (preview)
        Subtask<User> user = scope.fork(() -> findUser(userId));   // each subtask runs in a virtual thread
        Subtask<List<Order>> orders = scope.fork(() -> fetchOrders(userId));

        scope.join();                     // waits for both; if one fails, the other is cancelled and join throws
        return new Response(user.get(), orders.get());
    }                                     // after the block no subtask is guaranteed to be running
}
```

Advantages:

* the failure of one subtask automatically cancels the rest;
* interrupting the parent thread cancels all subtasks;
* a thread dump shows the "task → subtasks" hierarchy.

> [!NOTE]
> A preview API requires the `--enable-preview` flag at compile time and at run time. For code without preview features, the same pattern is implemented with an `ExecutorService` with `invokeAll` and manual `Future` cancellation.
