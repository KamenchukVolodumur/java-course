---
title: Reflection
description: The Reflection API — obtaining a Class, inspecting fields, methods and constructors, modifiers, invoking methods and constructors, accessing private fields and module restrictions, MethodHandle and VarHandle for fast invocation, reflection on generics, custom annotations at run time, dynamic proxies, reflection and AOT compilation.
---

## Reflection

**Reflection** is a mechanism that lets a program analyze its own structure at run time: find out which types exist and which members they have, create objects of classes whose names become known only at run time, call methods and read fields. The annotations from the previous page are useless until someone reads them: reflection makes it possible to read them and act on them.

> [!NOTE]
> Reflection is a form of **run-time metaprogramming**. Java also has **compile-time** metaprogramming: annotation processors analyze code and generate new source files (the "Other Topics" chapter).

Operations through reflection are much slower than direct calls, bypass compiler checks (member names are strings that break during refactoring) and make debugging harder. But some tasks are much harder to solve without it:

* **test frameworks** — find all methods annotated with `@Test` and call them;
* **serialization** — walk an object's fields and convert it, for example, to JSON;
* **dependency injection** (Spring, CDI) — find a constructor and pass it the required objects;
* **ORM** (Hibernate) — map a class's fields to table columns;
* **plugin systems** — load an external JAR and find the classes implementing the `Plugin` interface.

## The API Packages

Reflection is available through the classes of the `java.lang`, `java.lang.reflect` and `java.lang.invoke` packages:

```text
Module                                java.lang.Module
└── Package                           java.lang.Package
    └── Class<T>                      java.lang.Class: a type (class, interface, enum, record, array, primitive)
        ├── Field                     a field
        ├── Constructor<T>            a constructor ─┐
        ├── Method                    a method ──────┴── Executable ── Parameter
        ├── RecordComponent           a record component
        └── Class<?>[]                nested types, interfaces
AnnotatedElement                      the common interface of everything that can have annotations
Type ── ParameterizedType, TypeVariable, WildcardType, GenericArrayType   (information about generics)
MethodHandle, VarHandle               java.lang.invoke: fast access optimized by the JIT
Proxy, InvocationHandler              dynamic interface implementations
```

The standard library has limited support for generating **new classes** at run time (dynamic proxies, `Lookup.defineHiddenClass`, and since Java 24 the ClassFile API for building bytecode). Usually the ByteBuddy or ASM libraries are used for this: this is how Mockito (mock objects), Hibernate (lazy proxies) and Spring (class proxies) work.

## Getting Type Information

The entry point of reflection is the **`Class<T>`** object representing a type. We will examine this class:

```java
package pl.mini.reflection;

public class Person {
    private String id;
    private String firstName;
    private String lastName;
    private LocalDate birthday;

    public Person(String firstName, String lastName, LocalDate birthday) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthday = birthday != null ? birthday : LocalDate.now();
        this.id = makeId(this.birthday);
    }

    public Person(String firstName, String lastName) { this(firstName, lastName, null); }

    public String getFirstName() { return firstName; }
    public String getFullName() { return firstName + " " + lastName; }
    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public boolean isAdult() {
        return birthday.plusYears(18).isBefore(LocalDate.now());
    }

    public static String makeId(LocalDate birthday) {
        return String.format("%04d%02d%02d%05d", birthday.getYear(), birthday.getMonthValue(),
                birthday.getDayOfMonth(), ThreadLocalRandom.current().nextInt(100_000));
    }
}
```

A `Class` object can be obtained in three ways:

1. **With a class literal** — the type is known at compile time:

```java
Class<Person> personType = Person.class;
Class<int[]> arrayType = int[].class;
Class<Integer> primitive = int.class;           // primitives have Class objects too
```

2. **With the `getClass()` method** — the actual type of an object at run time:

```java
Person person = new Person("Alice", "Smith");
Class<? extends Person> type = person.getClass();
```

3. **By the fully qualified name** with `Class.forName` — the type becomes known only at run time (e.g. from a configuration file):

```java
Class<?> type = Class.forName("pl.mini.reflection.Person");   // ClassNotFoundException if absent
Class<?> nested = Class.forName("java.util.Map$Entry");       // nested classes — with $
```

