---
title: Variables
description: The definite assignment rule, default values, type inference with var, final and effectively final, constants, variable scope.
---

## Definite Assignment

The Java compiler requires every **local** variable to receive a value before it is first read (*definite assignment*). It analyzes all execution paths: if on at least one of them the variable may be read without an assignment, it is a compile-time error. The rule does not apply to class **fields** and **array** elements: they are automatically filled with default values.

```java
int x;
// System.out.println(x);        // ERROR: variable x might not have been initialized

int y;
if (flag) y = 1; else y = 2;
System.out.println(y);           // OK: assigned on all paths

int z;
if (flag) z = 1;
// System.out.println(z);        // ERROR: if flag == false, z is not assigned

int[] ints = new int[2];
System.out.println(ints[1]);     // 0

class Test { int value; }
System.out.println(new Test().value);   // 0
```

## Default Values

Fields and array elements are initialized with "zeros":

| Type | Value |
| --- | --- |
| `byte`, `short`, `int`, `long` | `0` |
| `float`, `double` | `0.0` |
| `char` | `'\u0000'` |
| `boolean` | `false` |
| any reference type | `null` |

Java has no separate operator like `default(T)`. For a generic type `T` the default value is always `null`, because `T` is a reference type.

## Type Inference: var

Since Java 10 the type of a **local** variable can be omitted if the compiler can infer it from the initializer. The variable still has a static type: `var` is not dynamic typing.

```java
var greeting = "Hello class";            // String
var i = 0;                               // int
var x = 0.15f;                           // float
var list = new ArrayList<Integer>();     // ArrayList<Integer>
var today = LocalDate.now().getDayOfWeek();   // DayOfWeek
for (var entry : map.entrySet()) { }     // Map.Entry<K, V>
try (var in = Files.newBufferedReader(path)) { }

// var empty;              // ERROR: an initializer is required
// var nothing = null;     // ERROR: the type of null is unknown
// var arr = {1, 2};       // ERROR: new int[]{1, 2} is required
// var f = x -> x + 1;     // ERROR: a lambda needs a target type
```

Restrictions:

* only **local variables** with an initializer, loop variables and `try` resources, as well as lambda parameters (`(var a, var b) -> a + b`);
* not allowed for fields, method parameters and return types.

> [!WARNING]
> `var list = new ArrayList<>();` infers the type `ArrayList<Object>`: the diamond `<>` without a target type has nothing to infer the parameter from. Write `new ArrayList<String>()` or declare the type explicitly. In general `var` fits when the type is obvious from the right-hand side and hurts when the type has to be guessed: `var result = service.process(data);`.

## final and effectively final

A variable with the `final` modifier can be assigned **only once**. For references this means the variable always points to the same object, although the object itself may change.

```java
final int max = 100;
// max = 200;                       // ERROR

final List<String> names = new ArrayList<>();
names.add("Ola");                   // OK: the object changes, not the reference
// names = new ArrayList<>();       // ERROR

final String label;                 // a final can be assigned later, but exactly once
label = flag ? "yes" : "no";
```

A variable that is never changed after initialization is considered **effectively final** even without the keyword. Only such local variables can be captured by lambdas and anonymous classes (the "Functional Interfaces" page).

## Constants

Class constants are declared as `static final` and, by convention, named in `UPPER_SNAKE_CASE`:

```java
public class Physics {
    public static final double G = 6.674e-11;
    public static final int MAX_ITERATIONS = 1_000;
    private static final String PREFIX = "phys-";
}
```

If a constant has a primitive type or `String` and is initialized with a constant expression, it is a **compile-time constant**: the compiler inlines its value directly at the places of use (even in other classes). That is why changing the value of such a public constant in a library requires recompiling the code that uses it.

## Scope

A local variable is visible from its declaration to the end of the `{ }` block in which it is declared. Unlike C++, a nested block **cannot** declare a local variable with the same name as one in an outer block (shadowing of local variables is forbidden). Only class fields can be shadowed.

```java
class Counter {
    private int count;

    void increment(int count) {          // the parameter shadows the field
        this.count += count;             // this.count is the field, count is the parameter
    }

    void demo() {
        int x = 1;
        {
            // int x = 2;                // ERROR: variable x is already defined
            int y = 2;
        }
        // System.out.println(y);        // ERROR: y is out of scope
        for (int i = 0; i < 3; i++) { }
        for (int i = 0; i < 3; i++) { }  // OK: the previous i is no longer visible
    }
}
```

> [!TIP]
> Declare a variable as close as possible to its first use and with the smallest possible scope. This makes code easier to read and makes it impossible to accidentally use the variable in the wrong place.
