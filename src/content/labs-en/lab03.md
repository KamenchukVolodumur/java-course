---
title: Lab 03: Classes, Inheritance and Encapsulation — a Matrix Library
description: An abstract Matrix class and two implementations: a dense one (an array) and a sparse one (a Map of only the non-zero elements). Invariants and exceptions, equals/hashCode/toString, the getInstance template method, operations without operator overloading and iterative computation of the pseudo-inverse.
---

## Before You Start

> [!NOTE]
> **Lectures:** 03.5 "The Object Class", 04.1 "Classes", 04.2 "Inheritance", 04.4 "Access Modifiers" · **Time:** 3 h · **Points:** 10

You will write a small library of matrix operations. The main idea is **shared logic in an abstract class**, with the data storage method in the subclasses.

```text
src/main/java/pl/mini/matrix/
├── Matrix.java              (abstract)
├── DenseMatrix.java
├── SparseMatrix.java
├── MatrixAlgorithms.java
└── Main.java                (given)
```

### Rules

* In `Main.java`, uncomment the `STAGE N` block after finishing stage N. The output must match the expected one **exactly**.
* Class fields are `private` or `protected` (only if a subclass really needs access).
* Numbers are of type `double`.

> [!CAUTION]
> Using external linear algebra libraries is forbidden. In the `Matrix` base class it is forbidden to use `instanceof`, casts to `DenseMatrix`/`SparseMatrix` and any references to concrete subclasses: that is the whole point of the task.

## A Quick Theory Recap

### An Abstract Class with a Template Method

```java
public abstract class Shape {
    public abstract double area();                    // implemented by subclasses

    public final String describe() {                  // shared logic that relies on the abstraction
        return "%s with area %.2f".formatted(getClass().getSimpleName(), area());
    }
}
```

### An Exception Instead of a "Silent" Error

```java
public double get(int r, int c) {
    checkIndex(r, c);                                // IndexOutOfBoundsException
    return data[r][c];
}

protected final void checkIndex(int r, int c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols)
        throw new IndexOutOfBoundsException("index (%d, %d) is outside the %dx%d matrix".formatted(r, c, rows, cols));
}
```

### A Composite Map Key — a Record

```java
private record Cell(int row, int col) { }            // equals and hashCode are generated automatically
private final Map<Cell, Double> values = new HashMap<>();
```

### Locale-Independent Formatting

```java
String.format(Locale.ROOT, "%.2f", 3.14159);   // "3.14"; in pl_PL without Locale.ROOT it would be "3,14"
```

### equals between Different Subclasses

