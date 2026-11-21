export const lecture05 = {
  id: "05",
  title: "Лекція 05: Колекції та Stream API",
  description: "Java Collections Framework (List, Set, Map, Queue, Deque) і складність операцій, незмінні колекції, корисні методи Map, Stream API як аналог LINQ: ліниве виконання, проміжні й термінальні операції, колектори, групування, flatMap, примітивні та нескінченні потоки, паралельні потоки.",
  sections: [
    {
      title: "1. Java Collections Framework: огляд",
      content: `
\`\`\`text
Iterable
└── Collection
    ├── List          впорядкований, з індексами, допускає дублікати
    ├── Set           без дублікатів
    │   └── SortedSet / NavigableSet
    └── Queue         черга
        └── Deque     двобічна черга (і стек)
Map                   окрема ієрархія: ключ -> значення
└── SortedMap / NavigableMap
\`\`\`

| Інтерфейс | Реалізація | Аналог у C# | Особливості |
| --- | --- | --- | --- |
| \`List\` | \`ArrayList\` | \`List<T>\` | масив, що росте; швидкий доступ за індексом |
| \`List\` | \`LinkedList\` | \`LinkedList<T>\` | двобічний список; на практиці рідко кращий |
| \`Set\` | \`HashSet\` | \`HashSet<T>\` | хеш-таблиця, порядок не гарантовано |
| \`Set\` | \`LinkedHashSet\` | — | зберігає порядок вставки |
| \`Set\` | \`TreeSet\` | \`SortedSet<T>\` | червоно-чорне дерево, відсортований |
| \`Map\` | \`HashMap\` | \`Dictionary<K,V>\` | хеш-таблиця |
| \`Map\` | \`LinkedHashMap\` | — | порядок вставки (або доступу — для LRU-кешу) |
| \`Map\` | \`TreeMap\` | \`SortedDictionary<K,V>\` | відсортована за ключами |
| \`Deque\` | \`ArrayDeque\` | \`Queue<T>\`, \`Stack<T>\` | кільцевий буфер: і черга, і стек |
| \`Queue\` | \`PriorityQueue\` | \`PriorityQueue<T,P>\` | двійкова купа, мінімум зверху |

### Складність операцій

| Операція | ArrayList | LinkedList | HashSet/HashMap | TreeSet/TreeMap |
| --- | --- | --- | --- | --- |
| get(i) | O(1) | O(n) | — | — |
| add у кінець | O(1) амортизовано | O(1) | O(1) | O(log n) |
| add/remove на початку | O(n) | O(1) | — | — |
| contains / get(key) | O(n) | O(n) | O(1) у середньому | O(log n) |
| ітерація за порядком | так | так | ні | так (відсортовано) |

> [!TIP]
> Оголошуйте змінні **типом інтерфейсу**: \`List<String> names = new ArrayList<>();\`. Реалізацію тоді можна змінити в одному місці.

> [!WARNING]
> Класи \`Vector\`, \`Stack\` і \`Hashtable\` — це legacy, вони синхронізовані й повільні. Замість них використовуйте \`ArrayList\`, \`ArrayDeque\`, \`HashMap\` (або \`ConcurrentHashMap\`).
`
    },
    {
      title: "2. List, Set, Deque на практиці. Незмінні колекції",
      content: `
\`\`\`java
List<String> list = new ArrayList<>(List.of("b", "a", "c"));
list.add("d");
list.add(0, "z");               // вставка за індексом
list.remove("a");               // за значенням
list.remove(0);                 // за індексом (увага до List<Integer>!)
list.set(0, "x");
list.indexOf("c");
list.subList(1, 3);             // представлення (view), а не копія
Collections.sort(list);         // або list.sort(null)
Collections.reverse(list);
Collections.shuffle(list);
Collections.frequency(list, "c");
list.getFirst(); list.getLast();   // Java 21: SequencedCollection
list.reversed();                   // Java 21: обернене представлення

Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);
stack.pop();                    // 2 (LIFO)
Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1); queue.offer(2);
queue.poll();                   // 1 (FIFO)
queue.peek();                   // подивитися, не видаляючи

PriorityQueue<Task> pq = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
\`\`\`

> [!CAUTION]
> Для \`List<Integer> nums\` виклик \`nums.remove(1)\` видаляє елемент **за індексом 1**, а не значення 1. Щоб видалити значення: \`nums.remove(Integer.valueOf(1))\`.

### Незмінні колекції

\`\`\`java
List<String> a = List.of("x", "y");          // незмінна; null заборонений
Set<Integer> s = Set.of(1, 2, 3);            // дублікат кине IllegalArgumentException
Map<String, Integer> m = Map.of("a", 1, "b", 2);
List<String> copy = List.copyOf(mutable);    // незмінна копія
List<String> view = Collections.unmodifiableList(mutable);  // read-only ПРЕДСТАВЛЕННЯ
a.add("z");                                  // UnsupportedOperationException
\`\`\`

> [!NOTE]
> \`unmodifiableList\` — це лише «вікно» на оригінальний список: якщо змінити оригінал, зміни буде видно і через представлення. \`List.copyOf\` створює справжню незалежну копію.
`
    },
    {
      title: "3. Map: корисні методи",
      content: `
\`\`\`java
Map<String, Integer> stock = new HashMap<>();
stock.put("apple", 10);
stock.get("pear");                         // null, якщо ключа немає
stock.getOrDefault("pear", 0);             // 0
stock.putIfAbsent("pear", 5);
stock.containsKey("apple");
stock.remove("apple");

// ітерація
for (Map.Entry<String, Integer> e : stock.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
stock.forEach((k, v) -> System.out.println(k + " = " + v));
\`\`\`

### merge, compute, computeIfAbsent

Ці методи замінюють типовий код «отримати — перевірити — покласти»:

\`\`\`java
// лічильник слів
Map<String, Integer> counts = new HashMap<>();
for (String w : words) {
    counts.merge(w, 1, Integer::sum);       // немає ключа -> 1, є -> old + 1
}

// групування: Map<K, List<V>>
Map<Character, List<String>> byFirst = new TreeMap<>();
for (String w : words) {
    byFirst.computeIfAbsent(w.charAt(0), k -> new ArrayList<>()).add(w);
}

// перерахунок значення
stock.compute("apple", (k, v) -> v == null ? 1 : v * 2);
stock.computeIfPresent("apple", (k, v) -> v > 100 ? null : v + 1);   // null видаляє ключ
\`\`\`

| Метод | Ключ відсутній | Ключ є |
| --- | --- | --- |
| \`merge(k, v, f)\` | кладе \`v\` | \`f(old, v)\`; \`null\` видаляє |
| \`computeIfAbsent(k, f)\` | кладе \`f(k)\` | нічого не робить, повертає старе значення |
| \`computeIfPresent(k, f)\` | нічого | \`f(k, old)\`; \`null\` видаляє |
| \`compute(k, f)\` | \`f(k, null)\` | \`f(k, old)\` |

### TreeMap — навігація

\`\`\`java
TreeMap<Integer, String> grades = new TreeMap<>(Map.of(50, "E", 60, "D", 70, "C", 80, "B", 90, "A"));
grades.floorEntry(77).getValue();    // "C": найбільший ключ <= 77
grades.ceilingKey(77);               // 80
grades.headMap(70);                  // ключі < 70
grades.firstKey(); grades.lastEntry();
\`\`\`

### Як працює HashMap

Масив кошиків (buckets). Індекс кошика обчислюється з \`hashCode()\` ключа. Якщо кошик уже зайнятий (колізія), елементи зберігаються списком, а якщо їх більше 8 — червоно-чорним деревом. Коли заповненість перевищує 75% (load factor), масив подвоюється і всі елементи перерозподіляються.
`
    },
    {
      title: "4. Stream API — аналог LINQ",
      content: `
**Stream** — це послідовність елементів, над якою будують конвеєр операцій. Як і LINQ, він **лінивий**: проміжні операції нічого не роблять, доки не викликано термінальну.

\`\`\`java
List<String> result = people.stream()          // джерело
        .filter(p -> p.age() >= 18)            // проміжна (lazy)
        .sorted(Comparator.comparing(Person::name))
        .map(Person::name)                     // проміжна (lazy)
        .limit(10)
        .toList();                             // термінальна: запускає обчислення
\`\`\`

### Відповідність LINQ

| LINQ (C#) | Stream (Java) |
| --- | --- |
| \`Where\` | \`filter\` |
| \`Select\` | \`map\` |
| \`SelectMany\` | \`flatMap\` |
| \`OrderBy\` / \`ThenBy\` | \`sorted(Comparator.comparing(..).thenComparing(..))\` |
| \`Take\` / \`Skip\` | \`limit\` / \`skip\` |
| \`TakeWhile\` / \`SkipWhile\` | \`takeWhile\` / \`dropWhile\` |
| \`Distinct\` | \`distinct\` |
| \`First\` / \`FirstOrDefault\` | \`findFirst()\` → \`Optional\` |
| \`Any\` / \`All\` | \`anyMatch\` / \`allMatch\` / \`noneMatch\` |
| \`Count\` | \`count\` |
| \`Sum\` / \`Average\` / \`Max\` | \`mapToInt(..).sum()\` / \`average()\` / \`max(comparator)\` |
| \`Aggregate\` | \`reduce\` |
| \`ToList\` / \`ToArray\` | \`toList()\` / \`toArray(String[]::new)\` |
| \`ToDictionary\` | \`collect(Collectors.toMap(..))\` |
| \`GroupBy\` | \`collect(Collectors.groupingBy(..))\` |
| \`Join\` | немає: \`Map\` + \`map\`/\`flatMap\` |
| \`Zip\` | немає: \`IntStream.range\` + індекси |

### Ліниве виконання

\`\`\`java
Stream<String> s = Stream.of("a", "bb", "ccc")
        .filter(x -> { System.out.println("filter " + x); return x.length() > 1; })
        .map(x -> { System.out.println("map " + x); return x.toUpperCase(); });
System.out.println("ще нічого не виконано");
s.findFirst();
// filter a, filter bb, map bb  — елементи проходять конвеєр по одному,
// і обробка зупиняється, щойно знайдено перший результат
\`\`\`

> [!WARNING]
> **Stream одноразовий.** Повторна термінальна операція кидає \`IllegalStateException: stream has already been operated upon or closed\`. У LINQ \`IEnumerable\` можна обійти двічі (і запит виконається двічі), а в Java потрібно створити новий stream з джерела.

### Створення потоків

\`\`\`java
list.stream();
Arrays.stream(array);
Stream.of(1, 2, 3);
IntStream.range(0, 10);                       // 0..9
IntStream.rangeClosed(1, 5);                  // 1..5
Stream.iterate(1, x -> x * 2).limit(10);      // 1, 2, 4, ..., 512
Stream.iterate(1, x -> x < 1000, x -> x * 2); // з умовою зупинки
Stream.generate(Math::random).limit(5);
Files.lines(path);                            // рядки файлу (закривайте!)
"text".chars();                               // IntStream символів
Pattern.compile(",").splitAsStream("a,b,c");
\`\`\`

> [!CAUTION]
> На нескінченному потоці \`sorted()\`, \`count()\` чи \`collect()\` ніколи не завершаться. Спочатку обмежте потік через \`limit\` або \`takeWhile\`.
`
    },
    {
      title: "5. Операції потоків: map, flatMap, reduce, примітивні потоки",
      content: `
\`\`\`java
record Order(String customer, List<Item> items) { }
record Item(String name, int qty, double price) { }

// flatMap: список списків -> один потік
List<String> allItems = orders.stream()
        .flatMap(o -> o.items().stream())
        .map(Item::name)
        .distinct()
        .sorted()
        .toList();

// reduce: згортка
int product = Stream.of(1, 2, 3, 4).reduce(1, (a, b) -> a * b);     // 24
Optional<String> longest = words.stream().reduce((a, b) -> a.length() >= b.length() ? a : b);

// пошук
boolean anyBig = orders.stream().anyMatch(o -> o.items().size() > 10);
Optional<Order> first = orders.stream().filter(o -> o.customer().startsWith("A")).findFirst();
Optional<Item> priciest = items.stream().max(Comparator.comparingDouble(Item::price));
\`\`\`

### Примітивні потоки: IntStream, LongStream, DoubleStream

Вони працюють без boxing і мають числові методи:

\`\`\`java
double total = items.stream()
        .mapToDouble(i -> i.qty() * i.price())
        .sum();

IntSummaryStatistics stats = words.stream().mapToInt(String::length).summaryStatistics();
stats.getMin(); stats.getMax(); stats.getAverage(); stats.getCount();

OptionalDouble avg = IntStream.of(3, 5, 7).average();    // OptionalDouble[5.0]
List<Integer> boxed = IntStream.range(0, 5).boxed().toList();
\`\`\`

### peek, mapMulti, gatherers

* \`peek(x -> log(x))\` — подивитися на елементи посеред конвеєра (для налагодження).
* \`mapMulti\` (Java 16) — альтернатива \`flatMap\`, коли елементів 0–2.
* \`gather(...)\` (Java 24) — власні проміжні операції, наприклад \`Gatherers.windowFixed(3)\` групує елементи по три.
`
    },
    {
      title: "6. Collectors: групування та агрегація",
      content: `
\`\`\`java
import static java.util.stream.Collectors.*;

// toMap
Map<String, Double> priceByName = items.stream()
        .collect(toMap(Item::name, Item::price));               // дубль ключа -> IllegalStateException
Map<String, Integer> qtyByName = items.stream()
        .collect(toMap(Item::name, Item::qty, Integer::sum));   // злиття дублікатів

// groupingBy — аналог GroupBy
Map<String, List<Order>> byCustomer = orders.stream()
        .collect(groupingBy(Order::customer));

Map<String, Long> ordersPerCustomer = orders.stream()
        .collect(groupingBy(Order::customer, counting()));

Map<String, Double> spentPerCustomer = orders.stream()
        .collect(groupingBy(Order::customer,
                 summingDouble(o -> o.items().stream().mapToDouble(i -> i.qty() * i.price()).sum())));

Map<String, Set<String>> itemsPerCustomer = orders.stream()
        .collect(groupingBy(Order::customer, TreeMap::new,       // відсортовані ключі
                 flatMapping(o -> o.items().stream().map(Item::name), toSet())));

// partitioningBy — завжди два ключі: true / false
Map<Boolean, List<Integer>> evenOdd = IntStream.rangeClosed(1, 10).boxed()
        .collect(partitioningBy(x -> x % 2 == 0));

// joining
String csv = names.stream().collect(joining(", ", "[", "]"));   // "[a, b, c]"

// агрегація всередині групи
Map<String, Optional<Item>> priciestByOrder = ...
        .collect(groupingBy(Item::name, maxBy(Comparator.comparingDouble(Item::price))));
Map<String, Double> avgPrice = items.stream()
        .collect(groupingBy(Item::name, averagingDouble(Item::price)));
\`\`\`

| Колектор | Результат |
| --- | --- |
| \`toList()\`, \`toSet()\`, \`toCollection(TreeSet::new)\` | колекція |
| \`toMap(k, v [, merge [, mapFactory]])\` | \`Map\` |
| \`groupingBy(key [, mapFactory] [, downstream])\` | \`Map<K, ...>\` |
| \`partitioningBy(pred [, downstream])\` | \`Map<Boolean, ...>\` |
| \`counting()\`, \`summingInt\`, \`averagingDouble\` | число |
| \`minBy\`, \`maxBy\` | \`Optional\` |
| \`mapping(f, downstream)\`, \`filtering\`, \`flatMapping\` | перетворення всередині групи |
| \`joining(sep, prefix, suffix)\` | \`String\` |
| \`teeing(c1, c2, merger)\` | поєднання двох колекторів |

> [!TIP]
> Сортування груп за розміром: \`map.entrySet().stream().sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())).limit(5)\`.
`
    },
    {
      title: "7. Паралельні потоки і ForkJoinPool",
      content: `
\`parallelStream()\` (або \`.parallel()\`) ділить джерело на частини і обробляє їх у спільному \`ForkJoinPool.commonPool()\`. Кількість потоків у ньому — це кількість ядер мінус один. Аналог — PLINQ (\`AsParallel()\`).

\`\`\`java
long primes = LongStream.rangeClosed(2, 5_000_000)
        .parallel()
        .filter(Main::isPrime)
        .count();
\`\`\`

Коли це має сенс:

* багато даних (десятки тисяч елементів і більше) і **дорога** операція над кожним;
* джерело добре ділиться: \`ArrayList\`, масив, \`IntStream.range\` (а \`LinkedList\` і \`Stream.iterate\` — погано);
* операції **без побічних ефектів** і без блокувань.

> [!CAUTION]
> Ніколи не змінюйте спільний стан з паралельного потоку:
> \`List<Integer> out = new ArrayList<>(); stream.parallel().forEach(out::add);\` — це гонка даних: частина елементів загубиться або виникне \`ArrayIndexOutOfBoundsException\`. Використовуйте \`collect(toList())\`.

* \`forEach\` у паралельному потоці не гарантує порядку, а \`forEachOrdered\` гарантує (ціною швидкості).
* \`findAny\` швидший за \`findFirst\` у паралельному режимі.
* Блокувальні операції (мережа, файли) у \`commonPool\` гальмують усі паралельні потоки програми. Для I/O використовуйте віртуальні потоки (лекція 09).

### ForkJoinPool напряму: «розділяй і володарюй»

\`\`\`java
class SumTask extends RecursiveTask<Long> {
    private static final int THRESHOLD = 10_000;
    private final int[] data; private final int from, to;

    SumTask(int[] data, int from, int to) { this.data = data; this.from = from; this.to = to; }

    @Override
    protected Long compute() {
        if (to - from <= THRESHOLD) {
            long s = 0;
            for (int i = from; i < to; i++) s += data[i];
            return s;
        }
        int mid = (from + to) >>> 1;
        SumTask left = new SumTask(data, from, mid);
        left.fork();                                   // асинхронно
        long right = new SumTask(data, mid, to).compute();
        return left.join() + right;
    }
}

long sum = ForkJoinPool.commonPool().invoke(new SumTask(data, 0, data.length));
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Яка колекція — найкращий вибір для частих перевірок contains() серед мільйона рядків?",
      options: ["ArrayList", "LinkedList", "HashSet", "ArrayDeque"],
      answer: 2,
      explanation: "HashSet.contains у середньому працює за O(1). У списках це O(n), бо доводиться переглядати елементи підряд."
    },
    {
      question: "Що робить counts.merge(word, 1, Integer::sum)?",
      options: [
        "Завжди встановлює 1",
        "Якщо ключа немає — кладе 1, якщо є — кладе стару_значення + 1",
        "Кидає виняток для нового ключа",
        "Об'єднує дві мапи"
      ],
      answer: 1,
      explanation: "merge — найкоротший спосіб порахувати частоти. Для нового ключа він кладе передане значення, а для наявного застосовує функцію злиття."
    },
    {
      question: "Що станеться після двох викликів термінальної операції на тому самому Stream?",
      options: [
        "Обчислення виконається двічі, як у LINQ",
        "Другий виклик поверне порожній результат",
        "IllegalStateException: stream has already been operated upon or closed",
        "Помилка компіляції"
      ],
      answer: 2,
      explanation: "Stream у Java одноразовий. Для повторного обходу треба створити новий потік з джерела, наприклад ще раз викликати list.stream()."
    },
    {
      question: "Який виклик згрупує замовлення за клієнтом і порахує кількість замовлень?",
      options: [
        "collect(toMap(Order::customer, 1))",
        "collect(groupingBy(Order::customer, counting()))",
        "collect(partitioningBy(Order::customer))",
        "map(Order::customer).count()"
      ],
      answer: 1,
      explanation: "groupingBy з downstream-колектором counting() дає Map<String, Long>."
    },
    {
      question: "Що аналогічне SelectMany з LINQ?",
      options: ["map", "flatMap", "reduce", "peek"],
      answer: 1,
      explanation: "flatMap перетворює кожен елемент на потік і «сплющує» всі ці потоки в один."
    },
    {
      question: "Чому stream.parallel().forEach(list::add) з ArrayList — помилка?",
      options: [
        "Паралельні потоки не мають forEach",
        "ArrayList не потокобезпечний: виникає гонка даних і можлива втрата елементів",
        "list::add — неправильний синтаксис",
        "Це працює коректно"
      ],
      answer: 1,
      explanation: "Паралельні потоки не повинні змінювати спільний стан. Збирайте результат колектором: collect(toList()) або toList()."
    }
  ]
};
