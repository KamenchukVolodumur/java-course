---
title: Asynchronous Sequences
description: Sequences whose elements arrive with waiting, blocking iterators on virtual threads, a producer–consumer queue, the Flow API — Publisher, Subscriber, Subscription and backpressure, SubmissionPublisher, a custom publisher, cancellation, operators of reactive libraries.
---

## The Problem

An ordinary `Iterator` returns elements **immediately**. But sometimes you have to wait for **each** element: lines arriving over the network, messages from a queue, the results of paginated API requests, events from a sensor. Such sequences are called **asynchronous**.

> [!NOTE]
> If you only have to wait for the whole collection rather than for each element separately, a `CompletableFuture<List<T>>` is enough. An asynchronous sequence is needed when the elements should be processed **as they arrive**.

Java has two approaches:

* **a blocking iterator on a virtual thread** — `next()` simply waits for the element, and thanks to virtual threads this is cheap;
* **reactive streams** — the publisher "pushes" elements to the subscriber, and the subscriber controls the pace through **backpressure**. The standard interfaces are `java.util.concurrent.Flow` (Java 9).

## A Blocking Sequence

The counterpart of an asynchronous generator `range(from, to, delay)` that produces numbers with a delay. On virtual threads, waiting in `next()` does not occupy an OS thread:

```java
static Iterable<Integer> rangeWithDelay(int from, int to, Duration delay) {
    return () -> new Iterator<>() {
        private int current = from;

        @Override
        public boolean hasNext() {
            return current < to;
        }

        @Override
        public Integer next() {
            if (!hasNext()) throw new NoSuchElementException();
            try {
                Thread.sleep(delay);                  // "waiting" for the next element
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new CancellationException("interrupted");
            }
            return current++;
        }
    };
}

Thread.ofVirtual().start(() -> {
    for (int i : rangeWithDelay(0, 100, Duration.ofMillis(50))) {
        System.out.println(i);
    }
}).join();
```

Cancellation works through interruption of the iterating thread: `Thread.sleep` (like any blocking wait) throws `InterruptedException`.

### Producer and Consumer

When the elements are produced by another thread (e.g. a network listener), the sequence is built on a **blocking queue**. The queue's bounded capacity is the simplest backpressure: a fast producer blocks on `put` until the consumer catches up.

```java
BlockingQueue<Optional<String>> queue = new ArrayBlockingQueue<>(16);   // Optional.empty() — the end

Thread producer = Thread.ofVirtual().start(() -> {
    try {
        for (String line : fetchLinesFromNetwork()) {
            queue.put(Optional.of(line));           // blocks if the queue is full
        }
        queue.put(Optional.empty());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});

Stream.generate(() -> {
            try {
                return queue.take();                // blocks if the queue is empty
            } catch (InterruptedException e) {
                throw new CancellationException();
            }
        })
        .takeWhile(Optional::isPresent)
        .map(Optional::get)
        .filter(line -> !line.isBlank())
        .forEach(System.out::println);
```

The full power of the Stream API (`filter`, `map`, `takeWhile`, `limit`) is available, because from the consumer's point of view this is an ordinary, if slow, sequence.

## The Flow API

The `java.util.concurrent.Flow` class defines the four interfaces of the **Reactive Streams** specification, shared by all reactive libraries:

```java
public final class Flow {
    public interface Publisher<T> {
        void subscribe(Subscriber<? super T> subscriber);
    }

    public interface Subscriber<T> {
        void onSubscribe(Subscription subscription);   // first — once
        void onNext(T item);                           // 0..n times
        void onError(Throwable throwable);             // the end with an error
        void onComplete();                             // or a successful end
    }

    public interface Subscription {
        void request(long n);                          // "ready to accept n more elements"
        void cancel();                                 // unsubscribe
    }

    public interface Processor<T, R> extends Subscriber<T>, Publisher<R> { }
}
```

The protocol:

1. The subscriber calls `publisher.subscribe(subscriber)`, and the publisher responds with `onSubscribe(subscription)`.
2. The subscriber requests elements: `subscription.request(n)`. **The publisher is not allowed to send more than requested**. This is backpressure: a slow consumer will not be "flooded".
3. The publisher calls `onNext` for each element, and at the end exactly once `onComplete` or `onError`.
4. The subscriber can call `subscription.cancel()` at any time.

> [!IMPORTANT]
> The calls of `onNext`, `onError` and `onComplete` for one subscriber happen **sequentially**, never concurrently. That is why no synchronization of the subscriber's own state is needed inside it.

### SubmissionPublisher

A ready-made publisher implementation is `SubmissionPublisher<T>`: the `submit(item)` method sends an element to all subscribers, each into its own buffer, and delivery happens in a thread pool (the shared one by default). If a subscriber's buffer is full, `submit` **blocks**.

