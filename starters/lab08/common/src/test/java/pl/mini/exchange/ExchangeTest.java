package pl.mini.exchange;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.*;
import static pl.mini.testkit.Console.assertPrints;

class ExchangeTest {

    // ===== STAGE 1 =====

    @Test
    @Tag("stage1")
    void stage1Output() {
        assertPrints("""
                atomic ok: true
                unsafe <= expected: true
                """, () -> {
            System.out.println("atomic ok: " + (Counters.atomicCount(8, 100_000) == 800_000));
            System.out.println("unsafe <= expected: " + (Counters.unsafeCount(8, 100_000) <= 800_000));
        });
    }

    @Test
    @Tag("stage1")
    void atomicCountIsExactForOtherSizes() throws InterruptedException {
        assertEquals(30_000, Counters.atomicCount(3, 10_000));
        assertEquals(0, Counters.atomicCount(4, 0));
    }

    // ===== STAGE 2 =====

    @Test
    @Tag("stage2")
    void stage2Output() {
        // ids come from one global counter: count them from the first order of this test
        OrderBook book = new OrderBook();
        Order ann = Order.create(Side.SELL, "ann", 101, 5);
        long b = ann.id() - 1;
        assertPrints("""
                bid 100x3 | ask 101x5
                [Trade[buyId=%d, sellId=%d, price=101, qty=5], Trade[buyId=%d, sellId=%d, price=102, qty=2]]
                bid 100x3 | ask 102x3
                [Trade[buyId=%d, sellId=%d, price=100, qty=3]]
                bid - | ask 99x1
                """.formatted(b + 4, b + 1, b + 4, b + 2, b + 3, b + 5), () -> {
            book.submit(ann);
            book.submit(Order.create(Side.SELL, "bob", 102, 5));
            book.submit(Order.create(Side.BUY, "cid", 100, 3));
            System.out.println(book.snapshot());
            System.out.println(book.submit(Order.create(Side.BUY, "dan", 102, 7)));
            System.out.println(book.snapshot());
            System.out.println(book.submit(Order.create(Side.SELL, "eve", 99, 4)));
            System.out.println(book.snapshot());
        });
    }

    @Test
    @Tag("stage2")
    void invalidOrdersAreRejected() {
        assertThrows(IllegalArgumentException.class, () -> Order.create(Side.BUY, "x", 100, 0));
        assertThrows(IllegalArgumentException.class, () -> Order.create(Side.BUY, "x", 0, 1));
    }

    @Test
    @Tag("stage2")
    void idsAreIncreasing() {
        Order a = Order.create(Side.BUY, "x", 1, 1), b = Order.create(Side.BUY, "x", 1, 1);
        assertTrue(b.id() > a.id());
    }

    @Test
    @Tag("stage2")
    void emptyBook() {
        BookSnapshot s = new OrderBook().snapshot();
        assertEquals("bid - | ask -", s.toString());
        assertFalse(s.crossed());
    }

    @Test
    @Tag("stage2")
    void sameLevelIsFifo() {
        OrderBook book = new OrderBook();
        Order first = Order.create(Side.SELL, "a", 100, 2), second = Order.create(Side.SELL, "b", 100, 2);
        book.submit(first);
        book.submit(second);
        List<Trade> trades = book.submit(Order.create(Side.BUY, "c", 100, 3));
        assertEquals(List.of(first.id(), second.id()), trades.stream().map(Trade::sellId).toList());
        assertEquals(List.of(2, 1), trades.stream().map(Trade::qty).toList());
        assertEquals("bid - | ask 100x1", book.snapshot().toString());
    }

    @Test
    @Tag("stage2")
    void noTradeWhenPricesDoNotCross() {
        OrderBook book = new OrderBook();
        book.submit(Order.create(Side.SELL, "a", 105, 1));
        assertEquals(List.of(), book.submit(Order.create(Side.BUY, "b", 104, 1)));
        assertEquals("bid 104x1 | ask 105x1", book.snapshot().toString());
    }

    @Test
    @Tag("stage2")
    void crossedMeansBidAtLeastAsk() {
        assertTrue(new BookSnapshot(100L, 1, 100L, 1).crossed());
        assertFalse(new BookSnapshot(99L, 1, 100L, 1).crossed());
        assertFalse(new BookSnapshot(null, 0, 100L, 1).crossed());
    }

    // ===== STAGE 3 =====

    @Test
    @Tag("stage3")
    void stage3Counters() {
        OrderBook book = new OrderBook();
        book.submit(Order.create(Side.SELL, "ann", 101, 5));
        book.submit(Order.create(Side.SELL, "bob", 102, 5));
        book.submit(Order.create(Side.BUY, "cid", 100, 3));
        book.submit(Order.create(Side.BUY, "dan", 102, 7));
        book.submit(Order.create(Side.SELL, "eve", 99, 4));
        assertEquals(10, book.tradedQty());
        assertEquals(4, book.restingQty());
        assertEquals(24, book.submittedQty());
        assertTrue(book.checkInvariants());
    }

    @Test
    @Tag("stage3")
    void concurrentSubmitsKeepTheInvariants() throws Exception {
        OrderBook book = new OrderBook();
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            List<java.util.concurrent.Future<?>> fs = new ArrayList<>();
            for (int t = 0; t < 8; t++) {
                int ti = t;
                fs.add(pool.submit(() -> {
                    for (int k = 0; k < 2_000; k++)
                        book.submit(Order.create((k + ti) % 2 == 0 ? Side.BUY : Side.SELL, "t", 98 + (k * 7 + ti) % 5, 1 + k % 4));
                }));
            }
            for (var f : fs) f.get();
        }
        assertTrue(book.checkInvariants());
        assertFalse(book.snapshot().crossed());
    }

    // ===== STAGE 4 =====

    @Test
    @Tag("stage4")
    void simulation() throws InterruptedException {
        OrderBook shared = new OrderBook();
        Simulation.Result r = Simulation.run(shared, 8, 1_000, 2025L);
        assertEquals(8_000, r.orders());
        assertTrue(r.trades() > 0);
        assertTrue(shared.checkInvariants());
        assertFalse(shared.snapshot().crossed());
        assertEquals(shared.submittedQty(), 2 * shared.tradedQty() + shared.restingQty());
    }

    // ===== STAGE 5 =====

    @Test
    @Tag("stage5")
    void riskChecks() {
        OrderBook book = new OrderBook();
        try (ExecutorService ex = Executors.newCachedThreadPool()) {
            RiskService risk = new RiskService(50, ex);
            List<CompletableFuture<Boolean>> fs = new ArrayList<>();
            for (int i = 1; i <= 100; i++) {
                Side side = i % 2 == 0 ? Side.BUY : Side.SELL;
                fs.add(risk.submitChecked(book, Order.create(side, "t" + i, 100, i)));
            }
            CompletableFuture.allOf(fs.toArray(CompletableFuture[]::new)).join();
            assertEquals(50, fs.stream().filter(CompletableFuture::join).count());
        }
        assertTrue(book.checkInvariants());
        assertEquals((50 * 51) / 2, book.submittedQty());
    }

    @Test
    @Tag("stage5")
    void checkDoesNotSubmit() {
        OrderBook book = new OrderBook();
        try (ExecutorService ex = Executors.newCachedThreadPool()) {
            assertFalse(new RiskService(5, ex).check(Order.create(Side.BUY, "x", 100, 6)).join());
            assertTrue(new RiskService(5, ex).check(Order.create(Side.BUY, "x", 100, 5)).join());
        }
        assertEquals(0, book.submittedQty());
    }
}
