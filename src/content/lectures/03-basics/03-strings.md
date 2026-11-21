---
title: Рядки
description: Клас String: незмінність, String Pool і порівняння, створення і довжина, StringBuilder, основні методи, екранування, текстові блоки, форматування рядків.
---

## Тип String

`java.lang.String` — клас, що зберігає послідовність символів. Як і `char`, логічно він складається з кодових одиниць **UTF-16**. Від Java 9 усередині використовується `byte[]` з **компактним** представленням: рядки, що містять лише символи Latin-1, займають 1 байт на символ, решта — 2 байти.

Рядок — **незмінний** (immutable): операції, які нібито його змінюють, насправді створюють новий об'єкт. Незмінність дає JVM низку оптимізацій: рядки можна безпечно використовувати спільно між потоками, кешувати їхній хеш (`hashCode` обчислюється один раз), а однакові літерали — зберігати в одному екземплярі.

```java
String txt = "Hello, ";
String txt2 = txt + "World!";            // "Hello, World!"

// txt2.charAt(5) = '?';                 // ПОМИЛКА: рядок незмінний
String txt3 = txt2.replace(',', '?');    // "Hello? World!"
System.out.println(txt2.toUpperCase());  // "HELLO, WORLD!"
System.out.println(txt2);                // "Hello, World!" — оригінал не змінився
```

## Порівняння рядків і String Pool

`String` — посилальний тип, тож оператор `==` порівнює **посилання**, а не вміст. Вміст порівнюють методами:

```java
String option = readOption();
if (option.equals("first")) { }              // вміст, з урахуванням регістру
if ("first".equals(option)) { }              // безпечно, навіть якщо option == null
if (option.equalsIgnoreCase("FIRST")) { }
int order = "apple".compareTo("banana");     // < 0: лексикографічний порядок
Objects.equals(a, b);                        // null-безпечне порівняння
```

Чому ж `==` іноді «працює»? JVM зберігає рядкові **літерали** в спеціальній таблиці — **String Pool**. Однакові літерали у всій програмі вказують на той самий об'єкт. Рядки, створені під час виконання, у пул не потрапляють.

```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");           // примусово новий об'єкт
String s4 = "Ja" + "va";                  // константа часу компіляції -> той самий літерал
String part = "Ja";
String s5 = part + "va";                  // обчислюється під час виконання -> новий об'єкт

System.out.println(s1 == s2);             // true
System.out.println(s1 == s3);             // false
System.out.println(s1 == s4);             // true
System.out.println(s1 == s5);             // false
System.out.println(s1 == s5.intern());    // true: intern() повертає екземпляр з пулу
System.out.println(s1.equals(s5));        // true
```

> [!CAUTION]
> Порівняння рядків через `==` — одна з найчастіших помилок у Java. Код може «працювати» з літералами й ламатися з рядками, прочитаними з файлу чи мережі. Завжди використовуйте `equals`.

## Створення рядків і довжина

Рядок створюється літералом або конструктором. Конкатенація виконується оператором `+`; якщо один з операндів — рядок, інший перетворюється на рядок через `String.valueOf` (тобто `toString()`). Доступ до символу дає метод `charAt` (лише читання), довжину — метод `length()`.

```java
char[] chars = {'w', 'o', 'r', 'l', 'd'};
String fromLiteral = "Hello";
String fromArray = new String(chars);
String fromSubArray = new String(chars, 1, 2);    // "or"
String repeated = " ".repeat(4);                   // "    "
String concatenated = fromLiteral + ' ' + fromArray;
System.out.println(concatenated);                  // Hello world
System.out.println("довжина: " + concatenated.length());   // 11
char space = concatenated.charAt(5);
char[] back = concatenated.toCharArray();          // копія символів

System.out.println(1 + 2 + "3");    // "33": спершу 1 + 2 = 3 (числа), потім "3" + "3"
System.out.println("1" + 2 + 3);    // "123": зліва направо, вже рядок
```

`String.valueOf(null)` для посилання повертає `"null"`, тому `"x" + null` дає `"xnull"` без винятку.

## Змінювані рядки: StringBuilder

Оскільки рядки незмінні, кожна «модифікація» (наприклад, `s += x` у циклі) означає:

1. створення нового об'єкта;
2. копіювання вмісту старого рядка й дописування;
3. старий об'єкт лишається збирачеві сміття.

У циклі з n ітерацій це дає складність O(n²).

Клас **`StringBuilder`** — змінювана версія рядка з внутрішнім буфером, що автоматично розширюється. Методи `append`, `insert`, `delete`, `replace`, `reverse`, `setCharAt` змінюють наявний буфер замість створення сотень нових об'єктів. Результат отримують методом `toString()`.

```java
StringBuilder sb = new StringBuilder("Hello, ");
sb.append("this is ")
  .append("a simple ")
  .append("StringBuilder demo.");          // методи повертають this -> ланцюжок
sb.insert(0, ">> ");
sb.setCharAt(3, 'h');
System.out.println(sb);                    // >> hello, this is a simple StringBuilder demo.

StringBuilder csv = new StringBuilder();
for (int i = 0; i < 5; i++) {
    if (!csv.isEmpty()) csv.append(',');
    csv.append(i);
}
System.out.println(csv);                   // 0,1,2,3,4
```

