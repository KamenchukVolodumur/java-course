---
title: Stream API
description: Декларативна обробка послідовностей у Java — як влаштований конвеєр, ліниве виконання, потокові й буферизувальні операції, огляд операцій і детальний розбір кожної категорії: фільтрування, проєкція, з'єднання, сортування, групування, множини, перетворення, вибір елемента, агрегація, генерування.
---

## Stream API

**Stream API** (пакет `java.util.stream`, Java 8) — єдиний спосіб декларативно описувати обробку послідовностей даних: фільтрувати, перетворювати, сортувати, групувати й агрегувати їх ланцюжком операцій. Потік (stream) — це **не колекція**: він не зберігає елементів, а описує **конвеєр** їх обробки з якогось джерела (колекції, масиву, файлу, генератора).

```java
List<String> names = List.of("Tom", "Dick", "Harry", "Mary", "Jay");

List<String> result = names.stream()           // 1. джерело
        .filter(n -> n.contains("a"))          // 2. проміжні операції (ліниві)
        .sorted(Comparator.comparing(String::length))
        .map(String::toUpperCase)
        .toList();                             // 3. кінцева операція — запускає обчислення

System.out.println(result);                    // [JAY, MARY, HARRY]
```

Конвеєр складається з трьох частин:

1. **джерело**: `collection.stream()`, `Arrays.stream(array)`, `Stream.of(...)`, `Files.lines(path)` …;
2. нуль або більше **проміжних операцій** (intermediate): кожна повертає новий `Stream` і нічого не обчислює;
3. рівно одна **кінцева операція** (terminal): `toList`, `collect`, `forEach`, `count`, `reduce`, `findFirst` … Вона запускає обчислення і повертає результат.

## Внутрішня реалізація

Кожна проміжна операція лише додає до конвеєра ще одну ланку. Під час кінцевої операції потік отримує елементи з джерела через `Spliterator` і «проштовхує» їх по одному крізь ланцюжок ланок. Спрощено `filter` можна було б реалізувати як обгортку-ітератор:

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

Справжня реалізація будує ланцюжок об'єктів `Sink`: кожен приймає елемент (`accept`) і передає його (або результат перетворення) наступному. Принцип той самий: жодних проміжних колекцій між операціями.

## Ліниве виконання

Найважливіша властивість потоків — **ліниве (відкладене) виконання**. Опис конвеєра не виконує жодної роботи. Обчислення починається лише з кінцевою операцією, і елементи проходять конвеєр **по одному, вертикально**, а не «вся колекція через filter, потім уся через map».

```java
Stream<String> pipeline = Stream.of("a", "bb", "ccc", "dddd")
        .filter(s -> { System.out.println("filter " + s); return s.length() > 1; })
        .map(s -> { System.out.println("map " + s); return s.toUpperCase(); });

System.out.println("поки що нічого не виконано");
String first = pipeline.findFirst().orElseThrow();
// filter a
// filter bb
// map bb          <- знайдено перший результат: решта елементів не обробляються взагалі
System.out.println(first);   // BB
```

Завдяки цьому кінцеві операції на кшталт `findFirst`, `anyMatch` чи `limit` можуть **закінчити обробку достроково** (short-circuiting), і можна обробляти навіть нескінченні потоки.

> [!NOTE]
> Відкладене виконання не означає, що кожна операція обробляє елементи по одному. **Потокові** операції без стану (`filter`, `map`, `limit`) передають кожен елемент далі одразу. **Операції зі станом** (`sorted`, `distinct`) мусять спершу прочитати **все** джерело: у прикладі на початку сторінки `sorted` відсортує всі імена, що пройшли `filter`, і лише потім віддасть перше в `map`. Тому `sorted()` на нескінченному потоці ніколи не завершиться.

> [!WARNING]
> **Потік одноразовий.** Після кінцевої операції його не можна використати повторно: друга кінцева операція кине `IllegalStateException: stream has already been operated upon or closed`. Якщо результати потрібні кілька разів, збережіть їх у колекцію (`toList()`) або створіть новий потік з джерела.

### Потоки й бази даних

Потік обробляє дані **в пам'яті застосунку**. Якщо джерело — таблиця бази даних, а фільтрування й сортування робить потік, база спершу поверне **всі рядки**, і лише потім застосунок їх відфільтрує:

