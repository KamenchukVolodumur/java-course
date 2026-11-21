---
title: Lab 02: Maven, Unit Tests and a Command-Line Application
description: A multi-module Maven project: the stats-core library with statistical functions, unit tests in JUnit 5 (parameterized, exceptions, edge cases) and the stats-cli console application, built into an executable JAR.
---

## Before You Start

> [!NOTE]
> **Lectures:** 02.2 "Maven and Gradle", 03.4 "Arrays", 04.1 "Classes", 14.1 "Testing with JUnit 5" · **Time:** 3 h · **Points:** 10

You will create a project with two modules:

```text
lab02/
├── pom.xml                       ← the parent (packaging pom)
├── stats-core/                   ← a library
│   ├── pom.xml
│   └── src/
│       ├── main/java/pl/mini/stats/Statistics.java
│       └── test/java/pl/mini/stats/StatisticsTest.java
└── stats-cli/                    ← an application, depends on stats-core
    ├── pom.xml
    └── src/main/java/pl/mini/stats/cli/Main.java
```

### Rules

* Building **only through Maven** (`mvn verify` at the root must pass from any terminal, not only from the IDE).
* The `stats-core` module has no dependencies other than JUnit in the `test` scope.
* A commit after each stage. The `target/` directories go into `.gitignore`.

> [!CAUTION]
> Using ready-made statistics libraries (Apache Commons Math etc.) and `DoubleSummaryStatistics` is forbidden. Write all computations yourself on `double[]` arrays.

## A Quick Theory Recap

### The Parent POM and Modules

```xml
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

    <!-- versions in one place; modules declare the dependency WITHOUT <version> -->
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
```

### A Module POM

```xml
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
```

### Useful Commands

| Command | What it does |
| --- | --- |
| `mvn verify` | compiling, testing, packaging all modules |
| `mvn -pl stats-core test` | the tests of a single module only |
| `mvn -pl stats-cli -am package` | a module together with the modules it depends on |
| `mvn test -Dtest=StatisticsTest#median*` | selected tests |
| `mvn dependency:tree` | the dependency tree |

## Stage 1: The Project Structure (1 pt)

1. Create the directory structure and the three `pom.xml` files as in the section above.
2. The `stats-cli` module must depend on `stats-core`:
```xml
<dependency>
    <groupId>pl.mini</groupId>
    <artifactId>stats-core</artifactId>
    <version>${project.version}</version>
</dependency>
```
3. Add an empty `Statistics` class and a `Main` with `System.out.println("ok")`.
4. Check: `mvn verify` at the root must end with `BUILD SUCCESS`, and both modules must appear in the log (*Reactor Summary*).
5. Open the project in IntelliJ as a **Maven project** (*Open → pom.xml → Open as Project*).

## Stage 2: The Statistics Library (3 pts)

In the `pl.mini.stats` package, implement a **final** class `Statistics` with a private constructor and static methods. Every public method must have Javadoc (`@param`, `@return`, `@throws`).

```java
public final class Statistics {
    private Statistics() { }

    public static double mean(double[] data);
    public static double median(double[] data);
    public static double variance(double[] data);       // the sample variance: divide by (n - 1)
    public static double stdDev(double[] data);
    public static double percentile(double[] data, double p);   // p in [0, 100]
    public static double[] minMax(double[] data);        // {min, max}
    public static double[] normalize(double[] data);     // scaling to [0, 1]
}
```

### Requirements

* `data == null` → `NullPointerException` with the message `"data"` (`Objects.requireNonNull`).
* An empty array → `IllegalArgumentException("empty array")`.
* `variance` and `stdDev` for a single element → `IllegalArgumentException`.
* `percentile` — **linear interpolation** between neighboring elements of a sorted copy: the position `r = p / 100 * (n - 1)`, the result `x[⌊r⌋] + (r - ⌊r⌋) * (x[⌊r⌋+1] - x[⌊r⌋])`. For `p` outside `[0, 100]` → `IllegalArgumentException`.
* `normalize` for an array of identical values returns an array of zeros.
* **The methods do not modify the input array.** Sort a copy (`data.clone()`).

> [!TIP]
> For the variance, the one-pass formula "the mean of the squares minus the square of the mean" is numerically unstable. Compute in two passes: first the mean, then the sum of squared deviations.

## Stage 3: Unit Tests (3 pts)

In `stats-core/src/test/java/pl/mini/stats/StatisticsTest.java`, write JUnit 5 tests. Minimum requirements:

1. **At least one test for each method** for the typical case.
2. **A parameterized test** (`@CsvSource` or `@MethodSource`) for `median`: an even and an odd count, negative numbers, a single element.
3. **Exceptions**: `assertThrows` for `null`, an empty array, an invalid `p`; also check the exception's **message**.
4. **Input immutability**: after `median(data)` the `data` array has stayed the same (`assertArrayEquals`).
5. Comparing `double`s — **with a tolerance**: `assertEquals(expected, actual, 1e-9)`.

```java
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
        assertEquals("empty array", ex.getMessage());
    }
}
```

`mvn test` must show `Tests run: N, Failures: 0` (N ≥ 12).

> [!TIP]
> First write a test for an edge case and make sure it **fails**, and only then fix the code. This way you check that the test really checks something.

## Stage 4: The stats-cli Application (2 pts)

`pl.mini.stats.cli.Main` reads numbers from a file (one or several per line, separated by spaces or commas; empty lines and lines starting with `#` are skipped) and prints statistics.

```text
Usage: java -jar stats-cli.jar <file> [--percentile P]... [--normalize]
```

The file `data.txt`:

```text
# measurements
12.5, 7.0 3.5
10
2.0
```

```bash
java -jar stats-cli/target/stats-cli-1.0.0.jar data.txt --percentile 90 --percentile 25
```

```text
n        = 5
min      = 2.000
max      = 12.500
mean     = 7.000
median   = 7.000
stdDev   = 4.373
p90      = 11.500
p25      = 3.500
```

The line format: `String.format("%-8s = %.3f", name, value)`, and an integer for `n`.

### Error Handling (Exit Codes)

| Situation | Message to `System.err` | Code |
| --- | --- | --- |
| no arguments / an unknown option | usage instructions | 2 |
| the file does not exist | `File not found: <path>` | 3 |
| a non-numeric value | `Line 4: "abc" is not a number` | 4 |
| a file without numbers | `No data` | 5 |

> [!WARNING]
> Parsing numbers: `Double.parseDouble` expects a dot regardless of the locale. Do not use `Scanner.nextDouble()` without `useLocale(Locale.ROOT)`: in a Polish or Ukrainian locale it expects a comma.

## Stage 5: An Executable JAR (1 pt)

`stats-cli` must be built into **one** JAR together with `stats-core`. Add to `stats-cli/pom.xml`:

```xml
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
```

A check:

```bash
mvn clean verify
java -jar stats-cli/target/stats-cli-1.0.0.jar data.txt
echo $?          # 0 (PowerShell: $LASTEXITCODE)
```

Commit, tag it `lab02` and push.

## Extras (No Points)

* Add **JaCoCo** and bring the coverage of `stats-core` to 100% of lines. Look at which branches remain uncovered.
* Add `--histogram K`: a histogram of K intervals in the form of lines of `#`.
* Rewrite the build in **Gradle** (Kotlin DSL) in a separate branch and compare the time of a repeated build.
