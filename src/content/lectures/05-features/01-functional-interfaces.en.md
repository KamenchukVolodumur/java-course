---
title: Functional Interfaces and Lambdas
description: Functional interfaces as type-safe references to behavior, the standard java.util.function interfaces, function composition, lambda expressions and target typing, method references, variable capture, how lambdas are compiled, anonymous classes.
---

## Functional Interfaces

To pass **behavior** to a method (a function that computes a value, reacts to an event or compares elements), Java uses a **functional interface** — an interface with **exactly one abstract method** (SAM, single abstract method). An object of such an interface is the type-safe counterpart of a function pointer in C/C++.

```java
@FunctionalInterface
public interface Function1D {
    double apply(double x);
}
```

The `@FunctionalInterface` annotation is optional, but with it the compiler checks that there is exactly one abstract method. Default and static methods do not count.

The parameters and the return type of the abstract method determine which behavior can be assigned to such an interface: `Function1D` is compatible with any `double → double` function. Values are created with a **lambda expression** or a **method reference**:

```java
static double quadratic(double x) { return x * x - 2 * x + 1; }

Function1D f1 = x -> x * x - 2 * x + 1;      // a lambda
Function1D f2 = Main::quadratic;             // a reference to a static method

double y = f1.apply(2.0);                    // the call goes through the interface method
```

> [!NOTE]
> A lambda is an object implementing an interface. If a lambda accesses an object's fields or refers to an instance method (`obj::method`), it holds a reference to that object. A lambda stored for a long time (in a field, in a list of listeners) can therefore extend the object's lifetime and cause a memory leak.

A complete example — finding a root with Newton's method:

```java
// Numerics.java
public final class Numerics {
    private Numerics() { }

    @FunctionalInterface
    public interface Function1D {
        double apply(double x);
    }

    public static double newtonRootFinding(Function1D f, Function1D df, double x0, double eps) {
        double x;
        double xn = x0;
        do {
            x = xn;
            xn = x - f.apply(x) / df.apply(x);
        } while (Math.abs(x - xn) >= eps);
        return xn;
    }

    public static double newtonRootFinding(Function1D f, Function1D df) {   // "default parameters"
        return newtonRootFinding(f, df, 0, 1e-6);
    }
}

// Quadratic.java
public record Quadratic(double a, double b, double c) {
    public double function(double x) { return a * x * x + b * x + c; }
    public double derivative(double x) { return 2 * a * x + b; }

    @Override
    public String toString() { return "f(x) = %sx^2 + %sx + %s".formatted(a, b, c); }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        var quadratic = new Quadratic(1.0, -7.0, 10.0);

        Numerics.Function1D function = quadratic::function;      // a method of a specific object
        Numerics.Function1D derivative = quadratic::derivative;

        double root = Numerics.newtonRootFinding(function, derivative);
        System.out.printf("Root of %s: %.2f%n", quadratic, root);  // Root of f(x) = 1.0x^2 + -7.0x + 10.0: 2.00
    }
}
```

### Generic Functional Interfaces

A functional interface can be generic:

```java
@FunctionalInterface
interface Transformer<T> {
    T apply(T x);
}

Transformer<Double> square = x -> x * x;
Transformer<String> shout = s -> s.toUpperCase() + "!";
System.out.println(square.apply(3.0) + " " + shout.apply("hey"));   // 9.0 HEY!
```

## The Standard java.util.function Interfaces

Most of the time you do not need your own interfaces: the `java.util.function` package contains ready-made ones for typical signatures.

| Interface | Method | Signature |
| --- | --- | --- |
| `Supplier<T>` | `get()` | `() → T` |
| `Consumer<T>` | `accept(T)` | `T → void` |
| `BiConsumer<T, U>` | `accept(T, U)` | `(T, U) → void` |
| `Function<T, R>` | `apply(T)` | `T → R` |
| `BiFunction<T, U, R>` | `apply(T, U)` | `(T, U) → R` |
| `UnaryOperator<T>` | `apply(T)` | `T → T` |
| `BinaryOperator<T>` | `apply(T, T)` | `(T, T) → T` |
| `Predicate<T>` | `test(T)` | `T → boolean` |
| `BiPredicate<T, U>` | `test(T, U)` | `(T, U) → boolean` |

