---
title: Records
description: Records як незмінні носії даних, що генерує компілятор, семантика рівності, канонічний і компактний конструктори, «withers», власні члени, обмеження, records з generics та інтерфейсами, локальні records як заміна анонімних типів.
---

## Records (Java 16)

Record — особливий вид класу, призначений для **незмінних даних**. Він дозволяє оголосити тип одним рядком, без шаблонного коду:

```java
public record Person(String firstName, String lastName) { }
```

У дужках — **компоненти** запису. Для кожного компонента компілятор генерує `private final` поле і публічний **аксесор** з тим самим ім'ям (`firstName()`, а не `getFirstName()`). Крім того, генеруються **канонічний конструктор** з усіма компонентами, а також `equals`, `hashCode` і `toString`. Сам клас неявно `final` і наслідує `java.lang.Record`.

Компілятор фактично створює такий клас:

```java
public final class Person extends java.lang.Record {
    private final String firstName;
    private final String lastName;

    public Person(String firstName, String lastName) {     // канонічний конструктор
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String firstName() { return firstName; }
    public String lastName() { return lastName; }

    @Override
    public boolean equals(Object o) {
        return this == o
                || o instanceof Person other
                && Objects.equals(firstName, other.firstName)
                && Objects.equals(lastName, other.lastName);
    }

    @Override
    public int hashCode() { return Objects.hash(firstName, lastName); }

    @Override
    public String toString() { return "Person[firstName=" + firstName + ", lastName=" + lastName + "]"; }
}
```

> [!NOTE]
> Насправді `equals`, `hashCode` і `toString` реалізовано не прямим кодом, а через `invokedynamic` і `ObjectMethods.bootstrap`: JVM генерує їх під час виконання. Це не змінює поведінки, але робить байт-код компактним.

### Семантика рівності

Records порівнюються **за значенням**: `equals` перевіряє, що обидва об'єкти мають той самий клас і всі компоненти рівні (для посилань — через `equals`, для примітивів — порівнянням значень; `float`/`double` порівнюються як `Float.compare`).

```java
var john = new Person("John", "Doe");
var doe = new Person("John", "Doe");

System.out.println(john.equals(doe));   // true
System.out.println(john == doe);        // false: оператор == завжди порівнює посилання
System.out.println(john);               // Person[firstName=John, lastName=Doe]

Set<Person> people = new HashSet<>(List.of(john, doe));
System.out.println(people.size());      // 1
```

> [!WARNING]
> Рівність record поверхнева: якщо компонент — масив, порівнюються **посилання** на масиви, а не вміст. Для компонентів-колекцій працює `equals` колекцій (за вмістом), тож замість масивів у records краще використовувати `List`.

## Конструктори

### Компактний конструктор

Найчастіше потрібно лише **перевірити або нормалізувати** аргументи. Для цього є **компактний конструктор**: без списку параметрів і без присвоєнь полям. Його код виконується перед автоматичним присвоєнням, і в ньому можна змінювати параметри.

```java
public record Range(int from, int to) {
    public Range {                                  // компактний канонічний конструктор
        if (from > to)
            throw new IllegalArgumentException("from > to: %d > %d".formatted(from, to));
    }
}

public record Product(String name, BigDecimal price, List<String> tags) {
    public Product {
        Objects.requireNonNull(name);
        name = name.strip();                        // нормалізація: присвоюємо параметру
        price = price.setScale(2, RoundingMode.HALF_UP);
        tags = List.copyOf(tags);                   // захисна копія: record справді незмінний
    }
}
```

### Додаткові конструктори

Можна оголошувати й інші конструктори, але кожен мусить делегувати канонічному через `this(...)`:

```java
public record Point(double x, double y) {
    public static final Point ORIGIN = new Point(0, 0);

    public Point() { this(0, 0); }

    public static Point polar(double r, double angle) {     // статична фабрика
        return new Point(r * Math.cos(angle), r * Math.sin(angle));
    }
}
```

## «Зміна» без зміни: withers

