---
title: null and Optional
description: The null value for primitives and references, NullPointerException and helpful messages, wrappers as "a number or nothing", three-valued logic, Optional and its API, anti-patterns, replacements for null operators, static analysis with annotations.
---

## null in Java

* **Primitive** variables cannot be `null`: they always contain a value. `int i = null;` is a compile-time error.
* **Reference** variables can be `null`: it means "does not point to any object". The Java compiler by itself **does not check** whether a reference may be `null`.

Accessing a field or method through `null` throws a **`NullPointerException`** (NPE). Since Java 14 (JEP 358) the message says exactly what was `null`:

```java
record Address(String city) { }
record Customer(String name, Address address) { }

Customer c = new Customer("Ola", null);
System.out.println(c.address().city().length());
// java.lang.NullPointerException: Cannot invoke "Address.city()"
//     because the return value of "Customer.address()" is null
```

## Missing Values for Primitives

To let a variable of a numeric type "have no value", a **wrapper** (`Integer`, `Double`, `Boolean`) is used; it is a reference type and allows `null`:

```java
Integer maybe = null;            // "a number or nothing"
Integer five = 5;                // autoboxing

if (maybe != null) {
    int value = maybe;           // unboxing after the check
}
int boom = maybe;                // NullPointerException during unboxing!
```

> [!CAUTION]
> Unboxing `null` is an insidious source of NPEs: `int total = map.get("x");` crashes if the key is absent. `map.getOrDefault("x", 0)` is safer.

For primitives there are also the specialized **`OptionalInt`**, **`OptionalLong`** and **`OptionalDouble`** without boxing (they are returned, for example, by `IntStream.max()` and `average()`).

### Arithmetic with Missing Values

Operators on wrappers unbox them automatically, so any `null` gives an NPE. If `null` should "propagate" (the result is missing when at least one operand is missing), this is done explicitly:

```java
static Integer add(Integer x, Integer y) {
    return (x == null || y == null) ? null : x + y;
}
```

### Three-Valued Logic

A `Boolean` can have three states: `true`, `false` and `null` ("unknown"), but the `&&`, `||`, `!` operators throw an NPE with `null`. If logic with an "unknown" value is needed (like `NULL` in SQL), it is implemented explicitly or modeled with an enum:

```java
enum Answer { YES, NO, UNKNOWN }

static Answer and(Answer a, Answer b) {
    if (a == Answer.NO || b == Answer.NO) return Answer.NO;
    if (a == Answer.UNKNOWN || b == Answer.UNKNOWN) return Answer.UNKNOWN;
    return Answer.YES;
}
```

## Optional

`java.util.Optional<T>` is a container that either holds a non-null value or is empty. Its main purpose is **the return type of a method** that may return nothing. The signature then explicitly tells the caller: "there may be no result, handle this case".

```java
Optional<User> findByEmail(String email) {
    return Optional.ofNullable(users.get(email));     // empty if get returned null
}
```

### Creating

```java
Optional<String> a = Optional.of("value");           // the value must not be null (otherwise an NPE)
Optional<String> b = Optional.ofNullable(maybeNull); // null -> empty
Optional<String> c = Optional.empty();
```

### Getting the Value

| Method | Value present | Value absent |
| --- | --- | --- |
| `orElse(x)` | the value | `x` (evaluated **always**) |
| `orElseGet(() -> x)` | the value | the supplier's result (evaluated only when needed) |
| `orElseThrow()` | the value | `NoSuchElementException` |
| `orElseThrow(() -> ex)` | the value | the given exception |
| `get()` | the value | `NoSuchElementException` (avoid: the same as `orElseThrow()`, but with a worse name) |

```java
String name = findByEmail("a@b.pl")
        .map(User::name)                       // transform if a value is present
        .filter(n -> !n.isBlank())             // drop it if the condition is false
        .orElse("guest");

User user = findByEmail(email)
        .orElseThrow(() -> new NoSuchElementException("No user " + email));

Config cfg = loadFromFile().orElseGet(Config::defaults);       // defaults() only when needed
```

### Working without Unwrapping

