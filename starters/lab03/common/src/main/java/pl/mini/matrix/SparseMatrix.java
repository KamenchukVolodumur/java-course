package pl.mini.matrix;

import java.util.HashMap;
import java.util.Map;

public class SparseMatrix extends Matrix {
    private record Cell(int row, int col) { }

    private final Map<Cell, Double> values = new HashMap<>();

    public SparseMatrix(int rows, int cols) {
        super(rows, cols);
    }

    @Override
    public double get(int row, int col) {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public void set(int row, int col, double value) {
        throw new UnsupportedOperationException("TODO");
    }

    public int nonZeroCount() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public void identity() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public Matrix transpose() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public double norm() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    protected Matrix getInstance(int rows, int cols) {
        throw new UnsupportedOperationException("TODO");
    }
}
