---
title: Primitive Types
description: The eight primitive types and wrapper classes, literals, type conversions, overflow, BigDecimal and BigInteger, boolean, comparison operators, char and Unicode, parsing and number bases.
---

## Numeric Types

Each primitive type has a corresponding **wrapper class** in the `java.lang` package. Wrappers hold useful constants and methods: `Integer.MAX_VALUE`, `Integer.parseInt(String)`, `Double.isNaN(x)`, `Long.compare(a, b)`.

| Type | Wrapper | Size | Range (approximate) | Precision | Literal suffix |
| --- | --- | --- | --- | --- | --- |
| `byte` | `Byte` | 8 bits | −128 to 127 | — | — |
| `short` | `Short` | 16 bits | −32,768 to 32,767 | — | — |
| `int` | `Integer` | 32 bits | −2.1×10⁹ to 2.1×10⁹ | — | — |
| `long` | `Long` | 64 bits | −9.2×10¹⁸ to 9.2×10¹⁸ | — | `L` |
| `float` | `Float` | 32 bits | ±1.4×10⁻⁴⁵ … ±3.4×10³⁸ | ~6–9 digits | `F` or `f` |
| `double` | `Double` | 64 bits | ±4.9×10⁻³²⁴ … ±1.8×10³⁰⁸ | ~15–17 digits | `D` (optional) |
| `char` | `Character` | 16 bits | `'\u0000'` to `'￿'` | — | — |
| `boolean` | `Boolean` | not defined by the specification | `true` / `false` | — | — |

All integer types are **signed**: Java has no unsigned types. For unsigned values there are static methods: `Integer.toUnsignedString(x)`, `Integer.divideUnsigned(a, b)`, `Integer.compareUnsigned(a, b)`, `Byte.toUnsignedInt(b)`.

### Literals

```java
int dec = 1_000_000;          // underscores for readability
int hex = 0xFF;               // 255
int bin = 0b1010_1010;        // 170
int oct = 017;                // 15 — careful: a leading 0 means octal!
long big = 10_000_000_000L;   // without L — error: the number is too large for int
float f = 3.14f;              // without f — error: 3.14 has type double
double d = 1.5e-3;            // 0.0015
char c = 'A';
```

## Numeric Conversions

### Widening Conversions (Implicit)

The compiler performs them automatically when the target type has a larger range:

```text
byte → short → int → long → float → double
             char ↗
```

```java
int i = 100;
long l = i;          // OK
float f = l;         // OK, but large numbers may lose precision
double d = f;        // OK

int big = 123_456_789;
float lossy = big;
System.out.println((int) lossy);   // 123456792: float has only ~7 significant digits
```

### Narrowing Conversions (Explicit)

They require a cast operator `(type)`, because information may be lost.

* From `double`/`float` to an integer type the fractional part is **discarded** (rounding toward zero). Out-of-range values saturate to `MIN_VALUE`/`MAX_VALUE`, and `NaN` becomes `0`.
* Between integer types the high-order bits that do not fit are **discarded**.

```java
double d = 99.9;
int i = (int) d;                    // 99
int neg = (int) -99.9;              // -99
int sat = (int) 1e20;               // 2147483647 (Integer.MAX_VALUE)

long l = 3_000_000_000L;
int i2 = (int) l;                   // -1294967296: the high 32 bits are discarded
byte b = (byte) 200;                // -56
```

### Overflow

Integer arithmetic in Java **silently overflows** (wraps around): the result is truncated to the size of the type without any exception.

```java
int max = Integer.MAX_VALUE;
System.out.println(max + 1);        // -2147483648
```

To make overflow an error, use the `Math.*Exact` methods, which throw `ArithmeticException`:

```java
try {
    int sum = Math.addExact(max, 1);
    int product = Math.multiplyExact(100_000, 100_000);
    int narrow = Math.toIntExact(3_000_000_000L);
} catch (ArithmeticException e) {
    System.out.println(e.getMessage());   // integer overflow
}
```

