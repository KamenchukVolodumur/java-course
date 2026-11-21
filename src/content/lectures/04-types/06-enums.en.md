---
title: Enumerations (enum)
description: Enums as full-fledged classes, the built-in values, valueOf and ordinal methods, fields, constructors and methods, constant-specific behavior, enums in switch, EnumSet as a set of flags, EnumMap.
---

## Enumerations

An enum in Java is a **full-fledged class** that implicitly extends `java.lang.Enum`. Each constant is the single instance of this class, created when the class is loaded. So an enum is not a set of numbers but a type-safe set of objects.

```java
public enum BorderSide {
    LEFT, RIGHT, TOP, BOTTOM
}

BorderSide side = BorderSide.TOP;
System.out.println(side);              // TOP
```

* A variable of an enum type cannot hold any value other than the declared constants (and `null`).
* A new instance cannot be created with `new`; an enum constructor is always `private`.
* Constants are compared with `==` (each exists as a single instance) or `switch`.

## Built-in Methods

```java
BorderSide.values();                   // [LEFT, RIGHT, TOP, BOTTOM] — a new array each time
BorderSide.valueOf("TOP");             // TOP; an unknown name -> IllegalArgumentException
BorderSide.TOP.name();                 // "TOP"
BorderSide.TOP.ordinal();              // 2: the position in the declaration
BorderSide.TOP.compareTo(BorderSide.LEFT);   // > 0: comparison by ordinal
BorderSide.TOP.getDeclaringClass();    // class BorderSide
```

There are **no implicit conversions** between enums and numbers, and no arithmetic on constants either. The position is given by `ordinal()`, and the constant at a position by `values()[i]`.

> [!WARNING]
> Do not use `ordinal()` as the "value" of a constant (a code in a database, a number in a protocol). Reordering or inserting a new constant silently changes all the numbers. If a constant needs a number, declare a field for it.

## Fields, Constructors and Methods

Since an enum is a class, it can have fields, constructors and methods, and implement interfaces. Constants pass arguments to the constructor:

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);      // a semicolon if members follow

    private static final double G = 6.67300E-11;
    private final double mass;         // kg
    private final double radius;       // m

    Planet(double mass, double radius) {   // always private
        this.mass = mass;
        this.radius = radius;
    }

    public double surfaceGravity() {
        return G * mass / (radius * radius);
    }

    public double surfaceWeight(double otherMass) {
        return otherMass * surfaceGravity();
    }
}

double earthWeight = 70;
double mass = earthWeight / Planet.EARTH.surfaceGravity();
for (Planet p : Planet.values()) {
    System.out.printf("Weight on %s: %.2f%n", p, p.surfaceWeight(mass));
}
```

A typical example is an enum with a code for an external system and a reverse lookup:

```java
public enum HttpStatus {
    OK(200), NOT_FOUND(404), SERVER_ERROR(500);

    private final int code;
    HttpStatus(int code) { this.code = code; }
    public int code() { return code; }

    private static final Map<Integer, HttpStatus> BY_CODE =
            Arrays.stream(values()).collect(Collectors.toMap(HttpStatus::code, s -> s));

    public static Optional<HttpStatus> fromCode(int code) {
        return Optional.ofNullable(BY_CODE.get(code));
    }
}
```

## Constant-Specific Behavior

Each constant can have **its own class body** and override methods. This way, instead of a `switch` inside a method, each constant implements its own version:

```java
public enum Operation {
    PLUS("+") {
        @Override public int apply(int a, int b) { return a + b; }
    },
    MINUS("-") {
        @Override public int apply(int a, int b) { return a - b; }
    },
    TIMES("*") {
        @Override public int apply(int a, int b) { return a * b; }
    };

    private final String symbol;

    Operation(String symbol) { this.symbol = symbol; }

    public abstract int apply(int a, int b);     // every constant must implement it

    @Override public String toString() { return symbol; }
}

for (Operation op : Operation.values()) {
    System.out.println("6 " + op + " 3 = " + op.apply(6, 3));
}
```

If a new constant without an `apply` implementation is added to such an enum, the program will not compile.

## Enums in switch

```java
String describe(BorderSide side) {
    return switch (side) {          // no default needed: all constants are listed
        case LEFT, RIGHT -> "vertical";
        case TOP, BOTTOM -> "horizontal";
    };
}
```

In a `switch` the constant names are written without the type name. The advantage of a `switch` expression over an `if/else` chain is the exhaustiveness check: a new constant forces all such expressions to be updated.

## Sets of Flags: EnumSet

Often a value must be a **combination** of several constants (e.g. "the left and bottom borders"). In Java this is done not with bit masks but with **`EnumSet`**: a type-safe set of constants. Internally it is a bit vector (a `long`), so operations are as fast as bitwise ones.

```java
EnumSet<BorderSide> none = EnumSet.noneOf(BorderSide.class);
EnumSet<BorderSide> leftRight = EnumSet.of(BorderSide.LEFT, BorderSide.RIGHT);
EnumSet<BorderSide> all = EnumSet.allOf(BorderSide.class);
EnumSet<BorderSide> allButTop = EnumSet.complementOf(EnumSet.of(BorderSide.TOP));

System.out.println(allButTop.contains(BorderSide.LEFT));    // true
System.out.println(allButTop.contains(BorderSide.TOP));     // false
System.out.println(allButTop);                              // [LEFT, RIGHT, BOTTOM]

EnumSet<BorderSide> union = EnumSet.copyOf(leftRight);
union.add(BorderSide.BOTTOM);                               // union
union.retainAll(allButTop);                                 // intersection
EnumSet<BorderSide> range = EnumSet.range(BorderSide.RIGHT, BorderSide.BOTTOM);   // [RIGHT, TOP, BOTTOM]
```

If a set of flags needs to be stored or passed as a number (e.g. to a database), it is convenient to add a bit field and conversion methods to the enum:

```java
static int toMask(Set<BorderSide> sides) {
    int mask = 0;
    for (BorderSide s : sides) mask |= 1 << s.ordinal();
    return mask;
}
```

## EnumMap

`EnumMap<K, V>` is a map whose keys are enum constants. Internally it is an array indexed by `ordinal()`: very fast and compact, and iteration follows the declaration order of the constants.

```java
EnumMap<DayOfWeek, List<String>> schedule = new EnumMap<>(DayOfWeek.class);
schedule.put(DayOfWeek.MONDAY, List.of("Java", "Algorithms"));
schedule.put(DayOfWeek.FRIDAY, List.of("Lab"));
schedule.forEach((day, subjects) -> System.out.println(day + ": " + subjects));
```

> [!TIP]
> An enum with a single constant is the simplest thread-safe **singleton**: the JVM guarantees that the instance is created exactly once, and it cannot be duplicated even via reflection or serialization.