```java
// НЕЕФЕКТИВНО: SELECT * FROM products, а потім фільтрування в Java
List<Product> top = productRepository.findAll().stream()
        .filter(p -> p.price().compareTo(new BigDecimal("100")) > 0)
        .sorted(Comparator.comparing(Product::name))
        .limit(10)
        .toList();

// ЕФЕКТИВНО: умова, сортування й обмеження виконуються в базі
// SELECT * FROM products WHERE price > ? ORDER BY name LIMIT 10
List<Product> top2 = productRepository.findTop10ByPriceGreaterThanOrderByName(new BigDecimal("100"));
```

Запити до бази формулюють мовою бази (SQL, JPQL) або бібліотеками, що генерують SQL (JPA Criteria, jOOQ, Spring Data). Розділ «Додатково → Бази даних» розглядає це детальніше.

## Огляд операцій

| Категорія | Операції |
| --- | --- |
| **Фільтрування** | `filter`, `limit`, `skip`, `takeWhile`, `dropWhile`, `distinct` |
| **Проєкція** | `map`, `mapToInt`/`mapToLong`/`mapToDouble`/`mapToObj`, `flatMap`, `mapMulti`, `boxed` |
| **З'єднання** | немає окремих операцій: мапа-індекс + `map`/`flatMap`, `IntStream.range` для попарного поєднання |
| **Сортування** | `sorted()`, `sorted(Comparator)`; `Comparator.comparing`, `thenComparing`, `reversed` |
| **Групування** | `Collectors.groupingBy`, `partitioningBy`, `Gatherers.windowFixed` (Java 24) |
| **Множини** | `Stream.concat`, `distinct`, `filter(set::contains)` |
| **Перетворення** | `toList`, `toArray`, `collect(toSet/toMap/toCollection/joining)`, `iterator` |
| **Вибір елемента** | `findFirst`, `findAny`, `min`, `max` → `Optional` |
| **Агрегація** | `reduce`, `count`, `sum`, `average`, `summaryStatistics`, `anyMatch`, `allMatch`, `noneMatch`, `Collectors.*ing` |
| **Генерування** | `Stream.empty`, `of`, `ofNullable`, `iterate`, `generate`, `IntStream.range`/`rangeClosed` |
| **Інше** | `peek`, `forEach`, `forEachOrdered`, `parallel`, `sequential`, `onClose`, `gather` (Java 24) |

Для прикладів нижче використовуємо записи:

```java
record Person(String firstName, String lastName, int age) { }
record Category(int id, String name) { }
record Product(String name, int categoryId, BigDecimal price) { }
```

### Фільтрування

Операції цієї категорії вибирають елементи, що задовольняють умову, обмежують кількість результатів або пропускають непотрібні елементи.

#### filter

Залишає лише елементи, для яких предикат повертає `true`.

```java
List<Integer> evenNumbers = Stream.of(1, 2, 3, 4, 5).filter(n -> n % 2 == 0).toList();
// [2, 4]
```

#### limit

Залишає не більше ніж `n` перших елементів. Операція коротка: обробка зупиняється після `n` елементів.

```java
List<Integer> firstThree = Stream.of(1, 2, 3, 4, 5).limit(3).toList();
// [1, 2, 3]
```

Щоб узяти `n` **останніх** елементів, потік має знати розмір: для списку — `list.subList(list.size() - n, list.size())`, для довільного потоку — `skip(count - n)` після підрахунку або зібрати в `ArrayDeque` з обмеженням.

#### skip

Пропускає `n` перших елементів і повертає решту.

```java
List<Integer> afterFirstTwo = Stream.of(1, 2, 3, 4, 5).skip(2).toList();
// [3, 4, 5]
```

#### takeWhile

Повертає елементи **з початку** потоку, доки виконується умова. На першому елементі, що її не задовольняє, обробка зупиняється (Java 9).

```java
List<Integer> lessThanFour = Stream.of(1, 2, 3, 4, 1, 2).takeWhile(n -> n < 4).toList();
// [1, 2, 3] — останні 1, 2 не потрапили, бо після 4 обробку зупинено
```

#### dropWhile

Пропускає елементи з початку потоку, доки виконується умова, а потім повертає всі решту (Java 9).

```java
List<Integer> fourAndOnward = Stream.of(1, 2, 3, 4, 1, 2).dropWhile(n -> n < 4).toList();
// [4, 1, 2]
```

#### distinct

Прибирає дублікати (за `equals`/`hashCode`), зберігаючи перше входження.

```java
List<Integer> unique = Stream.of(1, 2, 2, 3, 1).distinct().toList();
// [1, 2, 3]
```

