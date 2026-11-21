package pl.mini.functional;

import java.util.Random;
import java.util.function.DoubleSupplier;
import java.util.function.Supplier;

// STAGE A4
public final class Factories {
    private Factories() { }

    public record Point(double x, double y) { }

    public static DoubleSupplier randomInRange(Random rng, double from, double to) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Supplier<Point> randomPoint(Random rng, double from, double to) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double monteCarloPi(Supplier<Point> points, int samples) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double monteCarloPi(Supplier<Point> points) {
        throw new UnsupportedOperationException("TODO");
    }
}
