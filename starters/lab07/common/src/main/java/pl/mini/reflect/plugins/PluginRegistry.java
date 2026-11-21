package pl.mini.reflect.plugins;

import java.util.List;
import java.util.function.UnaryOperator;

// STAGE 4
public final class PluginRegistry {

    public static PluginRegistry load(List<String> classNames) {
        throw new UnsupportedOperationException("TODO");
    }

    public List<Plugin> plugins() {
        throw new UnsupportedOperationException("TODO");
    }

    public List<String> errors() {
        throw new UnsupportedOperationException("TODO");
    }

    public String version(Plugin p) {
        throw new UnsupportedOperationException("TODO");
    }

    public UnaryOperator<String> pipeline(String... names) {
        throw new UnsupportedOperationException("TODO");
    }
}
