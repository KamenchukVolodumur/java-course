export const lecture04 = {
  id: "04",
  title: "Лекція 04: Лямбди, функціональні інтерфейси, події та винятки",
  description: "Функціональні інтерфейси як аналог делегатів C#, лямбда-вирази і замикання, посилання на методи, композиція функцій, Comparable/Comparator, події через слухачів, а також система винятків Java: checked і unchecked, try-with-resources, власні винятки.",
  sections: [
    {
      title: "1. Функціональні інтерфейси — «делегати» Java",
      content: `
У C# є окремий вид типів — **делегати** (\`Func<T,R>\`, \`Action<T>\`, \`Predicate<T>\`). У Java делегатів немає. Їхню роль виконують **функціональні інтерфейси**: інтерфейси з **рівно одним абстрактним методом** (SAM — Single Abstract Method). Будь-яку лямбду компілятор перетворює на реалізацію такого інтерфейсу.

\`\`\`java
@FunctionalInterface            // необов'язково, але компілятор перевірить, що метод один
public interface Validator<T> {
    boolean validate(T value);

    default Validator<T> and(Validator<T> other) {    // default-методи дозволені
        return v -> validate(v) && other.validate(v);
    }
}

Validator<String> notEmpty = s -> !s.isEmpty();
Validator<String> shortStr = s -> s.length() < 10;
System.out.println(notEmpty.and(shortStr).validate("Java"));  // true
\`\`\`

### Стандартні інтерфейси з java.util.function

| Java | Сигнатура | Аналог у C# |
| --- | --- | --- |
| \`Supplier<T>\` | \`() -> T\` | \`Func<T>\` |
| \`Consumer<T>\` | \`T -> void\` | \`Action<T>\` |
| \`BiConsumer<T,U>\` | \`(T, U) -> void\` | \`Action<T,U>\` |
| \`Function<T,R>\` | \`T -> R\` | \`Func<T,R>\` |
| \`BiFunction<T,U,R>\` | \`(T, U) -> R\` | \`Func<T,U,R>\` |
| \`Predicate<T>\` | \`T -> boolean\` | \`Predicate<T>\` / \`Func<T,bool>\` |
| \`UnaryOperator<T>\` | \`T -> T\` | \`Func<T,T>\` |
| \`BinaryOperator<T>\` | \`(T, T) -> T\` | \`Func<T,T,T>\` |
| \`Runnable\` | \`() -> void\` | \`Action\` |
| \`Callable<V>\` | \`() -> V\` + throws | \`Func<V>\` |
| \`Comparator<T>\` | \`(T, T) -> int\` | \`Comparison<T>\` |

Є також **примітивні спеціалізації**, які не потребують boxing: \`IntPredicate\`, \`IntFunction<R>\`, \`ToIntFunction<T>\`, \`IntUnaryOperator\`, \`DoubleUnaryOperator\`, \`IntBinaryOperator\`, \`LongSupplier\` тощо.

> [!NOTE]
> У Java немає типу функції з трьома і більше параметрами (\`Func<T1,T2,T3,R>\`). Потрібен такий — оголосіть власний \`@FunctionalInterface\`.

> [!WARNING]
> У Java **немає multicast-делегатів** (\`+=\`/\`-=\`). Щоб викликати кілька обробників, зберігайте їх у списку (див. розділ про події).
`
    },
    {
      title: "2. Лямбда-вирази та замикання",
      content: `
\`\`\`java
Runnable r = () -> System.out.println("без параметрів");
Function<Integer, Integer> sq = x -> x * x;             // один параметр, без дужок
BinaryOperator<Integer> add = (a, b) -> a + b;
Comparator<String> byLen = (String a, String b) -> Integer.compare(a.length(), b.length());
BiFunction<Integer, Integer, Integer> safeDiv = (a, b) -> {
    if (b == 0) return 0;                               // блокове тіло потребує return
    return a / b;
};
\`\`\`

У Java стрілка \`->\`, а не \`=>\`, як у C#. Тип лямбди визначає **цільовий тип** (target type): та сама лямбда \`x -> x * 2\` може бути \`Function<Integer,Integer>\` або \`IntUnaryOperator\`, залежно від контексту.

### Замикання: лише effectively final

Лямбда може читати локальні змінні, але лише ті, які **не змінюються** після ініціалізації (effectively final). Це головна відмінність від C#, де змінні захоплюються «за посиланням» і можуть змінюватися.

\`\`\`java
int base = 10;
Function<Integer, Integer> addBase = x -> x + base;   // OK
// base = 20;     // тепер лямбда вище не скомпілюється

int counter = 0;
// list.forEach(x -> counter++);   // ПОМИЛКА: counter не effectively final
\`\`\`

Чому так: лямбда може пережити метод і виконатися в іншому потоці, а локальні змінні живуть на стеку, який уже зник. Тому Java **копіює** значення в лямбду і забороняє змінювати оригінал, щоб копія та оригінал не розходилися.

Обхідні шляхи (краще їх уникати):

\`\`\`java
int[] box = {0};                               // масив з одного елемента
AtomicInteger cnt = new AtomicInteger();       // потокобезпечно
list.forEach(x -> cnt.incrementAndGet());
long better = list.stream().count();           // найкраще: без побічних ефектів
\`\`\`

> [!TIP]
> Поля класу (\`this.field\`) лямбда змінювати **може**, бо захоплюється \`this\`, а не саме поле. Проте спільний змінюваний стан — головне джерело помилок у багатопотоковому коді.

### Пастка з циклом із C# тут неможлива

\`\`\`java
List<Runnable> actions = new ArrayList<>();
for (int i = 0; i < 3; i++) {
    // actions.add(() -> System.out.println(i));   // ПОМИЛКА: i змінюється
    int copy = i;
    actions.add(() -> System.out.println(copy));   // 0, 1, 2
}
for (String s : List.of("a", "b")) {
    actions.add(() -> System.out.println(s));      // OK: s — нова змінна в кожній ітерації
}
\`\`\`
`
    },
    {
      title: "3. Посилання на методи і композиція функцій",
      content: `
Якщо лямбда лише викликає існуючий метод, її можна замінити **посиланням на метод** (\`::\`):

| Вид | Приклад | Еквівалентна лямбда |
| --- | --- | --- |
| Статичний метод | \`Integer::parseInt\` | \`s -> Integer.parseInt(s)\` |
| Метод конкретного об'єкта | \`System.out::println\` | \`x -> System.out.println(x)\` |
| Метод довільного об'єкта типу | \`String::toUpperCase\` | \`s -> s.toUpperCase()\` |
| Конструктор | \`ArrayList::new\` | \`() -> new ArrayList<>()\` |
| Конструктор масиву | \`int[]::new\` | \`n -> new int[n]\` |

\`\`\`java
List<String> names = List.of("anna", "bob");
names.stream().map(String::toUpperCase).forEach(System.out::println);

Function<String, Integer> parse = Integer::parseInt;
BiFunction<String, String, Boolean> eq = String::equals;   // (a, b) -> a.equals(b)
Supplier<List<String>> mk = ArrayList::new;
\`\`\`

### Композиція

Стандартні інтерфейси мають default-методи для побудови нових функцій:

\`\`\`java
Function<Integer, Integer> plus2 = x -> x + 2;
Function<Integer, Integer> times3 = x -> x * 3;
plus2.andThen(times3).apply(1);    // (1 + 2) * 3 = 9
plus2.compose(times3).apply(1);    // 1 * 3 + 2 = 5
Function.<Integer>identity();      // x -> x

Predicate<String> empty = String::isEmpty;
Predicate<String> notEmpty = empty.negate();
Predicate<String> ok = notEmpty.and(s -> s.length() < 5).or(s -> s.equals("*"));
Predicate.not(String::isBlank);    // зручно у filter(...)
\`\`\`

### Функції, що повертають функції

\`\`\`java
static Supplier<Double> randomIn(double from, double to) {
    Random rng = new Random();
    return () -> from + rng.nextDouble() * (to - from);
}

static DoubleUnaryOperator derivative(DoubleUnaryOperator f, double h) {
    return x -> (f.applyAsDouble(x + h) - f.applyAsDouble(x - h)) / (2 * h);
}

DoubleUnaryOperator cube = x -> x * x * x;
System.out.println(derivative(cube, 1e-5).applyAsDouble(2));   // ≈ 12.0
\`\`\`
`
    },
    {
      title: "4. Comparable і Comparator",
      content: `
### Comparable<T> — природний порядок

Аналог \`IComparable<T>\` з C#. Його використовують \`Collections.sort\`, \`TreeMap\`, \`TreeSet\` і \`stream.sorted()\`.

\`\`\`java
public record Student(String name, double gpa, int year) implements Comparable<Student> {
    @Override
    public int compareTo(Student o) {
        return Double.compare(o.gpa, this.gpa);    // за спаданням середнього балу
    }
}
\`\`\`

> [!CAUTION]
> Не пишіть \`return this.x - o.x;\`: при великих значеннях виникне переповнення і знак результату буде неправильним. Використовуйте \`Integer.compare\`, \`Double.compare\`.

### Comparator<T> — зовнішній порядок

\`\`\`java
List<Student> list = new ArrayList<>(students);

list.sort(Comparator.comparing(Student::name));
list.sort(Comparator.comparingDouble(Student::gpa).reversed());
list.sort(Comparator.comparingInt(Student::year)
        .thenComparing(Student::name)
        .thenComparing(Student::gpa, Comparator.reverseOrder()));

// null-безпечний порядок
list.sort(Comparator.comparing(Student::name, Comparator.nullsLast(Comparator.naturalOrder())));

// без урахування регістру
names.sort(String.CASE_INSENSITIVE_ORDER);
\`\`\`

> [!NOTE]
> Узгодженість з equals: якщо \`compareTo\` повертає 0 для об'єктів, які не рівні за \`equals\`, то \`TreeSet\` вважатиме їх дублікатами, і один з них «зникне».
`
    },
    {
      title: "5. Події та слухачі (замість event у C#)",
      content: `
У C# є ключове слово \`event\` і оператори \`+=\`/\`-=\`. У Java подій на рівні мови немає. Використовують патерн **Observer (Listener)**: список обробників, оформлених як функціональні інтерфейси.

\`\`\`java
public record PriceChanged(String symbol, double oldPrice, double newPrice) { }

@FunctionalInterface
public interface PriceListener {
    void onPriceChanged(PriceChanged event);
}

public class Stock {
    private final String symbol;
    private double price;
    private final List<PriceListener> listeners = new CopyOnWriteArrayList<>();

    public Stock(String symbol, double price) { this.symbol = symbol; this.price = price; }

    public void addListener(PriceListener l)    { listeners.add(l); }     // "+="
    public void removeListener(PriceListener l) { listeners.remove(l); }  // "-="

    public void setPrice(double newPrice) {
        if (newPrice == price) return;
        var event = new PriceChanged(symbol, price, newPrice);
        price = newPrice;
        for (PriceListener l : listeners) l.onPriceChanged(event);        // "raise"
    }
}

Stock s = new Stock("ACME", 10);
PriceListener logger = e -> System.out.printf("%s: %.2f -> %.2f%n",
        e.symbol(), e.oldPrice(), e.newPrice());
s.addListener(logger);
s.addListener(e -> { if (e.newPrice() > 100) System.out.println("Продавай!"); });
s.setPrice(12);     // ACME: 10.00 -> 12.00
s.removeListener(logger);
\`\`\`

* \`CopyOnWriteArrayList\` дозволяє обробнику відписатися прямо під час розсилки, не спричинивши \`ConcurrentModificationException\`.
* Відписуватися можна лише **тим самим об'єктом**: дві однакові за текстом лямбди — різні об'єкти. Тому слухача, якого треба буде видалити, зберігайте в змінній.

> [!WARNING]
> Забутий слухач тримає посилання на об'єкт-підписник, і той ніколи не буде зібраний GC. Це найпоширеніший витік пам'яті в GUI-застосунках.
`
    },
    {
      title: "6. Чого в Java немає: extension methods, кортежі, перевантаження операторів",
      content: `
| C# | Java |
| --- | --- |
| Extension methods (\`this T x\`) | статичні методи в утилітних класах: \`Collections.max(list)\`, \`StringUtils.reverse(s)\` |
| Кортежі \`(int, string)\` | \`record Pair(int a, String b)\` — оголошується в один рядок, навіть локально в методі |
| Перевантаження операторів | немає: \`a.add(b)\`, \`a.compareTo(b)\`, \`a.equals(b)\` (див. \`BigDecimal\`) |
| \`out\`/\`ref\`-параметри | повернення record або об'єкта |
| Властивості \`{ get; set; }\` | getter/setter або records |
| Параметри за замовчуванням | перевантаження або Builder |

\`\`\`java
// "розширення" — звичайний статичний метод
public final class StringUtils {
    private StringUtils() { }                       // утилітний клас: без екземплярів
    public static String reverse(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}

// "кортеж" — локальний record
List<String> words = List.of("a", "bb", "ccc");
record WordLen(String word, int len) { }
var pairs = words.stream().map(w -> new WordLen(w, w.length())).toList();
\`\`\`
`
    },
    {
      title: "7. Винятки: ієрархія, checked і unchecked",
      content: `
\`\`\`text
Throwable
├── Error                      збої JVM: OutOfMemoryError, StackOverflowError (не ловимо)
└── Exception                  checked: компілятор вимагає обробки
    ├── IOException, SQLException, InterruptedException, ...
    └── RuntimeException       unchecked: обробка необов'язкова
        ├── NullPointerException
        ├── IllegalArgumentException, IllegalStateException
        ├── IndexOutOfBoundsException, ArithmeticException
        └── UnsupportedOperationException, ClassCastException, ...
\`\`\`

### Checked exceptions — унікальна риса Java

Якщо метод може кинути **checked**-виняток, він мусить або обробити його, або оголосити в сигнатурі (\`throws\`). У C# такої вимоги немає: там усі винятки unchecked.

\`\`\`java
public String readFirstLine(Path p) throws IOException {   // оголошуємо
    try (BufferedReader r = Files.newBufferedReader(p)) {
        return r.readLine();
    }
}

void caller() {
    try {
        readFirstLine(Path.of("data.txt"));
    } catch (NoSuchFileException e) {          // спочатку конкретніший тип
        System.err.println("Немає файлу: " + e.getFile());
    } catch (IOException e) {
        throw new UncheckedIOException(e);     // загорнути в unchecked
    } finally {
        System.out.println("виконається завжди");
    }
}
\`\`\`

### Multi-catch і повторне кидання

\`\`\`java
try {
    risky();
} catch (IOException | SQLException e) {        // один обробник для кількох типів
    log.error("Помилка доступу до даних", e);
    throw new DataAccessException("Не вдалося завантажити", e);   // зберігаємо cause!
}
\`\`\`

### Коли що кидати

| Ситуація | Виняток |
| --- | --- |
| Неправильний аргумент | \`IllegalArgumentException\` |
| Об'єкт у неправильному стані для операції | \`IllegalStateException\` |
| Обов'язковий аргумент null | \`NullPointerException\` (через \`Objects.requireNonNull\`) |
| Індекс поза межами | \`IndexOutOfBoundsException\` |
| Операція не підтримується | \`UnsupportedOperationException\` |
| Зовнішній ресурс (файл, мережа), який можна обробити | checked (\`IOException\`) |

> [!CAUTION]
> Ніколи не пишіть \`catch (Exception e) { }\`: так помилки тихо зникають. Мінімум — залогувати; краще — обробити або загорнути й кинути далі з причиною (\`cause\`).

### Checked-винятки і лямбди

Стандартні функціональні інтерфейси не оголошують \`throws\`, тому в \`map(...)\` не можна просто викликати метод, що кидає \`IOException\`:

\`\`\`java
paths.stream()
     .map(p -> {
         try { return Files.readString(p); }
         catch (IOException e) { throw new UncheckedIOException(e); }
     })
     .toList();
\`\`\`
`
    },
    {
      title: "8. Власні винятки і try-with-resources",
      content: `
\`\`\`java
// unchecked — порушення бізнес-правил, помилки програміста
public class InsufficientFundsException extends RuntimeException {
    private final BigDecimal missing;

    public InsufficientFundsException(BigDecimal missing) {
        super("Бракує коштів: " + missing);
        this.missing = missing;
    }

    public BigDecimal getMissing() { return missing; }
}

// checked — ситуація, яку викликач реально може обробити
public class ConfigNotFoundException extends Exception {
    public ConfigNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
\`\`\`

### try-with-resources

Аналог \`using\` у C#. Будь-який об'єкт, що реалізує \`AutoCloseable\`, буде закритий автоматично, навіть якщо в блоці виникне виняток. Ресурси закриваються у **зворотному** порядку.

\`\`\`java
try (var in = new FileInputStream("a.bin");
     var out = new FileOutputStream("b.bin")) {
    in.transferTo(out);
}   // спочатку out.close(), потім in.close()
\`\`\`

Якщо виняток виник і в тілі, і в \`close()\`, то основним лишається виняток з тіла, а виняток з \`close()\` додається як **suppressed**: \`e.getSuppressed()\`.

Детально про \`AutoCloseable\` — у лекції 07.
`
    }
  ],
  quiz: [
    {
      question: "Що в Java відповідає делегату Func<string, int> з C#?",
      options: [
        "Supplier<String>",
        "Function<String, Integer>",
        "Consumer<String>",
        "BiFunction<String, Integer>"
      ],
      answer: 1,
      explanation: "Function<T,R> приймає T і повертає R. Supplier нічого не приймає, а Consumer нічого не повертає."
    },
    {
      question: "Чому цей код не скомпілюється: int c = 0; list.forEach(x -> c++);",
      options: [
        "forEach не приймає лямбд",
        "Лямбда може захоплювати лише effectively final локальні змінні",
        "c++ не можна використовувати з int",
        "Потрібно написати x => c++"
      ],
      answer: 1,
      explanation: "Java копіює значення захоплених локальних змінних у лямбду, тому забороняє їх змінювати. Використайте count(), AtomicInteger або поле класу."
    },
    {
      question: "Що поверне plus2.andThen(times3).apply(1), де plus2 = x -> x + 2, times3 = x -> x * 3?",
      options: ["5", "9", "6", "7"],
      answer: 1,
      explanation: "andThen спочатку застосовує plus2 (1 + 2 = 3), а потім times3 (3 * 3 = 9). compose виконує функції у зворотному порядку."
    },
    {
      question: "Чим checked-винятки відрізняються від unchecked?",
      options: [
        "Checked-винятки компілятор вимагає обробити або оголосити в throws; unchecked (RuntimeException) — ні",
        "Unchecked-винятки не можна перехопити",
        "Checked-винятки кидає лише JVM",
        "Різниці немає"
      ],
      answer: 0,
      explanation: "Підкласи Exception, крім RuntimeException, є checked. У C# такого механізму немає взагалі."
    },
    {
      question: "Як у Java реалізують аналог event з C#?",
      options: [
        "Ключовим словом event",
        "Оператором += на методах",
        "Списком слухачів (функціональних інтерфейсів) і методами add/removeListener",
        "Через анотацію @Event"
      ],
      answer: 2,
      explanation: "Це патерн Observer. Обробник — функціональний інтерфейс, тож підписатися можна лямбдою."
    },
    {
      question: "Який компаратор сортує студентів за роком, а за однакового року — за ім'ям?",
      options: [
        "Comparator.comparing(Student::name).thenComparing(Student::year)",
        "Comparator.comparingInt(Student::year).thenComparing(Student::name)",
        "Comparator.comparingInt(Student::year).reversed()",
        "(a, b) -> a.year() - b.name()"
      ],
      answer: 1,
      explanation: "Перший критерій задає comparing, а thenComparing використовується лише за рівності першого критерію."
    }
  ]
};
