---
title: Lab 04: Generics, Iterators and Collections
description: A custom generic ring buffer with a fail-fast iterator, generic methods with bounds and wildcards (PECS), a MultiMap based on Map<K, List<V>>, an LRU cache on LinkedHashMap and a word frequency index.
---

## Before You Start

> [!NOTE]
> **Lectures:** 04.8 "Generics", 06.1 "Iterators", 06.2 "Collections" · **Time:** 3 h · **Points:** 10

```text
src/main/java/pl/mini/collections/
├── RingBuffer.java
├── CollectionUtils.java
├── MultiMap.java
├── LruCache.java
├── WordIndex.java
└── Main.java      (given)
```

### Rules

* Uncomment the `STAGE N` blocks in `Main.java` one by one. The output must match the expected one.
* The code compiles **without** unchecked/raw type **warnings**, except for one place marked with `@SuppressWarnings("unchecked")` (creating the array in `RingBuffer`).

> [!CAUTION]
> Forbidden: raw types (`List` without a parameter), the Stream API (its turn comes in lab 05), `Collections.max`/`Collections.addAll` in the corresponding `CollectionUtils` methods (implement them yourself).

## A Quick Theory Recap

### A Generic Class and a T[] Array

```java
public class Stack<T> {
    private T[] items;

    @SuppressWarnings("unchecked")
    public Stack(int capacity) {
        items = (T[]) new Object[capacity];     // new T[n] is impossible because of type erasure
    }
}
```

### A Custom Iterator (Java Has No yield return)

```java
@Override
public Iterator<T> iterator() {
    return new Iterator<>() {
        private int cursor = 0;
        @Override public boolean hasNext() { return cursor < size; }
        @Override public T next() {
            if (!hasNext()) throw new NoSuchElementException();
            return items[cursor++];
        }
    };
}
```

### Fail-Fast: a Modification Counter

```java
private int modCount;                   // incremented on every structural change

// in the iterator:
private final int expectedModCount = modCount;
private void checkForComodification() {
    if (modCount != expectedModCount) throw new ConcurrentModificationException();
}
```

This is exactly how `ArrayList` and `HashMap` work.

### PECS

```java
static <T> void copy(Iterable<? extends T> src, Collection<? super T> dst)   // we read from src, write to dst
static <T extends Comparable<? super T>> T max(Iterable<? extends T> items)  // Comparable may be declared in a superclass
```

### Map: computeIfAbsent and merge

```java
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
counts.merge(word, 1, Integer::sum);
```

### LinkedHashMap as an LRU Cache

