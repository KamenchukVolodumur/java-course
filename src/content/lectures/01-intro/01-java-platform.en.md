---
title: Introduction
description: The Java language and the JVM platform, how code is executed (bytecode and JIT), the first program and the basic tools: the console, String and ArrayList.
---

## The Java Language and the JVM Platform

Java was created at **Sun Microsystems** by a team led by **James Gosling**. Work began in 1991 (the Green project; the language was first called Oak), and the first public version, **Java 1.0**, was released in **1996**. The platform's motto is **"Write Once, Run Anywhere"**: a program compiled once should run on any system that has a Java virtual machine.

In 2006–2007 Sun released the platform's source code as the **OpenJDK** project. In 2010 Sun was acquired by **Oracle**, which has steered the language's development ever since. Today the reference implementation is OpenJDK itself, and ready-made JDK builds are published by several vendors: Oracle, Eclipse Adoptium (Temurin), Amazon (Corretto), Microsoft, Azul (Zulu) and others. They are all built from the same code and differ mainly in license and support period.

Since 2017 a new Java version is released **every six months**, in March and September. Every version released once every two years has **LTS** (Long-Term Support) status and is supported for many years: 8, 11, 17, 21, 25. Intermediate versions are supported only until the next one is released. New language features often appear first as **preview** features (enabled with the `--enable-preview` flag) and become final one or two versions later. Changes are described in **JEP** documents (JDK Enhancement Proposals), listed for each version at [openjdk.org](https://openjdk.org/projects/jdk/).

In this course we use **Java 21** (LTS) as the minimum version. Features from newer versions are marked separately.

Java is widely used in server applications (Spring, Jakarta EE, Quarkus), big data processing (Kafka, Spark, Hadoop, Elasticsearch), mobile applications (Android), financial systems and developer tools (IntelliJ IDEA, Gradle).

The language is **much simpler** than C++: it has no pointers, no manual memory management, no multiple inheritance of classes, no preprocessor and no undefined behavior in the C/C++ sense. Its syntax belongs to the C family, so it is familiar to anyone who has written C or C++.

### Main Characteristics of the Language

Java is a **managed** language: code runs under the control of the **JVM** virtual machine, not directly by the operating system. Automatic memory management (the **Garbage Collector**) eliminates whole classes of errors known from unmanaged languages: leaks caused by a forgotten `free`, access to freed memory, double free. The price is some overhead: the garbage collector sometimes has to pause the program, although modern collectors (G1, ZGC) reduce such pauses to milliseconds.

It is a **statically and strongly typed**, **object-oriented** language. The types of all variables are known and checked at compile time, so many errors are found before the program runs. The language provides classes, interfaces, encapsulation, inheritance and polymorphism. Unlike C++, Java has **no global functions or variables**: all code must live inside types (classes, interfaces, enums, records).

At the same time, Java borrows ideas from other paradigms: functional programming (lambda expressions, the Stream API), declarative data processing, and since Java 21 lightweight **virtual threads**, which let you write simple blocking code that scales like asynchronous code.

### How Java Code Is Executed: Bytecode and JIT

To develop programs you need the **JDK** (Java Development Kit). To run an already built program, a runtime environment (JRE) is enough. Since Java 11 a separate JRE is no longer distributed; for production a minimal runtime is built with the `jlink` tool.

| Component | Contents |
| --- | --- |
| **JVM** | the virtual machine: class loading, bytecode verification, interpreter, JIT compilers, garbage collector |
| **JRE** | JVM + the standard library |
| **JDK** | JRE + the `javac` compiler, `jar`, `javadoc`, `jshell`, `jcmd`, `jlink` and other tools |

The path from code to execution:

1. The **`javac`** compiler turns source code (`.java`) into **bytecode** — instructions for the virtual machine — and writes it to `.class` files (one per class).
2. The `.class` files are usually packaged into a **`.jar`** archive.
3. At startup the **JVM** loads the classes, verifies the bytecode (the verifier) and starts **interpreting** it. Frequently executed ("hot") methods are compiled to machine code by the **JIT compiler** (Just-In-Time).

```text
   compile time                          run time
┌──────────────────┐   javac    ┌───────────────────┐  JVM: interpretation  ┌────────────────┐
│  Hello.java      │ ─────────► │  Hello.class      │ ────────────────────► │  CPU machine   │
│  (source code)   │            │  (bytecode)       │   + JIT (C1, C2)       │  code          │
└──────────────────┘            └───────────────────┘                        └────────────────┘
```

The HotSpot virtual machine has two JIT compilers: **C1** compiles quickly with simple optimizations, **C2** takes more time but generates highly optimized code based on execution statistics (which branches are most frequent, which types actually occur). That is why Java programs need a **warm-up**: the first seconds of execution are slower than the following ones.

Thanks to this model the same bytecode runs on Windows, Linux and macOS, on x86 and ARM. Bytecode can be inspected with the `javap -c Hello.class` tool.

> [!NOTE]
> Ahead-of-time (AOT) compilation also exists: **GraalVM Native Image** turns an application into a native executable that starts in milliseconds but loses some dynamic capabilities (see the chapter "Other Topics → JVM and Garbage Collection").

## Hello World

The simplest Java program is a public class whose name **matches the file name**, with a `main` method:

```java
// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

* `public class Hello` — a class, a container for data and methods. A public class must live in the file `Hello.java`.
* `public static void main(String[] args)` — the program's entry point. `args` contains the command-line arguments.
* `System.out.println(...)` — a call of the `println` method on the `System.out` object (standard output).

Compiling and running:

```bash
javac Hello.java        # creates Hello.class
java Hello              # runs the Hello class (without the .class extension!)
java Hello.java         # Java 11+: compile in memory and run in one step
```

In Java 25 (JEP 512) simple programs can do without an explicit class and a static method (**compact source files** and **instance main methods**). The compiler wraps the code in an implicit class itself:

```java
// Hello.java (Java 25+)
void main() {
    IO.println("Hello, World!");
}
```

In Java 22–24 this is a preview feature: `java --enable-preview --source 24 Hello.java`.

> [!TIP]
> Real projects are not compiled by hand with `javac`: dependencies and builds are managed by Maven or Gradle (see the chapter "Tools"). Popular IDEs are **IntelliJ IDEA** (the Community edition is free), **Eclipse** and **VS Code** with the Extension Pack for Java. For quick experiments the JDK has the **`jshell`** REPL.

```text
$ jshell
jshell> var xs = List.of(3, 1, 2)
xs ==> [3, 1, 2]
jshell> xs.stream().sorted().toList()
$2 ==> [1, 2, 3]
jshell> /exit
```

## Basic Tools

To start writing programs, it is worth getting to know a few standard library classes that you will need right away.

### Standard Input and Output

The `System.out` object (of type `PrintStream`) prints to standard output: `println` adds a line break, `print` does not, `printf` formats according to a template. Errors are printed to `System.err`.

The easiest way to read input is the `Scanner` class:

```java
import java.time.Year;
import java.util.Scanner;

public class Greeting {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.print("What is your name? ");
        String name = in.nextLine();
        int year = Year.now().getValue();
        System.out.printf("Hello, %s! It is %d.%n", name, year);
        System.out.println("Hello, " + name + "!");   // concatenation
    }
}
```

`printf` and `String.format` use format specifiers: `%s` — a string, `%d` — an integer, `%.2f` — a floating-point number with two decimal places, `%n` — a line break appropriate for the current system. Since Java 15 you can write `"Hello, %s!".formatted(name)`.

> [!NOTE]
> Java has no string interpolation like `"Hello, {name}"`. Strings are built with `+` concatenation, the `format`/`formatted` methods or the `StringBuilder` class.

### The String Type

`String` is the main type for working with text. Its key property is **immutability**: a string, once created, cannot be changed. Every operation that seemingly changes it (appending, replacing characters) actually creates a **new** object.

```java
String txt = "Hello, ";
String txt2 = txt + "World!";             // "Hello, World!"

