---
title: Maven і Gradle
description: Системи збирання Java-проєктів: модель POM, координати й залежності, життєвий цикл і плагіни, профілі, батьківські POM, багатомодульні проєкти, Gradle і граф задач, діагностика, запуск одного файлу.
---

## Навіщо система збирання

Скомпілювати один файл можна командою `javac`. Але справжній проєкт — це сотні класів, десятки бібліотек зі своїми залежностями, тести, ресурси, пакування в JAR, публікація. **Система збирання** автоматизує це: завантажує бібліотеки, компілює код у правильному порядку, запускає тести, пакує результат. Її можна запускати і з IDE, і з командного рядка, що особливо важливо на серверах безперервної інтеграції (CI/CD).

У світі Java домінують два інструменти:

* **Apache Maven** — декларативна модель у файлі `pom.xml`, принцип *convention over configuration* (конвенція понад конфігурацію);
* **Gradle** — скрипт збирання на Kotlin або Groovy DSL, гнучкий граф задач, інкрементальне збирання й кеш.

Обидва використовують ту саму стандартну структуру каталогів і той самий репозиторій бібліотек **Maven Central**.

```text
my-app/
├── pom.xml                      (або build.gradle.kts + settings.gradle.kts)
├── mvnw, mvnw.cmd, .mvn/        wrapper — фіксує версію Maven
└── src/
    ├── main/java/               код програми
    ├── main/resources/          ресурси (потрапляють у JAR)
    ├── test/java/               тести
    └── test/resources/          ресурси тестів
target/                          результати збирання Maven (build/ у Gradle)
```

## Maven: файл pom.xml

Maven описує проєкт XML-файлом **POM** (Project Object Model). Мінімальний приклад консольного застосунку:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>pl.edu.pw.mini</groupId>        <!-- організація, перевернутий домен -->
    <artifactId>hello</artifactId>           <!-- назва артефакту -->
    <version>1.0.0-SNAPSHOT</version>        <!-- SNAPSHOT = версія в розробці -->
    <packaging>jar</packaging>               <!-- jar (за замовчуванням), pom, war -->

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

### Координати

Кожен артефакт однозначно ідентифікують **координати** `groupId:artifactId:version` (GAV), наприклад `com.google.code.gson:gson:2.11.0`. Так позначають і ваш проєкт, і кожну бібліотеку.

* Версія із суфіксом `-SNAPSHOT` — змінна, «у розробці»: Maven періодично перевіряє, чи не з'явилася нова збірка.
* Версія без суфікса — реліз, незмінний назавжди.

### Властивості

Елемент `<properties>` визначає пари ключ–значення, на які посилаються як `${назва}`. Деякі властивості читають плагіни: наприклад, `maven.compiler.release` визначає версію Java для компілятора. Доступні також вбудовані властивості: `${project.version}`, `${project.basedir}`, `${project.build.directory}` (зазвичай `target`), а також змінні середовища `${env.HOME}` і системні властивості JVM.

Властивість можна перевизначити з командного рядка:

```bash
mvn package -Djunit.version=5.10.2 -DskipTests
```

### Залежності та їхні області дії

Maven завантажує вказані бібліотеки з **Maven Central** у локальний репозиторій `~/.m2/repository` і підставляє їх у classpath. Залежність має **область дії** (scope):

| Scope | Компіляція коду | Тести | Під час виконання | Приклад |
| --- | --- | --- | --- | --- |
| `compile` (за замовчуванням) | так | так | так | Gson, Jackson |
| `provided` | так | так | ні (надає середовище) | Servlet API, Lombok |
| `runtime` | ні | так | так | драйвер JDBC |
| `test` | ні | так | ні | JUnit, Mockito |

### Транзитивні залежності та конфлікти версій

Залежності мають власні залежності, і Maven підтягує їх автоматично (**транзитивні залежності**). Якщо дві бібліотеки потребують різних версій тієї самої бібліотеки, Maven обирає **найближчу** до проєкту в дереві залежностей (nearest wins); за однакової глибини перемагає та, що оголошена першою.

```bash
mvn dependency:tree
# [INFO] pl.edu.pw.mini:hello:jar:1.0.0-SNAPSHOT
# [INFO] +- com.google.code.gson:gson:jar:2.11.0:compile
# [INFO] |  \- com.google.errorprone:error_prone_annotations:jar:2.27.0:compile
# [INFO] \- org.junit.jupiter:junit-jupiter:jar:5.11.0:test
# [INFO]    +- org.junit.jupiter:junit-jupiter-api:jar:5.11.0:test
# ...
```

