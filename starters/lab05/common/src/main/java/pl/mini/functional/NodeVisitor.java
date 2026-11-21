package pl.mini.functional;

/** A callback for tree traversal: the node value and its depth (the root has depth 0). */
@FunctionalInterface
public interface NodeVisitor<T> {
    void visit(T value, int depth);
}
