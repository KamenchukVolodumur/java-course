---
title: Колекції
description: Java Collections Framework — ієрархія інтерфейсів, Collection, List і ArrayList, Map і HashMap, вимоги до ключів, TreeMap і LinkedHashMap, впорядковані колекції Java 21, Set і операції над множинами, черги, стеки й PriorityQueue, представлення лише для читання та незмінні колекції, фабричні методи.
---

## Java Collections Framework

Колекції стандартної бібліотеки зосереджені в кількох пакетах:

* **`java.util`** — основні інтерфейси й реалізації: списки, множини, мапи, черги, а також утилітні класи `Collections` і `Arrays`;
* **`java.util.concurrent`** — потокобезпечні колекції (`ConcurrentHashMap`, `CopyOnWriteArrayList`, `BlockingQueue` …), розглянуті в розділі «Синхронізація».

Усі колекції **узагальнені** й зберігають лише посилання: для чисел використовують обгортки (`List<Integer>`). Класи `Vector`, `Stack` і `Hashtable` — це спадок Java 1.0: вони синхронізовані й повільні, у новому коді їх не використовують.

## Ієрархія колекцій

Основа всіх колекцій — інтерфейс `Iterable<T>`, який гарантує лише можливість обходу. `Collection<E>` розширює його й описує скінченну групу елементів, яку можна змінювати. Далі ієрархія розгалужується на списки, множини й черги. **Мапи** (`Map<K, V>`) — окрема ієрархія: вони не є колекціями елементів, а відображають ключі на значення.

```text
Iterable<T>
└── Collection<E>
    ├── SequencedCollection<E>   (Java 21: визначений порядок, перший і останній елементи)
    │   ├── List<E>              впорядкований, з індексами, допускає дублікати
    │   ├── Deque<E>             двобічна черга
    │   └── SequencedSet<E>
    │       └── SortedSet<E> ── NavigableSet<E>
    ├── Set<E>                   без дублікатів
    └── Queue<E>                 черга
        └── Deque<E>

Map<K, V>
└── SequencedMap<K, V>           (Java 21)
    └── SortedMap<K, V> ── NavigableMap<K, V>
```

| Інтерфейс | Основні реалізації |
| --- | --- |
| `List` | `ArrayList`, `LinkedList`, `CopyOnWriteArrayList` |
| `Set` | `HashSet`, `LinkedHashSet`, `TreeSet`, `EnumSet` |
| `Queue` / `Deque` | `ArrayDeque`, `LinkedList`, `PriorityQueue` |
| `Map` | `HashMap`, `LinkedHashMap`, `TreeMap`, `EnumMap`, `ConcurrentHashMap` |

### Інтерфейс Collection

`Collection<E>` описує операції, спільні для всіх колекцій: кількість елементів, перевірку наявності, додавання, видалення, масові операції.

```java
public interface Collection<E> extends Iterable<E> {
    int size();
    boolean isEmpty();
    boolean contains(Object o);
    boolean add(E e);                                 // false, якщо колекція не змінилася (Set з дублікатом)
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

Операції, що змінюють колекцію, **необов'язкові**: незмінні колекції кидають `UnsupportedOperationException`.

> [!TIP]
> Оголошуйте змінні, параметри й типи результату **типом інтерфейсу** (`List<String> names = new ArrayList<>()`), а не реалізації. Тоді реалізацію можна змінити в одному місці, а метод, що приймає `Collection<String>`, працює і зі списком, і з множиною.

## Списки: List і ArrayList

`List<E>` додає до колекції **доступ за індексом**: елементи мають визначений порядок і можуть повторюватися.

```java
public interface List<E> extends SequencedCollection<E> {
    E get(int index);
    E set(int index, E element);
    void add(int index, E element);
    E remove(int index);
    int indexOf(Object o);
    int lastIndexOf(Object o);
    List<E> subList(int from, int to);               // представлення, а не копія
    void sort(Comparator<? super E> c);
    ListIterator<E> listIterator();
    // ... плюс методи Collection
}
```

Найпоширеніша реалізація — **`ArrayList`**: масив, що автоматично розширюється (приблизно в 1,5 раза), аналог `std::vector` з C++.

```java
List<String> planets = new ArrayList<>(List.of("Mercury", "Earth", "Mars"));
System.out.println("Початковий список:");
planets.forEach(p -> System.out.println("- " + p));

