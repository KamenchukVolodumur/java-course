---
title: The Object Class
description: java.lang.Object — the root of the class hierarchy, its methods, boxing of primitives, toString, equals and hashCode, getClass and class literals, clone.
---

## Object

`java.lang.Object` is **the base class of all classes**. If a class does not specify `extends`, the compiler implicitly adds `extends Object`. Arrays, enums and records are also descendants of `Object`, so any reference can be assigned to a variable of type `Object` (an upcast).

**Primitive types** do **not** belong to this hierarchy: `int` is not an object and has no methods. To use a primitive where an object is expected, it has to be wrapped in a wrapper class.

## Boxing

Assigning a primitive to a variable of type `Object` (or `Integer`) automatically **boxes** the value: it creates a wrapper object on the heap and copies the value into it. The reverse conversion **unboxes** it. A downcast from `Object` requires an explicit cast; if the type does not match, a `ClassCastException` is thrown.

```java
int num = 42;
Object obj = num;               // boxing: Integer.valueOf(42)
int unboxed = (Integer) obj;    // cast to Integer + unboxing
// long l = (Long) obj;         // ClassCastException: it holds an Integer, not a Long
long ok = (Integer) obj;        // OK: unboxing to int, then widening to long
```

Boxing is an expensive operation (a heap allocation), so performance-critical code avoids it. This is also why the library has specialized `IntStream`, `OptionalInt`, `IntFunction` and so on.

## The Definition of Object

In simplified form, the `Object` class looks like this. Methods without `final` are meant to be overridden in subclasses:

```java
public class Object {
    public Object() { }

    public final native Class<?> getClass();
    public boolean equals(Object obj) { return this == obj; }
    public native int hashCode();
    public String toString() {
        return getClass().getName() + "@" + Integer.toHexString(hashCode());
    }
    protected native Object clone() throws CloneNotSupportedException;

    public final native void notify();
    public final native void notifyAll();
    public final void wait() throws InterruptedException { ... }
    public final void wait(long timeoutMillis) throws InterruptedException { ... }

    @Deprecated(since = "9", forRemoval = true)
    protected void finalize() throws Throwable { }
}
```

| Method | Default | Purpose |
| --- | --- | --- |
| `toString()` | `ClassName@hex-hash` | a textual representation for logs and debugging |
| `equals(Object)` | `this == obj` (identity) | logical equality of objects |
| `hashCode()` | a number tied to the object's identity | the hash for `HashMap`/`HashSet` |
| `getClass()` | — (final) | the run-time class of the object |
| `clone()` | a shallow copy if the class implements `Cloneable` | copying (an outdated approach) |
| `wait`/`notify`/`notifyAll` | — (final) | signaling between threads (chapter "Synchronization") |
| `finalize()` | — | deprecated for removal; do not use |

## toString

The `toString` method returns a textual representation of an object. It is called by `println`, string concatenation, the debugger and loggers. All standard classes override it. If a class does not override `toString`, the class name with a hash is printed, which is not very informative for a human.

```java
class Person {
    private final String name;
    private final int age;

    Person(String name, int age) { this.name = name; this.age = age; }

    @Override
    public String toString() {
        return name + ", " + age;
    }
}

Person alice = new Person("Alice", 30);
System.out.println(alice);              // Alice, 30
System.out.println("Person: " + alice); // Person: Alice, 30
```

Records generate `toString` automatically: `Person[name=Alice, age=30]`.

## equals and hashCode

By default `equals` checks **identity** — the same as `==`. Classes that represent *values* (a point, money, a map key) override `equals` to compare contents. Together with it they **must** override `hashCode`.

The `equals` contract:

1. **reflexivity**: `x.equals(x)` is `true`;
2. **symmetry**: `x.equals(y)` if and only if `y.equals(x)`;
3. **transitivity**: `x.equals(y)` and `y.equals(z)` imply `x.equals(z)`;
4. **consistency**: repeated calls give the same result as long as the objects do not change;
5. `x.equals(null)` is `false`.

The `hashCode` contract: if `x.equals(y)`, then `x.hashCode() == y.hashCode()`. The converse is not required: different objects may have the same hash (a collision).

```java
public final class Point {
    private final int x, y;

    public Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                      // a quick check
        if (!(o instanceof Point other)) return false;   // also rejects null
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);                       // 31 * (31 + x) + y
    }
}

Set<Point> set = new HashSet<>();
set.add(new Point(1, 2));
System.out.println(set.contains(new Point(1, 2)));      // true; without hashCode it would be false
```

> [!CAUTION]
> If you override `equals` but not `hashCode`, equal objects end up in different buckets of a `HashMap`/`HashSet`, and the collection will "not find" them. Conversely: do not change the fields `hashCode` depends on while the object is in a hash collection.

> [!TIP]
> `equals`, `hashCode` and `toString` are rarely written by hand. Records generate them automatically, and for ordinary classes the IDE generates them (*Generate → equals() and hashCode()*).

## getClass and Class Literals

The `getClass()` method returns a `Class<?>` object describing the **actual** class of the object **at run time**. A **class literal** `Type.class` gives the same object for a type known **at compile time**. There is exactly one `Class` object for each class (within a class loader), so they can be compared with `==`.

```java
LocalDateTime now = LocalDateTime.now();

System.out.println(now.getClass());                         // class java.time.LocalDateTime
System.out.println(LocalDateTime.class);                    // the same, resolved at compile time
System.out.println(LocalDateTime.class == now.getClass());  // true

Object o = "text";
System.out.println(o.getClass().getSimpleName());           // String: the actual type, not Object
System.out.println(int.class + " " + int[].class.getName()); // int [I
```

`Class` is the entry point to reflection: through it you can find out a class's fields, methods and annotations and even create an instance (chapter "Reflection").

## clone

`clone()` creates a **shallow copy** of an object (the field values are copied, i.e. references, not the objects they point to). For the method to work, the class must implement the `Cloneable` marker interface and make `clone` public; otherwise `CloneNotSupportedException` is thrown.

```java
int[] a = {1, 2, 3};
int[] b = a.clone();     // for arrays clone works out of the box and throws no exceptions
b[0] = 99;
System.out.println(a[0]);   // 1
```

The `Cloneable` mechanism is considered a failure (it breaks the usual rules of constructors and does not combine well with `final` fields). For your own classes, write a **copy constructor** (`new Person(other)`) or a factory method (`Person.copyOf(other)`) instead.
