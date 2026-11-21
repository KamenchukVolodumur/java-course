---
title: Exclusive Locking
description: The critical section, synchronized and object monitors, what happens under the hood, choosing the lock object, reentrancy, ReentrantLock — tryLock, timeouts, interruption, fairness, deadlocks and how to avoid them, busy waiting and onSpinWait, inter-process locking with FileLock.
---

## The Critical Section

**Exclusive locking** guarantees that at any moment only one thread has access to a protected resource — a **critical section**. Other threads trying to enter wait (block or "spin") until the lock is released.

## synchronized

The **`synchronized`** block is the simplest and most common way of synchronization in Java. Every object has a built-in **monitor**, and any object can be a lock.

```java
synchronized (lockObject) {
    statements;
}
```

The compiler turns the block into the bytecode instructions `monitorenter` and `monitorexit`, and `monitorexit` is also added on the exception path. The equivalent in code:

```java
monitorEnter(lockObject);            // pseudocode: a bytecode instruction
try {
    statements;
} finally {
    monitorExit(lockObject);         // the lock is released however the block is left
}
```

Without contention, acquiring a monitor is very cheap: a few atomic instructions without a call into the OS. Under contention the thread "spins" for a while and then the OS blocks it. In addition, entering and leaving `synchronized` are memory barriers: everything a thread wrote in the critical section is seen by the next thread that acquires the same monitor.

```java
public class Counter {
    private static int counter = 0;
    private static final Object LOCK = new Object();

    public static void main(String[] args) throws InterruptedException {
        int times = 1_000_000;
        Thread increment = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < times; i++) {
                synchronized (LOCK) { counter++; }
            }
        });
        Thread decrement = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < times; i++) {
                synchronized (LOCK) { counter--; }
            }
        });
        increment.join();
        decrement.join();
        System.out.println("Counter: " + counter);       // always 0
    }
}
```

A method modifier is a shorthand for a block around the whole method:

```java
public synchronized void deposit(long amount) { balance += amount; }     // synchronized (this)
public static synchronized Config load() { ... }                         // synchronized (Config.class)
```

### Choosing the Lock Object

* Best of all is a **private immutable field** `private final Object lock = new Object()`. Nobody from outside can acquire this monitor and accidentally (or deliberately) block the class.
* `synchronized (this)` and `synchronized` methods lock the object itself, i.e. a publicly accessible monitor: any code can write `synchronized (account)` and interfere with the synchronization.
* **Do not lock** string literals (they are interned and shared by the whole JVM), wrappers like `Integer` (cached values are shared) and fields that are reassigned (different threads would lock different objects).

> [!IMPORTANT]
> A lock protects data only if **all** accesses to that data, both reads and writes, happen under **the same** lock. An unprotected read may see a stale or "half-written" value.

### Reentrancy

Monitors are **reentrant**: a thread that already holds a lock can acquire it again (e.g. one `synchronized` method calls another) without blocking itself. The monitor counts nested entries and is released after the last exit.

```java
public synchronized void transferAll(Account to) {
    to.deposit(withdrawAll());          // withdrawAll is also synchronized on this: a reentrant entry
}
```

## ReentrantLock

`java.util.concurrent.locks.ReentrantLock` is an explicit lock with the same guarantees as `synchronized` (reentrancy, memory barriers), but with additional capabilities. Releasing **must** be done in `finally`:

```java
private final ReentrantLock lock = new ReentrantLock();

public void increment() {
    lock.lock();
    try {
        counter++;
    } finally {
        lock.unlock();                  // otherwise, after an exception, the lock stays held forever
    }
}
```

Additional capabilities:

```java
if (lock.tryLock()) {                                      // do not wait if it is taken
    try { refreshCache(); } finally { lock.unlock(); }
} else {
    useStaleCache();
}

if (lock.tryLock(500, TimeUnit.MILLISECONDS)) { ... }      // wait no longer than that

lock.lockInterruptibly();                                  // waiting can be interrupted with interrupt()

ReentrantLock fair = new ReentrantLock(true);              // fair: threads get the lock in queue order
```

