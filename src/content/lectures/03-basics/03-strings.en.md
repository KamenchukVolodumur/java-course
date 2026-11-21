---
title: Strings
description: The String class: immutability, the String Pool and comparison, creation and length, StringBuilder, the main methods, escaping, text blocks, string formatting.
---

## The String Type

`java.lang.String` is a class storing a sequence of characters. Like `char`, it logically consists of **UTF-16** code units. Since Java 9 it internally uses a `byte[]` with a **compact** representation: strings containing only Latin-1 characters take 1 byte per character, the rest take 2 bytes.

A string is **immutable**: operations that seemingly change it actually create a new object. Immutability gives the JVM a number of optimizations: strings can be safely shared between threads, their hash can be cached (`hashCode` is computed once), and identical literals can be stored as a single instance.

```java
String txt = "Hello, ";
String txt2 = txt + "World!";            // "Hello, World!"

// txt2.charAt(5) = '?';                 // ERROR: strings are immutable
String txt3 = txt2.replace(',', '?');    // "Hello? World!"
System.out.println(txt2.toUpperCase());  // "HELLO, WORLD!"
System.out.println(txt2);                // "Hello, World!" — the original has not changed
```

## Comparing Strings and the String Pool

`String` is a reference type, so the `==` operator compares **references**, not contents. Contents are compared with methods:

```java
String option = readOption();
if (option.equals("first")) { }              // contents, case-sensitive
if ("first".equals(option)) { }              // safe even if option == null
if (option.equalsIgnoreCase("FIRST")) { }
int order = "apple".compareTo("banana");     // < 0: lexicographic order
Objects.equals(a, b);                        // null-safe comparison
```

So why does `==` sometimes "work"? The JVM stores string **literals** in a special table — the **String Pool**. Identical literals throughout the program point to the same object. Strings created at run time do not end up in the pool.

```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");           // a forced new object
String s4 = "Ja" + "va";                  // a compile-time constant -> the same literal
String part = "Ja";
String s5 = part + "va";                  // computed at run time -> a new object

System.out.println(s1 == s2);             // true
System.out.println(s1 == s3);             // false
System.out.println(s1 == s4);             // true
System.out.println(s1 == s5);             // false
System.out.println(s1 == s5.intern());    // true: intern() returns the pooled instance
System.out.println(s1.equals(s5));        // true
```

> [!CAUTION]
> Comparing strings with `==` is one of the most common mistakes in Java. The code may "work" with literals and break with strings read from a file or the network. Always use `equals`.

## Creating Strings and Length

A string is created with a literal or a constructor. Concatenation is done with the `+` operator; if one of the operands is a string, the other is converted to a string with `String.valueOf` (i.e. `toString()`). The `charAt` method gives access to a character (read-only), and `length()` gives the length.

```java
char[] chars = {'w', 'o', 'r', 'l', 'd'};
String fromLiteral = "Hello";
String fromArray = new String(chars);
String fromSubArray = new String(chars, 1, 2);    // "or"
String repeated = " ".repeat(4);                   // "    "
String concatenated = fromLiteral + ' ' + fromArray;
System.out.println(concatenated);                  // Hello world
System.out.println("length: " + concatenated.length());   // 11
char space = concatenated.charAt(5);
char[] back = concatenated.toCharArray();          // a copy of the characters

System.out.println(1 + 2 + "3");    // "33": first 1 + 2 = 3 (numbers), then "3" + "3"
System.out.println("1" + 2 + 3);    // "123": left to right, already a string
```

For a reference, `String.valueOf(null)` returns `"null"`, so `"x" + null` gives `"xnull"` without an exception.

## Mutable Strings: StringBuilder

Since strings are immutable, every "modification" (e.g. `s += x` in a loop) means:

1. creating a new object;
2. copying the contents of the old string and appending;
3. leaving the old object to the garbage collector.

In a loop with n iterations this gives O(n²) complexity.

The **`StringBuilder`** class is a mutable version of a string with an internal buffer that grows automatically. The `append`, `insert`, `delete`, `replace`, `reverse` and `setCharAt` methods modify the existing buffer instead of creating hundreds of new objects. The result is obtained with `toString()`.

```java
StringBuilder sb = new StringBuilder("Hello, ");
sb.append("this is ")
  .append("a simple ")
  .append("StringBuilder demo.");          // the methods return this -> chaining
sb.insert(0, ">> ");
sb.setCharAt(3, 'h');
System.out.println(sb);                    // >> hello, this is a simple StringBuilder demo.

StringBuilder csv = new StringBuilder();
for (int i = 0; i < 5; i++) {
    if (!csv.isEmpty()) csv.append(',');
    csv.append(i);
}
System.out.println(csv);                   // 0,1,2,3,4
```

