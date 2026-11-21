package pl.mini.reflect.proxy;

import java.util.List;

// STAGE 5
public final class Proxies {
    private Proxies() { }

    public static <T> T logging(T target, Class<T> iface, List<String> log) {
        throw new UnsupportedOperationException("TODO");
    }

    public static <T> T cached(T target, Class<T> iface) {
        throw new UnsupportedOperationException("TODO");
    }
}
