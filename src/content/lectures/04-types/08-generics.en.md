---
title: Generics
description: Generic classes and methods, type inference, bounded types, recursive bounds, invariance, wildcards and the PECS rule, type erasure and its consequences, raw types.
---

## Generics

Generic types (generics) let you write code independent of a concrete data type while keeping type checking by the compiler. They appeared in Java 5 and serve the same purpose as templates in C++, but work differently.

A C++ template is a blueprint from which the compiler generates **a separate copy** of the code for each type. Java generics are compiled **once**: the compiler checks the types and then **erases** them (type erasure). In bytecode `List<String>` and `List<Integer>` are the same `List` class, and `T` is replaced by `Object` (or the upper bound of the type). Where needed, the compiler inserts casts itself.

The code of a generic class is checked **at the point of declaration**, not at the point of use. To call any methods on a value of type `T`, `T` must be bounded explicitly. Here is a method returning the larger of two values: without a bound the compiler would not allow calling `compareTo`:

```java
static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

max(3, 7);              // 7
max("pear", "apple");   // "pear"
// max(new Object(), new Object());   // ERROR: Object does not implement Comparable
```

Generic type parameters can be **only reference types**. There are no non-type parameters (constant values like `10` or `true`, as in C++ templates), and primitives are replaced by wrappers: `List<Integer>`, not `List<int>`.

## Without Generics

Suppose we need a stack for `int`, `double` and `String`. Without generics we could write three classes (`IntStack`, `DoubleStack`, `StringStack`) with identical code, or one stack on `Object`:

```java
public class ObjectStack {
    private Object[] items = new Object[8];
    private int count;

    public void push(Object item) {
        if (items.length == count) items = Arrays.copyOf(items, count * 2);
        items[count++] = item;
    }

    public Object pop() {
        if (count == 0) throw new IllegalStateException("The stack is empty");
        Object item = items[--count];
        items[count] = null;                 // do not hold the reference: otherwise a memory leak
        return item;
    }

    public int size() { return count; }
}
```

Using such a stack reveals problems. First, numbers have to be boxed. Second, there is no type safety: taking an element out is an unsafe downcast, and an error shows up only at run time.

```java
ObjectStack stack = new ObjectStack();
for (int i = 0; i < 10; i++) stack.push(i);      // boxing to Integer

int number = (Integer) stack.pop();
String str = (String) stack.pop();               // ClassCastException at run time
```

## Generic Classes

The generic version:

```java
public class Stack<T> {
    private T[] items;
    private int count;

    @SuppressWarnings("unchecked")
    public Stack() {
        items = (T[]) new Object[8];             // new T[8] is impossible (see "Type Erasure")
    }

    public void push(T item) {
        if (items.length == count) items = Arrays.copyOf(items, count * 2);
        items[count++] = item;
    }

    public T pop() {
        if (count == 0) throw new IllegalStateException("The stack is empty");
        T item = items[--count];
        items[count] = null;
        return item;
    }

    public int size() { return count; }
    public boolean isEmpty() { return count == 0; }
}
```

Now the stack is type-safe, and an error is detected at compile time:

```java
Stack<Integer> stack = new Stack<>();            // diamond <>: the compiler infers Integer
for (int i = 0; i < 10; i++) stack.push(i);

// String str = stack.pop();                     // COMPILE ERROR
while (!stack.isEmpty()) {
    int number = stack.pop();                    // automatic unboxing
    System.out.println(number);
}
```

> [!NOTE]
> A generic stack of `Integer` still boxes numbers: generics do not remove boxing, because the parameter is always a reference type. For millions of numbers, arrays of primitives or specialized libraries (fastutil, Eclipse Collections) are used.

There can be several type parameters. By convention they are named with a single capital letter: `T` (type), `E` (element), `K`/`V` (key/value), `R` (result).

```java
public record Pair<A, B>(A first, B second) {
    public <C> Pair<A, C> withSecond(C newSecond) { return new Pair<>(first, newSecond); }
}

var p = new Pair<>("age", 21);                   // Pair<String, Integer>
```

## Generic Methods

A method can declare its own type parameters — before the return type:

