export const lecture02 = {
  id: "02",
  title: "Лекція 02: Основи мови, пам'ять JVM і класи",
  description: "Стек і купа, передавання параметрів, рядки та String Pool, масиви, керувальні інструкції та switch-вирази, контракт Object (equals/hashCode/toString), класи, наслідування, поліморфізм, абстрактні класи, інтерфейси й records.",
  sections: [
    {
      title: "1. Стек і купа. Передавання параметрів",
      content: `
JVM використовує дві основні області пам'яті для даних програми:

1. **Stack (стек)** — окремий для кожного потоку. Кожен виклик методу створює **кадр стеку** (stack frame) з локальними змінними і параметрами, а після повернення з методу кадр зникає. Тут лежать значення примітивів і **посилання** на об'єкти.
2. **Heap (купа)** — спільна для всіх потоків. Тут живуть **усі об'єкти й масиви**, створені через \`new\`. Купою керує збирач сміття.

### Java завжди передає параметри за значенням

Це класичне питання на співбесіді. Правильна відповідь: **завжди за значенням**. Для об'єктів таким значенням є **посилання**, тож у метод потрапляє копія адреси.

* ✅ Через скопійоване посилання можна **змінити стан** об'єкта в купі.
* ❌ Присвоєння параметру нового об'єкта **не змінює** змінну того, хто викликав метод.

\`\`\`java
public class MemoryExample {
    public static void main(String[] args) {
        int age = 25;
        List<String> list = new ArrayList<>();
        list.add("Junior");

        modify(age, list);

        System.out.println(age);   // 25: змінилася лише копія
        System.out.println(list);  // [Junior, Mid]: об'єкт у купі той самий
    }

    static void modify(int ageCopy, List<String> listCopy) {
        ageCopy = 99;                 // змінює лише локальну копію
        listCopy.add("Mid");          // змінює спільний об'єкт
        listCopy = new ArrayList<>(); // перенаправляє лише локальне посилання
        listCopy.add("Senior");       // main() цього не побачить
    }
}
\`\`\`

> [!NOTE]
> У C# є \`ref\`, \`out\` та \`in\`. У Java їх **немає**. Щоб повернути кілька значень, повертайте record, масив або об'єкт-обгортку.
`
    },
    {
      title: "2. Рядки: String, незмінність, String Pool, StringBuilder",
      content: `
\`java.lang.String\` — **незмінний** (immutable) рядок. З Java 9 він усередині зберігає \`byte[]\` (компактні рядки: Latin-1 по 1 байту на символ, інакше UTF-16).

### Чому String незмінний

1. **Потокобезпечність** — його можна передавати між потоками без синхронізації.
2. **Ключі в HashMap** — хеш рядка не зміниться після вставки (і кешується в полі \`hash\`).
3. **Безпека** — шлях до файлу або URL не зміниться після перевірки.
4. **String Pool** — однакові літерали можна безпечно використовувати спільно.

\`\`\`java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");   // примусово новий об'єкт

System.out.println(s1 == s2);          // true: той самий об'єкт з пулу
System.out.println(s1 == s3);          // false: різні об'єкти
System.out.println(s1.equals(s3));     // true: однаковий вміст
System.out.println(s1 == s3.intern()); // true: intern() повертає об'єкт з пулу
\`\`\`

> [!CAUTION]
> Рядки **завжди** порівнюйте через \`equals()\` (або \`equalsIgnoreCase()\`). На відміну від C#, оператор \`==\` для \`String\` порівнює **посилання**, а не вміст.

### Корисні методи

\`\`\`java
String s = "  Hello, World  ";
s.trim();                  // "Hello, World"
s.strip();                 // те саме, але враховує Unicode-пробіли
s.isBlank();               // false
s.length();                // 16
s.charAt(2);               // 'H'
s.toUpperCase();           // "  HELLO, WORLD  "
s.contains("World");       // true
s.indexOf('o');            // 6
s.substring(2, 7);         // "Hello"
s.replace("World", "Java");
"a,b,,c".split(",");       // ["a", "b", "", "c"]
String.join("-", "a", "b", "c");      // "a-b-c"
"ab".repeat(3);            // "ababab"
"line1\\nline2".lines().count();       // 2
\`\`\`

### Форматування

\`\`\`java
String msg = String.format("%-10s|%5d|%8.2f", "Anna", 42, 3.14159);
// "Anna      |   42|    3.14"
String msg2 = "Привіт, %s! Тобі %d років.".formatted("Ола", 20);
System.out.printf("%05d%n", 42);    // 00042; %n — перенос рядка для поточної ОС
\`\`\`

| Специфікатор | Значення |
| --- | --- |
| \`%s\` | рядок (викликає \`toString()\`) |
| \`%d\` | ціле число |
| \`%f\`, \`%.2f\` | дробове число, 2 знаки після коми |
| \`%x\` | шістнадцяткове |
| \`%,d\` | з розділювачем тисяч |
| \`%-10s\` / \`%10s\` | вирівнювання ліворуч / праворуч до 10 символів |

### Text blocks (Java 15+)

Аналог raw string literals у C#:

\`\`\`java
String json = """
    {
        "name": "Anna",
        "age": 20
    }
    """;   // спільний відступ обрізається автоматично
\`\`\`

### StringBuilder

Кожна «зміна» рядка створює новий об'єкт, тому \`s += x\` у циклі має складність O(n²).

\`\`\`java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i).append(',');
}
sb.setLength(sb.length() - 1);  // прибрати останню кому
sb.insert(0, "[").append("]");
sb.reverse();
String result = sb.toString();
\`\`\`

* **\`StringBuilder\`** — несинхронізований і швидкий. Беріть його в 99% випадків.
* **\`StringBuffer\`** — синхронізований, legacy.
`
    },
    {
      title: "3. Масиви",
      content: `
Масив у Java — це об'єкт **фіксованого розміру**, який знає свою довжину (поле \`length\`, а не метод).

\`\`\`java
int[] numbers = new int[5];              // [0, 0, 0, 0, 0]
int[] primes = {2, 3, 5, 7, 11};
String[] names = new String[3];          // [null, null, null]
System.out.println(primes.length);       // 5
primes[10] = 1;                          // ArrayIndexOutOfBoundsException

int[][] matrix = new int[3][4];          // масив масивів
int[][] jagged = { {1, 2}, {3, 4, 5}, {6} };
\`\`\`

> [!NOTE]
> У Java немає прямокутних багатовимірних масивів \`int[,]\`, як у C#. \`int[][]\` — це завжди масив посилань на окремі масиви (jagged array).

### Як масиви лежать у пам'яті

* **\`int[]\`** — один суцільний блок чисел. Доступ дуже швидкий, бо дані гарно лягають у кеш процесора.
* **\`String[]\` / \`Point[]\`** — масив **посилань**, а самі об'єкти розкидані по купі. Кожен доступ — це додатковий перехід за посиланням і потенційний cache miss.

### Клас Arrays

\`\`\`java
int[] a = {5, 3, 1, 4};
Arrays.sort(a);                              // [1, 3, 4, 5]
Arrays.binarySearch(a, 4);                   // 2
Arrays.toString(a);                          // "[1, 3, 4, 5]"
Arrays.deepToString(new int[][]{{1}, {2}});  // "[[1], [2]]"
Arrays.fill(a, 7);                           // [7, 7, 7, 7]
int[] copy = Arrays.copyOf(a, 6);            // [7, 7, 7, 7, 0, 0]
int[] part = Arrays.copyOfRange(a, 1, 3);    // [7, 7]
Arrays.equals(a, copy);                      // порівняння вмісту
System.arraycopy(a, 0, copy, 0, a.length);   // найшвидше копіювання
List<String> list = Arrays.asList("x", "y"); // список фіксованого розміру
\`\`\`

> [!WARNING]
> \`a.equals(b)\` для масивів порівнює **посилання**, а \`a.toString()\` дає щось на кшталт \`[I@1b6d3586\`. Використовуйте \`Arrays.equals\` і \`Arrays.toString\`.
`
    },
    {
      title: "4. Керувальні інструкції та switch-вирази",
      content: `
\`\`\`java
if (score > 90) { grade = 'A'; }
else if (score > 80) { grade = 'B'; }
else { grade = 'C'; }

String status = age >= 18 ? "дорослий" : "неповнолітній";

for (int i = 0; i < n; i++) { }
for (String name : names) { }      // for-each: масиви і будь-який Iterable
while (cond) { }
do { } while (cond);               // виконається хоча б раз
\`\`\`

### Мітки (labels) для break/continue

\`\`\`java
outer:
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (i * j > 6) break outer;      // виходить з обох циклів
        if (j > i) continue outer;       // наступна ітерація зовнішнього циклу
    }
}
\`\`\`

### Класичний switch і switch-вираз (Java 14+)

Класичний \`switch\` має **fall-through**: без \`break\` виконання «провалюється» в наступний \`case\`. У C# це помилка компіляції, а в Java — тиха пастка.

\`\`\`java
switch (day) {
    case SATURDAY:
    case SUNDAY:
        System.out.println("вихідний");
        break;                 // забули break — виконається й наступна гілка
    default:
        System.out.println("робочий");
}
\`\`\`

Сучасний варіант — **switch-вираз** зі стрілками. Він повертає значення, не має fall-through і вимагає **вичерпності** (для enum і sealed-типів — без \`default\`):

\`\`\`java
int letters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> {
        System.out.println("середа");
        yield 9;               // повернення значення з блоку
    }
};
\`\`\`

Від Java 21 \`switch\` уміє зіставляти **за типом** (pattern matching, див. лекцію 08):

\`\`\`java
String describe(Object o) {
    return switch (o) {
        case null -> "null";
        case Integer i when i > 0 -> "додатне ціле " + i;
        case Integer i -> "ціле " + i;
        case String s -> "рядок довжини " + s.length();
        default -> "щось інше";
    };
}
\`\`\`
`
    },
    {
      title: "5. Класи: поля, конструктори, static, порядок ініціалізації",
      content: `
\`\`\`java
public class Account {
    private static int counter = 0;      // одне поле на весь клас
    private final int id;                // final: присвоюється рівно один раз
    private String owner;
    private double balance;

    public Account(String owner) {
        this(owner, 0.0);                // виклик іншого конструктора: має бути першим
    }

    public Account(String owner, double initial) {
        this.id = ++counter;
        this.owner = owner;
        this.balance = initial;
    }

    public static int created() { return counter; }  // статичний метод

    public double getBalance() { return balance; }   // getter, у Java немає властивостей
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("сума має бути > 0");
        balance += amount;
    }
}
\`\`\`

* Якщо не оголошено жодного конструктора, компілятор додає конструктор без параметрів.
* Поля без ініціалізації отримують значення за замовчуванням (\`0\`, \`false\`, \`null\`). **Локальні** змінні значень за замовчуванням не мають: читання неініціалізованої змінної — помилка компіляції.
* **У Java немає властивостей** (\`{ get; set; }\`) — їх замінюють методи \`getX()/setX()\`, а для незмінних даних — records.

### Порядок ініціалізації

\`\`\`java
class Demo {
    static { System.out.println("1. статичний блок (один раз, при завантаженні класу)"); }
    { System.out.println("2. блок ініціалізації екземпляра"); }
    private int x = initX();   // ініціалізатори полів і блоки виконуються в порядку оголошення
    Demo() { System.out.println("4. тіло конструктора"); }
    int initX() { System.out.println("3. ініціалізатор поля"); return 1; }
}
\`\`\`

Під час наслідування спочатку повністю ініціалізується батьківська частина (\`super(...)\`), а вже потім поля і тіло конструктора дочірнього класу.

> [!CAUTION]
> Не викликайте в конструкторі методи, які може перевизначити підклас. Перевизначений метод виконається до ініціалізації полів підкласу і побачить там \`null\` або \`0\`.
`
    },
    {
      title: "6. Клас Object: equals, hashCode, toString",
      content: `
Усі класи неявно наслідують \`java.lang.Object\`. Його ключові методи:

| Метод | За замовчуванням | Коли перевизначати |
| --- | --- | --- |
| \`equals(Object)\` | \`this == o\` (тотожність) | для класів-значень (DTO, ключі) |
| \`hashCode()\` | залежить від ідентичності об'єкта | **завжди разом з equals** |
| \`toString()\` | \`ClassName@1b6d3586\` | майже завжди, для налагодження |
| \`getClass()\` | клас об'єкта під час виконання | (final) |

### Контракт equals

1. **Рефлексивність**: \`a.equals(a)\`.
2. **Симетричність**: \`a.equals(b)\` ⇔ \`b.equals(a)\`.
3. **Транзитивність**: \`a.equals(b) && b.equals(c)\` ⇒ \`a.equals(c)\`.
4. **Узгодженість**: повторні виклики дають той самий результат.
5. \`a.equals(null) == false\`.

> [!CAUTION]
> **Золоте правило:** якщо \`a.equals(b)\`, то \`a.hashCode() == b.hashCode()\`. Порушите його — і \`HashSet.contains\` та \`HashMap.get\` «не знайдуть» об'єкт, який там точно є.

\`\`\`java
public final class Point {
    private final int x, y;

    public Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);    // 31 * (31 + x) + y
    }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}
\`\`\`

> [!WARNING]
> Не змінюйте поля, від яких залежить \`hashCode()\`, коли об'єкт уже лежить у \`HashSet\` або є ключем \`HashMap\`. Об'єкт «загубиться» в неправильному кошику. Найпростіше — робити такі класи незмінними.
`
    },
    {
      title: "7. Наслідування та поліморфізм",
      content: `
Клас може наслідувати **лише один** клас (\`extends\`), але реалізовувати багато інтерфейсів (\`implements\`).

\`\`\`java
public class Animal {
    protected final String name;
    public Animal(String name) { this.name = name; }
    public String sound() { return "..."; }
    public final String describe() { return name + " каже " + sound(); }
}

public class Dog extends Animal {
    public Dog(String name) { super(name); }   // виклик конструктора батька

    @Override
    public String sound() { return "Гав!"; }
}

Animal a = new Dog("Рекс");
System.out.println(a.describe());   // "Рекс каже Гав!"
\`\`\`

### Ключова відмінність від C#: методи віртуальні за замовчуванням

| | C# | Java |
| --- | --- | --- |
| Віртуальний метод | потрібно \`virtual\` | **усі** нестатичні не-private методи |
| Перевизначення | \`override\` (обов'язково) | \`@Override\` (анотація, рекомендовано) |
| Заборонити перевизначення | \`sealed override\` | \`final\` |
| Приховування методу | \`new\` | немає (лише для static) |
| Виклик базової реалізації | \`base.M()\` | \`super.m()\` |

> [!TIP]
> Завжди ставте \`@Override\`. Якщо ви помилитеся в сигнатурі (наприклад, напишете \`equals(Point p)\` замість \`equals(Object o)\`), компілятор це помітить. Без анотації ви тихо створите **перевантаження**, а не перевизначення.

### Динамічна диспетчеризація

Під час виклику \`a.sound()\` JVM дивиться на **фактичний** тип об'єкта (Dog), а не на тип змінної (Animal). Для цього кожен клас має **таблицю віртуальних методів (vtable)**. Перевантаження (overloading), навпаки, вибирається **під час компіляції** за статичним типом аргументів.

\`\`\`java
static void print(Object o) { System.out.println("Object"); }
static void print(String s) { System.out.println("String"); }

Object x = "hello";
print(x);    // "Object": перевантаження обирається за статичним типом!
\`\`\`
`
    },
    {
      title: "8. Абстрактні класи та інтерфейси",
      content: `
### Абстрактний клас

Може мати стан (поля), конструктори та реалізовані методи, але створити його екземпляр не можна.

\`\`\`java
public abstract class Shape {
    private final String name;
    protected Shape(String name) { this.name = name; }

    public abstract double area();       // підклас мусить реалізувати

    @Override
    public String toString() {
        return "%s(площа=%.2f)".formatted(name, area());
    }
}

public class Circle extends Shape {
    private final double r;
    public Circle(double r) { super("Коло"); this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
}
\`\`\`

### Інтерфейс

Контракт без стану екземпляра. Може містити:

* абстрактні методи (неявно \`public abstract\`);
* \`default\`-методи з реалізацією (Java 8+);
* \`static\`-методи;
* \`private\`-методи (Java 9+) як допоміжні для default-методів;
* константи (неявно \`public static final\`).

\`\`\`java
public interface Playable {
    int MAX_VOLUME = 100;

    void play();

    default void playTwice() { play(); play(); }

    static Playable silent() { return () -> { }; }
}
\`\`\`

| Ознака | Абстрактний клас | Інтерфейс |
| --- | --- | --- |
| Стан (поля) | будь-які | лише константи |
| Конструктор | є | немає |
| Скільки можна успадкувати | один | багато |
| Модифікатори методів | будь-які | public (або private-допоміжні) |
| Семантика | «є різновидом» (is-a) | «уміє» (can-do) |

> [!NOTE]
> Якщо клас отримує однаковий default-метод із двох інтерфейсів, компілятор вимагає перевизначити його явно. Вибрати одну з реалізацій можна так: \`A.super.method()\`.
`
    },
    {
      title: "9. Перевантаження, varargs і records",
      content: `
### Перевантаження методів

Методи з однаковою назвою, але різними **списками параметрів**. Тип результату в розрізненні **не бере участі**.

\`\`\`java
int sum(int a, int b) { return a + b; }
double sum(double a, double b) { return a + b; }
// long sum(int a, int b) { ... }  // ПОМИЛКА: відрізняється лише тип результату
\`\`\`

У Java **немає параметрів за замовчуванням і іменованих аргументів**, як у C#. Їх замінюють перевантаженнями (телескопічні конструктори) або патерном Builder.

### Varargs

\`\`\`java
static int sum(String label, int... nums) {   // varargs — завжди останній параметр
    int total = 0;
    for (int n : nums) total += n;            // nums має тип int[]
    System.out.println(label + ": " + total);
    return total;
}

sum("A", 1, 2, 3);
sum("B");                    // nums = порожній масив
sum("C", new int[]{4, 5});   // можна передати масив напряму
\`\`\`

### Records (Java 16+)

Незмінний носій даних. Аналог \`record\` у C#.

\`\`\`java
public record Product(String name, BigDecimal price) {
    public Product {                       // компактний конструктор: валідація
        Objects.requireNonNull(name, "name");
        if (price.signum() < 0) throw new IllegalArgumentException("ціна < 0");
    }

    public Product withPrice(BigDecimal newPrice) {   // "with" вручну
        return new Product(name, newPrice);
    }
}

var p = new Product("Кава", new BigDecimal("12.50"));
p.name();          // аксесор називається name(), а не getName()
System.out.println(p);  // Product[name=Кава, price=12.50]
\`\`\`

Компілятор генерує:

1. \`final\`-клас, який наслідує \`java.lang.Record\`;
2. \`private final\`-поля і канонічний конструктор;
3. аксесори \`name()\`, \`price()\`;
4. \`equals\`, \`hashCode\` і \`toString\` за всіма компонентами.

> [!WARNING]
> Record незмінний лише **поверхнево**. Якщо компонент має тип \`List<String>\`, сам список можна змінити. Робіть захисну копію в компактному конструкторі: \`items = List.copyOf(items);\`.
`
    }
  ],
  quiz: [
    {
      question: "Метод отримує List<String> list і викликає list.add(\"x\"). Чому зміна видна в місці виклику, хоча Java передає параметри за значенням?",
      options: [
        "Бо об'єкти в Java передаються за посиланням",
        "Бо скопійоване значення — це адреса того самого об'єкта в купі",
        "Бо колекції мають спеціальний механізм синхронізації",
        "Зміна не буде видна"
      ],
      answer: 1,
      explanation: "Копіюється посилання, тому обидві змінні вказують на той самий об'єкт. А от присвоєння list = new ArrayList<>() всередині методу вже не вплине на змінну в місці виклику."
    },
    {
      question: "Що виведе: String a = \"hi\"; String b = new String(\"hi\"); System.out.println(a == b);",
      options: [
        "true",
        "false",
        "Помилка компіляції",
        "Залежить від JVM"
      ],
      answer: 1,
      explanation: "new String створює окремий об'єкт поза пулом. Оператор == порівнює посилання, тому результат false. Вміст рядків порівнюють через equals()."
    },
    {
      question: "Що станеться, якщо перевизначити equals(), але не hashCode()?",
      options: [
        "Нічого, hashCode не пов'язаний з equals",
        "Помилка компіляції",
        "HashSet і HashMap працюватимуть некоректно: рівні об'єкти потраплять у різні кошики",
        "toString() перестане працювати"
      ],
      answer: 2,
      explanation: "Хеш-колекції спочатку шукають кошик за hashCode, а вже потім порівнюють через equals. Рівні об'єкти з різними хешами туди просто не дійдуть."
    },
    {
      question: "Чим методи в Java відрізняються від методів у C# щодо віртуальності?",
      options: [
        "У Java всі нестатичні, не-private і не-final методи віртуальні за замовчуванням",
        "У Java потрібно писати virtual",
        "У Java немає поліморфізму",
        "Нічим"
      ],
      answer: 0,
      explanation: "У Java немає ключового слова virtual: перевизначити можна будь-який нестатичний, не-private і не-final метод. Заборонити перевизначення можна через final."
    },
    {
      question: "Object x = \"hello\"; маємо перевантаження print(Object) і print(String). Яке буде викликано для print(x)?",
      options: [
        "print(String), бо об'єкт насправді є рядком",
        "print(Object), бо перевантаження обирається за статичним типом під час компіляції",
        "Помилка компіляції через неоднозначність",
        "Обидва"
      ],
      answer: 1,
      explanation: "Перевантаження (overloading) обирається статично, а перевизначення (overriding) — динамічно. Статичний тип x — Object."
    },
    {
      question: "Яка перевага switch-виразу (case X ->) порівняно з класичним switch?",
      options: [
        "Він швидший",
        "Немає fall-through, він повертає значення і перевіряє вичерпність",
        "Він працює лише з рядками",
        "Він потребує break у кожній гілці"
      ],
      answer: 1,
      explanation: "Стрілкові гілки не «провалюються», switch можна використати як вираз, а для enum і sealed-типів компілятор перевіряє, що оброблено всі варіанти."
    }
  ]
};
