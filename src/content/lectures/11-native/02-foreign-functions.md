---
title: Нативні функції
description: Виклик функцій C з Java через Foreign Function API — Linker, SymbolLookup, FunctionDescriptor і MethodHandle, власна бібліотека C, завантаження бібліотек, відповідність типів, рядки, вихідні параметри, структури за значенням і за вказівником, зворотні виклики (upcalls), керування нативними ресурсами, errno, критичні виклики, jextract, JNI.
---

## Огляд

**Foreign Function API** (частина FFM, `java.lang.foreign`, Java 22) дозволяє викликати функції нативних бібліотек (C, C++ з `extern "C"`, Rust, системні API) **без написання коду на C**. Раніше для цього був **JNI** (Java Native Interface): для кожної функції доводилося писати й компілювати нативну «клей-обгортку».

Основні елементи:

* **`Linker`** — знає угоди про виклики (calling conventions) платформи й будує «місток» між Java і нативним кодом;
* **`SymbolLookup`** — знаходить адресу функції в бібліотеці за іменем;
* **`FunctionDescriptor`** — сигнатура функції в термінах макетів (`ValueLayout`);
* **`MethodHandle`** — результат: об'єкт, виклик якого викликає нативну функцію (**downcall**).

```java
import static java.lang.foreign.ValueLayout.*;

public class Strlen {
    public static void main(String[] args) throws Throwable {
        Linker linker = Linker.nativeLinker();
        SymbolLookup stdlib = linker.defaultLookup();                  // стандартна бібліотека C

        MethodHandle strlen = linker.downcallHandle(
                stdlib.find("strlen").orElseThrow(),
                FunctionDescriptor.of(JAVA_LONG, ADDRESS));             // size_t strlen(const char*)

        try (Arena arena = Arena.ofConfined()) {
            MemorySegment cString = arena.allocateFrom("Привіт");       // UTF-8 з нульовим байтом у кінці
            long length = (long) strlen.invokeExact(cString);
            System.out.println(length);                                 // 12 — байтів, а не символів
        }
    }
}
```

> [!IMPORTANT]
> `invokeExact` вимагає **точного** збігу типів: результат треба привести саме до `(long)`, а аргументи мають бути саме `MemorySegment`, `int` тощо. Інакше — `WrongMethodTypeException`. Дескриптори й `MethodHandle` створюють один раз (у `static final` полях): тоді JIT-компілятор перетворює виклик на прямий нативний виклик.

Виклики нативного коду — **обмежені** операції: нативний код може зіпсувати пам'ять JVM. Без прапорця `--enable-native-access=ALL-UNNAMED` (або імені модуля) JVM виводить попередження, а в майбутніх версіях виклик буде заборонено.

## Власна бібліотека C

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
EXPORT int format_greeting(const char* name, char* buffer, size_t size);   // повертає довжину
```

```bash
gcc -shared -fPIC -O2 -o libmathlib.so mathlib.c        # Linux
clang -shared -O2 -o libmathlib.dylib mathlib.c         # macOS
cl /LD /O2 mathlib.c /Fe:mathlib.dll                    # Windows (MSVC)
```

> [!NOTE]
> Для C++ функції оголошують з `extern "C"`. Інакше компілятор C++ «декорує» (mangles) імена, кодуючи в них типи параметрів, і `SymbolLookup` не знайде функцію за простим іменем.

### Завантаження бібліотеки

```java
// 1. Через System.loadLibrary: ім'я перетворюється на libmathlib.so / mathlib.dll і шукається в java.library.path
System.loadLibrary("mathlib");
SymbolLookup lib = SymbolLookup.loaderLookup();

