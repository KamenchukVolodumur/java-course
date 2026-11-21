---
title: Класи
description: Оголошення класів і їхні модифікатори, поля, методи й локальні класи, конструктори, блоки ініціалізації та їх порядок, статичні члени, гетери й сетери, незмінні класи, фіналізатори.
---

## Оголошення класу

Клас оголошують так:

```java
public class ClassName {
}
```

Перед ключовим словом `class` можуть стояти модифікатори:

* `public` — клас видно всюди; публічний верхньорівневий клас мусить лежати у файлі з такою самою назвою;
* *(без модифікатора)* — клас видно лише в межах свого **пакета** (package-private);
* `abstract` — екземпляр класу створити неможливо; клас може містити абстрактні методи без реалізації;
* `final` — від класу не можна наслідуватися (`String`, `Integer`);
* `sealed` / `non-sealed` — наслідуватися можуть лише явно перелічені класи (сторінка «Наслідування»);
* `static` — лише для **вкладених** класів (сторінка «Вкладені типи»).

Кожен член класу має власний модифікатор доступу (`public`, `protected`, `private` або відсутній — доступ у межах пакета):

```java
public class MyClass {
    public int member1;
    private String member2;
    protected float member3;
    long member4;               // package-private
}
```

У Java немає розділення на оголошення (заголовок) і реалізацію: увесь код класу пишеться в одному місці, у файлі `.java`.

## Поля

Поле — це змінна, що належить класу (статичне поле) або кожному його об'єкту (поле екземпляра).

```java
public class Student {
    private String name;                  // поле екземпляра
    private final String index;           // присвоюється рівно один раз
    private int year = 1;                 // ініціалізатор поля
    private static int created = 0;       // одне поле на весь клас
    public static final int MAX_YEAR = 7; // константа
}
```

* `final`-поле треба присвоїти **рівно один раз**: в ініціалізаторі, у блоці ініціалізації або в **кожному** конструкторі. Після завершення конструктора змінити його не можна.
* `static final` з константним виразом — константа часу компіляції.
* Поля без ініціалізатора отримують значення за замовчуванням (`0`, `false`, `null`) ще до виклику конструктора.

За конвенцією поля, методи й змінні пишуть у стилі `camelCase`, класи — `PascalCase`, константи — `UPPER_SNAKE_CASE`. Префіксів на кшталт `_name` чи `m_name` у Java не використовують.

## Методи

Метод оголошується разом із тілом:

```java
public class Calculator {
    public int twice(int x) {
        return x * 2;
    }

    public static int square(int x) {     // статичний метод: викликається через ім'я класу
        return x * x;
    }
}

int a = new Calculator().twice(4);   // 8
int b = Calculator.square(4);        // 16
```

Скороченого синтаксису «метод = вираз» у Java немає: тіло методу — завжди блок `{ }` (лямбди мають скорочений синтаксис, але це не методи класу).

Окремих **локальних функцій** у Java теж немає. Допоміжну логіку всередині методу виражають лямбдою (сторінка «Функціональні інтерфейси») або локальним класом чи record:

```java
void printReport(List<Order> orders) {
    IntConsumer printInt = value -> System.out.println("> " + value);   // «локальна функція»
    printInt.accept(1);

    record Line(String customer, BigDecimal total) { }                  // локальний record
    List<Line> lines = orders.stream().map(o -> new Line(o.customer(), o.total())).toList();
}
```

## Конструктори

Конструктор має ім'я класу й не має типу результату. Списків ініціалізації, як у C++, немає: поля присвоюються в тілі конструктора. Щоб звернутися до поля, яке затінене параметром, використовують `this`.

Конструктор може викликати інший конструктор того самого класу через `this(...)`. Такий виклик має бути **першою** інструкцією.

```java
public class Book {
    private final String title;
    private final int year;

    public Book(String title) {
        this(title, 0);                   // делегування іншому конструктору
    }

    public Book(String title, int year) {
        if (title == null || title.isBlank())
            throw new IllegalArgumentException("Назва обов'язкова");
        this.title = title;
        this.year = year;
    }
}
```

Якщо клас не оголошує **жодного** конструктора, компілятор додає **конструктор за замовчуванням** без параметрів (з видимістю класу). Щойно ви оголосите будь-який конструктор, автоматичного вже не буде.

> [!TIP]
> Приватний конструктор забороняє створювати екземпляри ззовні. Так оформлюють утилітні класи (`private Math() { }`) і класи зі статичними фабриками: `LocalDate.of(2025, 3, 14)`, `List.of(...)`. Фабрики можуть мати зрозумілі імена, повертати кешовані об'єкти чи підтипи.

## Блоки ініціалізації та порядок ініціалізації

Окрім конструкторів, клас може мати **блоки ініціалізації**: блок екземпляра виконується під час кожного створення об'єкта, статичний — один раз, коли клас завантажується (під час першого використання).

```java
public class Demo {
    static int counter;
    static {
        System.out.println("1. статичний блок");      // один раз на клас
        counter = 100;
    }

    private int a = initA();                           // ініціалізатор поля
    {
        System.out.println("3. блок екземпляра");
    }
    private int b = 2;

    public Demo() {
        System.out.println("4. тіло конструктора");
    }

    private int initA() {
        System.out.println("2. ініціалізатор поля a");
        return 1;
    }
}
```

