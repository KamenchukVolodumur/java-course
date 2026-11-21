---
title: Stream API
description: Declarative processing of sequences in Java — how a pipeline works, lazy execution, streaming and buffering operations, an overview of the operations and a detailed look at each category: filtering, projection, joining, sorting, grouping, sets, conversion, element selection, aggregation, generation.
---

## Stream API

The **Stream API** (the `java.util.stream` package, Java 8) is the uniform way to describe the processing of data sequences declaratively: filtering, transforming, sorting, grouping and aggregating them with a chain of operations. A stream is **not a collection**: it stores no elements, but describes a **pipeline** for processing them from some source (a collection, an array, a file, a generator).

```java
List<String> names = List.of("Tom", "Dick", "Harry", "Mary", "Jay");

List<String> result = names.stream()           // 1. the source
        .filter(n -> n.contains("a"))          // 2. intermediate operations (lazy)
        .sorted(Comparator.comparing(String::length))
        .map(String::toUpperCase)
        .toList();                             // 3. the terminal operation — starts the computation

System.out.println(result);                    // [JAY, MARY, HARRY]
```

A pipeline consists of three parts:

1. **the source**: `collection.stream()`, `Arrays.stream(array)`, `Stream.of(...)`, `Files.lines(path)` …;
2. zero or more **intermediate operations**: each returns a new `Stream` and computes nothing;
3. exactly one **terminal operation**: `toList`, `collect`, `forEach`, `count`, `reduce`, `findFirst` … It starts the computation and returns the result.

## The Internal Implementation

Each intermediate operation merely adds one more stage to the pipeline. During the terminal operation the stream obtains elements from the source through a `Spliterator` and "pushes" them one by one through the chain of stages. In simplified form, `filter` could be implemented as a wrapper iterator:

```java
static <T> Iterator<T> filter(Iterator<T> source, Predicate<? super T> predicate) {
    return new Iterator<>() {
        private T next;
        private boolean ready;

        public boolean hasNext() {
            while (!ready && source.hasNext()) {
                T candidate = source.next();
                if (predicate.test(candidate)) { next = candidate; ready = true; }
            }
            return ready;
        }

        public T next() {
            if (!hasNext()) throw new NoSuchElementException();
            ready = false;
            return next;
        }
    };
}
```

The real implementation builds a chain of `Sink` objects: each one accepts an element (`accept`) and passes it (or the result of a transformation) to the next one. The principle is the same: no intermediate collections between the operations.

## Lazy Execution

The most important property of streams is **lazy (deferred) execution**. Describing a pipeline performs no work. The computation starts only with the terminal operation, and the elements pass through the pipeline **one at a time, vertically**, not "the whole collection through filter, then all of it through map".

```java
Stream<String> pipeline = Stream.of("a", "bb", "ccc", "dddd")
        .filter(s -> { System.out.println("filter " + s); return s.length() > 1; })
        .map(s -> { System.out.println("map " + s); return s.toUpperCase(); });

System.out.println("nothing has run yet");
String first = pipeline.findFirst().orElseThrow();
// filter a
// filter bb
// map bb          <- the first result is found: the remaining elements are not processed at all
System.out.println(first);   // BB
```

Thanks to this, terminal operations like `findFirst`, `anyMatch` or `limit` can **finish processing early** (short-circuiting), and even infinite streams can be processed.

> [!NOTE]
> Deferred execution does not mean that every operation processes elements one at a time. **Streaming** stateless operations (`filter`, `map`, `limit`) pass each element on immediately. **Stateful** operations (`sorted`, `distinct`) must first read **the whole** source: in the example at the top of the page, `sorted` sorts all the names that passed `filter` and only then hands the first one to `map`. That is why `sorted()` on an infinite stream never finishes.

> [!WARNING]
> **A stream is single-use.** After a terminal operation it cannot be reused: a second terminal operation throws `IllegalStateException: stream has already been operated upon or closed`. If the results are needed several times, store them in a collection (`toList()`) or create a new stream from the source.

### Streams and Databases

