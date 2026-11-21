---
title: Native Functions
description: Calling C functions from Java with the Foreign Function API — Linker, SymbolLookup, FunctionDescriptor and MethodHandle, a custom C library, loading libraries, type mapping, strings, output parameters, structs by value and by pointer, callbacks (upcalls), managing native resources, errno, critical calls, jextract, JNI.
---

## Overview

The **Foreign Function API** (part of FFM, `java.lang.foreign`, Java 22) makes it possible to call functions of native libraries (C, C++ with `extern "C"`, Rust, system APIs) **without writing C code**. Previously this was done with **JNI** (Java Native Interface): for each function a native "glue wrapper" had to be written and compiled.

The main elements:

* **`Linker`** — knows the platform's calling conventions and builds a "bridge" between Java and native code;
* **`SymbolLookup`** — finds the address of a function in a library by name;
* **`FunctionDescriptor`** — a function's signature in terms of layouts (`ValueLayout`);
* **`MethodHandle`** — the result: an object whose invocation calls the native function (a **downcall**).

```java
import static java.lang.foreign.ValueLayout.*;

public class Strlen {
    public static void main(String[] args) throws Throwable {
        Linker linker = Linker.nativeLinker();
        SymbolLookup stdlib = linker.defaultLookup();                  // the C standard library

        MethodHandle strlen = linker.downcallHandle(
                stdlib.find("strlen").orElseThrow(),
                FunctionDescriptor.of(JAVA_LONG, ADDRESS));             // size_t strlen(const char*)

        try (Arena arena = Arena.ofConfined()) {
            MemorySegment cString = arena.allocateFrom("Zażółć");       // UTF-8 with a terminating zero byte
            long length = (long) strlen.invokeExact(cString);
            System.out.println(length);                                 // 10 — bytes, not characters
        }
    }
}
```

> [!IMPORTANT]
> `invokeExact` requires an **exact** type match: the result must be cast exactly to `(long)`, and the arguments must be exactly `MemorySegment`, `int` and so on. Otherwise — a `WrongMethodTypeException`. Descriptors and `MethodHandle`s are created once (in `static final` fields): then the JIT compiler turns the call into a direct native call.

Native calls are **restricted** operations: native code can corrupt the JVM's memory. Without the `--enable-native-access=ALL-UNNAMED` flag (or a module name) the JVM prints a warning, and in future versions the call will be forbidden.

## A Custom C Library

```c
// mathlib.h
#if defined(_WIN32) || defined(_WIN64)
#define EXPORT __declspec(dllexport)
#else
#define EXPORT __attribute__((visibility("default")))
#endif

#include <stdint.h>
#include <stddef.h>

EXPORT int add(int a, int b);
EXPORT double average(const double* values, size_t count);
EXPORT int format_greeting(const char* name, char* buffer, size_t size);   // returns the length
```

```bash
gcc -shared -fPIC -O2 -o libmathlib.so mathlib.c        # Linux
clang -shared -O2 -o libmathlib.dylib mathlib.c         # macOS
cl /LD /O2 mathlib.c /Fe:mathlib.dll                    # Windows (MSVC)
```

> [!NOTE]
> For C++, functions are declared with `extern "C"`. Otherwise the C++ compiler "mangles" the names, encoding the parameter types into them, and `SymbolLookup` will not find the function by its plain name.

### Loading a Library

```java
// 1. Through System.loadLibrary: the name becomes libmathlib.so / mathlib.dll and is searched for in java.library.path
System.loadLibrary("mathlib");
SymbolLookup lib = SymbolLookup.loaderLookup();

// 2. An explicit path; the library is unloaded when the arena is closed
SymbolLookup lib2 = SymbolLookup.libraryLookup(Path.of("native/libmathlib.so"), Arena.global());
```

```bash
java --enable-native-access=ALL-UNNAMED -Djava.library.path=native -cp out Main
```

### A Wrapper

It is convenient to collect native calls in one class with type-safe Java methods. The checked exceptions of `MethodHandle` (`Throwable`) do not leave the wrapper:

```java
public final class MathLib {
    private static final Linker LINKER = Linker.nativeLinker();
    private static final SymbolLookup LIB;
    static {
        System.loadLibrary("mathlib");
        LIB = SymbolLookup.loaderLookup();
    }

    private static MethodHandle downcall(String name, FunctionDescriptor descriptor) {
        return LINKER.downcallHandle(LIB.find(name).orElseThrow(
                () -> new UnsatisfiedLinkError("no symbol " + name)), descriptor);
    }

    private static final MethodHandle ADD = downcall("add", FunctionDescriptor.of(JAVA_INT, JAVA_INT, JAVA_INT));
    private static final MethodHandle AVERAGE = downcall("average", FunctionDescriptor.of(JAVA_DOUBLE, ADDRESS, JAVA_LONG));

    public static int add(int a, int b) {
        try {
            return (int) ADD.invokeExact(a, b);
        } catch (Throwable t) {
            throw new AssertionError(t);
        }
    }

    public static double average(double[] values) {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment array = arena.allocateFrom(JAVA_DOUBLE, values);     // a copy in native memory
            return (double) AVERAGE.invokeExact(array, (long) values.length);
        } catch (Throwable t) {
            throw new AssertionError(t);
        }
    }
}
```

## Type Mapping

| C | Layout | Java type |
| --- | --- | --- |
| `char`, `int8_t`, `uint8_t` | `JAVA_BYTE` | `byte` |
| `short`, `int16_t` | `JAVA_SHORT` | `short` |
| `int`, `int32_t` | `JAVA_INT` | `int` |
| `long long`, `int64_t`, `size_t` (64-bit) | `JAVA_LONG` | `long` |
| `float` / `double` | `JAVA_FLOAT` / `JAVA_DOUBLE` | `float` / `double` |
| `bool` (C99) | `JAVA_BOOLEAN` | `boolean` |
| any pointer `T*` | `ADDRESS` | `MemorySegment` |
| a `struct` by value | `StructLayout` | `MemorySegment` |

> [!WARNING]
> The C `long` type has **different** sizes: 8 bytes on 64-bit Linux and macOS, but 4 bytes on Windows. For portable descriptors use `linker.canonicalLayouts().get("long")` (as well as `"size_t"`, `"wchar_t"`), not a hard-coded `JAVA_LONG`. Java has no unsigned types: a `uint32_t` is read as an `int` and converted with `Integer.toUnsignedLong`.

## Strings

A Java string (UTF-16 with a length) and a C string (`char*`, zero-terminated bytes) have different representations, so a string is always **copied**:

* **an input parameter:** `arena.allocateFrom(string)` encodes the string in UTF-8 and adds a zero byte. For other encodings: `arena.allocateFrom(string, StandardCharsets.UTF_16LE)` (Java 22), e.g. for `wchar_t*` on Windows;
* **a result:** the function returns a zero-length pointer; it is reinterpreted and read up to the zero byte: `pointer.reinterpret(Long.MAX_VALUE).getString(0)`;
* **an output buffer:** the caller allocates a buffer, and the function fills it.

```c
int format_greeting(const char* name, char* buffer, size_t size) {
    return snprintf(buffer, size, "Hello, %s!", name);
}
```

```java
static final MethodHandle FORMAT_GREETING = downcall("format_greeting",
        FunctionDescriptor.of(JAVA_INT, ADDRESS, ADDRESS, JAVA_LONG));

public static String formatGreeting(String name) throws Throwable {
    try (Arena arena = Arena.ofConfined()) {
        MemorySegment buffer = arena.allocate(256);
        int length = (int) FORMAT_GREETING.invokeExact(arena.allocateFrom(name), buffer, buffer.byteSize());
        if (length >= buffer.byteSize()) throw new IllegalStateException("the buffer is too small");
        return buffer.getString(0);                                        // reading up to '\0', UTF-8
    }
}
```

A returned string whose memory was allocated by the library must be freed by a function of **the same** library (see "Native Resources").

## Output Parameters

A pointer parameter `int*` through which a function returns a value is a segment holding one value:

```c
int divide(int a, int b, int* remainder);     // the quotient is the result, the remainder goes through the pointer
```

```java
MethodHandle divide = downcall("divide", FunctionDescriptor.of(JAVA_INT, JAVA_INT, JAVA_INT, ADDRESS));
try (Arena arena = Arena.ofConfined()) {
    MemorySegment remainder = arena.allocate(JAVA_INT);
    int quotient = (int) divide.invokeExact(17, 5, remainder);
    System.out.println(quotient + " remainder " + remainder.get(JAVA_INT, 0));   // 3 remainder 2
}
```

## Structs

```c
typedef struct { uint8_t r, g, b, a; } Color;

EXPORT Color color_add(Color a, Color b);     // by value: a copy of the struct
EXPORT void color_darken(Color* color);       // by pointer: the function modifies the original
```