Порядок створення об'єкта:

1. (один раз) статичні ініціалізатори та статичні блоки — у порядку в тексті;
2. виклик конструктора надкласу (`super(...)`, явний або неявний);
3. ініціалізатори полів і блоки екземпляра — **у порядку в тексті класу**;
4. тіло конструктора.

## Статичні члени

Статичні поля й методи належать **класу**, а не об'єкту. Вони існують в одному екземплярі, навіть якщо об'єктів немає. Статичний метод не має `this` і не може напряму звертатися до полів екземпляра.

```java
public class IdGenerator {
    private static long next = 1;

    public static long nextId() {
        return next++;
    }
}

long id = IdGenerator.nextId();
```

Окремих «статичних класів» у Java немає. Клас, що містить лише статичні методи, оформлюють як `final`-клас із приватним конструктором (`Math`, `Collections`, `Arrays`, `Objects`).

## Доступ до стану: гетери й сетери

Окремої мовної конструкції «властивість» у Java немає. Поля роблять `private`, а доступ дають через методи. За конвенцією **JavaBeans** вони називаються `getX()`/`setX(value)`, для `boolean` — `isX()`. На цю конвенцію спираються бібліотеки (Jackson, Hibernate, Spring), а IDE генерує такі методи автоматично.

```java
public class ShopItem {
    private String name;
    private BigDecimal price = BigDecimal.ZERO;

    public String getName() { return name; }
    public void setName(String name) { this.name = name.strip(); }   // логіка при присвоєнні

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) {
        this.price = price.max(BigDecimal.ZERO);        // ціна не буває від'ємною
    }
}

ShopItem book = new ShopItem();
book.setPrice(new BigDecimal("9.99"));
book.setPrice(book.getPrice().subtract(BigDecimal.ONE));
System.out.println("Ціна: " + book.getPrice());       // Ціна: 8.99
```

Сетер можна не надавати (властивість «лише для читання»), зробити менш доступним (`protected`/package-private) або перевіряти аргумент. Для **незмінних** даних замість пари гетер/сетер використовують `final`-поля, присвоєні в конструкторі, або records, у яких аксесори називаються як поля: `point.x()`.

### Доступ «за індексом»

Перевантажити оператор `[]` неможливо. Класи, що поводяться як колекції, надають методи `get(index)` і `set(index, value)`:

```java
public class Sentence {
    private final String[] words;

    public Sentence(String sentence) { this.words = sentence.split(" "); }

    public String get(int i) { return words[i]; }
    public void set(int i, String word) { words[i] = word; }
    public int size() { return words.length; }
}

Sentence s = new Sentence("The quick brown fox jumps over lazy dog");
s.set(1, "swift");
System.out.println(s.get(3));     // fox
```

## Створення об'єктів з багатьма параметрами

Окремого синтаксису ініціалізатора об'єкта (присвоєння полів одразу після `new`) у Java немає. Якщо необов'язкових параметрів багато, використовують патерн **Builder**:

```java
public final class Hamster {
    private final String name;
    private final boolean likesViolence;

    private Hamster(Builder b) {
        this.name = b.name;
        this.likesViolence = b.likesViolence;
    }

    public static Builder builder(String name) { return new Builder(name); }

    public static final class Builder {
        private final String name;
        private boolean likesViolence;

        private Builder(String name) { this.name = name; }

        public Builder likesViolence(boolean v) { this.likesViolence = v; return this; }
        public Hamster build() { return new Hamster(this); }
    }
}

Hamster h = Hamster.builder("Boo").likesViolence(true).build();
```

## Незмінні класи

Незмінний (immutable) об'єкт після створення ніколи не змінює стану. Такі об'єкти простіше розуміти, їх безпечно передавати між потоками й використовувати як ключі мап. Рецепт:

1. клас `final` (щоб підклас не додав змінного стану);
2. усі поля `private final`;
3. жодних сетерів; методи «зміни» повертають **новий** об'єкт (`withX(...)`);
4. змінювані компоненти (масиви, колекції) копіюються в конструкторі й не віддаються назовні напряму.

```java
public final class Money {
    private final BigDecimal amount;
    private final String currency;

    public Money(BigDecimal amount, String currency) {
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = Objects.requireNonNull(currency);
    }

    public Money plus(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("Різні валюти");
        return new Money(amount.add(other.amount), currency);   // новий об'єкт
    }

    public BigDecimal amount() { return amount; }
    public String currency() { return currency; }
}
```

Records (сторінка «Records і типи-значення») реалізують більшу частину цього рецепта автоматично.

## Фіналізатори

Деструкторів у Java немає: пам'ять звільняє збирач сміття, і невідомо, **коли** це станеться (і чи взагалі станеться до завершення програми). Метод `finalize()`, який колись виконував роль фіналізатора, позначено як застарілий і призначений до видалення. Його виклик непередбачуваний, він сповільнює GC і може «воскресити» об'єкт.

Ресурси (файли, з'єднання, блокування) звільняють **детерміновано** через `AutoCloseable` і `try-with-resources` (сторінка «Керування ресурсами»). Як страховку на випадок забутого `close()` використовують `java.lang.ref.Cleaner`.
