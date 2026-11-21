---
title: Testing with JUnit 5
description: A practical workshop: package structure and application layers, unit tests with JUnit 5 (lifecycle, assertions, parameterized tests, exceptions), AssertJ, code coverage, an executable JAR and static analysis tools.
---

## Project and Package Structure

There are two popular approaches to organizing packages:

**Package-by-layer** — by technical layers:

```text
pl.mini.shop
├── controller/   OrderController, UserController
├── service/      OrderService, UserService
├── repository/   OrderRepository, UserRepository
└── model/        Order, User
```

**Package-by-feature** — by functionality (recommended for larger projects):

```text
pl.mini.shop
├── order/        OrderController, OrderService, OrderRepository, Order
├── user/         UserController, UserService, UserRepository, User
└── common/       Money, Clock, exceptions
```

In the second variant most classes can be **package-private**: only the feature's API is visible from outside, and changes are concentrated in one directory.

### Layers and the Direction of Dependencies

```text
UI / Controller  ->  Service (business logic)  ->  Repository (data)
                          |
                          v
                  Domain model (no dependencies)
```

* Dependencies go **only downward**: the repository knows nothing about the controller.
* Business logic does not depend on storage details. The service receives the `OrderRepository` **interface**, not a `JdbcOrderRepository`. Then it is easy to substitute in tests.
* Dependencies are passed through the **constructor** (dependency injection), not created with `new` inside the class.

```java
public class OrderService {
    private final OrderRepository repository;
    private final Clock clock;                       // even time is a dependency!

    public OrderService(OrderRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }
}
```

## JUnit 5: the Basics

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
```

Tests live in `src/test/java` in **the same package** as the class under test. That is why they have access to package-private members.

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class StackTest {
    private Deque<Integer> stack;

    @BeforeEach
    void setUp() { stack = new ArrayDeque<>(); }      // before EACH test

    @Test
    @DisplayName("a new stack is empty")
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
        assertAll(                                     // shows ALL failed assertions
            () -> assertEquals(2, stack.size()),
            () -> assertEquals(2, stack.peek()),
            () -> assertFalse(stack.isEmpty()));
    }

    @Test
    @Disabled("waiting for the fix of #123")
    void notYet() { }
}
```

| Annotation | When it runs |
| --- | --- |
| `@Test` | a test method |
| `@BeforeEach` / `@AfterEach` | before and after each test |
| `@BeforeAll` / `@AfterAll` (static) | once per class |
| `@ParameterizedTest` | a test with different data |
| `@Disabled` | a disabled test |

> [!NOTE]
> JUnit creates **a new instance of the test class for each method**, so fields do not carry state between tests. The order of test execution is not guaranteed, and tests must not depend on it.

## Parameterized Tests, Timeouts, Temporary Files

```java
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
void writesReport(@TempDir Path tmp) throws IOException {   // a temporary directory, deleted after the test
    Path out = tmp.resolve("report.txt");
    Report.write(out, data);
    assertEquals(3, Files.readAllLines(out).size());
}
```

## AssertJ — Readable Assertions

The `org.assertj:assertj-core` library provides a fluent API and much clearer failure messages:

```java
import static org.assertj.core.api.Assertions.*;

assertThat(result).isEqualTo(42);
assertThat(name).startsWith("An").endsWith("na").hasSize(4);
assertThat(list).hasSize(3)
                .contains("a", "b")
                .doesNotContain("z")
                .containsExactly("a", "b", "c");      // order-sensitive
assertThat(map).containsEntry("apple", 10).doesNotContainKey("pear");
assertThat(people).extracting(Person::name).containsExactlyInAnyOrder("Ola", "Jan");
assertThat(price).isCloseTo(9.99, within(0.001));
assertThat(optional).isPresent().contains("x");

assertThatThrownBy(() -> account.withdraw(BigDecimal.TEN))
        .isInstanceOf(InsufficientFundsException.class)
        .hasMessageContaining("Insufficient");
```

> [!TIP]
> Compare `double`s with a tolerance (`isCloseTo`, `assertEquals(expected, actual, 1e-9)`), not exactly.

## What and How to Test

### A Good Unit Test — FIRST

* **Fast** — milliseconds; no network, database or `sleep`.
* **Independent** — does not depend on other tests or their order.
* **Repeatable** — the same result every time: no `Random` without a seed and no `LocalDate.now()` (pass a `Clock`).
* **Self-validating** — checks the result itself (assert), rather than printing it for a human.
* **Timely** — written together with the code.

### Which Cases to Cover

1. **The typical scenario** (happy path).
2. **Boundary values**: 0, 1, an empty collection, `Integer.MAX_VALUE`, `null`.
3. **Invalid data**: checking that exactly the expected exception is thrown.
4. **Regression**: for every bug found, a test that reproduces it.

### Test Names

A name describes **behavior**, not the method: `withdrawMoreThanBalanceThrows`, not `testWithdraw2`.

### Code Coverage (JaCoCo)

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <execution><goals><goal>prepare-agent</goal></goals></execution>
        <execution><id>report</id><phase>test</phase><goals><goal>report</goal></goals></execution>
    </executions>
</plugin>
```

The report appears in `target/site/jacoco/index.html`.

> [!WARNING]
> 100% coverage does not mean there are no bugs: a test can execute a line and check nothing. Coverage shows what is **not** tested, not what is tested well.

## An Executable JAR and Code Quality

### An Ordinary JAR with a Main-Class

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <configuration>
        <archive><manifest><mainClass>pl.mini.App</mainClass></manifest></archive>
    </configuration>
</plugin>
```

Such a JAR does not contain the dependencies. To get a single file with all the libraries (a "fat jar"), `maven-shade-plugin` (or the `shadow` plugin in Gradle) is used:

```bash
mvn package
java -jar target/app-1.0.0.jar
```

### Command-Line Arguments

```java
public static void main(String[] args) {
    if (args.length < 1) {
        System.err.println("Usage: java -jar app.jar <file> [--verbose]");
        System.exit(1);                              // a non-zero code = an error
    }
    Path input = Path.of(args[0]);
    boolean verbose = Arrays.asList(args).contains("--verbose");
}
```

For complex CLIs use the **picocli** library: `@Option`/`@Parameters` annotations, an automatic `--help`.

### Static Analysis

| Tool | What it checks |
| --- | --- |
| The compiler with `-Xlint:all` | raw types, deprecated APIs, fall-through |
| Checkstyle | code style, names |
| SpotBugs / Error Prone | typical bugs: equals without hashCode, an ignored result |
| SonarLint (an IDE plugin) | all of the above + code smells |
| Spotless / google-java-format | automatic formatting |
