---
title: Access Modifiers
description: The four visibility levels in Java, defaults for classes and interface members, the peculiarities of protected, modules as a library-level encapsulation boundary.
---

## Access Levels

* **`public`** — access from anywhere. **Interface members** (methods and constants) are public by default.
* **`protected`** — access within the **package** and from **subclasses** (including those in other packages).
* *(no modifier)* **package-private** — access only from classes of **the same package**. This is the default level for **classes** and **class members**.
* **`private`** — access only within the **top-level class** in which the member is declared (including its nested classes).

| Modifier | Same class | Same package | Subclass in another package | Everyone else |
| --- | --- | --- | --- | --- |
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| *(no modifier)* | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

A top-level type can only be `public` or package-private. Members and nested types can have any of the four levels.

```java
package pl.mini.bank;

public class Account {
    public String owner;            // everyone
    protected long balance;         // the package and subclasses
    String branch;                  // only the pl.mini.bank package
    private String pin;             // only the Account class

    private static class Audit { }  // a private nested type
}

class Helper { }                    // package-private: invisible outside pl.mini.bank
```

## The Peculiarities of protected

`protected` in Java is **broader** than one might expect: the member is visible not only to subclasses but to **the whole package**. In addition, a subclass from **another package** can access a `protected` member only through a reference of its own type (or a subtype), not through an arbitrary object of the superclass:

```java
package pl.mini.bank.premium;

public class PremiumAccount extends pl.mini.bank.Account {
    void demo(PremiumAccount other, pl.mini.bank.Account plain) {
        this.balance = 0;           // OK
        other.balance = 0;          // OK: the same type as the subclass
        // plain.balance = 0;       // ERROR: balance has protected access in Account
    }
}
```

## private and Nested Classes

Private members are accessible to all code **inside the top-level class**, including nested classes, and vice versa: the outer class sees the private members of the nested ones. Since Java 11 the JVM directly supports such "nestmates", without synthetic helper methods.

```java
public class Pizza {
    private final int size;

    private Pizza(Builder b) { this.size = b.size; }   // a private constructor

    public static class Builder {
        private int size;
        public Pizza build() { return new Pizza(this); }   // OK: access to private from inside Pizza
    }
}
```

## Modules — Library-Level Encapsulation

A public class is visible to anyone who has it on the classpath. To hide a library's internal packages, **modules** (Java 9) are used: the `module-info.java` file decides which packages the module **exports**. Public classes of non-exported packages are inaccessible from outside, even via reflection.

```java
module pl.mini.bank {
    exports pl.mini.bank.api;            // the public API
    // pl.mini.bank.internal is not exported: its public classes are visible only inside the module
}
```

More on the "Modules and Class Loaders" page.

> [!TIP]
> The principle of least privilege: start with `private` and widen visibility only when it is really needed. Fields are almost always `private`. Make classes that are not part of the API package-private. The less is visible from outside, the more freely the implementation can be changed.
