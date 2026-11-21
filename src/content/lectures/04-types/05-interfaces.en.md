---
title: Interfaces
description: Interfaces as stateless contracts, implementing several interfaces, extending interfaces, default, static and private methods, default method conflicts, marker and functional interfaces.
---

## Interfaces

An interface is similar to an abstract class, but with a key difference: it **describes a behavioral contract and has no instance state** (fields). The closest C++ counterpart is a class whose members are all pure virtual.

* An interface can contain abstract methods, **default** methods with an implementation, **static** methods, **private** methods (helpers for default methods) and **constants**.
* There are no instance fields: every "field" of an interface is implicitly `public static final`.
* Abstract and default methods are implicitly `public`; methods without a body are implicitly `abstract`.
* A class can implement **many** interfaces (`implements A, B, C`), although it extends only one class.

Here is a simplified definition of the `Iterator` interface from the `java.util` package:

```java
public interface Iterator<E> {
    boolean hasNext();
    E next();

    default void remove() {
        throw new UnsupportedOperationException("remove");
    }
}
```

Unlike some languages, interface names have no `I` prefix: `List`, `Comparable`, `Runnable`. Implementing an interface means providing an implementation for all of its methods that have no default implementation:

```java
public class Countdown implements Iterator<Integer> {
    private int count;

    public Countdown(int count) { this.count = count; }

    @Override
    public boolean hasNext() { return count > 0; }

    @Override
    public Integer next() {
        if (!hasNext()) throw new NoSuchElementException();
        return count--;
    }
}
```

References are polymorphic with all the interfaces a type implements:

```java
Iterator<Integer> it = new Countdown(5);
while (it.hasNext()) {
    System.out.print(it.next());     // 54321
}
System.out.println();
```

A class that does not implement all abstract methods must be `abstract`.

## Extending Interfaces

An interface can **extend** (`extends`) one or more other interfaces, including all their members:

```java
public interface Undoable {
    void undo();
}

public interface Redoable extends Undoable {
    void redo();
}

public interface Editor extends Redoable, AutoCloseable {
    void type(String text);
}
```

A class implementing `Editor` must implement `type`, `redo`, `undo` and `close`.

## Default Methods

Since Java 8 an interface can provide a **default implementation**. Implementing such a method in a class is optional. The mechanism was introduced to add new methods to existing interfaces without breaking thousands of implementations: this is how `Collection` gained `stream()` and `removeIf`, and `Iterable` gained `forEach`.

```java
public interface Logger {
    void log(String message);

    default void info(String message) {
        log("[INFO] " + message);
    }

    default void error(String message, Throwable t) {
        log("[ERROR] " + message + ": " + t);
    }
}

public class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println(LocalTime.now().withNano(0) + " " + message);
    }
    // info and error are inherited
}

new ConsoleLogger().info("start");   // 10:15:30 [INFO] start
```

A default method can call other interface methods, but has no access to state (there simply is none).

### Default Method Conflicts

If a class receives methods with the same signature from several sources, these rules apply:

1. **The class wins**: a method declared in the class or a superclass takes precedence over an interface's default method.
2. **The more specific interface wins**: if `B extends A` and both have a default `m()`, the version from `B` is chosen.
3. Otherwise — **ambiguity**: the class must override the method explicitly. The implementation of a specific interface is called with the `Interface.super.method()` syntax.

```java
interface Walker { default String move() { return "walks"; } }
interface Swimmer { default String move() { return "swims"; } }

class Duck implements Walker, Swimmer {
    @Override
    public String move() {                          // required, otherwise a compile-time error
        return Walker.super.move() + " and " + Swimmer.super.move();
    }
}

System.out.println(new Duck().move());   // walks and swims
```

There is no separate "explicit implementation" of a method for a specific interface: a class can have only one method with a given signature, and it implements it for **all** interfaces at once.

## Static and Private Methods

An interface can have **static methods**: usually factories and utilities related to the contract. They are called only through the interface name; they are not inherited by implementations.

```java
public interface Shape {
    double area();

    static Shape circle(double r) { return () -> Math.PI * r * r; }
    static Shape square(double a) { return () -> a * a; }

    default String describe() {
        return "a shape with area " + format(area());
    }

    private static String format(double v) {     // a helper, invisible from outside (Java 9)
        return String.format(Locale.ROOT, "%.2f", v);
    }
}

Shape s = Shape.circle(1);
System.out.println(s.describe());               // a shape with area 3.14
```

Examples from the standard library: `List.of(...)`, `Comparator.comparing(...)`, `Map.entry(k, v)`, `Path.of(...)`.

> [!NOTE]
> Static interface methods are **not polymorphic**: Java has no "abstract static" methods that every implementation must provide. If a "type factory" is needed, it is passed as an object: a `Supplier<T>`, a `Comparator<T>` or your own factory interface.

## Constants in Interfaces

Every field of an interface is implicitly `public static final`:

```java
public interface HttpStatus {
    int OK = 200;
    int NOT_FOUND = 404;
}
```

An interface with only constants is considered an anti-pattern (the constant interface): a class implementing it "pollutes" its API with foreign constants. Constants are better kept in a class with a private constructor or in an enum.

## Marker and Functional Interfaces

* A **marker** interface has no methods and merely tags a type: `Serializable`, `Cloneable`, `RandomAccess`. New code more often uses annotations for this.
* A **functional** interface has exactly **one abstract method** (`Runnable`, `Comparator<T>`, `Function<T, R>`). Its implementation can be written as a lambda expression (the "Functional Interfaces" page).

```java
Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());
Runnable hello = () -> System.out.println("Hello");
```

## Interface or Abstract Class

| | Interface | Abstract class |
| --- | --- | --- |
| State (instance fields) | none | yes |
| Constructors | none | yes |
| How many can be implemented/extended | many | one |
| Method modifiers | `public` (and `private` helpers) | any |
| Purpose | a capability, a role: "can do" (`Comparable`, `Closeable`) | a shared implementation of related classes: "is a kind of" |

A typical JDK approach combines both: an interface defines the contract (`List`), and an abstract class (`AbstractList`) implements most of it, so that concrete implementations only have to write a few methods.
