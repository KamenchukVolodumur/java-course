export const lab05 = {
  id: "Lab05",
  title: "Лабораторна 05: Лямбди, функціональні інтерфейси та Stream API",
  description: "Частина A: обхід дерева з колбеками, «розширення» Map, власна згортка, функції-фабрики та метод Ньютона на функціональних інтерфейсах. Частина B: музичний підсумок року — запити Stream API (фільтрація, групування, з'єднання, агрегація) до даних про прослуховування.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 05.1 «Функціональні інтерфейси й лямбди», 06.2 «Колекції», 06.3 «Stream API» · **Час:** 3 год · **Бали:** 10 (A: 5, B: 5)

\`\`\`text
src/main/java/pl/mini/functional/
├── BinaryTree.java  MapUtils.java  FunctionalUtils.java  Factories.java  Numerics.java
├── MainA.java                     (наданий)
└── wrapped/
    ├── Track.java  Play.java  Data.java   (надані)
    ├── Wrapped.java                       (ваші запити)
    └── MainB.java                         (наданий)
\`\`\`

### Правила

* Розкоментовуйте блоки \`STAGE\` у \`MainA\`/\`MainB\` по черзі. Вивід має збігатися з очікуваним.
* У частині A **заборонено** Stream API в реалізаціях (лише цикли й функціональні інтерфейси): мета — зрозуміти, що відбувається «під капотом».
* У частині B, навпаки, **заборонено** цикли \`for\`/\`while\` у методах класу \`Wrapped\`: кожен запит — один конвеєр Stream API (можна кілька послідовних).

> [!CAUTION]
> Заборонено змінювати зовнішній стан зсередини лямбд у потоках (\`forEach(list::add)\`, лічильники в масивах тощо). Результат отримуємо колекторами.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Функціональні інтерфейси

| Інтерфейс | Сигнатура |
| --- | --- |
| \`Supplier<T>\` / \`DoubleSupplier\` | \`() -> T\` |
| \`Consumer<T>\` | \`T -> void\` |
| \`Function<T,R>\` | \`T -> R\` |
| \`BiFunction<T,U,R>\` | \`(T, U) -> R\` |
| \`Predicate<T>\` | \`T -> boolean\` |
| \`BinaryOperator<T>\` | \`(T, T) -> T\` |
| \`DoubleUnaryOperator\` | \`double -> double\` |

Потрібна інша сигнатура — оголосіть власний:

\`\`\`java
@FunctionalInterface
public interface NodeVisitor<T> {
    void visit(T value, int depth);
}
\`\`\`

### Замикання

\`\`\`java
static DoubleSupplier randomInRange(Random rng, double from, double to) {
    return () -> from + rng.nextDouble() * (to - from);   // захоплено rng, from, to
}
\`\`\`

Захоплені локальні змінні мають бути **effectively final**. Об'єкт \`rng\` змінює свій стан, але саме посилання на нього не змінюється, тож так можна.

### «Методи розширення»

У Java їх немає. Еквівалент — статичний утилітний метод: \`MapUtils.addOrUpdate(map, ...)\` замість методу самої мапи.

### Stream API

\`\`\`java
Map<String, Long> playsPerArtist = plays.stream()
        .map(p -> tracks.get(p.trackId()))
        .filter(Objects::nonNull)
        .collect(Collectors.groupingBy(Track::artist, Collectors.counting()));

List<Map.Entry<String, Long>> top = playsPerArtist.entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()))
        .limit(3)
        .toList();
\`\`\`

> [!TIP]
> \`Map.Entry.<String, Long>comparingByValue().reversed()\` вимагає явних типів: без них компілятор не виведе типи для \`reversed()\`. Альтернатива — \`Comparator.comparing(Map.Entry::getValue, Comparator.reverseOrder())\`.
`
    },
    {
      title: "Частина A — очікуваний вивід",
      content: `
Так має виглядати вивід \`MainA\`, коли розкоментовано всі етапи (сам файл є у стартовому проєкті):

\`\`\`text
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
OK: похідна ≈ 0
\`\`\`
`
    },
    {
      title: "Етап A1: Обхід дерева з колбеками (1 б.)",
      content: `
\`\`\`java
public class BinaryTree<T extends Comparable<? super T>> {
    @SafeVarargs
    public static <T extends Comparable<? super T>> BinaryTree<T> of(T... values);   // вставка по черзі (BST)

    public void insert(T value);                     // менші — ліворуч, більші або рівні — праворуч
    public void depthFirst(NodeVisitor<T> pre, NodeVisitor<T> in, NodeVisitor<T> post);
    public void printInOrder();
}
\`\`\`

* \`depthFirst\` — **рекурсивний** обхід у глибину. Для кожного вузла викликається \`pre\` (до лівого піддерева), \`in\` (між піддеревами) і \`post\` (після правого). Будь-який з колбеків може бути \`null\` — тоді його пропускаємо. Глибина кореня — 0.
* \`printInOrder\` реалізуйте **через** \`depthFirst\`, передавши лише \`in\`: рядок — це \`depth * 2\` пробілів і значення.

> [!TIP]
> Один метод обходу з трьома колбеками замінює три окремі методи (preOrder, inOrder, postOrder) і будь-яку кількість обходів з різними діями. Колбеки тут виконують роль стратегій.
`
    },
    {
      title: "Етап A2: «Розширення» для Map (1 б.)",
      content: `
Клас \`MapUtils\` (final, приватний конструктор):

\`\`\`java
public static <K, V> V addOrUpdate(Map<K, V> map, K key, V addValue,
                                   BiFunction<? super K, ? super V, ? extends V> update);
public static Map<String, Integer> countWords(String text);
\`\`\`

* \`addOrUpdate\`: якщо ключа немає — кладе \`addValue\`, інакше — \`update.apply(key, old)\`. Повертає нове значення. Так само працює \`ConcurrentHashMap.compute\`.
* Реалізуйте **без** \`Map.merge\`/\`compute\` (лише \`containsKey\`, \`get\`, \`put\`), щоб зрозуміти, що ці методи роблять.
* \`countWords\`: слова — послідовності літер (\`split("[^\\\\p{L}]+")\`, порожні пропускаємо), регістр не враховується, результат — \`TreeMap\`. Використайте \`addOrUpdate\`.
`
    },
    {
      title: "Етап A3: Власна згортка (1 б.)",
      content: `
Клас \`FunctionalUtils\`:

\`\`\`java
public static <T> T reduce(Iterable<? extends T> items, T identity, BinaryOperator<T> op);
public static <T> Optional<T> reduce(Iterable<? extends T> items, BinaryOperator<T> op);
public static <T extends Comparable<? super T>> Optional<T> max(Iterable<? extends T> items);
public static <T extends Comparable<? super T>> Optional<T> min(Iterable<? extends T> items);
\`\`\`

* Друга версія \`reduce\` бере перший елемент як початкове значення, а для порожньої колекції повертає \`Optional.empty()\`.
* \`max\` і \`min\` реалізуйте **через** \`reduce\`, без власного циклу.

Аналог у Stream API — \`Stream.reduce\`. Тут **без** \`Stream\`.
`
    },
    {
      title: "Етап A4: Функції-фабрики і метод Монте-Карло (1 б.)",
      content: `
Клас \`Factories\`:

\`\`\`java
public record Point(double x, double y) { }

public static DoubleSupplier randomInRange(Random rng, double from, double to);   // рівномірно з [from, to)
public static Supplier<Point> randomPoint(Random rng, double from, double to);
public static double monteCarloPi(Supplier<Point> points, int samples);
public static double monteCarloPi(Supplier<Point> points);                        // samples = 1024
\`\`\`

* \`from >= to\` → \`IllegalArgumentException\`.
* \`randomPoint\` будуйте з \`randomInRange\` (повторне використання функції).
* \`monteCarloPi\`: генеруємо \`samples\` точок з квадрата [−1, 1)², рахуємо частку тих, що потрапили в одиничне коло (x² + y² ≤ 1), і множимо на 4. Значення за замовчуванням реалізується **перевантаженням**: у Java немає параметрів за замовчуванням.

> [!NOTE]
> Метод отримує не точки, а **джерело точок** (\`Supplier\`). Тому в тестах можна підставити детерміновану послідовність, а в production — генератор випадкових чисел.
`
    },
    {
      title: "Етап A5: Метод Ньютона (1 б.)",
      content: `
Клас \`Numerics\`:

\`\`\`java
public static DoubleUnaryOperator derivative(DoubleUnaryOperator f, double h);   // (f(x+h) − f(x−h)) / 2h
public static double newton(DoubleUnaryOperator f, DoubleUnaryOperator df,
                            double x0, double eps, int maxIter);
public static double newton(DoubleUnaryOperator f, double x0);   // df = derivative(f, 1e-6), eps = 1e-10, maxIter = 100

public static double sqrt(double a);            // корінь з x² − a = 0
public static double cubeRoot(double a);        // корінь з x³ − a = 0
public static double solveCosEqualsX();         // cos x = x, старт з x0 = 1
\`\`\`

[Метод Ньютона](https://uk.wikipedia.org/wiki/Метод_Ньютона): x₍ₙ₊₁₎ = xₙ − f(xₙ) / f′(xₙ). Зупиняємося, коли |x₍ₙ₊₁₎ − xₙ| < eps.

* |f′(xₙ)| < 1e-12 → \`ArithmeticException("похідна ≈ 0")\`.
* Немає збіжності за \`maxIter\` кроків → \`ArithmeticException("немає збіжності")\`.
* \`sqrt\`/\`cubeRoot\` для від'ємних \`a\`: \`sqrt\` → \`IllegalArgumentException\`; \`cubeRoot\` має працювати.
* Три обгортки — однорядкові: лише лямбда і виклик \`newton\`.
`
    },
    {
      title: "Частина B — дані",
      content: `
Ви будуєте свій «музичний підсумок року» з історії прослуховувань. Дані надано в \`Data.java\` як текстові блоки у форматі CSV (роздільник \`;\`, перший рядок — заголовок).

\`\`\`java
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
\`\`\`

> [!IMPORTANT]
> Трек \`T9\` у відтвореннях **відсутній** у каталозі (його видалили з сервісу). У запитах, які потребують даних треку (назва, виконавець, жанр, тривалість), такі відтворення пропускаються. Запити лише за відтвореннями (кількість, хвилини, дні) враховують їх.

`
    },
    {
      title: "Частина B — очікуваний вивід",
      content: `
Вивід \`MainB\`, коли розкоментовано всі етапи:

\`\`\`text
Відтворень: 14
Хвилин: 47.7
Різних треків: 7
Днів зі слуханням: 12
1. Night Drive — Neon Fox (4)
2. Sunrise — Aurora Lane (3)
3. Granite — Stone Echo (2)
Neon Fox: 19.5 хв
Aurora Lane: 14.3 хв
Stone Echo: 11.8 хв
Невідомих відтворень: 1
pop: 5 (38.5%)
synthwave: 5 (38.5%)
rock: 3 (23.1%)
Дослухано: 11, пропущено: 2
2025-01 | відтворень: 5 | улюблений: Neon Fox
2025-02 | відтворень: 5 | улюблений: Aurora Lane
2025-03 | відтворень: 3 | улюблений: Neon Fox
===== ПІДСУМОК 2025 =====
Хвилин музики: 47.7
Трек року: Night Drive — Neon Fox
Виконавець року: Neon Fox
Жанр року: pop
Найдовша серія: 4 дн. (2025-03-01 – 2025-03-04)
\`\`\`
`
    },
    {
      title: "Етап B1: Завантаження і перші запити (1 б.)",
      content: `
\`\`\`java
public static Map<String, Track> parseTracks(String csv);   // id -> Track, у порядку файлу (LinkedHashMap)
public static List<Play> parsePlays(String csv);

public long playCount();
public double totalMinutes();        // сума secondsPlayed / 60.0 (усі відтворення)
public long distinctTracks();        // різні trackId серед відтворень
public long listeningDays();         // різні дати
\`\`\`

* Парсинг: \`csv.lines().skip(1).filter(not(String::isBlank)).map(line -> line.split(";"))...\`.
* \`parseTracks\` — \`Collectors.toMap(Track::id, identity(), (a, b) -> a, LinkedHashMap::new)\`.
* Дата: \`LocalDate.parse(...)\` (формат ISO не потребує форматера).
`
    },
    {
      title: "Етап B2: Рейтинги (1 б.)",
      content: `
\`\`\`java
public List<String> topTracks(int n);
public Map<String, Double> topArtistsByMinutes();
\`\`\`

* \`topTracks\`: рахуємо відтворення кожного **відомого** треку, сортуємо за спаданням кількості, а за рівності — за назвою за абеткою. Рядок: \`"%d. %s — %s (%d)"\` (позиція, назва, виконавець, кількість). Позиції нумеруйте через \`IntStream.range(0, list.size())\`.
* \`topArtistsByMinutes\`: сума \`secondsPlayed\` за виконавцем (лише відомі треки) у хвилинах, за спаданням. Результат — \`LinkedHashMap\`, щоб зберегти порядок.

> [!TIP]
> «З'єднання» (join) двох наборів даних у Stream API — це звичайний \`map(p -> tracks.get(p.trackId()))\` по мапі-індексу. Окремого оператора join у Stream API немає, а будувати власний join зазвичай і не потрібно.
`
    },
    {
      title: "Етап B3: Жанри і дослуховування (1 б.)",
      content: `
\`\`\`java
public long unknownPlays();                 // відтворення треків, яких немає в каталозі
public List<String> genreShare();           // "жанр: N (P%)"
public Map<Boolean, Long> completion();     // true — secondsPlayed >= durationSec
\`\`\`

* \`genreShare\`: частка від кількості **відомих** відтворень, відсотки з одним знаком після коми (\`Locale.ROOT\`). Сортування — за спаданням кількості, далі за назвою жанру.
* \`completion\`: \`Collectors.partitioningBy(..., Collectors.counting())\`, лише відомі треки.
`
    },
    {
      title: "Етап B4: Помісячна статистика (1 б.)",
      content: `
\`\`\`java
public List<String> monthly();
\`\`\`

Для кожного місяця (\`YearMonth.from(date)\`), **за зростанням** (групування в \`TreeMap\`) і лише для відомих треків:

* кількість відтворень;
* улюблений виконавець — той, кого слухали найбільше **секунд** у цьому місяці.

Формат: \`"2025-01 | відтворень: 5 | улюблений: Neon Fox"\`.

> [!TIP]
> Знадобиться вкладене групування: \`groupingBy(month, TreeMap::new, groupingBy(artist, summingInt(...)))\`, а для кожного місяця — пошук максимуму в внутрішній мапі. Кількість відтворень можна отримати \`collectingAndThen\` або другим простим запитом.
`
    },
    {
      title: "Етап B5: Підсумковий звіт (1 б.)",
      content: `
\`\`\`java
public String report(int year);
\`\`\`

Збирає попередні запити в підсумок року (див. очікуваний вивід). Кожен рядок завершується \`\\n\` (\`%n\` не використовуйте: на Windows він дає \`\\r\\n\`).

* **Трек року** — перший у \`topTracks\`.
* **Виконавець року** — перший у \`topArtistsByMinutes\`.
* **Жанр року** — перший у \`genreShare\` (лише назва).
* **Найдовша серія** — найдовша послідовність **днів поспіль** зі слуханням (усі відтворення, зокрема невідомі). За рівної довжини береться найраніша серія.

Серію знайти «чистим» конвеєром складно, бо стан переходить від елемента до елемента. Дозволено один із двох підходів:

1. Відсортувати дати і пройти їх через \`reduce\`/власний колектор, що зберігає поточну й найкращу серію в незмінному record.
2. Ключ серії: \`date.toEpochDay() − індекс\` (індекс у відсортованому списку дат) однаковий для днів однієї серії. Групуйте за ним!

> [!NOTE]
> Другий трюк дуже корисний: послідовні дні мінус послідовні індекси дають однакову різницю. Цим прийомом розв'язують задачу «серій» і в SQL.

Закомітьте, позначте тегом \`lab05\` і запуште.
`
    },
    {
      title: "Додатково (без балів)",
      content: `
* Перепишіть \`topArtistsByMinutes\` з \`parallelStream()\` і поясніть, чому результат той самий, а \`forEach\` з паралельного потоку виводив би рядки в довільному порядку.
* Додайте «тиждень року»: тиждень (\`IsoFields.WEEK_OF_WEEK_BASED_YEAR\`) з найбільшою кількістю хвилин.
* Згенеруйте 1 000 000 випадкових відтворень і порівняйте час \`stream()\` та \`parallelStream()\` для B2.
`
    }
  ],
  quiz: [
    {
      question: "Чому DoubleSupplier, повернутий з randomInRange, може використовувати параметр from після завершення методу?",
      options: [
        "Бо from — статичне поле",
        "Бо лямбда захоплює (копіює) значення effectively final змінних: це замикання",
        "Бо Java зберігає стек методу",
        "Не може, це помилка"
      ],
      answer: 1,
      explanation: "Значення захоплених локальних змінних копіюються в об'єкт лямбди. Тому вони мають бути effectively final."
    },
    {
      question: "Як у Java задати «параметр за замовчуванням» samples = 1024 для monteCarloPi?",
      options: [
        "int samples = 1024 у сигнатурі",
        "Перевантажити метод: версія без samples викликає версію з 1024",
        "Анотацією @Default(1024)",
        "Через Optional<Integer>"
      ],
      answer: 1,
      explanation: "У Java немає параметрів за замовчуванням і іменованих аргументів. Їх замінюють перевантаженнями або патерном Builder."
    },
    {
      question: "Який колектор розділить відтворення на дві групи: дослухані й пропущені?",
      options: [
        "groupingBy(Play::date)",
        "partitioningBy(предикат, counting())",
        "toMap(...)",
        "joining()"
      ],
      answer: 1,
      explanation: "partitioningBy завжди повертає мапу з двома ключами (true і false), навіть якщо одна з груп порожня."
    },
    {
      question: "Чому date.toEpochDay() − індекс однаковий для днів однієї серії поспіль?",
      options: [
        "Це збіг",
        "У серії і дата, і індекс у відсортованому списку зростають рівно на 1, тому різниця стала; після розриву дата «стрибає» сильніше за індекс",
        "toEpochDay завжди повертає 0",
        "Через часові зони"
      ],
      answer: 1,
      explanation: "Цей класичний прийом «gaps and islands» перетворює пошук серій на звичайне групування."
    }
  ]
};
