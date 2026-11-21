---
title: Thread-Safe Collections
description: Synchronized wrappers and their limitations, ConcurrentHashMap and atomic compound operations, ConcurrentSkipListMap, CopyOnWriteArrayList, ConcurrentLinkedQueue and Deque, weakly consistent iterators, BlockingQueue and its implementations, the producer–consumer pattern, stopping with a "poison pill", TransferQueue, immutable collections.
---

## Overview

Ordinary collections (`ArrayList`, `HashMap`) are **not thread-safe**: concurrent modification from several threads may corrupt their internal structure, lose elements or even send a `HashMap` into an endless loop. The `java.util.concurrent` package contains collections for multithreaded access. They synchronize by themselves, often with non-blocking algorithms (CAS) or fine-grained locks.

> [!WARNING]
> Without contention, ordinary collections are more efficient than thread-safe ones. Use thread-safe collections only where a collection is really accessed by several threads.

## Synchronized Wrappers

The simplest way is the `Collections.synchronizedList/Map/Set` wrappers: each method runs under one shared lock.

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());
list.add("a");                                     // thread-safe

synchronized (list) {                              // iteration must be synchronized MANUALLY
    for (String s : list) System.out.println(s);
}
```

Problems:

* one lock for the whole collection: threads wait for each other even for reads;
* **compound** operations are not atomic: `if (!list.contains(x)) list.add(x)` from two threads may add `x` twice;
* iteration without a manual `synchronized` throws `ConcurrentModificationException`.

That is why new code uses the specialized collections below.

## ConcurrentHashMap

`ConcurrentHashMap<K, V>` is a thread-safe hash map. Reads do not block at all, and writes lock only an individual "bucket", so different keys are modified in parallel.

The main thing is **atomic compound operations**, which replace the dangerous "check, then act":

```java
ConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>();

stock.putIfAbsent("apple", 0);                          // add if the key is absent
stock.merge("apple", 5, Integer::sum);                   // atomically add 5 (or insert 5)
stock.compute("apple", (k, v) -> v == null ? 1 : v + 1);
stock.computeIfPresent("apple", (k, v) -> v > 1 ? v - 1 : null);   // null -> remove the key
stock.replace("apple", 5, 6);                            // CAS: replace only if the value is 5
stock.remove("apple", 6);                                // remove only if the value is 6
```

A cache with lazy computation, without repeated computations for the same key:

```java
private final ConcurrentHashMap<String, Report> cache = new ConcurrentHashMap<>();

Report report(String id) {
    return cache.computeIfAbsent(id, this::buildReport);   // buildReport is called at most once per key
}
```

> [!WARNING]
> The function in `compute*` runs **under the bucket's lock**. It must be short and must not modify the same map: otherwise deadlocks or `IllegalStateException: Recursive update` are possible.

A word frequency counter from several threads:

```java
ConcurrentHashMap<String, LongAdder> frequencies = new ConcurrentHashMap<>();
words.parallelStream().forEach(w ->
        frequencies.computeIfAbsent(w, k -> new LongAdder()).increment());