planets.add(1, "Venus");                                    // вставка за індексом

List<String> gasGiants = List.of("Jupiter", "Saturn", "Uranus", "Neptune");
planets.addAll(gasGiants);

planets.remove(planets.size() - 1);                         // видалення останнього (за індексом)

boolean hasMars = planets.contains("Mars");
System.out.println("\nЧи є Марс? " + hasMars);

String sPlanet = planets.stream().filter(p -> p.startsWith("S")).findFirst().orElse(null);
System.out.println("Перша планета на S: " + sPlanet);

int indexOfEarth = planets.indexOf("Earth");
System.out.println("Індекс Землі: " + indexOfEarth);

planets.sort(null);                                         // природний порядок; або Collections.sort(planets)

System.out.println("\nВідсортований список:");
for (String planet : planets) {
    System.out.println("- " + planet);
}

planets.clear();
System.out.println("\nПланет після очищення: " + planets.size());
```

**`LinkedList`** — двобічно зв'язаний список. Вставка й видалення в довільному місці через `ListIterator` коштують O(1), але доступ за індексом — O(n), а кожен вузол — окремий об'єкт. На практиці `ArrayList` майже завжди швидший навіть для вставок у середину, бо зсув масиву (`System.arraycopy`) дуже ефективний і дружній до кешу процесора.

> [!WARNING]
> `Arrays.asList(array)` повертає список **фіксованого розміру** поверх масиву: `set` працює (і змінює масив), але `add` і `remove` кидають `UnsupportedOperationException`. Щоб отримати звичайний змінюваний список, скопіюйте: `new ArrayList<>(Arrays.asList(array))`.

## Мапи: Map і HashMap

**Мапа** (словник) зберігає пари «ключ → значення» з **унікальними** ключами. Вона дає доступ до представлень ключів (`keySet()`), значень (`values()`) і пар (`entrySet()`).

```java
public interface Map<K, V> {
    V get(Object key);                              // null, якщо ключа немає
    V put(K key, V value);                          // повертає попереднє значення або null
    V remove(Object key);
    boolean containsKey(Object key);
    boolean containsValue(Object value);
    int size();
    Set<K> keySet();
    Collection<V> values();
    Set<Map.Entry<K, V>> entrySet();
    V getOrDefault(Object key, V defaultValue);     // Java 8: корисні default-методи
    V putIfAbsent(K key, V value);
    V merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> f);
    V computeIfAbsent(K key, Function<? super K, ? extends V> f);
    V compute(K key, BiFunction<? super K, ? super V, ? extends V> f);
    void forEach(BiConsumer<? super K, ? super V> action);
}
```

Найчастіша реалізація — **`HashMap`**, хеш-таблиця (аналог `std::unordered_map`). Порядок обходу не визначено і може змінитися після додавання елементів.

```java
Map<String, String> openWith = new HashMap<>();

openWith.put("txt", "notepad.exe");
openWith.put("bmp", "paint.exe");
openWith.put("dib", "paint.exe");
openWith.put("rtf", "wordpad.exe");

if (openWith.putIfAbsent("txt", "vim.exe") != null) {
    System.out.println("Ключ \"txt\" уже існує");             // put перезаписав би значення без питань
}

System.out.println("Значення для rtf: " + openWith.get("rtf"));
openWith.put("rtf", "winword.exe");                           // оновлення
openWith.put("doc", "winword.exe");                           // додавання

String tif = openWith.get("tif");                             // null: ключа немає
System.out.println(tif != null ? "tif: " + tif : "Ключ tif не знайдено");
System.out.println(openWith.getOrDefault("tif", "(немає програми)"));

openWith.putIfAbsent("ht", "hypertrm.exe");

System.out.println("\n--- Пари ---");
for (Map.Entry<String, String> e : openWith.entrySet()) {
    System.out.println("Ключ: " + e.getKey() + ", значення: " + e.getValue());
}
System.out.println("\n--- Лише значення ---");
for (String value : openWith.values()) System.out.println(value);
System.out.println("\n--- Лише ключі ---");
openWith.keySet().forEach(System.out::println);

