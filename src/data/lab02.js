export const lab02 = {
  id: "Lab02",
  title: "Лабораторна 02: Maven, модульні тести і застосунок командного рядка",
  description: "Багатомодульний проєкт Maven: бібліотека stats-core зі статистичними функціями, модульні тести на JUnit 5 (параметризовані, винятки, граничні випадки) і консольний застосунок stats-cli, зібраний у виконуваний JAR.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 02.2 «Maven і Gradle», 03.4 «Масиви», 04.1 «Класи», 14.1 «Тестування з JUnit 5» · **Час:** 3 год · **Бали:** 10

Ви створите проєкт із двох модулів:

\`\`\`text
lab02/
├── pom.xml                       ← батьківський (packaging pom)
├── stats-core/                   ← бібліотека
│   ├── pom.xml
│   └── src/
│       ├── main/java/pl/mini/stats/Statistics.java
│       └── test/java/pl/mini/stats/StatisticsTest.java
└── stats-cli/                    ← застосунок, залежить від stats-core
    ├── pom.xml
    └── src/main/java/pl/mini/stats/cli/Main.java
\`\`\`

### Правила

* Збирання **лише через Maven** (\`mvn verify\` у корені має проходити з будь-якого терміналу, а не лише з IDE).
* Модуль \`stats-core\` не має залежностей, крім JUnit у scope \`test\`.
* Коміт після кожного етапу. Каталоги \`target/\` — у \`.gitignore\`.

> [!CAUTION]
> Заборонено використовувати готові статистичні бібліотеки (Apache Commons Math тощо) і \`DoubleSummaryStatistics\`. Усі обчислення пишіть самі на масивах \`double[]\`.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Батьківський POM і модулі

\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>pl.mini</groupId>
    <artifactId>lab02</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>stats-core</module>
        <module>stats-cli</module>
    </modules>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <!-- версії в одному місці; модулі пишуть залежність БЕЗ <version> -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.junit.jupiter</groupId>
                <artifactId>junit-jupiter</artifactId>
                <version>5.11.0</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>3.5.0</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
\`\`\`

### POM модуля

\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>pl.mini</groupId>
        <artifactId>lab02</artifactId>
        <version>1.0.0</version>
    </parent>
    <artifactId>stats-core</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
\`\`\`

### Корисні команди

| Команда | Що робить |
| --- | --- |
| \`mvn verify\` | компіляція, тести, пакування всіх модулів |
| \`mvn -pl stats-core test\` | тести лише одного модуля |
| \`mvn -pl stats-cli -am package\` | модуль разом із модулями, від яких він залежить |
| \`mvn test -Dtest=StatisticsTest#median*\` | вибрані тести |
| \`mvn dependency:tree\` | дерево залежностей |
`
    },
    {
      title: "Етап 1: Структура проєкту (1 б.)",
      content: `
1. Створіть структуру каталогів і три файли \`pom.xml\`, як у розділі вище.
2. Модуль \`stats-cli\` має залежати від \`stats-core\`:
\`\`\`xml
<dependency>
    <groupId>pl.mini</groupId>
    <artifactId>stats-core</artifactId>
    <version>\${project.version}</version>
</dependency>
\`\`\`
3. Додайте порожній клас \`Statistics\` і \`Main\` з \`System.out.println("ok")\`.
4. Перевірте: \`mvn verify\` у корені має завершитися з \`BUILD SUCCESS\`, а в журналі мають з'явитися обидва модулі (*Reactor Summary*).
5. Відкрийте проєкт в IntelliJ як **Maven-проєкт** (*Open → pom.xml → Open as Project*).
`
    },
    {
      title: "Етап 2: Бібліотека Statistics (3 б.)",
      content: `
У пакеті \`pl.mini.stats\` реалізуйте **final**-клас \`Statistics\` з приватним конструктором і статичними методами. Кожен публічний метод має мати Javadoc (\`@param\`, \`@return\`, \`@throws\`).

\`\`\`java
public final class Statistics {
    private Statistics() { }

    public static double mean(double[] data);
    public static double median(double[] data);
    public static double variance(double[] data);       // вибіркова: ділимо на (n - 1)
    public static double stdDev(double[] data);
    public static double percentile(double[] data, double p);   // p з [0, 100]
    public static double[] minMax(double[] data);        // {min, max}
    public static double[] normalize(double[] data);     // масштаб до [0, 1]
}
\`\`\`

### Вимоги

* \`data == null\` → \`NullPointerException\` з повідомленням \`"data"\` (\`Objects.requireNonNull\`).
* Порожній масив → \`IllegalArgumentException("порожній масив")\`.
* \`variance\` і \`stdDev\` для одного елемента → \`IllegalArgumentException\`.
* \`percentile\` — **лінійна інтерполяція** між сусідніми елементами відсортованої копії: позиція \`r = p / 100 * (n - 1)\`, результат \`x[⌊r⌋] + (r - ⌊r⌋) * (x[⌊r⌋+1] - x[⌊r⌋])\`. Для \`p\` поза \`[0, 100]\` → \`IllegalArgumentException\`.
* \`normalize\` для масиву з однакових значень повертає масив нулів.
* **Методи не змінюють вхідний масив.** Сортуйте копію (\`data.clone()\`).

> [!TIP]
> Для дисперсії однопрохідна формула «середнє квадратів мінус квадрат середнього» чисельно нестабільна. Рахуйте в два проходи: спочатку середнє, потім суму квадратів відхилень.
`
    },
    {
      title: "Етап 3: Модульні тести (3 б.)",
      content: `
У \`stats-core/src/test/java/pl/mini/stats/StatisticsTest.java\` напишіть тести JUnit 5. Мінімальні вимоги:

1. **Щонайменше один тест на кожен метод** для типового випадку.
2. **Параметризований тест** (\`@CsvSource\` або \`@MethodSource\`) для \`median\`: парна і непарна кількість, від'ємні числа, один елемент.
3. **Винятки**: \`assertThrows\` для \`null\`, порожнього масиву, некоректного \`p\`; перевірте також **повідомлення** винятку.
4. **Незмінність входу**: після \`median(data)\` масив \`data\` лишився таким самим (\`assertArrayEquals\`).
5. Порівняння \`double\` — **з допуском**: \`assertEquals(expected, actual, 1e-9)\`.

\`\`\`java
class StatisticsTest {

    @ParameterizedTest(name = "median({0}) = {1}")
    @MethodSource("medianCases")
    void medianOfVariousArrays(double[] data, double expected) {
        assertEquals(expected, Statistics.median(data), 1e-9);
    }

    static Stream<Arguments> medianCases() {
        return Stream.of(
                Arguments.of(new double[]{5}, 5.0),
                Arguments.of(new double[]{3, 1, 2}, 2.0),
                Arguments.of(new double[]{4, 1, 3, 2}, 2.5),
                Arguments.of(new double[]{-1, -5, 10}, -1.0));
    }

    @Test
    void percentileInterpolatesLinearly() {
        double[] data = {10, 20, 30, 40};
        assertEquals(25.0, Statistics.percentile(data, 50), 1e-9);
        assertEquals(17.5, Statistics.percentile(data, 25), 1e-9);
    }

    @Test
    void emptyArrayIsRejected() {
        var ex = assertThrows(IllegalArgumentException.class, () -> Statistics.mean(new double[0]));
        assertEquals("порожній масив", ex.getMessage());
    }
}
\`\`\`

\`mvn test\` має показати \`Tests run: N, Failures: 0\` (N ≥ 12).

> [!TIP]
> Спочатку напишіть тест для граничного випадку і переконайтеся, що він **падає**, а вже потім виправляйте код. Так ви перевірите, що тест справді щось перевіряє.
`
    },
    {
      title: "Етап 4: Застосунок stats-cli (2 б.)",
      content: `
\`pl.mini.stats.cli.Main\` читає числа з файлу (по одному або кілька в рядку, розділені пробілами чи комами; порожні рядки й рядки, що починаються з \`#\`, пропускаються) і друкує статистику.

\`\`\`text
Використання: java -jar stats-cli.jar <файл> [--percentile P]... [--normalize]
\`\`\`

Файл \`data.txt\`:

\`\`\`text
# вимірювання
12.5, 7.0 3.5
10
2.0
\`\`\`

\`\`\`bash
java -jar stats-cli/target/stats-cli-1.0.0.jar data.txt --percentile 90 --percentile 25
\`\`\`

\`\`\`text
n        = 5
min      = 2.000
max      = 12.500
mean     = 7.000
median   = 7.000
stdDev   = 4.373
p90      = 11.500
p25      = 3.500
\`\`\`

Формат рядка: \`String.format("%-8s = %.3f", назва, значення)\`, а для \`n\` — ціле число.

### Обробка помилок (коди виходу)

| Ситуація | Повідомлення в \`System.err\` | Код |
| --- | --- | --- |
| немає аргументів / невідома опція | інструкція з використання | 2 |
| файл не існує | \`Файл не знайдено: <шлях>\` | 3 |
| нечислове значення | \`Рядок 4: "abc" не є числом\` | 4 |
| файл без чисел | \`Немає даних\` | 5 |

> [!WARNING]
> Парсинг чисел: \`Double.parseDouble\` очікує крапку, незалежно від локалі. Не використовуйте \`Scanner.nextDouble()\` без \`useLocale(Locale.ROOT)\`: у польській чи українській локалі він чекає кому.
`
    },
    {
      title: "Етап 5: Виконуваний JAR (1 б.)",
      content: `
\`stats-cli\` має збиратися в **один** JAR разом із \`stats-core\`. Додайте до \`stats-cli/pom.xml\`:

\`\`\`xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.6.0</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals><goal>shade</goal></goals>
                    <configuration>
                        <transformers>
                            <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                <mainClass>pl.mini.stats.cli.Main</mainClass>
                            </transformer>
                        </transformers>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
\`\`\`

Перевірка:

\`\`\`bash
mvn clean verify
java -jar stats-cli/target/stats-cli-1.0.0.jar data.txt
echo $?          # 0 (PowerShell: $LASTEXITCODE)
\`\`\`

Закомітьте, позначте тегом \`lab02\` і запуште.
`
    },
    {
      title: "Додатково (без балів)",
      content: `
* Підключіть **JaCoCo** і доведіть покриття \`stats-core\` до 100% рядків. Подивіться, які гілки (branches) лишилися непокритими.
* Додайте \`--histogram K\`: гістограма з K інтервалів у вигляді рядків з \`#\`.
* Перепишіть збирання на **Gradle** (Kotlin DSL) в окремій гілці й порівняйте час повторного збирання.
`
    }
  ],
  quiz: [
    {
      question: "Навіщо в батьківському POM розділ dependencyManagement?",
      options: [
        "Він автоматично додає залежності в усі модулі",
        "Він задає версії в одному місці; модулі оголошують залежність без версії",
        "Він вимикає транзитивні залежності",
        "Він потрібен лише для плагінів"
      ],
      answer: 1,
      explanation: "dependencyManagement лише фіксує версії. Щоб залежність з'явилася в модулі, її треба оголосити в <dependencies> цього модуля."
    },
    {
      question: "Що означає <scope>test</scope> у залежності JUnit?",
      options: [
        "JUnit буде у фінальному JAR",
        "Залежність доступна лише для компіляції й запуску тестів і не потрапляє в основний classpath",
        "Тести виконуються лише в IDE",
        "JUnit завантажується з інтернету під час кожного запуску"
      ],
      answer: 1,
      explanation: "Код у src/main/java не бачить test-залежностей, і вони не потрапляють в артефакт."
    },
    {
      question: "Чому Statistics.median має сортувати копію масиву, а не сам масив?",
      options: [
        "Сортування копії швидше",
        "Метод не повинен мати неочікуваних побічних ефектів: викликач не чекає, що його дані зміняться",
        "Arrays.sort не працює з параметрами",
        "Так вимагає JUnit"
      ],
      answer: 1,
      explanation: "Масив передається за посиланням (копія посилання), тому сортування на місці змінило б дані того, хто викликав метод."
    }
  ]
};