```java
static final StructLayout COLOR = MemoryLayout.structLayout(
        JAVA_BYTE.withName("r"), JAVA_BYTE.withName("g"), JAVA_BYTE.withName("b"), JAVA_BYTE.withName("a"));

static final MethodHandle COLOR_ADD = downcall("color_add", FunctionDescriptor.of(COLOR, COLOR, COLOR));
static final MethodHandle COLOR_DARKEN = downcall("color_darken", FunctionDescriptor.ofVoid(ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment a = arena.allocateFrom(JAVA_BYTE, (byte) 10, (byte) 20, (byte) 30, (byte) 255);
    MemorySegment b = arena.allocateFrom(JAVA_BYTE, (byte) 1, (byte) 2, (byte) 3, (byte) 0);

    // a struct returned by value: an allocator for the result goes as the first argument
    MemorySegment sum = (MemorySegment) COLOR_ADD.invokeExact((SegmentAllocator) arena, a, b);
    System.out.println(Arrays.toString(sum.toArray(JAVA_BYTE)));         // [11, 22, 33, -1]

    COLOR_DARKEN.invokeExact(a);                                          // passing the address of a
}
```

* A struct **by value** is described in the descriptor with its `StructLayout`; the `Linker` itself spreads it across registers or the stack according to the platform's calling convention.
* A struct **by pointer** is an `ADDRESS`; the function sees and modifies the same memory.

## Callbacks

A native function may take a **function pointer**. A Java method is turned into a native function with an **upcall stub** (`upcallStub`). The classic example is sorting with the standard `qsort` function and a Java comparator:

```c
void qsort(void* base, size_t count, size_t size, int (*compare)(const void*, const void*));
```

```java
public class QsortDemo {
    static int compareInts(MemorySegment a, MemorySegment b) {
        return Integer.compare(a.get(JAVA_INT, 0), b.get(JAVA_INT, 0));
    }

    public static void main(String[] args) throws Throwable {
        Linker linker = Linker.nativeLinker();
        MethodHandle qsort = linker.downcallHandle(
                linker.defaultLookup().find("qsort").orElseThrow(),
                FunctionDescriptor.ofVoid(ADDRESS, JAVA_LONG, JAVA_LONG, ADDRESS));

        MethodHandle compare = MethodHandles.lookup().findStatic(QsortDemo.class, "compareInts",
                MethodType.methodType(int.class, MemorySegment.class, MemorySegment.class));
        FunctionDescriptor compareDescriptor = FunctionDescriptor.of(JAVA_INT,
                ADDRESS.withTargetLayout(JAVA_INT), ADDRESS.withTargetLayout(JAVA_INT));  // pointers to int

        try (Arena arena = Arena.ofConfined()) {
            MemorySegment comparePtr = linker.upcallStub(compare, compareDescriptor, arena);
            MemorySegment array = arena.allocateFrom(JAVA_INT, 5, 3, 8, 1, 9, 2);

            qsort.invokeExact(array, 6L, JAVA_INT.byteSize(), comparePtr);
            System.out.println(Arrays.toString(array.toArray(JAVA_INT)));        // [1, 2, 3, 5, 8, 9]
        }
    }
}
```

* `ADDRESS.withTargetLayout(JAVA_INT)` states that the pointer leads to an `int`: the comparator's arguments are 4 bytes in size right away, and no `reinterpret` is needed.
* The stub lives as long as its **arena** lives. If the library stores the function pointer and calls it later (asynchronously), the arena must live correspondingly long (e.g. `Arena.global()`). Otherwise the native code will call freed memory.
* An exception escaping an upcall method **crashes the JVM**: native code cannot unwind the Java stack. Catch all exceptions inside.

## Native Resources

Libraries often return "handles" to resources that must be freed by a function of the same library:

```c
EXPORT const char* create_string(void);        // allocates with malloc
EXPORT void print_string(const char* str);
EXPORT void destroy_string(const char* str);   // free
```

Freeing is tied to an **arena**: `reinterpret(arena, cleanup)` returns a segment for which `cleanup` will be called when the arena is closed. This way the resource is freed deterministically, even if an exception occurs:

```java
public final class NativeString implements AutoCloseable {
    private static final MethodHandle CREATE = downcall("create_string", FunctionDescriptor.of(ADDRESS));
    private static final MethodHandle PRINT = downcall("print_string", FunctionDescriptor.ofVoid(ADDRESS));
    private static final MethodHandle DESTROY = downcall("destroy_string", FunctionDescriptor.ofVoid(ADDRESS));

    private final Arena arena = Arena.ofConfined();
    private final MemorySegment handle;

    public NativeString() throws Throwable {
        MemorySegment raw = (MemorySegment) CREATE.invokeExact();
        if (raw.equals(MemorySegment.NULL)) throw new OutOfMemoryError("create_string");
        handle = raw.reinterpret(arena, NativeString::destroy);         // destroy during arena.close()
    }

    public void print() throws Throwable {
        PRINT.invokeExact(handle);              // after close() — IllegalStateException, not use-after-free
    }

    private static void destroy(MemorySegment str) {
        try {
            DESTROY.invokeExact(str);
        } catch (Throwable t) {
            throw new AssertionError(t);
        }
    }

    @Override
    public void close() {
        arena.close();
    }
}

try (NativeString str = new NativeString()) {
    str.print();
}
```

If the resource must be freed even when the programmer forgot to call `close`, `Arena.ofAuto()` (freeing by the garbage collector) or `java.lang.ref.Cleaner` is used. But a deterministic `close` is always better.

## Error Handling: errno

System functions report errors with the `errno` code (or `GetLastError()` on Windows). Between the native call and the Java code the JVM itself may call system functions and overwrite this value. That is why the `Linker` can **save** it right after the call (`captureCallState`):

```java
Linker linker = Linker.nativeLinker();
StructLayout captureLayout = Linker.Option.captureStateLayout();
VarHandle errnoHandle = captureLayout.varHandle(MemoryLayout.PathElement.groupElement("errno"));

MethodHandle chdir = linker.downcallHandle(
        linker.defaultLookup().find("chdir").orElseThrow(),
        FunctionDescriptor.of(JAVA_INT, ADDRESS),
        Linker.Option.captureCallState("errno"));            // an extra first parameter appears

MethodHandle strerror = linker.downcallHandle(
        linker.defaultLookup().find("strerror").orElseThrow(),
        FunctionDescriptor.of(ADDRESS, JAVA_INT));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment state = arena.allocate(captureLayout);
    int result = (int) chdir.invokeExact(state, arena.allocateFrom("/nonexistent"));
    if (result != 0) {
        int errno = (int) errnoHandle.get(state, 0L);
        MemorySegment message = (MemorySegment) strerror.invokeExact(errno);
        System.out.println("Error " + errno + ": " + message.reinterpret(Long.MAX_VALUE).getString(0));
        // Error 2: No such file or directory
    }
}
```

On Windows, `captureCallState("GetLastError")` is specified for system functions.

## Critical Calls

Every native call has a small overhead: the JVM switches the thread into a "native" state in which the garbage collector may run during the call. For very short functions that do not block and do not call Java, there is the `Linker.Option.critical(true)` option (Java 22). It reduces the overhead, and with `critical(true)` even **heap array segments** can be passed to the function without copying: the garbage collector does not run during the call, so the array is guaranteed not to move.

```java
MethodHandle sumInts = linker.downcallHandle(lib.find("sum_ints").orElseThrow(),
        FunctionDescriptor.of(JAVA_LONG, ADDRESS, JAVA_LONG),
        Linker.Option.critical(true));                       // true: passing heap arrays is allowed

int[] data = new int[1_000_000];
long sum = (long) sumInts.invokeExact(MemorySegment.ofArray(data), (long) data.length);
```

> [!WARNING]
> A critical function that runs long or blocks stops the garbage collector for **the whole** JVM. Use the option only for short computations.

## jextract

Writing descriptors by hand for a large library is tedious and risky. The **jextract** tool generates Java bindings from a C header file: wrapper methods, struct layouts, constants and callback types.

```bash
jextract --output src --target-package org.example.mathlib -l mathlib mathlib.h
```

```java
import static org.example.mathlib.mathlib_h.*;

int sum = add(2, 3);
```

## JNI

**Java Native Interface** is the old mechanism (since Java 1.1). A Java method is declared with the `native` modifier, and the implementation is written in C using the JNI API:

```java
public class Legacy {
    static { System.loadLibrary("legacy"); }
    public static native int add(int a, int b);
}
```

```c
#include <jni.h>

JNIEXPORT jint JNICALL Java_Legacy_add(JNIEnv* env, jclass cls, jint a, jint b) {
    return a + b;
}
```

JNI requires the C code to be compiled separately for each platform, and errors in it (wrong local references, "pending" exceptions) are hard to track down. For new code FFM is simpler, safer and often faster. JNI remains in existing libraries and where deep access to Java objects from native code is needed.
