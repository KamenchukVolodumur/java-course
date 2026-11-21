---
title: Signaling
description: Waiting for events between threads, condition variables — wait, notify and notifyAll, spurious wakeups, Condition for ReentrantLock, a bounded producer–consumer queue, CountDownLatch, CyclicBarrier, Phaser, Exchanger, manually reset gates, LockSupport.
---

## Overview

**Signaling** mechanisms are intended for interaction between threads: one thread suspends its execution until it receives a signal from another. Java has:

* **condition variables** — `wait`/`notify` of the built-in monitor and `Condition` for `ReentrantLock`: the low-level foundation on which any signaling can be built;
* ready-made **synchronizers** of the `java.util.concurrent` package: `CountDownLatch`, `CyclicBarrier`, `Phaser`, `Exchanger`, `Semaphore`;
* **blocking queues** (`BlockingQueue`, the "Thread-Safe Collections" page), which most often make manual signaling unnecessary.

## wait and notify

Besides its monitor, every object has a **wait set** — a condition variable tied to the monitor:

* `obj.wait()` — **releases** the monitor of `obj` and suspends the thread until it is woken up; before returning it acquires the monitor again;
* `obj.notify()` — wakes up **one** thread waiting on `obj`;
* `obj.notifyAll()` — wakes up **all** threads waiting on `obj`.

All three methods can be called only inside `synchronized (obj)`, otherwise — an `IllegalMonitorStateException`.

The standard pattern is waiting **in a loop** that checks the condition:

```java
synchronized (lock) {
    while (!condition) {          // while, not if!
        lock.wait();
    }
    // the condition holds, and we hold the monitor
}

// in another thread
synchronized (lock) {
    condition = true;
    lock.notifyAll();
}
```

The `while` loop is needed for three reasons:

1. **Spurious wakeups**: the specification allows `wait()` to return without any `notify`.
2. Between waking up and reacquiring the monitor, **another thread** may already have "taken" what we were waiting for.
3. With `notifyAll`, threads waiting for **different** conditions wake up.

> [!WARNING]
> `notify()` wakes up a random thread. If threads with different conditions wait on the same monitor (producers wait for space, consumers for elements), `notify` may wake up "the wrong one", and the signal is lost. When in doubt, use `notifyAll()` or separate `Condition`s.

## A Bounded Queue: Producer and Consumer

The classic example is a bounded queue: the producer waits until there is space, and the consumer until there is an element. On a `ReentrantLock` with two **separate** conditions, each signal wakes only threads of the right kind:

```java
public class BoundedQueue<T> {
    private final Object[] items;
    private int head, tail, count;

    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notEmpty = lock.newCondition();
    private final Condition notFull = lock.newCondition();

    public BoundedQueue(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity");
        items = new Object[capacity];
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) {
                notFull.await();                 // releases lock, waits for the notFull signal
            }
            items[tail] = item;
            tail = (tail + 1) % items.length;
            count++;
            notEmpty.signal();                   // wake up one consumer
        } finally {
            lock.unlock();
        }
    }

    @SuppressWarnings("unchecked")
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) {
                notEmpty.await();
            }
            T item = (T) items[head];
            items[head] = null;                  // do not keep a reference for the garbage collector
            head = (head + 1) % items.length;
            count--;
            notFull.signal();                    // wake up one producer
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

This is exactly how `ArrayBlockingQueue` is implemented in the JDK, so real code uses the ready-made queue. `Condition` also has `await(timeout, unit)`, `awaitNanos` and `awaitUninterruptibly`.

## CountDownLatch

A **countdown latch** opens when its internal counter reaches zero. Each `countDown()` decrements the counter, and `await()` waits for zero. Useful when one thread must wait until a certain number of others finish their work or reach a certain point.

```java
int workers = 3;
CountDownLatch ready = new CountDownLatch(workers);
CountDownLatch start = new CountDownLatch(1);              // a "gate" for a simultaneous start