```java
class PrintingSubscriber implements Flow.Subscriber<Integer> {
    private Flow.Subscription subscription;

    @Override public void onSubscribe(Flow.Subscription subscription) {
        this.subscription = subscription;
        subscription.request(1);                       // one element at a time
    }

    @Override public void onNext(Integer item) {
        System.out.println("Received: " + item);
        subscription.request(1);                       // ready for the next one
    }

    @Override public void onError(Throwable throwable) {
        System.err.println("Error: " + throwable);
    }

    @Override public void onComplete() {
        System.out.println("Done");
    }
}

try (SubmissionPublisher<Integer> publisher = new SubmissionPublisher<>()) {
    publisher.subscribe(new PrintingSubscriber());
    for (int i = 0; i < 10; i++) {
        Thread.sleep(50);
        publisher.submit(i);
    }
}   // close() -> onComplete for the subscribers
Thread.sleep(200);                                     // let the delivery finish (demo)
```

For simple cases, instead of a custom subscriber there is `publisher.consume(item -> ...)`: it returns a `CompletableFuture<Void>` that completes together with the stream.

```java
CompletableFuture<Void> done = publisher.consume(i -> System.out.println("Received: " + i));
// ... submit ..., close()
done.join();
```

### A Custom Publisher

A publisher that produces numbers with a delay and respects `request(n)` and `cancel()`:

```java
class RangePublisher implements Flow.Publisher<Integer> {
    private final int from, to;
    private final Duration delay;

    RangePublisher(int from, int to, Duration delay) {
        this.from = from;
        this.to = to;
        this.delay = delay;
    }

    @Override
    public void subscribe(Flow.Subscriber<? super Integer> subscriber) {
        AtomicLong requested = new AtomicLong();
        AtomicBoolean cancelled = new AtomicBoolean();
        Object signal = new Object();

        subscriber.onSubscribe(new Flow.Subscription() {
            @Override public void request(long n) {
                if (n <= 0) {
                    cancelled.set(true);
                    subscriber.onError(new IllegalArgumentException("n must be > 0"));
                    return;
                }
                requested.accumulateAndGet(n, (a, b) -> a + b < 0 ? Long.MAX_VALUE : a + b);
                synchronized (signal) { signal.notifyAll(); }
            }

            @Override public void cancel() {
                cancelled.set(true);
                synchronized (signal) { signal.notifyAll(); }
            }
        });

        Thread.ofVirtual().start(() -> {
            try {
                for (int i = from; i < to && !cancelled.get(); i++) {
                    synchronized (signal) {
                        while (requested.get() == 0 && !cancelled.get()) signal.wait();   // backpressure
                    }
                    if (cancelled.get()) return;
                    Thread.sleep(delay);
                    requested.decrementAndGet();
                    subscriber.onNext(i);
                }
                if (!cancelled.get()) subscriber.onComplete();
            } catch (InterruptedException e) {
                subscriber.onError(e);
            }
        });
    }
}
```

> [!NOTE]
> Implementing a `Publisher` correctly is hard: the Reactive Streams specification has more than 40 rules (signal ordering, counter overflow, repeated subscriptions). In practice publishers are taken from libraries, and only subscribers are written by hand.

### Cancellation

A subscriber unsubscribes with `subscription.cancel()`, e.g. after a certain number of elements or on a timeout:

```java
class FirstN implements Flow.Subscriber<Integer> {
    private final int limit;
    private int received;
    private Flow.Subscription subscription;

    FirstN(int limit) { this.limit = limit; }

    @Override public void onSubscribe(Flow.Subscription s) {
        subscription = s;
        s.request(limit);
    }

    @Override public void onNext(Integer item) {
        System.out.println(item);
        if (++received == limit) {
            subscription.cancel();
            System.out.println("Cancelled after " + limit + " elements");
        }
    }

    @Override public void onError(Throwable t) { t.printStackTrace(); }
    @Override public void onComplete() { System.out.println("Done"); }
}

new RangePublisher(0, 100, Duration.ofMillis(50)).subscribe(new FirstN(5));
```

## Operators: Reactive Libraries

`Flow` defines only the protocol; the JDK has no operators like `filter` or `map`. They are provided by libraries compatible with `Flow` and with each other: **Project Reactor** (the basis of Spring WebFlux), **RxJava**, **Mutiny**. An example with Reactor:

```java
Flux.range(0, 100)
        .delayElements(Duration.ofMillis(50))          // an asynchronous sequence
        .filter(x -> x % 2 == 0)
        .map(x -> x * x)
        .take(Duration.ofMillis(2500))                 // cancellation by time
        .subscribe(
                x -> System.out.println(x),
                error -> System.err.println("Error: " + error),
                () -> System.out.println("Done"));

List<Integer> squares = Flux.range(0, 10)
        .filter(x -> x % 2 == 0)
        .flatMap(x -> Mono.fromCallable(() -> x * x).delayElement(Duration.ofMillis(10)))   // an asynchronous transformation
        .collectList()
        .block();                                      // 0, 4, 16, 36, 64 (flatMap order is not guaranteed)
```

Converting between the worlds: `JdkFlowAdapter.flowPublisherToFlux(publisher)` and `JdkFlowAdapter.publisherToFlowPublisher(flux)` in Reactor, `FlowAdapters` in the `reactive-streams` library.

> [!TIP]
> Reactive libraries are powerful but hard to debug: the call stack does not show the program's logic. If backpressure and complex operators are not needed, ordinary blocking code with queues on virtual threads is simpler.