> [!WARNING]
> A typical pitfall: `long nanos = 24 * 60 * 60 * 1000 * 1000;` gives a wrong result, because the multiplication is done in `int` and overflows **before** the assignment to `long`. Correct: `24L * 60 * 60 * 1000 * 1000`.

### Numeric Promotion in Expressions

In expressions `byte`, `short` and `char` are first promoted to `int`:

```java
byte a = 10, b = 20;
// byte c = a + b;          // ERROR: a + b has type int
byte c = (byte) (a + b);    // explicit narrowing
a += b;                     // OK: compound assignment includes an implicit cast
```

### Special Floating-Point Values

Floating-point arithmetic follows the IEEE 754 standard and **throws no exceptions**:

```java
System.out.println(1.0 / 0);         // Infinity
System.out.println(-1.0 / 0);        // -Infinity
System.out.println(0.0 / 0);         // NaN
System.out.println(Double.NaN == Double.NaN);   // false! check with Double.isNaN(x)
System.out.println(0.1 + 0.2);       // 0.30000000000000004
System.out.println(1 / 0);           // ArithmeticException: / by zero (integers)
```

Floating-point numbers cannot be reliably compared with `==`; compare them with a tolerance: `Math.abs(a - b) < 1e-9`.

## BigDecimal and BigInteger

For financial calculations, where rounding errors are unacceptable, **`java.math.BigDecimal`** is used — a decimal number of arbitrary precision.

* `BigDecimal` stores an integer of arbitrary length (`unscaledValue`) and a **scale** (`scale`, the number of digits after the decimal point). Decimal fractions (0.1, 0.2) are represented exactly.
* The objects are immutable: every operation returns a new object. There are no `+`, `*` operators, only methods.

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

BigDecimal price = new BigDecimal("19.99");          // create from a STRING
BigDecimal qty = BigDecimal.valueOf(3);
BigDecimal total = price.multiply(qty);              // 59.97
BigDecimal withVat = total.multiply(new BigDecimal("1.23"))
                          .setScale(2, RoundingMode.HALF_UP);   // 73.76

System.out.println(new BigDecimal(0.1));             // 0.1000000000000000055511151231257827...
System.out.println(new BigDecimal("0.1"));           // 0.1

BigDecimal one = new BigDecimal("1");
// one.divide(new BigDecimal("3"));                  // ArithmeticException: non-terminating decimal
one.divide(new BigDecimal("3"), 10, RoundingMode.HALF_EVEN);   // 0.3333333333
```

> [!WARNING]
> `BigDecimal.equals` takes the scale into account: `new BigDecimal("2.0").equals(new BigDecimal("2.00"))` is `false`. Compare values with `compareTo(...) == 0`.

Disadvantages of `BigDecimal` compared to `double`:

* **performance**: the operations are implemented in software and are tens of times slower than hardware floating-point operations;
* **memory**: it is an object on the heap, not 8 bytes;
* **convenience**: methods instead of operators, mandatory rounding control.

Use `double` for scientific computations and `BigDecimal` for money (or a `long` holding cents).

**`BigInteger`** is an integer of arbitrary size:

```java
BigInteger f = BigInteger.ONE;
for (int i = 2; i <= 50; i++) f = f.multiply(BigInteger.valueOf(i));
System.out.println(f);     // 30414093201713378043612608166064768844377641568960512000000000000
```

## The boolean Type

`boolean` has two values: `true` and `false`. The specification does not fix its size in memory: in a `boolean[]` array HotSpot uses 1 byte per element.

```java
int x = 1;
boolean flag = x > 0;
if (flag) {
    flag = false;
}
```

Unlike C/C++, there are **no conversions at all** between `boolean` and numeric types: `if (x)` for an `int x` does not compile; you have to write `if (x != 0)`.

### Comparison Operators

For primitive types `==` compares **values**:

```java
int a = 5, b = 5, c = 10;
System.out.println(a == b);   // true
System.out.println(a == c);   // false
```

For reference types `==` checks whether the references point to **the same object** (identity). Equality of contents is checked by the `equals` method, which a class must override (the "The Object Class" page).

```java
Person p1 = new Person("Alice", 30);
Person p2 = new Person("Alice", 30);
Person p3 = p1;
System.out.println(p1 == p2);        // false: different objects
System.out.println(p1 == p3);        // true: the same object
System.out.println(p1.equals(p2));   // true if Person overrides equals (a record does)
```

Operators cannot be overloaded in Java: for objects `==` always means identity.

### Short-Circuit Evaluation

The logical operators `&&` and `||` are evaluated **with short-circuiting**: if the result is clear from the left operand, the right one is not evaluated. The `&` and `|` operators on `boolean` always evaluate both sides.

```java
if (user != null && user.hasPermission("admin")) {
    System.out.println("The user has administrator rights");
}
```

If `user` is `null`, the `hasPermission` method is not called and no `NullPointerException` occurs.

## The char Type and Unicode

`char` is 2 bytes in size and stores one **UTF-16 code unit**. Characters outside the Basic Multilingual Plane (most emoji, some CJK ideographs) do not fit into a single `char` and are stored as a **surrogate pair** of two `char`s.

```java
char a = 'A';
char newLine = '\n';
char copyright = '©';       // ©
int code = a;                    // 65: char is implicitly widened to int
char next = (char) (a + 1);      // 'B'

