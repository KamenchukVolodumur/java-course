---
title: Lab 05: Lambdas, Functional Interfaces and the Stream API
description: Part A: tree traversal with callbacks, "extending" Map, a custom reduction, factory functions and Newton's method on functional interfaces. Part B: a music year in review — Stream API queries (filtering, grouping, joining, aggregation) over listening data.
---

## Before You Start

> [!NOTE]
> **Lectures:** 05.1 "Functional Interfaces and Lambdas", 06.2 "Collections", 06.3 "Stream API" · **Time:** 3 h · **Points:** 10 (A: 5, B: 5)

```text
src/main/java/pl/mini/functional/
├── BinaryTree.java  MapUtils.java  FunctionalUtils.java  Factories.java  Numerics.java
├── MainA.java                     (given)
└── wrapped/
    ├── Track.java  Play.java  Data.java   (given)
    ├── Wrapped.java                       (your queries)
    └── MainB.java                         (given)
```

### Rules

* Uncomment the `STAGE` blocks in `MainA`/`MainB` one by one. The output must match the expected one.
* In part A the Stream API is **forbidden** in the implementations (only loops and functional interfaces): the goal is to understand what happens "under the hood".
* In part B, on the contrary, `for`/`while` loops are **forbidden** in the methods of the `Wrapped` class: each query is one Stream API pipeline (several consecutive ones are allowed).

> [!CAUTION]
> Modifying external state from inside lambdas in streams (`forEach(list::add)`, counters in arrays etc.) is forbidden. The result is obtained with collectors.

## A Quick Theory Recap

### Functional Interfaces

| Interface | Signature |
| --- | --- |
| `Supplier<T>` / `DoubleSupplier` | `() -> T` |
| `Consumer<T>` | `T -> void` |
| `Function<T,R>` | `T -> R` |
| `BiFunction<T,U,R>` | `(T, U) -> R` |
| `Predicate<T>` | `T -> boolean` |
| `BinaryOperator<T>` | `(T, T) -> T` |
| `DoubleUnaryOperator` | `double -> double` |

If you need another signature, declare your own:

```java
@FunctionalInterface
public interface NodeVisitor<T> {
    void visit(T value, int depth);
}
```

### Closures

```java
static DoubleSupplier randomInRange(Random rng, double from, double to) {
    return () -> from + rng.nextDouble() * (to - from);   // rng, from, to are captured
}
```

Captured local variables must be **effectively final**. The `rng` object changes its state, but the reference to it does not change, so this is allowed.

### "Extension Methods"

Java has none. The equivalent is a static utility method: `MapUtils.addOrUpdate(map, ...)` instead of a method on the map itself.

### The Stream API

```java
Map<String, Long> playsPerArtist = plays.stream()
        .map(p -> tracks.get(p.trackId()))
        .filter(Objects::nonNull)
        .collect(Collectors.groupingBy(Track::artist, Collectors.counting()));

List<Map.Entry<String, Long>> top = playsPerArtist.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()))
        .limit(3)
        .toList();
```

> [!TIP]
> `Map.Entry.<String, Long>comparingByValue().reversed()` requires explicit types: without them the compiler cannot infer the types for `reversed()`. An alternative is `Comparator.comparing(Map.Entry::getValue, Comparator.reverseOrder())`.

## Part A — the Expected Output

This is what `MainA` prints once all the stages are uncommented (the file itself is in the starter project):

```text
[5, 3, 1, 4, 8, 9] [1, 3, 4, 5, 8, 9] [1, 4, 3, 9, 8, 5]
    1
  3
    4
5
  8
    9
{a=11}
{be=3, not=1, or=1, to=3}
15
Optional[84]
Optional[7] Optional.empty
abc
true true
1.414214 3.000000 0.739085
OK: derivative ≈ 0
```

## Stage A1: Tree Traversal with Callbacks (1 pt)

```java
public class BinaryTree<T extends Comparable<? super T>> {
    @SafeVarargs
    public static <T extends Comparable<? super T>> BinaryTree<T> of(T... values);   // inserting one by one (a BST)

    public void insert(T value);                     // smaller to the left, greater or equal to the right
    public void depthFirst(NodeVisitor<T> pre, NodeVisitor<T> in, NodeVisitor<T> post);
    public void printInOrder();
}
```

* `depthFirst` is a **recursive** depth-first traversal. For each node, `pre` is called (before the left subtree), `in` (between the subtrees) and `post` (after the right one). Any of the callbacks may be `null` — then it is skipped. The depth of the root is 0.
* Implement `printInOrder` **through** `depthFirst`, passing only `in`: a line is `depth * 2` spaces and the value.

> [!TIP]
> One traversal method with three callbacks replaces three separate methods (preOrder, inOrder, postOrder) and any number of traversals with different actions. The callbacks play the role of strategies here.

## Stage A2: an "Extension" for Map (1 pt)

The `MapUtils` class (final, a private constructor):

```java
public static <K, V> V addOrUpdate(Map<K, V> map, K key, V addValue,
                                   BiFunction<? super K, ? super V, ? extends V> update);
public static Map<String, Integer> countWords(String text);
```

