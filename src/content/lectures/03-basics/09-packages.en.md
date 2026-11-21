---
title: Packages and import
description: Packages as namespaces, mapping to directories, importing classes and static members, name conflicts, the default package, the automatic import of java.lang, package-info.java.
---

## Packages

A **package** groups related types and creates a namespace for them. The full name of a class consists of the package name and the class name: `java.util.ArrayList`, `pl.edu.pw.mini.shop.Order`. Package members are accessed with a dot.

A package is declared as **the first statement** of a file (only comments and annotations may precede it):

```java
package pl.edu.pw.mini.shop;

public class Order { }
```

All types in the file belong to this package. Packages cannot be nested syntactically (there are no `package { }` blocks), and a file belongs to exactly one package.

### Mapping to Directories

The package structure **must match the directory structure** relative to the source root (`src/main/java`): the class `pl.edu.pw.mini.shop.Order` lives in the file `src/main/java/pl/edu/pw/mini/shop/Order.java`, and once compiled in `target/classes/pl/edu/pw/mini/shop/Order.class`. This is how the compiler and the JVM find classes.

```text
src/main/java/
└── pl/edu/pw/mini/shop/
    ├── Order.java           package pl.edu.pw.mini.shop;
    ├── OrderService.java    package pl.edu.pw.mini.shop;
    └── payment/
        └── Card.java        package pl.edu.pw.mini.shop.payment;
```

### Naming Conventions

* Package names are written in **lowercase**, without underscores, as the organization's reversed domain name: `com.google.gson`, `org.apache.commons.io`, `pl.edu.pw.mini`.
* The `java.*` and `javax.*` packages are reserved for the standard library.

> [!IMPORTANT]
> From the language's point of view packages **do not form a hierarchy**: `pl.mini.shop` and `pl.mini.shop.payment` are two independent packages, even though their names and directories are nested. A member with package-private visibility in `pl.mini.shop` is invisible in `pl.mini.shop.payment`, and `import pl.mini.shop.*` does not import types from the subpackage.

### The Default Package

A file without a `package` declaration belongs to the **unnamed package**. This is convenient for single-file examples, but classes from the unnamed package cannot be imported from named packages. Real projects do not use it.

## The import Statement

Without an import, a class from another package is referred to by its full name. `import` lets you write the short name:

```java
package pl.mini.app;

import java.util.List;                 // a single type (single-type import)
import java.util.Map.Entry;            // a nested type
import java.time.*;                    // all public types of a package (on-demand)

public class App {
    java.util.Set<String> tags;        // the full name works without an import too
    List<String> names;
    Entry<String, Integer> pair;
    LocalDate today = LocalDate.now();
}
```

It is important to understand that `import` is merely a **name abbreviation** for the compiler. It does not "include" anything into the program like `#include` does and does not affect the size or speed of the code. Libraries become available through the classpath (or the module path), not through imports.

Types from the **`java.lang`** package (`String`, `Object`, `Math`, `System`, `Integer`, `Thread`, `Record` …) and types from **your own package** are available without an import.

> [!TIP]
> The IDE adds and removes imports automatically. Most code styles (Google Java Style) forbid `*` imports: an explicit list shows where each type comes from and does not create unexpected conflicts when a library gains a new class.

## Static Import

`import static` imports not types but **static members** of a class: methods, fields, enum constants. After that they can be used without the class name.

```java
import static java.lang.Math.*;                     // all static members of Math
import static java.time.DayOfWeek.MONDAY;           // a single enum constant
import static java.util.stream.Collectors.groupingBy;
import static org.junit.jupiter.api.Assertions.assertEquals;

double r = sqrt(pow(3, 2) + pow(4, 2));            // instead of Math.sqrt(Math.pow(...))
System.out.println(MONDAY);
assertEquals(5.0, r);
```

Static imports are appropriate for frequently used utilities (`Math`, `Collectors`, assertions in tests). Overusing them hurts readability: it becomes unclear where a method comes from.

## Name Conflicts

Java has **no aliases** for types or packages. If you need two classes with the same name, import one and write the other by its full name:

```java
import java.util.Date;

public class Report {
    Date created;                      // java.util.Date
    java.sql.Date reportDay;           // the full name
}
```

Importing two types with the same name via `import a.X; import b.X;` is a compile-time error. Importing `a.*` and `b.*` compiles as long as the ambiguous name `X` is not used in the code.

## package-info.java

The `package-info.java` file in a package directory contains the **package documentation** (Javadoc) and **annotations** that apply to the whole package:

```java
/**
 * Order processing for an online shop: the model, validation, price calculation.
 */
@NullMarked                       // e.g. the JSpecify annotation: all types in the package are non-null by default
package pl.mini.shop;

import org.jspecify.annotations.NullMarked;
```

> [!NOTE]
> Packages control visibility only partially: a public class is visible to anyone who has it on the classpath. Real encapsulation at the level of whole libraries is provided by **modules** (`module-info.java`), which decide which packages to export (chapter "Reflection → Modules and Class Loaders").
