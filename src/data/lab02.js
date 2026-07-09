export const lab02 = {
  id: "Lab02",
  title: "Лабораторна 2: Maven, Unit Tests, Java CLI",
  description: "Основи побудови багатомодульних проектів, управління залежностями та модульне тестування.",
  sections: [
    {
      title: "Task 1: Структура Maven (Багатомодульний проект)",
      content: `
Замість того, щоб тримати весь код у купі, великі проекти розбивають на незалежні модулі. У Java стандартним інструментом для управління проектами та збіркою є **Maven** (або Gradle).
Ми створимо програму для перевірки надійності паролів, яка складатиметься з двох частин:
1. Бібліотеки з бізнес-логікою (\`PasswordValidatorLib\`).
2. Консольного застосунку (\`PasswordValidatorApp\`), який використовує цю бібліотеку.

### 1. Створення батьківського проекту
Створіть нову папку \`PasswordValidator\` та ініціалізуйте в ній головний файл \`pom.xml\` (Project Object Model). Це буде "батьківський" проект.

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.example</groupId>
    <artifactId>PasswordValidator</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>PasswordValidatorLib</module>
        <module>PasswordValidatorApp</module>
    </modules>
</project>
\`\`\`

### 2. Створення модулів
Усередині папки \`PasswordValidator\` створіть дві підпапки: \`PasswordValidatorLib\` та \`PasswordValidatorApp\`. У кожній з них створіть базову структуру Maven:
* \`src/main/java/\`
* \`src/test/java/\`
* Власний \`pom.xml\`.

Приклад \`pom.xml\` для \`PasswordValidatorApp\`:
\`\`\`xml
    <parent>
        <groupId>org.example</groupId>
        <artifactId>PasswordValidator</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <artifactId>PasswordValidatorApp</artifactId>
\`\`\`

### 3. Зв'язування проектів
Щоб застосунок міг викликати код з бібліотеки, нам потрібно додати залежність в \`PasswordValidatorApp/pom.xml\`:
\`\`\`xml
    <dependencies>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>PasswordValidatorLib</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
\`\`\`
`
    },
    {
      title: "Task 2: Розробка коду та управління залежностями",
      content: `
### 1. Частина бібліотеки
У модулі \`PasswordValidatorLib\` (в папці \`src/main/java/org/example/\`) створіть два файли:
* \`ValidationError.java\` — публічний \`enum\` можливих помилок (наприклад, \`TOO_SHORT\`, \`NO_LOWERCASE\`, \`NO_SPECIAL_CHAR\`).
* \`PasswordValidator.java\` — клас із методом \`public List<ValidationError> validate(String password)\`.

Щоб не поміщати всю логіку в один метод, розбийте перевірки на окремі приватні (або package-private) методи:
* \`boolean validateLength(String password)\`: перевіряє, чи має пароль мінімум 8 символів.
* \`boolean validateHasLowerCase(String password)\`: перевіряє наявність малої літери.
* \`boolean validateContainsSpecialCharacter(String password)\`: перевіряє наявність хоча б одного знаку \`!@#$%^&*(),.?":{}|<>\`.

У методі \`validate\` викликайте ці перевірки і, якщо якась не проходить, додавайте відповідний \`ValidationError\` до списку і повертайте його.

### 2. Консольна частина
У модулі \`PasswordValidatorApp\` створіть клас \`Main\` з методом \`public static void main(String[] args)\`.
Використовуючи клас \`Scanner\`, в циклі запитуйте у користувача пароль:
* Створіть об'єкт \`PasswordValidator\` (використовуйте імпорт з бібліотеки).
* Викличте метод \`validate()\`.
* Якщо список помилок порожній, виведіть \`"✓ Password is valid and safe!"\`.
* Якщо є помилки, виведіть \`"✗ Password is invalid:"\` і для кожної помилки виведіть її опис з нового рядка.
* Якщо користувач введе \`exit\`, завершіть роботу програми.

### 3. Зовнішні залежності (Maven Repository)
Уявимо, що ви хочете додати кольоровий текст у консоль. Замість того, щоб писати ANSI-коди вручну, ви можете скористатися готовою бібліотекою з [Maven Central Repository](https://mvnrepository.com/).

Додайте в \`pom.xml\` модуля \`PasswordValidatorApp\` бібліотеку **Jansi** (або будь-яку подібну для кольорів):
\`\`\`xml
<dependency>
    <groupId>org.fusesource.jansi</groupId>
    <artifactId>jansi</artifactId>
    <version>2.4.0</version>
</dependency>
\`\`\`
Після оновлення Maven (кнопка \`Load Maven Changes\` в IDE), використайте класи бібліотеки, щоб розфарбувати вивід: зелений колір для успіху, червоний — для помилок.
`
    },
    {
      title: "Task 3: Модульні тести (JUnit 5)",
      content: `
Останнім кроком є написання тестів для нашої бібліотеки. Тести перевіряють, що кожна "одиниця" коду діє саме так, як очікувалося.

Хороший тест будується за схемою **Arrange-Act-Assert (AAA)**:
1. **Arrange (Підготовка):** Налаштування даних та створення об'єктів.
2. **Act (Дія):** Виклик методу, який ми тестуємо.
3. **Assert (Перевірка):** Перевірка результату на відповідність очікуванням.

### 1. Налаштування JUnit
Додайте в \`pom.xml\` модуля \`PasswordValidatorLib\` залежність на JUnit 5:
\`\`\`xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
\`\`\`
*(Зверніть увагу на \`<scope>test</scope>\` — ця бібліотека не потрапить у фінальний білд програми, вона доступна лише при запуску тестів).*

### 2. Написання тестів
Створіть клас \`PasswordValidatorTest\` у папці \`src/test/java/org/example/\`.
Напишіть перший тест згідно зі схемою AAA:

\`\`\`java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {
    @Test
    void validate_ValidPassword_ReturnsEmptyErrorList() {
        // Arrange
        PasswordValidator validator = new PasswordValidator();
        String password = "StrongPassword123!";
        
        // Act
        var errors = validator.validate(password);
        
        // Assert
        assertTrue(errors.isEmpty(), "Список помилок має бути порожнім");
    }
}
\`\`\`

Часто застосовується підхід **Test Driven Development (TDD)**: ви спочатку пишете тест, він падає (бо логіки ще немає), а потім пишете код, щоб тест пройшов.

**Завдання:** Допишіть наступні тести:
* \`validate_PasswordHasNoSpecialCharacter_ReturnsError\`
* \`validate_EmptyString_ReturnsMultipleErrors\`
* \`validate_ShortPassword_ReturnsTooShortError\`

Запустіть тести з консолі командою \`mvn test\` або через графічний інтерфейс IntelliJ IDEA.
`
    }
  ],
  quiz: [
    {
      question: "Яка стандартна директорія використовується у Maven для зберігання початкового коду основної програми?",
      options: [
        "src/",
        "src/main/java/",
        "src/main/code/",
        "java/src/"
      ],
      answer: 1,
      explanation: "Maven використовує конвенцію `src/main/java/` для основних вихідних файлів (джерел) та `src/test/java/` для модульних тестів."
    },
    {
      question: "Яка анотація з JUnit 5 вказує на те, що метод є тестовим?",
      options: [
        "@TestCase",
        "@Check",
        "@Test",
        "@RunTest"
      ],
      answer: 2,
      explanation: "У JUnit (і 4, і 5) тестові методи позначаються анотацією `@Test` (наприклад: `org.junit.jupiter.api.Test`)."
    }
  ]
};
