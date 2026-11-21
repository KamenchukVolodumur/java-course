---
title: Non-Exclusive Locking
description: Semaphore for limiting concurrency, permits, fairness, an example of limiting parallel downloads, ReentrantReadWriteLock for frequent reads and rare writes, lock downgrading, StampedLock and optimistic reading.
---

**Non-exclusive locking** allows several threads to access a resource at the same time under certain conditions: with a limit on the number of threads or for reading only.

## Semaphore

A **semaphore** limits the number of threads that can access a resource or a region of code at the same time. It is created with a certain number of **permits**:

* `acquire()` takes a permit; if there are none, the thread waits;
* `release()` returns a permit and wakes up a waiting thread;
* `tryAcquire()` and `tryAcquire(timeout, unit)` — without waiting or with limited waiting;
* `acquire(n)`/`release(n)` — several permits at once.

A typical use is **throttling**: at most 5 simultaneous file downloads, at most 10 database connections.

> [!NOTE]
> Unlike a lock, a semaphore **has no owner**: a permit can be returned by any thread, not only the one that took it. A semaphore with one permit is similar to an exclusive lock, but is not reentrant.

### Example

The `Downloader` limits the number of simultaneous downloads to the value of `concurrency`. Each download runs in its own virtual thread, and the semaphore lets only part of them through:

```java
public class Downloader {
    private final Semaphore semaphore;
    private final HttpClient client = HttpClient.newHttpClient();

    public Downloader(int concurrency) {
        this.semaphore = new Semaphore(concurrency);
    }

    public void download(String url, Path file) throws InterruptedException {
        System.out.println("[" + file + "] Waiting to start the download...");
        semaphore.acquire();
        try {
            System.out.println("[" + file + "] Downloading...");
            HttpRequest request = HttpRequest.newBuilder(URI.create(url)).build();
            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.printf("[%s] Downloaded %.2f KB%n", file, response.body().length / 1024.0);
            Files.write(file, response.body());
            System.out.println("[" + file + "] Finished.");
        } catch (IOException e) {
            System.out.println("[" + file + "] Error: " + e.getMessage());
        } finally {
            semaphore.release();
        }
    }
}

Downloader downloader = new Downloader(2);
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 1; i <= 6; i++) {
        String url = "https://example.com/file" + i + ".bin";
        Path file = Path.of("file" + i + ".bin");
        executor.submit(() -> { downloader.download(url, file); return null; });
    }
}
```

`new Semaphore(n, true)` is a **fair** semaphore: permits are handed out in the order of the waiting queue.

## ReentrantReadWriteLock

A `ReadWriteLock` is optimized for scenarios where **reads are much more frequent than writes**. It has two modes:

* **read** (`readLock()`) — any number of threads at once;
* **write** (`writeLock()`) — only one thread; while it writes, nobody reads or writes.

It is most often used for shared data structures, application configuration, caches: wherever there are many reads and very few writes.

```java
public class Cache<K, V> {
    private final Map<K, V> map = new HashMap<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock read = rwLock.readLock();
    private final Lock write = rwLock.writeLock();

    public V get(K key) {
        read.lock();
        try {
            return map.get(key);                      // many threads at once
        } finally {
            read.unlock();
        }
    }

    public void put(K key, V value) {
        write.lock();
        try {
            map.put(key, value);                      // exclusively
        } finally {
            write.unlock();
        }
    }
}
```

The rules of `ReentrantReadWriteLock`:

* both locks are reentrant;
* **downgrading** is allowed: while holding the write lock, you can acquire the read lock and then release the write lock;
* **upgrading** from read to write is **not supported**: an attempt to acquire the write lock while holding the read lock deadlocks the thread with itself.

> [!NOTE]
> A read-write lock pays off only when reads are **long** and truly parallel. For short operations its overhead is higher than that of an ordinary lock, and for maps it is simpler and faster to use `ConcurrentHashMap`. In simple cases an ordinary `synchronized` is usually enough.

## StampedLock

`StampedLock` (Java 8) adds **optimistic reading**: a reader does not acquire the lock, but gets a "stamp" (a number), reads the data and checks whether there was a write in the meantime. If there was, it repeats the read under a real lock. When writes are rare, readers do not contend with each other at all.

```java
public class Point {
    private double x, y;
    private final StampedLock lock = new StampedLock();

    public void move(double dx, double dy) {
        long stamp = lock.writeLock();
        try {
            x += dx;
            y += dy;
        } finally {
            lock.unlockWrite(stamp);
        }
    }

    public double distanceFromOrigin() {
        long stamp = lock.tryOptimisticRead();            // no locking
        double currentX = x, currentY = y;                // copies into local variables
        if (!lock.validate(stamp)) {                      // there was a write — read under the lock
            stamp = lock.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return Math.hypot(currentX, currentY);
    }
}
```

> [!WARNING]
> `StampedLock` is **not reentrant** and does not support `Condition`. In optimistic mode the data may be inconsistent until `validate` is called, so it is only copied into local variables and nothing is done with it before the check.