```java
findByEmail(email).ifPresent(u -> System.out.println("Welcome, " + u.name()));

findByEmail(email).ifPresentOrElse(
        u -> System.out.println("Found " + u.name()),
        () -> System.out.println("Not found"));

Optional<Address> address = findByEmail(email).flatMap(User::address);   // a method that itself returns Optional

Optional<User> any = findInCache(id).or(() -> findInDatabase(id));        // a fallback source (Java 9)

long count = Stream.of(id1, id2, id3)
        .map(this::findById)          // Stream<Optional<User>>
        .flatMap(Optional::stream)    // only the present values
        .count();
```

`map` and `flatMap` make it possible to build safe access chains without checks at every step:

```java
String city = Optional.ofNullable(customer)
        .map(Customer::address)
        .map(Address::city)
        .orElse("unknown");
```

### Anti-Patterns

> [!WARNING]
> * `Optional` as a class **field** or a method **parameter**: it is not serializable, takes an extra object and adds yet another possible `null` (the `Optional` itself can be `null`). For fields use `null` with documentation or a default value, and for parameters — overloads.
> * `Optional<List<T>>`: return an empty collection.
> * `if (opt.isPresent()) { opt.get() ... }`: this is the same null check, only longer. Use `map`/`ifPresent`/`orElse`.
> * `Optional.of(possiblyNull)`: throws an NPE; `ofNullable` is needed.
> * Returning `null` from a method whose type is `Optional`.

## Replacements for null Operators

Java has no special operators for working with `null` ("value or fallback", "safe navigation"). Here are the typical equivalents:

```java
// value or fallback
String s2 = s1 != null ? s1 : "non-null";
String s3 = Objects.requireNonNullElse(s1, "non-null");
String s4 = Objects.requireNonNullElseGet(s1, () -> computeDefault());
String s5 = Optional.ofNullable(s1).orElse("non-null");

// value or exception (argument validation)
this.name = Objects.requireNonNull(name, "name must not be null");

// assign only if still null (lazy initialization)
if (cache == null) cache = new HashMap<>();
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);   // for maps

// safe navigation
String text = sb == null ? null : sb.toString();
String city = Optional.ofNullable(customer).map(Customer::address).map(Address::city).orElse(null);

// null-safe utilities
Objects.equals(a, b);                 // true if both are null
Objects.hash(a, b);                   // null gives 0
String.valueOf(obj);                  // "null" instead of an NPE
Objects.toString(obj, "—");           // fallback text
```

## How to Avoid null

* Return **empty collections** (`List.of()`, `Collections.emptyMap()`), not `null`.
* Validate arguments at the entry of public methods (`Objects.requireNonNull`), so that the error shows up immediately and not ten calls later.
* Initialize fields in the constructor; use `final`.
* For "may be absent" in results — `Optional`.
* For "empty" objects a **Null Object** is sometimes convenient — an implementation that does nothing: `Consumer<String> noLog = s -> { };`.

## Static Analysis: @Nullable and @NonNull Annotations

The Java compiler does not track `null`, but IDEs and static analyzers can, if the intentions are marked with annotations. The modern standard is the **JSpecify** library (`org.jspecify:jspecify`), whose annotations are understood by IntelliJ IDEA, NullAway, the Checker Framework and Kotlin.

```java
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked                                 // in this class (or package) types are non-null by default
public class UserService {

    public @Nullable User findByEmail(String email) {     // may return null
        return users.get(email);
    }

    public int nameLength(@Nullable String name) {
        // return name.length();          // IDE/NullAway: dereference of possibly-null reference
        return name == null ? 0 : name.length();
    }
}
```

```java
UserService service = new UserService();
service.nameLength(null);                   // OK: the parameter is marked @Nullable
User u = service.findByEmail("x");
// u.name();                                // warning: u may be null
```

> [!NOTE]
> Annotations do not change the program's behavior at run time: a `NullPointerException` still occurs if the warning is ignored. But combined with an analyzer in the build (e.g. NullAway as a compiler plugin that turns warnings into errors) they catch most NPEs before the program runs. The `@NullMarked` annotation is usually put on the whole package at once in `package-info.java`.
