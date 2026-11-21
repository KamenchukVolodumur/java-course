export const lecture11 = {
  id: "11",
  title: "Лекція 11: Структура застосунку, тестування з JUnit 5 і якість коду",
  description: "Практичний воркшоп: структура пакетів і шари застосунку, модульні тести з JUnit 5 (життєвий цикл, перевірки, параметризовані тести, винятки), AssertJ, покриття коду, виконуваний JAR і інструменти статичного аналізу.",
  sections: [
    {
      title: "1. Структура проєкту і пакетів",
      content: `
Є два популярні підходи до організації пакетів:

**Package-by-layer** — за технічними шарами:

\`\`\`text
pl.mini.shop
├── controller/   OrderController, UserController
├── service/      OrderService, UserService
├── repository/   OrderRepository, UserRepository
└── model/        Order, User
\`\`\`

**Package-by-feature** — за функціональністю (рекомендується для більших проєктів):

\`\`\`text
pl.mini.shop
├── order/        OrderController, OrderService, OrderRepository, Order
├── user/         UserController, UserService, UserRepository, User
└── common/       Money, Clock, exceptions
\`\`\`

У другому варіанті більшість класів може бути **package-private**: назовні видно лише API функції, а зміни зосереджені в одному каталозі.

### Шари і напрямок залежностей

\`\`\`text
UI / Controller  ->  Service (бізнес-логіка)  ->  Repository (дані)
                          |
                          v
                  Domain model (без залежностей)
\`\`\`

* Залежності йдуть **лише вниз**: repository нічого не знає про controller.
* Бізнес-логіка не залежить від деталей зберігання. Сервіс отримує **інтерфейс** \`OrderRepository\`, а не \`JdbcOrderRepository\`. Тоді в тестах його легко підмінити.
* Залежності передаються через **конструктор** (dependency injection), а не створюються через \`new\` всередині класу.

\`\`\`java
public class OrderService {
    private final OrderRepository repository;
    private final Clock clock;                       // навіть час — залежність!

    public OrderService(OrderRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }
}
\`\`\`
`
    },
    {
      title: "2. JUnit 5: основи",
      content: `
\`\`\`xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
\`\`\`

Тести лежать у \`src/test/java\` у **тому самому пакеті**, що й клас, який тестують. Тому вони мають доступ до package-private членів.

\`\`\`java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class StackTest {
    private Deque<Integer> stack;

    @BeforeEach
    void setUp() { stack = new ArrayDeque<>(); }      // перед КОЖНИМ тестом

    @Test
    @DisplayName("новий стек порожній")
    void newStackIsEmpty() {
        assertTrue(stack.isEmpty());
    }

    @Test
    void pushThenPopReturnsSameElement() {
        // given
        stack.push(42);
        // when
        int top = stack.pop();
        // then
        assertEquals(42, top);
        assertTrue(stack.isEmpty());
    }

    @Test
    void popOnEmptyThrows() {
        var ex = assertThrows(NoSuchElementException.class, () -> stack.pop());
        assertNull(ex.getMessage());
    }

    @Test
    void severalChecksAtOnce() {
        stack.push(1); stack.push(2);
        assertAll(                                     // показує ВСІ невдалі перевірки
            () -> assertEquals(2, stack.size()),
            () -> assertEquals(2, stack.peek()),
            () -> assertFalse(stack.isEmpty()));
    }

    @Test
    @Disabled("чекаємо виправлення #123")
    void notYet() { }
}
\`\`\`

| Анотація | Аналог у xUnit/NUnit | Коли виконується |
| --- | --- | --- |
| \`@Test\` | \`[Fact]\` / \`[Test]\` | — |
| \`@BeforeEach\` / \`@AfterEach\` | конструктор / \`Dispose\` | до і після кожного тесту |
| \`@BeforeAll\` / \`@AfterAll\` (static) | \`IClassFixture\` / \`[OneTimeSetUp]\` | раз на клас |
| \`@ParameterizedTest\` | \`[Theory]\` | тест з різними даними |
| \`@Disabled\` | \`Skip\` / \`[Ignore]\` | вимкнений тест |

> [!NOTE]
> JUnit створює **новий екземпляр класу тестів для кожного методу**, тож поля не переносять стан між тестами. Порядок виконання тестів не гарантовано, і тести не повинні від нього залежати.
`
    },
    {
      title: "3. Параметризовані тести, тайм-аути, тимчасові файли",
      content: `
\`\`\`java
@ParameterizedTest
@ValueSource(strings = {"kajak", "level", "a", ""})
void palindromes(String word) {
    assertTrue(Strings.isPalindrome(word));
}

@ParameterizedTest(name = "{0} + {1} = {2}")
@CsvSource({
    "1, 1, 2",
    "-1, 1, 0",
    "2147483647, 1, -2147483648"
})
void addition(int a, int b, int expected) {
    assertEquals(expected, a + b);
}

@ParameterizedTest
@MethodSource("invalidMatrices")
void rejectsInvalidSize(int rows, int cols) {
    assertThrows(IllegalArgumentException.class, () -> new DenseMatrix(rows, cols));
}
static Stream<Arguments> invalidMatrices() {
    return Stream.of(Arguments.of(0, 1), Arguments.of(1, 0), Arguments.of(-3, 2));
}

@ParameterizedTest
@EnumSource(value = DayOfWeek.class, names = {"SATURDAY", "SUNDAY"})
void weekend(DayOfWeek d) { assertTrue(Calendar.isWeekend(d)); }

@Test
@Timeout(value = 500, unit = TimeUnit.MILLISECONDS)
void fastEnough() { solver.solve(bigInput); }

@Test
void writesReport(@TempDir Path tmp) throws IOException {   // тимчасовий каталог, видаляється після тесту
    Path out = tmp.resolve("report.txt");
    Report.write(out, data);
    assertEquals(3, Files.readAllLines(out).size());
}
\`\`\`
`
    },
    {
      title: "4. AssertJ — читабельні перевірки",
      content: `
Бібліотека \`org.assertj:assertj-core\` дає «плавний» (fluent) API і набагато зрозуміліші повідомлення про помилки:

\`\`\`java
import static org.assertj.core.api.Assertions.*;

assertThat(result).isEqualTo(42);
assertThat(name).startsWith("An").endsWith("na").hasSize(4);
assertThat(list).hasSize(3)
                .contains("a", "b")
                .doesNotContain("z")
                .containsExactly("a", "b", "c");      // з урахуванням порядку
assertThat(map).containsEntry("apple", 10).doesNotContainKey("pear");
assertThat(people).extracting(Person::name).containsExactlyInAnyOrder("Ola", "Jan");
assertThat(price).isCloseTo(9.99, within(0.001));
assertThat(optional).isPresent().contains("x");

assertThatThrownBy(() -> account.withdraw(BigDecimal.TEN))
        .isInstanceOf(InsufficientFundsException.class)
        .hasMessageContaining("Бракує");
\`\`\`

> [!TIP]
> Порівнюйте \`double\` з допуском (\`isCloseTo\`, \`assertEquals(expected, actual, 1e-9)\`), а не точно.
`
    },
    {
      title: "5. Що і як тестувати",
      content: `
### Хороший модульний тест — FIRST

* **Fast** — мілісекунди; без мережі, БД і \`sleep\`.
* **Independent** — не залежить від інших тестів і порядку їх виконання.
* **Repeatable** — однаковий результат щоразу: без \`Random\` без seed і без \`LocalDate.now()\` (передавайте \`Clock\`).
* **Self-validating** — перевіряє результат сам (assert), а не друкує його для людини.
* **Timely** — пишеться разом із кодом.

### Які випадки покривати

1. **Типовий сценарій** (happy path).
2. **Граничні значення**: 0, 1, порожня колекція, \`Integer.MAX_VALUE\`, \`null\`.
3. **Помилкові дані**: перевірка, що кидається саме очікуваний виняток.
4. **Регресія**: на кожен знайдений баг — тест, який його відтворює.

### Назви тестів

Назва описує **поведінку**, а не метод: \`withdrawMoreThanBalanceThrows\`, а не \`testWithdraw2\`.

### Покриття коду (JaCoCo)

\`\`\`xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <execution><goals><goal>prepare-agent</goal></goals></execution>
        <execution><id>report</id><phase>test</phase><goals><goal>report</goal></goals></execution>
    </executions>
</plugin>
\`\`\`

Звіт з'явиться в \`target/site/jacoco/index.html\`.

> [!WARNING]
> 100% покриття не означає відсутності багів: тест може виконати рядок і нічого не перевірити. Покриття показує, що **не** протестовано, а не те, що протестовано добре.
`
    },
    {
      title: "6. Виконуваний JAR і якість коду",
      content: `
### Звичайний JAR із Main-Class

\`\`\`xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <configuration>
        <archive><manifest><mainClass>pl.mini.App</mainClass></manifest></archive>
    </configuration>
</plugin>
\`\`\`

Такий JAR не містить залежностей. Щоб отримати один файл з усіма бібліотеками («fat jar»), використовують \`maven-shade-plugin\` (або плагін \`shadow\` у Gradle):

\`\`\`bash
mvn package
java -jar target/app-1.0.0.jar
\`\`\`

### Аргументи командного рядка

\`\`\`java
public static void main(String[] args) {
    if (args.length < 1) {
        System.err.println("Використання: java -jar app.jar <файл> [--verbose]");
        System.exit(1);                              // ненульовий код = помилка
    }
    Path input = Path.of(args[0]);
    boolean verbose = Arrays.asList(args).contains("--verbose");
}
\`\`\`

Для складних CLI беріть бібліотеку **picocli**: анотації \`@Option\`/\`@Parameters\`, автоматичний \`--help\`.

### Статичний аналіз

| Інструмент | Що перевіряє |
| --- | --- |
| Компілятор з \`-Xlint:all\` | сирі типи, deprecated, fall-through |
| Checkstyle | стиль коду, назви |
| SpotBugs / Error Prone | типові баги: equals без hashCode, ігнорований результат |
| SonarLint (плагін IDE) | усе разом + code smells |
| Spotless / google-java-format | автоматичне форматування |
`
    }
  ],
  quiz: [
    {
      question: "Скільки екземплярів класу тестів створює JUnit 5 (за замовчуванням) для класу з п'ятьма @Test-методами?",
      options: ["1", "5", "0: методи статичні", "Залежить від IDE"],
      answer: 1,
      explanation: "За замовчуванням (PER_METHOD) кожен тест отримує новий екземпляр. Так поля не переносять стан між тестами."
    },
    {
      question: "Як перевірити, що метод кидає IllegalArgumentException?",
      options: [
        "try/catch і System.out.println",
        "assertThrows(IllegalArgumentException.class, () -> method())",
        "@Test(expected = ...) у JUnit 5",
        "assertEquals(exception, method())"
      ],
      answer: 1,
      explanation: "assertThrows повертає перехоплений виняток, тож можна додатково перевірити його повідомлення. Атрибут expected був у JUnit 4."
    },
    {
      question: "Чому сервіс має отримувати OrderRepository через конструктор, а не створювати його всередині?",
      options: [
        "Так швидше",
        "Щоб у тестах можна було підставити підробну реалізацію і щоб сервіс не залежав від конкретного сховища",
        "Так вимагає Java",
        "Щоб менше писати коду"
      ],
      answer: 1,
      explanation: "Dependency injection робить залежності явними і дозволяє замінити їх у тестах (fake, mock) або в production (інша БД)."
    },
    {
      question: "Що означає R у принципах FIRST?",
      options: [
        "Readable",
        "Repeatable: однаковий результат при кожному запуску",
        "Refactored",
        "Remote"
      ],
      answer: 1,
      explanation: "Тест не повинен залежати від поточного часу, випадкових чисел без seed, мережі чи порядку інших тестів."
    },
    {
      question: "Покриття коду тестами становить 100%. Що з цього випливає?",
      options: [
        "У коді немає багів",
        "Кожен рядок було виконано хоча б раз; про якість перевірок це нічого не каже",
        "Тести не потрібні",
        "Код оптимальний"
      ],
      answer: 1,
      explanation: "Тест без assert дає покриття, але нічого не перевіряє. Покриття — корисна, але недостатня метрика."
    }
  ]
};