Matrices are equal if their sizes and all elements are equal, **regardless of the storage method**. That is why `equals` is implemented in `Matrix` through `get`, not through `getClass()`. And `hashCode` must be consistent: equal matrices give an equal hash, so it too must depend only on the values.

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
[1.00, 0.00, 2.00]
[0.00, 3.00, 0.00]
2x3, nonzero=3
OK: dimensions must be positive: 0x2
OK: index (2, 0) is outside the 2x3 matrix
[1.00, 0.00]
[0.00, 3.00]
[2.00, 0.00]
norm=3.7417
true true
[1.00, 0.00, 0.00]
[0.00, 1.00, 0.00]
[0.00, 0.00, 1.00]
OK: identity: the 2x3 matrix is not square
[1.00, 3.00]
[4.00, 4.00]
[2.00, 1.00]
[4.00, 3.00]
SparseMatrix
[0.50, 1.00]
[1.50, 2.00]
OK: multiply: 2x3 * 2x2
[0.60, -0.70]
[-0.20, 0.40]
true
```

## Stage 1: The Class Hierarchy (3 pts)

### Matrix (abstract)

* `private final int rows, cols`; the constructor `protected Matrix(int rows, int cols)`. If a dimension is ≤ 0 → `IllegalArgumentException("dimensions must be positive: RxC")`.
* `public int getRows()`, `public int getColumns()`.
* `public abstract double get(int row, int col)` and `public abstract void set(int row, int col, double value)` — Java has no indexers, so element access goes through methods.
* `protected final void checkIndex(int row, int col)` — `IndexOutOfBoundsException("index (r, c) is outside the RxC matrix")`. Both implementations **must** call it.
* `toString()`: each row is `[a, b, c]`, numbers in the `%.2f` format with `Locale.ROOT`, rows separated by `\n`, without a line break at the end. Use a `StringBuilder`.

### DenseMatrix

Stores all elements in a `double[][]`. A new matrix is filled with zeros.

### SparseMatrix

Stores **only the non-zero** elements in a `Map<Cell, Double>`, where `Cell` is a private nested record. This saves memory when most elements are zero.

* `set(r, c, 0.0)` must **remove** the entry from the map rather than store a zero.
* `public int nonZeroCount()` — the number of stored elements.
* `get` for an absent key returns `0.0` (`getOrDefault`).

> [!TIP]
> Why is `Cell` a record and not a string `"r,c"`? A string would have to be built and parsed every time, while a record gives correct `equals`/`hashCode` for free and keeps the types.

## Stage 2: Transformations, the Norm, Equality (2 pts)

Add abstract methods to `Matrix` and implement them in the subclasses:

* `void identity()` — turns **this** matrix into an identity matrix. Not square → `IllegalStateException("identity: the RxC matrix is not square")`.
* `Matrix transpose()` — a **new** matrix of the same type.
* `double norm()` — the Frobenius norm: `√(Σ aᵢⱼ²)`.

> [!IMPORTANT]
> In `SparseMatrix` the `norm()` and `transpose()` methods must run in **O(K)**, where K is the number of non-zero elements, not in O(rows·cols). Traverse `values.entrySet()`, not all the indexes.

### equals and hashCode — in Matrix, Shared by Both Types

* `equals`: the same size and `get(i, j)` equal for all i, j (compared with `Double.compare(x, y) == 0`).
* `hashCode`: must depend only on the dimensions and the **non-zero** values with their positions. For example, the sum of `31 * (i * cols + j) ^ Double.hashCode(v)` over the non-zero elements plus the dimensions. Otherwise the dense and sparse versions of the same matrix would give different hashes.

> [!WARNING]
> Check the contract: `d.equals(s)` and `s.equals(d)` must give the same result (symmetry), and equal objects the same `hashCode`.

## Stage 3: Operations without Operator Overloading (3 pts)

Java has **no** operator overloading, so `a + b` cannot be written for matrices; methods are used instead.

Add to `Matrix`:

```java
protected abstract Matrix getInstance(int rows, int cols);   // a new empty matrix of THE SAME type

public Matrix add(Matrix other);
public Matrix subtract(Matrix other);
public Matrix multiply(Matrix other);
public Matrix scale(double factor);
```

* `add`, `subtract`, `multiply` and `scale` are implemented **once in Matrix** through `get`, `set` and `getInstance`. The type of the result is determined by `this`: `sparse.multiply(dense)` gives a `SparseMatrix`.
* A dimension mismatch → `IllegalArgumentException` with the message `"add: 2x2 + 3x3"`, `"subtract: ..."` or `"multiply: 2x3 * 2x2"`.
* The operations **do not modify** the operands.

This is the **Template Method** pattern: the multiplication algorithm is shared, while creating the result ("which matrix to make") is delegated to the subclass.

> [!TIP]
> Extra (no points): override `multiply` in `SparseMatrix` so that it works only with the non-zero elements of the left operand. Compare the time for a 2000×2000 matrix with 1% non-zero elements.

## Stage 4: The Pseudo-Inverse (2 pts)

In the `MatrixAlgorithms` class (final, a private constructor), implement:

```java
public static Matrix pseudoInverse(Matrix a, int maxIter)
```

The Ben-Israel (Newton–Schulz) iterative method. The tolerance is **ε = 10⁻⁷**. We test on square non-singular matrices.

1. **I** — the identity matrix of size `a.getRows()`. Create it with `a.getInstance(n, n)`. The method is `protected`, but `MatrixAlgorithms` lives in the same package, and in Java `protected` includes package visibility (the "Access Modifiers" page).
2. **α** = 1 / ‖A‖².
3. **A₁** = α · Aᵀ.
4. For i = 1, …, maxIter:
   * **A₂** = A₁ + A₁ · (I − A · A₁);
   * if ‖A₂ − A₁‖ < ε — stop;
   * **A₁** = A₂.
5. Return **A₂**.

A non-square matrix → `IllegalArgumentException`, `maxIter <= 0` → `IllegalArgumentException`.

> [!NOTE]
> The method converges because α < 2/σ²max (‖A‖_F² ≥ σ²max). Near the solution the error decreases **quadratically**: ~15 iterations are enough for the matrix from `Main`.

Commit, tag it `lab03` and push.
