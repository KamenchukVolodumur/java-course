package pl.mini.functional;

// STAGE A1
public class BinaryTree<T extends Comparable<? super T>> {

    @SafeVarargs
    public static <T extends Comparable<? super T>> BinaryTree<T> of(T... values) {
        throw new UnsupportedOperationException("TODO");
    }

    public void insert(T value) {
        throw new UnsupportedOperationException("TODO");
    }

    public void depthFirst(NodeVisitor<T> pre, NodeVisitor<T> in, NodeVisitor<T> post) {
        throw new UnsupportedOperationException("TODO");
    }

    public void printInOrder() {
        throw new UnsupportedOperationException("TODO");
    }
}