Окремої операції «унікальні за ключем» немає. Її можна виразити колектором `toMap` з функцією злиття, що лишає перший елемент:

```java
record Item(String name, String category) { }
List<Item> items = List.of(new Item("Apple", "Fruit"), new Item("Orange", "Fruit"), new Item("Carrot", "Vegetable"));

Collection<Item> onePerCategory = items.stream()
        .collect(Collectors.toMap(Item::category, i -> i, (first, second) -> first, LinkedHashMap::new))
        .values();
// [Item[name=Apple, ...], Item[name=Carrot, ...]]
```

### Проєкція

Проєкція перетворює кожен елемент потоку на нову форму: витягує потрібні поля, обчислює значення чи будує нові об'єкти.

#### map

Базова операція проєкції: перетворює кожен елемент функцією.

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

#### mapToInt, mapToObj і примітивні потоки

Окрім `Stream<T>`, є **примітивні потоки** `IntStream`, `LongStream`, `DoubleStream`. Вони не упаковують числа й мають числові операції (`sum`, `average`, `max`, `summaryStatistics`). Між ними переходять операціями `mapToInt`, `mapToObj`, `boxed`, `asDoubleStream`.

```java
int totalAge = people.stream().mapToInt(Person::age).sum();            // 127
OptionalDouble avg = people.stream().mapToInt(Person::age).average();  // 42.33...
List<Integer> ages = people.stream().mapToInt(Person::age).boxed().toList();
```

#### Елементи з індексом

Окремої операції, що додає до елемента його позицію, немає. Для списків використовують потік індексів:

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

«Сплющує» потік потоків: кожен елемент перетворюється на потік, і всі вони зливаються в один.

```java
List<String> sentences = List.of("hello world", "how are you");
List<String> words = sentences.stream()
        .flatMap(s -> Arrays.stream(s.split(" ")))
        .toList();
// [hello, world, how, are, you]
```

#### mapMulti

Альтернатива `flatMap`, коли елемент перетворюється на 0, 1 чи кілька значень і створювати для цього проміжний потік зайве (Java 16):

```java
List<Integer> repeated = Stream.of(1, 2, 3)
        .<Integer>mapMulti((n, downstream) -> {
            for (int i = 0; i < n; i++) downstream.accept(n);
        })
        .toList();
// [1, 2, 2, 3, 3, 3]
```

### З'єднання

Окремих операцій `join` у Stream API немає. З'єднання двох послідовностей за ключем будують з **мапи-індексу** (хеш-з'єднання): спершу одну послідовність перетворюють на `Map` за ключем, потім іншу обходять і шукають відповідники за O(1).

```java
List<Category> categories = List.of(
        new Category(1, "Electronics"),
        new Category(2, "Food"),
        new Category(3, "Toys"));                     // категорія без товарів

List<Product> products = List.of(
        new Product("Laptop", 1, new BigDecimal("3999")),
        new Product("Milk", 2, new BigDecimal("3.49")),
        new Product("Keyboard", 1, new BigDecimal("199")),
        new Product("Bread", 2, new BigDecimal("5.99")),
        new Product("Monitor", 1, new BigDecimal("899")),
        new Product("Spaceship", 4, new BigDecimal("1e9")));   // товар без категорії
```

#### Внутрішнє з'єднання (inner join)

Повертає лише пари, що мають відповідник в обох послідовностях (як `INNER JOIN` у SQL):

```java
Map<Integer, Category> categoryById = categories.stream()
        .collect(Collectors.toMap(Category::id, c -> c));

record ProductRow(String product, String category) { }

List<ProductRow> rows = products.stream()
        .filter(p -> categoryById.containsKey(p.categoryId()))         // без відповідника — відкидаємо
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

#### З'єднання з групуванням (group join)

Для кожного елемента першої послідовності отримуємо **групу** відповідних елементів другої (як `LEFT OUTER JOIN` + `GROUP BY`):

```java
Map<Integer, List<Product>> productsByCategory = products.stream()
        .collect(Collectors.groupingBy(Product::categoryId));

for (Category cat : categories) {
    List<Product> group = productsByCategory.getOrDefault(cat.id(), List.of());
    System.out.println("Категорія: " + cat.name());
    if (group.isEmpty()) {
        System.out.println("  - (немає товарів)");
    }
    group.forEach(p -> System.out.println("  - " + p.name()));
}
```

```text
Категорія: Electronics
  - Laptop
  - Keyboard
  - Monitor
