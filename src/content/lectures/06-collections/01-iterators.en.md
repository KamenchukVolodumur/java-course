---
title: Iterators
description: The Iterator and Iterable interfaces, how the for-each loop is compiled, an iterator as a state machine, generators without yield, lazy composition of iterators, a custom Iterable collection, fail-fast and ConcurrentModificationException, ListIterator, Spliterator and conversion to Stream.
---

## Iterator

An **iterator** is an object that lets you traverse the elements of some sequence sequentially, in one direction, without knowing how it is organized internally (an array, a linked list, a tree, a file or an on-the-fly computation). The idea is close to C++ iterators, but with a simpler interface.

```java
public interface Iterator<E> {
    boolean hasNext();             // whether there are more elements
    E next();                      // the next element; if there are none — NoSuchElementException

    default void remove() {        // remove the last returned element (an optional operation)
        throw new UnsupportedOperationException("remove");
    }

    default void forEachRemaining(Consumer<? super E> action) {
        while (hasNext()) action.accept(next());
    }
}
```

The contract:

* `hasNext()` can be called any number of times: it does not change the state;
* `next()` returns the next element and moves the cursor; if there are no elements, it throws `NoSuchElementException`;
* `remove()` can be called only once after each `next()`; many iterators do not support it.

## Iterable

An **iterable** type is an object capable of creating a **new** iterator. For this it implements `java.lang.Iterable<T>`:

```java
public interface Iterable<T> {
    Iterator<T> iterator();

    default void forEach(Consumer<? super T> action) {
        for (T t : this) action.accept(t);
    }

    default Spliterator<T> spliterator() { ... }
}
```

The distinction matters: a **collection** (`Iterable`) can create many independent iterators, while each **iterator** is a one-shot cursor with its own state. Two nested loops over the same collection work because each gets its own iterator.

## The for-each Loop

All standard library collections implement `Iterable`, so they can be traversed with a for-each loop. Arrays can too, although they do not implement `Iterable` (for them the compiler generates an ordinary indexed loop).

```java
List<Integer> collection = List.of(1, 2, 3, 4, 5, 6, 7, 8);
for (int item : collection) {
    System.out.println(item);
}
```

The for-each loop is syntactic sugar. The compiler transforms it like this:

```java
for (Iterator<Integer> it = collection.iterator(); it.hasNext(); ) {
    int item = it.next();          // plus unboxing Integer -> int
    System.out.println(item);
}
```

That is why for-each works with **any** type implementing `Iterable`, including your own. Note that `String` is not `Iterable` (a string is traversed via `toCharArray()`, `chars()` or an index), and neither is `Map` (it is traversed via `entrySet()`, `keySet()` or `values()`).

## An Iterator as a State Machine

Let us implement an iterator that generates the first `count` Fibonacci numbers. Unlike languages with generators (the `yield` keyword), in Java an iterator is written **by hand**: the whole traversal state, i.e. the local variables of the "suspended" computation, is kept in fields, and each call of `next()` performs exactly one step.

```java
public final class Fibonacci implements Iterable<Long> {
    private final int count;

    public Fibonacci(int count) { this.count = count; }

    @Override
    public Iterator<Long> iterator() {
        return new Iterator<>() {
            private int i = 0;              // state: how many elements have been produced
            private long prev = 1, curr = 1;

            @Override
            public boolean hasNext() {
                return i < count;
            }

            @Override
            public Long next() {
                if (!hasNext()) throw new NoSuchElementException();
                long result = prev;
                long next = prev + curr;    // a computation step
                prev = curr;
                curr = next;
                i++;
                return result;
            }
        };
    }
}

for (long f : new Fibonacci(10)) {
    System.out.print(f + " ");              // 1 1 2 3 5 8 13 21 34 55
}
```

Creating the `Fibonacci` object itself computes nothing. The computation happens **lazily**: each next element is computed only when `next()` is called. That is why even an **infinite** sequence can be described: it is enough for `hasNext()` to always return `true`, and the caller stops the traversal.