Непотрібну транзитивну залежність можна виключити, а версію — зафіксувати централізовано:

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

Розділ `<dependencyManagement>` лише **фіксує версії** (сам залежність не додає). Модулі й транзитивні залежності отримують версію звідти. Особливий випадок — **BOM** (Bill of Materials): POM-файл із самим `dependencyManagement`, який імпортують, щоб узгодити версії цілого набору бібліотек:

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
<!-- далі junit-jupiter можна оголошувати без <version> -->
```

## Maven: життєвий цикл, фази й цілі

Maven не має довільних «таргетів» на кшталт Makefile. Збирання описує **життєвий цикл** — фіксована послідовність **фаз**. Основний цикл `default` (скорочено):

| Фаза | Що відбувається |
| --- | --- |
| `validate` | перевірка, що POM коректний |
| `generate-sources` | генерація коду (процесори анотацій, protobuf тощо) |
| `process-resources` | копіювання `src/main/resources` у `target/classes` |
| `compile` | компіляція `src/main/java` |
| `test-compile` | компіляція тестів |
| `test` | запуск модульних тестів (Surefire) |
| `package` | пакування в JAR/WAR |
| `integration-test` | інтеграційні тести (Failsafe) |
| `verify` | перевірка результатів інтеграційних тестів |
| `install` | копіювання артефакту в локальний репозиторій `~/.m2` |
| `deploy` | публікація у віддалений репозиторій |

Окремо існують цикли `clean` (видалення `target/`) і `site` (документація).

> [!IMPORTANT]
> Виклик фази виконує **всі попередні фази** цього циклу. `mvn package` виконає `validate`, `compile`, `test` … `package`. Тому найчастіші команди — `mvn clean verify` (повна перевірка) і `mvn clean install`.

### Плагіни та цілі

Самі фази нічого не роблять: роботу виконують **цілі** (goals) **плагінів**, прив'язані до фаз. Наприклад, `maven-compiler-plugin:compile` прив'язано до фази `compile`, а `maven-surefire-plugin:test` — до `test`. Цілі можна викликати й напряму, у форматі `плагін:ціль`:

```bash
mvn dependency:tree          # ціль tree плагіна dependency
mvn versions:display-dependency-updates
mvn exec:java -Dexec.mainClass=pl.mini.App
```

Плагін налаштовують і прив'язують до фази в розділі `<build>`:

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
                    <phase>package</phase>        <!-- прив'язка цілі до фази -->
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

Порядок виконання визначається так: фази виконуються в порядку циклу, а в межах фази — цілі за замовчуванням, потім ваші `execution` у порядку оголошення в POM. Кожна ціль у межах одного збирання виконується один раз для кожного модуля.

### Профілі — умовна конфігурація

**Профіль** — фрагмент POM, що застосовується лише за певної умови: явного вмикання (`-P`), наявності властивості, ОС, версії JDK чи файлу.

```xml
<profiles>
    <profile>
        <id>ci</id>
        <activation>
            <property><name>env.CI</name></property>     <!-- змінна середовища CI задана -->
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
mvn verify -Pfast            # явно ввімкнути профіль
mvn help:active-profiles     # які профілі активні
```

### Super POM і батьківський POM

Мінімальний `pom.xml` такий короткий, бо успадковує все інше від **super POM**, вбудованого в Maven. Саме там задано стандартні каталоги (`src/main/java`), каталог виводу `target`, репозиторій Maven Central і версії базових плагінів. Повну, «розгорнуту» модель проєкту показує команда:

```bash
mvn help:effective-pom
```

Так само можна успадковувати від власного **батьківського POM** (`<parent>`). Так роблять фреймворки: Spring Boot надає `spring-boot-starter-parent` з налаштованими версіями сотень бібліотек і плагінів.

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.4</version>
</parent>
```

## Багатомодульні проєкти

Великі застосунки складаються з кількох модулів: застосунок, бібліотеки, тести. Їх об'єднує **агрегатор** — POM з `packaging=pom` і переліком модулів. Зазвичай він водночас є батьківським POM для модулів.

