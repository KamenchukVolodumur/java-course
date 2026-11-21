package pl.mini.matrix;

import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        // ===== STAGE 1 =====
        // Matrix d = new DenseMatrix(2, 3);
        // d.set(0, 0, 1); d.set(0, 2, 2); d.set(1, 1, 3);
        // System.out.println(d);
        // SparseMatrix s = new SparseMatrix(2, 3);
        // s.set(0, 0, 1); s.set(0, 2, 2); s.set(1, 1, 3);
        // s.set(1, 0, 5); s.set(1, 0, 0);
        // System.out.println(s.getRows() + "x" + s.getColumns() + ", nonzero=" + s.nonZeroCount());
        // try { new DenseMatrix(0, 2); }
        // catch (IllegalArgumentException e) { System.out.println("OK: " + e.getMessage()); }
        // try { d.get(2, 0); }
        // catch (IndexOutOfBoundsException e) { System.out.println("OK: " + e.getMessage()); }

        // ===== STAGE 2 =====
        // System.out.println(d.transpose());
        // System.out.printf(Locale.ROOT, "norm=%.4f%n", d.norm());
        // System.out.println(d.equals(s) + " " + (d.hashCode() == s.hashCode()));
        // Matrix id = new SparseMatrix(3, 3);
        // id.identity();
        // System.out.println(id);
        // try { d.identity(); }
        // catch (IllegalStateException e) { System.out.println("OK: " + e.getMessage()); }

        // ===== STAGE 3 =====
        // Matrix a = new DenseMatrix(2, 2);
        // a.set(0, 0, 1); a.set(0, 1, 2); a.set(1, 0, 3); a.set(1, 1, 4);
        // Matrix b = new SparseMatrix(2, 2);
        // b.set(0, 1, 1); b.set(1, 0, 1);
        // System.out.println(a.add(b));
        // System.out.println(a.multiply(b));
        // System.out.println(b.multiply(a).getClass().getSimpleName());
        // System.out.println(a.scale(0.5));
        // try { d.multiply(a); }
        // catch (IllegalArgumentException e) { System.out.println("OK: " + e.getMessage()); }

        // ===== STAGE 4 =====
        // Matrix m = new DenseMatrix(2, 2);
        // m.set(0, 0, 4); m.set(0, 1, 7); m.set(1, 0, 2); m.set(1, 1, 6);
        // Matrix inv = MatrixAlgorithms.pseudoInverse(m, 1000);
        // System.out.println(inv);
        // Matrix i2 = new DenseMatrix(2, 2);
        // i2.identity();
        // System.out.println(m.multiply(inv).subtract(i2).norm() < 1e-6);
    }
}