> [!NOTE]
> Concatenation in **a single expression** (`a + b + c`) is optimized by the compiler itself (since Java 9 via `invokedynamic` and `StringConcatFactory`), so `StringBuilder` is not needed there. It is needed when a string is built **in a loop**. `StringBuffer` is a synchronized version from Java 1.0; new code does not use it.

## Main Methods

The standard library provides a large set of methods for working with strings:

```java
String example = "Showcasing Java strings";

String sub = example.substring(11, 15);            // "Java": [start, end)
boolean contains = example.contains("Java");       // true
int idx = example.indexOf('a');                    // 5
int last = example.lastIndexOf("s");               // 22
boolean starts = example.startsWith("Show");       // true
String replaced = example.replace("Showcasing", "Demo of");
String upper = example.toUpperCase();
String[] words = example.split(" ");               // ["Showcasing", "Java", "strings"]
String joined = String.join(", ", words);          // "Showcasing, Java, strings"

"  text\t".trim();             // "text": removes characters <= ' '
"\u2003text ".strip();         // "text": aware of Unicode whitespace
"   ".isBlank();               // true
"".isEmpty();                  // true
"a\nb\nc".lines().count();     // 3
"abc".chars().sum();           // the sum of the character codes (IntStream)
"Ab".compareToIgnoreCase("aB");// 0
"x".repeat(3);                 // "xxx"
```

> [!WARNING]
> `split` takes a **regular expression**: `"a.b.c".split(".")` returns an empty array, because a dot means "any character". Correct: `split("\\.")` or `split(Pattern.quote("."))`. Moreover, trailing empty elements are discarded: `"a,b,,".split(",")` gives `["a", "b"]`. To keep them, pass `-1` as the second argument.

The full list of methods is in the [String class documentation](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html).

## Escaping Characters

In string and character literals special characters are written with `\`:

| Sequence | Meaning |
| --- | --- |
| `\n` | line feed |
| `\t` | tab |
| `\r` | carriage return |
| `\"`, `\'` | quotes |
| `\\` | backslash |
| `\u00A9` | a Unicode character by its code |
| `\s` | a space (Java 15+, handy in text blocks) |

Java has no separate "raw" strings like `r"..."`, so Windows paths and regular expressions have to be escaped: `"C:\\Users\\anna\\Documents"`, `"\\d+\\.\\d+"`. For paths it is more convenient to use `/`, which Java accepts on Windows too, or `Path.of("C:", "Users", "anna")`.

## Text Blocks (Java 15)

A text block starts with three quotes `"""` and **a line break**, and ends with three quotes. Inside, quotes and line breaks need no escaping. The common indentation of all lines (determined by the least indented line, including the closing `"""`) is removed automatically, and trailing spaces are stripped. So the contents can be nicely aligned in the code.

```java
String json = """
        {
            "name": "Anna",
            "langs": ["Java", "Kotlin"]
        }
        """;                       // ends with a line break

String sql = """
        SELECT id, name
        FROM users
        WHERE age > ?""";          // no line break at the end

String poem = """
        My pensive SARA ! thy soft cheek reclined \
        Thus on mine arm,\s
        most soothing sweet it is""";
// \ at the end of a line — continuation without a line break; \s — a space that is not stripped
```

Escape sequences in text blocks work the same as in ordinary strings. Three quotes inside are written as `\"""`.

## String Formatting

Java has no string interpolation (`"Hello, {name}"`). For formatting, use `String.format`, the instance method `formatted` (Java 15) and `printf`. A specifier has the form `%[index$][flags][width][.precision]conversion`.

```java
String author = "George Orwell";
String book = "Nineteen Eighty-Four";
int year = 1949;
BigDecimal price = new BigDecimal("19.50");

String description = "%s is the author of %s.%nThe price is %.2f zł, published in %d."
        .formatted(author, book, price, year);
System.out.println(description);

System.out.printf("Number 1: %10.2f|%n", 1.0);       // right-aligned to a width of 10
System.out.printf("Number 2: %-10.2f|%n", 12.5);     // left-aligned
System.out.printf("%,d%n", 1234567);                 // 1,234,567 (depends on the locale)
System.out.printf("%08.3f%n", Math.PI);              // 0003.142
System.out.printf("%x %X %o%n", 255, 255, 8);        // ff FF 10
System.out.printf("%2$s %1$s%n", "world", "hello");  // hello world
System.out.printf("%b %c %e%n", true, 'x', 12345.678);  // true x 1.234568e+04
var random = new Random();
System.out.println("Coin: " + (random.nextDouble() < 0.5 ? "heads" : "tails"));
```

> [!WARNING]
> `String.format` uses the **default locale**: in a Polish or Ukrainian locale `"%.2f"` gives `3,14`, not `3.14`. For machine-readable output (CSV, JSON, protocols) pass `Locale.ROOT`: `String.format(Locale.ROOT, "%.2f", x)`.

More about formatting numbers, dates and locales is on the "Formatting" page.