* `addOrUpdate`: if the key is absent, it puts `addValue`, otherwise `update.apply(key, old)`. It returns the new value.
* Implement it **without** `Map.merge`/`compute` (only `containsKey`, `get`, `put`), to understand what those methods do.
* `countWords`: words are sequences of letters (`split("[^\\p{L}]+")`, empty ones are skipped), case-insensitive, the result is a `TreeMap`. Use `addOrUpdate`.

## Stage A3: A Custom Reduction (1 pt)

The `FunctionalUtils` class:

```java
public static <T> T reduce(Iterable<? extends T> items, T identity, BinaryOperator<T> op);
public static <T> Optional<T> reduce(Iterable<? extends T> items, BinaryOperator<T> op);
public static <T extends Comparable<? super T>> Optional<T> max(Iterable<? extends T> items);
public static <T extends Comparable<? super T>> Optional<T> min(Iterable<? extends T> items);
```

* The second version of `reduce` takes the first element as the initial value, and returns `Optional.empty()` for an empty collection.
* Implement `max` and `min` **through** `reduce`, without a loop of your own.

The counterpart in Java's library is `Stream.reduce`. Here — **without** a `Stream`.

## Stage A4: Factory Functions and the Monte Carlo Method (1 pt)

The `Factories` class:

```java
public record Point(double x, double y) { }

public static DoubleSupplier randomInRange(Random rng, double from, double to);   // uniformly from [from, to)
public static Supplier<Point> randomPoint(Random rng, double from, double to);
public static double monteCarloPi(Supplier<Point> points, int samples);
public static double monteCarloPi(Supplier<Point> points);                        // samples = 1024
```

* `from >= to` → `IllegalArgumentException`.
* Build `randomPoint` from `randomInRange` (reusing a function).
* `monteCarloPi`: generate `samples` points from the square [−1, 1)², count the fraction of those that fall into the unit circle (x² + y² ≤ 1), and multiply by 4. The default value is implemented with an **overload**: Java has no default parameters.

> [!NOTE]
> The method receives not points but **a source of points** (a `Supplier`). That is why a deterministic sequence can be substituted in tests, and a random number generator in production.

## Stage A5: Newton's Method (1 pt)

The `Numerics` class:

```java
public static DoubleUnaryOperator derivative(DoubleUnaryOperator f, double h);   // (f(x+h) − f(x−h)) / 2h
public static double newton(DoubleUnaryOperator f, DoubleUnaryOperator df,
                            double x0, double eps, int maxIter);
public static double newton(DoubleUnaryOperator f, double x0);   // df = derivative(f, 1e-6), eps = 1e-10, maxIter = 100

public static double sqrt(double a);            // the root of x² − a = 0
public static double cubeRoot(double a);        // the root of x³ − a = 0
public static double solveCosEqualsX();         // cos x = x, starting from x0 = 1
```