```java
new LinkedHashMap<K, V>(16, 0.75f, true) {          // accessOrder = true: get moves the entry to the end
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;                    // after a put, remove the eldest
    }
};
```

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
2 false
3 true b
b c d
OK: null
[b, c, d]
OK: CME
[c, d, e]
OK: remove
9
banana
[3, 9, 2, c, d, e]
[3, 9]
6.5
OK: empty
[1, 3] [] 3
[a] 1
OK: read-only
[x, z]
[be=2, to=2]
[1, 2] []
```

## Stage 1: RingBuffer<T> (2 pts)

A fixed-capacity ring buffer: when it is full, a new element **overwrites the oldest one**. Uses: the last N events, a sliding window of measurements.

```java
public class RingBuffer<T> implements Iterable<T> {
    public RingBuffer(int capacity);   // capacity <= 0 -> IllegalArgumentException
    public void add(T item);           // null -> NullPointerException
    public T get(int index);           // 0 is the oldest; outside [0, size) -> IndexOutOfBoundsException
    public int size();
    public int capacity();
    public boolean isFull();
    public Iterator<T> iterator();     // from the oldest to the newest
}
```

* Storage: a `T[]` array, the head index `head` (the oldest) and `size`. The physical index of the i-th element: `(head + i) % capacity`.
* `add` runs in **O(1)**: no shifting of the array.

> [!TIP]
> Draw an array of 3 cells on paper and go through `add("a")` … `add("d")`, writing down `head` and `size` after each step.

## Stage 2: A Fail-Fast Iterator and toString (2 pts)

1. Add a `modCount` field and increment it in every `add`.
2. The iterator remembers `modCount` when it is created. If the value differs in `next()` → `ConcurrentModificationException`.
3. `iterator().remove()` is not supported (the default behavior is `UnsupportedOperationException`).
4. `next()` after the end → `NoSuchElementException`.
5. `toString()` in the `[b, c, d]` format (an empty buffer — `[]`). Use `StringJoiner(", ", "[", "]")`.

> [!NOTE]
> Why a `ConcurrentModificationException`, if there is only one thread? The name is historical: the exception means "the collection was modified during traversal", not "a race between threads". In our example `add("e")` moves `head`, and the iterator would otherwise silently return the wrong elements.

## Stage 3: Generic Methods and PECS (2 pts)

The `CollectionUtils` class (final, a private constructor):

```java
public static <T extends Comparable<? super T>> T max(Iterable<? extends T> items);
public static <T> T max(Iterable<? extends T> items, Comparator<? super T> cmp);
public static <T> void copyInto(Iterable<? extends T> src, Collection<? super T> dst);
public static <T> List<T> filter(Iterable<? extends T> src, Predicate<? super T> p);
public static double sum(Iterable<? extends Number> numbers);
```

* `max` for an empty collection → `NoSuchElementException`. For equal values the **first** one is returned.
* `filter` returns a **new** `ArrayList`; the input is not modified.
* `sum` uses `Number.doubleValue()`.

Try to explain to yourself (or to the instructor) why:

* `copyInto(List<Integer>, List<Object>)` compiles, but with the signature `copyInto(Iterable<T>, Collection<T>)` it does not;
* `max` has `Comparable<? super T>`: with `Comparable<T>` it would be impossible to find the maximum in a `List<java.sql.Timestamp>`, because `Timestamp` implements `Comparable<Date>`.

## Stage 4: MultiMap<K, V> (2 pts)

A map in which one key corresponds to a **list** of values (like `Multimap` in Guava).

```java
public class MultiMap<K, V> {
    public void put(K key, V value);
    public List<V> get(K key);            // an unmodifiable VIEW; an empty list for an absent key
    public boolean remove(K key, V value);// removes one occurrence; the last value -> the key disappears too
    public Set<K> keys();                 // in the order of first insertion
    public int size();                    // the total number of values
}
```

* Inside — `Map<K, List<V>> map = new LinkedHashMap<>()`.
* `put` — in one line with `computeIfAbsent`.
* `get` returns `Collections.unmodifiableList(...)` or `List.of()`, and **never** `null`.
* `size()` must run in **O(1)**: maintain a separate counter.

> [!WARNING]
> If `remove` does not clean up empty lists, `keys()` will return "dead" keys, and the map will gradually grow. The invariant: **there are no empty lists in the map**.

## Stage 5: An LRU Cache and a Frequency Index (2 pts)

### LruCache<K, V>

```java
public class LruCache<K, V> extends LinkedHashMap<K, V> {
    public LruCache(int capacity);   // capacity <= 0 -> IllegalArgumentException
}
```

Use the `LinkedHashMap(int, float, boolean accessOrder)` constructor and override `removeEldestEntry`.

### WordIndex

```java
public class WordIndex {
    public WordIndex(String text);
    public List<Map.Entry<String, Integer>> top(int n);   // the n most frequent words
    public List<Integer> linesOf(String word);              // line numbers (from 1), ascending, without repeats
}
```

* Words are sequences of letters (`text.split("[^\\p{L}]+")`), case-insensitive.
* Frequencies: a `Map<String, Integer>` + `merge`.
* Lines: a `Map<String, TreeSet<Integer>>` (or your `MultiMap` with a duplicate check).
* `top`: sorting by descending frequency, alphabetically for equal frequencies. Sort `new ArrayList<>(counts.entrySet())` with a comparator composed of `Map.Entry.comparingByValue(...)` and `thenComparing(Map.Entry.comparingByKey())`.

Commit, tag it `lab04` and push.
