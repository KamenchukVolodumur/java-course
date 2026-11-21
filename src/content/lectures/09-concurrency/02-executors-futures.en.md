---
title: Executors and Future
description: ExecutorService as an abstraction for running tasks, kinds of pools, Runnable and Callable, Future and getting the result, exceptions in tasks, invokeAll and invokeAny, cancellation, shutting a pool down properly, long-running tasks and dedicated pools, scheduled tasks.
---

## Tasks and Executors

Instead of working with threads directly, Java uses **tasks** and **executors**. A task is a unit of work, and an executor decides **where and when** to run it: in a new thread, in a thread pool, in a virtual thread or even synchronously. The code submitting the tasks does not depend on this.

The main interface is `java.util.concurrent.ExecutorService`. A task is described by:

* `Runnable` — a task **without** a result (`void run()`);
* `Callable<V>` — a task that **returns** a value of type `V` and may throw checked exceptions (`V call() throws Exception`).

Submitting a task returns a **`Future<V>`** — an object representing a result that will be ready **in the future**.

```java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    Future<?> done = pool.submit(() -> System.out.println("a task without a result"));
    Future<Integer> answer = pool.submit(() -> 6 * 7);       // Callable<Integer>

    System.out.println("Done? " + answer.isDone());
    System.out.println("Result: " + answer.get());           // blocks until ready: 42
}
```

> [!WARNING]
> Pool threads keep running until the pool is closed. If you forget to close an `ExecutorService` (created, for example, with `newFixedThreadPool`), the program **will not exit**: its threads are ordinary, not daemon threads. Use try-with-resources (Java 19+) or `shutdown()`.

## Kinds of Executors

The factories of the `Executors` class:

| Factory | Behavior |
| --- | --- |
| `newFixedThreadPool(n)` | n threads, an unbounded task queue |
| `newCachedThreadPool()` | creates threads as needed and removes those idle for 60 s; good for many short tasks |
| `newSingleThreadExecutor()` | one thread: tasks run **sequentially** in submission order |
| `newScheduledThreadPool(n)` | delayed or periodic tasks |
| `newWorkStealingPool()` | a `ForkJoinPool`: threads "steal" tasks from each other |
| `newVirtualThreadPerTaskExecutor()` | a new **virtual** thread per task (Java 21) |

For full control (queue size, overflow policy, a thread factory with names), a `ThreadPoolExecutor` is created directly:

```java
ExecutorService pool = new ThreadPoolExecutor(
        2, 8,                                         // core and maximum number of threads
        30, TimeUnit.SECONDS,                         // keep-alive time of extra threads
        new ArrayBlockingQueue<>(100),                // a bounded queue
        Thread.ofPlatform().name("worker-", 0).factory(),
        new ThreadPoolExecutor.CallerRunsPolicy());   // queue full -> run in the submitting thread
```

## Getting the Result

```java
public static void main(String[] args) throws Exception {
    try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
        Future<Long> task1 = pool.submit(() -> countPrimes(1_000_000, 1_000_000));
        Future<Long> task2 = pool.submit(() -> countPrimes(2_000_000, 1_000_000));
        System.out.println("Started two prime-counting tasks");
        System.out.println("Primes in [1,000,000, 2,000,000): " + task1.get());
        System.out.println("Primes in [2,000,000, 3,000,000): " + task2.get());
    }
}

static long countPrimes(int from, int count) {
    return IntStream.range(from, from + count).filter(n -> {
        if (n <= 1) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
        int boundary = (int) Math.sqrt(n);
        for (int i = 3; i <= boundary; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }).count();
}
```

| `Future` method | Purpose |
| --- | --- |
| `get()` | wait for the result (blocks the thread) |
| `get(timeout, unit)` | wait no longer than that; otherwise `TimeoutException` |
| `isDone()` | whether the task has finished (successfully, with an error or cancelled) |
| `cancel(mayInterrupt)` | cancel the task |
| `isCancelled()` | whether it was cancelled |
| `resultNow()`, `exceptionNow()`, `state()` | Java 19: the result/exception of an already finished task without checked exceptions |

