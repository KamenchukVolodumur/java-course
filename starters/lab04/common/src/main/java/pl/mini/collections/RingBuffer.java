package pl.mini.collections;

import java.util.Iterator;

// STAGE 1 (and the iterator + toString in STAGE 2)
public class RingBuffer<T> implements Iterable<T> {

    public RingBuffer(int capacity) {
        throw new UnsupportedOperationException("TODO");
    }

    public void add(T item) {
        throw new UnsupportedOperationException("TODO");
    }

    public T get(int index) {
        throw new UnsupportedOperationException("TODO");
    }

    public int size() {
        throw new UnsupportedOperationException("TODO");
    }

    public int capacity() {
        throw new UnsupportedOperationException("TODO");
    }

    public boolean isFull() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public Iterator<T> iterator() {
        throw new UnsupportedOperationException("TODO");
    }

    // TODO (STAGE 2): override toString()
}