Outside the package, `Runnable` (`() → void`), `Callable<V>` (`() → V`, may throw checked exceptions) and `Comparator<T>` (`(T, T) → int`) are widely used.

To avoid boxing, there are **primitive specializations**: `IntPredicate`, `IntFunction<R>` (`int → R`), `ToIntFunction<T>` (`T → int`), `IntUnaryOperator`, `IntBinaryOperator`, `DoubleUnaryOperator`, `LongSupplier`, `ObjIntConsumer<T>` and so on.

```java
DoubleUnaryOperator square = x -> x * x;          // no Double boxing
IntBinaryOperator add = Integer::sum;
ToIntFunction<String> length = String::length;
Predicate<String> isEmpty = String::isEmpty;
Supplier<List<String>> listFactory = ArrayList::new;
BiFunction<Character, Integer, String> repeat = (c, n) -> String.valueOf(c).repeat(n);
```

There are no ready-made interfaces for three or more parameters. If you need one, declare it yourself (or group the arguments into a record).

## Function Composition

Java has no separate mechanism for "combining" several functions into one (as in languages with multicast delegates). Instead, the standard interfaces have **default composition methods** that return a new function:

```java
Function<Integer, Integer> plus2 = x -> x + 2;
Function<Integer, Integer> times3 = x -> x * 3;
plus2.andThen(times3).apply(1);       // (1 + 2) * 3 = 9
plus2.compose(times3).apply(1);       // 1 * 3 + 2 = 5
Function.<Integer>identity();         // x -> x

Predicate<String> blank = String::isBlank;
Predicate<String> valid = blank.negate().and(s -> s.length() <= 20);
Predicate<String> notBlank = Predicate.not(String::isBlank);

Consumer<String> writeLog = System.out::println;
writeLog = writeLog.andThen(Main::writeLogToFile);    // several actions in sequence
writeLog.accept("DEBUG: a test entry");

Comparator<Person> order = Comparator.comparing(Person::lastName)
        .thenComparing(Person::firstName)
        .reversed();
```

If a changing set of handlers must be called (added and removed at run time), they are stored in a list. This is exactly how events are implemented (the "Events" page).

## Lambda Expressions

A lambda is an anonymous function that can be assigned to a variable of a functional interface.

```text
(parameters) -> expression
(parameters) -> { statements; }
```

```java
DoubleUnaryOperator square = x -> x * x;                     // one parameter — no parentheses
BiFunction<Character, Integer, String> rep = (c, i) -> String.valueOf(c).repeat(i);
Consumer<String> write = str -> System.out.print(str);
Supplier<String> greet = () -> "Hello, world";               // no parameters
Supplier<String> greet2 = () -> {                            // a block body needs return
    String name = System.getProperty("user.name");
    return "Hello, " + name;
};
```

* If there is one parameter and its type is not given, the parentheses can be omitted.
* An expression body returns its value without `return`; a block body needs `return` (if the method returns something).
* Parameter types are usually inferred from the target type, but they can be given explicitly, or with `var` for all parameters (e.g. to add an annotation).

```java
BinaryOperator<Integer> add = (Integer a, Integer b) -> a + b;
BinaryOperator<Integer> add2 = (var a, var b) -> a + b;
BiFunction<String, String, Boolean> eq = (@NonNull var a, @NonNull var b) -> a.equals(b);
```

### Target Typing

A lambda **has no type of its own**: its type is determined by the **context**, i.e. the functional interface expected by the assignment, the method parameter or the cast. The same lambda can have different types:

```java
Function<Integer, Integer> f = x -> x * 2;
UnaryOperator<Integer> u = x -> x * 2;
IntUnaryOperator i = x -> x * 2;

// var g = x -> x * 2;           // ERROR: lambda expression needs an explicit target-type
Object o = (Runnable) () -> { };  // an explicit cast sets the target type
```

