package pl.mini.exchange;

// STAGE 2
public record BookSnapshot(Long bestBid, int bidQty, Long bestAsk, int askQty) {

    public boolean crossed() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String toString() {
        throw new UnsupportedOperationException("TODO");
    }
}
