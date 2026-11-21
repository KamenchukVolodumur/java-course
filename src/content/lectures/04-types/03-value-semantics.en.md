---
title: Value Objects
description: How value types are modeled in Java without struct — immutable classes and records, value-based classes of the standard library, object identity, data layout in memory and choosing between a class, a record and primitives.
---

## Identity and Value

Every object in Java has an **identity**: two objects with the same contents are still different, and `==` tells them apart. For some types identity is natural: `Customer`, `Order`, `Window` are concrete entities that have a history and cannot be accidentally "copied". For others it is superfluous: two points `(1, 2)`, two amounts "10.00 zł" or two dates `2025-03-14` are simply **equal values**.

Java does not yet have user-defined value types (like `struct`): everything a programmer declares is a reference type. Value semantics are modeled like this:

* the object is **immutable**: its state cannot be changed after creation, so a shared reference behaves like a copy;
* **equality by contents**: `equals` and `hashCode` are overridden;
* operations return **new** objects instead of modifying existing ones.

```java
public record Point(double x, double y) {
    public Point translate(double dx, double dy) {
        return new Point(x + dx, y + dy);      // a new object, the original does not change
    }
}

Point p1 = new Point(3, -5);
Point p2 = p1;                  // the reference is copied...
p2 = p2.translate(-2, 4);       // ...but the shared object cannot be changed
System.out.println(p1);         // Point[x=3.0, y=-5.0]
System.out.println(p2);         // Point[x=1.0, y=-1.0]
System.out.println(new Point(1, -1).equals(p2));   // true: equality by value
```

For an immutable object the difference between "copying the value" and "copying the reference" disappears: no holder of a reference can change the data behind another's back.

## Records

A **record** (Java 16) is the shortest way to declare an immutable value type. The compiler generates `private final` fields, a canonical constructor, accessors, and `equals`, `hashCode` and `toString` over all components. Records are implicitly `final` and cannot extend other classes (but can implement interfaces).

```java
public record Money(BigDecimal amount, String currency) {
    public Money {                                         // a compact constructor: invariants
        Objects.requireNonNull(currency);
        amount = amount.setScale(2, RoundingMode.HALF_UP); // normalization before the fields are assigned
    }

    public Money plus(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("Different currencies");
        return new Money(amount.add(other.amount), currency);
    }
}
```

Records are covered in detail on the "Records" page of the "Language Features" chapter.

## Value-Based Classes of the Standard Library

Many JDK classes are documented as **value-based**: the wrappers (`Integer`, `Double` …), `Optional`, all `java.time` classes (`LocalDate`, `Instant`, `Duration`), `List.of(...)` and so on. For them the rule is: **do not rely on identity**.

* do not compare them with `==` (only `equals`);
* do not synchronize on them (`synchronized (anInteger)`);
* do not use `System.identityHashCode` and `IdentityHashMap` with them.

```java
LocalDate a = LocalDate.of(2025, 3, 14);
LocalDate b = LocalDate.parse("2025-03-14");
System.out.println(a.equals(b));   // true
System.out.println(a == b);        // false (or true — unspecified, do not rely on it)

Integer x = 1000, y = 1000;
System.out.println(x == y);        // false: two different objects
```

> [!NOTE]
> Project **Valhalla** (JEP 401, in preview) adds **value classes** to Java: classes without identity that the JVM can store "flat", without a separate object on the heap. The JDK's value-based classes will become such classes in the future, so the rules above are worth following already today.

## Memory Layout

The difference between primitives and objects shows in performance when there is a lot of data.

```java
double[] xs = new double[1_000_000];          // one contiguous block: 8 MB
Point[] points = new Point[1_000_000];        // an array of references + a million separate objects
```

```text
double[]                          Point[]
┌─────┬─────┬─────┬───           ┌───┬───┬───┬───
│ 1.0 │ 2.5 │ 0.3 │ ...          │ ● │ ● │ ● │ ...
└─────┴─────┴─────┴───           └─┼─┴─┼─┴─┼─┴───
                                   ▼   ▼   ▼
                                 [header|x|y] [header|x|y] ...  (scattered across the heap)
```

Every object has a **header** (12–16 bytes on a 64-bit JVM) and alignment to 8 bytes, so a `Point` with two `double`s takes ~32 bytes instead of 16, plus 4–8 bytes for the reference in the array. Traversing an array of objects also means jumping around memory, which uses the CPU cache worse.

If performance is critical (computations, simulations, games), a **structure of arrays** approach is used instead of an "array of structures":

```java
final class Particles {                        // instead of Particle[]
    final double[] x, y, vx, vy;

    Particles(int n) {
        x = new double[n]; y = new double[n];
        vx = new double[n]; vy = new double[n];
    }

    void step(double dt) {
        for (int i = 0; i < x.length; i++) {   // sequential access, friendly to the cache and SIMD
            x[i] += vx[i] * dt;
            y[i] += vy[i] * dt;
        }
    }
}
```

> [!TIP]
> Do not optimize prematurely. The JIT can avoid allocating short-lived objects that do not escape the method (**escape analysis**), and modern garbage collectors handle young objects very quickly. Write clear code with records first, and switch to primitive arrays when profiling shows a bottleneck.

## What to Choose

| Situation | Choice |
| --- | --- |
| An entity with identity and a lifecycle (`Customer`, `Order`, `Connection`) | an ordinary class, equality by identity or by id |
| A small immutable value (`Point`, `Money`, `DateRange`, a DTO) | `record` |
| A hierarchy with implementation inheritance is needed | a class (records cannot be extended) |
| Millions of numbers in "hot" code | primitives and arrays of primitives |
| A single value from the library (`LocalDate`, `Duration`, `BigDecimal`) | a value-based class, compared with `equals`/`compareTo` |
