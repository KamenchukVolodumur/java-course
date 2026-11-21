---
title: Інструкції
description: Умови й цикли, мітки break/continue, класичний switch з fall-through, стрілкові гілки й switch-вирази, зіставлення зі зразком у switch, цикл for-each.
---

## Умови та цикли

Інструкції `if`, `for`, `while` і `do-while` виглядають так само, як у C та C++. Єдина відмінність: умова **мусить мати тип `boolean`**. Неявного перетворення чисел чи посилань на логічне значення немає, тож `if (x)` для `int x` або `while (ptr)` не компілюються.

```java
if (score >= 90) {
    grade = 'A';
} else if (score >= 75) {
    grade = 'B';
} else {
    grade = 'C';
}

String status = age >= 18 ? "дорослий" : "неповнолітній";   // тернарний оператор

for (int i = 0, j = 10; i < j; i++, j--) { }
while (queue.size() > 0) { queue.poll(); }
do {
    line = reader.readLine();
} while (line != null && line.isBlank());    // тіло виконається хоча б раз
```

> [!WARNING]
> `if (x = 5)` у Java не компілюється (результат має тип `int`), що захищає від класичної помилки C. Але для `boolean` пастка лишається: `if (done = true)` компілюється і завжди дає `true`.

## Мітки, break і continue

`break` перериває найближчий цикл або `switch`, `continue` переходить до наступної ітерації. Щоб керувати **зовнішнім** циклом із вкладеного, цикл позначають **міткою**:

```java
outer:
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] < 0) continue outer;    // наступний рядок
        if (matrix[i][j] == target) {
            System.out.println("знайдено в (" + i + ", " + j + ")");
            break outer;                         // вихід з обох циклів
        }
    }
}
```

Інструкції `goto` в Java немає (слово зарезервоване, але не використовується).

## Інструкція switch

`switch` вибирає гілку за значенням виразу типу `int` (і менших цілих), `char`, `String`, enum або обгорток цих типів. Від Java 21 — за значенням будь-якого посилального типу, з використанням зразків.

### Класичний switch: fall-through

У класичному синтаксисі з двокрапкою виконання **«провалюється»** в наступну гілку, якщо її не завершити `break`. Іноді це використовують навмисно, щоб кілька міток мали спільний код, але частіше це джерело помилок.

```java
switch (day) {
    case SATURDAY:
    case SUNDAY:
        System.out.println("вихідний");
        break;
    case FRIDAY:
        System.out.println("майже вихідний");
        // забули break — виконається й наступна гілка!
    default:
        System.out.println("робочий день");
}
```

### Стрілкові гілки

Синтаксис зі стрілкою `->` (Java 14) не має fall-through: виконується лише одна гілка. Кілька значень перелічують через кому.

```java
switch (day) {
    case SATURDAY, SUNDAY -> System.out.println("вихідний");
    case FRIDAY -> {
        System.out.println("майже вихідний");
        planWeekend();
    }
    default -> System.out.println("робочий день");
}
```

## Вираз switch

`switch` може бути **виразом**, що повертає значення. Тоді всі можливі вхідні значення мають бути оброблені (**вичерпність**): для enum і sealed-ієрархій компілятор перевіряє, що перелічено всі варіанти, а в інших випадках потрібна гілка `default`. Якщо гілка — це блок, значення з нього повертають ключовим словом `yield`.

```java
String cardName = switch (cardNumber) {
    case 13 -> "King";
    case 12 -> "Queen";
    case 11 -> "Jack";
    case 1 -> "Ace";
    default -> {
        if (cardNumber < 2 || cardNumber > 10)
            throw new IllegalArgumentException("Невідома карта: " + cardNumber);
        yield "Pip card";
    }
};

int letters = switch (day) {          // default не потрібен: перелічено всі значення enum
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> 9;
};
```

Якщо до enum згодом додати нову константу, `switch`-вираз без `default` перестане компілюватися. Так компілятор нагадує про місця, які треба оновити.

> [!NOTE]
> Вираз `switch` можна писати і з класичними гілками `case X:`, але тоді значення повертають через `yield`, а fall-through лишається. Стрілкова форма зручніша й безпечніша.

## Зіставлення зі зразком у switch (Java 21)

Окрім констант, `switch` уміє зіставляти **за типом** і перевіряти додаткову умову (**guard**) після слова `when`:

```java
static String describe(Object obj) {
    return switch (obj) {
        case null -> "null";                                       // без цієї гілки — NullPointerException
        case Integer i when i == 0 -> "Це нуль";                   // зразок типу + guard
        case Integer i -> "Ціле число " + i;
        case String s -> "Рядок: " + s;
        case LocalDate d when d.getDayOfWeek() == DayOfWeek.MONDAY -> "Понеділок";
        case int[] arr -> "Масив довжини " + arr.length;
        default -> "Не знаю";
    };
}
```

Гілки перевіряються **по черзі**, і компілятор повідомляє про недосяжні гілки (наприклад, якщо `case Integer i` стоїть перед `case Integer i when ...`). Повний перелік зразків, зокрема деконструкція records, — на сторінці «Зіставлення зі зразком».

## Цикл for-each

Цикл for-each обходить елементи масиву або будь-якого об'єкта, що реалізує інтерфейс `Iterable` (усі колекції стандартної бібліотеки). Що робить об'єкт «ітерабельним», розглянуто на сторінці «Ітератори».

```java
int[] array = {0, 1, 2, 3, 4};
for (int i : array) {
    System.out.println(i);
}

for (var name : List.of("Ola", "Jan")) {
    System.out.println(name);
}

for (char c : "foreach".toCharArray()) {   // String сам не є Iterable
    System.out.println(c);
}
```

Змінна циклу — це **копія** елемента (для примітивів) або посилання на елемент. Присвоєння їй нового значення не змінює масив чи колекцію:

```java
for (int x : array) x *= 2;                    // масив не змінився
for (int i = 0; i < array.length; i++) array[i] *= 2;   // так змінюється
```
