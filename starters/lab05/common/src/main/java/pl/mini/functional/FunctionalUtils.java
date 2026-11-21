package pl.mini.functional;

import java.util.Optional;
import java.util.function.BinaryOperator;

// STAGE A3
public final class FunctionalUtils {
    private FunctionalUtils() { }

    public static <T> T reduce(Iterable<? extends T> items, T identity, BinaryOperator<T> op) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T> Optional<T> reduce(Iterable<? extends T> items, BinaryOperator<T> op) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T extends Comparable<? super T>> Optional<T> max(Iterable<? extends T> items) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T extends Comparable<? super T>> Optional<T> min(Iterable<? extends T> items) {
        throw new UnsupportedOperationException("TODO");
    }
}
