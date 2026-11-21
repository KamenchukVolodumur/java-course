---
title: Classes
description: Class declarations and their modifiers, fields, methods and local classes, constructors, initializer blocks and their order, static members, getters and setters, immutable classes, finalizers.
---

## Declaring a Class

A class is declared like this:

```java
public class ClassName {
}
```

The `class` keyword can be preceded by modifiers:

* `public` — the class is visible everywhere; a public top-level class must live in a file with the same name;
* *(no modifier)* — the class is visible only within its **package** (package-private);
* `abstract` — no instance of the class can be created; the class may contain abstract methods without an implementation;
* `final` — the class cannot be inherited from (`String`, `Integer`);
* `sealed` / `non-sealed` — only explicitly listed classes may inherit (the "Inheritance" page);
* `static` — only for **nested** classes (the "Nested Types" page).

Every class member has its own access modifier (`public`, `protected`, `private` or none — package access):

```java
public class MyClass {
    public int member1;
    private String member2;
    protected float member3;
    long member4;               // package-private
}
```

Java has no separation into declaration (header) and implementation: all the code of a class is written in one place, in the `.java` file.

## Fields

A field is a variable belonging to the class (a static field) or to each of its objects (an instance field).

```java
public class Student {
    private String name;                  // an instance field
    private final String index;           // assigned exactly once
    private int year = 1;                 // a field initializer
    private static int created = 0;       // one field for the whole class
    public static final int MAX_YEAR = 7; // a constant
}
```

* A `final` field must be assigned **exactly once**: in its initializer, in an initializer block or in **every** constructor. After the constructor finishes it cannot be changed.
* `static final` with a constant expression is a compile-time constant.
* Fields without an initializer receive default values (`0`, `false`, `null`) even before the constructor is called.

By convention fields, methods and variables are written in `camelCase`, classes in `PascalCase`, constants in `UPPER_SNAKE_CASE`. Prefixes like `_name` or `m_name` are not used in Java.

## Methods

A method is declared together with its body:

```java
public class Calculator {
    public int twice(int x) {
        return x * 2;
    }

    public static int square(int x) {     // a static method: called via the class name
        return x * x;
    }
}

int a = new Calculator().twice(4);   // 8
int b = Calculator.square(4);        // 16
```

Java has no "method = expression" shorthand: a method body is always a `{ }` block (lambdas have a shorthand syntax, but they are not class methods).

Java also has no separate **local functions**. Helper logic inside a method is expressed with a lambda (the "Functional Interfaces" page) or a local class or record:

```java
void printReport(List<Order> orders) {
    IntConsumer printInt = value -> System.out.println("> " + value);   // a "local function"
    printInt.accept(1);

    record Line(String customer, BigDecimal total) { }                  // a local record
    List<Line> lines = orders.stream().map(o -> new Line(o.customer(), o.total())).toList();
}
```

## Constructors

A constructor has the name of the class and no return type. There are no initializer lists as in C++: fields are assigned in the constructor body. To refer to a field shadowed by a parameter, use `this`.

A constructor can call another constructor of the same class via `this(...)`. Such a call must be the **first** statement.

```java
public class Book {
    private final String title;
    private final int year;

    public Book(String title) {
        this(title, 0);                   // delegating to another constructor
    }

    public Book(String title, int year) {
        if (title == null || title.isBlank())
            throw new IllegalArgumentException("A title is required");
        this.title = title;
        this.year = year;
    }
}
```