String emoji = "😀";
System.out.println(emoji.length());                         // 2: two UTF-16 code units
System.out.println(emoji.codePointCount(0, emoji.length())); // 1: one code point
emoji.codePoints().forEach(cp -> System.out.println(Integer.toHexString(cp)));   // 1f600
```

The `Character` class has classification methods: `Character.isDigit(c)`, `isLetter`, `isWhitespace`, `toUpperCase`, `getNumericValue`.

## Converting Between Strings and Numbers

Conversions between strings and numbers are done by static methods of the wrappers:

```java
int n = Integer.parseInt("42");               // 42
double d = Double.parseDouble("3.14");        // 3.14
boolean b = Boolean.parseBoolean("TRUE");     // true (case-insensitive; anything else is false)
Integer boxed = Integer.valueOf("42");        // a wrapper, cached for -128..127

int bin = Integer.parseInt("101010", 2);      // 42
String hex = Integer.toString(255, 16);       // "ff"
String hex2 = Integer.toHexString(255);       // "ff"
String binary = Integer.toBinaryString(42);   // "101010"

String s = String.valueOf(3.5);               // "3.5"
String s2 = "" + 7;                           // "7" (concatenation)

Integer.parseInt("12a");                      // NumberFormatException
```

### Rounding

Unlike the `(int)` cast, which discards the fractional part, the `Math` methods round:

```java
Math.round(2.5);      // 3: the nearest integer, halves go up (toward +∞)
Math.round(-2.5);     // -2
Math.rint(2.5);       // 2.0: halves go to the even neighbor ("banker's" rounding)
Math.floor(-2.5);     // -3.0
Math.ceil(2.1);       // 3.0
Math.floorDiv(-7, 2); // -4 (unlike -7 / 2 == -3)
Math.floorMod(-7, 2); // 1  (unlike -7 % 2 == -1)
```

## Autoboxing

Generic collections work only with reference types, so primitives are automatically **boxed** into wrappers (autoboxing) and **unboxed** (unboxing):

```java
List<Integer> list = new ArrayList<>();
list.add(5);                 // autoboxing: Integer.valueOf(5)
int x = list.get(0);         // unboxing: list.get(0).intValue()

Integer a = 127, b = 127;
System.out.println(a == b);  // true: Integer.valueOf caches -128..127
Integer c = 128, d = 128;
System.out.println(c == d);  // false: different objects!
System.out.println(c.equals(d));   // true

Integer missing = null;
int boom = missing;          // NullPointerException during unboxing
```

> [!CAUTION]
> Never compare wrappers with `==`. And remember that autoboxing in a "hot" loop (`Long sum = 0L; for (...) sum += i;`) creates millions of temporary objects. Use primitives in such code.
