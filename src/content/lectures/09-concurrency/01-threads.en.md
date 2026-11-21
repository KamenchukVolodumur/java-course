---
title: Threads
description: Threads as the unit of execution, creating and starting a Thread, join and sleep, blocking operations, thread states, daemon threads, data races and synchronized, uncaught exceptions in threads, interruption, thread pools.
---

## Introduction

A **thread** is the basic unit of code execution within a process. Threads of one process **share** its memory (the heap) and OS resources (open files, network connections). But each thread has its own:

* **call stack** — local variables, method parameters and return addresses. A variable declared inside a method belongs only to the thread executing that method;
* **CPU context** — the register state, including the instruction pointer, which is saved and restored when threads are switched.

> [!NOTE]
> Creating a thread is much cheaper than creating a process. But an ordinary (platform) Java thread is an OS thread with its own stack of about 1 MB, so thousands of such threads already put a noticeable load on the system. Lightweight **virtual** threads are covered on a separate page.

The OS scheduler switches threads, so even on a single CPU core they execute **concurrently** (taking turns). On multi-core systems threads execute **in parallel**, each on its own core.

> [!WARNING]
> Operations on shared data from several threads require **synchronization**. Without it the result depends on the random order of execution (the "Synchronization" chapter).

## Creating Threads

The `java.lang.Thread` class represents an OS thread managed by the JVM. The thread's code is passed as a `Runnable` object (the functional interface `void run()`), most often a lambda. The `start()` method starts the thread.

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread(Main::printA);
        thread.start();

        printB();
    }

    static void printA() {
        for (int i = 0; i < 100; i++) System.out.print('A');
    }

    static void printB() {
        for (int i = 0; i < 100; i++) System.out.print('B');
    }
}
```

The output of such a program is not deterministic. It is usually interleaved sequences of letters, for example:

```text
BBBAAAAAAAAAAAAABAAAAAAAAAAAAAAABBBBABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAAAAAAAAAAAAAAAAAA...
```

Other ways of creating threads:

```java
Thread t1 = new Thread(() -> System.out.println("lambda"), "worker-1");   // with a name

Thread t2 = new Thread() {                    // a Thread subclass (outdated style)
    @Override public void run() { System.out.println("subclass"); }
};

Thread t3 = Thread.ofPlatform()               // Java 21: a builder
        .name("worker-", 0)                   // worker-0, worker-1, ...
        .daemon(true)
        .start(() -> System.out.println("builder"));
```

> [!CAUTION]
> `thread.run()` does **not** create a new thread: it is just a method call in the current thread. Only `start()` starts a new thread. Calling `start()` again on the same object throws `IllegalThreadStateException`.

## Waiting and Sleeping

The `join()` method waits until another thread finishes:

```java
Thread thread = new Thread(Main::printA);
thread.start();

printB();
thread.join();                    // InterruptedException — checked

System.out.println("\nThe thread has finished.");
```

`Thread.sleep()` suspends the **current** thread for a given time:

```java
Thread.sleep(10);                               // milliseconds
Thread.sleep(Duration.ofMillis(10));            // Java 19
thread.join(Duration.ofSeconds(2));             // wait at most 2 s; returns whether it finished
```

> [!NOTE]
> `sleep` and `join` are **blocking** operations: the OS suspends the thread, and it does not occupy the CPU until the event it is waiting for occurs. Other typical blocking operations are waiting on synchronization primitives (`lock.lock()`, `queue.take()`) and I/O (`Files.readString`, reading from a socket).

### Thread States

```text
NEW ──start()──► RUNNABLE ◄────────────────────────► BLOCKED (waiting for a synchronized monitor)
                    │  ▲
          sleep/join│  │ time elapsed / event / notify
          wait/park ▼  │
           WAITING / TIMED_WAITING
                    │
                    ▼
               TERMINATED
```

The state is returned by `thread.getState()`, and a dump of all threads with their stacks can be obtained with `jcmd <pid> Thread.print`.

## Ordinary and Daemon Threads

* **Ordinary** threads (the default) keep the process alive: the JVM does not exit while at least one such thread is running.
* **Daemon** threads do not keep the process alive: the JVM exits when all ordinary threads finish, and daemon threads still running are **cut off** without a chance to finish their work (`finally` blocks do not run). They suit background work that is fine to interrupt: cache maintenance, monitoring.

```java
Thread worker = new Thread(() -> {
    System.out.println("The background thread started");
    new Scanner(System.in).nextLine();
    System.out.println("The background thread finished");      // will not run
}, "BackgroundWorker");
worker.setDaemon(true);                                   // before start()!
worker.start();

