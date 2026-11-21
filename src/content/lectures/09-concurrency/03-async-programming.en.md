---
title: Asynchronous Programming
description: Blocking and asynchronous code, CompletableFuture as a promise of a result, continuations and how they run, manual completion and wrapping callback APIs, composing stages, parallel execution, allOf and anyOf, processing in completion order, exceptions, timeouts, cancellation.
---

## Blocking and Asynchronous Code

**Asynchronous programming** makes it possible to run long operations without blocking the thread that started them. The responsiveness of a user interface (the UI thread does not "freeze") and the scalability of servers (a thread does not sit idle waiting for the network or a database) depend on it.

The synchronous variant: the `getPrimesCount` method blocks the calling thread for one second. If this were the UI thread, the program would stop responding for that time.

```java
void printPrimesCount() throws InterruptedException {
    int primes = getPrimesCount();
    System.out.println("Primes: " + primes);
}

int getPrimesCount() throws InterruptedException {
    Thread.sleep(1000);
    return 42;
}
```

The asynchronous variant returns **immediately**, and not with the result but with a **promise** of the result: a `CompletableFuture<Integer>`. What to do with the result is described with a **continuation** — a function that will be called when the result appears:

```java
void printPrimesCountAsync() {
    CompletableFuture<Integer> primesFuture = getPrimesCountAsync();
    primesFuture.thenAccept(primes -> System.out.println("Primes: " + primes));
    System.out.println("This line is printed first: the thread did not wait");
}

CompletableFuture<Integer> getPrimesCountAsync() {
    Executor afterOneSecond = CompletableFuture.delayedExecutor(1, TimeUnit.SECONDS);
    return CompletableFuture.supplyAsync(() -> 42, afterOneSecond);
}
```

During this second **no thread is blocked**: `delayedExecutor` merely schedules the task on a timer. This is what distinguishes an asynchronous operation from a synchronous one started in another thread.

> [!NOTE]
> Java has two approaches to non-blocking code. The first is **asynchronous chains** of `CompletableFuture`, described on this page: the code is split into stages and continuations. The second is **virtual threads** (the "Virtual Threads" page): code is written in the ordinary blocking style, and the JVM itself frees the OS thread while the virtual thread waits. For new server code the second approach is usually simpler, but `CompletableFuture` remains the foundation of many APIs (`HttpClient.sendAsync`, asynchronous drivers, frameworks).

## CompletableFuture

`CompletableFuture<T>` implements two interfaces:

* `Future<T>` — a result that can be obtained (`get`, `join`, `isDone`);
* `CompletionStage<T>` — a computation stage to which further stages can be attached.

Creation:

```java
CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> compute());          // ForkJoinPool.commonPool()
CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> compute(), executor); // on your own executor
CompletableFuture<Void>    c = CompletableFuture.runAsync(() -> log("tick"));            // no result
CompletableFuture<String>  d = CompletableFuture.completedFuture("done");               // already completed
CompletableFuture<String>  e = CompletableFuture.failedFuture(new IOException("failure")); // already failed
```

The result can be obtained in a blocking way: `get()` throws the checked exceptions `InterruptedException` and `ExecutionException`, while `join()` throws an unchecked `CompletionException`. That is why `join()` is more convenient in lambdas. But the essence of the asynchronous style is precisely **not to block** and to attach continuations instead.

### How Continuations Run

`thenApply(fn)` does not wait for anything: it **registers** the function and immediately returns a new `CompletableFuture` that will complete with its result. When the previous stage completes, the registered continuations are called:

* if the stage is not completed yet, the continuation is run by **the thread that completes it** (e.g. the pool thread that has just computed the value);
* if the stage is **already** completed at the moment of registration, the continuation runs **immediately, in the thread that called** `thenApply`;
* the `thenApplyAsync(fn)` variant always submits the continuation to an executor (the shared pool by default), and `thenApplyAsync(fn, executor)` to the given executor (the "Execution Context" page).

```java
CompletableFuture
        .supplyAsync(() -> {
            System.out.println("supply: " + Thread.currentThread().getName());
            return 21;
        })
        .thenApply(x -> {
            System.out.println("apply:  " + Thread.currentThread().getName());
            return x * 2;
        })
        .thenAccept(x -> System.out.println("accept: " + Thread.currentThread().getName() + " -> " + x))
        .join();
// supply: ForkJoinPool.commonPool-worker-1
// apply:  ForkJoinPool.commonPool-worker-1    (or main, if supply managed to finish earlier)
// accept: ForkJoinPool.commonPool-worker-1 -> 42
```

