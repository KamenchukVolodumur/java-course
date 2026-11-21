package pl.mini.matrix;

public abstract class Matrix {
    private final int rows, cols;

    // ===== STAGE 1 =====

    protected Matrix(int rows, int cols) {
        throw new UnsupportedOperationException("TODO");
    }

    public int getRows() {
        throw new UnsupportedOperationException("TODO");
    }

    public int getColumns() {
        throw new UnsupportedOperationException("TODO");
    }

    public abstract double get(int row, int col);

    public abstract void set(int row, int col, double value);

    protected final void checkIndex(int row, int col) {
        throw new UnsupportedOperationException("TODO");
    }

    // TODO: override toString()

    // ===== STAGE 2 =====

    public abstract void identity();

    public abstract Matrix transpose();

    public abstract double norm();

    // TODO: override equals(Object) and hashCode()

    // ===== STAGE 3 =====

    protected abstract Matrix getInstance(int rows, int cols);

    public Matrix add(Matrix other) {
        throw new UnsupportedOperationException("TODO");
    }

    public Matrix subtract(Matrix other) {
        throw new UnsupportedOperationException("TODO");
    }

    public Matrix multiply(Matrix other) {
        throw new UnsupportedOperationException("TODO");
    }

    public Matrix scale(double factor) {
        throw new UnsupportedOperationException("TODO");
    }
}