if (openWith.remove("doc") != null) {
    System.out.println("\nКлюч doc видалено");
}
```

> [!WARNING]
> `get` повертає `null` і для відсутнього ключа, і для ключа, якому відповідає `null` (`HashMap` допускає `null` як ключ і як значення). Якщо різниця важлива, використовуйте `containsKey`. А краще взагалі не зберігати `null` у мапах.

### Типові ідіоми з Map

```java
Map<String, Integer> counts = new HashMap<>();
for (String word : "to be or not to be".split(" ")) {
    counts.merge(word, 1, Integer::sum);                     // лічильник: {to=2, be=2, or=1, not=1}
}

Map<Character, List<String>> byLetter = new TreeMap<>();
for (String w : List.of("apple", "avocado", "banana")) {
    byLetter.computeIfAbsent(w.charAt(0), k -> new ArrayList<>()).add(w);   // групування
}

counts.computeIfPresent("to", (k, v) -> v > 1 ? v - 1 : null);   // null видаляє ключ
counts.replaceAll((k, v) -> v * 10);
counts.entrySet().removeIf(e -> e.getValue() < 15);              // зміна мапи через представлення
```

### Вимоги до ключів

`HashMap` і `HashSet` спираються на методи `equals` і `hashCode` ключа. Щоб вони працювали правильно:

* **якщо два об'єкти рівні за `equals`, вони мусять мати однаковий `hashCode`** (зворотне не обов'язкове: різні об'єкти можуть мати однаковий хеш);
* `equals` і `hashCode` перевизначають **разом** і будують на **тих самих полях**;
* хеш ключа **не повинен змінюватися**, поки ключ лежить у мапі: поля, від яких він залежить, мають бути незмінними.

Найпростіше зробити ключ record — він генерує правильні `equals` і `hashCode`:

```java
public record BookId(String isbn, String format) { }

Map<BookId, Integer> stock = new HashMap<>();
stock.put(new BookId("978-0134685991", "paper"), 12);
System.out.println(stock.get(new BookId("978-0134685991", "paper")));   // 12
```

Та сама реалізація вручну:

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

### Як працює HashMap

`HashMap` — масив **кошиків** (buckets). Індекс кошика обчислюється з `hashCode()` ключа. Якщо кілька ключів потрапили в той самий кошик (**колізія**), вони зберігаються списком; коли список задовгий (понад 8 елементів), він перетворюється на червоно-чорне дерево. Коли мапа заповнена на 75% (*load factor*), масив подвоюється, і всі елементи перерозподіляються. Тому пошук, вставка й видалення в середньому коштують O(1).

### TreeMap і LinkedHashMap

* **`TreeMap`** зберігає пари **відсортованими за ключами** (червоно-чорне дерево, аналог `std::map`): операції коштують O(log n). Ключі мають бути `Comparable` або треба передати `Comparator`. Інтерфейс `NavigableMap` дає пошук найближчих ключів.
* **`LinkedHashMap`** — хеш-таблиця, що додатково пам'ятає **порядок вставки** (або порядок звертання — так будують LRU-кеш).

```java
TreeMap<Integer, String> grades = new TreeMap<>(Map.of(50, "E", 60, "D", 70, "C", 80, "B", 90, "A"));
System.out.println(grades.floorEntry(77).getValue());   // C: найбільший ключ <= 77
System.out.println(grades.ceilingKey(77));               // 80
System.out.println(grades.headMap(70));                  // {50=E, 60=D}: ключі < 70
System.out.println(grades.descendingMap());              // {90=A, 80=B, 70=C, 60=D, 50=E}

Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {     // accessOrder = true
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > 3;                               // кеш на 3 елементи
    }
};
```

### Впорядковані колекції (Java 21)

Інтерфейси **`SequencedCollection`**, **`SequencedSet`** і **`SequencedMap`** (JEP 431) об'єднали колекції з визначеним порядком і дали їм спільні методи для першого й останнього елемента та оберненого представлення:

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
list.getFirst();           // 1
list.getLast();            // 3
list.addFirst(0);          // [0, 1, 2, 3]
list.reversed();           // [3, 2, 1, 0] — представлення, не копія

LinkedHashMap<String, Integer> steps = new LinkedHashMap<>();
steps.put("one", 1);
steps.put("two", 2);
steps.putFirst("zero", 0); // вставка на початок
steps.firstEntry();        // zero=0
steps.pollLastEntry();     // видаляє й повертає two=2
```