// 2. Явний шлях; бібліотеку вивантажить закриття арени
SymbolLookup lib2 = SymbolLookup.libraryLookup(Path.of("native/libmathlib.so"), Arena.global());
```

```bash
java --enable-native-access=ALL-UNNAMED -Djava.library.path=native -cp out Main
```

### Обгортка

Нативні виклики зручно зібрати в одному класі з типобезпечними Java-методами. Перевірені винятки `MethodHandle` (`Throwable`) не виходять за межі обгортки:

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
                () -> new UnsatisfiedLinkError("немає символу " + name)), descriptor);
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
            MemorySegment array = arena.allocateFrom(JAVA_DOUBLE, values);     // копія в нативну пам'ять
            return (double) AVERAGE.invokeExact(array, (long) values.length);
        } catch (Throwable t) {
            throw new AssertionError(t);
        }
    }
}
```

## Відповідність типів

| C | Макет | Тип Java |
| --- | --- | --- |
| `char`, `int8_t`, `uint8_t` | `JAVA_BYTE` | `byte` |
| `short`, `int16_t` | `JAVA_SHORT` | `short` |
| `int`, `int32_t` | `JAVA_INT` | `int` |
| `long long`, `int64_t`, `size_t` (64-біт) | `JAVA_LONG` | `long` |
| `float` / `double` | `JAVA_FLOAT` / `JAVA_DOUBLE` | `float` / `double` |
| `bool` (C99) | `JAVA_BOOLEAN` | `boolean` |
| будь-який вказівник `T*` | `ADDRESS` | `MemorySegment` |
| `struct` за значенням | `StructLayout` | `MemorySegment` |

> [!WARNING]
> Тип `long` у C має **різний** розмір: 8 байтів у 64-бітних Linux і macOS, але 4 байти в Windows. Для переносних дескрипторів використовують `linker.canonicalLayouts().get("long")` (а також `"size_t"`, `"wchar_t"`), а не жорстко `JAVA_LONG`. Беззнакових типів у Java немає: `uint32_t` читають як `int` і перетворюють через `Integer.toUnsignedLong`.

## Рядки

Рядок Java (UTF-16 з довжиною) і рядок C (`char*`, байти, завершені нулем) мають різне представлення, тож рядок завжди **копіюється**:

* **вхідний параметр:** `arena.allocateFrom(string)` кодує рядок в UTF-8 і додає нульовий байт. Для інших кодувань: `arena.allocateFrom(string, StandardCharsets.UTF_16LE)` (Java 22), наприклад для `wchar_t*` у Windows;
* **результат:** функція повертає вказівник нульового розміру; його переосмислюють і читають до нульового байта: `pointer.reinterpret(Long.MAX_VALUE).getString(0)`;
* **вихідний буфер:** виклична сторона виділяє буфер, функція його заповнює.

```c
int format_greeting(const char* name, char* buffer, size_t size) {
    return snprintf(buffer, size, "Привіт, %s!", name);
}
```

```java
static final MethodHandle FORMAT_GREETING = downcall("format_greeting",
        FunctionDescriptor.of(JAVA_INT, ADDRESS, ADDRESS, JAVA_LONG));

public static String formatGreeting(String name) throws Throwable {
    try (Arena arena = Arena.ofConfined()) {
        MemorySegment buffer = arena.allocate(256);
        int length = (int) FORMAT_GREETING.invokeExact(arena.allocateFrom(name), buffer, buffer.byteSize());
        if (length >= buffer.byteSize()) throw new IllegalStateException("буфер замалий");
        return buffer.getString(0);                                        // читання до '\0', UTF-8
    }
}
```

Повернений рядок, пам'ять якого виділила бібліотека, треба звільнити функцією **тієї самої** бібліотеки (див. «Нативні ресурси»).

## Вихідні параметри

Параметр-вказівник `int*`, через який функція повертає значення, — це сегмент на одне значення:

```c
int divide(int a, int b, int* remainder);     // частка — результат, остача — через вказівник
```

```java
MethodHandle divide = downcall("divide", FunctionDescriptor.of(JAVA_INT, JAVA_INT, JAVA_INT, ADDRESS));
try (Arena arena = Arena.ofConfined()) {
    MemorySegment remainder = arena.allocate(JAVA_INT);
    int quotient = (int) divide.invokeExact(17, 5, remainder);
    System.out.println(quotient + " остача " + remainder.get(JAVA_INT, 0));   // 3 остача 2
}
```