Records незмінні. Щоб отримати копію з іншим значенням одного компонента, оголошують методи-«withers», які повертають новий об'єкт:

```java
public record Person(String firstName, String lastName, int age) {
    public Person withFirstName(String firstName) { return new Person(firstName, lastName, age); }
    public Person withAge(int age) { return new Person(firstName, lastName, age); }
}

var john = new Person("John", "Doe", 30);
var jane = john.withFirstName("Jane").withAge(0);

System.out.println(john);   // Person[firstName=John, lastName=Doe, age=30]
System.out.println(jane);   // Person[firstName=Jane, lastName=Doe, age=0]
```

> [!NOTE]
> Для records запропоновано окремий синтаксис «похідного створення» (JEP 468, `john with { firstName = "Jane"; }`). Поки його немає в стабільних версіях, withers пишуть вручну або генерують анотаціями (наприклад, Lombok `@With`).

## Власні члени

У тілі record можна додавати:

* методи екземпляра і статичні методи;
* статичні поля (але **не** поля екземпляра: увесь стан задається компонентами);
* вкладені типи;
* власні реалізації аксесорів, `equals`, `hashCode`, `toString`: якщо вони оголошені явно, компілятор свої не генерує.

```java
public record Money(BigDecimal amount, String currency) implements Comparable<Money> {
    public Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(amount.add(other.amount), currency);
    }

    @Override
    public int compareTo(Money other) {
        requireSameCurrency(other);
        return amount.compareTo(other.amount);
    }

    @Override
    public String toString() { return amount + " " + currency; }    // замість Money[amount=..., currency=...]

    private void requireSameCurrency(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("Різні валюти");
    }
}
```

### Обмеження

* record не може наслідувати клас (неявно наслідує `Record`) і є `final`;
* поля екземпляра оголошувати не можна, лише компоненти;
* поля компонентів завжди `final`: сетерів немає;
* аксесор має бути `public` і повертати рівно тип компонента.

Records можуть реалізовувати інтерфейси, бути узагальненими, вкладеними (тоді вони неявно `static`) і **локальними** (оголошеними всередині методу).

```java
public record Pair<A, B>(A first, B second) {
    public static <A, B> Pair<A, B> of(A first, B second) { return new Pair<>(first, second); }
}

sealed interface Shape permits Circle, Rect { double area(); }
record Circle(double r) implements Shape { public double area() { return Math.PI * r * r; } }
record Rect(double w, double h) implements Shape { public double area() { return w * h; } }
```

Поєднання sealed-інтерфейсу і records дає **алгебраїчні типи даних**, які зручно обробляти через зіставлення зі зразком (сторінка «Зіставлення зі зразком»).

## Локальні records замість анонімних типів

Тимчасові об'єкти, потрібні лише всередині одного методу (наприклад, проміжні результати обробки даних), зручно описувати **локальними records**. Вони мають ім'я, типобезпечні, і в них рівність за значенням працює «з коробки».

```java
List<String> topMovies(List<Rating> ratings, Map<Integer, Movie> movies) {
    record MovieAverage(int movieId, double average) { }      // локальний record

    return ratings.stream()
            .collect(Collectors.groupingBy(Rating::movieId, Collectors.averagingDouble(Rating::score)))
            .entrySet().stream()
            .map(e -> new MovieAverage(e.getKey(), e.getValue()))
            .filter(ma -> ma.average() > 8)
            .sorted(Comparator.comparingDouble(MovieAverage::average).reversed())
            .map(ma -> movies.get(ma.movieId()).title() + " (" + ma.average() + ")")
            .toList();
}
```

Локальний record неявно `static`: він не має доступу до локальних змінних і полів екземпляра навколишнього методу.

> [!TIP]
> Records ідеальні для DTO (даних, що передаються між шарами застосунку чи мережею), ключів мап, результатів методів з кількома значеннями й незмінних доменних значень. Бібліотеки серіалізації (Jackson, Gson) і JPA-проєкції підтримують records напряму.
