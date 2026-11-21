package pl.mini.exchange;

import java.util.List;

// STAGE 2 (submit, snapshot) and STAGE 3 (lock, counters, invariants)
public class OrderBook {

    public List<Trade> submit(Order o) {
        throw new UnsupportedOperationException("TODO");
    }

    public BookSnapshot snapshot() {
        throw new UnsupportedOperationException("TODO");
    }

    public long submittedQty() {
        throw new UnsupportedOperationException("TODO");
    }

    public long tradedQty() {
        throw new UnsupportedOperationException("TODO");
    }

    public long restingQty() {
        throw new UnsupportedOperationException("TODO");
    }

    public boolean checkInvariants() {
        throw new UnsupportedOperationException("TODO");
    }
}