That is why `var` does not work with lambdas, and overloads of methods taking different functional interfaces with the same number of parameters may be ambiguous.

### Method References

If a lambda only calls an existing method, it can be written as a **method reference** `::`:

| Kind | Example | Equivalent lambda |
| --- | --- | --- |
| a static method | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| a method of a specific object | `System.out::println`, `quadratic::function` | `x -> System.out.println(x)` |
| a method of an arbitrary object of a type | `String::toUpperCase` | `s -> s.toUpperCase()` |
| a constructor | `ArrayList::new` | `() -> new ArrayList<>()` |
| an array constructor | `int[]::new` | `n -> new int[n]` |

```java
List<String> names = List.of("anna", "bob");
names.stream().map(String::toUpperCase).forEach(System.out::println);

BiFunction<String, String, Boolean> startsWith = String::startsWith;   // (s, p) -> s.startsWith(p)
Function<String, Path> toPath = Path::of;
```

> [!WARNING]
> The expression before `::` in a reference to a method of a specific object is evaluated **immediately**, when the reference is created, not when it is called. `Supplier<String> s = getConfig()::name;` calls `getConfig()` right away (and throws `NullPointerException` if it gets `null`).

## Capturing Variables

A lambda can use variables from the surrounding context: local variables, parameters, fields, `this`. But **local variables** can be captured only if they are **effectively final**, i.e. not changed after initialization. Java **copies the value** of a local variable into the lambda object. Forbidding changes to the variable guarantees that the copy and the original never diverge.

```java
int factor = 3;
IntUnaryOperator triple = x -> x * factor;     // OK: factor does not change
// factor = 4;                                  // then the line above would stop compiling

int counter = 0;
// list.forEach(x -> counter++);                // ERROR: counter is not effectively final
```

Because of this, the classic trap "all lambdas in a loop see the last value of the counter" is impossible in Java: the variable of a classic `for` loop simply cannot be captured, and the variable of a for-each loop is new in each iteration:

```java
List<Runnable> actions = new ArrayList<>();
for (int i = 0; i < 3; i++) {
    // actions.add(() -> System.out.print(i));  // ERROR: i changes
    int copy = i;                               // a new effectively final variable per iteration
    actions.add(() -> System.out.print(copy));
}
for (String s : List.of("a", "b")) {
    actions.add(() -> System.out.print(s));     // OK
}
actions.forEach(Runnable::run);                 // 012ab
```

**Fields** (and `this`) are captured by reference: the lambda sees their current values and can change them. Likewise, the **contents** of a captured object can be changed:

```java
class Clicker {
    private int clicks;                         // a field can be changed from a lambda
    Runnable onClick = () -> clicks++;
}

AtomicInteger count = new AtomicInteger();      // the reference is unchanged, the contents are not
names.forEach(n -> count.incrementAndGet());
```

### How Lambdas Are Compiled

The compiler does not generate a separate `.class` for each lambda. The lambda body becomes a private method of the class, and at the place of its creation there is an `invokedynamic` instruction which, on first execution, builds a class implementing the interface via `LambdaMetafactory`.

* A **non-capturing** lambda (no captured variables) is usually created once and then reused, without new objects.
* A **capturing** lambda creates a new object every time the expression is evaluated, because it stores the captured values in fields.

This is worth remembering in "hot" loops, although the JIT often eliminates such allocations.

## Anonymous Classes

Before Java 8, behavior was passed with **anonymous classes**. They are still useful when you need to implement several methods, have fields or extend a class rather than an interface:

```java
Numerics.Function1D f = new Numerics.Function1D() {
    @Override
    public double apply(double x) {
        return x * x - 2 * x + 1;
    }
};
```

Differences from a lambda:

* in a lambda `this` is the object of the **enclosing** class, in an anonymous class it is the anonymous object itself;
* an anonymous class always creates a new object and a separate `.class` file (`Main$1.class`);
* an anonymous class can declare fields and several methods.

For an "empty" implementation (instead of `null`, so that it need not be checked before the call), it is handy to have a ready-made constant:

```java
Consumer<String> noLog = s -> { };
noLog.accept("nothing will happen");
```
