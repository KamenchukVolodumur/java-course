---
title: Pattern Matching
description: Patterns in instanceof and switch, the type pattern, constants and null in switch, when guards instead of relational and logical patterns, record patterns and nesting, var and unnamed variables, exhaustiveness for sealed hierarchies, dominance of branches.
---

## Patterns

**Pattern matching** checks whether a value has a certain "shape" (type, structure) and at the same time extracts parts of it into new variables. In Java patterns are used in two places:

* in the **`instanceof`** operator: `expression instanceof pattern` returns a `boolean`;
* in a **`switch`** — statement or expression.

```java
static boolean isWorkingDay(Object date) {
    Objects.requireNonNull(date);
    if (date instanceof LocalDateTime dt) {
        date = dt.toLocalDate();
    }
    return switch (date) {
        case LocalDate d when d.getDayOfWeek() == DayOfWeek.SATURDAY
                           || d.getDayOfWeek() == DayOfWeek.SUNDAY -> false;
        case LocalDate d -> true;
        default -> throw new IllegalArgumentException("Not a date: " + date);
    };
}
```

## The Type Pattern

The most common pattern: it checks the run-time type of a value and, if the type matches, assigns the value to a new variable of that type.

```java
Object greeting = "Hello, World!";
if (greeting instanceof String message) {
    System.out.println(message.toLowerCase());
}

if (greeting instanceof String s && s.length() > 5) {   // the variable is available further in the condition
    System.out.println(s.substring(0, 5));
}
```

A pattern variable is available wherever the compiler can guarantee that the match succeeded (*flow scoping*), including after a negation:

```java
if (!(obj instanceof Integer n)) {
    return;
}
System.out.println(n + 1);       // here n is guaranteed to be defined
```

In a `switch`, type patterns allow choosing behavior by type:

```java
public abstract sealed class Vehicle permits Car, Truck, Bus { }
public final class Car extends Vehicle { }
public final class Truck extends Vehicle { final double load; Truck(double load) { this.load = load; } }
public final class Bus extends Vehicle { final int passengers; Bus(int p) { passengers = p; } }

static BigDecimal calculateToll(Vehicle vehicle) {
    return switch (vehicle) {
        case Car c -> new BigDecimal("2.00");
        case Truck t -> t.load > 100 ? new BigDecimal("17.50") : new BigDecimal("7.50");
        case Bus b -> new BigDecimal("5.00");
    };   // no default needed: Vehicle is sealed, all subtypes are listed
}
```

## Constants and null

A `switch` can also match **constants**: numbers, characters, strings, enum constants. Since Java 21, a switch over a reference type can explicitly handle **`null`** (without such a branch, a `switch` on `null` throws a `NullPointerException`).

```java
static BigDecimal groupTicketPrice(int visitorCount) {
    return switch (visitorCount) {
        case 0 -> BigDecimal.ZERO;
        case 1 -> new BigDecimal("12.0");
        case 2 -> new BigDecimal("20.0");
        case 3 -> new BigDecimal("27.0");
        case 4 -> new BigDecimal("32.0");
        default -> throw new IllegalArgumentException("Too many visitors: " + visitorCount);
    };
}

static String describe(String input) {
    return switch (input) {
        case null -> "no data";
        case "y", "yes" -> "yes";
        case "n", "no" -> "no";
        default -> "?";
    };
}
```

If `null` should be handled the same way as the remaining values, it is combined with `default`: `case null, default -> "?";`.

## when Guards

Java has no separate "relational" and "logical" patterns (`> 5`, `and`, `or`, `not`). The same expressiveness is provided by a **guard** — an arbitrary boolean condition after `when`, checked after the pattern has matched:

```java
static String calendarSeason(LocalDate date) {
    int m = date.getMonthValue();
    return switch (m) {
        case 3, 4, 5 -> "spring";
        case 6, 7, 8 -> "summer";
        case 9, 10, 11 -> "autumn";
        case 12, 1, 2 -> "winter";
        default -> throw new IllegalStateException();
    };
}

static String classify(Object input) {
    return switch (input) {
        case null -> throw new NullPointerException();
        case String s when s.length() > 5 -> s.substring(0, 5);
        case String s -> s;
        case Collection<?> c when c.size() > 5 -> "a collection of " + c.size() + " elements";
        case Collection<?> c -> c.toString();
        case Integer i when i >= 0 && i < 10 -> "a digit";
        default -> throw new IllegalArgumentException();
    };
}

static boolean isLetter(char c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');    // for simple conditions — ordinary operators
}
```

