---
title: Type System
description: Primitive and reference types in Java, assignment semantics, null, the stack and the heap, passing parameters to methods.
---

## Two Categories of Types

Java has two categories of types, which determine how data is stored in memory and how the language treats it:

* **primitive types**;
* **reference types**.

The set of primitive types is **fixed**: there are exactly eight of them, and you cannot create your own primitive type. Every type declared by a programmer — a class, interface, enum, record or array — is a reference type.

## Primitive Types

A variable of a primitive type stores **the value itself**. Each variable has its own independent copy of the data. Local variables of primitive types live in the method's stack frame, and fields of primitive types live inside the object they belong to.

**Primitive types:**

* integer: `byte`, `short`, `int`, `long`;
* floating-point: `float`, `double`;
* character: `char`;
* boolean: `boolean`.

## Reference Types

A variable of a reference type stores a **reference** (an address) to an object located on the **heap**. The variable itself (e.g. a local one) lives on the stack, but points to data elsewhere.

**Built-in reference types:**

* `String`;
* `Object` — the common ancestor of all classes;
* arrays (`int[]`, `String[]`);
* primitive wrapper classes (`Integer`, `Double`, `Boolean` …).

**Reference types declared by the programmer:**

* `class` (including `record`);
* `interface` (including `@interface` annotations);
* `enum`.

## Assignment Semantics

What the assignment operator `=` copies depends on the category of the type.

### Primitive Types

Assigning a variable of a primitive type creates a **full copy of the value**. The variables are independent afterwards: changing one does not affect the other.

```java
int a = 3;
int b = a;        // b receives a COPY of the value
b = 10;

System.out.println(a);   // 3
System.out.println(b);   // 10
```

```text
stack
┌─────────┐
│ a │  3  │
├─────────┤
│ b │ 10  │
└─────────┘
```

### Reference Types

Assigning a variable of a reference type copies only the **reference** (the object's address). Both variables point to **the same object** in memory. Changing the object's data through one variable is visible through the other.

```java
class Person {
    String name;
    int age;
}

Person alice = new Person();
alice.name = "Alice";
alice.age = 16;

Person bob = alice;        // A COPY OF THE REFERENCE: the same object

bob.name = "Bob";
bob.age = 18;

System.out.println(alice.name + ", " + alice.age);   // Bob, 18
System.out.println(bob.name + ", " + bob.age);       // Bob, 18
```

```text
     stack                         heap
┌───────────────┐
│ alice │ ●─────┼──────┐
├───────────────┤      ▼
│ bob   │ ●─────┼──► ┌──────────────────┐
└───────────────┘    │ Person           │
                     │ name: "Bob"      │
                     │ age:  18         │
                     └──────────────────┘
```

To get an independent copy of an object, it has to be created explicitly: with a copy constructor (`new Person(other)`), a factory method or, for collections, `new ArrayList<>(list)`, `List.copyOf(list)`.

> [!TIP]
> The simplest way to avoid surprises caused by shared mutable state is **immutable objects** (all fields `final`, no setters, e.g. records). A reference to an immutable object can be freely passed around and copied: nobody can change it.

## The null Value

* A variable of a **primitive type** cannot be `null`: it always contains a concrete value (an `int` field defaults to `0`). Assigning `null` is a compile-time error.
* A variable of a **reference type** can contain `null`: it means it does not point to any object. Calling a method or accessing a field through `null` throws a `NullPointerException`.

```java
int count = 0;
// count = null;          // COMPILE ERROR: incompatible types: <null> cannot be converted to int

Integer boxed = null;     // OK: Integer is a reference type
Person p = new Person();
p = null;                 // OK: p no longer points to an object
// p.name = "x";          // NullPointerException at run time
```

To express "the value may be absent" for a number, use a wrapper (`Integer`), a special value (`-1`, `OptionalInt.empty()`) or `Optional<T>` for method results (the "null and Optional" page).

## Default Values

Class fields and array elements automatically receive default values: `0` for numbers, `'\u0000'` for `char`, `false` for `boolean` and `null` for references. **Local variables** have no default values: the compiler requires them to be initialized before the first read.

```java
class Counter {
    int value;          // 0
    String label;       // null
}

void method() {
    int x;
    // System.out.println(x);   // ERROR: variable x might not have been initialized
}
```

## Passing Parameters to Methods

In Java parameters are **always** passed **by value**. The language has no other modes (by reference). But for the two categories of types "value" means different things:

* for **primitive types**, a **copy of the value** is passed into the method: changing the parameter inside the method does not affect the caller's variable;
* for **reference types**, a **copy of the reference** is passed: both the original and the copy point to the same object on the heap. Changing the object's *state* (its fields) will be visible outside the method.

```java
public class Params {
    public static void main(String[] args) {
        int n = 1;
        modifyPrimitive(n);
        System.out.println(n);                       // 1: the method changed only a copy

        Person person = new Person();
        person.name = "Alice";
        modifyReference(person);
        System.out.println(person.name);             // Bob: the method changed the shared object

        replaceReference(person);
        System.out.println(person.name);             // Bob: the new reference stayed in the method
    }

    static void modifyPrimitive(int value) {         // value is a copy of n
        value = 100;
    }

    static void modifyReference(Person p) {          // p is a copy of the reference
        p.name = "Bob";                              // we change the object it points to
    }

    static void replaceReference(Person p) {
        p = new Person();                            // changes only the local copy of the reference
        p.name = "Charlie";
    }
}
```

* `modifyPrimitive` works with a completely independent copy of the number; the change is not visible outside.
* `modifyReference` receives a copy of the reference to the same `Person` object, so the change of the `name` field is permanent.
* `replaceReference` assigns a new object to the parameter. This changes only the local copy of the reference; the `person` variable in `main` still points to the old object.

> [!NOTE]
> A method cannot "return" a value through a parameter. If several results need to be returned, return a record (`record MinMax(int min, int max)`), an array or an object that the method fills in.

## The Stack and the Heap

| | Stack | Heap |
| --- | --- | --- |
| What it stores | call frames: parameters, local variables (primitives and references) | all objects and arrays |
| Who manages it | automatic: a frame disappears after the method returns | the garbage collector |
| Ownership | a separate stack per thread | shared by all threads |
| Size | small (`-Xss`, usually 512 KB – 1 MB) | large (`-Xmx`) |
| Overflow error | `StackOverflowError` | `OutOfMemoryError` |

> [!NOTE]
> "All objects live on the heap" is the language model. The JIT optimizer may avoid creating an object that does not escape the method (**escape analysis**) and keep its fields in registers. The programmer does not see this: the semantics stay the same.
