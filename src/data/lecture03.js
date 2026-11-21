export const lecture03 = {
  id: "03",
  title: "Лекція 03: Модифікатори доступу, enum, вкладені типи, generics та ітератори",
  description: "Рівні видимості в Java, повноцінні enum-класи, чотири види вкладених класів, узагальнені типи (обмеження, wildcards, PECS, стирання типів), sealed-ієрархії, Optional і власні ітератори.",
  sections: [
    {
      title: "1. Модифікатори доступу",
      content: `
Java має чотири рівні видимості (три ключові слова плюс рівень за замовчуванням):

| Модифікатор | Клас | Пакет | Підклас (інший пакет) | Усі |
| --- | --- | --- | --- | --- |
| \`public\` | ✅ | ✅ | ✅ | ✅ |
| \`protected\` | ✅ | ✅ | ✅ | ❌ |
| *(без модифікатора)* package-private | ✅ | ✅ | ❌ | ❌ |
| \`private\` | ✅ | ❌ | ❌ | ❌ |

### Відмінності від C#

* Немає \`internal\`. Найближчий аналог — **package-private** (видимість у межах пакета), а на рівні «збірки» — **модулі JPMS** (лекція 07), які експортують лише вибрані пакети.
* \`protected\` у Java **ширший**, ніж у C#: член видно ще й **усьому пакету**, а не лише підкласам.
* Модифікатор за замовчуванням для членів класу — package-private (у C# — \`private\`). Члени інтерфейсу за замовчуванням \`public\`.
* Верхньорівневий клас може бути лише \`public\` або package-private. В одному файлі може бути лише один \`public\`-клас, і його назва має збігатися з назвою файлу.

> [!TIP]
> Правило: починайте з \`private\` і розширюйте видимість лише тоді, коли це справді потрібно. Поля майже завжди \`private\`.
`
    },
    {
      title: "2. Enum — повноцінні класи",
      content: `
У C# \`enum\` — це просто іменовані цілі числа. У Java \`enum\` — **повноцінний клас**, який неявно наслідує \`java.lang.Enum\`. Кожна константа — єдиний екземпляр (singleton) цього класу. Enum може мати поля, конструктори, методи й реалізовувати інтерфейси.

\`\`\`java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);     // крапка з комою, якщо далі йдуть члени

    private static final double G = 6.67300E-11;
    private final double mass;
    private final double radius;

    Planet(double mass, double radius) {   // конструктор завжди private
        this.mass = mass;
        this.radius = radius;
    }

    public double surfaceGravity() {
        return G * mass / (radius * radius);
    }
}

for (Planet p : Planet.values()) {
    System.out.printf("%s: %.2f%n", p, p.surfaceGravity());
}
\`\`\`

### Вбудовані методи

\`\`\`java
Planet.values();              // масив усіх констант
Planet.valueOf("EARTH");      // EARTH; для невідомої назви IllegalArgumentException
Planet.EARTH.name();          // "EARTH"
Planet.EARTH.ordinal();       // 2: позиція (не використовуйте як «значення»!)
Planet.EARTH.compareTo(Planet.VENUS);   // порівняння за ordinal
\`\`\`

### Поведінка для кожної константи

\`\`\`java
public enum Operation {
    PLUS("+") {
        public int apply(int a, int b) { return a + b; }
    },
    TIMES("*") {
        public int apply(int a, int b) { return a * b; }
    };

    private final String symbol;
    Operation(String symbol) { this.symbol = symbol; }
    public abstract int apply(int a, int b);
    @Override public String toString() { return symbol; }
}
\`\`\`

### EnumSet і EnumMap

Спеціалізовані дуже швидкі колекції (усередині — бітова маска або масив):

\`\`\`java
EnumSet<DayOfWeek> weekend = EnumSet.of(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);
EnumSet<DayOfWeek> workdays = EnumSet.complementOf(weekend);

EnumMap<Planet, String> notes = new EnumMap<>(Planet.class);
notes.put(Planet.EARTH, "дім");
\`\`\`

> [!NOTE]
> Замість \`[Flags]\` з C# у Java використовують \`EnumSet\`: це типобезпечно і так само ефективно.
`
    },
    {
      title: "3. Вкладені класи: static nested, inner, local, anonymous",
      content: `
Клас, оголошений усередині іншого класу, буває чотирьох видів:

| Вид | Оголошення | Доступ до екземпляра зовнішнього класу |
| --- | --- | --- |
| Static nested | \`static class X\` у тілі класу | ❌ (як вкладений клас у C#) |
| Inner (внутрішній) | \`class X\` у тілі класу | ✅ через неявне \`Outer.this\` |
| Local | клас усередині методу | ✅ + effectively final локальні змінні |
| Anonymous | \`new Interface() { ... }\` | ✅ + effectively final локальні змінні |

\`\`\`java
public class Outer {
    private String secret = "таємниця";

    public static class StaticNested {
        void print() {
            // System.out.println(secret);   // ПОМИЛКА: немає екземпляра Outer
        }
    }

    public class Inner {
        void print() {
            System.out.println(secret);      // OK: Outer.this.secret
        }
    }

    void demo() {
        Inner in = new Inner();              // всередині Outer
        Runnable r = new Runnable() {        // анонімний клас
            @Override public void run() { System.out.println(secret); }
        };
        r.run();
    }
}

Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();      // ззовні: потрібен екземпляр Outer
Outer.StaticNested nested = new Outer.StaticNested();
\`\`\`

> [!IMPORTANT]
> Вкладений клас у C# за поведінкою відповідає **static nested** у Java. Якщо внутрішньому класу не потрібен доступ до зовнішнього екземпляра, оголошуйте його \`static\`. Inner-клас тримає приховане посилання на зовнішній об'єкт, а це може спричинити витік пам'яті.

### Effectively final

Локальні й анонімні класи (а також лямбди) можуть читати лише локальні змінні, які **не змінюються** після ініціалізації:

\`\`\`java
int counter = 0;
Runnable r = () -> System.out.println(counter);  // OK
// counter++;   // тепер counter не effectively final, і рядок вище перестане компілюватися
\`\`\`
`
    },
    {
      title: "4. Generics: класи, методи, обмеження",
      content: `
Узагальнені типи параметризують класи й методи типом:

\`\`\`java
public class Box<T> {
    private T value;
    public Box(T value) { this.value = value; }
    public T get() { return value; }
    public <R> Box<R> map(Function<? super T, ? extends R> f) {   // узагальнений метод
        return new Box<>(f.apply(value));
    }
}

Box<String> b = new Box<>("abc");        // diamond <> — виведення типу
Box<Integer> len = b.map(String::length);

public record Pair<A, B>(A first, B second) { }
var p = new Pair<>("x", 1);              // Pair<String, Integer>
\`\`\`

### Узагальнені методи

\`\`\`java
public static <T> void swap(T[] arr, int i, int j) {
    T tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
}

Collections.<String>emptyList();   // явне задання типу (рідко потрібне)
\`\`\`

### Обмеження (bounds)

Аналог \`where T : IComparable<T>\` з C#:

\`\`\`java
public static <T extends Comparable<? super T>> T max(List<T> list) {
    T best = list.get(0);
    for (T x : list) if (x.compareTo(best) > 0) best = x;
    return best;
}

// кілька обмежень: клас (якщо є) — першим, далі інтерфейси через &
public static <T extends Number & Comparable<T>> T clampMax(T a, T b) { ... }
\`\`\`
`
    },
    {
      title: "5. Wildcards і правило PECS",
      content: `
Generics у Java **інваріантні**: \`List<Integer>\` **не є** підтипом \`List<Number>\`, хоча \`Integer\` є підтипом \`Number\`. Інакше можна було б покласти \`Double\` у список цілих чисел.

\`\`\`java
List<Integer> ints = new ArrayList<>();
// List<Number> nums = ints;    // ПОМИЛКА КОМПІЛЯЦІЇ
\`\`\`

Гнучкість дають **wildcards** (у C# аналог — \`out T\`/\`in T\`, але там варіантність оголошують на рівні інтерфейсу, а в Java — у місці використання):

* **\`? extends T\`** — «T або будь-який підтип». З такої колекції можна **читати** як \`T\`, але не можна додавати.
* **\`? super T\`** — «T або будь-який надтип». У неї можна **додавати** \`T\`, а читаються елементи лише як \`Object\`.
* **\`?\`** — будь-який тип, лише читання як \`Object\`.

**PECS: Producer Extends, Consumer Super.**

\`\`\`java
// producer: лише читаємо
static double sum(Collection<? extends Number> nums) {
    double s = 0;
    for (Number n : nums) s += n.doubleValue();
    return s;
}

// consumer: лише записуємо
static void fill(List<? super Integer> out, int n) {
    for (int i = 0; i < n; i++) out.add(i);
}

// обидва одночасно: так влаштований Collections.copy
static <T> void copy(List<? super T> dst, List<? extends T> src) {
    for (int i = 0; i < src.size(); i++) dst.set(i, src.get(i));
}

sum(List.of(1, 2, 3));          // List<Integer> підходить
sum(List.of(1.5, 2.5));         // List<Double> підходить
List<Object> objs = new ArrayList<>();
fill(objs, 3);                  // List<Object> підходить як споживач Integer
\`\`\`
`
    },
    {
      title: "6. Стирання типів (type erasure) і його наслідки",
      content: `
Generics у Java реалізовано через **стирання типів**: компілятор перевіряє типи, а в байт-коді параметри замінюються на \`Object\` (або на верхню межу), і в потрібних місцях вставляються приведення типів. Так зроблено заради сумісності з кодом до Java 5.

У C# generics **реифіковані**: \`List<int>\` і \`List<string>\` — різні типи під час виконання. У Java під час виконання є лише \`List\`.

### Що через це неможливо

\`\`\`java
class Container<T> {
    // T obj = new T();                 // ПОМИЛКА: тип T невідомий під час виконання
    // T[] arr = new T[10];              // ПОМИЛКА: не можна створити масив T
    // static T shared;                  // ПОМИЛКА: static не має доступу до T
    // if (x instanceof List<String>)    // ПОМИЛКА: інформацію стерто
}
// List<int>                             // ПОМИЛКА: примітиви не можуть бути параметрами типу
\`\`\`

### Обхідні шляхи

\`\`\`java
// передати Class<T> (type token) або фабрику
class Repository<T> {
    private final Class<T> type;
    private final Supplier<T> factory;
    Repository(Class<T> type, Supplier<T> factory) {
        this.type = type;
        this.factory = factory;
    }
    T create() { return factory.get(); }
    boolean accepts(Object o) { return type.isInstance(o); }
}

var repo = new Repository<>(StringBuilder.class, StringBuilder::new);

// масив T — через Object[] і приведення (так зроблено в ArrayList)
@SuppressWarnings("unchecked")
T[] arr = (T[]) new Object[10];
\`\`\`

> [!WARNING]
> **Сирі типи (raw types)** — \`List\` без параметра — залишилися лише для сумісності. Вони вимикають перевірку типів, і помилка проявиться як \`ClassCastException\` далеко від місця, де її зроблено. Не використовуйте їх.
`
    },
    {
      title: "7. Sealed-класи (Java 17)",
      content: `
\`sealed\` дозволяє явно перелічити, які класи можуть наслідувати тип. Це закрита ієрархія, на якій switch може перевірити вичерпність:

\`\`\`java
public sealed interface Shape permits Circle, Square, Rectangle { }

public record Circle(double r) implements Shape { }
public record Square(double side) implements Shape { }
public non-sealed class Rectangle implements Shape { }   // відкрита гілка

double area(Shape s) {
    return switch (s) {          // default не потрібен: компілятор знає всі варіанти
        case Circle c -> Math.PI * c.r() * c.r();
        case Square q -> q.side() * q.side();
        case Rectangle r -> 0;
    };
}
\`\`\`

Підкласи sealed-типу мають бути \`final\` (records — завжди final), \`sealed\` або \`non-sealed\`. Якщо додати новий варіант, кожен switch без нього перестане компілюватися. Це дуже зручно для моделювання доменних станів (алгебраїчні типи даних).
`
    },
    {
      title: "8. null і Optional",
      content: `
На відміну від C# з nullable reference types, у Java компілятор **не відстежує** \`null\`: будь-яке посилання може бути \`null\`.

### Optional<T>

Контейнер, який або містить значення, або порожній. Його призначення — **тип результату методу**, який може нічого не повернути:

\`\`\`java
Optional<User> findByEmail(String email) {
    return Optional.ofNullable(users.get(email));
}

String name = findByEmail("a@b.pl")
        .map(User::name)                 // перетворення, якщо значення є
        .filter(n -> !n.isBlank())
        .orElse("гість");               // значення за замовчуванням

User u = findByEmail(email)
        .orElseThrow(() -> new NoSuchElementException("Немає користувача " + email));

findByEmail(email).ifPresentOrElse(
        user -> System.out.println("Вітаю, " + user.name()),
        () -> System.out.println("Не знайдено"));
\`\`\`

| Метод | Коли значення немає |
| --- | --- |
| \`orElse(x)\` | повертає \`x\` (обчислюється **завжди**) |
| \`orElseGet(() -> x)\` | обчислює \`x\` лише коли значення немає |
| \`orElseThrow()\` | \`NoSuchElementException\` |
| \`get()\` | теж кидає виняток; уникайте |

> [!WARNING]
> Антипатерни: \`Optional\` як поле класу чи параметр методу, \`Optional<List<T>>\` (повертайте порожній список), \`if (opt.isPresent()) opt.get()\` (це той самий null-check, тільки довший), \`Optional.of(null)\` (NPE).

### Перевірки на null

\`\`\`java
this.name = Objects.requireNonNull(name, "name не може бути null");
String safe = Objects.requireNonNullElse(input, "default");
Objects.equals(a, b);       // null-безпечне порівняння
\`\`\`

Анотації \`@Nullable\`/\`@NonNull\` (JSpecify, JetBrains) нічого не роблять під час виконання, але дозволяють IDE та статичним аналізаторам попереджати про можливий NPE.
`
    },
    {
      title: "9. Iterable та Iterator",
      content: `
Будь-що, що реалізує \`Iterable<T>\`, можна обходити циклом for-each. Аналоги в C#: \`IEnumerable<T>\` і \`IEnumerator<T>\`.

\`\`\`java
public interface Iterable<T> {
    Iterator<T> iterator();
}

public interface Iterator<T> {
    boolean hasNext();
    T next();                         // NoSuchElementException, якщо елементів немає
    default void remove() { throw new UnsupportedOperationException(); }
}
\`\`\`

for-each — це синтаксичний цукор:

\`\`\`java
for (String s : list) { body(s); }
// компілюється в:
for (Iterator<String> it = list.iterator(); it.hasNext(); ) {
    String s = it.next();
    body(s);
}
\`\`\`

### Власна колекція

\`\`\`java
public class Range implements Iterable<Integer> {
    private final int from, to, step;

    public Range(int from, int to, int step) {
        if (step <= 0) throw new IllegalArgumentException("step > 0");
        this.from = from; this.to = to; this.step = step;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            private int current = from;

            @Override public boolean hasNext() { return current < to; }

            @Override public Integer next() {
                if (!hasNext()) throw new NoSuchElementException();
                int value = current;
                current += step;
                return value;
            }
        };
    }
}

for (int x : new Range(0, 10, 3)) System.out.print(x + " ");   // 0 3 6 9
\`\`\`

> [!NOTE]
> У Java **немає \`yield return\`**. Стан ітератора доводиться зберігати вручну в полях, як у прикладі вище. Для ліниво обчислюваних послідовностей часто зручніший Stream API (лекція 05): \`Stream.iterate(0, x -> x < 10, x -> x + 3)\`.

### Fail-fast ітератори

Якщо змінити колекцію під час обходу не через сам ітератор, наступний \`next()\` кине \`ConcurrentModificationException\`:

\`\`\`java
for (String s : list) {
    if (s.isEmpty()) list.remove(s);    // ConcurrentModificationException
}

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().isEmpty()) it.remove();   // правильно
}
list.removeIf(String::isEmpty);             // ще краще
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Чим inner class відрізняється від static nested class?",
      options: [
        "Inner class має доступ до нестатичних членів екземпляра зовнішнього класу через Outer.this, а static nested — ні",
        "Static nested class наслідує зовнішній клас",
        "Inner class можна оголосити лише в інтерфейсі",
        "Нічим"
      ],
      answer: 0,
      explanation: "Inner class прив'язаний до екземпляра зовнішнього класу і тримає на нього приховане посилання. Static nested поводиться як звичайний клас, так само як вкладений клас у C#."
    },
    {
      question: "Що таке стирання типів (type erasure)?",
      options: [
        "Видалення невикористовуваних класів збирачем сміття",
        "Компілятор перевіряє generics, а в байт-коді параметри типів замінює на Object або на верхню межу",
        "Перетворення примітивів на обгортки",
        "Оптимізація JIT"
      ],
      answer: 1,
      explanation: "Під час виконання List<String> і List<Integer> — це той самий клас List. Тому не можна написати new T(), new T[] чи instanceof List<String>."
    },
    {
      question: "Метод лише читає числа з колекції. Який тип параметра найгнучкіший?",
      options: [
        "List<Number>",
        "Collection<? super Number>",
        "Collection<? extends Number>",
        "List<Object>"
      ],
      answer: 2,
      explanation: "PECS: колекція постачає (producer) значення, тому використовуємо extends. Тоді підійдуть List<Integer>, Set<Double> тощо."
    },
    {
      question: "Чим enum у Java відрізняється від enum у C#?",
      options: [
        "Нічим, це іменовані числа",
        "Enum у Java — повноцінний клас: може мати поля, конструктори, методи й реалізовувати інтерфейси",
        "Enum у Java не можна використовувати у switch",
        "Константи enum у Java змінювані"
      ],
      answer: 1,
      explanation: "Кожна константа — це єдиний екземпляр класу, який наслідує java.lang.Enum. Можна навіть задати окрему реалізацію методу для кожної константи."
    },
    {
      question: "Що з наведеного є антипатерном використання Optional?",
      options: [
        "Optional як тип результату методу find...",
        "optional.map(...).orElse(...)",
        "Optional як поле класу або параметр методу",
        "optional.orElseThrow()"
      ],
      answer: 2,
      explanation: "Optional призначений для результатів методів. Як поле чи параметр він лише ускладнює код і додає ще один можливий null."
    },
    {
      question: "Що станеться, якщо в циклі for-each по ArrayList викликати list.remove(x)?",
      options: [
        "Елемент тихо видалиться",
        "ConcurrentModificationException на наступному кроці ітерації",
        "Помилка компіляції",
        "Цикл почнеться спочатку"
      ],
      answer: 1,
      explanation: "Ітератори стандартних колекцій fail-fast. Видаляйте через iterator.remove() або removeIf()."
    }
  ]
};
