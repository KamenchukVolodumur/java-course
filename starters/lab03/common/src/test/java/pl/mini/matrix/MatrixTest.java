package pl.mini.matrix;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MatrixTest {

    private static Matrix fill(Matrix m, double... values) {
        for (int i = 0; i < m.getRows(); i++)
            for (int j = 0; j < m.getColumns(); j++)
                m.set(i, j, values[i * m.getColumns() + j]);
        return m;
    }

    // ===== STAGE 1 =====

    @Test
    @Tag("stage1")
    void newMatrixIsFilledWithZeros() {
        assertEquals(0.0, new DenseMatrix(2, 2).get(1, 1));
        assertEquals(0.0, new SparseMatrix(2, 2).get(1, 1));
    }

    @Test
    @Tag("stage1")
    void negativeDimensionsAreRejected() {
        assertThrows(IllegalArgumentException.class, () -> new SparseMatrix(2, -1));
        assertThrows(IllegalArgumentException.class, () -> new DenseMatrix(-3, 2));
    }

    @Test
    @Tag("stage1")
    void bothImplementationsCheckIndexes() {
        Matrix d = new DenseMatrix(2, 2), s = new SparseMatrix(2, 2);
        for (Matrix m : new Matrix[]{d, s}) {
            assertThrows(IndexOutOfBoundsException.class, () -> m.get(-1, 0));
            assertThrows(IndexOutOfBoundsException.class, () -> m.get(0, 2));
            assertThrows(IndexOutOfBoundsException.class, () -> m.set(2, 0, 1.0));
        }
    }

    @Test
    @Tag("stage1")
    void settingZeroRemovesTheEntry() {
        SparseMatrix s = new SparseMatrix(3, 3);
        s.set(1, 1, 7);
        s.set(2, 0, 1);
        assertEquals(2, s.nonZeroCount());
        s.set(1, 1, 0);
        assertEquals(1, s.nonZeroCount());
        assertEquals(0.0, s.get(1, 1));
    }

    @Test
    @Tag("stage1")
    void toStringHasNoTrailingLineBreak() {
        assertEquals("[1.50, -2.00]", fill(new DenseMatrix(1, 2), 1.5, -2).toString());
    }

    // ===== STAGE 2 =====

    @Test
    @Tag("stage2")
    void transposeKeepsTheTypeAndDoesNotChangeTheOriginal() {
        Matrix s = fill(new SparseMatrix(2, 3), 1, 0, 2, 0, 3, 0);
        Matrix t = s.transpose();

        assertInstanceOf(SparseMatrix.class, t);
        assertEquals(3, t.getRows());
        assertEquals(2.0, t.get(2, 0));
        assertEquals(2.0, s.get(0, 2));
        assertInstanceOf(DenseMatrix.class, new DenseMatrix(1, 2).transpose());
    }

    @Test
    @Tag("stage2")
    void normIsFrobenius() {
        assertEquals(5.0, fill(new SparseMatrix(2, 2), 3, 0, 0, 4).norm(), 1e-12);
        assertEquals(5.0, fill(new DenseMatrix(2, 2), 3, 0, 0, -4).norm(), 1e-12);
    }

    @Test
    @Tag("stage2")
    void equalsIsSymmetricAcrossImplementations() {
        Matrix d = fill(new DenseMatrix(2, 2), 1, 0, 0, 2);
        Matrix s = fill(new SparseMatrix(2, 2), 1, 0, 0, 2);

        assertEquals(d, s);
        assertEquals(s, d);
        assertEquals(d.hashCode(), s.hashCode());
    }

    @Test
    @Tag("stage2")
    void matricesOfDifferentSizeOrValuesAreNotEqual() {
        assertNotEquals(new DenseMatrix(2, 2), new DenseMatrix(2, 3));
        assertNotEquals(fill(new DenseMatrix(1, 2), 1, 2), fill(new SparseMatrix(1, 2), 1, 3));
        assertNotEquals(new DenseMatrix(1, 1), null);
        assertNotEquals(new DenseMatrix(1, 1), "matrix");
    }

    @Test
    @Tag("stage2")
    void identityOverwritesOldValues() {
        Matrix d = fill(new DenseMatrix(2, 2), 5, 6, 7, 8);
        d.identity();
        assertEquals(fill(new SparseMatrix(2, 2), 1, 0, 0, 1), d);

        Matrix s = fill(new SparseMatrix(2, 2), 5, 6, 7, 8);
        s.identity();
        assertEquals(2, ((SparseMatrix) s).nonZeroCount());
    }

    // ===== STAGE 3 =====

    @Test
    @Tag("stage3")
    void operationsDoNotModifyOperands() {
        Matrix a = fill(new DenseMatrix(2, 2), 1, 2, 3, 4);
        Matrix b = fill(new SparseMatrix(2, 2), 0, 1, 1, 0);
        a.add(b); a.subtract(b); a.multiply(b); a.scale(3);

        assertEquals(fill(new DenseMatrix(2, 2), 1, 2, 3, 4), a);
        assertEquals(fill(new DenseMatrix(2, 2), 0, 1, 1, 0), b);
    }

    @Test
    @Tag("stage3")
    void resultTypeIsDeterminedByThis() {
        Matrix a = new DenseMatrix(2, 2), b = new SparseMatrix(2, 2);
        assertInstanceOf(DenseMatrix.class, a.add(b));
        assertInstanceOf(SparseMatrix.class, b.subtract(a));
        assertInstanceOf(SparseMatrix.class, b.scale(2));
    }

    @Test
    @Tag("stage3")
    void subtractAndMultiplyOfRectangularMatrices() {
        Matrix a = fill(new DenseMatrix(2, 3), 1, 2, 3, 4, 5, 6);
        Matrix b = fill(new DenseMatrix(3, 1), 1, 0, -1);

        assertEquals(fill(new DenseMatrix(2, 1), -2, -2), a.multiply(b));
        assertEquals(new DenseMatrix(2, 3), a.subtract(a));
    }

    @Test
    @Tag("stage3")
    void sizeMismatchMessages() {
        Matrix a = new DenseMatrix(2, 2), c = new SparseMatrix(3, 3);
        assertEquals("add: 2x2 + 3x3", assertThrows(IllegalArgumentException.class, () -> a.add(c)).getMessage());
        assertEquals("subtract: 2x2 - 3x3", assertThrows(IllegalArgumentException.class, () -> a.subtract(c)).getMessage());
        assertEquals("multiply: 2x2 * 3x3", assertThrows(IllegalArgumentException.class, () -> a.multiply(c)).getMessage());
    }

    // ===== STAGE 4 =====

    @Test
    @Tag("stage4")
    void pseudoInverseOfDiagonalMatrix() {
        Matrix m = fill(new SparseMatrix(3, 3), 2, 0, 0, 0, 4, 0, 0, 0, 0.5);
        Matrix inv = MatrixAlgorithms.pseudoInverse(m, 1000);

        assertInstanceOf(SparseMatrix.class, inv);
        assertEquals(0.5, inv.get(0, 0), 1e-6);
        assertEquals(0.25, inv.get(1, 1), 1e-6);
        assertEquals(2.0, inv.get(2, 2), 1e-6);
    }

    @Test
    @Tag("stage4")
    void pseudoInverseRejectsBadArguments() {
        assertThrows(IllegalArgumentException.class, () -> MatrixAlgorithms.pseudoInverse(new DenseMatrix(2, 3), 10));
        Matrix ok = fill(new DenseMatrix(1, 1), 2);
        assertThrows(IllegalArgumentException.class, () -> MatrixAlgorithms.pseudoInverse(ok, 0));
    }
}
