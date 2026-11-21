package pl.mini.exchange;

// STAGE 4
public final class Simulation {
    private Simulation() { }

    public record Result(int orders, long trades) { }

    public static Result run(OrderBook book, int traders, int ordersPerTrader, long seed) throws InterruptedException {
        throw new UnsupportedOperationException("TODO");
    }
}