`Class.forName` loads and **initializes** the class (runs static blocks). The method looks the class up with the loader of the class it is called from; another loader can be passed explicitly: `Class.forName(name, false, loader)`.

### Class Information

```java
Class<?> c = Person.class;
c.getName();               // pl.mini.reflection.Person
c.getSimpleName();         // Person
c.getPackageName();        // pl.mini.reflection
c.getSuperclass();         // class java.lang.Object
c.getInterfaces();         // the implemented interfaces
Modifier.toString(c.getModifiers());   // "public"
c.isInterface(); c.isEnum(); c.isRecord(); c.isArray(); c.isPrimitive(); c.isSealed();
c.getPermittedSubclasses();            // for sealed classes
c.getModule();
Person.class.isAssignableFrom(Student.class);   // true: a Student can be assigned to a Person
Person.class.isInstance(obj);                   // the counterpart of obj instanceof Person
```

### Class Members

For each kind of member there are two pairs of methods:

| Method | What it returns |
| --- | --- |
| `getFields()`, `getMethods()`, `getConstructors()` | only **public** members, **including inherited ones** (constructors are not inherited) |
| `getDeclaredFields()`, `getDeclaredMethods()`, `getDeclaredConstructors()` | **all** members declared **in this class** (any visibility, including static), **without** inherited ones |
| `getField(name)`, `getMethod(name, paramTypes...)`, `getConstructor(paramTypes...)` | one public member by name and parameter types |
| `getDeclaredField(name)`, `getDeclaredMethod(...)`, `getDeclaredConstructor(...)` | one declared member of any visibility |

```java
for (Field f : Person.class.getDeclaredFields()) {
    System.out.printf("%-10s %-12s %s%n",
            Modifier.toString(f.getModifiers()), f.getType().getSimpleName(), f.getName());
}
// private    String       id
// private    String       firstName
// ...

for (Method m : Person.class.getDeclaredMethods()) {
    System.out.println(m);    // public boolean pl.mini.reflection.Person.isAdult() ...
}

Constructor<Person> ctor = Person.class.getConstructor(String.class, String.class, LocalDate.class);
for (Parameter p : ctor.getParameters()) {
    System.out.println(p.getType().getSimpleName() + " " + p.getName());   // arg0, arg1... without -parameters
}
```

> [!NOTE]
> The order of the elements returned by `getDeclaredMethods()` and `getDeclaredFields()` is **not guaranteed** by the specification. Parameter names are available only when the code is compiled with the `javac -parameters` flag (Spring Boot and many frameworks enable it in the build); otherwise they look like `arg0`, `arg1`.

Java has no properties as a separate kind of member: they are recognized by the JavaBeans convention (`getX`/`isX`/`setX`). This is done, for example, by `java.beans.Introspector`.

## Invoking Members

### Methods

```java
Person person = new Person("Alice", "Smith", LocalDate.now().minusYears(21));

Method isAdult = Person.class.getMethod("isAdult");          // NoSuchMethodException if absent
Object result = isAdult.invoke(person);                      // arguments are varargs Object...
System.out.println("Adult: " + result);                      // true (boxed into a Boolean)

Method makeId = Person.class.getMethod("makeId", LocalDate.class);
String id = (String) makeId.invoke(null, LocalDate.of(2000, 1, 1));   // null — for a static method
```

If the invoked method throws an exception, `invoke` wraps it in an **`InvocationTargetException`**; the real cause is in `getCause()`. Wrong arguments give an `IllegalArgumentException`, missing access an `IllegalAccessException`.

### Constructors

```java
Constructor<Person> ctor = Person.class.getConstructor(String.class, String.class, LocalDate.class);
Person john = ctor.newInstance("John", "Doe", LocalDate.now().minusYears(42));
System.out.println(john.getFullName());

Object fromName = Class.forName("java.util.ArrayList").getDeclaredConstructor().newInstance();
```

The deprecated `Class.newInstance()` is not used: it "smuggles" the constructor's checked exceptions through without declaring them.

### Fields and Private Members

Reflection makes it possible to **break encapsulation**: read or change a private field, call a private method. For that, access must be explicitly opened with `setAccessible(true)`:

