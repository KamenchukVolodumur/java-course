---
title: Annotations
description: Annotations as code metadata, declaring custom annotations and their elements, the Retention and Target meta-annotations, where an annotation can be placed, repeatable and inherited annotations, built-in compiler annotations, caller information with StackWalker.
---

## Annotations

Annotations are "labels" attached to code elements: classes, methods, fields, parameters, packages, modules and even type uses. They store **metadata** about the marked element.

Annotations themselves **do nothing**: they are passive information. Acting on it is up to the compiler (`@Override`), build tools, annotation processors at compile time or the program itself at run time through reflection (JUnit, Spring, Jackson, Hibernate).

An annotation is written with the `@` symbol before the element:

```java
@Deprecated(since = "2.0", forRemoval = true)
public static long fibonacci(int n) {
    if (n < 0) throw new IllegalArgumentException("n must be non-negative: " + n);
    if (n <= 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

> [!NOTE]
> The compiler marks uses of a method with `@Deprecated(forRemoval = true)` with a warning: `warning: [removal] fibonacci(int) in FibUtils has been deprecated and marked for removal`. An explanation of what to replace the method with is written in the `@deprecated` Javadoc tag.

## Declaring an Annotation

An annotation is declared with the `@interface` keyword. Its **elements** are written as parameterless methods; a default value is set with `default`. Here is a simplified definition of the built-in `@Deprecated`:

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({CONSTRUCTOR, FIELD, LOCAL_VARIABLE, METHOD, PACKAGE, MODULE, PARAMETER, TYPE})
public @interface Deprecated {
    String since() default "";
    boolean forRemoval() default false;
}
```

Implicitly every annotation implements the `java.lang.annotation.Annotation` interface. It cannot extend other annotations or classes.

## Annotation Parameters

Element values are passed in parentheses as `name = value`:

```java
@Deprecated
public void oldMethod() { }

@Deprecated(since = "1.5")
public void veryOldMethod() { }

@Deprecated(since = "1.5", forRemoval = true)
public void anotherVeryOldMethod() { }
```

* If there are no elements, or all have default values, the parentheses are omitted.
* If only the element named **`value`** is given, its name can be omitted: `@SuppressWarnings("unchecked")` instead of `@SuppressWarnings(value = "unchecked")`.
* A single-element array can be passed without curly braces: `@SuppressWarnings({"unchecked", "rawtypes"})` or `@SuppressWarnings("unchecked")`.

> [!WARNING]
> Element values must be **compile-time constants**. The allowed element types are: primitives, `String`, `Class<?>`, enums, other annotations and **one-dimensional** arrays of these types. `null` is forbidden as a value, so "absence" is expressed with a default value (e.g. `""` or a special marker class).

## Meta-Annotations

Annotations used to mark the declarations of other annotations define their behavior.

### @Retention — How Long It Is Kept

| Policy | Where the annotation is available | Typical uses |
| --- | --- | --- |
| `SOURCE` | only in the source code; the compiler discards it | `@Override`, `@SuppressWarnings`, Lombok, annotation processors |
| `CLASS` (default) | in the `.class` file, but **not** at run time | bytecode analysis and transformation tools |
| `RUNTIME` | in the `.class` file and available to reflection at run time | JUnit `@Test`, Spring `@Component`, Jackson `@JsonProperty` |

### @Target — What It Can Be Attached To

`@Target` takes an array of `ElementType` values. Without `@Target` an annotation can be placed on almost any declaration.

| `ElementType` | Element |
| --- | --- |
| `TYPE` | a class, interface, enum, record, annotation |
| `FIELD` | a field (including an enum constant) |
| `METHOD` | a method |
| `PARAMETER` | a method or constructor parameter |
| `CONSTRUCTOR` | a constructor |
| `LOCAL_VARIABLE` | a local variable |
| `ANNOTATION_TYPE` | another annotation (a meta-annotation) |
| `PACKAGE` | a package (in `package-info.java`) |
| `MODULE` | a module (in `module-info.java`) |
| `TYPE_PARAMETER` | a generic type parameter (`<@NonNull T>`) |
| `TYPE_USE` | any **use** of a type |
| `RECORD_COMPONENT` | a record component |

