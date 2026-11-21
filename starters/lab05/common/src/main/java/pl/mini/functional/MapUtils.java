package pl.mini.functional;

import java.util.Map;
import java.util.function.BiFunction;

// STAGE A2
public final class MapUtils {
    private MapUtils() { }

    public static <K, V> V addOrUpdate(Map<K, V> map, K key, V addValue,
                                       BiFunction<? super K, ? super V, ? extends V> update) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Map<String, Integer> countWords(String text) {
        throw new UnsupportedOperationException("TODO");
    }
}