```java
Person person = new Person("Alice", "Smith", LocalDate.now().minusYears(21));

Field idField = Person.class.getDeclaredField("id");
idField.setAccessible(true);                       // turns off the private check
String id = (String) idField.get(person);
System.out.println("id before: " + id);
idField.set(person, id.substring(0, 8));
System.out.println("id after: " + idField.get(person));

Field birthday = Person.class.getDeclaredField("birthday");
birthday.setAccessible(true);
birthday.set(person, ((LocalDate) birthday.get(person)).minusYears(2));
System.out.println("Age: " + (LocalDate.now().getYear() - person.getBirthday().getYear()));   // 23
```

> [!WARNING]
> `setAccessible(true)` works only when the module containing the class **opens** the package to the accessing module (the `opens` directive in `module-info.java`). For the JDK's own classes (`java.base`) this is forbidden by default: an attempt to open, for example, the private field `String.value` throws an `InaccessibleObjectException`. Code on the classpath (without modules) can freely open its own classes.

`final` fields can be changed through reflection only for ordinary classes (and even then the JIT may not see the change); the fields of records and `static final` fields cannot be changed.

## Fast Access: MethodHandle and VarHandle

`Method.invoke` is slow: on each call the access rights and argument types are checked, and primitives are boxed into an `Object[]` array. For frequent calls, a **`MethodHandle`** from `java.lang.invoke` is used: the access rights are checked **once** during lookup, and the JIT can inline such a call almost like a direct one.

```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle isAdult = lookup.findVirtual(Person.class, "isAdult", MethodType.methodType(boolean.class));

Person person = new Person("Alice", "Smith", LocalDate.now().minusYears(21));
for (int i = 0; i < 1_000_000; i++) {
    boolean adult = (boolean) isAdult.invokeExact(person);   // the types must match the signature exactly
}

// bind to an object and convert into a functional interface
BooleanSupplier supplier = MethodHandleProxies.asInterfaceInstance(BooleanSupplier.class, isAdult.bindTo(person));
System.out.println(supplier.getAsBoolean());
```

A **`VarHandle`** gives fast access to fields, including private ones through a "privileged" lookup, as well as atomic operations (the "Synchronization" chapter):

```java
VarHandle idHandle = MethodHandles.privateLookupIn(Person.class, MethodHandles.lookup())
        .findVarHandle(Person.class, "id", String.class);
String id = (String) idHandle.get(person);
idHandle.set(person, "00000000");
```

## Module- and Package-Level Reflection

Unlike some platforms, Java has **no** method to "list all classes of a package or JAR": classes are loaded lazily, and the JVM does not know in advance which ones exist. To find classes, the loader's resources (the `.class` files in directories and JARs) are inspected, or scanning libraries (ClassGraph, Reflections) are used, or — best of all — **explicit registration** via `ServiceLoader` (the "Modules and Class Loaders" page).

```java
Module module = Person.class.getModule();
System.out.println(module.getName());          // null for classes on the classpath (the unnamed module)
System.out.println(module.getPackages());      // the packages of a named module
Package pkg = Person.class.getPackage();
System.out.println(pkg.getImplementationVersion());   // from MANIFEST.MF, if set
```

## Generics and Reflection

Because of type erasure, `List<String>` and `List<Integer>` are the same `Class` at run time. But declarations **keep** the full information about generic types, and reflection can read it through the `Type` interface:

```java
class Repository {
    private Map<String, List<Integer>> index;
    public List<Person> findAll() { return List.of(); }
}

Field f = Repository.class.getDeclaredField("index");
System.out.println(f.getType());               // interface java.util.Map — erased
System.out.println(f.getGenericType());        // java.util.Map<java.lang.String, java.util.List<java.lang.Integer>>

if (f.getGenericType() instanceof ParameterizedType pt) {
    for (Type arg : pt.getActualTypeArguments()) {
        System.out.println("  argument: " + arg.getTypeName());
    }
}

Type ret = Repository.class.getMethod("findAll").getGenericReturnType();   // java.util.List<pl...Person>
TypeVariable<?>[] params = Map.class.getTypeParameters();                  // [K, V]
```

Arrays of an arbitrary type are created with `java.lang.reflect.Array`:

```java
Object arr = Array.newInstance(String.class, 3);   // new String[3]
Array.set(arr, 0, "a");
System.out.println(Array.getLength(arr));          // 3
```

