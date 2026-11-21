---
title: Arrays
description: Arrays as fixed-size objects, initialization, bounds checking, the Arrays class, copying and fragments, covariance and ArrayStoreException, multidimensional arrays.
---

## Arrays

An array is an **object** of a reference type that stores a fixed number of elements of one type. An array type is written as the element type followed by square brackets: `int[]`, `String[]`. Elements are indexed from 0.

The array length is given by the `length` field (not a method!). Once created, the size of an array **cannot be changed**: to "grow" an array, you create a new one and copy the elements (`Arrays.copyOf`).

Elements without assigned values receive default values: `0`, `0.0`, `false`, `'\u0000'`, and `null` for reference types.

All element accesses are checked at run time: going out of bounds throws `ArrayIndexOutOfBoundsException`, a negative size at creation throws `NegativeArraySizeException`.

```java
int[] primes = new int[] {2, 3, 5, 7, 11};
char[] vowels = {'a', 'e', 'i', 'o', 'u'};       // the short form only in a declaration
float[] data = new float[10];                    // ten zeros
String[] names = new String[3];                  // [null, null, null]

System.out.println("Length: " + primes.length);
for (int i = 0; i < primes.length; i++) {
    System.out.println(primes[i]);
}
for (int p : primes) {                           // for-each
    System.out.println(p);
}

// primes[5] = 13;      // ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5
// int[] x = {1, 2};  x = {3, 4};    // ERROR: {...} only in a declaration
int[] x = {1, 2};
x = new int[] {3, 4};                            // this works anywhere, e.g. as an argument
```

The `int x[]` syntax (brackets after the name, as in C) is also allowed, but not recommended.

### Arrays of Primitives and Arrays of References

* `int[]` — a contiguous block of numbers in memory. Access is very fast, and the data fits nicely in the CPU cache.
* `String[]`, `Person[]` — a contiguous block of **references**; the objects themselves are scattered across the heap. Every access also means following a reference.

```text
int[] {2, 3, 5}              String[] {"a", "b"}
┌───┬───┬───┐                ┌─────┬─────┐
│ 2 │ 3 │ 5 │                │  ●  │  ●  │
└───┴───┴───┘                └──┼──┴──┼──┘
                                ▼     ▼
                              "a"   "b"     (separate objects on the heap)
```

## The Arrays Class

Arrays have no useful methods (they inherit only the methods of `Object`). Operations on arrays are provided by the utility class `java.util.Arrays`:

```java
int[] a = {5, 3, 1, 4};

Arrays.sort(a);                                  // [1, 3, 4, 5]
int pos = Arrays.binarySearch(a, 4);             // 2 (the array must be sorted!)
Arrays.fill(a, 7);                               // [7, 7, 7, 7]
int[] bigger = Arrays.copyOf(a, 6);              // [7, 7, 7, 7, 0, 0]
int[] part = Arrays.copyOfRange(a, 1, 3);        // [7, 7]: [from, to)
System.out.println(Arrays.toString(bigger));     // "[7, 7, 7, 7, 0, 0]"
Arrays.equals(a, part);                          // compares CONTENTS
Arrays.hashCode(a);                              // a hash based on contents
int cmp = Arrays.compare(new int[]{1, 2}, new int[]{1, 3});   // < 0

String[] words = {"pear", "Fig", "apple"};
Arrays.sort(words);                                       // [Fig, apple, pear]: uppercase first
Arrays.sort(words, String.CASE_INSENSITIVE_ORDER);        // [apple, Fig, pear]
Arrays.sort(words, Comparator.comparing(String::length)); // by length

int sum = Arrays.stream(a).sum();                // streams (chapter "Collections")
Arrays.setAll(a, i -> i * i);                    // [0, 1, 4, 9]

System.arraycopy(a, 0, bigger, 2, a.length);     // the fastest copy; works with overlapping ranges too
```

> [!WARNING]
> The `equals` method of arrays is inherited from `Object`, so it compares **references**, and `toString` returns something like `[I@1b6d3586`. For arrays use `Arrays.equals`, `Arrays.toString` and `Arrays.deepToString` (for nested arrays).

### Array Fragments

Java has no slice syntax (`a[1:3]`). A fragment can be:

* **copied** into a new array: `Arrays.copyOfRange(a, 1, 3)`;
* obtained as a **view** without copying: `Arrays.asList(boxed).subList(1, 3)` for an array of references;
* processed with a stream: `Arrays.stream(a, 1, 3)`.

```java
Integer[] boxed = {2, 3, 5, 7};
List<Integer> view = Arrays.asList(boxed);   // a fixed-size list on top of the array
view.set(0, 100);
System.out.println(boxed[0]);                // 100: the change is visible in the array
List<Integer> lastTwo = view.subList(view.size() - 2, view.size());   // [5, 7]
// view.add(11);                             // UnsupportedOperationException: the size is fixed
```

## Array Covariance

Arrays in Java are **covariant**: if `String` is a subtype of `Object`, then `String[]` is a subtype of `Object[]`. This allows writing methods like `Arrays.sort(Object[])`, but breaks type safety, which then has to be checked at run time:

```java
String[] strings = {"a", "b"};
Object[] objects = strings;          // OK: covariance
objects[0] = 42;                     // ArrayStoreException: the array remembers it is a String[]
```

Every store into an array of references checks the actual element type. Generic collections (`List<String>`) are **invariant** and catch such errors already at compile time (chapter "Generics").

## Multidimensional Arrays

Java has no separate type for rectangular arrays. `int[][]` is an **array of arrays** (a jagged array): each row is a separate object, and rows can have different lengths.

```java
float[][] identity = {
        {1, 0, 0},
        {0, 1, 0},
        {0, 0, 1}
};

float[][] m3x4 = new float[3][4];            // 3 rows of 4 elements
int[][] triangle = new int[4][];             // rows not created yet: [null, null, null, null]
for (int i = 0; i < triangle.length; i++) {
    triangle[i] = new int[i + 1];            // lengths 1, 2, 3, 4
}

for (int i = 0; i < identity.length; i++) {
    for (int j = 0; j < identity[i].length; j++) {
        System.out.printf("m[%d][%d] = %.1f%n", i, j, identity[i][j]);
    }
}
System.out.println(Arrays.deepToString(identity));
```

```text
identity ──► ┌───┐
             │ ● ┼──► [1, 0, 0]
             │ ● ┼──► [0, 1, 0]
             │ ● ┼──► [0, 0, 1]
             └───┘
```

For large numeric matrices where speed matters, a **one-dimensional** array is often used and the index is computed manually: `data[i * cols + j]`. This way all data lies in one contiguous block and uses the CPU cache better.

## Variable Number of Arguments (varargs)

A method can take a variable number of arguments of one type. Inside the method such a parameter is an ordinary array:

```java
static int sum(int... numbers) {          // numbers has type int[]
    int total = 0;
    for (int n : numbers) total += n;
    return total;
}

sum();                    // 0: an empty array
sum(1, 2, 3);             // 6
sum(new int[] {4, 5});    // 9: an array can be passed directly
```

A varargs parameter must be the **last** in the parameter list. More on the "Method Parameters" page.