for (int i = 0; i < workers; i++) {
    int id = i;
    Thread.ofPlatform().start(() -> {
        System.out.println("Worker " + id + " is ready");
        ready.countDown();
        try {
            start.await();                                 // waiting for the start signal
            System.out.println("Worker " + id + " is working");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
}

ready.await();                                             // everyone is ready
System.out.println("Start!");
start.countDown();                                         // open the gate for everyone at once
```

A `CountDownLatch` is **single-use**: the counter cannot be reset. A latch with a count of 1 works as a **manually opened gate**: while it is closed, everyone waits; after it opens, everyone passes, and the gate stays open.

## CyclicBarrier

A **barrier** synchronizes a group of threads working in **phases**. Threads arrive at the barrier (`await()`) and wait until all participants have come. Only when everyone has gathered do they move on to the next phase together. The barrier is **cyclic**: after passing it is ready again. An optional **barrier action** runs once per phase, when the last participant arrives.

### Example: a Dice Game

Three threads roll a die. The barrier guarantees that all threads make their roll in the current round before any of them moves to the next one, and the results of a round are printed on one line:

```java
public class DiceGame {
    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(3, System.out::println);   // the action: a new line

        Runnable rollDice = () -> {
            try {
                for (int i = 0; i < 5; i++) {
                    System.out.print(d6() + " ");
                    barrier.await();
                }
            } catch (InterruptedException | BrokenBarrierException e) {
                Thread.currentThread().interrupt();
            }
        };
        for (int i = 0; i < 3; i++) Thread.ofPlatform().start(rollDice);
    }

    static int d6() {
        return 1 + ThreadLocalRandom.current().nextInt(6);
    }
}
// 4 1 6
// 2 2 5
// ...
```

If one of the participants is interrupted or times out, the barrier becomes **broken**, and all the others get a `BrokenBarrierException`. This way the group does not wait forever for a participant that has dropped out.

## Phaser

A `Phaser` is a more flexible barrier: the number of participants can change (`register`, `arriveAndDeregister`), and the phases are numbered.

```java
Phaser phaser = new Phaser(1);                         // the main thread is registered
for (int i = 0; i < 3; i++) {
    phaser.register();
    int id = i;
    Thread.ofPlatform().start(() -> {
        for (int phase = 0; phase < 3; phase++) {
            System.out.println("Thread " + id + ", phase " + phase);
            phaser.arriveAndAwaitAdvance();
        }
        phaser.arriveAndDeregister();
    });
}
phaser.arriveAndDeregister();                          // the main thread does not take part in the phases
```

## Exchanger

An `Exchanger<V>` is a meeting point of **two** threads: each calls `exchange(value)` and gets the other's value. A typical use is exchanging buffers: the producer fills one buffer, the consumer empties another, and at the meeting point they swap.

```java
Exchanger<List<String>> exchanger = new Exchanger<>();
// producer: full = exchanger.exchange(full)   -> gets an empty buffer
// consumer: empty = exchanger.exchange(empty) -> gets a full buffer
```

## LockSupport

At the lowest level, all synchronizers are built on `LockSupport`:

* `LockSupport.park()` — suspends the current thread;
* `LockSupport.unpark(thread)` — gives the thread a "permit" to continue. If the permit is given **before** `park`, the next `park` returns immediately, so the signal is not lost.

```java
Thread waiter = Thread.ofPlatform().start(() -> {
    System.out.println("Waiting...");
    LockSupport.park();
    System.out.println("Woken up");
});
Thread.sleep(500);
LockSupport.unpark(waiter);
```

Like `wait`, `park` may return spuriously, so it is also called in a loop with a condition check. Application code almost never uses `LockSupport`: it is needed by the authors of custom synchronizers (together with `AbstractQueuedSynchronizer`).

> [!TIP]
> The order of preference: first **high-level** tools (`BlockingQueue`, `CompletableFuture`, `ExecutorService.invokeAll`), then ready-made synchronizers (`CountDownLatch`, `CyclicBarrier`, `Semaphore`), and only as a last resort `Condition` or `wait`/`notify`.
