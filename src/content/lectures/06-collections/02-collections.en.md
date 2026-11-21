---
title: Collections
description: The Java Collections Framework — the interface hierarchy, Collection, List and ArrayList, Map and HashMap, key requirements, TreeMap and LinkedHashMap, Java 21 sequenced collections, Set and set operations, queues, stacks and PriorityQueue, read-only views and immutable collections, factory methods.
---

## The Java Collections Framework

The standard library's collections are concentrated in a few packages:

* **`java.util`** — the main interfaces and implementations: lists, sets, maps, queues, as well as the `Collections` and `Arrays` utility classes;
* **`java.util.concurrent`** — thread-safe collections (`ConcurrentHashMap`, `CopyOnWriteArrayList`, `BlockingQueue` …), covered in the "Synchronization" chapter.

All collections are **generic** and store only references: wrappers are used for numbers (`List<Integer>`). The `Vector`, `Stack` and `Hashtable` classes are a legacy of Java 1.0: they are synchronized and slow, and new code does not use them.

## The Collection Hierarchy

The basis of all collections is the `Iterable<T>` interface, which guarantees only the ability to traverse. `Collection<E>` extends it and describes a finite group of elements that can be modified. Further on, the hierarchy branches into lists, sets and queues. **Maps** (`Map<K, V>`) form a separate hierarchy: they are not collections of elements but map keys to values.

```text
Iterable<T>
└── Collection<E>
    ├── SequencedCollection<E>   (Java 21: a defined order, first and last elements)
    │   ├── List<E>              ordered, indexed, allows duplicates
    │   ├── Deque<E>             a double-ended queue
    │   └── SequencedSet<E>
    │       └── SortedSet<E> ── NavigableSet<E>
    ├── Set<E>                   no duplicates
    └── Queue<E>                 a queue
        └── Deque<E>

Map<K, V>
└── SequencedMap<K, V>           (Java 21)
    └── SortedMap<K, V> ── NavigableMap<K, V>
```

| Interface | Main implementations |
| --- | --- |
| `List` | `ArrayList`, `LinkedList`, `CopyOnWriteArrayList` |
| `Set` | `HashSet`, `LinkedHashSet`, `TreeSet`, `EnumSet` |
| `Queue` / `Deque` | `ArrayDeque`, `LinkedList`, `PriorityQueue` |
| `Map` | `HashMap`, `LinkedHashMap`, `TreeMap`, `EnumMap`, `ConcurrentHashMap` |

### The Collection Interface

`Collection<E>` describes the operations common to all collections: the number of elements, membership checks, adding, removing, bulk operations.

```java
public interface Collection<E> extends Iterable<E> {
    int size();
    boolean isEmpty();
    boolean contains(Object o);
    boolean add(E e);                                 // false if the collection did not change (a Set with a duplicate)
    boolean remove(Object o);
    boolean containsAll(Collection<?> c);
    boolean addAll(Collection<? extends E> c);
    boolean removeAll(Collection<?> c);
    boolean retainAll(Collection<?> c);
    boolean removeIf(Predicate<? super E> filter);    // Java 8
    void clear();
    Object[] toArray();
    <T> T[] toArray(T[] a);
    Stream<E> stream();                               // Java 8
}
```

Operations that modify a collection are **optional**: immutable collections throw `UnsupportedOperationException`.

> [!TIP]
> Declare variables, parameters and return types with **the interface type** (`List<String> names = new ArrayList<>()`), not the implementation. Then the implementation can be changed in one place, and a method taking a `Collection<String>` works with both a list and a set.

## Lists: List and ArrayList

`List<E>` adds **index-based access** to a collection: the elements have a defined order and can repeat.

```java
public interface List<E> extends SequencedCollection<E> {
    E get(int index);
    E set(int index, E element);
    void add(int index, E element);
    E remove(int index);
    int indexOf(Object o);
    int lastIndexOf(Object o);
    List<E> subList(int from, int to);               // a view, not a copy
    void sort(Comparator<? super E> c);
    ListIterator<E> listIterator();
    // ... plus the methods of Collection
}
```