### Other Meta-Annotations

* **`@Documented`** — the annotation appears in the Javadoc of the marked element.
* **`@Inherited`** — a **class** annotation is inherited by subclasses (does not apply to methods, fields and interfaces).
* **`@Repeatable`** — the annotation can be placed several times on the same element.

## Where an Annotation Can Be Placed

```java
@Description("module")                         // module-info.java
module pl.mini.shop { }

@Description("package")                        // package-info.java
package pl.mini.shop;

@Description("class")
public class Stack<@Description("type parameter") T> {

    @Description("field")
    private T[] items;

    @Description("constructor")
    public Stack() { }

    @Description("method")
    public void push(@Description("parameter") T item) {
        @Description("local variable") int size = items.length;
    }

    // TYPE_USE: the annotation applies to the type itself at its place of use
    private List<@NonNull String> names;
    private String @NonNull [] array;
    public @NonNull T pop() { ... }
}

public record Point(@Description("record component") int x, int y) { }
```

A `TYPE_USE` annotation describes not a declaration but a **type**: `List<@NonNull String>` means "a list whose elements cannot be null". Static null analyzers (JSpecify, the Checker Framework) are built on such annotations.

### Several Annotations

Several different annotations can be placed on one element (their order does not matter):

```java
@Test
@Timeout(1)
@DisplayName("sorting a large array")
void sortsLargeArray() { }
```

To allow the same annotation to be placed **several times**, it is marked `@Repeatable` with a **container** annotation:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(Schedules.class)
public @interface Schedule {
    String cron();
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Schedules {
    Schedule[] value();                  // the container
}

@Schedule(cron = "0 0 8 * * MON-FRI")
@Schedule(cron = "0 0 10 * * SAT")
public void sendReport() { }
// the compiler wraps them in @Schedules({...})
```

At run time repeatable annotations are read with the `getAnnotationsByType(Schedule.class)` method.

## Built-in Annotations

| Annotation | What it does |
| --- | --- |
| `@Override` | a compile-time error if the method overrides nothing |
| `@Deprecated` | a warning when a deprecated element is used |
| `@SuppressWarnings("...")` | turns off compiler warnings (`unchecked`, `rawtypes`, `deprecation`, `removal`) |
| `@FunctionalInterface` | checks that the interface has exactly one abstract method |
| `@SafeVarargs` | a method with generic varargs is safe; removes the warning |
| `@Serial` | marks serialization-related members (`serialVersionUID`) for compiler checking |

## Caller Information

Sometimes a method (e.g. a logger or a check) needs to know **where** it was called from: the method name, the class, the line number. At run time this is provided by `StackWalker` (Java 9):

```java
public static void fail(String message) {
    StackWalker.StackFrame caller = StackWalker.getInstance()
            .walk(frames -> frames.skip(1).findFirst())   // 0 — fail itself, 1 — whoever called it
            .orElseThrow();

    System.err.println(message);
    System.err.println("  Called from: " + caller.getClassName() + "." + caller.getMethodName());
    System.err.println("  File: " + caller.getFileName());
    System.err.println("  Line: " + caller.getLineNumber());
    System.exit(1);
}

public static void loadConfiguration(Path configFile) {
    if (!Files.exists(configFile)) {
        fail("Configuration file not found: " + configFile);    // line 24
    }
    System.out.println("Configuration loaded from " + configFile);
}
```

```text
Configuration file not found: appsettings.json
  Called from: pl.mini.App.loadConfiguration
  File: App.java
  Line: 24
```

Walking the stack is a relatively expensive operation (cheaper than creating an exception for its stack trace, but not free). That is why logging libraries determine the call site only when it is actually printed (e.g. the `%L` and `%M` patterns in Logback).
