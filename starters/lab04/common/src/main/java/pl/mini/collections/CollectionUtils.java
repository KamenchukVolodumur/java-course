package pl.mini.collections;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;

// STAGE 3
public final class CollectionUtils {
    private CollectionUtils() { }

    public static <T extends Comparable<? super T>> T max(Iterable<? extends T> items) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T> T max(Iterable<? extends T> items, Comparator<? super T> cmp) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T> void copyInto(Iterable<? extends T> src, Collection<? super T> dst) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T> List<T> filter(Iterable<? extends T> src, Predicate<? super T> p) {
        throw new UnsupportedOperationException("TODO");
    }

    public static double sum(Iterable<? extends Number> numbers) {
        throw new UnsupportedOperationException("TODO");
    }
}