```

Bulk operations with a parallelism threshold:

```java
long total = stock.reduceValuesToLong(1_000, Integer::longValue, 0L, Long::sum);
stock.forEach(1_000, (k, v) -> System.out.println(k + "=" + v));
```

`ConcurrentHashMap` allows `null` neither as a key nor as a value: otherwise `get` could not tell "the key is absent" from "the value is null" without an additional (non-atomic) check.

A thread-safe set: `ConcurrentHashMap.newKeySet()`.

## Other Collections

| Collection | Description |
| --- | --- |
| `ConcurrentSkipListMap`, `ConcurrentSkipListSet` | a **sorted** thread-safe map and set (the counterparts of `TreeMap`/`TreeSet`) based on a skip list; non-blocking |
| `CopyOnWriteArrayList`, `CopyOnWriteArraySet` | every modification **copies** the whole array; reads and iteration without locks. For lists that are read very often and modified rarely (event listeners) |
| `ConcurrentLinkedQueue` | a non-blocking unbounded FIFO queue (CAS) |
| `ConcurrentLinkedDeque` | a non-blocking double-ended queue; also used as a LIFO stack |

```java
CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
listeners.add(listener);                          // rarely: copying
for (Listener l : listeners) l.onEvent(event);    // often: no locks, even if another thread is adding a listener
```

### Iterators

Iterating over a thread-safe collection that another thread is modifying **never throws** `ConcurrentModificationException`, but the guarantees differ:

* the iterators of `CopyOnWrite*` work with a **snapshot** taken when the iterator was created: later changes are not visible;
* the iterators of `ConcurrentHashMap`, `ConcurrentLinkedQueue`, `ConcurrentSkipListMap` are **weakly consistent**: each element is returned at most once, and changes made during iteration may or may not be visible.

Likewise, `size()` in thread-safe collections is only an estimate that may be stale even before it is returned.

## BlockingQueue

`BlockingQueue<E>` implements the classic **producer–consumer** pattern: it adds blocking operations to a queue.

| | Throws an exception | Returns a value | Blocks | With a timeout |
| --- | --- | --- | --- | --- |
| Insert | `add(e)` | `offer(e)` → `false` | `put(e)` | `offer(e, time, unit)` |
| Remove | `remove()` | `poll()` → `null` | `take()` | `poll(time, unit)` |

* **Producer:** if a bounded queue is full, `put` blocks the producer thread until there is space. This is natural backpressure.
* **Consumer:** `take` blocks the consumer thread until an element appears.

| Implementation | Features |
| --- | --- |
| `ArrayBlockingQueue` | bounded, array-based, one lock |
| `LinkedBlockingQueue` | unbounded by default; separate locks for the head and the tail |
| `PriorityBlockingQueue` | unbounded, elements by priority |
| `DelayQueue` | an element becomes available only after its delay expires |
| `SynchronousQueue` | capacity 0: each `put` waits for a `take` (a direct hand-off) |
| `LinkedBlockingDeque` | a blocking double-ended queue |

### Example

A producer adds numbers to the queue, and a consumer takes them. The queue has no "complete adding" operation, so the end of the data is announced with a special element — a **"poison pill"**:

```java
public class ProducerConsumer {
    private static final int POISON = -1;

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        Thread producer = Thread.ofPlatform().start(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    System.out.println("Producing: " + i);
                    queue.put(i);                         // blocks if the queue is full
                    Thread.sleep(500);
                }
                queue.put(POISON);                        // the end-of-data signal
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread consumer = Thread.ofPlatform().start(() -> {
            try {
                while (true) {
                    int item = queue.take();              // blocks if the queue is empty
                    if (item == POISON) break;
                    System.out.println("Consuming: " + item);
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.join();
        consumer.join();
    }
}
```

> [!NOTE]
> If there are several consumers, each must get its own pill: the producer adds as many of them as there are consumers. Another way to stop is to interrupt the consumer threads: `take()` reacts to `interrupt()` with an `InterruptedException`.

Consuming in the Stream API style with a timeout:

```java
Stream.generate(() -> {
            try { return queue.poll(2, TimeUnit.SECONDS); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); return null; }
        })
        .takeWhile(item -> item != null && item != POISON)        // the end of data or a timeout
        .forEach(item -> System.out.println("Consuming: " + item));
```

> [!TIP]
> Blocking queues combine perfectly with virtual threads: blocking in `put`/`take` in a virtual thread does not occupy an OS thread. That is why Java needs no separate asynchronous counterpart of a queue.

### TransferQueue

`LinkedTransferQueue` adds the `transfer(e)` method: the producer waits not just for space in the queue, but until a consumer **takes** exactly this element. This way the producer knows the element has been processed.

## Immutable Collections

The simplest thread safety is **immutability**. The `List.of`, `Map.of`, `Set.of`, `List.copyOf` collections and the result of `Stream.toList()` cannot be changed, so they can be freely passed between threads without synchronization. A manual "copy on write" pattern: keep an immutable collection in a `volatile` field (or an `AtomicReference`) and replace it with a new one on a change.

```java
private volatile List<String> servers = List.of();

void addServer(String server) {                        // rare writes under a lock
    synchronized (this) {
        List<String> copy = new ArrayList<>(servers);
        copy.add(server);
        servers = List.copyOf(copy);
    }
}

String pick(int i) {                                   // frequent reads without a lock
    List<String> current = servers;
    return current.get(i % current.size());
}
```
