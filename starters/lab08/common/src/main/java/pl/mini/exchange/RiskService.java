package pl.mini.exchange;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

// STAGE 5
public class RiskService {

    public RiskService(int maxQty, Executor executor) {
        throw new UnsupportedOperationException("TODO");
    }

    public CompletableFuture<Boolean> check(Order o) {
        throw new UnsupportedOperationException("TODO");
    }

    public CompletableFuture<Boolean> submitChecked(OrderBook book, Order o) {
        throw new UnsupportedOperationException("TODO");
    }
}
