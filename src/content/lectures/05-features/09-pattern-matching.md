---
title: Зіставлення зі зразком
description: Зразки в instanceof і switch, зразок типу, константи й null у switch, guard-умови when замість відносних і логічних зразків, зразки records і їх вкладення, var і неіменовані змінні, вичерпність для sealed-ієрархій, домінування гілок.
---

## Зразки

**Зіставлення зі зразком** (pattern matching) перевіряє, чи має значення певну «форму» (тип, структуру), і водночас витягує з нього частини в нові змінні. У Java зразки використовують у двох місцях:

* в операторі **`instanceof`**: `вираз instanceof зразок` повертає `boolean`;
* у **`switch`** — інструкції чи виразі.

```java
static boolean isWorkingDay(Object date) {
    Objects.requireNonNull(date);
    if (date instanceof LocalDateTime dt) {
        date = dt.toLocalDate();
    }
    return switch (date) {
        case LocalDate d when d.getDayOfWeek() == DayOfWeek.SATURDAY
                           || d.getDayOfWeek() == DayOfWeek.SUNDAY -> false;
        case LocalDate d -> true;
        default -> throw new IllegalArgumentException("Не дата: " + date);
    };
}
```

## Зразок типу

Найчастіший зразок: він перевіряє тип значення під час виконання і, якщо тип збігається, присвоює значення новій змінній цього типу.

```java
Object greeting = "Hello, World!";
if (greeting instanceof String message) {
    System.out.println(message.toLowerCase());
}

if (greeting instanceof String s && s.length() > 5) {   // змінна доступна далі в умові
    System.out.println(s.substring(0, 5));
}
```

Змінна зразка доступна там, де компілятор може гарантувати, що зіставлення вдалося (*flow scoping*), зокрема після заперечення:

```java
if (!(obj instanceof Integer n)) {
    return;
}
System.out.println(n + 1);       // тут n гарантовано визначено
```

У `switch` зразки типу дозволяють обирати поведінку за типом:

```java
public abstract sealed class Vehicle permits Car, Truck, Bus { }
public final class Car extends Vehicle { }
public final class Truck extends Vehicle { final double load; Truck(double load) { this.load = load; } }
public final class Bus extends Vehicle { final int passengers; Bus(int p) { passengers = p; } }

static BigDecimal calculateToll(Vehicle vehicle) {
    return switch (vehicle) {
        case Car c -> new BigDecimal("2.00");
        case Truck t -> t.load > 100 ? new BigDecimal("17.50") : new BigDecimal("7.50");
        case Bus b -> new BigDecimal("5.00");
    };   // default не потрібен: Vehicle sealed, усі підтипи перелічено
}
```

## Константи і null

У `switch` можна зіставляти й **константи**: числа, символи, рядки, константи enum. Від Java 21 у switch за посилальним типом можна явно обробити **`null`** (без такої гілки `switch` з `null` кидає `NullPointerException`).

```java
static BigDecimal groupTicketPrice(int visitorCount) {
    return switch (visitorCount) {
        case 0 -> BigDecimal.ZERO;
        case 1 -> new BigDecimal("12.0");
        case 2 -> new BigDecimal("20.0");
        case 3 -> new BigDecimal("27.0");
        case 4 -> new BigDecimal("32.0");
        default -> throw new IllegalArgumentException("Забагато відвідувачів: " + visitorCount);
    };
}

static String describe(String input) {
    return switch (input) {
        case null -> "немає даних";
        case "y", "yes" -> "так";
        case "n", "no" -> "ні";
        default -> "?";
    };
}
```

Якщо `null` треба обробити так само, як решту значень, його об'єднують з `default`: `case null, default -> "?";`.

## Guard-умови when

Окремих «відносних» і «логічних» зразків (`> 5`, `and`, `or`, `not`) у Java немає. Ту саму виразність дає **guard** — довільна логічна умова після `when`, яка перевіряється вже після збігу зразка:

```java
static String calendarSeason(LocalDate date) {
    int m = date.getMonthValue();
    return switch (m) {
        case 3, 4, 5 -> "весна";
        case 6, 7, 8 -> "літо";
        case 9, 10, 11 -> "осінь";
        case 12, 1, 2 -> "зима";
        default -> throw new IllegalStateException();
    };
}

static String classify(Object input) {
    return switch (input) {
        case null -> throw new NullPointerException();
        case String s when s.length() > 5 -> s.substring(0, 5);
        case String s -> s;
        case Collection<?> c when c.size() > 5 -> "колекція з " + c.size() + " елементів";
        case Collection<?> c -> c.toString();
        case Integer i when i >= 0 && i < 10 -> "цифра";
        default -> throw new IllegalArgumentException();
    };
}

static boolean isLetter(char c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');    // для простих умов — звичайні оператори
}
```

