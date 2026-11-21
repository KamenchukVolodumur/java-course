package pl.mini.exchange;

import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== STAGE 1 =====
        // System.out.println("atomic ok: " + (Counters.atomicCount(8, 100_000) == 800_000));
        // System.out.println("unsafe <= expected: " + (Counters.unsafeCount(8, 100_000) <= 800_000));

        // ===== STAGE 2 =====
        // OrderBook book = new OrderBook();
        // book.submit(Order.create(Side.SELL, "ann", 101, 5));
        // book.submit(Order.create(Side.SELL, "bob", 102, 5));
        // book.submit(Order.create(Side.BUY, "cid", 100, 3));
        // System.out.println(book.snapshot());
        // System.out.println(book.submit(Order.create(Side.BUY, "dan", 102, 7)));
        // System.out.println(book.snapshot());
        // System.out.println(book.submit(Order.create(Side.SELL, "eve", 99, 4)));
        // System.out.println(book.snapshot());

        // ===== STAGE 3 =====
        // System.out.println("traded=" + book.tradedQty() + " resting=" + book.restingQty()
        //         + " submitted=" + book.submittedQty());
        // System.out.println("conservation: " + book.checkInvariants());

        // ===== STAGE 4 =====
        // OrderBook shared = new OrderBook();
        // Simulation.Result r = Simulation.run(shared, 8, 1_000, 2025L);
        // System.out.println("orders=" + r.orders() + " trades>0: " + (r.trades() > 0));
        // System.out.println("conservation: " + shared.checkInvariants());
        // System.out.println("crossed: " + shared.snapshot().crossed());

        // ===== STAGE 5 =====
        // OrderBook asyncBook = new OrderBook();
        // try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {   // Java 21
        //     RiskService risk = new RiskService(50, ex);
        //     List<CompletableFuture<Boolean>> fs = new ArrayList<>();
        //     for (int i = 1; i <= 100; i++) {
        //         Side side = i % 2 == 0 ? Side.BUY : Side.SELL;
        //         fs.add(risk.submitChecked(asyncBook, Order.create(side, "t" + i, 100, i)));
        //     }
        //     CompletableFuture.allOf(fs.toArray(CompletableFuture[]::new)).join();
        //     long accepted = fs.stream().filter(CompletableFuture::join).count();
        //     System.out.println("accepted=" + accepted + " rejected=" + (100 - accepted));
        //     System.out.println("conservation: " + asyncBook.checkInvariants());
        // }
    }
}
