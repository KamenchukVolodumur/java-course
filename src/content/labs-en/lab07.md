---
title: Lab 07: Annotations and Reflection — a Mini JUnit, a Serializer and Plugins
description: Custom annotations with RetentionPolicy.RUNTIME, a reflection-based test runner (@Test, @BeforeEach, @Disabled, expected exceptions), a record-to-JSON serializer with the @JsonName/@JsonIgnore annotations, loading plugins by class name and dynamic proxies for logging and caching.
---

## Before You Start

> [!NOTE]
> **Lectures:** 04.8 "Generics", 08.1 "Annotations", 08.2 "Reflection", 08.3 "Modules and Class Loaders" · **Time:** 3 h · **Points:** 10

You will write simplified versions of the mechanisms that JUnit, Jackson and Spring rely on. After this lab the "magic" of frameworks will become understandable.

```text
src/main/java/pl/mini/reflect/
├── testing/   Test.java  BeforeEach.java  Disabled.java  Assert.java  TestRunner.java  TestReport.java
├── json/      JsonName.java  JsonIgnore.java  Json.java
├── plugins/   Plugin.java  PluginInfo.java  PluginRegistry.java
├── proxy/     Cacheable.java  Proxies.java
└── Main.java  (given)
```

### Rules

* Uncomment the `STAGE N` blocks in `Main` one by one. The output must match the expected one.
* The order of the methods returned by `getDeclaredMethods()` is **not guaranteed**. Wherever the order matters, sort by name.

> [!CAUTION]
> Using ready-made libraries (JUnit, Jackson, Gson, ByteBuddy) is forbidden. Only `java.lang.reflect` and `java.lang.annotation`.

## A Quick Theory Recap

### Declaring an Annotation

```java
@Retention(RetentionPolicy.RUNTIME)       // without this, reflection will not see the annotation!
@Target(ElementType.METHOD)
public @interface Test {
    Class<? extends Throwable> expected() default None.class;
    final class None extends Throwable { private None() { } }
}
```

### Reflection: Methods, Constructors, Invocation

```java
Class<?> c = obj.getClass();
Method[] ms = c.getDeclaredMethods();          // all methods of THIS class
Arrays.sort(ms, Comparator.comparing(Method::getName));

Object instance = c.getDeclaredConstructor().newInstance();
m.setAccessible(true);                         // for non-public methods
try {
    m.invoke(instance);
} catch (InvocationTargetException e) {
    Throwable real = e.getCause();             // the real exception from the method
}
```

### Records through Reflection

```java
for (RecordComponent rc : obj.getClass().getRecordComponents()) {   // in declaration order
    String name = rc.getName();
    Object value = rc.getAccessor().invoke(obj);
    JsonName ann = rc.getAnnotation(JsonName.class);    // an annotation with @Target(RECORD_COMPONENT)
}
```

### A Dynamic Proxy

```java
@SuppressWarnings("unchecked")
static <T> T wrap(T target, Class<T> iface, InvocationHandler h) {
    return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class<?>[]{iface}, h);
}
```

**All** calls to the proxy go through the `InvocationHandler`, including `toString`, `hashCode` and `equals`.

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
✓ addsElement
✓ freshDataEachTime
- notReady (disabled)
Passed: 2, failed: 0, skipped: 1
✗ crashes: IllegalStateException: boom
✓ dividesByZero
✗ expectedButNotThrown: expected IllegalStateException
✗ wrongSum: expected 7, got 6
Passed: 1, failed: 3, skipped: 0
{"name":"Anna","age":21,"address":{"city":"Warsaw","zip_code":"00-661"},"tags":["java","kotlin"],"score":null}
["say \"hi\"",1,true]
OK: unsupported type: java.lang.Object
NotAPlugin: does not implement Plugin
NoDefaultCtor: no public parameterless constructor
pl.mini.Missing: class not found
reverse v?
upper v1.2
AVAJ
2 [price(tea) -> 4.5, price(coffee) -> 9.0, hello(Ola) -> Hi Ola, hello(Ola) -> Hi Ola]
OK: NPE, price(null) !! NullPointerException
```

## Stage 1: A Test Runner (2 pts)

Annotations (all `RUNTIME`, `METHOD`): `@Test` (with the `expected` element, see the theory), `@BeforeEach`, `@Disabled`.

```java
public final class Assert {
    public static void equal(Object expected, Object actual);   // AssertionError("expected E, got A")
}

public record TestReport(int passed, int failed, int skipped, List<String> lines) {
    @Override public String toString();   // all lines + the summary line, each ending with \n
}

