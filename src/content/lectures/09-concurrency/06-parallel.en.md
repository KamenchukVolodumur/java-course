---
title: Parallel Computing
description: Parallel counterparts of "run several actions", the for and foreach loops, early exit from a parallel loop, limiting the degree of parallelism and cancellation, Fork/Join and RecursiveTask, when parallelism pays off, parallel I/O.
---

## Overview

For computations (CPU-bound) that can be split into independent parts, Java has several tools that hide thread management:

* **parallel Stream API streams** (`parallel()`, `parallelStream()`) — parallel counterparts of the `for` and `foreach` loops;
* **`ExecutorService.invokeAll`** — parallel execution of several different actions;
* **Fork/Join** (`ForkJoinPool`, `RecursiveTask`) — recursive "divide and conquer" splitting of a task.

Common to all of them:

1. The work is split into parts and run in a thread pool: parallel streams use the shared `ForkJoinPool.commonPool()`.
2. The call **blocks** the thread until all the work is done.
3. If one of the parts throws an exception, it is passed to the calling thread (the other parts may keep running for a while).

> [!WARNING]
> Parallel code that modifies shared state (a field, a list, a map) needs synchronization. It is best not to modify shared state at all, but to collect the result with a **reduction** (`sum`, `count`, `collect`): then the library takes care of synchronization.

## Several Actions

```java
public static void main(String[] args) throws InterruptedException {
    List<Callable<Void>> actions = List.of(
            () -> downloadFile("https://example.com/a.jpg", "a.jpg"),
            () -> downloadFile("https://example.com/b.jpg", "b.jpg"),
            () -> downloadFile("https://example.com/c.jpg", "c.jpg"));

    try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
        pool.invokeAll(actions);                  // blocks until all are finished
    }
}

static Void downloadFile(String url, String outputPath) {
    try (HttpClient client = HttpClient.newHttpClient()) {           // AutoCloseable since Java 21
        HttpRequest request = HttpRequest.newBuilder(URI.create(url)).build();
        HttpResponse<Path> response = client.send(request, HttpResponse.BodyHandlers.ofFile(Path.of(outputPath)));
        if (response.statusCode() != 200) throw new IOException("HTTP " + response.statusCode());
        System.out.println(outputPath + " downloaded");
    } catch (IOException | InterruptedException e) {
        System.out.println("Error downloading " + url + ": " + e.getMessage());
    }
    return null;
}
```

For computational actions on the shared pool, `CompletableFuture` is convenient:

```java
CompletableFuture.allOf(
        CompletableFuture.runAsync(() -> sortPart(data, 0, mid)),
        CompletableFuture.runAsync(() -> sortPart(data, mid, data.length))
).join();
```

## A Parallel for Loop

The counterpart of a `for` loop over an index range is `IntStream.range(...).parallel()`:

```java
int from = 1_000_000, to = 1_000_100;
IntStream.range(from, to).parallel().forEach(i ->
        System.out.println("Is " + i + " prime: " + isPrime(i)));
```

> [!NOTE]
> The iterations do not run in order, so the lines are printed in a nondeterministic order. If the order matters, `forEachOrdered` is used, but then part of the parallelism is lost.

It is better to compute not with side effects but with a reduction:

```java
long primes = IntStream.range(0, 10_000_000).parallel().filter(Main::isPrime).count();

Map<Boolean, Long> byParity = IntStream.range(0, 10_000_000).parallel().boxed()
        .filter(Main::isPrime)
        .collect(Collectors.partitioningBy(n -> n % 4 == 1, Collectors.counting()));
```

### Early Exit

The counterpart of `break` in a parallel loop is short-circuiting operations:

* `findFirst()` — finds the element with the **smallest index** that satisfies the condition. Work on larger indexes stops, but all smaller ones must be checked;
* `findAny()` — any element; the parallel stream stops as soon as at least one thread finds an answer (faster);
* `anyMatch`, `allMatch`, `noneMatch` — stop as soon as the answer is known.

```java
int from = 1_000_000, to = 1_000_100;
OptionalInt firstPrime = IntStream.range(from, to).parallel().filter(Main::isPrime).findFirst();

firstPrime.ifPresentOrElse(
        p -> System.out.println("There is a prime: " + p),        // 1000003, as in a sequential loop
        () -> System.out.println("There are no primes"));
```

`takeWhile` also works correctly in a parallel ordered stream, but it is expensive: it has to buffer elements to preserve the order.

## A Parallel foreach

For collections — `parallelStream()`:

```java
record Download(String url, String output) { }

List<Download> downloads = List.of(
        new Download("https://example.com/1.jpg", "1.jpg"),
        new Download("https://example.com/2.jpg", "2.jpg"),
        new Download("https://example.com/3.jpg", "3.jpg"));

downloads.parallelStream().forEach(d -> processImage(d.output()));
```

Efficiency depends on how well the source **splits** into parts (its `Spliterator`):

| Split well | Split poorly |
| --- | --- |
| arrays, `ArrayList`, `IntStream.range` | `LinkedList`, `Stream.iterate`, `BufferedReader.lines()` |
| `HashSet`, `HashMap.keySet()` | `Stream.generate().limit(n)` |

