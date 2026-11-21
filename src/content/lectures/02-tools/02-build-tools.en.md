---
title: Maven and Gradle
description: Build systems for Java projects: the POM model, coordinates and dependencies, the lifecycle and plugins, profiles, parent POMs, multi-module projects, Gradle and the task graph, diagnostics, running a single file.
---

## Why a Build System

A single file can be compiled with the `javac` command. But a real project consists of hundreds of classes, dozens of libraries with their own dependencies, tests, resources, packaging into a JAR and publishing. A **build system** automates this: it downloads libraries, compiles code in the right order, runs tests and packages the result. It can be run both from the IDE and from the command line, which is especially important on continuous integration servers (CI/CD).

Two tools dominate the Java world:

* **Apache Maven** — a declarative model in the `pom.xml` file, following the *convention over configuration* principle;
* **Gradle** — a build script in the Kotlin or Groovy DSL, a flexible task graph, incremental builds and a cache.

Both use the same standard directory layout and the same library repository, **Maven Central**.

```text
my-app/
├── pom.xml                      (or build.gradle.kts + settings.gradle.kts)
├── mvnw, mvnw.cmd, .mvn/        wrapper — pins the Maven version
└── src/
    ├── main/java/               application code
    ├── main/resources/          resources (end up in the JAR)
    ├── test/java/               tests
    └── test/resources/          test resources
target/                          Maven build outputs (build/ in Gradle)
```

## Maven: the pom.xml File

Maven describes a project with an XML file called the **POM** (Project Object Model). A minimal example of a console application:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>pl.edu.pw.mini</groupId>        <!-- organization, reversed domain -->
    <artifactId>hello</artifactId>           <!-- artifact name -->
    <version>1.0.0-SNAPSHOT</version>        <!-- SNAPSHOT = a version under development -->
    <packaging>jar</packaging>               <!-- jar (default), pom, war -->

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.11.0</junit.version>
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
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### Coordinates

Each artifact is uniquely identified by its **coordinates** `groupId:artifactId:version` (GAV), e.g. `com.google.code.gson:gson:2.11.0`. They identify both your project and every library.

* A version with the `-SNAPSHOT` suffix is mutable, "under development": Maven periodically checks whether a new build has appeared.
* A version without the suffix is a release, immutable forever.

### Properties

The `<properties>` element defines key–value pairs referenced as `${name}`. Some properties are read by plugins: for example, `maven.compiler.release` sets the Java version for the compiler. Built-in properties are also available: `${project.version}`, `${project.basedir}`, `${project.build.directory}` (usually `target`), as well as environment variables `${env.HOME}` and JVM system properties.

A property can be overridden from the command line:

```bash
mvn package -Djunit.version=5.10.2 -DskipTests
```

### Dependencies and Their Scopes

Maven downloads the listed libraries from **Maven Central** into the local repository `~/.m2/repository` and puts them on the classpath. A dependency has a **scope**:

| Scope | Compiling code | Tests | At run time | Example |
| --- | --- | --- | --- | --- |
| `compile` (default) | yes | yes | yes | Gson, Jackson |
| `provided` | yes | yes | no (provided by the environment) | Servlet API, Lombok |
| `runtime` | no | yes | yes | a JDBC driver |
| `test` | no | yes | no | JUnit, Mockito |

### Transitive Dependencies and Version Conflicts

Dependencies have their own dependencies, and Maven pulls them in automatically (**transitive dependencies**). If two libraries need different versions of the same library, Maven chooses the one **nearest** to the project in the dependency tree (nearest wins); at equal depth the one declared first wins.

```bash
mvn dependency:tree
# [INFO] pl.edu.pw.mini:hello:jar:1.0.0-SNAPSHOT
# [INFO] +- com.google.code.gson:gson:jar:2.11.0:compile
# [INFO] |  \- com.google.errorprone:error_prone_annotations:jar:2.27.0:compile
# [INFO] \- org.junit.jupiter:junit-jupiter:jar:5.11.0:test
# [INFO]    +- org.junit.jupiter:junit-jupiter-api:jar:5.11.0:test
# ...
```

An unwanted transitive dependency can be excluded, and a version can be pinned centrally:

```xml
<dependency>
    <groupId>org.example</groupId>
    <artifactId>legacy-lib</artifactId>
    <version>3.1</version>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

The `<dependencyManagement>` section only **pins versions** (it does not add the dependency itself). Modules and transitive dependencies take their version from there. A special case is a **BOM** (Bill of Materials): a POM file containing only `dependencyManagement`, imported to align the versions of a whole set of libraries:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.junit</groupId>
            <artifactId>junit-bom</artifactId>
            <version>5.11.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
<!-- junit-jupiter can now be declared without <version> -->
```