```text
shop/
├── pom.xml              ← агрегатор + батьківський POM
├── shop-core/pom.xml    ← бібліотека
└── shop-app/pom.xml     ← застосунок, залежить від shop-core
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

Maven сам визначає порядок збирання модулів за їхніми залежностями (**reactor**):

```bash
mvn verify                        # усі модулі в правильному порядку
mvn -pl shop-app -am package      # лише shop-app і ті модулі, від яких він залежить (-am)
mvn -pl shop-core -amd test       # shop-core і модулі, що від нього залежать (-amd)
```

## Корисні команди та діагностика

```bash
mvn -v                            # версії Maven і Java
mvn clean verify                  # повне збирання з тестами
mvn -DskipTests package           # без запуску тестів (але з компіляцією)
mvn test -Dtest=StackTest         # один клас тестів
mvn test -Dtest='StackTest#pop*'  # вибрані методи
mvn -q package                    # тихий режим
mvn -X package                    # налагоджувальний вивід
mvn -o package                    # офлайн, лише локальний репозиторій
mvn -U package                    # примусово оновити SNAPSHOT-залежності
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core
```

> [!TIP]
> Комітьте в репозиторій **Maven Wrapper** (`mvn wrapper:wrapper` створює `mvnw`, `mvnw.cmd` і `.mvn/`). Тоді будь-хто збирає проєкт командою `./mvnw verify` тією самою версією Maven, без попереднього встановлення.

## Gradle

Gradle описує збирання скриптом на **Kotlin DSL** (`build.gradle.kts`) або Groovy (`build.gradle`). Модель інша, ніж у Maven: замість фіксованого життєвого циклу є **граф задач** (tasks) із залежностями, як у Makefile. Плагін `java` додає стандартні задачі й конвенції.

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
    toolchain { languageVersion = JavaLanguageVersion.of(21) }   // Gradle сам завантажить JDK
}

repositories { mavenCentral() }

dependencies {
    implementation(project(":shop-core"))                       // залежність від модуля
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
| `implementation` | `compile`, але **не** видно споживачам модуля |
| `api` (плагін `java-library`) | `compile`, видно споживачам |
| `compileOnly` | `provided` |
| `runtimeOnly` | `runtime` |
| `testImplementation` | `test` |

### Задачі та граф залежностей

Задачу можна оголосити самостійно. Її **входи** (inputs) і **виходи** (outputs) дозволяють Gradle пропускати задачу, якщо з минулого разу нічого не змінилося (**інкрементальне збирання**, у виводі видно `UP-TO-DATE`), або брати результат з кешу (`FROM-CACHE`).

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
    dependsOn(generateVersion)          // виконати перед копіюванням ресурсів
    from(generateVersion)
}
```

```bash
./gradlew tasks                   # доступні задачі
./gradlew build                   # компіляція, тести, пакування
./gradlew :shop-app:run           # запустити застосунок модуля
./gradlew test --tests 'StackTest'
./gradlew build --scan            # детальний звіт про збирання
./gradlew dependencies --configuration runtimeClasspath
./gradlew build --dry-run         # показати порядок задач без виконання
```

Кожна задача виконується **не більше одного разу** за збирання, навіть якщо від неї залежить кілька інших.

> [!NOTE]
> Що обрати? Maven простіший, передбачуваніший і досі найпоширеніший у корпоративних проєктах. Gradle швидший на великих проєктах (кеш, інкрементальність, паралелізм) і стандартний для Android. Принципи — координати, залежності, scope, багатомодульність — у них спільні.

## Запуск одного файлу без проєкту

Для невеликих утиліт і експериментів проєкт не потрібен. З Java 11 можна запустити один файл:

```bash
java Hello.java Anna          # компіляція в пам'яті й запуск; args = ["Anna"]
```

З Java 22 (JEP 458) так можна запускати і **програму з кількох файлів**: класи з сусідніх файлів у тому самому каталозі компілюються за потреби.

На Unix-системах файл може починатися рядком **shebang** і запускатися як скрипт. Такий файл не повинен мати розширення `.java`:

```java
#!/usr/bin/env -S java --source 21
// файл: wc (без розширення)
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

Зовнішні бібліотеки підключають через classpath: `java -cp "libs/*" Script.java`. Коли програма переростає один файл, створюють звичайний проєкт Maven або Gradle (`mvn archetype:generate` чи `gradle init`).
