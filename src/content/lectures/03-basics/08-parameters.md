---
title: Параметри методів
description: Передавання параметрів лише за значенням, як повернути кілька значень, final-параметри, змінна кількість аргументів (varargs), перевантаження методів і правила вибору, заміна параметрів за замовчуванням.
---

## Лише за значенням

У Java параметри передаються **виключно за значенням**: метод отримує копію значення змінної. Для примітивів це копія числа, для посилальних типів — копія посилання (див. сторінку «Система типів»). Модифікаторів на кшталт «за посиланням» чи «вихідний параметр» у мові немає.

```java
static void increment(int p) {
    p = p + 1;                 // змінює лише локальну копію
}

int x = 8;
increment(x);
System.out.println(x);         // 8
```

## Як повернути кілька значень

Метод повертає рівно одне значення. Якщо результатів кілька, використовують такі підходи.

### Повернути record

Найчистіший спосіб — невеликий record, який називає кожен результат:

```java
record FullName(List<String> firstNames, String lastName) { }

static FullName splitName(String name) {
    String[] words = name.split(" ");
    return new FullName(
            List.of(words).subList(0, words.length - 1),
            words[words.length - 1]);
}

FullName n = splitName("Tim Berners Lee");
System.out.println(n.firstNames() + " / " + n.lastName());   // [Tim, Berners] / Lee

// деструктуруючого присвоєння (var (a, b) = ...) у Java немає, але record можна розібрати зразком:
if (splitName("John Fitzgerald Kennedy") instanceof FullName(var firsts, var last)) {
    System.out.println(last);                                 // Kennedy
}
```

### Змінити переданий об'єкт

Метод може заповнити об'єкт, який йому передали: колекцію, масив чи власний клас. Так роблять, наприклад, коли треба уникнути створення нових об'єктів у «гарячому» коді.

```java
static void minMax(int[] data, int[] out) {      // out[0] = min, out[1] = max
    int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
    for (int v : data) { min = Math.min(min, v); max = Math.max(max, v); }
    out[0] = min;
    out[1] = max;
}

int[] result = new int[2];
minMax(new int[] {4, -2, 9}, result);   // result = [-2, 9]
```

### Інші варіанти

* Повернути `Optional<T>`, якщо результату може не бути (замість пари «успіх + значення»).
* Кинути виняток замість коду помилки.
* Для кількох результатів однакового типу — повернути масив чи список.

## Параметри final

Параметр можна позначити `final`: тоді йому не можна присвоїти нове значення всередині методу. На поведінку викликача це не впливає (метод і так працює з копією), але запобігає випадковому перезапису.

```java
static double area(final double radius) {
    // radius = 0;            // ПОМИЛКА
    return Math.PI * radius * radius;
}
```

## Змінна кількість аргументів (varargs)

Параметр, оголошений як `Тип...`, приймає будь-яку кількість аргументів (зокрема нуль). Усередині методу це звичайний масив; компілятор сам створює масив з переданих аргументів. Такий параметр може бути лише **останнім** і лише одним.

```java
static String concat(String first, String... rest) {   // хоча б один аргумент
    StringBuilder sb = new StringBuilder(first);
    for (String s : rest) sb.append(s);
    return sb.toString();
}

String s1 = concat("The", "Quick", "Brown", "Fox");
String s2 = concat("Jumps", "Over", "The", "Lazy", "Dog");
System.out.println(concat(s1, s2));
concat("Цей метод приймає хоча б один параметр");
concat("a", new String[] {"b", "c"});               // можна передати масив напряму
```

У стандартній бібліотеці varargs скрізь: `String.format(String, Object...)`, `List.of(E...)`, `Arrays.asList(T...)`, `Path.of(String, String...)`.

> [!WARNING]
> Кожен виклик varargs-методу створює новий масив у купі. Тому `List.of` має окремі перевантаження для 0–10 аргументів, а varargs-версію використовує лише для більшої кількості. Друга пастка — `null`: `concat("a", null)` передасть `null` як **масив** (`rest == null`), а не масив з одного `null`.

### Varargs і generics

Масив узагальненого типу створити неможливо, тож для параметра `T...` компілятор створює `Object[]` і попереджає про «potential heap pollution». Якщо метод лише читає елементи масиву, попередження прибирають анотацією `@SafeVarargs` (для `static`, `final` або `private` методів):

```java
@SafeVarargs
static <T> List<T> listOf(T... items) {
    return new ArrayList<>(Arrays.asList(items));
}
```

## Перевантаження методів

У класі може бути кілька методів з тим самим ім'ям, якщо вони відрізняються **списком параметрів** (кількістю, типами чи їх порядком). Тип результату й імена параметрів у розрізненні не беруть участі.

```java
static int sum(int a, int b) { return a + b; }
static double sum(double a, double b) { return a + b; }
static int sum(int a, int b, int c) { return a + b + c; }
// static long sum(int a, int b) { ... }   // ПОМИЛКА: відрізняється лише тип результату
```

Компілятор вибирає перевантаження **під час компіляції**, за статичними типами аргументів, у три фази:

1. точна відповідність або **розширення** примітивів (`int` → `long`), без упакування;
2. дозволено **упакування/розпакування** (`int` → `Integer`);
3. дозволено **varargs**.

На першій фазі, де знайдено придатні методи, обирається **найконкретніший**.

```java
static void f(long x)    { System.out.println("long"); }
static void f(Integer x) { System.out.println("Integer"); }
static void f(int... x)  { System.out.println("varargs"); }

f(5);          // long: розширення (фаза 1) перемагає упакування (фаза 2)
f(5L);         // long
f();           // varargs

static void g(Object o) { System.out.println("Object"); }
static void g(String s) { System.out.println("String"); }

Object x = "hello";
g(x);          // Object: важливий статичний тип змінної, а не фактичний тип об'єкта
g("hello");    // String
g(null);       // String: найконкретніший з придатних
```

## Параметри за замовчуванням і іменовані аргументи

У Java **немає** значень параметрів за замовчуванням і іменованих аргументів. Їх замінюють:

**Перевантаження**, що делегують одне одному:

```java
static void connect(String host) { connect(host, 80); }
static void connect(String host, int port) { connect(host, port, Duration.ofSeconds(5)); }
static void connect(String host, int port, Duration timeout) { /* справжня реалізація */ }
```

**Об'єкт параметрів або Builder**, коли необов'язкових параметрів багато (сторінка «Класи» і розділ «Додатково → патерни»):

```java
HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com"))
        .timeout(Duration.ofSeconds(10))      // «іменований аргумент»
        .header("Accept", "application/json")
        .build();                             // решта — значення за замовчуванням
```