| | `synchronized` | `ReentrantLock` |
| --- | --- | --- |
| Releasing | automatic | manual, in `finally` |
| Try without waiting, timeout | no | `tryLock` |
| Interruptible waiting | no | `lockInterruptibly` |
| Fairness | no | optional |
| Several wait conditions | one (`wait`/`notify`) | any number of `Condition`s |
| Diagnostics | a thread dump | `isLocked`, `getQueueLength`, `isHeldByCurrentThread` |

> [!NOTE]
> A fair lock eliminates thread "starvation", but noticeably reduces throughput: an unfair lock lets a just-released lock pass immediately to a thread that is already running, without an expensive wake-up of a sleeping one.

By default use `synchronized`: it is shorter and does not let you forget `unlock`. `ReentrantLock` is chosen when its capabilities are needed.

## Deadlocks

A **deadlock** occurs when threads wait for each other in a circle: thread 1 holds lock A and waits for B, while thread 2 holds B and waits for A.

```java
void transfer(Account from, Account to, long amount) {
    synchronized (from) {
        synchronized (to) {                  // transfer(a, b) and transfer(b, a) at the same time -> deadlock
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
```

Ways to avoid them:

* **A global lock order.** All threads acquire locks in the same order, e.g. by identifier:

```java
void transfer(Account from, Account to, long amount) {
    Account first = from.id() < to.id() ? from : to;
    Account second = first == from ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
```

* **Timeouts:** `tryLock(timeout)` and backing off with a retry.
* **Do not call foreign code under a lock:** event handlers, callbacks and overridable methods may acquire their own locks.
* **Fewer locks:** immutable objects, thread-safe collections, message passing through queues.

Diagnostics: `jcmd <pid> Thread.print` or `jstack` prints "Found one Java-level deadlock" at the end of the dump with a list of threads and locks.

## Busy Waiting

Blocking a thread (going into a waiting state and waking up) costs microseconds per context switch. For **very short** critical sections, **busy waiting** (spinning) is sometimes more beneficial: the thread checks in a loop whether the lock has been released.

```java
public final class SpinLock {
    private final AtomicBoolean locked = new AtomicBoolean();

    public void lock() {
        while (!locked.compareAndSet(false, true)) {
            Thread.onSpinWait();          // a hint to the processor (on x86 — the PAUSE instruction)
        }
    }

    public void unlock() {
        locked.set(false);
    }
}
```

> [!WARNING]
> Busy waiting occupies a CPU core at 100% for the whole wait. Misuse (long critical sections, more threads than cores) drastically reduces performance. The JVM's built-in locks already combine both approaches: they spin briefly first, then block. So a custom spin lock is almost never needed.

## Inter-Process Locking

`synchronized` and `ReentrantLock` work only within **one JVM**. To synchronize **processes** on one machine, Java uses **file locking**. A typical use is preventing a second instance of a program from starting:

```java
public static void main(String[] args) throws IOException {
    Path lockFile = Path.of(System.getProperty("java.io.tmpdir"), "myapp.lock");
    try (FileChannel channel = FileChannel.open(lockFile, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
         FileLock lock = channel.tryLock()) {                  // null if another process holds the lock
        if (lock == null) {
            System.out.println("The program is already running");
            return;
        }
        runApplication();
    }   // the lock is released even if the process crashed: the OS closes its files
}
```

* `channel.lock()` waits for the lock, `tryLock()` returns immediately;
* `lock(position, size, shared)` locks only part of the file; `shared = true` gives a shared lock for readers;
* on Unix file locks are **advisory**: they do not stop processes that do not call `lock`.

For synchronization between machines, external systems are used: database locks (`SELECT ... FOR UPDATE`), Redis, ZooKeeper.