public final class TestRunner {
    public static TestReport run(Class<?> testClass);
}
```

* Test methods are the methods with `@Test`, **sorted by name**. Methods without the annotation are not called.
* For **each** test a **new** instance of the class is created (as in JUnit), and then all `@BeforeEach` methods are called.
* `@Disabled` → the line `- name (disabled)`, the method is not called.
* Success → `✓ name`. The summary: `Passed: P, failed: F, skipped: S`.
* Methods may be package-private: use `setAccessible(true)`.
* `Assert.equal` compares with `Objects.equals`.

> [!TIP]
> Think about why JUnit creates a new instance for each test. If there were one instance, `addsElement` would leave four elements in `data`, and the result of `freshDataEachTime` would depend on the order of the tests.

## Stage 2: Failures and Expected Exceptions (2 pts)

Extend `TestRunner`:

| Situation | Report line |
| --- | --- |
| an `AssertionError` | `✗ name: <message>` |
| another, unexpected exception | `✗ name: <SimpleName>: <message>` |
| `expected = X`, X or its subclass was thrown | `✓ name` |
| `expected = X`, nothing was thrown | `✗ name: expected <X.SimpleName>` |
| `expected = X`, a different exception was thrown | `✗ name: expected X, got <SimpleName>` |

* Do not forget to unwrap the `InvocationTargetException` → `getCause()`.
* An exception in `@BeforeEach` → the test fails, with the line `✗ name: error in @BeforeEach: ...`.
* Check "a subclass" with `expected.isInstance(cause)`.

## Stage 3: A Reflection-Based JSON Serializer (2 pts)

The `@JsonName(String value)` and `@JsonIgnore` annotations: `RUNTIME`, `@Target(ElementType.RECORD_COMPONENT)`.

```java
public final class Json {
    public static String write(Object value);
}
```

The supported values:

| Type | JSON |
| --- | --- |
| `null` | `null` |
| `String`, `Character` | a string in quotes; `"` → `\"`, `\` → `\\`, a line break → `\n` |
| `Number`, `Boolean` | as is (`String.valueOf`) |
| a `Collection`, an array of objects | `[a,b,c]` |
| a `Map<String, ?>` | `{"k":v}` |
| a **record** | an object; fields in component order; `@JsonName` changes the key; `@JsonIgnore` skips the field |
| anything else | `IllegalArgumentException("unsupported type: " + the fully qualified class name)` |

* No spaces between elements (a compact format).
* Recursion for nested records and collections.

> [!NOTE]
> An annotation on a record component "propagates" to the field, the accessor and the constructor parameter only when its `@Target` allows it. With `@Target(RECORD_COMPONENT)` it is visible exactly through `RecordComponent.getAnnotation`. This is how Jackson annotations on records work.

## Stage 4: A Plugin Registry (2 pts)

```java
public interface Plugin {
    String name();
    String apply(String input);
}

@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.TYPE)
public @interface PluginInfo { String version(); }

public final class PluginRegistry {
    public static PluginRegistry load(List<String> classNames);
    public List<Plugin> plugins();               // sorted by name()
    public List<String> errors();                // in the order of the input list
    public String version(Plugin p);             // from @PluginInfo or "?"
    public UnaryOperator<String> pipeline(String... names);   // a composition in the given order
}
```

For each name:

1. `Class.forName(name)`. A `ClassNotFoundException` → the error `"<name>: class not found"`.
2. `Plugin.class.isAssignableFrom(c)`, otherwise → `"<SimpleName>: does not implement Plugin"`.
3. A public parameterless constructor (`c.getConstructor()`), otherwise → `"<SimpleName>: no public parameterless constructor"`.
4. Create an instance and register it.

* `pipeline` for an unknown name → `IllegalArgumentException`. Build the composition with `Function.andThen`, not with a loop on every call.

> [!TIP]
> No points: load a plugin from a separate JAR with a `URLClassLoader` or `ServiceLoader` (the file `META-INF/services/pl.mini.reflect.plugins.Plugin`), as described on the "Modules and Class Loaders" page.

## Stage 5: Dynamic Proxies (2 pts)

```java
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
public @interface Cacheable { }

public final class Proxies {
    public static <T> T logging(T target, Class<T> iface, List<String> log);
    public static <T> T cached(T target, Class<T> iface);
}
```

### logging

After each call of an interface method it adds a line to `log`:

* success: `name(arg1, arg2) -> result` (the arguments through `String.valueOf`, without arguments — `name()`);
* an exception: `name(args) !! SimpleName`, after which **the same** exception is rethrown (not an `InvocationTargetException` or an `UndeclaredThrowableException`).

### cached

For methods with `@Cacheable` it remembers the result by the argument list (`Arrays.asList(args)` as a `HashMap` key) and does not call the target object again. Other methods are passed through unchanged. Exceptions are not cached.

* Do not log or cache the methods of the `Object` class (`toString`, `hashCode`, `equals`): just pass them to `target`.

> [!IMPORTANT]
> This is exactly how `@Transactional` and `@Cacheable` work in Spring. Hence the well-known trap: if an object's method calls another of its own methods through `this.other()`, the call goes **past the proxy**, and the annotation does not take effect.

Commit, tag it `lab07` and push.