```java
Iterator<Long> naturals = new Iterator<>() {
    private long n = 0;
    @Override public boolean hasNext() { return true; }      // an infinite sequence
    @Override public Long next() { return n++; }
};
```

If `hasNext()` needs to "look ahead" (e.g. an iterator filters elements and has to find the next matching one), the next element is computed in advance and stored in a field. This technique is shown in the next section.

## Generators without yield

Writing an iterator class by hand is verbose. For simple sequences there are shorter ways.

**`Stream.iterate` and `Stream.generate`** describe a sequence with a next-element function:

```java
Stream.iterate(new long[] {1, 1}, p -> new long[] {p[1], p[0] + p[1]})
      .limit(10)
      .map(p -> p[0])
      .forEach(f -> System.out.print(f + " "));          // 1 1 2 3 5 8 13 21 34 55

Stream.iterate(1, x -> x < 1000, x -> x * 2);            // with a stop condition (Java 9)
Iterator<Integer> powers = Stream.iterate(1, x -> x * 2).iterator();   // Stream -> Iterator
```

A **`Spliterator`** is often simpler to implement than an `Iterator`: the single method `tryAdvance` either produces the next element and returns `true`, or returns `false` when there are no more elements. No "looking ahead" is needed.

```java
static Stream<Long> fibonacci(int count) {
    return StreamSupport.stream(new Spliterators.AbstractSpliterator<Long>(count, Spliterator.ORDERED) {
        private int i = 0;
        private long prev = 1, curr = 1;

        @Override
        public boolean tryAdvance(Consumer<? super Long> action) {
            if (i >= count || i > 90) return false;          // "yield break": the end of the sequence
            action.accept(prev);                              // "yield return prev"
            long next = prev + curr;
            prev = curr;
            curr = next;
            i++;
            return true;
        }
    }, false);
}
```

## Lazy Composition of Iterators

Iterators can be **composed**: a wrapper iterator takes another iterator as its source and transforms the flow of its elements. Let us write a filter that lets only odd values through:

```java
static <T> Iterable<T> filter(Iterable<T> source, Predicate<? super T> condition) {
    return () -> new Iterator<T>() {                        // Iterable is a functional interface!
        private final Iterator<T> it = source.iterator();
        private T nextItem;
        private boolean ready;                              // whether the next element has been found already

        @Override
        public boolean hasNext() {
            while (!ready && it.hasNext()) {                // "looking ahead"
                T candidate = it.next();
                if (condition.test(candidate)) {
                    nextItem = candidate;
                    ready = true;
                }
            }
            return ready;
        }

        @Override
        public T next() {
            if (!hasNext()) throw new NoSuchElementException();
            ready = false;
            return nextItem;
        }
    };
}

Iterable<Long> odds = filter(new Fibonacci(10), x -> x % 2 == 1);
for (long x : odds) {
    System.out.print(x + " ");                              // 1 1 3 5 13 21 55
}
```

No iterator creates intermediate collections. Each call of the outer iterator's `next()` "pulls" exactly as many elements from the source as needed to find the next odd one:

```text
main                     filter(odds)                 Fibonacci
 │ hasNext()/next() ───►  │ it.next() ───────────────►  │ 1
 │                        │ ◄───────────────────────────│
 │ ◄──────────── 1 ───────│ (odd — hand it over)
 │ hasNext()/next() ───►  │ it.next() ───────────────►  │ 1
 │ ◄──────────── 1 ───────│ ◄───────────────────────────│
 │ hasNext()/next() ───►  │ it.next() ───────────────►  │ 2  (even — take the next one)
 │                        │ it.next() ───────────────►  │ 3
 │ ◄──────────── 3 ───────│ ◄───────────────────────────│
 │ ...
```

The Stream API works on the same principle (the "Stream API" page): `filter`, `map`, `limit` are lazy wrappers, and the computation is started only by the terminal operation.

## A Custom Iterable Collection

To be traversable in a for-each loop, a custom type implements `Iterable<T>`. The iterator is usually an **inner class**, because it needs access to the collection's fields.

