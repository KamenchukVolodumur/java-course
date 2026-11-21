package pl.mini.exchange;

// STAGE 2
public record Order(long id, Side side, String trader, long price, int qty) {

    /** A new order with the next id from a global AtomicLong (starting at 1). qty <= 0 or price <= 0 -> IllegalArgumentException. */
    public static Order create(Side side, String trader, long price, int qty) {
        throw new UnsupportedOperationException("TODO");
    }
}