A stream processes data **in the application's memory**. If the source is a database table while filtering and sorting are done by the stream, the database will first return **all rows**, and only then will the application filter them:

```java
// INEFFICIENT: SELECT * FROM products, then filtering in Java
List<Product> top = productRepository.findAll().stream()
        .filter(p -> p.price().compareTo(new BigDecimal("100")) > 0)
        .sorted(Comparator.comparing(Product::name))
        .limit(10)
        .toList();

// EFFICIENT: the condition, sorting and limit run in the database
// SELECT * FROM products WHERE price > ? ORDER BY name LIMIT 10
List<Product> top2 = productRepository.findTop10ByPriceGreaterThanOrderByName(new BigDecimal("100"));
```

Database queries are formulated in the database's language (SQL, JPQL) or with libraries that generate SQL (JPA Criteria, jOOQ, Spring Data). The "Extras → Databases" chapter covers this in more detail.

## Overview of the Operations

| Category | Operations |
| --- | --- |
| **Filtering** | `filter`, `limit`, `skip`, `takeWhile`, `dropWhile`, `distinct` |
| **Projection** | `map`, `mapToInt`/`mapToLong`/`mapToDouble`/`mapToObj`, `flatMap`, `mapMulti`, `boxed` |
| **Joining** | no dedicated operations: an index map + `map`/`flatMap`, `IntStream.range` for pairwise combination |
| **Sorting** | `sorted()`, `sorted(Comparator)`; `Comparator.comparing`, `thenComparing`, `reversed` |
| **Grouping** | `Collectors.groupingBy`, `partitioningBy`, `Gatherers.windowFixed` (Java 24) |
| **Sets** | `Stream.concat`, `distinct`, `filter(set::contains)` |
| **Conversion** | `toList`, `toArray`, `collect(toSet/toMap/toCollection/joining)`, `iterator` |
| **Element selection** | `findFirst`, `findAny`, `min`, `max` → `Optional` |
| **Aggregation** | `reduce`, `count`, `sum`, `average`, `summaryStatistics`, `anyMatch`, `allMatch`, `noneMatch`, `Collectors.*ing` |
| **Generation** | `Stream.empty`, `of`, `ofNullable`, `iterate`, `generate`, `IntStream.range`/`rangeClosed` |
| **Other** | `peek`, `forEach`, `forEachOrdered`, `parallel`, `sequential`, `onClose`, `gather` (Java 24) |

The examples below use these records:

```java
record Person(String firstName, String lastName, int age) { }
record Category(int id, String name) { }
record Product(String name, int categoryId, BigDecimal price) { }
```

### Filtering

Operations in this category select elements that satisfy a condition, limit the number of results or skip unwanted elements.

#### filter

Keeps only the elements for which the predicate returns `true`.

```java
List<Integer> evenNumbers = Stream.of(1, 2, 3, 4, 5).filter(n -> n % 2 == 0).toList();
// [2, 4]
```

#### limit

Keeps at most the first `n` elements. The operation is short-circuiting: processing stops after `n` elements.

```java
List<Integer> firstThree = Stream.of(1, 2, 3, 4, 5).limit(3).toList();
// [1, 2, 3]
```

To take the **last** `n` elements, the stream must know its size: for a list — `list.subList(list.size() - n, list.size())`, for an arbitrary stream — `skip(count - n)` after counting, or collect into a bounded `ArrayDeque`.

#### skip

Skips the first `n` elements and returns the rest.

```java
List<Integer> afterFirstTwo = Stream.of(1, 2, 3, 4, 5).skip(2).toList();
// [3, 4, 5]
```

#### takeWhile

Returns elements **from the beginning** of the stream while the condition holds. At the first element that does not satisfy it, processing stops (Java 9).

```java
List<Integer> lessThanFour = Stream.of(1, 2, 3, 4, 1, 2).takeWhile(n -> n < 4).toList();
// [1, 2, 3] — the trailing 1, 2 are not included, because processing stopped after 4
```

#### dropWhile

Skips elements from the beginning of the stream while the condition holds, and then returns all the rest (Java 9).