The most common implementation is **`ArrayList`**: an array that grows automatically (by about 1.5 times), the counterpart of `std::vector` in C++.

```java
List<String> planets = new ArrayList<>(List.of("Mercury", "Earth", "Mars"));
System.out.println("Initial list:");
planets.forEach(p -> System.out.println("- " + p));

planets.add(1, "Venus");                                    // insertion at an index

List<String> gasGiants = List.of("Jupiter", "Saturn", "Uranus", "Neptune");
planets.addAll(gasGiants);

planets.remove(planets.size() - 1);                         // removing the last one (by index)

boolean hasMars = planets.contains("Mars");
System.out.println("\nIs Mars there? " + hasMars);

String sPlanet = planets.stream().filter(p -> p.startsWith("S")).findFirst().orElse(null);
System.out.println("The first planet starting with S: " + sPlanet);

int indexOfEarth = planets.indexOf("Earth");
System.out.println("Index of Earth: " + indexOfEarth);

planets.sort(null);                                         // natural order; or Collections.sort(planets)

System.out.println("\nSorted list:");
for (String planet : planets) {
    System.out.println("- " + planet);
}

planets.clear();
System.out.println("\nPlanets after clearing: " + planets.size());
```

**`LinkedList`** is a doubly linked list. Insertion and removal at an arbitrary place through a `ListIterator` cost O(1), but index access is O(n), and each node is a separate object. In practice `ArrayList` is almost always faster even for insertions in the middle, because shifting the array (`System.arraycopy`) is very efficient and cache-friendly.

> [!WARNING]
> `Arrays.asList(array)` returns a **fixed-size** list on top of the array: `set` works (and modifies the array), but `add` and `remove` throw `UnsupportedOperationException`. To get an ordinary mutable list, copy it: `new ArrayList<>(Arrays.asList(array))`.

## Maps: Map and HashMap

A **map** (dictionary) stores "key → value" pairs with **unique** keys. It gives access to views of the keys (`keySet()`), the values (`values()`) and the pairs (`entrySet()`).

```java
public interface Map<K, V> {
    V get(Object key);                              // null if the key is absent
    V put(K key, V value);                          // returns the previous value or null
    V remove(Object key);
    boolean containsKey(Object key);
    boolean containsValue(Object value);
    int size();
    Set<K> keySet();
    Collection<V> values();
    Set<Map.Entry<K, V>> entrySet();
    V getOrDefault(Object key, V defaultValue);     // Java 8: useful default methods
    V putIfAbsent(K key, V value);
    V merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> f);
    V computeIfAbsent(K key, Function<? super K, ? extends V> f);
    V compute(K key, BiFunction<? super K, ? super V, ? extends V> f);
    void forEach(BiConsumer<? super K, ? super V> action);
}
```

The most common implementation is **`HashMap`**, a hash table (the counterpart of `std::unordered_map`). The iteration order is undefined and may change after adding elements.

```java
Map<String, String> openWith = new HashMap<>();

openWith.put("txt", "notepad.exe");
openWith.put("bmp", "paint.exe");
openWith.put("dib", "paint.exe");
openWith.put("rtf", "wordpad.exe");

if (openWith.putIfAbsent("txt", "vim.exe") != null) {
    System.out.println("The key \"txt\" already exists");      // put would overwrite the value without asking
}

System.out.println("Value for rtf: " + openWith.get("rtf"));
openWith.put("rtf", "winword.exe");                           // update
openWith.put("doc", "winword.exe");                           // add

String tif = openWith.get("tif");                             // null: the key is absent
System.out.println(tif != null ? "tif: " + tif : "The key tif was not found");
System.out.println(openWith.getOrDefault("tif", "(no program)"));

openWith.putIfAbsent("ht", "hypertrm.exe");

System.out.println("\n--- Pairs ---");
for (Map.Entry<String, String> e : openWith.entrySet()) {
    System.out.println("Key: " + e.getKey() + ", value: " + e.getValue());
}
System.out.println("\n--- Values only ---");
for (String value : openWith.values()) System.out.println(value);
System.out.println("\n--- Keys only ---");
openWith.keySet().forEach(System.out::println);

if (openWith.remove("doc") != null) {
    System.out.println("\nThe key doc was removed");
}
```