## Record Patterns

A **record pattern** (Java 21) not only checks the type but also **deconstructs** a record into its components and matches each component against its own pattern:

```java
record Point(int x, int y) { }

static String quadrant(Object o) {
    return switch (o) {
        case Point(int x, int y) when x == 0 && y == 0 -> "The origin";
        case Point(int x, int y) when x > 0 && y > 0 -> "First quadrant";
        case Point(int x, int y) when x < 0 && y > 0 -> "Second quadrant";
        case Point(int x, int y) when x < 0 && y < 0 -> "Third quadrant";
        case Point(int x, int y) when x > 0 && y < 0 -> "Fourth quadrant";
        case Point p -> "A point on an axis";
        default -> "Not a point";
    };
}

if (obj instanceof Point(int x, int y)) {
    System.out.println("x + y = " + (x + y));
}
```

Patterns can be **nested**, i.e. a record inside a record can be deconstructed:

```java
record Line(Point start, Point end) { }

static boolean isVertical(Line line) {
    return line instanceof Line(Point(var x1, var y1), Point(var x2, var y2)) && x1 == x2;
}
```

### var and Unnamed Variables

* In a record pattern, **`var`** can be written instead of a component's type: the type is inferred from the record declaration.
* Since Java 22 a component that is not needed is marked with **`_`** (the unnamed pattern), and so is an unused variable.

```java
static double perimeter(Shape s) {
    return switch (s) {
        case Circle(var r) -> 2 * Math.PI * r;
        case Rect(var w, var h) -> 2 * (w + h);
    };
}

if (obj instanceof Line(Point(var x, _), _)) {     // only the x coordinate of the start is needed
    System.out.println(x);
}
```

## Exhaustiveness and Sealed Hierarchies

A `switch` expression (and a `switch` with patterns) must be **exhaustive**: every possible value must end up in some branch. For sealed hierarchies the compiler knows all permitted subtypes, so `default` is not needed, and adding a new subtype leads to a compile-time error in every switch that does not handle it.

The combination of a sealed interface, records and patterns is the idiomatic way to model "one of several variants" data (algebraic data types):

```java
sealed interface Expr permits Num, Add, Mul, Neg { }
record Num(int value) implements Expr { }
record Add(Expr left, Expr right) implements Expr { }
record Mul(Expr left, Expr right) implements Expr { }
record Neg(Expr operand) implements Expr { }

static int eval(Expr e) {
    return switch (e) {
        case Num(var v) -> v;
        case Add(var l, var r) -> eval(l) + eval(r);
        case Mul(Num(var a), Num(var b)) -> a * b;          // a nested pattern: a separate fast case
        case Mul(var l, var r) -> eval(l) * eval(r);
        case Neg(Neg(var inner)) -> eval(inner);            // --x == x
        case Neg(var inner) -> -eval(inner);
    };
}

static String show(Expr e) {
    return switch (e) {
        case Num(var v) -> Integer.toString(v);
        case Add(var l, var r) -> "(" + show(l) + " + " + show(r) + ")";
        case Mul(var l, var r) -> show(l) + " * " + show(r);
        case Neg(var x) -> "-" + show(x);
    };
}

Expr expr = new Add(new Num(2), new Mul(new Num(3), new Neg(new Num(4))));
System.out.println(show(expr) + " = " + eval(expr));    // (2 + 3 * -4) = -10
```

## Dominance of Branches

`switch` branches are checked **in order**. The compiler reports an error if a branch can never match because a previous one covers it (*dominance*):

```java
switch (obj) {
    case CharSequence cs -> System.out.println("a character sequence");
    // case String s -> ...;                 // ERROR: String is dominated by CharSequence
    default -> { }
}

switch (obj) {
    case Integer i when i > 0 -> System.out.println("positive");
    case Integer i -> System.out.println("an integer");       // OK: a guarded branch does not dominate
    default -> { }
}
```

That is why branches with more specific types and guards are written **above** more general ones.

> [!NOTE]
> Patterns for **primitive types** (`case int i when i > 100`, `instanceof byte b`) appear as a preview in Java 23+ (JEP 455/488). In stable versions a switch over `int` works with constants, and for more complex conditions a guard in a switch over the `Integer` wrapper is used.