> [!NOTE]
> Конкатенацію в **одному виразі** (`a + b + c`) компілятор оптимізує сам (від Java 9 — через `invokedynamic` і `StringConcatFactory`), тож там `StringBuilder` не потрібен. Він потрібен, коли рядок збирається **в циклі**. `StringBuffer` — синхронізована версія з Java 1.0; у новому коді її не використовують.

## Основні методи

Стандартна бібліотека надає великий набір методів для роботи з рядками:

```java
String example = "Showcasing Java strings";

String sub = example.substring(11, 15);            // "Java": [початок, кінець)
boolean contains = example.contains("Java");       // true
int idx = example.indexOf('a');                    // 5
int last = example.lastIndexOf("s");               // 22
boolean starts = example.startsWith("Show");       // true
String replaced = example.replace("Showcasing", "Demo of");
String upper = example.toUpperCase();
String[] words = example.split(" ");               // ["Showcasing", "Java", "strings"]
String joined = String.join(", ", words);          // "Showcasing, Java, strings"

"  text\t".trim();             // "text": прибирає символи <= ' '
"\u2003text ".strip();         // "text": враховує Unicode-пробіли
"   ".isBlank();               // true
"".isEmpty();                  // true
"a\nb\nc".lines().count();     // 3
"abc".chars().sum();           // сума кодів символів (IntStream)
"Ab".compareToIgnoreCase("aB");// 0
"x".repeat(3);                 // "xxx"
```

> [!WARNING]
> `split` приймає **регулярний вираз**: `"a.b.c".split(".")` поверне порожній масив, бо крапка означає «будь-який символ». Правильно: `split("\\.")` або `split(Pattern.quote("."))`. Крім того, порожні елементи в кінці відкидаються: `"a,b,,".split(",")` дає `["a", "b"]`. Щоб їх зберегти, передайте другий аргумент `-1`.

Повний перелік методів — у [документації класу String](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html).

## Екранування символів

У рядкових і символьних літералах спеціальні символи записують через `\`:

| Послідовність | Значення |
| --- | --- |
| `\n` | перенос рядка |
| `\t` | табуляція |
| `\r` | повернення каретки |
| `\"`, `\'` | лапки |
| `\\` | зворотна скісна риска |
| `\u00A9` | символ Unicode за кодом |
| `\s` | пробіл (Java 15+, зручно в текстових блоках) |

Окремих «сирих» рядків на кшталт `r"..."` у Java немає, тож шляхи Windows і регулярні вирази доводиться екранувати: `"C:\\Users\\anna\\Documents"`, `"\\d+\\.\\d+"`. Для шляхів зручніше використовувати `/`, який Java приймає і на Windows, або `Path.of("C:", "Users", "anna")`.

## Текстові блоки (Java 15)

Текстовий блок починається з трьох лапок `"""` і **переносу рядка**, а закінчується трьома лапками. Усередині не треба екранувати лапки й переноси. Спільний відступ усіх рядків (визначається найменш відступленим рядком, зокрема закривальними `"""`) автоматично відкидається, а пробіли в кінці рядків видаляються. Тому вміст можна гарно вирівнювати в коді.

```java
String json = """
        {
            "name": "Anna",
            "langs": ["Java", "Kotlin"]
        }
        """;                       // закінчується переносом рядка

String sql = """
        SELECT id, name
        FROM users
        WHERE age > ?""";          // без переносу рядка в кінці

String poem = """
        My pensive SARA ! thy soft cheek reclined \
        Thus on mine arm,\s
        most soothing sweet it is""";
// \ в кінці рядка — продовження без переносу; \s — пробіл, який не буде обрізано
```

Escape-послідовності в текстових блоках працюють так само, як у звичайних рядках. Три лапки всередині пишуть як `\"""`.

## Форматування рядків

У Java немає інтерполяції рядків (`"Привіт, {name}"`). Для форматування використовують `String.format`, метод екземпляра `formatted` (Java 15) і `printf`. Специфікатор має вигляд `%[індекс$][прапорці][ширина][.точність]перетворення`.

```java
String author = "George Orwell";
String book = "Nineteen Eighty-Four";
int year = 1949;
BigDecimal price = new BigDecimal("19.50");

String description = "%s is the author of %s.%nThe price is %.2f zł, published in %d."
        .formatted(author, book, price, year);
System.out.println(description);

System.out.printf("Number 1: %10.2f|%n", 1.0);       // вирівнювання праворуч до ширини 10
System.out.printf("Number 2: %-10.2f|%n", 12.5);     // ліворуч
System.out.printf("%,d%n", 1234567);                 // 1,234,567 (залежить від локалі)
System.out.printf("%08.3f%n", Math.PI);              // 0003.142
System.out.printf("%x %X %o%n", 255, 255, 8);        // ff FF 10
System.out.printf("%2$s %1$s%n", "world", "hello");  // hello world
System.out.printf("%b %c %e%n", true, 'x', 12345.678);  // true x 1.234568e+04
var random = new Random();
System.out.println("Монетка: " + (random.nextDouble() < 0.5 ? "орел" : "решка"));
```

> [!WARNING]
> `String.format` використовує **локаль за замовчуванням**: у польській чи українській локалі `"%.2f"` дасть `3,14`, а не `3.14`. Для машиночитного виводу (CSV, JSON, протоколи) передавайте `Locale.ROOT`: `String.format(Locale.ROOT, "%.2f", x)`.

Детальніше про форматування чисел, дат і локалі — на сторінці «Форматування».
