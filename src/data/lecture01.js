export const lecture01 = {
  id: "01",
  title: "Лекція 01: Вступ, екосистема JVM, інструменти та система типів",
  description: "Звідки взялася Java, як працюють JDK, JVM і JIT, як збирати проєкти за допомогою Maven і Gradle, базові команди Git, а також примітивні й посилальні типи.",
  sections: [
    {
      title: "1. Мова Java і платформа JVM",
      content: `
Java створила компанія **Sun Microsystems** (команда **Джеймса Гослінга**), перший реліз вийшов у **1996 році**. З 2010 року, після купівлі Sun, платформу розвиває **Oracle**, але сама мова й еталонна реалізація (OpenJDK) — відкриті. Гасло платформи — **"Write Once, Run Anywhere" (WORA)**: один раз скомпільована програма працює на будь-якій ОС і архітектурі, де є середовище виконання Java.

На відміну від C++, який компілюється безпосередньо в машинний код, Java використовує двоетапну модель:

1. **Компіляція**: компілятор \`javac\` перетворює вихідний код (\`.java\`) на **байт-код** — інструкції віртуальної машини — і записує його у файли \`.class\`.
2. **Виконання**: **JVM (Java Virtual Machine)** завантажує байт-код, перевіряє його й виконує: спочатку інтерпретує, а «гарячі» місця компілює в машинний код процесора.

\`\`\`text
Hello.java  --javac-->  Hello.class (байт-код)  --java (JVM)-->  машинний код x86/ARM
\`\`\`

Це дуже схоже на .NET: C# компілюється в IL (CIL), а CLR виконує його за допомогою JIT.

### Складові екосистеми

| Компонент | Що це | Що містить |
| --- | --- | --- |
| **JVM** | Віртуальна машина | Виконання байт-коду, JIT, збирач сміття (GC), завантаження класів |
| **JRE** | Середовище виконання | JVM + стандартна бібліотека (з Java 11 окремо не розповсюджується) |
| **JDK** | Набір розробника | JRE + \`javac\`, \`jar\`, \`javadoc\`, \`jshell\`, \`jdb\`, \`jcmd\` та інші інструменти |

### Версії Java

Нова версія Java виходить **кожні пів року** (березень і вересень). Кожна третя-четверта версія має статус **LTS (Long-Term Support)**: 8, 11, 17, 21, 25. У цьому курсі ми використовуємо **Java 21** (мінімум), тож доступні records, sealed-класи, pattern matching для \`switch\` і віртуальні потоки.

> [!TIP]
> Перевірити встановлену версію: \`java -version\` і \`javac -version\`. Обидві мають показувати однакову версію — інакше IDE і термінал можуть використовувати різні JDK.
`
    },
    {
      title: "2. JIT-компіляція та керування пам'яттю",
      content: `
JVM виконує байт-код у два способи:

* **Інтерпретація** — інструкції читаються й виконуються по одній. Запуск швидкий, але виконання повільне.
* **JIT-компіляція (Just-In-Time)** — JVM збирає статистику й знаходить «гарячі точки» (hotspots): методи й цикли, які виконуються найчастіше. HotSpot JVM має два компілятори: **C1** (швидко компілює з базовими оптимізаціями) і **C2** (довше компілює, але генерує дуже оптимізований код). Скомпільований код зберігається в **Code Cache**, і наступні виклики йдуть уже з нативною швидкістю.

Через це Java-програми мають «розігрів» (warm-up): перші секунди роботи повільніші, ніж наступні. Це важливо, коли ви вимірюєте продуктивність: мікробенчмарк без прогріву бреше. Для серйозних вимірювань використовують **JMH**.

### Збирач сміття (Garbage Collector)

Програміст на Java **не звільняє пам'ять вручну**: немає \`delete\` чи \`free\`. Об'єкти створюються в купі (heap) оператором \`new\`, а GC періодично знаходить об'єкти, до яких більше немає посилань, і звільняє пам'ять.

* **Плюси**: немає витоків через забутий \`delete\`, немає *use-after-free* і *double free*.
* **Мінуси**: GC іноді зупиняє програму (паузи *Stop-The-World*), а «логічні» витоки все одно можливі, наприклад якщо об'єкти назавжди лишаються в статичній колекції.

\`\`\`java
List<byte[]> cache = new ArrayList<>(); // статичне поле в реальному коді
for (int i = 0; i < 1_000; i++) {
    cache.add(new byte[1_000_000]); // GC не звільнить: посилання досі є
}
\`\`\`

Детально про GC йдеться в лекції 15.
`
    },
    {
      title: "3. Git — система контролю версій",
      content: `
Усі лабораторні здаються через Git-репозиторій, тому мінімальний набір команд треба знати напам'ять.

Git зберігає історію як ланцюжок **комітів** (знімків стану файлів). Файл проходить три зони:

1. **Working directory** — файли на диску, які ви редагуєте.
2. **Staging area (index)** — зміни, які підуть у наступний коміт (\`git add\`).
3. **Repository** — збережена історія комітів (\`git commit\`).

\`\`\`bash
git clone https://github.com/user/repo.git   # скопіювати віддалений репозиторій
git status                                    # що змінено, що в staging
git add src/Main.java                         # додати файл до staging
git commit -m "Додано клас Matrix"            # створити коміт
git log --oneline --graph                     # історія
git push                                      # відправити коміти на сервер
git pull                                      # забрати чужі зміни
\`\`\`

### Гілки

\`\`\`bash
git switch -c feature/matrix   # створити гілку і перейти на неї
git switch main                # повернутися на main
git merge feature/matrix       # влити гілку в поточну
\`\`\`

### Файл .gitignore

У репозиторій **не** комітимо результати збирання і налаштування IDE:

\`\`\`text
target/
build/
.idea/
*.class
*.iml
\`\`\`

> [!IMPORTANT]
> На лабораторних оцінюється лише код, який **запушено** в репозиторій до кінця заняття. Комітьте й пушіть після кожного етапу, а не один раз наприкінці.
`
    },
    {
      title: "4. Системи збирання: Maven і Gradle",
      content: `
У світі .NET проєкт описує \`.csproj\` і збирає MSBuild. У Java цю роль виконують системи збирання. Вони:

* завантажують залежності (бібліотеки) з репозиторію **Maven Central**;
* компілюють код, запускають тести, пакують результат у \`.jar\`;
* задають стандартну структуру каталогів, тому будь-який Java-розробник одразу в ній орієнтується.

\`\`\`text
my-app/
├── pom.xml                  (або build.gradle.kts)
└── src/
    ├── main/java/...        код програми
    ├── main/resources/...   ресурси (конфіги, файли даних)
    └── test/java/...        тести
\`\`\`

### Apache Maven

Декларативний підхід і принцип **«конвенція понад конфігурацію»**. Проєкт описує XML-файл \`pom.xml\` (Project Object Model). Кожна бібліотека має координати \`groupId:artifactId:version\`.

\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>pl.edu.pw.mini</groupId>
    <artifactId>java-app</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.11.0</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.11.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
\`\`\`

Життєвий цикл Maven складається з фаз, і кожна фаза запускає всі попередні:

| Команда | Що робить |
| --- | --- |
| \`mvn compile\` | компілює \`src/main/java\` |
| \`mvn test\` | компілює і запускає тести |
| \`mvn package\` | збирає \`target/*.jar\` |
| \`mvn install\` | кладе артефакт у локальний репозиторій \`~/.m2\` |
| \`mvn clean\` | видаляє каталог \`target/\` |

### Gradle

Сучасніша й швидша система (інкрементальне збирання, кеш). Замість XML використовує DSL на Kotlin або Groovy.

\`\`\`kotlin
// build.gradle.kts
plugins {
    java
    application
}

group = "pl.edu.pw.mini"
version = "1.0.0"

java {
    toolchain { languageVersion = JavaLanguageVersion.of(21) }
}

repositories { mavenCentral() }

dependencies {
    implementation("com.google.code.gson:gson:2.11.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
}

application { mainClass = "pl.edu.pw.mini.App" }

tasks.test { useJUnitPlatform() }
\`\`\`

Основні команди: \`./gradlew build\`, \`./gradlew test\`, \`./gradlew run\`.

> [!NOTE]
> Використовуйте **wrapper** (\`mvnw\` / \`gradlew\`), який лежить у репозиторії. Він завантажує правильну версію інструменту, тому проєкт збирається однаково на всіх комп'ютерах.
`
    },
    {
      title: "5. Hello World і запуск програми",
      content: `
Класична програма на Java — це публічний клас, назва якого **точно збігається з назвою файлу**. Точка входу — статичний метод \`main\`.

\`\`\`java
// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Аргументів: " + args.length);
    }
}
\`\`\`

\`\`\`bash
javac Hello.java        # створює Hello.class
java Hello Anna Bob     # запуск; args = ["Anna", "Bob"]
java Hello.java         # з Java 11: компіляція і запуск одним кроком
\`\`\`

У нових версіях (JEP 445 як preview у Java 21, фінальна версія — JEP 512 у Java 25) можна писати без явного класу:

\`\`\`java
// Hello.java (Java 25)
void main() {
    IO.println("Hello, World!");
}
\`\`\`

Для швидких експериментів зручний **jshell** — REPL для Java:

\`\`\`text
$ jshell
jshell> int x = 2 + 3
x ==> 5
jshell> "abc".toUpperCase()
$2 ==> "ABC"
\`\`\`
`
    },
    {
      title: "6. Пакети та import",
      content: `
Пакети в Java відповідають просторам імен (namespaces) у C#: вони групують класи й запобігають конфліктам назв.

\`\`\`java
package pl.edu.pw.mini.app;   // перша інструкція у файлі

public class MyApp { }
\`\`\`

* За конвенцією назва пакета — це перевернутий домен організації: \`pl.edu.pw.mini\`.
* **Структура пакетів мусить відповідати структурі каталогів**: клас \`pl.edu.pw.mini.app.MyApp\` лежить у \`src/main/java/pl/edu/pw/mini/app/MyApp.java\`. У C# це лише рекомендація, у Java — правило.

\`\`\`java
import java.util.List;               // один клас
import java.util.*;                  // усі класи пакета (не рекомендується)
import static java.lang.Math.PI;     // статичний імпорт: PI замість Math.PI
import static java.lang.Math.*;      // усі статичні члени Math
\`\`\`

> [!NOTE]
> Класи з пакета \`java.lang\` (\`String\`, \`Integer\`, \`System\`, \`Math\`, \`Object\`) імпортуються автоматично.

> [!WARNING]
> \`import java.util.*\` не імпортує підпакети: \`java.util.function.Function\` потребує окремого імпорту. Пакети в Java не мають ієрархії: \`java.util\` і \`java.util.function\` — це два незалежні пакети.
`
    },
    {
      title: "7. Система типів: примітиви та посилання",
      content: `
Java — мова зі **статичною і строгою типізацією**: тип кожної змінної відомий під час компіляції, а невідповідність типів — це помилка компіляції.

Типи діляться на дві категорії:

1. **Примітивні типи** — зберігають значення безпосередньо.
2. **Посилальні типи** — класи, інтерфейси, масиви, enum, record. Змінна зберігає **посилання** на об'єкт у купі.

> [!IMPORTANT]
> На відміну від C#, у Java **немає користувацьких типів-значень** (\`struct\`). Будь-який клас, який ви оголошуєте, є посилальним типом. Примітивів рівно вісім, і додати нові неможливо (проєкт Valhalla це колись змінить).

### Вісім примітивних типів

| Тип | Розмір | Значення за замовчуванням | Діапазон |
| --- | --- | --- | --- |
| \`byte\` | 8 біт | 0 | від -128 до 127 |
| \`short\` | 16 біт | 0 | від -32 768 до 32 767 |
| \`int\` | 32 біти | 0 | від -2^31 до 2^31-1 |
| \`long\` | 64 біти | 0L | від -2^63 до 2^63-1 |
| \`float\` | 32 біти | 0.0f | IEEE 754, ~7 значущих цифр |
| \`double\` | 64 біти | 0.0 | IEEE 754, ~15–16 значущих цифр |
| \`char\` | 16 біт | '\\u0000' | одна кодова одиниця UTF-16 |
| \`boolean\` | залежить від JVM | false | \`true\` / \`false\` |

Усі цілочисельні типи **знакові** (немає \`uint\`, як у C#). Літерали: \`1_000_000\` (підкреслення для читабельності), \`0xFF\`, \`0b1010\`, \`10L\`, \`3.14f\`.

### Пастки примітивів

\`\`\`java
int big = Integer.MAX_VALUE;
System.out.println(big + 1);              // -2147483648: тихе переповнення!
System.out.println(Math.addExact(big, 1)); // ArithmeticException

System.out.println(0.1 + 0.2);            // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3);     // false
System.out.println(1 / 2);                // 0: цілочисельне ділення
System.out.println(1.0 / 0);              // Infinity (не виняток!)
System.out.println(1 / 0);                // ArithmeticException: / by zero
\`\`\`

> [!TIP]
> Для грошей не використовуйте \`double\`. Беріть \`BigDecimal\` (або зберігайте копійки в \`long\`).

### Посилальні типи і null

* Усі класи неявно успадковують \`java.lang.Object\`.
* Значення за замовчуванням для посилання — \`null\`.
* Виклик методу на \`null\` кидає \`NullPointerException\`. Від Java 14 повідомлення точно вказує, що саме було \`null\`: *Cannot invoke "String.length()" because "name" is null*.

### Класи-обгортки та autoboxing

Кожен примітив має клас-обгортку: \`int\` → \`Integer\`, \`double\` → \`Double\`, \`boolean\` → \`Boolean\` тощо. Обгортки потрібні, бо **generics працюють лише з посилальними типами**: \`List<int>\` написати не можна, лише \`List<Integer>\`.

\`\`\`java
Integer boxed = 5;       // autoboxing: Integer.valueOf(5)
int raw = boxed;         // unboxing: boxed.intValue()

Integer a = 127, b = 127;
System.out.println(a == b);       // true: кеш Integer для -128..127
Integer c = 128, d = 128;
System.out.println(c == d);       // false: два різні об'єкти!
System.out.println(c.equals(d));  // true: порівняння значень

Integer nothing = null;
int boom = nothing;               // NullPointerException під час unboxing
\`\`\`

> [!WARNING]
> Ніколи не порівнюйте обгортки (\`Integer\`, \`Long\`, \`Double\`) через \`==\`. Використовуйте \`equals()\` або приведіть до примітиву. А autoboxing у «гарячих» циклах створює тисячі зайвих об'єктів.
`
    },
    {
      title: "8. Змінні, var, final і приведення типів",
      content: `
### var (Java 10+)

Виведення типу для **локальних** змінних, аналог \`var\` у C#:

\`\`\`java
var count = 10;                          // int
var names = new ArrayList<String>();     // ArrayList<String>
var map = new HashMap<String, List<Integer>>();
for (var entry : map.entrySet()) { }     // Map.Entry<String, List<Integer>>
\`\`\`

> [!WARNING]
> \`var\` працює **лише для локальних змінних з ініціалізацією**. Для полів, параметрів і типів результату його використати не можна. \`var x = null;\` не компілюється.

### final

* **final-змінна** — присвоюється лише один раз (аналог \`readonly\`; для констант — \`static final\`).
* **final-метод** — не можна перевизначити в підкласі (аналог \`sealed override\`).
* **final-клас** — не можна успадкувати (\`String\`, \`Integer\`; аналог \`sealed class\` у C#).

\`\`\`java
static final int MAX_SIZE = 100;      // константа: UPPER_SNAKE_CASE

final List<String> list = new ArrayList<>();
list.add("ok");                       // МОЖНА: final захищає посилання, а не об'єкт
// list = new ArrayList<>();          // ПОМИЛКА КОМПІЛЯЦІЇ
\`\`\`

### Приведення типів

* **Розширювальне (widening)** — автоматичне і без втрат значення: \`byte → short → int → long → float → double\`.
* **Звужувальне (narrowing)** — лише явно, з можливою втратою даних.

\`\`\`java
int i = 42;
double d = i;              // 42.0, автоматично
int j = (int) 3.99;        // 3: дробова частина відкидається
byte b = (byte) 200;       // -56: переповнення під час звуження
long big = 1L << 40;
int truncated = (int) big; // 0: старші біти відкинуто

Object obj = "Hello";
String s = (String) obj;   // приведення посилання; при помилці ClassCastException
if (obj instanceof String str) {   // pattern matching (Java 16+), безпечно
    System.out.println(str.length());
}
\`\`\`

> [!CAUTION]
> \`long x = 1 << 40;\` дає 256, а не 2^40: зсув виконується в \`int\`, а результат розширюється вже потім. Пишіть \`1L << 40\`.
`
    }
  ],
  quiz: [
    {
      question: "Що перетворює файл .java на файл .class з байт-кодом?",
      options: [
        "JVM",
        "Збирач сміття",
        "Компілятор javac із JDK",
        "JIT-компілятор C2"
      ],
      answer: 2,
      explanation: "javac компілює вихідний код у байт-код. JVM виконує байт-код, а JIT-компілятори C1/C2 перетворюють гарячі ділянки байт-коду в машинний код під час виконання."
    },
    {
      question: "Що таке JIT-компіляція?",
      options: [
        "Компіляція всього проєкту перед запуском",
        "Компіляція часто виконуваних фрагментів байт-коду в машинний код під час роботи програми",
        "Видалення непотрібних об'єктів з купи",
        "Перевірка байт-коду на безпечність"
      ],
      answer: 1,
      explanation: "JVM збирає статистику виконання і компілює «гарячі» методи та цикли в оптимізований машинний код. Саме тому Java-програми потребують розігріву."
    },
    {
      question: "Що виведе код: Integer a = 1000, b = 1000; System.out.println(a == b);",
      options: [
        "true",
        "false",
        "Помилка компіляції",
        "NullPointerException"
      ],
      answer: 1,
      explanation: "== порівнює посилання. Integer.valueOf кешує лише значення від -128 до 127, тому для 1000 створюються два різні об'єкти. Порівнювати треба через equals()."
    },
    {
      question: "Чим Java відрізняється від C# у системі типів?",
      options: [
        "У Java немає примітивних типів",
        "У Java не можна оголосити власний тип-значення (struct): кожен клас є посилальним типом",
        "У Java немає null",
        "Generics у Java працюють з примітивами напряму: List<int>"
      ],
      answer: 1,
      explanation: "У Java рівно 8 примітивів, а все, що оголошує програміст, — посилальні типи. Тому generics вимагають обгорток: List<Integer>."
    },
    {
      question: "Що виведе: System.out.println(Integer.MAX_VALUE + 1);",
      options: [
        "2147483648",
        "ArithmeticException",
        "-2147483648",
        "Помилка компіляції"
      ],
      answer: 2,
      explanation: "Цілочисельна арифметика в Java тихо переповнюється (wrap-around). Щоб отримати виняток, використовуйте Math.addExact."
    },
    {
      question: "Де за конвенцією Maven лежать тести?",
      options: [
        "src/main/java",
        "src/test/java",
        "test/",
        "target/test"
      ],
      answer: 1,
      explanation: "Стандартна структура: src/main/java для коду, src/main/resources для ресурсів, src/test/java для тестів. target/ — результат збирання, його не комітять."
    }
  ]
};
