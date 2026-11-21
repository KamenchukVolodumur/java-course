---
title: Method Parameters
description: Pass-by-value only, how to return several values, final parameters, variable-length argument lists (varargs), method overloading and resolution rules, replacements for default parameters.
---

## By Value Only

In Java parameters are passed **exclusively by value**: the method receives a copy of the variable's value. For primitives this is a copy of the number, for reference types a copy of the reference (see the "Type System" page). The language has no modifiers like "by reference" or "output parameter".

```java
static void increment(int p) {
    p = p + 1;                 // changes only the local copy
}

int x = 8;
increment(x);
System.out.println(x);         // 8
```

## How to Return Several Values

A method returns exactly one value. When there are several results, the following approaches are used.

### Return a Record

The cleanest way is a small record that names each result:

```java
record FullName(List<String> firstNames, String lastName) { }

static FullName splitName(String name) {
    String[] words = name.split(" ");
    return new FullName(
            List.of(words).subList(0, words.length - 1),
            words[words.length - 1]);
}

FullName n = splitName("Tim Berners Lee");
System.out.println(n.firstNames() + " / " + n.lastName());   // [Tim, Berners] / Lee

// Java has no destructuring assignment (var (a, b) = ...), but a record can be taken apart with a pattern:
if (splitName("John Fitzgerald Kennedy") instanceof FullName(var firsts, var last)) {
    System.out.println(last);                                 // Kennedy
}
```

### Modify a Passed Object

A method can fill in an object passed to it: a collection, an array or your own class. This is done, for example, to avoid creating new objects in "hot" code.

```java
static void minMax(int[] data, int[] out) {      // out[0] = min, out[1] = max
    int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
    for (int v : data) { min = Math.min(min, v); max = Math.max(max, v); }
    out[0] = min;
    out[1] = max;
}

int[] result = new int[2];
minMax(new int[] {4, -2, 9}, result);   // result = [-2, 9]
```

### Other Options

* Return `Optional<T>` if there may be no result (instead of a "success + value" pair).
* Throw an exception instead of returning an error code.
* For several results of the same type, return an array or a list.

## final Parameters

A parameter can be marked `final`: then it cannot be assigned a new value inside the method. This does not affect the caller (the method works with a copy anyway), but prevents accidental overwriting.

```java
static double area(final double radius) {
    // radius = 0;            // ERROR
    return Math.PI * radius * radius;
}
```

## Variable-Length Arguments (varargs)

A parameter declared as `Type...` accepts any number of arguments (including zero). Inside the method it is an ordinary array; the compiler creates the array from the passed arguments itself. Such a parameter must be the **last** one and there can be only one.

```java
static String concat(String first, String... rest) {   // at least one argument
    StringBuilder sb = new StringBuilder(first);
    for (String s : rest) sb.append(s);
    return sb.toString();
}

String s1 = concat("The", "Quick", "Brown", "Fox");
String s2 = concat("Jumps", "Over", "The", "Lazy", "Dog");
System.out.println(concat(s1, s2));
concat("This method takes at least one parameter");
concat("a", new String[] {"b", "c"});               // an array can be passed directly
```

Varargs are everywhere in the standard library: `String.format(String, Object...)`, `List.of(E...)`, `Arrays.asList(T...)`, `Path.of(String, String...)`.

> [!WARNING]
> Every call of a varargs method creates a new array on the heap. That is why `List.of` has separate overloads for 0–10 arguments and uses the varargs version only for more. A second trap is `null`: `concat("a", null)` passes `null` as **the array** (`rest == null`), not an array containing one `null`.

### Varargs and Generics

An array of a generic type cannot be created, so for a `T...` parameter the compiler creates an `Object[]` and warns about "potential heap pollution". If the method only reads the array's elements, the warning is suppressed with the `@SafeVarargs` annotation (for `static`, `final` or `private` methods):

```java
@SafeVarargs
static <T> List<T> listOf(T... items) {
    return new ArrayList<>(Arrays.asList(items));
}
```

## Method Overloading

A class can have several methods with the same name if they differ in their **parameter list** (the number, types or order of the parameters). The return type and the parameter names play no part in the distinction.

```java
static int sum(int a, int b) { return a + b; }
static double sum(double a, double b) { return a + b; }
static int sum(int a, int b, int c) { return a + b + c; }
// static long sum(int a, int b) { ... }   // ERROR: differs only in the return type
```

The compiler chooses an overload **at compile time**, based on the static types of the arguments, in three phases:

1. an exact match or **widening** of primitives (`int` → `long`), without boxing;
2. **boxing/unboxing** is allowed (`int` → `Integer`);
3. **varargs** are allowed.

In the first phase where applicable methods are found, the **most specific** one is chosen.

```java
static void f(long x)    { System.out.println("long"); }
static void f(Integer x) { System.out.println("Integer"); }
static void f(int... x)  { System.out.println("varargs"); }

f(5);          // long: widening (phase 1) beats boxing (phase 2)
f(5L);         // long
f();           // varargs

static void g(Object o) { System.out.println("Object"); }
static void g(String s) { System.out.println("String"); }

Object x = "hello";
g(x);          // Object: the static type of the variable matters, not the actual type of the object
g("hello");    // String
g(null);       // String: the most specific of the applicable ones
```

## Default Parameters and Named Arguments

Java has **no** default parameter values and no named arguments. They are replaced by:

**Overloads** that delegate to each other:

```java
static void connect(String host) { connect(host, 80); }
static void connect(String host, int port) { connect(host, port, Duration.ofSeconds(5)); }
static void connect(String host, int port, Duration timeout) { /* the actual implementation */ }
```

**A parameter object or a Builder**, when there are many optional parameters (the "Classes" page and the "Extras → patterns" chapter):

```java
HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com"))
        .timeout(Duration.ofSeconds(10))      // a "named argument"
        .header("Accept", "application/json")
        .build();                             // the rest are default values
```