Категорія: Food
  - Milk
  - Bread
Категорія: Toys
  - (немає товарів)
```

#### Ліве з'єднання (left join)

Усі елементи першої послідовності, а там, де відповідника немає, — порожнє значення:

```java
List<String> leftJoin = categories.stream()
        .flatMap(cat -> {
            List<Product> group = productsByCategory.getOrDefault(cat.id(), List.of());
            return group.isEmpty()
                    ? Stream.of(cat.name() + ": (немає)")
                    : group.stream().map(p -> cat.name() + ": " + p.name());
        })
        .toList();
// [Electronics: Laptop, Electronics: Keyboard, Electronics: Monitor, Food: Milk, Food: Bread, Toys: (немає)]
```

#### Попарне поєднання (zip)

Поєднує дві послідовності «елемент за елементом». Довжина результату дорівнює довжині коротшої:

```java
List<Integer> numbers = List.of(1, 2, 3);
List<String> letters = List.of("A", "B", "C", "D");

List<String> zipped = IntStream.range(0, Math.min(numbers.size(), letters.size()))
        .mapToObj(i -> numbers.get(i) + "-" + letters.get(i))
        .toList();
// [1-A, 2-B, 3-C]
```

### Сортування

#### sorted

`sorted()` впорядковує елементи за природним порядком (`Comparable`), `sorted(comparator)` — за заданим компаратором. Сортування стабільне: рівні елементи зберігають вихідний порядок.

```java
List<String> sorted = Stream.of("pear", "Fig", "apple").sorted().toList();
// [Fig, apple, pear]: великі літери в Unicode менші за малі
List<String> ci = Stream.of("pear", "Fig", "apple").sorted(String.CASE_INSENSITIVE_ORDER).toList();
// [apple, Fig, pear]
List<Integer> desc = Stream.of(3, 1, 2).sorted(Comparator.reverseOrder()).toList();
// [3, 2, 1]
```

#### Складені критерії

Компаратори будують фабриками й поєднують методами `thenComparing` і `reversed`:

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

#### Зворотний порядок і перемішування

Окремих операцій потоку для цього немає: вони потребують усієї послідовності. Їх роблять на списку:

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
List<Integer> reversed = list.reversed();          // Java 21: обернене представлення [4, 3, 2, 1]
Collections.reverse(list);                         // на місці
Collections.shuffle(list, new Random(42));         // випадковий порядок (з seed — відтворюваний)
```

### Групування

#### groupingBy

Колектор `groupingBy` ділить елементи на групи за ключем і повертає `Map<K, List<T>>`. Другим аргументом можна передати **колектор нижнього рівня** (downstream), що обробить кожну групу, а мапу результату — замінити, наприклад, на відсортовану `TreeMap`.

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

| Колектор нижнього рівня | Результат для групи |
| --- | --- |
| `toList()`, `toSet()`, `toCollection(...)` | колекція елементів |
| `counting()` | кількість (`Long`) |
| `summingInt/Long/Double(f)`, `averagingInt/Long/Double(f)` | сума, середнє |
| `minBy(cmp)`, `maxBy(cmp)` | `Optional` з мінімальним/максимальним |
| `mapping(f, downstream)`, `filtering(p, downstream)`, `flatMapping(f, downstream)` | перетворення всередині групи |
| `reducing(identity, mapper, op)` | довільна згортка |
| `joining(sep)` | рядки, з'єднані роздільником |
| `collectingAndThen(downstream, finisher)` | дообробка результату групи |

#### partitioningBy

Окремий випадок групування за предикатом: результат завжди має **два** ключі, `true` і `false`, навіть якщо одна з груп порожня.

```java
Map<Boolean, List<Integer>> evenOdd = IntStream.rangeClosed(1, 10).boxed()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
// {false=[1, 3, 5, 7, 9], true=[2, 4, 6, 8, 10]}
```

#### Розбиття на частини (chunk)

Від Java 24 є **збирачі** (gatherers) — власні проміжні операції. Стандартний `Gatherers.windowFixed(n)` ділить потік на списки по `n` елементів, `windowSliding(n)` — на «ковзні вікна»:

```java
List<List<Integer>> chunks = IntStream.rangeClosed(1, 7).boxed()
        .gather(Gatherers.windowFixed(3))
        .toList();
// [[1, 2, 3], [4, 5, 6], [7]]

List<List<Integer>> sliding = Stream.of(1, 2, 3, 4).gather(Gatherers.windowSliding(2)).toList();
// [[1, 2], [2, 3], [3, 4]]
```