## Структури

```c
typedef struct { uint8_t r, g, b, a; } Color;

EXPORT Color color_add(Color a, Color b);     // за значенням: копія структури
EXPORT void color_darken(Color* color);       // за вказівником: функція змінює оригінал
```

```java
static final StructLayout COLOR = MemoryLayout.structLayout(
        JAVA_BYTE.withName("r"), JAVA_BYTE.withName("g"), JAVA_BYTE.withName("b"), JAVA_BYTE.withName("a"));

static final MethodHandle COLOR_ADD = downcall("color_add", FunctionDescriptor.of(COLOR, COLOR, COLOR));
static final MethodHandle COLOR_DARKEN = downcall("color_darken", FunctionDescriptor.ofVoid(ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment a = arena.allocateFrom(JAVA_BYTE, (byte) 10, (byte) 20, (byte) 30, (byte) 255);
    MemorySegment b = arena.allocateFrom(JAVA_BYTE, (byte) 1, (byte) 2, (byte) 3, (byte) 0);

    // структура, повернена за значенням: першим аргументом — алокатор для результату
    MemorySegment sum = (MemorySegment) COLOR_ADD.invokeExact((SegmentAllocator) arena, a, b);
    System.out.println(Arrays.toString(sum.toArray(JAVA_BYTE)));         // [11, 22, 33, -1]

    COLOR_DARKEN.invokeExact(a);                                          // передаємо адресу a
}
```

* Структура **за значенням** описується в дескрипторі своїм `StructLayout`; `Linker` сам розкладає її по регістрах або стеку згідно з угодою про виклики платформи.
* Структура **за вказівником** — це `ADDRESS`; функція бачить і змінює ту саму пам'ять.

## Зворотні виклики

Нативна функція може приймати **вказівник на функцію**. Java-метод перетворюють на нативну функцію **upcall-заглушкою** (`upcallStub`). Класичний приклад — сортування стандартною функцією `qsort` з Java-компаратором:

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
                ADDRESS.withTargetLayout(JAVA_INT), ADDRESS.withTargetLayout(JAVA_INT));  // вказівники на int

        try (Arena arena = Arena.ofConfined()) {
            MemorySegment comparePtr = linker.upcallStub(compare, compareDescriptor, arena);
            MemorySegment array = arena.allocateFrom(JAVA_INT, 5, 3, 8, 1, 9, 2);

            qsort.invokeExact(array, 6L, JAVA_INT.byteSize(), comparePtr);
            System.out.println(Arrays.toString(array.toArray(JAVA_INT)));        // [1, 2, 3, 5, 8, 9]
        }
    }
}
```

* `ADDRESS.withTargetLayout(JAVA_INT)` повідомляє, що вказівник веде на `int`: аргументи компаратора одразу мають розмір 4 байти, і `reinterpret` не потрібен.
* Заглушка живе, доки жива її **арена**. Якщо бібліотека зберігає вказівник на функцію й викликає його пізніше (асинхронно), арена має жити відповідно довго (наприклад, `Arena.global()`). Інакше нативний код викличе звільнену пам'ять.
* Виняток, що вилітає з upcall-методу, **аварійно завершує JVM**: нативний код не вміє розгортати стек Java. Перехоплюйте всі винятки всередині.

## Нативні ресурси

Бібліотеки часто повертають «дескриптори» (handle) ресурсів, які треба звільнити функцією тієї самої бібліотеки:

```c
EXPORT const char* create_string(void);        // виділяє через malloc
EXPORT void print_string(const char* str);
EXPORT void destroy_string(const char* str);   // free
```

Звільнення прив'язують до **арени**: `reinterpret(arena, cleanup)` повертає сегмент, для якого під час закриття арени буде викликано `cleanup`. Так ресурс звільняється детерміновано, навіть якщо стався виняток:

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
        handle = raw.reinterpret(arena, NativeString::destroy);         // destroy під час arena.close()
    }

    public void print() throws Throwable {
        PRINT.invokeExact(handle);              // після close() — IllegalStateException, а не use-after-free
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

Якщо ресурс має звільнятися й тоді, коли програміст забув викликати `close`, використовують `Arena.ofAuto()` (звільнення збирачем сміття) або `java.lang.ref.Cleaner`. Але детерміноване `close` завжди краще.

## Обробка помилок: errno

Системні функції повідомляють про помилки кодом `errno` (або `GetLastError()` у Windows). Між нативним викликом і кодом Java JVM сама може викликати системні функції й перезаписати це значення. Тому `Linker` уміє **зберегти** його одразу після виклику (`captureCallState`):

```java
Linker linker = Linker.nativeLinker();
StructLayout captureLayout = Linker.Option.captureStateLayout();
VarHandle errnoHandle = captureLayout.varHandle(MemoryLayout.PathElement.groupElement("errno"));