> [!WARNING]
> `get` returns `null` both for an absent key and for a key mapped to `null` (`HashMap` allows `null` as a key and as a value). If the difference matters, use `containsKey`. Better yet, do not store `null` in maps at all.

### Typical Map Idioms

```java
Map<String, Integer> counts = new HashMap<>();
for (String word : "to be or not to be".split(" ")) {
    counts.merge(word, 1, Integer::sum);                     // a counter: {to=2, be=2, or=1, not=1}
}

Map<Character, List<String>> byLetter = new TreeMap<>();
for (String w : List.of("apple", "avocado", "banana")) {
    byLetter.computeIfAbsent(w.charAt(0), k -> new ArrayList<>()).add(w);   // grouping
}

counts.computeIfPresent("to", (k, v) -> v > 1 ? v - 1 : null);   // null removes the key
counts.replaceAll((k, v) -> v * 10);
counts.entrySet().removeIf(e -> e.getValue() < 15);              // modifying the map through a view
```

### Requirements for Keys

`HashMap` and `HashSet` rely on the key's `equals` and `hashCode` methods. For them to work correctly:

* **if two objects are equal according to `equals`, they must have the same `hashCode`** (the converse is not required: different objects may have the same hash);
* `equals` and `hashCode` are overridden **together** and based on **the same fields**;
* the key's hash **must not change** while the key is in the map: the fields it depends on must be immutable.

The simplest way is to make the key a record — it generates correct `equals` and `hashCode`:

```java
public record BookId(String isbn, String format) { }

Map<BookId, Integer> stock = new HashMap<>();
stock.put(new BookId("978-0134685991", "paper"), 12);
System.out.println(stock.get(new BookId("978-0134685991", "paper")));   // 12
```

The same implementation by hand:

```java
public final class BookId {
    private final String isbn;
    private final String format;

    public BookId(String isbn, String format) {
        this.isbn = Objects.requireNonNull(isbn);
        this.format = Objects.requireNonNull(format);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        return o instanceof BookId other && isbn.equals(other.isbn) && format.equals(other.format);
    }

    @Override
    public int hashCode() {
        return Objects.hash(isbn, format);
    }
}
```

### How HashMap Works

A `HashMap` is an array of **buckets**. The bucket index is computed from the key's `hashCode()`. If several keys land in the same bucket (a **collision**), they are stored as a list; when the list becomes too long (more than 8 elements), it is turned into a red-black tree. When the map is 75% full (the *load factor*), the array is doubled and all elements are redistributed. That is why lookup, insertion and removal cost O(1) on average.

### TreeMap and LinkedHashMap

* **`TreeMap`** keeps the pairs **sorted by key** (a red-black tree, the counterpart of `std::map`): operations cost O(log n). The keys must be `Comparable`, or a `Comparator` must be passed. The `NavigableMap` interface provides lookups of the nearest keys.
* **`LinkedHashMap`** is a hash table that also remembers the **insertion order** (or the access order — this is how an LRU cache is built).

```java
TreeMap<Integer, String> grades = new TreeMap<>(Map.of(50, "E", 60, "D", 70, "C", 80, "B", 90, "A"));
System.out.println(grades.floorEntry(77).getValue());   // C: the largest key <= 77
System.out.println(grades.ceilingKey(77));               // 80
System.out.println(grades.headMap(70));                  // {50=E, 60=D}: keys < 70
System.out.println(grades.descendingMap());              // {90=A, 80=B, 70=C, 60=D, 50=E}

Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {     // accessOrder = true
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > 3;                               // a cache of 3 elements
    }
};
```

### Sequenced Collections (Java 21)

