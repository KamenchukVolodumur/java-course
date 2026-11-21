---
title: Nested Types
description: Static nested classes, inner classes and Outer.this, local and anonymous classes, access to private members, the Builder pattern, nested interfaces, enums and records, memory leaks through inner classes.
---

## Nested Types

A type can be declared inside another type. This is convenient when a type is closely tied to its container and should not "pollute" the package. Java has four kinds of nested classes:

| Kind | Where declared | Tied to an instance of the outer class |
| --- | --- | --- |
| **static nested** | in the class body, with `static` | no |
| **inner** | in the class body, without `static` | yes, via the implicit `Outer.this` |
| **local** | inside a method or block | yes (in an instance method) + access to effectively final variables |
| **anonymous** | in a `new Type() { ... }` expression | yes (in an instance method) + access to effectively final variables |

Nested **interfaces, enums and records** are always implicitly static.

## Static Nested Classes

A static nested class behaves like an ordinary top-level class, only with a name "nested" in the outer one (`Car.Engine`). It has no access to the outer class's instance fields, but sees all its static members, including **private** ones.

```java
public class Car {
    private final Engine engine;

    public Car(Engine engine) { this.engine = engine; }

    public static class Engine {
        private final int horsePower;
        private final EngineType type;

        public Engine(int horsePower, EngineType type) {
            this.horsePower = horsePower;
            this.type = type;
        }
    }

    public enum EngineType { GASOLINE, DIESEL, ELECTRIC }
}

Car.Engine engine = new Car.Engine(150, Car.EngineType.DIESEL);
Car car = new Car(engine);
```

A nested type can have any access modifier. The outer class and its nested classes have **mutual access to private members**. The classic **Builder** is built on this: the nested class calls the outer class's private constructor.

```java
public final class Pizza {
    public enum Topping { PEPPERONI, SAUSAGE, MUSHROOMS, CHEESE, ONIONS }

    private final int sizeCm;
    private final List<Topping> toppings;

    private Pizza(Builder builder) {                 // can be created only through the Builder
        this.sizeCm = builder.sizeCm;
        this.toppings = List.copyOf(builder.toppings);
    }

    public int sizeCm() { return sizeCm; }
    public List<Topping> toppings() { return toppings; }

    public static class Builder {
        private final int sizeCm;
        private final List<Topping> toppings = new ArrayList<>();

        public Builder(int sizeCm) { this.sizeCm = sizeCm; }

        public Builder addTopping(Topping topping) {
            toppings.add(topping);
            return this;
        }

        public Pizza build() { return new Pizza(this); }
    }
}
```

From outside, a nested type is used with its qualified name (or imported: `import pl.mini.Pizza.Builder;`):

```java
Pizza largePepperoni = new Pizza.Builder(40)
        .addTopping(Pizza.Topping.PEPPERONI)
        .addTopping(Pizza.Topping.CHEESE)
        .build();
```

## Inner Classes

A nested class **without** `static` is an inner class. Each of its objects is bound to a specific object of the outer class and has direct access to all its fields and methods, even private ones. The reference to the outer object is available as `Outer.this`.

```java
public class Playlist implements Iterable<String> {
    private final String[] songs;
    private final String name;

    public Playlist(String name, String... songs) {
        this.name = name;
        this.songs = songs;
    }

    @Override
    public Iterator<String> iterator() {
        return new SongIterator();          // created "in the context" of this
    }

    private class SongIterator implements Iterator<String> {
        private int index = 0;

        @Override public boolean hasNext() { return index < songs.length; }   // a field of the outer object

        @Override public String next() {
            if (!hasNext()) throw new NoSuchElementException();
            return Playlist.this.name + ": " + songs[index++];
        }
    }
}

for (String s : new Playlist("Morning", "Intro", "Sunrise")) {
    System.out.println(s);                  // Morning: Intro, Morning: Sunrise
}
```

From outside, an inner class is created through an instance of the outer one (a rare syntax):

```java
Playlist p = new Playlist("x", "a");
Playlist.SongIterator it = p.new SongIterator();   // if the class were accessible
```

> [!WARNING]
> An object of an inner class holds a hidden reference to the outer object. If the inner object lives longer (a registered listener, a task in a thread pool, a cache entry), the outer one cannot be garbage collected, and a memory leak occurs. **Rule:** if a nested class does not need access to the outer instance, declare it `static`.

## Local Classes

A class can be declared inside a method. It is visible only in that block and has access to the method's local variables if they are **effectively final**. Since Java 16 you can also declare local records, enums and interfaces (they are static and do not see local variables).

```java
List<String> topWords(List<String> words, int n) {
    record Count(String word, long count) { }          // a local record

    return words.stream()
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()))
            .entrySet().stream()
            .map(e -> new Count(e.getKey(), e.getValue()))
            .sorted(Comparator.comparingLong(Count::count).reversed())
            .limit(n)
            .map(Count::word)
            .toList();
}
```

## Anonymous Classes

An anonymous class is declared and instantiated in a single expression. It implements an interface or extends a class "on the spot":

```java
Comparator<String> byLength = new Comparator<>() {
    @Override
    public int compare(String a, String b) {
        return Integer.compare(a.length(), b.length());
    }
};

Thread worker = new Thread() {
    @Override
    public void run() {
        System.out.println("working in " + getName());
    }
};
```

For interfaces with one abstract method (functional interfaces), a **lambda** is written instead of an anonymous class: `Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());`. An anonymous class is needed when you have to implement several methods, keep state (fields) or extend a class.

> [!NOTE]
> In a lambda `this` means the object of the enclosing class, while in an anonymous class it is the anonymous object itself. This is one of the reasons why a lambda is not just a "shorthand" for an anonymous class.
