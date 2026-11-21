---
title: Introduction
description: Categories of synchronization tools in Java, the visibility and reordering problem, the Java Memory Model and the happens-before relation, volatile, memory barriers, atomic operations, the Atomic* classes, LongAdder, VarHandle and CAS.
---

## Overview

Concurrent access to resources requires synchronization to avoid **data races** and keep data consistent. Java provides a set of tools that differ in purpose, scope (within a process or between processes) and cost.

They can be divided into four categories:

* **Exclusive locking** — only one thread has access to the resource at any moment:
  * `synchronized` (an object's built-in monitor);
  * `ReentrantLock`;
  * `FileLock` — between processes.
* **Non-exclusive locking** — limits concurrency:
  * `Semaphore`;
  * `ReentrantReadWriteLock`, `StampedLock`.
* **Signaling** — threads notify each other and wait for events:
  * `wait`/`notify`, `Condition` (condition variables);
  * `CountDownLatch`, `CyclicBarrier`, `Phaser`, `Exchanger`;
  * `LockSupport.park`/`unpark`.
* **Lower-level non-blocking tools**:
  * `volatile`;
  * the atomic classes `AtomicInteger`, `AtomicReference`, `LongAdder`;
  * `VarHandle` and memory barriers.

## The Problem

In the example below the `complete` field is not protected in any way. The JIT compiler may optimize the `while` loop so that the value of `complete` is read into a CPU register **only once**. Although the main thread changes the value to `true`, the background thread may never see it, and the program "hangs".

```java
public class Visibility {
    private static boolean complete = false;

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            boolean toggle = false;
            while (!complete) {
                toggle = !toggle;
            }
            System.out.println("The thread saw complete = true");
        });
        thread.start();
        Thread.sleep(1000);
        complete = true;
        thread.join();                       // on HotSpot with the JIT it often waits forever
    }
}
```

There are actually two problems:

1. **Visibility.** A write by one thread may remain in a register or a core's store buffer and not be visible to other cores.
2. **Reordering.** Both the compiler and the processor may change the order of instructions if the result does not change within **a single** thread. Another thread may see the changes in the "wrong" order.

```java
// Thread 1                      // Thread 2
data = 42;                       if (ready) {
ready = true;                        System.out.println(data);   // may print 0!
                                 }
```

## The Java Memory Model

The **Java Memory Model** (JMM) defines when a write by one thread is **guaranteed to be visible** to another. The key concept is the **happens-before** relation: if action A happens-before action B, then B sees all the effects of A (and of all actions before A).

The main rules:

| Action A | happens-before action B |
| --- | --- |
| any action in a thread | the next action in the same thread (program order) |
| releasing a monitor (`synchronized`, `unlock`) | a subsequent acquisition of **the same** monitor/lock |
| a write to a `volatile` field | a subsequent read of **the same** field |
| `thread.start()` | any action in the started thread |
| any action in a thread | returning from `thread.join()` for that thread |
| submitting a task to an executor, `queue.put(x)`, `future.complete(x)` | the execution of the task, `queue.take()`, getting the result |
| the end of a constructor (for `final` fields) | any read of the object published after the constructor |

The relation is transitive: if thread 1 wrote `data` and then released a lock, and thread 2 acquired the same lock, thread 2 sees `data`.

> [!IMPORTANT]
> A program **without data races** (every access to a shared variable, of which at least one is a write, is ordered by happens-before) behaves as if all threads ran in turns on a single core (*sequential consistency*). With races, any "strange" results are possible.

## volatile

A field with the **`volatile`** modifier guarantees:

* **visibility** — every read sees the latest write from any thread;
* **ordering** — a write to a `volatile` is not reordered with preceding writes (*release* semantics), and a read is not reordered with subsequent reads (*acquire* semantics). That is why everything a thread wrote **before** writing the `volatile` is visible to the thread that read that value.

```java
private static volatile boolean complete = false;    // the fix for the first example

// Publishing data:
private int data;
private volatile boolean ready;

void writer() { data = 42; ready = true; }                       // release
void reader() { if (ready) System.out.println(data); }           // acquire: guaranteed to be 42
```

> [!WARNING]
> `volatile` does **not** make compound operations atomic: `volatileCounter++` is still "read, modify, write", and two threads may lose an update. `volatile` suits flags and publishing references; for counters — the atomic classes.

## Memory Barriers

A **memory barrier** (memory fence) is a processor or compiler instruction that enforces the order of memory operations:

1. **It forbids reordering** — instructions before the barrier execute before the instructions after it.
2. **It guarantees visibility** — it forces pending writes to complete and prevents reading stale copies. (Contrary to a popular belief, a barrier does not "flush the cache to RAM": the hardware itself keeps the caches of all cores coherent.)

In Java barriers are rarely placed by hand, because they are generated implicitly:

1. on entering and leaving a `synchronized` block, in `lock()`/`unlock()`;
2. in the methods of synchronization primitives and thread-safe collections;
3. when reading and writing `volatile` fields;
4. in atomic operations;
5. when starting a thread and on `join()`.

Explicit barriers are given by the static methods `VarHandle.fullFence()`, `acquireFence()`, `releaseFence()`. They are needed only in the low-level code of non-blocking data structures.

## Atomic Operations

An **atomic** operation is indivisible: from the point of view of other threads it executes either completely or not at all.

Non-atomic, for example:

* increment and decrement (`counter++`);
* "check, then act" (`if (map.get(k) == null) map.put(k, v)`);
* swapping two values;
* reading and writing `long`/`double` without `volatile` (the JLS allows splitting them into two 32-bit halves, although this does not happen on 64-bit JVMs).

`counter++` and `counter--` consist of three steps: read, modify, write. When two threads do this at the same time, the steps interleave, and the final value is unpredictable:

```java
public class Counter {
    static int counter = 0;

    public static void main(String[] args) throws InterruptedException {
        int times = 1_000_000;
        Thread increment = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter++; });
        Thread decrement = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter--; });
        increment.join();
        decrement.join();
        System.out.println("Counter: " + counter);            // e.g. Counter: -48213
    }
}
```

### The Atomic Classes

The `java.util.concurrent.atomic` package contains classes whose operations are executed with a single hardware instruction (on x86 — with the `lock` prefix) and have `volatile` semantics:

```java
static final AtomicInteger counter = new AtomicInteger();

Thread increment = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter.incrementAndGet(); });
Thread decrement = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter.decrementAndGet(); });
increment.join();
decrement.join();
System.out.println("Counter: " + counter.get());               // always 0
```

| Method | Action |
| --- | --- |
| `get()`, `set(v)` | a `volatile` read and write |
| `incrementAndGet()`, `getAndAdd(d)` | atomic addition |
| `getAndSet(v)` | an atomic swap, returns the old value |
| `compareAndSet(expected, v)` | **CAS**: write `v` only if the current value equals `expected` |
| `updateAndGet(fn)`, `accumulateAndGet(x, fn)` | an arbitrary update in a CAS loop |

Classes: `AtomicInteger`, `AtomicLong`, `AtomicBoolean`, `AtomicReference<V>`, the arrays `AtomicIntegerArray`, `AtomicReferenceArray`.

### Compare-and-Set

**CAS** (compare-and-set) is the foundation of non-blocking algorithms. Any update can be expressed as a loop: read the value, compute the new one and try to write it; if another thread managed to change the value, try again:

```java
static final AtomicInteger max = new AtomicInteger(Integer.MIN_VALUE);

static void updateMax(int candidate) {
    int current;
    do {
        current = max.get();
        if (candidate <= current) return;
    } while (!max.compareAndSet(current, candidate));
}
// the same, shorter: max.accumulateAndGet(candidate, Math::max);
```

A non-blocking Treiber stack on an `AtomicReference`:

```java
public class LockFreeStack<T> {
    private record Node<T>(T value, Node<T> next) { }
    private final AtomicReference<Node<T>> head = new AtomicReference<>();

    public void push(T value) {
        Node<T> oldHead;
        Node<T> newHead;
        do {
            oldHead = head.get();
            newHead = new Node<>(value, oldHead);
        } while (!head.compareAndSet(oldHead, newHead));
    }

    public T pop() {
        Node<T> oldHead;
        do {
            oldHead = head.get();
            if (oldHead == null) return null;
        } while (!head.compareAndSet(oldHead, oldHead.next()));
        return oldHead.value();
    }
}
```

### LongAdder

Under high contention, many threads constantly "fight" over the same `AtomicLong` cell, and CAS often fails. **`LongAdder`** spreads the counter over several cells (one per group of threads) and sums them only when reading. Writing is much faster, while `sum()` is slower and not an instantaneous snapshot. Ideal for statistics: request counters, metrics.

```java
LongAdder requests = new LongAdder();
requests.increment();                      // from many threads
long total = requests.sum();
```

### VarHandle

A `VarHandle` (Java 9) provides atomic operations and various access modes for an **ordinary** field or array element without wrapping it in an `Atomic*`. It saves memory when there are millions of such fields:

```java
class Node {
    volatile int state;
    private static final VarHandle STATE;
    static {
        try {
            STATE = MethodHandles.lookup().findVarHandle(Node.class, "state", int.class);
        } catch (ReflectiveOperationException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    boolean tryClaim() {
        return STATE.compareAndSet(this, 0, 1);       // CAS on this object's field
    }
}
```

The access modes from weakest to strongest: *plain*, *opaque*, *acquire/release* (`getAcquire`, `setRelease`), *volatile*. Weaker modes are cheaper, but require a precise understanding of the memory model.
