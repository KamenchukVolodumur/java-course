---
title: Ітератори
description: Інтерфейси Iterator та Iterable, як компілюється цикл for-each, ітератор як кінцевий автомат, генератори без yield, лінива композиція ітераторів, власна колекція з Iterable, fail-fast і ConcurrentModificationException, ListIterator, Spliterator і перетворення на Stream.
---

## Ітератор

**Ітератор** — об'єкт, що дозволяє послідовно, в одному напрямку, обійти елементи якоїсь послідовності, не знаючи, як вона влаштована всередині (масив, зв'язаний список, дерево, файл чи обчислення на льоту). Це ідея, близька до ітераторів C++, але з простішим інтерфейсом.

```java
public interface Iterator<E> {
    boolean hasNext();             // чи є ще елементи
    E next();                      // наступний елемент; якщо їх немає — NoSuchElementException

    default void remove() {        // видалити останній повернутий елемент (необов'язкова операція)
        throw new UnsupportedOperationException("remove");
    }

    default void forEachRemaining(Consumer<? super E> action) {
        while (hasNext()) action.accept(next());
    }
}
```

Контракт:

* `hasNext()` можна викликати скільки завгодно разів: він не змінює стану;
* `next()` повертає наступний елемент і переміщує курсор; якщо елементів немає, кидає `NoSuchElementException`;
* `remove()` можна викликати лише один раз після кожного `next()`; багато ітераторів його не підтримують.

## Iterable

**Ітерабельний** тип — об'єкт, здатний створити **новий** ітератор. Для цього він реалізує `java.lang.Iterable<T>`:

```java
public interface Iterable<T> {
    Iterator<T> iterator();

    default void forEach(Consumer<? super T> action) {
        for (T t : this) action.accept(t);
    }

    default Spliterator<T> spliterator() { ... }
}
```

Розмежування важливе: **колекція** (`Iterable`) може створювати багато незалежних ітераторів, а кожен **ітератор** — одноразовий курсор зі своїм станом. Два вкладені цикли по тій самій колекції працюють, бо кожен отримує свій ітератор.

## Цикл for-each

Усі колекції стандартної бібліотеки реалізують `Iterable`, тож їх можна обходити циклом for-each. Масиви теж можна, хоча вони не реалізують `Iterable` (для них компілятор генерує звичайний цикл з індексом).

```java
List<Integer> collection = List.of(1, 2, 3, 4, 5, 6, 7, 8);
for (int item : collection) {
    System.out.println(item);
}
```

Цикл for-each — синтаксичний цукор. Компілятор перетворює його так:

```java
for (Iterator<Integer> it = collection.iterator(); it.hasNext(); ) {
    int item = it.next();          // плюс розпакування Integer -> int
    System.out.println(item);
}
```

Тому for-each працює з **будь-яким** типом, що реалізує `Iterable`, зокрема з вашими власними. Зверніть увагу: `String` не є `Iterable` (рядок обходять через `toCharArray()`, `chars()` або індексом), а `Map` — теж ні (обходять `entrySet()`, `keySet()` чи `values()`).

## Ітератор як кінцевий автомат

Реалізуємо ітератор, що генерує перші `count` чисел Фібоначчі. На відміну від мов з генераторами (ключове слово `yield`), у Java ітератор пишуть **вручну**: увесь стан обходу, тобто локальні змінні «призупиненого» обчислення, зберігають у полях, а кожен виклик `next()` робить рівно один крок.