```java
List<Integer> fourAndOnward = Stream.of(1, 2, 3, 4, 1, 2).dropWhile(n -> n < 4).toList();
// [4, 1, 2]
```

#### distinct

Removes duplicates (by `equals`/`hashCode`), keeping the first occurrence.

```java
List<Integer> unique = Stream.of(1, 2, 2, 3, 1).distinct().toList();
// [1, 2, 3]
```

There is no separate "distinct by key" operation. It can be expressed with a `toMap` collector with a merge function that keeps the first element:

```java
record Item(String name, String category) { }
List<Item> items = List.of(new Item("Apple", "Fruit"), new Item("Orange", "Fruit"), new Item("Carrot", "Vegetable"));

Collection<Item> onePerCategory = items.stream()
        .collect(Collectors.toMap(Item::category, i -> i, (first, second) -> first, LinkedHashMap::new))
        .values();
// [Item[name=Apple, ...], Item[name=Carrot, ...]]
```

### Projection

Projection transforms every element of the stream into a new form: extracts the needed fields, computes values or builds new objects.

#### map

The basic projection operation: transforms each element with a function.

```java
List<Person> people = List.of(
        new Person("John", "Smith", 42),
        new Person("Jane", "Doe", 35),
        new Person("Peter", "Jones", 50));

List<String> fullNames = people.stream()
        .map(p -> p.firstName() + " " + p.lastName())
        .toList();
// [John Smith, Jane Doe, Peter Jones]
```

#### mapToInt, mapToObj and Primitive Streams

Besides `Stream<T>`, there are **primitive streams** `IntStream`, `LongStream`, `DoubleStream`. They do not box numbers and have numeric operations (`sum`, `average`, `max`, `summaryStatistics`). One switches between them with `mapToInt`, `mapToObj`, `boxed`, `asDoubleStream`.

```java
int totalAge = people.stream().mapToInt(Person::age).sum();            // 127
OptionalDouble avg = people.stream().mapToInt(Person::age).average();  // 42.33...
List<Integer> ages = people.stream().mapToInt(Person::age).boxed().toList();
```

#### Elements with an Index

There is no separate operation that attaches the position to an element. For lists, a stream of indexes is used:

```java
List<String> planets = List.of("Mercury", "Venus", "Earth");
IntStream.range(0, planets.size())
        .mapToObj(i -> i + ": " + planets.get(i))
        .forEach(System.out::println);
// 0: Mercury
// 1: Venus
// 2: Earth
```

#### flatMap

"Flattens" a stream of streams: each element is turned into a stream, and they are all merged into one.

```java
List<String> sentences = List.of("hello world", "how are you");
List<String> words = sentences.stream()
        .flatMap(s -> Arrays.stream(s.split(" ")))
        .toList();
// [hello, world, how, are, you]
```

#### mapMulti

An alternative to `flatMap` when an element turns into 0, 1 or several values and creating an intermediate stream for that is unnecessary (Java 16):

```java
List<Integer> repeated = Stream.of(1, 2, 3)
        .<Integer>mapMulti((n, downstream) -> {
            for (int i = 0; i < n; i++) downstream.accept(n);
        })
        .toList();
// [1, 2, 2, 3, 3, 3]
```

### Joining

The Stream API has no dedicated `join` operations. A join of two sequences by key is built from an **index map** (a hash join): first one sequence is turned into a `Map` by key, then the other is traversed and its matches are looked up in O(1).

```java
List<Category> categories = List.of(
        new Category(1, "Electronics"),
        new Category(2, "Food"),
        new Category(3, "Toys"));                     // a category without products

List<Product> products = List.of(
        new Product("Laptop", 1, new BigDecimal("3999")),
        new Product("Milk", 2, new BigDecimal("3.49")),
        new Product("Keyboard", 1, new BigDecimal("199")),
        new Product("Bread", 2, new BigDecimal("5.99")),
        new Product("Monitor", 1, new BigDecimal("899")),
        new Product("Spaceship", 4, new BigDecimal("1e9")));   // a product without a category
```

#### Inner Join

Returns only the pairs that have a match in both sequences (like `INNER JOIN` in SQL):

