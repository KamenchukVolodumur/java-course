---
title: Javadoc
description: Java documentation comments, block and inline tags, HTML special characters, code examples with @snippet, documentation inheritance, Markdown comments, package documentation and generating HTML.
---

## Javadoc

**Javadoc** comments are special `/** ... */` comments written directly before the declaration of a class, interface, method, field or constructor. The `javadoc` tool from the JDK processes them and generates HTML documentation — this is how the [standard library documentation](https://docs.oracle.com/en/java/javase/21/docs/api/) is created.

Why document code:

1. **IDE hints.** IntelliJ IDEA, Eclipse and VS Code show Javadoc during auto-completion and on hover.
2. **Generated documentation.** HTML pages are published together with the library, and Maven Central has a `-javadoc.jar` next to the JAR.
3. **Maintainability.** A documented public API is easier to use and to change without breaking users' expectations.

```java
/**
 * An abstract mathematical matrix.
 * <p>
 * Concrete implementations define how elements are stored:
 * {@link DenseMatrix} stores all elements, {@link SparseMatrix} only the non-zero ones.
 */
public abstract class Matrix { }
```

The first sentence of the comment is the **summary**: it goes into the summary tables of the documentation, so it should be meaningful and self-contained. The rest is the detailed description. The comment text is HTML: paragraphs are separated with `<p>`, lists with `<ul>`/`<li>`.

## Block Tags

Block tags start with `@` at the beginning of a line and come after the description:

| Tag | Purpose |
| --- | --- |
| `@param name description` | a method or constructor parameter |
| `@param <T> description` | a type parameter (generics) |
| `@return description` | the value returned by the method |
| `@throws Type description` | an exception the method may throw (synonym `@exception`) |
| `@see reference` | "See also" |
| `@since version` | the version since which the element exists |
| `@deprecated explanation` | the element is deprecated (together with the `@Deprecated` annotation) |
| `@author`, `@version` | the author and version (for classes) |

```java
/**
 * Withdraws money from the account.
 *
 * @param amount the amount to withdraw; must be positive
 * @return the balance after the operation
 * @throws IllegalArgumentException if {@code amount <= 0}
 * @throws InsufficientFundsException if the account has insufficient funds
 * @see #deposit(BigDecimal)
 * @since 1.2
 */
public BigDecimal withdraw(BigDecimal amount) { ... }

/**
 * Returns the first element of the collection that satisfies the condition.
 *
 * @param <T> the element type
 * @param items the collection to search
 * @param condition the condition
 * @return the found element or an empty {@code Optional}
 */
public static <T> Optional<T> findFirst(Iterable<T> items, Predicate<? super T> condition) { ... }
```

> [!TIP]
> Document the **contract**, not the implementation: what the method accepts (allowed values, whether `null` is allowed), what it returns (whether it can be empty), which exceptions it throws and whether it is thread-safe. A "returns the name" comment on a `getName()` method adds nothing.

## Inline Tags

Inline tags are written in curly braces inside the text:

| Tag | Purpose |
| --- | --- |
| `{@code text}` | code in text, in a monospaced font; HTML characters are not interpreted |
| `{@literal text}` | text as is, without HTML interpretation |
| `{@link Type#method(parameters)}` | a link to another API element |
| `{@linkplain Type#method text}` | the same, but in a normal font |
| `{@value Type#CONSTANT}` | the value of a constant |
| `{@inheritDoc}` | insert the documentation of the overridden method |
| `{@snippet ...}` | a code example block (Java 18) |

Link format: `Class`, `Class#method`, `Class#method(int, String)`, `#method` (in the current class), `package.Class#field`.

## Special Characters

Javadoc text is HTML, so the characters `<`, `>` and `&` must be escaped (`&lt;`, `&gt;`, `&amp;`) or wrapped in `{@code ...}`, inside which they can be written freely:

```java
/**
 * Returns a value &lt; 1.
 * Equivalent to {@code x < 1 && y > 0}.
 * Returns a {@code List<String>}, not an array.
 */
```

## Code Examples

For multi-line examples, since Java 18 the `{@snippet}` tag is used. It preserves indentation, highlights syntax and needs no escaping:

```java
/**
 * Computes the arithmetic mean.
 *
 * {@snippet :
 * double[] data = {1, 2, 3};
 * double avg = Statistics.mean(data);   // 2.0
 * }
 */
public static double mean(double[] data) { ... }
```

Older code uses the `<pre>{@code ... }</pre>` construct for the same purpose.

## Inheriting Documentation

If a method overrides a superclass method or implements an interface method and has no comment of its own, Javadoc **automatically** copies the parent method's documentation. To extend it, `{@inheritDoc}` is used:

```java
/**
 * {@inheritDoc}
 * <p>
 * This implementation runs in O(1).
 */
@Override
public int size() { return count; }
```

## Markdown Comments (Java 23)

Since Java 23 (JEP 467) documentation can be written in **Markdown**, using `///` comments. Block and inline tags work the same way, and links are written in square brackets:

```java
/// Returns the larger of two arguments.
///
/// - if the arguments are equal, `a` is returned;
/// - `null` is not allowed.
///
/// @param a the first value
/// @param b the second value
/// @return the larger value
/// @see [Math#max(int, int)]
public static <T extends Comparable<T>> T max(T a, T b) { ... }
```

## Package and Module Documentation

* The description of a **package** is written in the `package-info.java` file (Javadoc before the `package` declaration).
* The description of a **module** — in Javadoc before the declaration in `module-info.java`.
* An overview of the whole project — in an `overview.html` file passed with the `-overview` option.

## Generating Documentation

```bash
javadoc -d docs -sourcepath src/main/java -subpackages pl.mini      # HTML into the docs directory
mvn javadoc:javadoc                  # target/reports/apidocs
mvn javadoc:jar                      # *-javadoc.jar for publishing
./gradlew javadoc                    # build/docs/javadoc
```

The **doclint** check (enabled by default) reports invalid HTML, missing `@param`/`@return` and non-existent references. On CI servers it is often made strict so that undocumented public API does not get into releases: `javadoc -Xdoclint:all,-missing`.