```java
public static <T> void swap(T[] array, int i, int j) {
    T tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

public static <T> List<T> repeat(T value, int n) {
    List<T> result = new ArrayList<>(n);
    for (int i = 0; i < n; i++) result.add(value);
    return result;
}
```

Usually the compiler **infers** the type parameters from the arguments and from the target type (where the result is assigned). If inference fails, the type is given explicitly before the method name:

```java
Integer[] nums = {3, 5};
swap(nums, 0, 1);                                // T = Integer
List<String> xs = repeat("a", 3);                // T = String
List<Number> ns = Collections.<Number>emptyList();   // an explicit type argument
```

## Bounded Types

About an unbounded parameter `T` all that is known is that it is an `Object`: you can call the methods of `Object` and nothing else. A **bound** tells the compiler more: if `T extends Type`, the methods of that type can be called on values of `T`.

```java
public static <T extends Comparable<T>> T max(T first, T... rest) {
    T max = first;
    for (T t : rest) {
        if (max.compareTo(t) < 0) max = t;
    }
    return max;
}

static double sum(List<? extends Number> numbers) { ... }   // see wildcards below
```

* `T extends Class` — `T` is this class or its subclass (for interfaces you also write `extends`, not `implements`).
* Several bounds are combined with `&`: first the class (if any), then the interfaces.

```java
public static <T extends Number & Comparable<T>> T clampToMax(T value, T max) {
    return value.compareTo(max) > 0 ? max : value;
}
```

There are no other kinds of bounds (having a constructor, "value types only" etc.). If generic code needs to create instances of `T`, it is given a **factory** (`Supplier<T>`) or a `Class<T>` object.

## Recursive Bounds

In a type definition, the type itself can be used as an argument of a generic interface:

```java
public class Product implements Comparable<Product> {
    private final String ean;
    public Product(String ean) { this.ean = ean; }

    @Override
    public int compareTo(Product other) { return ean.compareTo(other.ean); }
}
```

This makes sense: `Product` declares that it can be compared with other instances of its own type. A type parameter can be bounded by itself:

```java
public class SortedBag<T extends Comparable<T>> {
    private final List<T> items = new ArrayList<>();

    public void add(T item) {
        int pos = Collections.binarySearch(items, item);
        items.add(pos >= 0 ? pos : -pos - 1, item);
    }
}
```

The best-known example is the declaration of enums in the JDK: `abstract class Enum<E extends Enum<E>> implements Comparable<E>`. Thanks to it `compareTo` accepts only constants of the same enum.

## Invariance

Generic types in Java are **invariant**: even if `Car` is a subtype of `Vehicle`, `Stack<Car>` is **not** a subtype of `Stack<Vehicle>`, and vice versa.

```java
abstract class Vehicle { }
class Car extends Vehicle { }
class Bike extends Vehicle { }

Stack<Car> carStack = new Stack<>();
// Stack<Vehicle> vehicles = carStack;     // ERROR
// vehicles.push(new Bike());              // otherwise a bike would end up in a stack of cars

Stack<Vehicle> vehicleStack = new Stack<>();
// Stack<Car> cars = vehicleStack;         // ERROR
// Car c = cars.pop();                     // otherwise a bike could come out of it
```

Compare with arrays, which are covariant and therefore check stores at run time (`ArrayStoreException`, the "Arrays" page). Generics check the same thing at compile time.

## Wildcards: Use-Site Variance

To make a method accept "a stack of any vehicles", a **wildcard** `?` is used. Unlike languages where variance is declared at the type level, in Java it is specified **at the place of use** (use-site variance), in the method signature.

### Covariance: ? extends

`Stack<? extends Vehicle>` means "a stack of elements of **some** subtype of `Vehicle`". You can **read** values from it as `Vehicle`, but **cannot write** to it (except `null`): the compiler does not know which subtype is in there.

```java
static void washVehicles(Stack<? extends Vehicle> vehicles) {
    while (!vehicles.isEmpty()) {
        Vehicle v = vehicles.pop();             // reading — OK
        System.out.println("Washing " + v);
    }
    // vehicles.push(new Car());                // ERROR: it could be a Stack<Bike>
}

Stack<Car> cars = new Stack<>();
cars.push(new Car());
washVehicles(cars);                             // a Stack<Car> fits
```

### Contravariance: ? super