## Maven: Lifecycle, Phases and Goals

Maven has no arbitrary "targets" like a Makefile. The build is described by a **lifecycle** — a fixed sequence of **phases**. The main `default` lifecycle (abridged):

| Phase | What happens |
| --- | --- |
| `validate` | checks that the POM is correct |
| `generate-sources` | code generation (annotation processors, protobuf etc.) |
| `process-resources` | copies `src/main/resources` to `target/classes` |
| `compile` | compiles `src/main/java` |
| `test-compile` | compiles the tests |
| `test` | runs the unit tests (Surefire) |
| `package` | packages into a JAR/WAR |
| `integration-test` | integration tests (Failsafe) |
| `verify` | checks the integration test results |
| `install` | copies the artifact to the local repository `~/.m2` |
| `deploy` | publishes to a remote repository |

There are also separate `clean` (deletes `target/`) and `site` (documentation) lifecycles.

> [!IMPORTANT]
> Invoking a phase executes **all preceding phases** of that lifecycle. `mvn package` will run `validate`, `compile`, `test` … `package`. That is why the most common commands are `mvn clean verify` (a full check) and `mvn clean install`.

### Plugins and Goals

Phases themselves do nothing: the work is done by **goals** of **plugins** bound to the phases. For example, `maven-compiler-plugin:compile` is bound to the `compile` phase and `maven-surefire-plugin:test` to `test`. Goals can also be invoked directly, in the `plugin:goal` format:

```bash
mvn dependency:tree          # the tree goal of the dependency plugin
mvn versions:display-dependency-updates
mvn exec:java -Dexec.mainClass=pl.mini.App
```

A plugin is configured and bound to a phase in the `<build>` section:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.4.2</version>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>pl.mini.App</mainClass>   <!-- java -jar app.jar -->
                    </manifest>
                </archive>
            </configuration>
        </plugin>

        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <version>3.4.1</version>
            <executions>
                <execution>
                    <id>print-version</id>
                    <phase>package</phase>        <!-- binding a goal to a phase -->
                    <goals><goal>exec</goal></goals>
                    <configuration>
                        <executable>java</executable>
                        <arguments><argument>-version</argument></arguments>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

The execution order is determined as follows: phases run in lifecycle order, and within a phase the default goals run first, then your `execution`s in the order they are declared in the POM. Each goal runs once per module within a single build.

### Profiles — Conditional Configuration

A **profile** is a fragment of the POM applied only under a certain condition: explicit activation (`-P`), the presence of a property, the OS, the JDK version or a file.

```xml
<profiles>
    <profile>
        <id>ci</id>
        <activation>
            <property><name>env.CI</name></property>     <!-- the CI environment variable is set -->
        </activation>
        <properties>
            <skipITs>false</skipITs>
        </properties>
    </profile>
    <profile>
        <id>fast</id>
        <properties>
            <maven.test.skip>true</maven.test.skip>
        </properties>
    </profile>
</profiles>
```

```bash
mvn verify -Pfast            # explicitly enable a profile
mvn help:active-profiles     # which profiles are active
```

### The Super POM and Parent POMs

A minimal `pom.xml` is so short because it inherits everything else from the **super POM** built into Maven. That is where the standard directories (`src/main/java`), the `target` output directory, the Maven Central repository and the versions of the core plugins are defined. The complete, "expanded" project model is shown by:

```bash
mvn help:effective-pom
```

Similarly, you can inherit from your own **parent POM** (`<parent>`). Frameworks do this: Spring Boot provides `spring-boot-starter-parent` with preconfigured versions of hundreds of libraries and plugins.

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.4</version>
</parent>
```

## Multi-Module Projects

Large applications consist of several modules: the application, libraries, tests. They are combined by an **aggregator** — a POM with `packaging=pom` and a list of modules. Usually it is also the parent POM of the modules.

```text
shop/
├── pom.xml              ← aggregator + parent POM
├── shop-core/pom.xml    ← a library
└── shop-app/pom.xml     ← the application, depends on shop-core
```

```xml
<!-- shop/pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>pl.mini</groupId>
    <artifactId>shop</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>shop-core</module>
        <module>shop-app</module>
    </modules>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
    </properties>
</project>
```

```xml
<!-- shop/shop-app/pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>pl.mini</groupId>
        <artifactId>shop</artifactId>
        <version>1.0.0</version>
    </parent>
    <artifactId>shop-app</artifactId>

    <dependencies>
        <dependency>
            <groupId>pl.mini</groupId>
            <artifactId>shop-core</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</project>