```java
public final class Fibonacci implements Iterable<Long> {
    private final int count;

    public Fibonacci(int count) { this.count = count; }

    @Override
    public Iterator<Long> iterator() {
        return new Iterator<>() {
            private int i = 0;              // стан: скільки елементів видано
            private long prev = 1, curr = 1;

            @Override
            public boolean hasNext() {
                return i < count;
            }

            @Override
            public Long next() {
                if (!hasNext()) throw new NoSuchElementException();
                long result = prev;
                long next = prev + curr;    // крок обчислення
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

Саме створення об'єкта `Fibonacci` нічого не обчислює. Обчислення відбувається **ліниво**: кожен наступний елемент рахується лише тоді, коли викликають `next()`. Тому можна описати навіть **нескінченну** послідовність: досить, щоб `hasNext()` завжди повертав `true`, а обхід зупинить викликач.

```java
Iterator<Long> naturals = new Iterator<>() {
    private long n = 0;
    @Override public boolean hasNext() { return true; }      // нескінченна послідовність
    @Override public Long next() { return n++; }
};
```

Якщо `hasNext()` вимагає «заглянути вперед» (наприклад, ітератор фільтрує елементи і має знайти наступний підхожий), наступний елемент обчислюють заздалегідь і зберігають у полі. Цей прийом показано в наступному розділі.

## Генератори без yield

Писати клас-ітератор вручну багатослівно. Для простих послідовностей є коротші способи.

**`Stream.iterate` і `Stream.generate`** описують послідовність функцією наступного елемента:

```java
Stream.iterate(new long[] {1, 1}, p -> new long[] {p[1], p[0] + p[1]})
      .limit(10)
      .map(p -> p[0])
      .forEach(f -> System.out.print(f + " "));          // 1 1 2 3 5 8 13 21 34 55