`Stack<? super Car>` means "a stack of elements that are `Car` or a **supertype** of `Car`". You can **write** a `Car` into it, but can read only as `Object`.

```java
static void deliverCars(Stack<? super Car> target, int count) {
    for (int i = 0; i < count; i++) {
        target.push(new Car());                 // writing — OK: a Car fits both Stack<Vehicle> and Stack<Object>
    }
    // Car c = target.pop();                    // ERROR: there may be a Bike in there
}

Stack<Vehicle> garage = new Stack<>();
garage.push(new Bike());
deliverCars(garage, 2);                         // a Stack<Vehicle> fits
```

### The PECS Rule

**Producer `extends`, Consumer `super`**: if a parameter **supplies** values to the method (you read from it) — `? extends T`; if it **consumes** them (you write to it) — `? super T`; if both — the exact type `T`.

```java
// Collections.copy from the standard library:
public static <T> void copy(List<? super T> dest, List<? extends T> src) { ... }

// Collections.max:
public static <T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll) { ... }
```

`Comparable<? super T>` in `max` makes it possible to find the maximum in a `List<java.sql.Timestamp>`, although `Timestamp` implements `Comparable<java.util.Date>` (a supertype), not `Comparable<Timestamp>`.

### The Unbounded Wildcard: ?

`List<?>` is "a list of some unknown type". Elements can be read only as `Object`, and only `null` can be written. This is convenient for methods that do not care about the element type:

```java
static int countNulls(Collection<?> items) {
    int n = 0;
    for (Object o : items) if (o == null) n++;
    return n;
}
```

## Type Erasure

The compiler checks generics and then **erases** the information about type parameters: `T` is replaced by its bound (`Object` or `Comparable`), and casts are inserted where the result is used. This was done for compatibility with code written before Java 5.

```java
List<String> names = new ArrayList<>();
names.add("Ola");
String s = names.get(0);
// after erasure this is roughly:
// List names = new ArrayList();
// names.add("Ola");
// String s = (String) names.get(0);
```

Consequences of erasure:

```java
class Container<T> {
    // T value = new T();                  // ERROR: the type T is unknown at run time
    // T[] array = new T[10];              // ERROR: cannot create an array of T
    // static T shared;                    // ERROR: static members are shared by all T
    // boolean b = obj instanceof T;       // ERROR
}

// if (list instanceof List<String>)       // ERROR: only instanceof List<?> is allowed
// List<String>[] arr = new List<String>[3];   // ERROR: arrays of parameterized types

class Printer {
    // void print(List<String> xs) { }
    // void print(List<Integer> xs) { }    // ERROR: identical signatures after erasure
}

System.out.println(new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass());   // true
```

Workarounds pass the required information explicitly:

```java
public class Repository<T> {
    private final Class<T> type;             // a "type token"
    private final Supplier<T> factory;

    public Repository(Class<T> type, Supplier<T> factory) {
        this.type = type;
        this.factory = factory;
    }

    public T create() { return factory.get(); }
    public boolean accepts(Object o) { return type.isInstance(o); }
    public T[] newArray(int n) {
        @SuppressWarnings("unchecked")
        T[] arr = (T[]) java.lang.reflect.Array.newInstance(type, n);
        return arr;
    }
}

var repo = new Repository<>(StringBuilder.class, StringBuilder::new);
```

> [!NOTE]
> Not everything is erased: information about generic types **in declarations** (fields, method parameters, superclasses) is kept in the bytecode and available through reflection. The "type token" trick in serialization libraries is based on this: `new TypeReference<List<Order>>() { }` is an anonymous subclass whose superclass keeps the full type.

## Raw Types

A generic type without arguments (`List` instead of `List<String>`) is called a **raw type**. Raw types exist only for compatibility with old code: they turn off type checking, and an error will show up as a `ClassCastException` far from where it was made (heap pollution).

```java
List raw = new ArrayList<String>();          // warning: unchecked
raw.add(42);                                 // compiles!
List<String> strings = raw;
String s = strings.get(0);                   // ClassCastException here, not where 42 was added
```

> [!CAUTION]
> Do not use raw types. If the element type is unknown or irrelevant, write `List<?>` or `List<Object>`. The compiler's `unchecked` warnings are worth reading: each of them marks a place where Java cannot guarantee type safety.