```java
public class Stack<T> implements Iterable<T> {
    private T[] items;
    private int count;
    private int modCount;                     // a counter of structural changes (see fail-fast)

    @SuppressWarnings("unchecked")
    public Stack() { items = (T[]) new Object[8]; }

    public void push(T item) {
        if (items.length == count) items = Arrays.copyOf(items, count * 2);
        items[count++] = item;
        modCount++;
    }

    public T pop() {
        if (count == 0) throw new IllegalStateException("The stack is empty");
        T item = items[--count];
        items[count] = null;
        modCount++;
        return item;
    }

    public int size() { return count; }

    @Override
    public Iterator<T> iterator() {
        return new StackIterator();
    }

    private class StackIterator implements Iterator<T> {      // an inner class: sees items and count
        private int cursor = count;                            // traverse from the top
        private final int expectedModCount = modCount;

        @Override
        public boolean hasNext() { return cursor > 0; }

        @Override
        public T next() {
            if (modCount != expectedModCount) throw new ConcurrentModificationException();
            if (!hasNext()) throw new NoSuchElementException();
            return items[--cursor];
        }
    }
}
```

```java
Stack<String> stack = new Stack<>();
for (String w : "The quick brown fox jumps over the lazy dog".split(" ")) {
    stack.push(w);
}

for (String s : stack) {
    System.out.print(s + " ");                 // dog lazy the over jumps fox brown quick The
}
stack.forEach(System.out::println);            // a default method of Iterable
```

## Fail-Fast Iterators

The iterators of standard collections are **fail-fast**: if the collection is structurally modified (an element added or removed) **not through the iterator itself**, the next call of `next()` throws `ConcurrentModificationException`. This way the collection reports the error immediately instead of silently producing wrong data. The mechanism is the same as in `Stack` above: the `modCount` change counter.

```java
List<String> list = new ArrayList<>(List.of("a", "", "b", ""));

for (String s : list) {
    if (s.isEmpty()) list.remove(s);           // ConcurrentModificationException
}

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().isEmpty()) it.remove();      // correct: removal through the iterator
}

list.removeIf(String::isEmpty);                // best: a dedicated collection method
```

> [!NOTE]
> The name `ConcurrentModificationException` is historical: the exception means "the collection was modified during traversal", even if there is only one thread. Fail-fast is a "best effort" check, not a guarantee: in multithreaded code without synchronization the exception may not occur at all. For concurrent access there are collections from `java.util.concurrent` with "weakly consistent" iterators (chapter "Synchronization").

## ListIterator

Lists have an extended iterator, `ListIterator`, that moves **in both directions**, knows the index and allows replacing and inserting elements during traversal:

```java
List<String> names = new ArrayList<>(List.of("anna", "bob", "cid"));
ListIterator<String> li = names.listIterator();
while (li.hasNext()) {
    int index = li.nextIndex();
    String name = li.next();
    li.set(name.toUpperCase());                // replacing the current element
    if (index == 0) li.add("ADDED");           // inserting after the current one
}
System.out.println(names);                     // [ANNA, ADDED, BOB, CID]

while (li.hasPrevious()) {
    System.out.print(li.previous() + " ");     // CID BOB ADDED ANNA
}
```

## From Iterable to Stream

Any `Iterable` can be turned into a `Stream` to use all Stream API operations:

```java
Iterable<Long> fib = new Fibonacci(20);
long evenSum = StreamSupport.stream(fib.spliterator(), false)    // false = a sequential stream
        .filter(x -> x % 2 == 0)
        .mapToLong(Long::longValue)
        .sum();
```

A `Spliterator` (from "split" + "iterator") is an extended version of an iterator used by streams. Besides sequential traversal, it can **split** the sequence into parts for parallel processing (`trySplit`) and reports the characteristics of the data: `SIZED`, `ORDERED`, `SORTED`, `DISTINCT`, `IMMUTABLE`. The default implementation of `Iterable.spliterator()` is built on the iterator and splits poorly, so custom collections that should work well with parallel streams override this method.
