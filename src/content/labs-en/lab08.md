---
title: Lab 08: Multithreading — an Exchange Order Book
description: Data races and atomic variables, an exchange order book with price-time priority matching, protecting shared state with a ReentrantReadWriteLock, a simulation of traders in a thread pool with a CountDownLatch and asynchronous risk checks with CompletableFuture.
---

## Before You Start

> [!NOTE]
> **Lectures:** 09.1 "Threads", 09.2 "Executors and Future", 12.1 "Introduction", 12.2 "Exclusive Locking", 12.4 "Signaling", 12.5 "Thread-Safe Collections" · **Time:** 3 h · **Points:** 10

An **order book** is two queues of orders: buy orders (**bids**) and sell orders (**asks**). A new order first tries to "match" against the opposite side; if it is not filled completely, the remainder rests in the book.

```text
          ASK (sell)                   BID (buy)
   102 | ████ 5 (bob)            100 | ███ 3 (cid)
   101 | █████ 5 (ann)  ← best    99 | ██ 2
                        best bid ↑   best ask = 101 > best bid = 100: the book is not "crossed"
```

```text
src/main/java/pl/mini/exchange/
├── Side.java  Order.java  Trade.java  Counters.java
├── OrderBook.java  BookSnapshot.java
├── Simulation.java  RiskService.java
└── Main.java   (given)
```

### Rules

* Prices are in whole units (`long`, "cents"), **not** `double`.
* Any access to shared mutable state goes under a lock or through atomic/concurrent structures.
* Close thread pools (try-with-resources or `shutdown` + `awaitTermination`).

> [!CAUTION]
> Using `Thread.sleep` as "synchronization" (for example, "wait 100 ms until the threads finish") is forbidden. You may only wait explicitly: `join`, `Future.get`, `CountDownLatch.await`, `awaitTermination`.

## A Quick Theory Recap

### Atomic Variables

```java
private static final AtomicLong NEXT_ID = new AtomicLong(1);
long id = NEXT_ID.getAndIncrement();      // atomic: no duplicates between threads
```

### ReentrantReadWriteLock

```java
private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();

public List<Trade> submit(Order o) {
    rw.writeLock().lock();
    try { return match(o); }
    finally { rw.writeLock().unlock(); }
}

public BookSnapshot snapshot() {
    rw.readLock().lock();               // many readers at once
    try { return new BookSnapshot(...); }
    finally { rw.readLock().unlock(); }
}
```

### Sorted Price Levels

```java
NavigableMap<Long, Deque<Order>> asks = new TreeMap<>();                           // ascending: the best is the lowest
NavigableMap<Long, Deque<Order>> bids = new TreeMap<>(Comparator.reverseOrder());  // descending: the best is the highest
Map.Entry<Long, Deque<Order>> best = asks.firstEntry();                             // null if empty
```

### Starting Threads Simultaneously

```java
CountDownLatch start = new CountDownLatch(1);
for (int i = 0; i < n; i++) pool.submit(() -> { start.await(); work(); return null; });
start.countDown();                      // all threads start together: races show up more often
```

### CompletableFuture

```java
CompletableFuture<Boolean> ok = CompletableFuture.supplyAsync(() -> check(o), executor);
ok.thenApply(accepted -> accepted ? book.submit(o) : List.<Trade>of());
CompletableFuture.allOf(futures).join();
```

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
atomic ok: true
unsafe <= expected: true
bid 100x3 | ask 101x5
[Trade[buyId=4, sellId=1, price=101, qty=5], Trade[buyId=4, sellId=2, price=102, qty=2]]
bid 100x3 | ask 102x3
[Trade[buyId=3, sellId=5, price=100, qty=3]]
bid - | ask 99x1
traded=10 resting=4 submitted=24
conservation: true
orders=8000 trades>0: true
conservation: true
crossed: false
accepted=50 rejected=50
conservation: true
```

> [!NOTE]
> Order ids come from one global counter, so in the stage 2 output they start at 1 only if no `Order` was created before. Stage 1 creates no orders.

## Stage 1: A Data Race and Atomic Variables (1 pt)

```java
public final class Counters {
    public static long unsafeCount(int threads, int perThread) throws InterruptedException;
    public static long atomicCount(int threads, int perThread) throws InterruptedException;
}
```

* Both methods start `threads` platform threads (`new Thread` / `Thread.ofPlatform()`), each of which increments a shared counter `perThread` times. They return the final value after `join` on all threads.
* `unsafeCount`: an ordinary `long` field (in a static nested holder class) and `counter++`.
* `atomicCount`: `AtomicLong.incrementAndGet()` (or a `LongAdder`).

Run `unsafeCount` several times and write the results in a comment in the code. Explain in the comment **why** they differ and are less than 800,000.

> [!TIP]
> If `unsafeCount` happens to give exactly 800,000, increase `perThread` or the number of threads. A race does not guarantee an error — it only makes one possible. That is why concurrency bugs are so treacherous.

## Stage 2: The Book and Order Matching (3 pts)

```java
public enum Side { BUY, SELL }

