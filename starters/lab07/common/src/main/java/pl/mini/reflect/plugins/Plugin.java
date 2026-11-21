package pl.mini.reflect.plugins;

public interface Plugin {
    String name();
    String apply(String input);
}