```java
Map<Integer, Category> categoryById = categories.stream()
        .collect(Collectors.toMap(Category::id, c -> c));

record ProductRow(String product, String category) { }

List<ProductRow> rows = products.stream()
        .filter(p -> categoryById.containsKey(p.categoryId()))         // no match — drop it
        .map(p -> new ProductRow(p.name(), categoryById.get(p.categoryId()).name()))
        .toList();
rows.forEach(r -> System.out.printf("- %s, %s%n", r.product(), r.category()));
```

```text
+-----------+-------------+
| Product   | Category    |
+-----------+-------------+
| Laptop    | Electronics |
| Milk      | Food        |
| Keyboard  | Electronics |
| Bread     | Food        |
| Monitor   | Electronics |
+-----------+-------------+
```

#### Group Join

For each element of the first sequence we get a **group** of matching elements of the second (like `LEFT OUTER JOIN` + `GROUP BY`):

```java
Map<Integer, List<Product>> productsByCategory = products.stream()
        .collect(Collectors.groupingBy(Product::categoryId));

for (Category cat : categories) {
    List<Product> group = productsByCategory.getOrDefault(cat.id(), List.of());
    System.out.println("Category: " + cat.name());
    if (group.isEmpty()) {
        System.out.println("  - (no products)");
    }
    group.forEach(p -> System.out.println("  - " + p.name()));
}
```

```text
Category: Electronics
  - Laptop
  - Keyboard
  - Monitor
Category: Food
  - Milk
  - Bread
Category: Toys
  - (no products)
```

#### Left Join

All elements of the first sequence, with an empty value where there is no match:

```java
List<String> leftJoin = categories.stream()
        .flatMap(cat -> {
            List<Product> group = productsByCategory.getOrDefault(cat.id(), List.of());
            return group.isEmpty()
                    ? Stream.of(cat.name() + ": (none)")
                    : group.stream().map(p -> cat.name() + ": " + p.name());
        })
        .toList();
// [Electronics: Laptop, Electronics: Keyboard, Electronics: Monitor, Food: Milk, Food: Bread, Toys: (none)]
```

#### Pairwise Combination (zip)

Combines two sequences "element by element". The length of the result equals the length of the shorter one:

```java
List<Integer> numbers = List.of(1, 2, 3);
List<String> letters = List.of("A", "B", "C", "D");

List<String> zipped = IntStream.range(0, Math.min(numbers.size(), letters.size()))
        .mapToObj(i -> numbers.get(i) + "-" + letters.get(i))
        .toList();
// [1-A, 2-B, 3-C]
```

### Sorting

#### sorted

`sorted()` orders the elements by natural order (`Comparable`), `sorted(comparator)` by the given comparator. The sort is stable: equal elements keep their original order.

```java
List<String> sorted = Stream.of("pear", "Fig", "apple").sorted().toList();
// [Fig, apple, pear]: uppercase letters are smaller than lowercase in Unicode
List<String> ci = Stream.of("pear", "Fig", "apple").sorted(String.CASE_INSENSITIVE_ORDER).toList();
// [apple, Fig, pear]
List<Integer> desc = Stream.of(3, 1, 2).sorted(Comparator.reverseOrder()).toList();
// [3, 2, 1]
```

#### Composite Criteria

Comparators are built with factories and combined with the `thenComparing` and `reversed` methods:

```java
List<Person> byLastThenAge = people.stream()
        .sorted(Comparator.comparing(Person::lastName)
                .thenComparing(Person::age, Comparator.reverseOrder()))
        .toList();

List<Person> oldestFirst = people.stream()
        .sorted(Comparator.comparingInt(Person::age).reversed())
        .toList();

List<Person> nullsLast = people.stream()
        .sorted(Comparator.comparing(Person::lastName, Comparator.nullsLast(Comparator.naturalOrder())))
        .toList();
```

#### Reverse Order and Shuffling