### Manual Completion

A `CompletableFuture` can be created empty and completed manually from any thread with the `complete(value)` or `completeExceptionally(ex)` methods. This is how old APIs with callback functions are wrapped into `CompletableFuture`:

```java
interface Callback<T> {
    void onSuccess(T value);
    void onError(Throwable error);
}

// the old API: void fetch(String key, Callback<String> callback)

static CompletableFuture<String> fetchAsync(LegacyClient client, String key) {
    CompletableFuture<String> future = new CompletableFuture<>();
    client.fetch(key, new Callback<>() {
        @Override public void onSuccess(String value) { future.complete(value); }
        @Override public void onError(Throwable error) { future.completeExceptionally(error); }
    });
    return future;
}
```

Only the first completion has an effect: repeated `complete` calls return `false` and change nothing.

## Composing Stages

| Method | Input → output | Purpose |
| --- | --- | --- |
| `thenApply(fn)` | `T → U` | transform the result |
| `thenAccept(consumer)` | `T → void` | use the result |
| `thenRun(action)` | `() → void` | run an action after completion |
| `thenCompose(fn)` | `T → CompletionStage<U>` | the next **asynchronous** operation (the counterpart of `flatMap`) |
| `thenCombine(other, fn)` | `(T, U) → V` | combine the results of two independent stages |
| `applyToEither(other, fn)` | `T → U` | take whichever result arrives first |
| `whenComplete(action)` | `(T, Throwable) → void` | a side effect for any outcome |
| `handle(fn)` | `(T, Throwable) → U` | transform both the result and the error |
| `exceptionally(fn)` | `Throwable → T` | a replacement value for an error |

`thenApply` versus `thenCompose`: if the function itself returns a `CompletableFuture`, `thenApply` gives a nested `CompletableFuture<CompletableFuture<U>>`, while `thenCompose` "unwraps" it:

```java
CompletableFuture<User> user = findUserAsync(id);

CompletableFuture<CompletableFuture<List<Order>>> nested = user.thenApply(u -> loadOrdersAsync(u));
CompletableFuture<List<Order>> flat = user.thenCompose(u -> loadOrdersAsync(u));
```

A chain reads top to bottom, like synchronous code:

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com/users/42")).build();

client.sendAsync(request, HttpResponse.BodyHandlers.ofString())     // network without blocking a thread
        .thenApply(HttpResponse::body)
        .thenApply(User::fromJson)
        .thenCompose(u -> loadOrdersAsync(u))
        .thenAccept(orders -> System.out.println("Orders: " + orders.size()))
        .exceptionally(ex -> { System.err.println("Error: " + ex); return null; });
```

## Parallel Execution

Started stages run independently, so asynchrony gives parallelism: both tasks below compute at the same time, and the results are combined when both are ready.

```java
public class Main {
    public static void main(String[] args) {
        CompletableFuture<Long> task1 = countPrimesAsync(0, 1_000_000);
        CompletableFuture<Long> task2 = countPrimesAsync(1_000_000, 2_000_000);

        task1.thenCombine(task2, (p1, p2) -> "Primes: " + p1 + " + " + p2 + " = " + (p1 + p2))
             .thenAccept(System.out::println)
             .join();                                  // in main only so that the JVM does not exit
    }

