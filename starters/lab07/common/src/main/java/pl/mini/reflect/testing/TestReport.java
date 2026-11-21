package pl.mini.reflect.testing;

import java.util.List;

// STAGE 1
public record TestReport(int passed, int failed, int skipped, List<String> lines) {

    @Override
    public String toString() {
        throw new UnsupportedOperationException("TODO");
    }
}