The **`SequencedCollection`**, **`SequencedSet`** and **`SequencedMap`** interfaces (JEP 431) unified the collections with a defined order and gave them common methods for the first and last elements and a reversed view:

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
list.getFirst();           // 1
list.getLast();            // 3
list.addFirst(0);          // [0, 1, 2, 3]
list.reversed();           // [3, 2, 1, 0] — a view, not a copy

LinkedHashMap<String, Integer> steps = new LinkedHashMap<>();
steps.put("one", 1);
steps.put("two", 2);
steps.putFirst("zero", 0); // insertion at the beginning
steps.firstEntry();        // zero=0
steps.pollLastEntry();     // removes and returns two=2
```

## Sets: Set

`Set<E>` is a set in the mathematical sense: only **unique** elements, duplicates are ignored. `add` returns `true` if the element was added and `false` if it was already there. Set operations are expressed with the bulk methods of `Collection`:

| Operation | Method | Result for `a` |
| --- | --- | --- |
| union | `a.addAll(b)` | a ∪ b |
| intersection | `a.retainAll(b)` | a ∩ b |
| difference | `a.removeAll(b)` | a \ b |
| subset | `a.containsAll(b)` | b ⊆ a |
| overlapping | `!Collections.disjoint(a, b)` | a ∩ b ≠ ∅ |

```java
Set<String> java = new HashSet<>(Set.of("Ola", "Jan", "Ewa"));
Set<String> python = new HashSet<>(Set.of("Jan", "Piotr"));

Set<String> both = new HashSet<>(java);
both.retainAll(python);                       // [Jan]
Set<String> onlyJava = new HashSet<>(java);
onlyJava.removeAll(python);                   // [Ola, Ewa] (order not guaranteed)
Set<String> symmetric = new HashSet<>(java);
symmetric.addAll(python);
symmetric.removeAll(both);                    // the symmetric difference

System.out.println(java.add("Ola"));          // false: already there
```

Implementations:

* **`HashSet`** — a hash table (actually a wrapper over `HashMap`), O(1), the order is undefined;
* **`LinkedHashSet`** — keeps the insertion order;
* **`TreeSet`** — a sorted set (a red-black tree), O(log n), the `first`, `last`, `floor`, `ceiling`, `headSet`, `tailSet`, `subSet` methods;
* **`EnumSet`** — a bit vector for enum constants (the "Enumerations" page).

## Other Collections: Queues, Stacks, Heaps

| Class | Structure | Purpose |
| --- | --- | --- |
| `ArrayDeque<E>` | a ring buffer | a FIFO queue (`offer`/`poll`) and a LIFO stack (`push`/`pop`) |
| `LinkedList<E>` | a doubly linked list | also implements `Deque`, but is slower than `ArrayDeque` |
| `PriorityQueue<E>` | a binary heap | a priority queue: the **smallest** element comes out first |
| `BitSet` | an array of bits | a compact set of small non-negative numbers, 1 bit per value |

```java
Deque<String> queue = new ArrayDeque<>();     // FIFO
queue.offer("a"); queue.offer("b");
queue.poll();                                 // "a"
queue.peek();                                 // "b", without removing

Deque<Integer> stack = new ArrayDeque<>();    // LIFO, instead of the outdated Stack class
stack.push(1); stack.push(2);
stack.pop();                                  // 2
```

Queue methods come in pairs: some throw an exception when the queue is empty or full (`add`, `remove`, `element`), others return a special value (`offer` → `false`, `poll`/`peek` → `null`).

**`PriorityQueue`** is a **min-heap**: the smallest element by natural order or by the given comparator comes out first. The heap's iterator does **not** traverse the elements in priority order.

```java
record Task(String name, int priority) { }

PriorityQueue<Task> tasks = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
Task report = new Task("write the report", 2);
tasks.add(report);
tasks.add(new Task("fix the bug", 1));
tasks.add(new Task("drink coffee", 3));

// the report's priority changed: it cannot be changed "in place", so we remove it and add it again (O(n))
tasks.remove(report);
tasks.add(new Task("write the report", 0));