    static CompletableFuture<Long> countPrimesAsync(int start, int end) {
        return CompletableFuture.supplyAsync(() ->
                IntStream.range(start, end).filter(Main::isPrime).count());
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; (long) i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}
```

## Waiting for Several Tasks

### allOf

`CompletableFuture.allOf(...)` returns a `CompletableFuture<Void>` that completes when **all** the given ones complete. It does not collect the results, so they are taken from the original objects: after `allOf` they are already completed, and `join()` does not block.

```java
List<CompletableFuture<Long>> tasks = List.of(
        countPrimesAsync(0, 1_000_000),
        countPrimesAsync(1_000_000, 2_000_000),
        countPrimesAsync(2_000_000, 3_000_000));

CompletableFuture<List<Long>> all = CompletableFuture
        .allOf(tasks.toArray(CompletableFuture[]::new))
        .thenApply(v -> tasks.stream().map(CompletableFuture::join).toList());   // the order is the same as in tasks

System.out.println(all.join());
```

If any task completes with an error, `allOf` also completes with an error (but only after all of them complete).

### anyOf

`CompletableFuture.anyOf(...)` completes with the result of the **first** completed task. The result type is `Object`, because the tasks may have different types:

```java
CompletableFuture<Object> first = CompletableFuture.anyOf(
        fetchFromMirrorAsync("eu"), fetchFromMirrorAsync("us"));
String data = (String) first.join();
```

The remaining tasks are **not cancelled** and keep running. For two tasks of the same type, the type-safe `a.applyToEither(b, x -> x)` is more convenient.

### In Completion Order

To process the results **as soon as they appear**, it is enough to attach a continuation to each task:

```java
tasks.forEach(t -> t.thenAccept(primes -> System.out.println("Done: " + primes)));
```

For ordinary `Future`s the same is done by `ExecutorCompletionService`: its `take()` method returns tasks in the order they complete.

```java
CompletionService<Long> service = new ExecutorCompletionService<>(pool);
service.submit(() -> countPrimes(0, 3_000_000));
service.submit(() -> countPrimes(3_000_000, 4_000_000));
service.submit(() -> countPrimes(4_000_000, 5_000_000));

for (int i = 0; i < 3; i++) {
    System.out.println("Primes: " + service.take().get());    // the fastest one first
}
```

## Exceptions

An exception in a stage is not thrown immediately: the stage completes **with an error**, and the error propagates down the chain, skipping `thenApply`/`thenAccept`, to the first handler.

```java
CompletableFuture<Integer> result = CompletableFuture
        .supplyAsync(() -> Integer.parseInt("not a number"))     // NumberFormatException
        .thenApply(x -> x * 2)                                    // skipped
        .exceptionally(ex -> {
            System.out.println("Error: " + ex);                    // CompletionException: NumberFormatException
            return -1;
        });
System.out.println(result.join());                               // -1
```

Between stages the exception is wrapped in a **`CompletionException`**; the real cause is in `getCause()`. `join()` throws a `CompletionException`, and `get()` an `ExecutionException`.

```java
CompletableFuture<String> page = downloadAsync(url)
        .handle((body, ex) -> ex == null ? body : "<page unavailable>")       // both the result and the error
        .whenComplete((body, ex) -> log("download finished"));                // a side effect, does not change the result

CompletableFuture<String> withFallback = downloadAsync(primaryUrl)
        .exceptionallyCompose(ex -> downloadAsync(backupUrl));                 // Java 12: an asynchronous replacement
```

> [!WARNING]
> A chain without an error handler and without a `join()` at the end **silently swallows exceptions**. End chains with `exceptionally`/`handle`/`whenComplete` with logging.

## Timeouts

```java
downloadAsync(url)
        .orTimeout(5, TimeUnit.SECONDS)                         // a TimeoutException error after 5 s
        .exceptionally(ex -> "timeout");

downloadAsync(url)
        .completeOnTimeout("default value", 5, TimeUnit.SECONDS);   // replace with a value
```

## Cancellation

`future.cancel(true)` completes a `CompletableFuture` with a `CancellationException`, and all dependent stages also complete with an error. But, unlike a `Future` from an `ExecutorService`, **a computation already running is not interrupted**: a `CompletableFuture` does not know which thread it runs in, and the `mayInterruptIfRunning` parameter is ignored.

That is why long tasks that need to be cancellable receive a **cancellation signal** and check it themselves. The signal can be a simple thread-safe flag:

```java
public class Main {
    public static void main(String[] args) {
        AtomicBoolean cancelled = new AtomicBoolean();
        CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS)
                .execute(() -> cancelled.set(true));          // "cancel after 5 s"

        try {
            List<Integer> primes = getPrimesAsync(2, cancelled).join();
            System.out.println("Number of primes: " + primes.size());
        } catch (CompletionException e) {
            if (e.getCause() instanceof CancellationException) {
                System.out.println("Cancelled");
            } else {
                throw e;
            }
        }
    }

    static CompletableFuture<List<Integer>> getPrimesAsync(int start, AtomicBoolean cancelled) {
        return CompletableFuture.supplyAsync(() -> {
            List<Integer> primes = new ArrayList<>();
            for (int i = start; i < Integer.MAX_VALUE; i++) {
                if (cancelled.get()) throw new CancellationException();
                if (isPrime(i)) primes.add(i);
            }
            return primes;
        });
    }
}
```

Another option is to run the task through an `ExecutorService` and cancel it with `Future.cancel(true)`: then the task's thread is interrupted, which the task checks with `Thread.currentThread().isInterrupted()` (the "Executors and Future" page). Virtual threads and structured concurrency make cancellation even simpler: cancelling a scope interrupts all its subtasks.
