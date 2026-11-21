---
title: Inheritance
description: extends and single inheritance, polymorphism and casts, instanceof, virtual methods and @Override, super, abstract classes, hiding fields and static methods, final and sealed, constructors and initialization order.
---

## Inheritance

A class inherits from another class with the `extends` keyword. Inheritance in Java corresponds to public inheritance in C++, but there is **no multiple inheritance of classes**: a class has exactly one direct superclass (`Object` by default). Multiplicity is achieved through interfaces.

```java
public class Person {
    protected String firstName;
    protected String lastName;
    protected int age;

    public Person(String firstName, String lastName, int age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }

    public String fullName() { return firstName + " " + lastName; }
}

public class Student extends Person {
    private final String studentId;

    public Student(String firstName, String lastName, int age, String studentId) {
        super(firstName, lastName, age);         // calling the superclass constructor
        this.studentId = studentId;
    }

    public String studentId() { return studentId; }
}
```

A `Student` is also a `Person` and has everything the superclass has (except private members, which exist in the object but are inaccessible from the subclass code, and constructors, which are not inherited).

```java
Student alice = new Student("Alice", "Brown", 25, "X-84355");
System.out.println(alice.fullName() + ", " + alice.age + ", " + alice.studentId());
```

## Polymorphism

References are **polymorphic**: an object of a subclass can be used wherever the superclass is expected. Code written for the general type works with any implementation.

```java
static void register(Person person) {
    System.out.println("Registered: " + person.fullName());
}

register(alice);                 // a Student passed as a Person
```

An **upcast** (to the superclass) is implicit and always safe. A **downcast** (to a subclass) requires an explicit cast and throws `ClassCastException` if the actual type does not match:

```java
Person person = alice;                    // implicit upcast
Student student = (Student) person;       // explicit downcast: OK, it really is a Student

Person bob = new Person("Bob", "Smith", 40);
// Teacher t = (Teacher) bob;             // ClassCastException at run time
```

### The instanceof Operator

`instanceof` checks whether an object is an instance of a type (or its subtype). For `null` the result is always `false`. Since Java 16 it supports a **type pattern**: if the check succeeds, the object is immediately available as a variable of the required type.

```java
if (person instanceof Teacher) {               // the classic form
    Teacher teacher = (Teacher) person;
    System.out.println("SAP ID: " + teacher.sapId());
}

if (person instanceof Teacher teacher) {        // a type pattern
    System.out.println("SAP ID: " + teacher.sapId());
}

if (!(person instanceof Teacher teacher)) {
    return;
}
System.out.println(teacher.sapId());            // teacher is available here too
```

## Virtual Methods

In Java **all** non-static, non-`private` and non-`final` methods are **virtual** by default: at the call the JVM looks at the **actual** class of the object, not the type of the variable (dynamic dispatch). There is no separate `virtual` keyword.

A subclass method with the same signature **overrides** the superclass method. The `@Override` annotation is optional but strongly recommended: if the signature accidentally does not match (a typo, a different parameter type), the compiler reports an error instead of silently creating a new method.

The `super` keyword has two meanings:

* `super.method()` — calling the superclass implementation;
* `super(...)` — calling the superclass constructor (as the first statement of a constructor).

```java
public class Vehicle {
    protected float position = 0;
    protected float speed = 1.0f;
    private final String name;

    public Vehicle(String name) { this.name = name; }

    public String name() { return name; }
    public float position() { return position; }

    public float run(float dt) {
        System.out.println("Vehicle.run(" + dt + ")");
        position += dt * speed;
        return position;
    }
}

public class Car extends Vehicle {
    private final float acceleration;

    public Car(String name, float acceleration) {
        super(name);
        this.speed = 0.0f;
        this.acceleration = acceleration;
    }

    @Override
    public float run(float dt) {
        System.out.println("Car.run(" + dt + ")");
        position += dt * speed;
        speed += dt * acceleration;
        return position;
    }
}

public class Bike extends Vehicle {
    public Bike(String name) { super(name); }

    @Override
    public float run(float dt) {
        System.out.println("Bike.run(" + dt + ")");
        return super.run(dt);                  // the implementation from Vehicle
    }
}
```

```java
List<Vehicle> vehicles = List.of(new Bike("Romet"), new Car("Honda Civic", 1.5f), new Car("Toyota Yaris", 1.0f));

final float dt = 1.0f;
for (float time = 0.0f; time < 4.0f; time += dt) {
    System.out.printf("====== time: %5.1fs ======%n", time);
    for (Vehicle v : vehicles) v.run(dt);
    for (Vehicle v : vehicles) System.out.printf("%s: position %.1f%n", v.name(), v.position());
}
```