## Зразки records

**Зразок record** (Java 21) не лише перевіряє тип, а й **деконструює** record на компоненти й зіставляє кожен компонент з власним зразком:

```java
record Point(int x, int y) { }

static String quadrant(Object o) {
    return switch (o) {
        case Point(int x, int y) when x == 0 && y == 0 -> "Початок координат";
        case Point(int x, int y) when x > 0 && y > 0 -> "Перша чверть";
        case Point(int x, int y) when x < 0 && y > 0 -> "Друга чверть";
        case Point(int x, int y) when x < 0 && y < 0 -> "Третя чверть";
        case Point(int x, int y) when x > 0 && y < 0 -> "Четверта чверть";
        case Point p -> "Точка на осі";
        default -> "Не точка";
    };
}

if (obj instanceof Point(int x, int y)) {
    System.out.println("x + y = " + (x + y));
}
```

Зразки можна **вкладати**, тобто деконструювати record усередині record:

```java
record Line(Point start, Point end) { }

static boolean isVertical(Line line) {
    return line instanceof Line(Point(var x1, var y1), Point(var x2, var y2)) && x1 == x2;
}
```

### var і неіменовані змінні

* У зразку record замість типу компонента можна писати **`var`**: тип виводиться з оголошення record.
* Від Java 22 компонент, який не потрібен, позначають **`_`** (unnamed pattern), а невикористану змінну — так само `_`.

```java
static double perimeter(Shape s) {
    return switch (s) {
        case Circle(var r) -> 2 * Math.PI * r;
        case Rect(var w, var h) -> 2 * (w + h);
    };
}

if (obj instanceof Line(Point(var x, _), _)) {     // потрібна лише координата x початку
    System.out.println(x);
}
```

## Вичерпність і sealed-ієрархії

`switch`-вираз (і `switch` зі зразками) має бути **вичерпним**: кожне можливе значення мусить потрапити в якусь гілку. Для sealed-ієрархій компілятор знає всі дозволені підтипи, тож `default` не потрібен, і додавання нового підтипу призведе до помилки компіляції в кожному switch, який його не обробляє.

Поєднання sealed-інтерфейсу, records і зразків — ідіоматичний спосіб моделювати дані «один з кількох варіантів» (алгебраїчні типи даних):

```java
sealed interface Expr permits Num, Add, Mul, Neg { }
record Num(int value) implements Expr { }
record Add(Expr left, Expr right) implements Expr { }
record Mul(Expr left, Expr right) implements Expr { }
record Neg(Expr operand) implements Expr { }

static int eval(Expr e) {
    return switch (e) {
        case Num(var v) -> v;
        case Add(var l, var r) -> eval(l) + eval(r);
        case Mul(Num(var a), Num(var b)) -> a * b;          // вкладений зразок: окремий швидкий випадок
        case Mul(var l, var r) -> eval(l) * eval(r);
        case Neg(Neg(var inner)) -> eval(inner);            // --x == x
        case Neg(var inner) -> -eval(inner);
    };
}

static String show(Expr e) {
    return switch (e) {
        case Num(var v) -> Integer.toString(v);
        case Add(var l, var r) -> "(" + show(l) + " + " + show(r) + ")";
        case Mul(var l, var r) -> show(l) + " * " + show(r);
        case Neg(var x) -> "-" + show(x);
    };
}

Expr expr = new Add(new Num(2), new Mul(new Num(3), new Neg(new Num(4))));
System.out.println(show(expr) + " = " + eval(expr));    // (2 + 3 * -4) = -10
```

## Домінування гілок

Гілки `switch` перевіряються **по черзі**. Компілятор повідомляє про помилку, якщо гілка ніколи не може спрацювати, бо її перекриває попередня (*домінування*):

```java
switch (obj) {
    case CharSequence cs -> System.out.println("послідовність символів");
    // case String s -> ...;                 // ПОМИЛКА: String домінується CharSequence
    default -> { }
}

switch (obj) {
    case Integer i when i > 0 -> System.out.println("додатне");
    case Integer i -> System.out.println("ціле");       // OK: гілка з guard не домінує
    default -> { }
}
```

Тому гілки з конкретнішими типами й guard-умовами пишуть **вище** загальніших.

> [!NOTE]
> Зразки для **примітивних типів** (`case int i when i > 100`, `instanceof byte b`) з'являються як preview у Java 23+ (JEP 455/488). У стабільних версіях switch за `int` працює з константами, а для складніших умов використовують guard у switch за обгорткою `Integer`.