## Множини: Set

`Set<E>` — множина в математичному сенсі: лише **унікальні** елементи, дублікати ігноруються. `add` повертає `true`, якщо елемент додано, і `false`, якщо такий уже був. Операції над множинами виражаються масовими методами `Collection`:

| Операція | Метод | Результат для `a` |
| --- | --- | --- |
| об'єднання | `a.addAll(b)` | a ∪ b |
| перетин | `a.retainAll(b)` | a ∩ b |
| різниця | `a.removeAll(b)` | a \ b |
| підмножина | `a.containsAll(b)` | b ⊆ a |
| перетинаються | `!Collections.disjoint(a, b)` | a ∩ b ≠ ∅ |

```java
Set<String> java = new HashSet<>(Set.of("Ola", "Jan", "Ewa"));
Set<String> python = new HashSet<>(Set.of("Jan", "Piotr"));

Set<String> both = new HashSet<>(java);
both.retainAll(python);                       // [Jan]
Set<String> onlyJava = new HashSet<>(java);
onlyJava.removeAll(python);                   // [Ola, Ewa] (порядок не гарантовано)
Set<String> symmetric = new HashSet<>(java);
symmetric.addAll(python);
symmetric.removeAll(both);                    // симетрична різниця

System.out.println(java.add("Ola"));          // false: уже є
```

Реалізації:

* **`HashSet`** — хеш-таблиця (насправді обгортка над `HashMap`), O(1), порядок не визначено;
* **`LinkedHashSet`** — зберігає порядок вставки;
* **`TreeSet`** — відсортована множина (червоно-чорне дерево), O(log n), методи `first`, `last`, `floor`, `ceiling`, `headSet`, `tailSet`, `subSet`;
* **`EnumSet`** — бітовий вектор для констант enum (сторінка «Перелічення»).

## Інші колекції: черги, стеки, купи

| Клас | Структура | Призначення |
| --- | --- | --- |
| `ArrayDeque<E>` | кільцевий буфер | черга FIFO (`offer`/`poll`) і стек LIFO (`push`/`pop`) |
| `LinkedList<E>` | двобічний список | також реалізує `Deque`, але повільніший за `ArrayDeque` |
| `PriorityQueue<E>` | двійкова купа | черга з пріоритетом: першим виходить **найменший** елемент |
| `BitSet` | масив бітів | компактна множина невеликих невід'ємних чисел, 1 біт на значення |

```java
Deque<String> queue = new ArrayDeque<>();     // FIFO
queue.offer("a"); queue.offer("b");
queue.poll();                                 // "a"
queue.peek();                                 // "b", не видаляючи

Deque<Integer> stack = new ArrayDeque<>();    // LIFO, замість застарілого класу Stack
stack.push(1); stack.push(2);
stack.pop();                                  // 2
```

Методи черг існують парами: одні кидають виняток, коли черга порожня чи повна (`add`, `remove`, `element`), інші повертають спеціальне значення (`offer` → `false`, `poll`/`peek` → `null`).

**`PriorityQueue`** — **min-купа**: першим виходить найменший елемент за природним порядком або за переданим компаратором. Ітератор купи **не** обходить елементи в порядку пріоритету.

```java
record Task(String name, int priority) { }

PriorityQueue<Task> tasks = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
Task report = new Task("написати звіт", 2);
tasks.add(report);
tasks.add(new Task("виправити баг", 1));
tasks.add(new Task("випити каву", 3));

// пріоритет звіту змінився: змінити його «на місці» неможливо, тож видаляємо й додаємо знову (O(n))
tasks.remove(report);
tasks.add(new Task("написати звіт", 0));

while (!tasks.isEmpty()) {
    Task t = tasks.poll();
    System.out.println(t.priority() + ": " + t.name());
}
// 0: написати звіт
// 1: виправити баг
// 3: випити каву
```

### Складність операцій