У старших версіях розбиття роблять через індекси: `IntStream.range(0, (n + size - 1) / size).mapToObj(i -> list.subList(i * size, Math.min(n, (i + 1) * size)))`.

### Операції над множинами

#### Об'єднання послідовностей

`Stream.concat` з'єднує два потоки один за одним; для кількох — `Stream.of(a, b, c).flatMap(...)`.

```java
List<Integer> concatenated = Stream.concat(Stream.of(1, 2), Stream.of(2, 3)).toList();
// [1, 2, 2, 3]
List<Integer> union = Stream.concat(Stream.of(1, 2), Stream.of(2, 3)).distinct().toList();
// [1, 2, 3]
```

#### Перетин і різниця

Друга послідовність перетворюється на `Set`, щоб перевірка належності коштувала O(1):

```java
List<Integer> a = List.of(1, 2, 3, 4);
Set<Integer> b = Set.of(3, 4, 5);

List<Integer> intersect = a.stream().filter(b::contains).toList();                  // [3, 4]
List<Integer> except = a.stream().filter(Predicate.not(b::contains)).toList();      // [1, 2]

Set<Integer> hiddenCategoryIds = Set.of(3, 4);                                      // «різниця за ключем»
List<Product> visible = products.stream()
        .filter(p -> !hiddenCategoryIds.contains(p.categoryId()))
        .toList();
```

### Перетворення

#### Вибір елементів певного типу

Відфільтрувати й привести елементи до потрібного типу:

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

#### toList, toArray і collect

Кінцеві операції, що **матеріалізують** результат:

```java
List<String> list = stream.toList();                           // незмінний список (Java 16)
List<String> mutable = stream.collect(Collectors.toList());   // змінюваний ArrayList (не гарантовано специфікацією)
String[] array = stream.toArray(String[]::new);
Set<String> set = stream.collect(Collectors.toSet());
TreeSet<String> sortedSet = stream.collect(Collectors.toCollection(TreeSet::new));
String csv = stream.collect(Collectors.joining(", ", "[", "]"));   // "[a, b, c]"

Map<String, Integer> lengths = Stream.of("a", "bb", "ccc")
        .collect(Collectors.toMap(s -> s, String::length));    // {a=1, bb=2, ccc=3}
```

> [!WARNING]
> `Collectors.toMap` кидає `IllegalStateException: Duplicate key`, якщо два елементи мають однаковий ключ. Якщо дублікати можливі, передайте третім аргументом функцію злиття: `toMap(k, v, (old, neu) -> old)` або `Integer::sum`. Для «ключ → список значень» використовуйте `groupingBy`.

### Вибір елемента

Операції, що повертають один елемент, повертають **`Optional`**: потік може бути порожнім.

#### findFirst і findAny

```java
Optional<Person> firstAdult = people.stream().filter(p -> p.age() >= 18).findFirst();
String name = firstAdult.map(Person::firstName).orElse("немає");
```

`findAny` у послідовному потоці зазвичай повертає перший елемент, але в паралельному — будь-який і швидше.

#### Останній елемент

```java
Optional<Integer> last = Stream.of(1, 2, 3).reduce((a, b) -> b);    // 3
Integer lastOfList = List.of(1, 2, 3).getLast();                    // Java 21, для списків
```

#### Єдиний елемент

Якщо очікується **рівно один** елемент, а кілька — це помилка, використовують колектор з перевіркою:

```java
Person only = people.stream()
        .filter(p -> p.lastName().equals("Doe"))
        .collect(Collectors.collectingAndThen(Collectors.toList(), l -> {
            if (l.size() != 1) throw new IllegalStateException("Очікувався рівно один, знайдено " + l.size());
            return l.getFirst();
        }));
```

#### Елемент за позицією

```java
Optional<String> third = Stream.of("a", "b", "c", "d").skip(2).findFirst();   // c
```

#### min і max

Повертають мінімальний чи максимальний елемент за компаратором:

```java
Optional<Person> oldest = people.stream().max(Comparator.comparingInt(Person::age));
Optional<Product> cheapest = products.stream().min(Comparator.comparing(Product::price));
```

#### Значення за замовчуванням

```java
int maxOrZero = Stream.<Integer>empty().max(Integer::compare).orElse(0);
```

### Агрегація