Stream.iterate(1, x -> x < 1000, x -> x * 2);            // з умовою зупинки (Java 9)
Iterator<Integer> powers = Stream.iterate(1, x -> x * 2).iterator();   // Stream -> Iterator
```

**`Spliterator`** часто простіше реалізувати, ніж `Iterator`: один метод `tryAdvance` або видає наступний елемент і повертає `true`, або повертає `false`, коли елементів більше немає. «Заглядати вперед» не потрібно.

```java
static Stream<Long> fibonacci(int count) {
    return StreamSupport.stream(new Spliterators.AbstractSpliterator<Long>(count, Spliterator.ORDERED) {
        private int i = 0;
        private long prev = 1, curr = 1;

        @Override
        public boolean tryAdvance(Consumer<? super Long> action) {
            if (i >= count || i > 90) return false;          // «yield break»: кінець послідовності
            action.accept(prev);                              // «yield return prev»
            long next = prev + curr;
            prev = curr;
            curr = next;
            i++;
            return true;
        }
    }, false);
}
```

## Лінива композиція ітераторів

Ітератори можна **компонувати**: ітератор-обгортка бере інший ітератор як джерело й перетворює потік його елементів. Напишемо фільтр, що пропускає лише непарні значення:

```java
static <T> Iterable<T> filter(Iterable<T> source, Predicate<? super T> condition) {
    return () -> new Iterator<T>() {                        // Iterable — функціональний інтерфейс!
        private final Iterator<T> it = source.iterator();
        private T nextItem;
        private boolean ready;                              // чи знайдено вже наступний елемент

        @Override
        public boolean hasNext() {
            while (!ready && it.hasNext()) {                // «заглядаємо вперед»
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

Жоден ітератор не створює проміжних колекцій. Кожен виклик `next()` зовнішнього ітератора «протягує» рівно стільки елементів з джерела, скільки потрібно, щоб знайти наступний непарний:

```text
main                     filter(odds)                 Fibonacci
 │ hasNext()/next() ───►  │ it.next() ───────────────►  │ 1
 │                        │ ◄───────────────────────────│
 │ ◄──────────── 1 ───────│ (непарне — віддаємо)
 │ hasNext()/next() ───►  │ it.next() ───────────────►  │ 1
 │ ◄──────────── 1 ───────│ ◄───────────────────────────│
 │ hasNext()/next() ───►  │ it.next() ───────────────►  │ 2  (парне — беремо наступне)
 │                        │ it.next() ───────────────►  │ 3
 │ ◄──────────── 3 ───────│ ◄───────────────────────────│
 │ ...
```

За тим самим принципом працює Stream API (сторінка «Stream API»): `filter`, `map`, `limit` — це ліниві обгортки, а обчислення запускає лише кінцева операція.

## Власна ітерабельна колекція

Щоб власний тип можна було обходити в for-each, він реалізує `Iterable<T>`. Ітератор зазвичай роблять **внутрішнім класом**, бо йому потрібен доступ до полів колекції.

```java
public class Stack<T> implements Iterable<T> {
    private T[] items;
    private int count;
    private int modCount;                     // лічильник структурних змін (див. fail-fast)

    @SuppressWarnings("unchecked")
    public Stack() { items = (T[]) new Object[8]; }

    public void push(T item) {
        if (items.length == count) items = Arrays.copyOf(items, count * 2);
        items[count++] = item;
        modCount++;
    }

    public T pop() {
        if (count == 0) throw new IllegalStateException("Стек порожній");
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

    private class StackIterator implements Iterator<T> {      // внутрішній клас: бачить items і count
        private int cursor = count;                            // обходимо від вершини
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
stack.forEach(System.out::println);            // default-метод Iterable
```

## Fail-fast ітератори

Ітератори стандартних колекцій — **fail-fast**: якщо колекцію структурно змінено (додано чи видалено елемент) **не через сам ітератор**, наступний виклик `next()` кидає `ConcurrentModificationException`. Так колекція повідомляє про помилку одразу, замість того щоб тихо видати неправильні дані. Механізм той самий, що й у `Stack` вище: лічильник змін `modCount`.

```java
List<String> list = new ArrayList<>(List.of("a", "", "b", ""));

for (String s : list) {
    if (s.isEmpty()) list.remove(s);           // ConcurrentModificationException
}

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().isEmpty()) it.remove();      // правильно: видалення через ітератор
}

list.removeIf(String::isEmpty);                // найкраще: спеціальний метод колекції
```

> [!NOTE]
> Назва `ConcurrentModificationException` історична: виняток означає «колекцію змінено під час обходу», навіть якщо потік лише один. Fail-fast — це перевірка «за найкращих зусиль», а не гарантія: у багатопотоковому коді без синхронізації виняток може і не виникнути. Для конкурентного доступу є колекції з `java.util.concurrent` зі «слабко узгодженими» ітераторами (розділ «Синхронізація»).

## ListIterator

Списки мають розширений ітератор `ListIterator`, що рухається **в обидва боки**, знає індекс і дозволяє замінювати та вставляти елементи під час обходу:

```java
List<String> names = new ArrayList<>(List.of("anna", "bob", "cid"));
ListIterator<String> li = names.listIterator();
while (li.hasNext()) {
    int index = li.nextIndex();
    String name = li.next();
    li.set(name.toUpperCase());                // заміна поточного елемента
    if (index == 0) li.add("ADDED");           // вставка після поточного
}
System.out.println(names);                     // [ANNA, ADDED, BOB, CID]

while (li.hasPrevious()) {
    System.out.print(li.previous() + " ");     // CID BOB ADDED ANNA
}
```

## Від Iterable до Stream

Будь-який `Iterable` можна перетворити на `Stream` і скористатися всіма операціями Stream API:

```java
Iterable<Long> fib = new Fibonacci(20);
long evenSum = StreamSupport.stream(fib.spliterator(), false)    // false = послідовний потік
        .filter(x -> x % 2 == 0)
        .mapToLong(Long::longValue)
        .sum();
```

`Spliterator` (від «split» + «iterator») — розширена версія ітератора, яку використовують потоки. Окрім послідовного обходу, вона вміє **ділити** послідовність на частини для паралельної обробки (`trySplit`) і повідомляє характеристики даних: `SIZED`, `ORDERED`, `SORTED`, `DISTINCT`, `IMMUTABLE`. Стандартна реалізація `Iterable.spliterator()` будується на основі ітератора і погано ділиться, тож власні колекції, які мають добре працювати з паралельними потоками, перевизначають цей метод.