## Exceptions in Tasks

Unlike a "bare" thread, an exception in a task is not lost and does not terminate any pool thread: it is **stored in the `Future`** and thrown on `get()`, wrapped in an **`ExecutionException`**. The real cause is in `getCause()`.

```java
try (ExecutorService pool = Executors.newSingleThreadExecutor()) {
    Future<?> task = pool.submit(() -> {
        throw new IllegalStateException("Uncaught exception");
    });

    try {
        task.get();
    } catch (ExecutionException e) {
        System.out.println("Handled: " + e.getCause().getMessage());
    }
}
```

> [!WARNING]
> If nobody reads a task's result, its exception **vanishes without a trace**: no stack trace in the console, no crash. Tasks whose result is not needed are submitted with `execute(runnable)`: then an uncaught exception goes to the thread's handler and is printed.

## Several Tasks: invokeAll and invokeAny

```java
List<Callable<String>> downloads = urls.stream()
        .<Callable<String>>map(url -> () -> download(url))
        .toList();

try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
    List<Future<String>> all = pool.invokeAll(downloads);          // waits until all finish
    for (Future<String> f : all) {
        System.out.println(f.get().length());
    }

    String fastest = pool.invokeAny(downloads);                     // the result of the first successful one; the rest are cancelled
}
```

## Cancellation

`future.cancel(true)` cancels a task: if it has not started yet, it will not run at all; if it is already running, its thread is **interrupted** (`interrupt`). As with threads, cancellation is cooperative: the task must react to interruption (check `Thread.currentThread().isInterrupted()` or use blocking methods that throw `InterruptedException`).

```java
Future<?> task = pool.submit(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        processNextChunk();
    }
});
Thread.sleep(1000);
task.cancel(true);                              // interrupt it
System.out.println(task.isCancelled());         // true; task.get() will throw CancellationException
```

## Shutting a Pool Down

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
try {
    // submitting tasks...
} finally {
    pool.shutdown();                            // accept no new tasks, finish the submitted ones
    if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
        pool.shutdownNow();                     // interrupt all threads + a list of unexecuted tasks
    }
}
```

Since Java 19 `ExecutorService` implements `AutoCloseable`: `close()` calls `shutdown()` and waits for all tasks to finish. So in short programs try-with-resources is enough.

## Long-Running Tasks

A pool with a fixed number of threads is designed for **short** tasks. If a task occupies a thread for a long time (minutes of computation, an endless queue-processing loop, blocking waits), it "eats" a pool thread, and the remaining tasks wait in the queue. Blocking the **shared** `ForkJoinPool.commonPool()`, on which the parallel streams and `CompletableFuture`s of the whole program run, is especially dangerous.

A long-running task is given a **separate** thread or a separate pool:

```java
Thread longRunner = Thread.ofPlatform().name("prime-counter").start(() ->
        System.out.println(countPrimes(2, 100_000_000)));

ExecutorService ioPool = Executors.newFixedThreadPool(16);   // a separate pool for blocking I/O
```

Tasks that mostly **wait** (network, databases, files) are best served by **virtual threads**: you can have millions of them (the "Virtual Threads" page).

## Scheduled Tasks

A `ScheduledExecutorService` runs tasks after a delay or periodically:

```java
try (ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1)) {
    scheduler.schedule(() -> System.out.println("after 2 seconds"), 2, TimeUnit.SECONDS);

    ScheduledFuture<?> heartbeat = scheduler.scheduleAtFixedRate(
            () -> System.out.println("tick " + LocalTime.now()),
            0, 1, TimeUnit.SECONDS);                       // every second from the start of the previous run

    scheduler.scheduleWithFixedDelay(this::cleanup, 5, 5, TimeUnit.MINUTES);   // 5 min after the previous run ends

    Thread.sleep(5_000);
    heartbeat.cancel(false);
}
```

> [!WARNING]
> If a periodic task throws an exception, its **subsequent runs silently stop**. Wrap the body of periodic tasks in a `try/catch` with logging.