#### reduce

Загальна згортка: поєднує всі елементи в одне значення бінарною операцією. З початковим значенням (identity) повертає значення, без нього — `Optional`.

```java
int product = Stream.of(1, 2, 3, 4).reduce(1, (acc, n) -> acc * n);        // 24
Optional<Integer> sum = Stream.of(1, 2, 3).reduce(Integer::sum);           // Optional[6]
BigDecimal total = products.stream().map(Product::price).reduce(BigDecimal.ZERO, BigDecimal::add);
```

#### sum, average, max, min

Для чисел — через примітивні потоки:

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

Якщо джерело знає свій розмір (`SIZED`), а проміжні операції його не змінюють, `count` може взагалі не обходити елементи. Тому побічні ефекти в `peek` перед `count` можуть **не виконатися**.

#### anyMatch, allMatch, noneMatch

Логічні перевірки, що закінчуються, щойно відповідь відома:

```java
List<Integer> odd = List.of(1, 3, 5);
boolean allOdd = odd.stream().allMatch(n -> n % 2 != 0);     // true
boolean anyEven = odd.stream().anyMatch(n -> n % 2 == 0);     // false
boolean noneNeg = odd.stream().noneMatch(n -> n < 0);         // true
boolean hasThree = odd.contains(3);                            // для колекцій — contains
```

Для порожнього потоку `allMatch` і `noneMatch` повертають `true`, а `anyMatch` — `false`.

#### Рівність послідовностей

Дві колекції порівнюють через `equals` (списки — поелементно з урахуванням порядку). Для довільних потоків — зібрати їх у списки:

```java
boolean equal = List.of(1, 2, 3).equals(Stream.of(1, 2, 3).toList());   // true
```

#### Кілька агрегатів за один прохід

`Collectors.teeing` (Java 12) передає кожен елемент двом колекторам і поєднує їхні результати:

```java
record MinMax(int min, int max) { }
MinMax mm = Stream.of(5, 2, 9, 1).collect(Collectors.teeing(
        Collectors.minBy(Integer::compare),
        Collectors.maxBy(Integer::compare),
        (min, max) -> new MinMax(min.orElseThrow(), max.orElseThrow())));
// MinMax[min=1, max=9]
```

### Генерування

#### Stream.empty і Stream.of

```java
Stream<String> empty = Stream.empty();
Stream<Integer> some = Stream.of(1, 2, 3);
Stream<String> maybeOne = Stream.ofNullable(possiblyNull);     // 0 або 1 елемент (Java 9)
```

#### range і rangeClosed

Послідовність цілих чисел у діапазоні:

```java
IntStream.range(10, 13);          // 10, 11, 12 — кінець не включено
IntStream.rangeClosed(1, 5);      // 1, 2, 3, 4, 5
```

#### Повторення

```java
List<Integer> threes = Collections.nCopies(5, 3);                      // [3, 3, 3, 3, 3]
List<String> repeated = Stream.generate(() -> "x").limit(3).toList();  // [x, x, x]
```

#### iterate і generate

`iterate` будує послідовність з початкового значення і функції наступного; з умовою зупинки — скінченну (Java 9). `generate` викликає постачальника для кожного елемента. Обидва без умови дають **нескінченні** потоки, які обмежують `limit` або `takeWhile`.

```java
List<Integer> evens = Stream.iterate(0, n -> n <= 10, n -> n + 2).toList();
// [0, 2, 4, 6, 8, 10]
List<Double> halves = Stream.iterate(0.0, x -> x + 0.5).limit(4).toList();
// [0.0, 0.5, 1.0, 1.5]
DoubleStream randoms = DoubleStream.generate(Math::random).limit(5);
```

## Добрі практики

* Функції, передані в операції потоку, мають бути **без побічних ефектів** і не змінювати джерело. Результат збирайте колекторами, а не через `forEach(list::add)`.
* `forEach` — кінцева операція для дій «назовні» (друк, запис); для перетворень використовуйте `map`/`collect`.
* `peek` призначений для налагодження, а не для логіки.
* Потоки над ресурсами (`Files.lines`, `Files.walk`) закривайте через try-with-resources.
* Паралельні потоки (`parallelStream()`) мають сенс лише для великих обсягів даних і дорогих операцій. Детальніше — у розділі «Конкурентність → Паралельна обробка».
* Не все треба писати потоком: простий цикл часто зрозуміліший, особливо з `break`, винятками чи зміною кількох змінних.