[Newton's method](https://en.wikipedia.org/wiki/Newton%27s_method): x₍ₙ₊₁₎ = xₙ − f(xₙ) / f′(xₙ). Stop when |x₍ₙ₊₁₎ − xₙ| < eps.

* |f′(xₙ)| < 1e-12 → `ArithmeticException("derivative ≈ 0")`.
* No convergence within `maxIter` steps → `ArithmeticException("no convergence")`.
* `sqrt`/`cubeRoot` for a negative `a`: `sqrt` → `IllegalArgumentException`; `cubeRoot` must work.
* The three wrappers are one-liners: only a lambda and a call to `newton`.

## Part B — the Data

You are building your own "music year in review" from a listening history. The data is given in `Data.java` as text blocks in CSV format (the separator is `;`, the first line is the header).

```java
package pl.mini.functional.wrapped;

public record Track(String id, String title, String artist, String genre, int durationSec) { }
public record Play(LocalDate date, String trackId, int secondsPlayed) { }

public final class Data {
    public static final String TRACKS = """
            id;title;artist;genre;durationSec
            T1;Sunrise;Aurora Lane;pop;200
            T2;Night Drive;Neon Fox;synthwave;240
            T3;Paper Boats;Aurora Lane;pop;180
            T4;Granite;Stone Echo;rock;300
            T5;Low Tide;Neon Fox;synthwave;210
            T6;Wildfire;Stone Echo;rock;260
            """;

    public static final String PLAYS = """
            date;trackId;secondsPlayed
            2025-01-03;T1;200
            2025-01-03;T2;240
            2025-01-04;T1;200
            2025-01-05;T4;150
            2025-01-20;T2;240
            2025-02-01;T3;180
            2025-02-02;T3;180
            2025-02-02;T5;210
            2025-02-03;T1;100
            2025-02-14;T6;260
            2025-03-01;T2;240
            2025-03-02;T2;240
            2025-03-03;T4;300
            2025-03-04;T9;120
            """;
}
```

> [!IMPORTANT]
> The track `T9` in the plays is **missing** from the catalog (it was removed from the service). In queries that need track data (the title, artist, genre, duration), such plays are skipped. Queries over plays only (the count, minutes, days) take them into account.

## Part B — the Expected Output

What `MainB` prints once all the stages are uncommented:

```text
Plays: 14
Minutes: 47.7
Distinct tracks: 7
Listening days: 12
1. Night Drive — Neon Fox (4)
2. Sunrise — Aurora Lane (3)
3. Granite — Stone Echo (2)
Neon Fox: 19.5 min
Aurora Lane: 14.3 min
Stone Echo: 11.8 min
Unknown plays: 1
pop: 5 (38.5%)
synthwave: 5 (38.5%)
rock: 3 (23.1%)
Completed: 11, skipped: 2
2025-01 | plays: 5 | favorite: Neon Fox
2025-02 | plays: 5 | favorite: Aurora Lane
2025-03 | plays: 3 | favorite: Neon Fox
===== 2025 SUMMARY =====
Minutes of music: 47.7
Track of the year: Night Drive — Neon Fox
Artist of the year: Neon Fox
Genre of the year: pop
Longest streak: 4 days (2025-03-01 – 2025-03-04)
```

## Stage B1: Loading and the First Queries (1 pt)

```java
public static Map<String, Track> parseTracks(String csv);   // id -> Track, in file order (LinkedHashMap)
public static List<Play> parsePlays(String csv);

public long playCount();
public double totalMinutes();        // the sum of secondsPlayed / 60.0 (all plays)
public long distinctTracks();        // distinct trackIds among the plays
public long listeningDays();         // distinct dates
```

* Parsing: `csv.lines().skip(1).filter(not(String::isBlank)).map(line -> line.split(";"))...`.
* `parseTracks` — `Collectors.toMap(Track::id, identity(), (a, b) -> a, LinkedHashMap::new)`.
* A date: `LocalDate.parse(...)` (the ISO format needs no formatter).

## Stage B2: Rankings (1 pt)

```java
public List<String> topTracks(int n);
public Map<String, Double> topArtistsByMinutes();
```

* `topTracks`: count the plays of each **known** track, sort by descending count, and alphabetically by title for equal counts. A line: `"%d. %s — %s (%d)"` (position, title, artist, count). Number the positions with `IntStream.range(0, list.size())`.
* `topArtistsByMinutes`: the sum of `secondsPlayed` per artist (known tracks only) in minutes, descending. The result is a `LinkedHashMap`, to preserve the order.

> [!TIP]
> A "join" of two data sets in the Stream API is an ordinary `map(p -> tracks.get(p.trackId()))` over an index map. There is no dedicated join operation, and building your own join is usually not needed.

## Stage B3: Genres and Completed Plays (1 pt)

```java
public long unknownPlays();                 // plays of tracks missing from the catalog
public List<String> genreShare();           // "genre: N (P%)"
public Map<Boolean, Long> completion();     // true — secondsPlayed >= durationSec
```

* `genreShare`: a share of the number of **known** plays, percentages with one decimal place (`Locale.ROOT`). Sorting — by descending count, then by genre name.
* `completion`: `Collectors.partitioningBy(..., Collectors.counting())`, known tracks only.

## Stage B4: Monthly Statistics (1 pt)

```java
public List<String> monthly();
```

For each month (`YearMonth.from(date)`), **in ascending order** (grouping into a `TreeMap`) and for known tracks only:

* the number of plays;
* the favorite artist — the one listened to the most **seconds** in that month.

Format: `"2025-01 | plays: 5 | favorite: Neon Fox"`.

> [!TIP]
> You will need nested grouping: `groupingBy(month, TreeMap::new, groupingBy(artist, summingInt(...)))`, and for each month a search for the maximum in the inner map. The number of plays can be obtained with `collectingAndThen` or with a second simple query.

## Stage B5: The Final Report (1 pt)

```java
public String report(int year);
```

It combines the previous queries into a year summary (see the expected output). Every line ends with `\n` (do not use `%n`: on Windows it gives `\r\n`).

* **Track of the year** — the first in `topTracks`.
* **Artist of the year** — the first in `topArtistsByMinutes`.
* **Genre of the year** — the first in `genreShare` (the name only).
* **Longest streak** — the longest sequence of **consecutive days** with listening (all plays, including unknown ones). For equal lengths, the earliest streak is taken.

Finding the streak with a "pure" pipeline is hard, because state carries over from element to element. One of two approaches is allowed:

1. Sort the dates and pass them through a `reduce`/custom collector that keeps the current and the best streak in an immutable record.
2. The streak key: `date.toEpochDay() − index` (the index in the sorted list of dates) is the same for the days of one streak. Group by it!

> [!NOTE]
> The second trick is very useful: consecutive days minus consecutive indexes give the same difference. The "streaks" problem is solved with this technique in SQL too.

Commit, tag it `lab05` and push.

## Extras (No Points)

* Rewrite `topArtistsByMinutes` with `parallelStream()` and explain why the result is the same, while `forEach` from a parallel stream would print lines in an arbitrary order.
* Add a "week of the year": the week (`IsoFields.WEEK_OF_WEEK_BASED_YEAR`) with the most minutes.
* Generate 1,000,000 random plays and compare the time of `stream()` and `parallelStream()` for B2.