There are no dedicated stream operations for this: they need the whole sequence. They are done on a list:

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
List<Integer> reversed = list.reversed();          // Java 21: a reversed view [4, 3, 2, 1]
Collections.reverse(list);                         // in place
Collections.shuffle(list, new Random(42));         // random order (reproducible with a seed)
```

### Grouping

#### groupingBy

The `groupingBy` collector divides the elements into groups by key and returns a `Map<K, List<T>>`. As the second argument a **downstream collector** can be passed that processes each group, and the result map can be replaced, e.g. with a sorted `TreeMap`.

```java
List<String> words = List.of("apple", "avocado", "banana", "blueberry", "cherry");

Map<Character, List<String>> byFirst = words.stream()
        .collect(Collectors.groupingBy(w -> w.charAt(0)));
// {a=[apple, avocado], b=[banana, blueberry], c=[cherry]}

Map<Character, Long> countByFirst = words.stream()
        .collect(Collectors.groupingBy(w -> w.charAt(0), TreeMap::new, Collectors.counting()));
// {a=2, b=2, c=1}

Map<Integer, BigDecimal> totalByCategory = products.stream()
        .collect(Collectors.groupingBy(Product::categoryId,
                 Collectors.reducing(BigDecimal.ZERO, Product::price, BigDecimal::add)));

Map<Integer, Set<String>> namesByCategory = products.stream()
        .collect(Collectors.groupingBy(Product::categoryId,
                 Collectors.mapping(Product::name, Collectors.toCollection(TreeSet::new))));

Map<Integer, Optional<Product>> cheapestByCategory = products.stream()
        .collect(Collectors.groupingBy(Product::categoryId,
                 Collectors.minBy(Comparator.comparing(Product::price))));
```

| Downstream collector | Result for a group |
| --- | --- |
| `toList()`, `toSet()`, `toCollection(...)` | a collection of the elements |
| `counting()` | the count (`Long`) |
| `summingInt/Long/Double(f)`, `averagingInt/Long/Double(f)` | the sum, the average |
| `minBy(cmp)`, `maxBy(cmp)` | an `Optional` with the minimum/maximum |
| `mapping(f, downstream)`, `filtering(p, downstream)`, `flatMapping(f, downstream)` | a transformation inside the group |
| `reducing(identity, mapper, op)` | an arbitrary reduction |
| `joining(sep)` | strings joined with a separator |
| `collectingAndThen(downstream, finisher)` | post-processing of the group's result |

#### partitioningBy

A special case of grouping by a predicate: the result always has **two** keys, `true` and `false`, even if one of the groups is empty.

```java
Map<Boolean, List<Integer>> evenOdd = IntStream.rangeClosed(1, 10).boxed()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
// {false=[1, 3, 5, 7, 9], true=[2, 4, 6, 8, 10]}
```

#### Splitting into Chunks

Since Java 24 there are **gatherers** — custom intermediate operations. The standard `Gatherers.windowFixed(n)` divides a stream into lists of `n` elements, `windowSliding(n)` into "sliding windows":

```java
List<List<Integer>> chunks = IntStream.rangeClosed(1, 7).boxed()
        .gather(Gatherers.windowFixed(3))
        .toList();
// [[1, 2, 3], [4, 5, 6], [7]]

List<List<Integer>> sliding = Stream.of(1, 2, 3, 4).gather(Gatherers.windowSliding(2)).toList();
// [[1, 2], [2, 3], [3, 4]]
```

In older versions chunking is done with indexes: `IntStream.range(0, (n + size - 1) / size).mapToObj(i -> list.subList(i * size, Math.min(n, (i + 1) * size)))`.

### Set Operations

#### Concatenating Sequences

`Stream.concat` joins two streams one after the other; for several — `Stream.of(a, b, c).flatMap(...)`.

```java
List<Integer> concatenated = Stream.concat(Stream.of(1, 2), Stream.of(2, 3)).toList();
// [1, 2, 2, 3]
List<Integer> union = Stream.concat(Stream.of(1, 2), Stream.of(2, 3)).distinct().toList();
// [1, 2, 3]
```

#### Intersection and Difference

The second sequence is turned into a `Set` so that a membership check costs O(1):

```java
List<Integer> a = List.of(1, 2, 3, 4);
Set<Integer> b = Set.of(3, 4, 5);