## Custom Annotations at Run Time

Annotations with `RetentionPolicy.RUNTIME` are read with the methods of the `AnnotatedElement` interface, which is implemented by `Class`, `Method`, `Field`, `Constructor`, `Parameter` and others:

| Method | What it returns |
| --- | --- |
| `getAnnotation(A.class)` | the annotation or `null` |
| `isAnnotationPresent(A.class)` | whether the annotation is present |
| `getAnnotations()` | all annotations (for a class — including `@Inherited` ones) |
| `getDeclaredAnnotations()` | the annotations placed directly on the element |
| `getAnnotationsByType(A.class)` | an array, taking `@Repeatable` into account |

An example — a minimal tool for measuring the execution time of methods marked with a `@Benchmark` annotation:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Benchmark {
    int repetitions() default 100;
}

public class Main {
    public static void main(String[] args) throws Exception {
        for (Method method : Main.class.getDeclaredMethods()) {
            Benchmark benchmark = method.getAnnotation(Benchmark.class);
            if (benchmark == null) continue;

            if (method.getParameterCount() != 0 || !Modifier.isStatic(method.getModifiers())) {
                System.out.println("Method " + method.getName() + " must be static and parameterless");
                continue;
            }

            int rep = benchmark.repetitions();
            System.out.println("Found a benchmark: " + method.getName() + ", repetitions: " + rep);
            MethodHandle handle = MethodHandles.lookup().unreflect(method);   // faster than invoke
            long start = System.nanoTime();
            for (int i = 0; i < rep; i++) {
                handle.invoke();
            }
            long micros = (System.nanoTime() - start) / rep / 1000;
            System.out.println(method.getName() + ": " + micros + " µs per call");
        }
    }

    @Benchmark
    public static void stringConcat() {
        String s = "";
        for (int i = 0; i < 10_000; i++) s += 'a';
    }

    @Benchmark(repetitions = 10_000)
    public static void stringBuilder() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10_000; i++) sb.append('a');
        String s = sb.toString();
    }

    @Benchmark
    public static void stringRepeat() {
        String s = "a".repeat(10_000);
    }
}
```

> [!NOTE]
> Such a "benchmark" gives only rough numbers: the JIT is not warmed up yet, and the results of the computations are not used, so the optimizer may throw away part of the work. For real measurements **JMH** (Java Microbenchmark Harness) is used, which solves these problems.

## Dynamic Proxies

`java.lang.reflect.Proxy` creates **at run time** an object that implements the given interfaces and passes every call to an `InvocationHandler`. This is how Spring AOP (`@Transactional`), mock objects and HTTP clients like Retrofit work, where an interface describes the API and the library generates the implementation.

```java
interface Calculator {
    int add(int a, int b);
    int divide(int a, int b);
}

@SuppressWarnings("unchecked")
static <T> T logging(T target, Class<T> iface) {
    return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class<?>[]{iface},
            (proxy, method, args) -> {
                System.out.println("-> " + method.getName() + Arrays.toString(args));
                try {
                    Object result = method.invoke(target, args);
                    System.out.println("<- " + result);
                    return result;
                } catch (InvocationTargetException e) {
                    throw e.getCause();                     // rethrow the real exception
                }
            });
}

Calculator calc = logging(new Calculator() {
    public int add(int a, int b) { return a + b; }
    public int divide(int a, int b) { return a / b; }
}, Calculator.class);

calc.add(2, 3);        // -> add[2, 3]   <- 5
```

JDK proxies implement only **interfaces**. For classes, libraries generate subclasses (ByteBuddy, cglib).

## Reflection and AOT Compilation

When compiling into a native executable (**GraalVM Native Image**, the "Other Topics" chapter), the compiler analyzes the code and throws away everything it believes is never accessed. Classes and members used **only through reflection** (e.g. a class whose name is read from configuration) may be missing at run time. That is why they must be described in configuration files (`reflect-config.json`, in newer versions `reachability-metadata.json`). An agent that records all reflective accesses during a test run helps generate these files:

```bash
java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image -jar app.jar
```

That is why modern frameworks (Micronaut, Quarkus, Spring AOT) and libraries increasingly replace reflection with **compile-time code generation** by annotation processors: the result is faster, checked by the compiler and AOT-compatible.