If a class declares **no** constructor at all, the compiler adds a **default constructor** without parameters (with the class's visibility). As soon as you declare any constructor, there is no automatic one anymore.

> [!TIP]
> A private constructor forbids creating instances from outside. This is how utility classes are written (`private Math() { }`) and classes with static factories: `LocalDate.of(2025, 3, 14)`, `List.of(...)`. Factories can have meaningful names and return cached objects or subtypes.

## Initializer Blocks and Initialization Order

Besides constructors, a class may have **initializer blocks**: an instance block runs every time an object is created, a static block runs once when the class is loaded (on first use).

```java
public class Demo {
    static int counter;
    static {
        System.out.println("1. static block");      // once per class
        counter = 100;
    }

    private int a = initA();                         // a field initializer
    {
        System.out.println("3. instance block");
    }
    private int b = 2;

    public Demo() {
        System.out.println("4. constructor body");
    }

    private int initA() {
        System.out.println("2. initializer of field a");
        return 1;
    }
}
```

The order of creating an object:

1. (once) static initializers and static blocks — in textual order;
2. the call of the superclass constructor (`super(...)`, explicit or implicit);
3. field initializers and instance blocks — **in the textual order of the class**;
4. the constructor body.

## Static Members

Static fields and methods belong to the **class**, not to an object. They exist once, even if there are no objects. A static method has no `this` and cannot directly access instance fields.

```java
public class IdGenerator {
    private static long next = 1;

    public static long nextId() {
        return next++;
    }
}

long id = IdGenerator.nextId();
```

Java has no separate "static classes". A class containing only static methods is written as a `final` class with a private constructor (`Math`, `Collections`, `Arrays`, `Objects`).

## Accessing State: Getters and Setters

Java has no separate "property" language construct. Fields are made `private`, and access is provided through methods. By the **JavaBeans** convention they are called `getX()`/`setX(value)`, and `isX()` for `boolean`. Libraries (Jackson, Hibernate, Spring) rely on this convention, and the IDE generates such methods automatically.

```java
public class ShopItem {
    private String name;
    private BigDecimal price = BigDecimal.ZERO;

    public String getName() { return name; }
    public void setName(String name) { this.name = name.strip(); }   // logic on assignment

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) {
        this.price = price.max(BigDecimal.ZERO);        // a price is never negative
    }
}

ShopItem book = new ShopItem();
book.setPrice(new BigDecimal("9.99"));
book.setPrice(book.getPrice().subtract(BigDecimal.ONE));
System.out.println("Price: " + book.getPrice());      // Price: 8.99
```

A setter can be omitted (a "read-only" property), made less accessible (`protected`/package-private) or validate its argument. For **immutable** data, instead of getter/setter pairs use `final` fields assigned in the constructor, or records, whose accessors are named like the fields: `point.x()`.

### Index-Based Access

The `[]` operator cannot be overloaded. Classes that behave like collections provide `get(index)` and `set(index, value)` methods:

```java
public class Sentence {
    private final String[] words;

    public Sentence(String sentence) { this.words = sentence.split(" "); }

    public String get(int i) { return words[i]; }
    public void set(int i, String word) { words[i] = word; }
    public int size() { return words.length; }
}

Sentence s = new Sentence("The quick brown fox jumps over lazy dog");
s.set(1, "swift");
System.out.println(s.get(3));     // fox
```

## Creating Objects with Many Parameters

Java has no separate object initializer syntax (assigning fields right after `new`). If there are many optional parameters, the **Builder** pattern is used:

```java
public final class Hamster {
    private final String name;
    private final boolean likesViolence;

    private Hamster(Builder b) {
        this.name = b.name;
        this.likesViolence = b.likesViolence;
    }

    public static Builder builder(String name) { return new Builder(name); }

    public static final class Builder {
        private final String name;
        private boolean likesViolence;

        private Builder(String name) { this.name = name; }

        public Builder likesViolence(boolean v) { this.likesViolence = v; return this; }
        public Hamster build() { return new Hamster(this); }
    }
}

Hamster h = Hamster.builder("Boo").likesViolence(true).build();
```

## Immutable Classes

An immutable object never changes its state after creation. Such objects are easier to reason about, safe to pass between threads and to use as map keys. The recipe:

1. the class is `final` (so that a subclass cannot add mutable state);
2. all fields are `private final`;
3. no setters; "modifying" methods return a **new** object (`withX(...)`);
4. mutable components (arrays, collections) are copied in the constructor and never handed out directly.

```java
public final class Money {
    private final BigDecimal amount;
    private final String currency;

    public Money(BigDecimal amount, String currency) {
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = Objects.requireNonNull(currency);
    }

    public Money plus(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("Different currencies");
        return new Money(amount.add(other.amount), currency);   // a new object
    }

    public BigDecimal amount() { return amount; }
    public String currency() { return currency; }
}
```

Records (the "Records" page) implement most of this recipe automatically.

## Finalizers

Java has no destructors: memory is freed by the garbage collector, and it is unknown **when** this will happen (or whether it happens at all before the program ends). The `finalize()` method, which once played the role of a finalizer, is deprecated for removal. Its invocation is unpredictable, it slows down the GC and it can "resurrect" an object.

Resources (files, connections, locks) are released **deterministically** via `AutoCloseable` and `try-with-resources` (the "Resource Management" page). As a safety net for a forgotten `close()`, `java.lang.ref.Cleaner` is used.