List<Integer> intersect = a.stream().filter(b::contains).toList();                  // [3, 4]
List<Integer> except = a.stream().filter(Predicate.not(b::contains)).toList();      // [1, 2]

Set<Integer> hiddenCategoryIds = Set.of(3, 4);                                      // "difference by key"
List<Product> visible = products.stream()
        .filter(p -> !hiddenCategoryIds.contains(p.categoryId()))
        .toList();
```

### Conversion

#### Selecting Elements of a Given Type

Filter elements and cast them to the required type:

```java
List<Object> mixed = List.of(1, "two", 3.0, "four", 5);
List<String> strings = mixed.stream()
        .filter(String.class::isInstance)
        .map(String.class::cast)
        .toList();                                         // [two, four]

List<Integer> ints = mixed.stream()
        .<Integer>mapMulti((o, sink) -> { if (o instanceof Integer i) sink.accept(i); })
        .toList();                                         // [1, 5]
```

#### toList, toArray and collect

Terminal operations that **materialize** the result:

```java
List<String> list = stream.toList();                           // an immutable list (Java 16)
List<String> mutable = stream.collect(Collectors.toList());   // a mutable ArrayList (not guaranteed by the specification)
String[] array = stream.toArray(String[]::new);
Set<String> set = stream.collect(Collectors.toSet());
TreeSet<String> sortedSet = stream.collect(Collectors.toCollection(TreeSet::new));
String csv = stream.collect(Collectors.joining(", ", "[", "]"));   // "[a, b, c]"

Map<String, Integer> lengths = Stream.of("a", "bb", "ccc")
        .collect(Collectors.toMap(s -> s, String::length));    // {a=1, bb=2, ccc=3}
```

> [!WARNING]
> `Collectors.toMap` throws `IllegalStateException: Duplicate key` if two elements have the same key. If duplicates are possible, pass a merge function as the third argument: `toMap(k, v, (old, neu) -> old)` or `Integer::sum`. For "key → list of values", use `groupingBy`.

### Element Selection

Operations returning a single element return an **`Optional`**: the stream may be empty.

#### findFirst and findAny

```java
Optional<Person> firstAdult = people.stream().filter(p -> p.age() >= 18).findFirst();
String name = firstAdult.map(Person::firstName).orElse("none");
```

In a sequential stream `findAny` usually returns the first element, but in a parallel one it returns any element, and faster.

#### The Last Element

```java
Optional<Integer> last = Stream.of(1, 2, 3).reduce((a, b) -> b);    // 3
Integer lastOfList = List.of(1, 2, 3).getLast();                    // Java 21, for lists
```

#### The Single Element

If **exactly one** element is expected and several are an error, a collector with a check is used:

```java
Person only = people.stream()
        .filter(p -> p.lastName().equals("Doe"))
        .collect(Collectors.collectingAndThen(Collectors.toList(), l -> {
            if (l.size() != 1) throw new IllegalStateException("Expected exactly one, found " + l.size());
            return l.getFirst();
        }));