## Degree of Parallelism and Cancellation

Parallel streams use the shared pool with `number of cores − 1` threads (plus the calling thread). This can be changed:

* globally: `-Djava.util.concurrent.ForkJoinPool.common.parallelism=4`;
* for one computation: run the terminal operation **inside your own** `ForkJoinPool`. A parallel stream uses the pool it was started from:

```java
try (ForkJoinPool pool = new ForkJoinPool(4)) {                 // at most 4 threads
    long primes = pool.submit(() ->
            IntStream.range(0, 10_000_000).parallel().filter(Main::isPrime).count()
    ).get();
    System.out.println("Primes: " + primes);
}
```

> [!NOTE]
> That a parallel stream runs in the pool it was started from is implementation behavior, not a documented contract, but a lot of code relies on it, and it is stable.

Cancellation of parallel streams is not provided. Cooperatively it is implemented with a flag that the elements check:

```java
AtomicBoolean cancelled = new AtomicBoolean();
CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS).execute(() -> cancelled.set(true));

LongAdder primes = new LongAdder();                              // a thread-safe counter
IntStream.range(0, 100_000_000).parallel().unordered()     // order does not matter — a cheaper takeWhile
        .takeWhile(i -> !cancelled.get())                         // new elements are not processed
        .filter(Main::isPrime)
        .forEach(i -> primes.increment());

System.out.println(cancelled.get()
        ? "Cancelled, found at least " + primes.sum()
        : "Found exactly " + primes.sum());
```

`LongAdder` (or `AtomicLong`) is a thread-safe counterpart of `count++`. An ordinary `int` field would give a wrong result here (the "Synchronization" chapter).

## Fork/Join

Parallel streams are built on **Fork/Join**: a task is recursively split in half until the parts are small enough to compute sequentially. Each `ForkJoinPool` thread has its own task queue, and a thread that becomes free **"steals"** tasks from the tail of another thread's queue (work stealing). This balances the load without a central queue.

```java
class SumTask extends RecursiveTask<Long> {
    private static final int THRESHOLD = 10_000;
    private final long[] data;
    private final int from, to;

    SumTask(long[] data, int from, int to) {
        this.data = data;
        this.from = from;
        this.to = to;
    }

    @Override
    protected Long compute() {
        if (to - from <= THRESHOLD) {                     // a small part — compute sequentially
            long sum = 0;
            for (int i = from; i < to; i++) sum += data[i];
            return sum;
        }
        int mid = (from + to) >>> 1;
        SumTask left = new SumTask(data, from, mid);
        SumTask right = new SumTask(data, mid, to);
        left.fork();                                      // the left one — into the queue (another thread may "steal" it)
        long rightSum = right.compute();                  // the right one — ourselves
        return left.join() + rightSum;
    }
}

long[] data = LongStream.rangeClosed(1, 50_000_000).toArray();
long sum = ForkJoinPool.commonPool().invoke(new SumTask(data, 0, data.length));
System.out.println(sum);                                  // 1250000025000000
```

`RecursiveAction` is the same without a result (e.g. a parallel merge sort). `Arrays.parallelSort` and `Arrays.parallelPrefix` are implemented this way.

## When Parallelism Pays Off

Splitting, scheduling and merging the results have a cost. A parallel stream is **slower** than a sequential one if:

* there are few elements or the work per element is cheap. A rule of thumb: `N × Q > 10,000`, where N is the number of elements and Q is the cost of processing one element in "simple operations";
* the source splits poorly (the table above);
* the operations depend on order: `limit`, `skip`, `findFirst`, `forEachOrdered`, `sorted` on an ordered stream. If the order is not needed, `unordered()` removes this restriction;
* `collect` merges many intermediate collections. For maps, `Collectors.toConcurrentMap` and `groupingByConcurrent` are better.

> [!IMPORTANT]
> Decisions about parallelism are made based on **measurements** (e.g. with JMH), not intuition. And never perform blocking I/O in parallel streams: it occupies threads of the shared pool on which the whole program depends.

## Parallel I/O

For operations that mostly wait (downloading files, requests to services), parallel streams are not suitable: there are as many of their threads as cores, and they occupy the shared pool. Instead, virtual threads are used, and, if needed, the number of simultaneous operations is limited:

```java
try (HttpClient client = HttpClient.newHttpClient();
     ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Semaphore limit = new Semaphore(4);                  // at most 4 downloads at once
    for (Download d : downloads) {
        executor.submit(() -> {
            limit.acquire();
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(d.url())).build();
                client.send(request, HttpResponse.BodyHandlers.ofFile(Path.of(d.output())));
                System.out.println(d.output() + " downloaded");
            } finally {
                limit.release();
            }
            return null;
        });
    }
}
```

Since Java 24 the same can be expressed in the Stream API with the `mapConcurrent` **gatherer**: it runs the function in virtual threads, at most the given number at once, and preserves the order of the results:

```java
List<Path> files = downloads.stream()
        .gather(Gatherers.mapConcurrent(4, d -> download(client, d)))   // up to 4 parallel downloads
        .toList();
```