If `v` is a `Car`, `Car.run` is called; if it is a `Bike`, `Bike.run`. If a class did not override the method, `Vehicle.run` would be called. Under the hood the JVM uses virtual method tables (vtables), and the JIT often turns such calls into direct ones when it sees that there is only one implementation.

### Overriding Rules

* The signature (the name and parameter types) must match.
* The return type may be the same or a **subtype** (a covariant return type): `Animal create()` can be overridden as `Dog create()`.
* Visibility may be **widened** but not narrowed: `protected` → `public` is allowed, `public` → `protected` is not.
* A method cannot declare new or broader **checked** exceptions than the superclass method.
* `private`, `static` and `final` methods are not overridden.

## Abstract Classes

A class with the `abstract` modifier cannot be instantiated. It may contain **abstract methods**: declarations without a body that every non-abstract subclass must implement. At the same time, an abstract class can have fields, constructors and ordinary methods.

```java
public abstract class Vehicle {
    protected float position = 0;
    protected float speed = 1.0f;
    private final String name;

    protected Vehicle(String name) { this.name = name; }   // a constructor for subclasses

    public abstract float run(float dt);                    // no implementation

    public String name() { return name; }
}

// new Vehicle("x");      // ERROR: Vehicle is abstract; cannot be instantiated
```

## Hiding Members

A subclass can declare a **field** with the same name as in the superclass, or a **static method** with the same signature. Then the superclass member is **hidden**, not overridden: which one is used is determined by the **static type** of the reference at compile time.

```java
public class Base {
    public int member = 0;
    public static String staticMethod() { return "Base.staticMethod"; }
    public String method() { return "Base.method"; }
}

public class Hider extends Base {
    public int member = 1;                                       // hides the field
    public static String staticMethod() { return "Hider.staticMethod"; }   // hides the static method
    @Override public String method() { return "Hider.method"; }  // OVERRIDES
}

Hider hider = new Hider();
Base asBase = hider;

System.out.println(hider.member);           // 1
System.out.println(asBase.member);          // 0: the field is chosen by the static type
System.out.println(Hider.staticMethod());   // Hider.staticMethod
System.out.println(Base.staticMethod());    // Base.staticMethod
System.out.println(hider.method());         // Hider.method
System.out.println(asBase.method());        // Hider.method: dynamic dispatch
```

> [!IMPORTANT]
> **Instance** methods cannot be hidden in Java: a method with the same signature always overrides. That is why method polymorphism is reliable, while hiding fields is almost always a mistake. Access fields through methods and make them `private`.

## final and sealed

* `final` on a **method** forbids overriding it in subclasses.
* `final` on a **class** forbids inheriting from it (`String`, `Integer`, records).

Since Java 17 there is an intermediate option — **sealed** classes. They allow only explicitly listed classes to inherit:

```java
public sealed class Shape permits Circle, Square, Polygon { }

public final class Circle extends Shape { }        // this branch is closed
public final class Square extends Shape { }
public non-sealed class Polygon extends Shape { }  // this branch is reopened to any subclasses
```

Each permitted subclass must be `final`, `sealed` or `non-sealed`. A closed hierarchy lets the compiler check the exhaustiveness of a `switch` (the "Pattern Matching" page).

## Constructors and Initialization Order

Constructors are **not inherited**: a subclass declares its own. Each subclass constructor must first initialize the superclass part — explicitly call `super(...)` as the first statement. If there is no such call, the compiler inserts `super()`; if the superclass has no parameterless constructor, it is a compile-time error.

```java
public class Base {
    protected final int x;
    public Base(int x) { this.x = x; }
}

public class Derived extends Base {
    private final int y;
    public Derived(int x, int y) {
        super(x);                 // required: Base has no parameterless constructor
        this.y = y;
    }
}
```

### Initialization Order

During `new Derived(...)`:

1. static initialization of `Base`, then `Derived` (if the classes are not initialized yet);
2. the call of the `Derived` constructor → it calls `super(...)`;
3. the field initializers and instance blocks of `Base`, then the body of the `Base` constructor;
4. the field initializers and instance blocks of `Derived`;
5. the body of the `Derived` constructor after `super(...)`.

> [!CAUTION]
> Do not call methods that a subclass may override from a constructor. The superclass constructor runs **before** the subclass fields are initialized, so the overridden method will see them unset:

```java
class Parent {
    Parent() { describe(); }                 // calling a virtual method in a constructor
    void describe() { System.out.println("Parent"); }
}

class Child extends Parent {
    private final List<String> items = new ArrayList<>();
    @Override void describe() { System.out.println(items.size()); }   // items is still null!
}

new Child();    // NullPointerException
```
