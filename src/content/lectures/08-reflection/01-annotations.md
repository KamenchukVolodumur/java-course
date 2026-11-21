---
title: Анотації
description: Анотації як метадані коду, оголошення власних анотацій і їхні елементи, мета-анотації Retention і Target, куди можна поставити анотацію, повторювані й успадковувані анотації, вбудовані анотації компілятора, інформація про місце виклику через StackWalker.
---

## Анотації

Анотації — «мітки», які прикріплюють до елементів коду: класів, методів, полів, параметрів, пакетів, модулів і навіть до використань типів. Вони зберігають **метадані** про позначений елемент.

Самі анотації **нічого не роблять**: це пасивна інформація. Діяти на її основі можуть компілятор (`@Override`), інструменти збирання, процесори анотацій під час компіляції або сама програма під час виконання через рефлексію (JUnit, Spring, Jackson, Hibernate).

Анотацію пишуть із символом `@` перед елементом:

```java
@Deprecated(since = "2.0", forRemoval = true)
public static long fibonacci(int n) {
    if (n < 0) throw new IllegalArgumentException("n має бути невід'ємним: " + n);
    if (n <= 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

> [!NOTE]
> Використання методу з `@Deprecated(forRemoval = true)` компілятор позначить попередженням: `warning: [removal] fibonacci(int) in FibUtils has been deprecated and marked for removal`. Пояснення, чим замінити метод, пишуть у Javadoc-тегу `@deprecated`.

## Оголошення анотації

Анотацію оголошують ключовим словом `@interface`. Її **елементи** записують як методи без параметрів; значення за замовчуванням задає `default`. Ось спрощене визначення вбудованої `@Deprecated`:

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({CONSTRUCTOR, FIELD, LOCAL_VARIABLE, METHOD, PACKAGE, MODULE, PARAMETER, TYPE})
public @interface Deprecated {
    String since() default "";
    boolean forRemoval() default false;
}
```

Неявно кожна анотація реалізує інтерфейс `java.lang.annotation.Annotation`. Наслідувати інші анотації чи класи не можна.

## Параметри анотацій

Значення елементів передають у дужках у вигляді `ім'я = значення`:

```java
@Deprecated
public void oldMethod() { }

@Deprecated(since = "1.5")
public void veryOldMethod() { }

@Deprecated(since = "1.5", forRemoval = true)
public void anotherVeryOldMethod() { }
```

* Якщо елементів немає або всі мають значення за замовчуванням, дужки пропускають.
* Якщо задається лише елемент з ім'ям **`value`**, його ім'я можна не писати: `@SuppressWarnings("unchecked")` замість `@SuppressWarnings(value = "unchecked")`.
* Масив з одного елемента можна передати без фігурних дужок: `@SuppressWarnings({"unchecked", "rawtypes"})` або `@SuppressWarnings("unchecked")`.

> [!WARNING]
> Значення елементів мають бути **константами часу компіляції**. Допустимі типи елементів: примітиви, `String`, `Class<?>`, enum, інші анотації та **одновимірні** масиви цих типів. `null` як значення заборонено, тож «відсутність» виражають значенням за замовчуванням (наприклад, `""` чи спеціальним класом-маркером).

## Мета-анотації

Анотації, якими позначають оголошення інших анотацій, визначають їхню поведінку.

### @Retention — як довго зберігається

| Політика | Де анотація доступна | Приклади використання |
| --- | --- | --- |
| `SOURCE` | лише у вихідному коді; компілятор її відкидає | `@Override`, `@SuppressWarnings`, Lombok, процесори анотацій |
| `CLASS` (за замовчуванням) | у файлі `.class`, але **не** під час виконання | інструменти аналізу й перетворення байт-коду |
| `RUNTIME` | у `.class` і доступна рефлексії під час виконання | JUnit `@Test`, Spring `@Component`, Jackson `@JsonProperty` |

### @Target — до чого можна прикріпити

`@Target` приймає масив значень `ElementType`. Без `@Target` анотацію можна поставити майже на будь-яке оголошення.

| `ElementType` | Елемент |
| --- | --- |
| `TYPE` | клас, інтерфейс, enum, record, анотація |
| `FIELD` | поле (зокрема константа enum) |
| `METHOD` | метод |
| `PARAMETER` | параметр методу чи конструктора |
| `CONSTRUCTOR` | конструктор |
| `LOCAL_VARIABLE` | локальна змінна |
| `ANNOTATION_TYPE` | інша анотація (мета-анотація) |
| `PACKAGE` | пакет (у `package-info.java`) |
| `MODULE` | модуль (у `module-info.java`) |
| `TYPE_PARAMETER` | параметр типу generic (`<@NonNull T>`) |
| `TYPE_USE` | будь-яке **використання** типу |
| `RECORD_COMPONENT` | компонент record |

