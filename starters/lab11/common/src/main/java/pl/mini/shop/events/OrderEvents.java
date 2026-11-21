package pl.mini.shop.events;

import java.util.List;
import java.util.function.Consumer;

// STAGE 3
public class OrderEvents {

    public <E> void subscribe(Class<E> type, Consumer<? super E> listener) {
        throw new UnsupportedOperationException("TODO");
    }

    public void publish(Object event) {
        throw new UnsupportedOperationException("TODO");
    }

    public List<String> errors() {
        throw new UnsupportedOperationException("TODO");
    }
}