```

#### The Element at a Position

```java
Optional<String> third = Stream.of("a", "b", "c", "d").skip(2).findFirst();   // c
```

#### min and max

They return the minimum or maximum element by a comparator:

```java
Optional<Person> oldest = people.stream().max(Comparator.comparingInt(Person::age));
Optional<Product> cheapest = products.stream().min(Comparator.comparing(Product::price));
```

#### Default Values

```java
int maxOrZero = Stream.<Integer>empty().max(Integer::compare).orElse(0);
```

### Aggregation

#### reduce

A general reduction: combines all elements into one value with a binary operation. With an initial value (identity) it returns a value, without one — an `Optional`.

```java
int product = Stream.of(1, 2, 3, 4).reduce(1, (acc, n) -> acc * n);        // 24
Optional<Integer> sum = Stream.of(1, 2, 3).reduce(Integer::sum);           // Optional[6]
BigDecimal total = products.stream().map(Product::price).reduce(BigDecimal.ZERO, BigDecimal::add);
```

#### sum, average, max, min

For numbers — through primitive streams:

```java
int s = IntStream.of(10, 20, 30).sum();                  // 60
double a = IntStream.of(10, 20, 30).average().orElse(0); // 20.0
IntSummaryStatistics st = IntStream.of(10, 20, 30).summaryStatistics();
st.getMin(); st.getMax(); st.getAverage(); st.getSum(); st.getCount();
```

#### count

```java
long count = Stream.of(1, 2, 3).count();                                 // 3
long evenCount = Stream.of(1, 2, 3).filter(n -> n % 2 == 0).count();     // 1
```

If the source knows its size (`SIZED`) and the intermediate operations do not change it, `count` may not traverse the elements at all. That is why side effects in a `peek` before `count` may **not run**.

#### anyMatch, allMatch, noneMatch

Boolean checks that finish as soon as the answer is known:

```java
List<Integer> odd = List.of(1, 3, 5);
boolean allOdd = odd.stream().allMatch(n -> n % 2 != 0);     // true
boolean anyEven = odd.stream().anyMatch(n -> n % 2 == 0);     // false
boolean noneNeg = odd.stream().noneMatch(n -> n < 0);         // true
boolean hasThree = odd.contains(3);                            // for collections — contains
```

For an empty stream `allMatch` and `noneMatch` return `true`, and `anyMatch` returns `false`.

#### Sequence Equality

Two collections are compared with `equals` (lists element by element, respecting order). For arbitrary streams — collect them into lists:

```java
boolean equal = List.of(1, 2, 3).equals(Stream.of(1, 2, 3).toList());   // true
```

#### Several Aggregates in One Pass

`Collectors.teeing` (Java 12) passes each element to two collectors and combines their results:

```java
record MinMax(int min, int max) { }
MinMax mm = Stream.of(5, 2, 9, 1).collect(Collectors.teeing(
        Collectors.minBy(Integer::compare),
        Collectors.maxBy(Integer::compare),
        (min, max) -> new MinMax(min.orElseThrow(), max.orElseThrow())));
// MinMax[min=1, max=9]
```

### Generation

#### Stream.empty and Stream.of

```java
Stream<String> empty = Stream.empty();
Stream<Integer> some = Stream.of(1, 2, 3);
Stream<String> maybeOne = Stream.ofNullable(possiblyNull);     // 0 or 1 element (Java 9)
```

#### range and rangeClosed

A sequence of integers in a range:

```java
IntStream.range(10, 13);          // 10, 11, 12 — the end is excluded
IntStream.rangeClosed(1, 5);      // 1, 2, 3, 4, 5
```

#### Repetition

```java
List<Integer> threes = Collections.nCopies(5, 3);                      // [3, 3, 3, 3, 3]
List<String> repeated = Stream.generate(() -> "x").limit(3).toList();  // [x, x, x]
```

#### iterate and generate

`iterate` builds a sequence from an initial value and a next-value function; with a stop condition — a finite one (Java 9). `generate` calls a supplier for each element. Without a condition both give **infinite** streams, which are limited with `limit` or `takeWhile`.

```java
List<Integer> evens = Stream.iterate(0, n -> n <= 10, n -> n + 2).toList();
// [0, 2, 4, 6, 8, 10]
List<Double> halves = Stream.iterate(0.0, x -> x + 0.5).limit(4).toList();
// [0.0, 0.5, 1.0, 1.5]
DoubleStream randoms = DoubleStream.generate(Math::random).limit(5);
```

## Good Practices

* The functions passed to stream operations should be **free of side effects** and must not modify the source. Collect results with collectors, not via `forEach(list::add)`.
* `forEach` is a terminal operation for "outward" actions (printing, writing); for transformations use `map`/`collect`.
* `peek` is meant for debugging, not for logic.
* Close streams over resources (`Files.lines`, `Files.walk`) with try-with-resources.
* Parallel streams (`parallelStream()`) make sense only for large amounts of data and expensive operations. More in the "Concurrency → Parallel Computing" chapter.
* Not everything has to be written as a stream: a simple loop is often clearer, especially with `break`, exceptions or changes to several variables.