System.out.println("The main thread finished.");          // the JVM exits without waiting for worker
```

## Thread Safety and Synchronization

Threads of one process share resources (static fields, objects on the heap), so access to them must be synchronized to avoid **data races** (race conditions).

The `unsafePrintOnce` method should print `Done` only once, but when run in parallel it may print it twice: both threads may check `done` before either of them sets it to `true`.

```java
public class RaceDemo {
    private static boolean done = false;

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(RaceDemo::unsafePrintOnce);
        thread.start();
        unsafePrintOnce();
        thread.join();
    }

    static void unsafePrintOnce() {
        if (done) return;          // both threads may see false...
        done = true;               // ...and both print
        System.out.println("Done");
    }
}
```

### synchronized

The simplest synchronization tool in Java is the **`synchronized`** block. It guarantees that the marked region of code (a **critical section**) is executed by only one thread at a time; the others wait until it becomes free. Every Java object has a built-in **monitor**, and `synchronized (obj)` acquires the monitor of exactly that object.

```java
public class SafeDemo {
    private static boolean done = false;
    private static final Object LOCK = new Object();      // a separate private lock object

    static void safePrintOnce() {
        synchronized (LOCK) {                              // the critical section
            if (done) return;
            done = true;
        }
        System.out.println("Done");
    }
}
```

Instead of a separate block, a whole method can be marked: `synchronized void m()` locks `this`, and `static synchronized void m()` locks the `SafeDemo.class` object. More about locking, visibility of changes between threads and `ReentrantLock` is in the "Synchronization" chapter.

## Exceptions in Threads

An uncaught exception in a thread **terminates only that thread**: the JVM prints the stack trace to `System.err`, and the rest of the program keeps running. The thread that called `join()` does not learn about the error.

```java
Thread thread = new Thread(() -> {
    throw new IllegalStateException("Uncaught exception");
});
thread.start();

System.out.println("The main thread is waiting...");
thread.join();
System.out.println("The main thread finished.");     // will run!
// Exception in thread "Thread-0" java.lang.IllegalStateException: Uncaught exception
```

An error silently "disappearing" is dangerous behavior. Uncaught exceptions can be intercepted with a handler:

```java
thread.setUncaughtExceptionHandler((t, e) ->
        System.err.println("Thread " + t.getName() + " failed: " + e));
Thread.setDefaultUncaughtExceptionHandler((t, e) -> log.error("Uncaught exception in " + t, e));
```

Tasks in thread pools (the next page) return exceptions through a `Future`, which is much more convenient.

## Interruption

A thread cannot be forcibly stopped in Java (the `Thread.stop()` method was removed: it could leave data in an inconsistent state). Instead there is **cooperative interruption**: `thread.interrupt()` sets a flag on the thread, and the thread itself checks it and finishes its work properly. Blocking methods (`sleep`, `join`, `wait`, `BlockingQueue.take`) react to interruption immediately by throwing `InterruptedException`.

```java
Thread worker = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            doSomeWork();
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();   // the exception clears the flag — restore it
            break;
        }
    }
    System.out.println("A clean shutdown");
});
worker.start();
Thread.sleep(2000);
worker.interrupt();                                // ask it to stop
worker.join();
```

> [!IMPORTANT]
> Never ignore an `InterruptedException` with an empty `catch`. Either propagate the exception (`throws InterruptedException`), or restore the flag with `Thread.currentThread().interrupt()`, so that the code higher up the stack learns about the stop request.

## Thread Pools

Creating and destroying a platform thread for every short task is expensive. A **thread pool** keeps a set of threads and hands them tasks from a queue: threads are reused. In Java pools are represented by the `ExecutorService` interface:

```java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    pool.submit(() -> {
        System.out.println(Thread.currentThread().getName());   // pool-1-thread-1
        System.out.println("Hello from the thread pool");
    });
}   // close(): waits for the tasks to finish (Java 19)
```

The JVM's shared pool is `ForkJoinPool.commonPool()`: it has as many threads as there are cores minus one. It is used by parallel Stream API streams and by `CompletableFuture` by default.

> [!NOTE]
> Although threads are the foundation of concurrency, modern Java code rarely creates them directly. Higher-level abstractions are preferred: `ExecutorService` and `Future`, `CompletableFuture`, parallel streams and virtual threads, covered on the following pages.