```

Maven determines the build order of the modules from their dependencies by itself (the **reactor**):

```bash
mvn verify                        # all modules in the right order
mvn -pl shop-app -am package      # only shop-app and the modules it depends on (-am)
mvn -pl shop-core -amd test       # shop-core and the modules that depend on it (-amd)
```

## Useful Commands and Diagnostics

```bash
mvn -v                            # Maven and Java versions
mvn clean verify                  # a full build with tests
mvn -DskipTests package           # without running tests (but compiling them)
mvn test -Dtest=StackTest         # a single test class
mvn test -Dtest='StackTest#pop*'  # selected methods
mvn -q package                    # quiet mode
mvn -X package                    # debug output
mvn -o package                    # offline, local repository only
mvn -U package                    # force-update SNAPSHOT dependencies
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core
```

> [!TIP]
> Commit the **Maven Wrapper** to the repository (`mvn wrapper:wrapper` creates `mvnw`, `mvnw.cmd` and `.mvn/`). Then anyone can build the project with `./mvnw verify` using the same Maven version, without installing it first.

## Gradle

Gradle describes the build with a script in the **Kotlin DSL** (`build.gradle.kts`) or Groovy (`build.gradle`). The model differs from Maven's: instead of a fixed lifecycle there is a **task graph** with dependencies, as in a Makefile. The `java` plugin adds standard tasks and conventions.

```kotlin
// settings.gradle.kts
rootProject.name = "shop"
include("shop-core", "shop-app")
```

```kotlin
// shop-app/build.gradle.kts
plugins {
    application
}

java {
    toolchain { languageVersion = JavaLanguageVersion.of(21) }   // Gradle downloads the JDK itself
}

repositories { mavenCentral() }

dependencies {
    implementation(project(":shop-core"))                       // dependency on a module
    implementation("com.google.code.gson:gson:2.11.0")
    runtimeOnly("org.postgresql:postgresql:42.7.4")
    testImplementation(platform("org.junit:junit-bom:5.11.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application { mainClass = "pl.mini.shop.App" }

tasks.test { useJUnitPlatform() }
```

| Gradle | Maven scope |
| --- | --- |
| `implementation` | `compile`, but **not** visible to the module's consumers |
| `api` (the `java-library` plugin) | `compile`, visible to consumers |
| `compileOnly` | `provided` |
| `runtimeOnly` | `runtime` |
| `testImplementation` | `test` |

### Tasks and the Dependency Graph

You can declare a task yourself. Its **inputs** and **outputs** let Gradle skip the task if nothing has changed since the last run (**incremental build**, shown as `UP-TO-DATE` in the output) or take the result from the cache (`FROM-CACHE`).

```kotlin
val generateVersion by tasks.registering {
    val out = layout.buildDirectory.file("generated/version.txt")
    inputs.property("version", project.version)
    outputs.file(out)
    doLast {
        out.get().asFile.writeText("version=${project.version}\n")
    }
}

tasks.processResources {
    dependsOn(generateVersion)          // run before copying resources
    from(generateVersion)
}
```

```bash
./gradlew tasks                   # available tasks
./gradlew build                   # compile, test, package
./gradlew :shop-app:run           # run the module's application
./gradlew test --tests 'StackTest'
./gradlew build --scan            # a detailed build report
./gradlew dependencies --configuration runtimeClasspath
./gradlew build --dry-run         # show the task order without executing
```

Each task runs **at most once** per build, even if several others depend on it.

> [!NOTE]
> Which to choose? Maven is simpler, more predictable and still the most widespread in enterprise projects. Gradle is faster on large projects (cache, incrementality, parallelism) and the standard for Android. The principles — coordinates, dependencies, scopes, multiple modules — are shared.

## Running a Single File without a Project

Small utilities and experiments do not need a project. Since Java 11 you can run a single file:

```bash
java Hello.java Anna          # compile in memory and run; args = ["Anna"]
```

Since Java 22 (JEP 458) you can also run **a program consisting of several files** this way: classes from neighboring files in the same directory are compiled on demand.

On Unix systems a file can start with a **shebang** line and be run as a script. Such a file must not have the `.java` extension:

```java
#!/usr/bin/env -S java --source 21
// file: wc (no extension)
import java.io.*;

public class Wc {
    public static void main(String[] args) throws IOException {
        var in = new BufferedReader(new InputStreamReader(System.in));
        System.out.println(in.lines().count());
    }
}
```

```bash
chmod +x wc
cat Wc.java | ./wc
```

External libraries are added via the classpath: `java -cp "libs/*" Script.java`. When the program outgrows a single file, create a regular Maven or Gradle project (`mvn archetype:generate` or `gradle init`).