| Операція | `ArrayList` | `LinkedList` | `HashMap`/`HashSet` | `TreeMap`/`TreeSet` | `ArrayDeque` | `PriorityQueue` |
| --- | --- | --- | --- | --- | --- | --- |
| доступ за індексом | O(1) | O(n) | — | — | — | — |
| додати в кінець | O(1)* | O(1) | O(1)* | O(log n) | O(1)* | O(log n) |
| додати/видалити на початку | O(n) | O(1) | — | — | O(1) | — |
| пошук `contains` | O(n) | O(n) | O(1)* | O(log n) | O(n) | O(n) |
| мінімум | O(n) | O(n) | O(n) | O(log n) | — | O(1) |

Позначка `*` означає «амортизовано або в середньому».

## Представлення лише для читання й незмінні колекції

У Java немає окремих інтерфейсів «лише для читання»: незмінні колекції реалізують ті самі `List`, `Set`, `Map`, а операції зміни кидають `UnsupportedOperationException`. Розрізняють два принципово різні види.

**Представлення лише для читання** (`Collections.unmodifiableList/Set/Map`) — обгортка навколо наявної колекції. Вона **не копіює** елементи, тож зміни оригіналу видно через представлення. Зручно, щоб віддати назовні внутрішню колекцію без можливості її змінити.

```java
Set<Integer> set = new HashSet<>(Set.of(1, 2));
Set<Integer> readOnly = Collections.unmodifiableSet(set);
// readOnly.add(3);                    // UnsupportedOperationException
set.add(3);
System.out.println(readOnly.size());   // 3: зміну оригіналу видно через представлення
```

**Незмінні копії** (`List.copyOf`, `Set.copyOf`, `Map.copyOf`, `stream.toList()`) не залежать від джерела: змінити їх не може ніхто. Їх створюють один раз, і далі їх безпечно передавати будь-куди й ділити між потоками.

```java
List<String> source = new ArrayList<>(List.of("a", "b"));
List<String> snapshot = List.copyOf(source);
source.add("c");
System.out.println(snapshot);          // [a, b]
```

> [!TIP]
> Класичне правило для класу, що зберігає колекцію: у конструкторі робіть захисну копію (`this.items = List.copyOf(items)`), а з гетера повертайте її ж (вона незмінна) або `Collections.unmodifiableList(items)`, якщо внутрішній список змінюваний.

## Фабричні методи колекцій

Від Java 9 невеликі незмінні колекції створюють фабричними методами. Вони не допускають `null`, а `Set.of` і `Map.of` кидають `IllegalArgumentException` на дублікатах.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);
Set<String> vowels = Set.of("a", "e", "i", "o", "u");
Map<String, Integer> cityPopulations = Map.of(
        "Tokyo", 37_000_000,
        "Delhi", 32_000_000);                                 // до 10 пар
Map<String, Integer> more = Map.ofEntries(
        Map.entry("Shanghai", 28_000_000),
        Map.entry("London", 9_000_000));                      // довільна кількість пар
List<String> empty = List.of();
```

Порядок обходу `Set.of` і `Map.of` навмисно не визначено (він може змінюватися між запусками). Для змінюваних колекцій загортайте фабрику в конструктор: `new ArrayList<>(List.of(...))`.

Об'єднання колекцій:

```java
SortedSet<Integer> combined = new TreeSet<>(List.of(9, 10));
combined.addAll(numbers);
combined.addAll(List.of(4, 5, 6, 7, 8));
System.out.println(combined);       // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] — відсортовано, без повторів

List<Integer> joined = Stream.of(List.of(1, 2), List.of(3), List.of(4, 5))
        .flatMap(List::stream)
        .toList();                  // [1, 2, 3, 4, 5]
```

## Утилітний клас Collections

```java
Collections.sort(list);                         // або list.sort(comparator)
Collections.reverse(list);
Collections.shuffle(list, new Random(42));
Collections.swap(list, 0, 1);
Collections.max(list); Collections.min(list, comparator);
Collections.frequency(list, "x");
Collections.nCopies(3, "ab");                  // [ab, ab, ab]
Collections.emptyList(); Collections.singletonList(x);
Collections.binarySearch(sortedList, key);
Collections.synchronizedList(new ArrayList<>());   // проста потокобезпечна обгортка
```
