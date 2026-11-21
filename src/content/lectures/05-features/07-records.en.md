---
title: Records
description: Records as immutable data carriers, what the compiler generates, equality semantics, the canonical and compact constructors, "withers", custom members, restrictions, records with generics and interfaces, local records instead of anonymous types.
---

## Records (Java 16)

A record is a special kind of class intended for **immutable data**. It lets you declare a type in one line, without boilerplate:

```java
public record Person(String firstName, String lastName) { }
```

The parentheses hold the record's **components**. For each component the compiler generates a `private final` field and a public **accessor** with the same name (`firstName()`, not `getFirstName()`). In addition, a **canonical constructor** with all components is generated, as well as `equals`, `hashCode` and `toString`. The class itself is implicitly `final` and extends `java.lang.Record`.

The compiler effectively creates the following class:

```java
public final class Person extends java.lang.Record {
    private final String firstName;
    private final String lastName;

    public Person(String firstName, String lastName) {     // the canonical constructor
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String firstName() { return firstName; }
    public String lastName() { return lastName; }

    @Override
    public boolean equals(Object o) {
        return this == o
                || o instanceof Person other
                && Objects.equals(firstName, other.firstName)
                && Objects.equals(lastName, other.lastName);
    }

    @Override
    public int hashCode() { return Objects.hash(firstName, lastName); }

    @Override
    public String toString() { return "Person[firstName=" + firstName + ", lastName=" + lastName + "]"; }
}
```

> [!NOTE]
> In reality `equals`, `hashCode` and `toString` are not implemented as direct code but via `invokedynamic` and `ObjectMethods.bootstrap`: the JVM generates them at run time. This does not change the behavior but keeps the bytecode compact.

### Equality Semantics

Records are compared **by value**: `equals` checks that both objects have the same class and all components are equal (references via `equals`, primitives by comparing values; `float`/`double` are compared as with `Float.compare`).

```java
var john = new Person("John", "Doe");
var doe = new Person("John", "Doe");

System.out.println(john.equals(doe));   // true
System.out.println(john == doe);        // false: the == operator always compares references
System.out.println(john);               // Person[firstName=John, lastName=Doe]

Set<Person> people = new HashSet<>(List.of(john, doe));
System.out.println(people.size());      // 1
```

> [!WARNING]
> Record equality is shallow: if a component is an array, the **references** to the arrays are compared, not the contents. For collection components the collections' `equals` works (by contents), so it is better to use `List` instead of arrays in records.

## Constructors

### The Compact Constructor

Most often you only need to **validate or normalize** the arguments. For that there is the **compact constructor**: without a parameter list and without field assignments. Its code runs before the automatic assignment, and the parameters can be changed in it.

```java
public record Range(int from, int to) {
    public Range {                                  // a compact canonical constructor
        if (from > to)
            throw new IllegalArgumentException("from > to: %d > %d".formatted(from, to));
    }
}

public record Product(String name, BigDecimal price, List<String> tags) {
    public Product {
        Objects.requireNonNull(name);
        name = name.strip();                        // normalization: assign to the parameter
        price = price.setScale(2, RoundingMode.HALF_UP);
        tags = List.copyOf(tags);                   // a defensive copy: the record is truly immutable
    }
}
```

### Additional Constructors

Other constructors can be declared too, but each must delegate to the canonical one via `this(...)`:

```java
public record Point(double x, double y) {
    public static final Point ORIGIN = new Point(0, 0);

    public Point() { this(0, 0); }

    public static Point polar(double r, double angle) {     // a static factory
        return new Point(r * Math.cos(angle), r * Math.sin(angle));
    }
}
```

## "Changing" without Changing: Withers

Records are immutable. To get a copy with a different value of one component, "wither" methods are declared that return a new object:

```java
public record Person(String firstName, String lastName, int age) {
    public Person withFirstName(String firstName) { return new Person(firstName, lastName, age); }
    public Person withAge(int age) { return new Person(firstName, lastName, age); }
}

var john = new Person("John", "Doe", 30);
var jane = john.withFirstName("Jane").withAge(0);

System.out.println(john);   // Person[firstName=John, lastName=Doe, age=30]
System.out.println(jane);   // Person[firstName=Jane, lastName=Doe, age=0]
```

> [!NOTE]
> A separate "derived creation" syntax has been proposed for records (JEP 468, `john with { firstName = "Jane"; }`). Until it is available in stable versions, withers are written by hand or generated with annotations (e.g. Lombok's `@With`).

## Custom Members

The body of a record can contain:

* instance and static methods;
* static fields (but **not** instance fields: all state is given by the components);
* nested types;
* custom implementations of the accessors, `equals`, `hashCode` and `toString`: if they are declared explicitly, the compiler does not generate its own.

```java
public record Money(BigDecimal amount, String currency) implements Comparable<Money> {
    public Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(amount.add(other.amount), currency);
    }

    @Override
    public int compareTo(Money other) {
        requireSameCurrency(other);
        return amount.compareTo(other.amount);
    }

    @Override
    public String toString() { return amount + " " + currency; }    // instead of Money[amount=..., currency=...]

    private void requireSameCurrency(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("Different currencies");
    }
}
```

### Restrictions

* a record cannot extend a class (it implicitly extends `Record`) and is `final`;
* instance fields cannot be declared, only components;
* component fields are always `final`: there are no setters;
* an accessor must be `public` and return exactly the component's type.

Records can implement interfaces, be generic, nested (then they are implicitly `static`) and **local** (declared inside a method).

```java
public record Pair<A, B>(A first, B second) {
    public static <A, B> Pair<A, B> of(A first, B second) { return new Pair<>(first, second); }
}

sealed interface Shape permits Circle, Rect { double area(); }
record Circle(double r) implements Shape { public double area() { return Math.PI * r * r; } }
record Rect(double w, double h) implements Shape { public double area() { return w * h; } }
```

The combination of a sealed interface and records gives **algebraic data types**, which are conveniently processed with pattern matching (the "Pattern Matching" page).

## Local Records Instead of Anonymous Types

Temporary objects needed only inside one method (e.g. intermediate results of data processing) are conveniently described with **local records**. They have a name, are type-safe, and value equality works for them out of the box.

```java
List<String> topMovies(List<Rating> ratings, Map<Integer, Movie> movies) {
    record MovieAverage(int movieId, double average) { }      // a local record

    return ratings.stream()
            .collect(Collectors.groupingBy(Rating::movieId, Collectors.averagingDouble(Rating::score)))
            .entrySet().stream()
            .map(e -> new MovieAverage(e.getKey(), e.getValue()))
            .filter(ma -> ma.average() > 8)
            .sorted(Comparator.comparingDouble(MovieAverage::average).reversed())
            .map(ma -> movies.get(ma.movieId()).title() + " (" + ma.average() + ")")
            .toList();
}
```

A local record is implicitly `static`: it has no access to the local variables and instance fields of the enclosing method.

> [!TIP]
> Records are ideal for DTOs (data passed between application layers or over the network), map keys, method results with several values and immutable domain values. Serialization libraries (Jackson, Gson) and JPA projections support records directly.
