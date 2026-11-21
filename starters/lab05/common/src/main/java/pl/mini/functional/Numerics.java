package pl.mini.functional;

import java.util.function.DoubleUnaryOperator;

// STAGE A5
public final class Numerics {
    private Numerics() { }

    public static DoubleUnaryOperator derivative(DoubleUnaryOperator f, double h) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double newton(DoubleUnaryOperator f, DoubleUnaryOperator df,
                                double x0, double eps, int maxIter) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double newton(DoubleUnaryOperator f, double x0) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double sqrt(double a) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double cubeRoot(double a) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double solveCosEqualsX() {
        throw new UnsupportedOperationException("TODO");
    }
}