public record Order(long id, Side side, String trader, long price, int qty) {
    public static Order create(Side side, String trader, long price, int qty);   // id from an AtomicLong starting at 1
    // qty <= 0 or price <= 0 -> IllegalArgumentException
}

public record Trade(long buyId, long sellId, long price, int qty) { }

public record BookSnapshot(Long bestBid, int bidQty, Long bestAsk, int askQty) {
    public boolean crossed();         // both sides exist and bestBid >= bestAsk
    @Override public String toString();   // "bid 100x3 | ask 101x5"; an empty side is "-"
}

public class OrderBook {
    public List<Trade> submit(Order o);
    public BookSnapshot snapshot();   // bidQty/askQty is the sum of qty at the BEST level
}
```

### Matching Rules (Price-Time Priority)

1. A **BUY** order with price P matches SELL orders priced **≤ P**, starting from the lowest. A **SELL** order matches BUY orders priced **≥ P**, starting from the highest.
2. Within one price level, in arrival order (FIFO, `ArrayDeque`).
3. A trade executes at the price of the **order that was already in the book** (the resting order), with the quantity `min(qty1, qty2)`.
4. A partially filled resting order keeps its place in the queue with a smaller quantity. Since `Order` is a record, replace it with a copy with the new `qty`: `deque.pollFirst()` + `offerFirst(...)`.
5. The unfilled remainder of the new order rests in the book on its own side at its own price.
6. Empty price levels must be removed from the map.

> [!IMPORTANT]
> Walk through the example from `Main` on paper: dan buys 7 at up to 102 → 5 from ann at 101, then 2 from bob at 102; bob has 3 left. Then eve sells 4 at 99 or more → 3 to cid at 100, and the remaining 1 rests in the book as ask 99.

## Stage 3: Thread Safety and Invariants (2 pts)

1. Protect `OrderBook` with one `ReentrantReadWriteLock`: `submit` under the write lock, `snapshot` and the methods below under the read lock.
2. Add bookkeeping (the counters change **inside** the critical section of `submit`):

```java
public long submittedQty();   // the sum of qty of all submitted orders
public long tradedQty();      // the sum of qty of all trades
public long restingQty();     // the sum of qty of all orders currently in the book
public boolean checkInvariants();
```

`checkInvariants()` checks:

* **the conservation law**: `submittedQty == 2 * tradedQty + restingQty` (each trade "consumes" the same quantity from both sides);
* the book is not crossed (`!snapshot().crossed()`);
* the maps contain no empty levels.

> [!WARNING]
> `checkInvariants` must see a **consistent** state: all three counters and the maps must be read under **one** read lock, not by calling three separate synchronized methods. Otherwise a `submit` from another thread can slip in between the calls.

## Stage 4: A Trader Simulation (2 pts)

```java
public final class Simulation {
    public record Result(int orders, long trades) { }
    public static Result run(OrderBook book, int traders, int ordersPerTrader, long seed) throws InterruptedException;
}
```

* A pool `Executors.newFixedThreadPool(traders)`. Each trader is a separate task that submits `ordersPerTrader` random orders: side 50/50, price from [95, 105], quantity from [1, 10].
* Each trader has **its own** `new Random(seed + traderIndex)`: a `Random` should not be shared between many threads (it is slow, and reproducibility is lost).
* All traders start **simultaneously** on the signal of a `CountDownLatch(1)`.
* Count the trades with a `LongAdder` (the sum of the sizes of the lists returned by `submit`).
* Submit the tasks with `submit`, and after they finish call `get()` on every `Future` so that exceptions from the threads do not get lost.

> [!TIP]
> Check yourself: temporarily remove the locks from `OrderBook` and run the simulation a few times. How quickly does `checkInvariants` return `false` (or a `NullPointerException`/`ConcurrentModificationException` fly out of `TreeMap`)?

## Stage 5: Asynchronous Risk Checks (2 pts)

```java
public class RiskService {
    public RiskService(int maxQty, Executor executor);
    public CompletableFuture<Boolean> check(Order o);            // asynchronously: o.qty() <= maxQty
    public CompletableFuture<Boolean> submitChecked(OrderBook book, Order o);
}
```

* `check` simulates a call to an external service: `supplyAsync(..., executor)` with a delay of 5–20 ms (`Thread.sleep` **is allowed** here: it simulates the network, it is not synchronization).
* `submitChecked`: if the check succeeds, it submits the order to the book and completes with `true`; otherwise it submits nothing and completes with `false`. Use `thenApply` (think about why `thenCompose` is not needed here).
* Add a timeout: `orTimeout(1, TimeUnit.SECONDS)`; after a timeout the order counts as rejected (`exceptionally(ex -> false)`).

> [!NOTE]
> Virtual threads (`newVirtualThreadPerTaskExecutor`, Java 21) are ideal for such tasks: 100 simultaneous "network calls" do not occupy 100 OS threads. On Java 17 use `Executors.newCachedThreadPool()`.

Commit, tag it `lab08` and push.