// txt2.charAt(5) = '?';                  // ERROR: a string cannot be modified
String txt3 = txt2.replace(',', '?');     // "Hello? World!"

String option = "first";
if (option.equals("first")) {             // compare contents with equals, not ==
    System.out.println(txt2.toUpperCase());   // "HELLO, WORLD!"
}
```

> [!WARNING]
> For strings the `==` operator compares **references** (whether it is the same object), not contents. Two strings with the same text can be different objects, so always compare contents with `equals`. Details are on the "Strings" page.

### The ArrayList Type

One of the most frequently used containers of the standard library is `ArrayList<E>` from the `java.util` package, a dynamic array (the counterpart of `std::vector` in C++).

`ArrayList<E>` is a **generic type**: the element type is given in angle brackets, e.g. `ArrayList<String>`. A type parameter can only be a reference type, so for numbers wrapper classes are used: `ArrayList<Integer>`, not `ArrayList<int>`.

```java
import java.util.ArrayList;
import java.util.List;

List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4));

System.out.println("Number of elements: " + numbers.size());   // 4

numbers.add(5);                       // [1, 2, 3, 4, 5]
numbers.remove(Integer.valueOf(3));   // removes the VALUE 3 -> [1, 2, 4, 5]
numbers.remove(0);                    // removes the element at INDEX 0 -> [2, 4, 5]
numbers.set(1, 10);                   // [2, 10, 5]
int first = numbers.get(0);           // 2

List<Integer> copy = new ArrayList<>(numbers);   // a copy of the list

for (int n : numbers) {               // iterating over the elements
    System.out.print(n + " ");
}
System.out.println();

numbers.clear();                      // []
```

Classes in Java have **fields** (data) and **methods** (behavior). The language has no separate "property" construct: state is usually accessed through getter methods (`size()`, `get(i)`, `getName()`), and for immutable data through records (chapter "Creating Types").

> [!CAUTION]
> For a `List<Integer>`, calling `remove(3)` removes the element **at index 3**, not the value 3: the overload with an `int` parameter takes precedence over autoboxing to `Integer`. To remove a value, write `remove(Integer.valueOf(3))`.