while (!tasks.isEmpty()) {
    Task t = tasks.poll();
    System.out.println(t.priority() + ": " + t.name());
}
// 0: write the report
// 1: fix the bug
// 3: drink coffee
```

### Operation Complexity

| Operation | `ArrayList` | `LinkedList` | `HashMap`/`HashSet` | `TreeMap`/`TreeSet` | `ArrayDeque` | `PriorityQueue` |
| --- | --- | --- | --- | --- | --- | --- |
| index access | O(1) | O(n) | — | — | — | — |
| add at the end | O(1)* | O(1) | O(1)* | O(log n) | O(1)* | O(log n) |
| add/remove at the beginning | O(n) | O(1) | — | — | O(1) | — |
| lookup `contains` | O(n) | O(n) | O(1)* | O(log n) | O(n) | O(n) |
| minimum | O(n) | O(n) | O(n) | O(log n) | — | O(1) |

The `*` mark means "amortized or on average".

## Read-Only Views and Immutable Collections

Java has no separate "read-only" interfaces: immutable collections implement the same `List`, `Set`, `Map`, and modifying operations throw `UnsupportedOperationException`. There are two fundamentally different kinds.

**Read-only views** (`Collections.unmodifiableList/Set/Map`) are a wrapper around an existing collection. It **does not copy** the elements, so changes to the original are visible through the view. Handy for exposing an internal collection without allowing it to be modified.

```java
Set<Integer> set = new HashSet<>(Set.of(1, 2));
Set<Integer> readOnly = Collections.unmodifiableSet(set);
// readOnly.add(3);                    // UnsupportedOperationException
set.add(3);
System.out.println(readOnly.size());   // 3: the change to the original is visible through the view
```

**Immutable copies** (`List.copyOf`, `Set.copyOf`, `Map.copyOf`, `stream.toList()`) do not depend on the source: nobody can change them. They are created once and can then be safely passed anywhere and shared between threads.

```java
List<String> source = new ArrayList<>(List.of("a", "b"));
List<String> snapshot = List.copyOf(source);
source.add("c");
System.out.println(snapshot);          // [a, b]
```

> [!TIP]
> The classic rule for a class that stores a collection: make a defensive copy in the constructor (`this.items = List.copyOf(items)`), and return that same copy from the getter (it is immutable) or `Collections.unmodifiableList(items)` if the internal list is mutable.

## Collection Factory Methods

Since Java 9, small immutable collections are created with factory methods. They do not allow `null`, and `Set.of` and `Map.of` throw `IllegalArgumentException` on duplicates.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);
Set<String> vowels = Set.of("a", "e", "i", "o", "u");
Map<String, Integer> cityPopulations = Map.of(
        "Tokyo", 37_000_000,
        "Delhi", 32_000_000);                                 // up to 10 pairs
Map<String, Integer> more = Map.ofEntries(
        Map.entry("Shanghai", 28_000_000),
        Map.entry("London", 9_000_000));                      // any number of pairs
List<String> empty = List.of();
```

The iteration order of `Set.of` and `Map.of` is deliberately undefined (it may change between runs). For mutable collections, wrap the factory in a constructor: `new ArrayList<>(List.of(...))`.

Combining collections:

```java
SortedSet<Integer> combined = new TreeSet<>(List.of(9, 10));
combined.addAll(numbers);
combined.addAll(List.of(4, 5, 6, 7, 8));
System.out.println(combined);       // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] — sorted, no duplicates

List<Integer> joined = Stream.of(List.of(1, 2), List.of(3), List.of(4, 5))
        .flatMap(List::stream)
        .toList();                  // [1, 2, 3, 4, 5]
```

## The Collections Utility Class

```java
Collections.sort(list);                         // or list.sort(comparator)
Collections.reverse(list);
Collections.shuffle(list, new Random(42));
Collections.swap(list, 0, 1);
Collections.max(list); Collections.min(list, comparator);
Collections.frequency(list, "x");
Collections.nCopies(3, "ab");                  // [ab, ab, ab]
Collections.emptyList(); Collections.singletonList(x);
Collections.binarySearch(sortedList, key);
Collections.synchronizedList(new ArrayList<>());   // a simple thread-safe wrapper
```