MethodHandle chdir = linker.downcallHandle(
        linker.defaultLookup().find("chdir").orElseThrow(),
        FunctionDescriptor.of(JAVA_INT, ADDRESS),
        Linker.Option.captureCallState("errno"));            // з'являється додатковий перший параметр

MethodHandle strerror = linker.downcallHandle(
        linker.defaultLookup().find("strerror").orElseThrow(),
        FunctionDescriptor.of(ADDRESS, JAVA_INT));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment state = arena.allocate(captureLayout);
    int result = (int) chdir.invokeExact(state, arena.allocateFrom("/nonexistent"));
    if (result != 0) {
        int errno = (int) errnoHandle.get(state, 0L);
        MemorySegment message = (MemorySegment) strerror.invokeExact(errno);
        System.out.println("Помилка " + errno + ": " + message.reinterpret(Long.MAX_VALUE).getString(0));
        // Помилка 2: No such file or directory
    }
}
```

У Windows для системних функцій указують `captureCallState("GetLastError")`.

## Критичні виклики

Кожен нативний виклик має невеликі накладні витрати: JVM переводить потік у «нативний» стан, у якому під час виклику може працювати збирач сміття. Для дуже коротких функцій, що не блокуються й не викликають Java, є опція `Linker.Option.critical(true)` (Java 22). Вона зменшує витрати, а з `critical(true)` у функцію можна передавати навіть **сегменти масивів купи** без копіювання: збирач сміття не працює під час виклику, тож масив гарантовано не переміститься.

```java
MethodHandle sumInts = linker.downcallHandle(lib.find("sum_ints").orElseThrow(),
        FunctionDescriptor.of(JAVA_LONG, ADDRESS, JAVA_LONG),
        Linker.Option.critical(true));                       // true: дозволено передавати масиви купи

int[] data = new int[1_000_000];
long sum = (long) sumInts.invokeExact(MemorySegment.ofArray(data), (long) data.length);
```

> [!WARNING]
> Критична функція, що виконується довго або блокується, зупиняє збирач сміття для **всієї** JVM. Використовуйте опцію лише для коротких обчислень.

## jextract

Писати дескриптори вручну для великої бібліотеки втомливо й ризиковано. Інструмент **jextract** генерує Java-прив'язки з заголовкового файлу C: методи-обгортки, макети структур, константи й типи зворотних викликів.

```bash
jextract --output src --target-package org.example.mathlib -l mathlib mathlib.h
```

```java
import static org.example.mathlib.mathlib_h.*;

int sum = add(2, 3);
```

## JNI

**Java Native Interface** — старий механізм (з Java 1.1). Java-метод оголошують з модифікатором `native`, а реалізацію пишуть на C з використанням API JNI:

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

JNI потребує окремої компіляції C-коду для кожної платформи, а помилки в ньому (неправильні локальні посилання, винятки, що «зависли») важко шукати. Для нового коду FFM простіший, безпечніший і часто швидший. JNI залишається в існуючих бібліотеках і там, де потрібен глибокий доступ до об'єктів Java з нативного коду.
