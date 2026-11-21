---
title: Інтерфейси
description: Інтерфейси як контракти без стану, реалізація кількох інтерфейсів, розширення інтерфейсів, default-, static- і private-методи, конфлікти default-методів, маркерні й функціональні інтерфейси.
---

## Інтерфейси

Інтерфейс схожий на абстрактний клас, але з ключовою відмінністю: він **описує контракт поведінки і не має стану екземпляра** (полів). Найближчий аналог з C++ — клас, усі члени якого чисто віртуальні.

* Інтерфейс може містити абстрактні методи, **default**-методи з реалізацією, **static**-методи, **private**-методи (допоміжні для default) і **константи**.
* Полів екземпляра немає: кожне «поле» інтерфейсу неявно `public static final`.
* Абстрактні й default-методи неявно `public`; методи без тіла неявно `abstract`.
* Клас може реалізовувати **багато** інтерфейсів (`implements A, B, C`), хоча наслідує лише один клас.

Ось спрощене визначення інтерфейсу `Iterator` з пакета `java.util`:

```java
public interface Iterator<E> {
    boolean hasNext();
    E next();

    default void remove() {
        throw new UnsupportedOperationException("remove");
    }
}
```

На відміну від деяких мов, назви інтерфейсів не мають префікса `I`: `List`, `Comparable`, `Runnable`. Реалізувати інтерфейс означає надати реалізацію всім його методам, які не мають реалізації за замовчуванням:

```java
public class Countdown implements Iterator<Integer> {
    private int count;

    public Countdown(int count) { this.count = count; }

    @Override
    public boolean hasNext() { return count > 0; }

    @Override
    public Integer next() {
        if (!hasNext()) throw new NoSuchElementException();
        return count--;
    }
}
```

Посилання поліморфні з усіма інтерфейсами, які реалізує тип:

```java
Iterator<Integer> it = new Countdown(5);
while (it.hasNext()) {
    System.out.print(it.next());     // 54321
}
System.out.println();
```

Клас, що не реалізує всіх абстрактних методів, мусить бути `abstract`.

## Розширення інтерфейсів

Інтерфейс може **розширювати** (`extends`) один або кілька інших інтерфейсів, включаючи всі їхні члени:

```java
public interface Undoable {
    void undo();
}

public interface Redoable extends Undoable {
    void redo();
}

public interface Editor extends Redoable, AutoCloseable {
    void type(String text);
}
```

Клас, що реалізує `Editor`, мусить реалізувати `type`, `redo`, `undo` і `close`.

## Методи за замовчуванням (default)

Від Java 8 інтерфейс може надати **реалізацію за замовчуванням**. Реалізувати такий метод у класі необов'язково. Механізм з'явився, щоб додавати нові методи до наявних інтерфейсів, не ламаючи тисяч реалізацій: так у `Collection` з'явилися `stream()` і `removeIf`, а в `Iterable` — `forEach`.

```java
public interface Logger {
    void log(String message);

    default void info(String message) {
        log("[INFO] " + message);
    }

    default void error(String message, Throwable t) {
        log("[ERROR] " + message + ": " + t);
    }
}

public class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println(LocalTime.now().withNano(0) + " " + message);
    }
    // info і error успадковано
}

new ConsoleLogger().info("start");   // 10:15:30 [INFO] start
```

Default-метод може викликати інші методи інтерфейсу, але не має доступу до стану (його просто немає).

### Конфлікти default-методів

Якщо клас отримує методи з однаковою сигнатурою з кількох джерел, діють правила:

1. **Клас перемагає**: метод, оголошений у класі чи надкласі, має пріоритет над default-методом інтерфейсу.
2. **Конкретніший інтерфейс перемагає**: якщо `B extends A` і обидва мають default `m()`, обирається версія з `B`.
3. Інакше — **неоднозначність**: клас мусить перевизначити метод явно. Реалізацію конкретного інтерфейсу викликають синтаксисом `Інтерфейс.super.метод()`.

```java
interface Walker { default String move() { return "іде"; } }
interface Swimmer { default String move() { return "пливе"; } }

class Duck implements Walker, Swimmer {
    @Override
    public String move() {                          // обов'язково, інакше помилка компіляції
        return Walker.super.move() + " і " + Swimmer.super.move();
    }
}

System.out.println(new Duck().move());   // іде і пливе
```

Окремої «явної реалізації» методу для конкретного інтерфейсу немає: у класі може бути лише один метод з даною сигнатурою, і він реалізує її для **всіх** інтерфейсів одночасно.

## Статичні та приватні методи

Інтерфейс може мати **статичні методи**: зазвичай це фабрики й утиліти, пов'язані з контрактом. Їх викликають лише через ім'я інтерфейсу; вони не успадковуються реалізаціями.

```java
public interface Shape {
    double area();

    static Shape circle(double r) { return () -> Math.PI * r * r; }
    static Shape square(double a) { return () -> a * a; }

    default String describe() {
        return "фігура з площею " + format(area());
    }

    private static String format(double v) {     // допоміжний, невидимий ззовні (Java 9)
        return String.format(Locale.ROOT, "%.2f", v);
    }
}

Shape s = Shape.circle(1);
System.out.println(s.describe());               // фігура з площею 3.14
```

Приклади зі стандартної бібліотеки: `List.of(...)`, `Comparator.comparing(...)`, `Map.entry(k, v)`, `Path.of(...)`.

> [!NOTE]
> Статичні методи інтерфейсу **не поліморфні**: «абстрактних статичних» методів, які кожна реалізація мусить надати, у Java немає. Якщо потрібна «фабрика типу», її передають як об'єкт: `Supplier<T>`, `Comparator<T>` чи власний інтерфейс-фабрику.

## Константи в інтерфейсах

Будь-яке поле інтерфейсу неявно є `public static final`:

```java
public interface HttpStatus {
    int OK = 200;
    int NOT_FOUND = 404;
}
```

Інтерфейс лише з константами вважається антипатерном (constant interface): клас, що його реалізує, «засмічує» свій API чужими константами. Константи краще тримати в класі з приватним конструктором або в enum.

## Маркерні та функціональні інтерфейси

* **Маркерний** інтерфейс не має методів і лише позначає тип: `Serializable`, `Cloneable`, `RandomAccess`. У новому коді для цього частіше використовують анотації.
* **Функціональний** інтерфейс має рівно **один абстрактний метод** (`Runnable`, `Comparator<T>`, `Function<T, R>`). Його реалізацію можна записати лямбда-виразом (сторінка «Функціональні інтерфейси»).

```java
Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());
Runnable hello = () -> System.out.println("Hello");
```

## Інтерфейс чи абстрактний клас

| | Інтерфейс | Абстрактний клас |
| --- | --- | --- |
| Стан (поля екземпляра) | немає | є |
| Конструктори | немає | є |
| Скільки можна реалізувати/наслідувати | багато | один |
| Модифікатори методів | `public` (і `private` допоміжні) | будь-які |
| Призначення | можливість, роль: «вміє» (`Comparable`, `Closeable`) | спільна реалізація споріднених класів: «є різновидом» |

Типовий підхід у JDK — поєднання обох: інтерфейс задає контракт (`List`), а абстрактний клас (`AbstractList`) реалізує більшу його частину, щоб конкретним реалізаціям лишилося написати кілька методів.