### Інші мета-анотації

* **`@Documented`** — анотація потрапляє в документацію Javadoc позначеного елемента.
* **`@Inherited`** — анотацію **класу** успадковують підкласи (для методів, полів та інтерфейсів не діє).
* **`@Repeatable`** — анотацію можна поставити кілька разів на той самий елемент.

## Де можна поставити анотацію

```java
@Description("модуль")                         // module-info.java
module pl.mini.shop { }

@Description("пакет")                          // package-info.java
package pl.mini.shop;

@Description("клас")
public class Stack<@Description("параметр типу") T> {

    @Description("поле")
    private T[] items;

    @Description("конструктор")
    public Stack() { }

    @Description("метод")
    public void push(@Description("параметр") T item) {
        @Description("локальна змінна") int size = items.length;
    }

    // TYPE_USE: анотація стосується самого типу в місці його використання
    private List<@NonNull String> names;
    private String @NonNull [] array;
    public @NonNull T pop() { ... }
}

public record Point(@Description("компонент record") int x, int y) { }
```

Анотація `TYPE_USE` описує не оголошення, а **тип**: `List<@NonNull String>` означає «список, елементи якого не можуть бути null». На таких анотаціях побудовано статичні аналізатори нульових значень (JSpecify, Checker Framework).

### Кілька анотацій

На одному елементі можна поставити кілька різних анотацій (порядок значення не має):

```java
@Test
@Timeout(1)
@DisplayName("сортування великого масиву")
void sortsLargeArray() { }
```

Щоб ту саму анотацію можна було поставити **кілька разів**, її позначають `@Repeatable` з **контейнерною** анотацією:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(Schedules.class)
public @interface Schedule {
    String cron();
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Schedules {
    Schedule[] value();                  // контейнер
}

@Schedule(cron = "0 0 8 * * MON-FRI")
@Schedule(cron = "0 0 10 * * SAT")
public void sendReport() { }
// компілятор загортає їх у @Schedules({...})
```

Під час виконання повторювані анотації читають методом `getAnnotationsByType(Schedule.class)`.

## Вбудовані анотації

| Анотація | Що робить |
| --- | --- |
| `@Override` | помилка компіляції, якщо метод нічого не перевизначає |
| `@Deprecated` | попередження під час використання застарілого елемента |
| `@SuppressWarnings("...")` | вимикає попередження компілятора (`unchecked`, `rawtypes`, `deprecation`, `removal`) |
| `@FunctionalInterface` | перевірка, що інтерфейс має рівно один абстрактний метод |
| `@SafeVarargs` | метод з generic varargs безпечний; прибирає попередження |
| `@Serial` | позначає члени, пов'язані із серіалізацією (`serialVersionUID`), для перевірки компілятором |

## Інформація про місце виклику

Іноді методу (наприклад, логеру чи перевірці) потрібно знати, **звідки** його викликали: ім'я методу, клас, номер рядка. Під час виконання це дає `StackWalker` (Java 9):

```java
public static void fail(String message) {
    StackWalker.StackFrame caller = StackWalker.getInstance()
            .walk(frames -> frames.skip(1).findFirst())   // 0 — сам fail, 1 — той, хто його викликав
            .orElseThrow();

    System.err.println(message);
    System.err.println("  Викликано з: " + caller.getClassName() + "." + caller.getMethodName());
    System.err.println("  Файл: " + caller.getFileName());
    System.err.println("  Рядок: " + caller.getLineNumber());
    System.exit(1);
}

public static void loadConfiguration(Path configFile) {
    if (!Files.exists(configFile)) {
        fail("Файл конфігурації не знайдено: " + configFile);    // рядок 24
    }
    System.out.println("Конфігурацію завантажено з " + configFile);
}
```

```text
Файл конфігурації не знайдено: appsettings.json
  Викликано з: pl.mini.App.loadConfiguration
  Файл: App.java
  Рядок: 24
```

Обхід стеку — відносно дорога операція (дешевша, ніж створення винятку заради його stack trace, але не безкоштовна). Тому бібліотеки логування визначають місце виклику лише тоді, коли воно справді виводиться (наприклад, шаблони `%L` і `%M` у Logback).
