---
title: Примітивні типи
description: Вісім примітивних типів і класи-обгортки, літерали, перетворення типів, переповнення, BigDecimal і BigInteger, boolean, операції порівняння, char і Unicode, парсинг і системи числення.
---

## Числові типи

Кожен примітивний тип має відповідний **клас-обгортку** в пакеті `java.lang`. Обгортки зберігають корисні константи й методи: `Integer.MAX_VALUE`, `Integer.parseInt(String)`, `Double.isNaN(x)`, `Long.compare(a, b)`.

| Тип | Обгортка | Розмір | Діапазон (приблизно) | Точність | Суфікс літерала |
| --- | --- | --- | --- | --- | --- |
| `byte` | `Byte` | 8 біт | від −128 до 127 | — | — |
| `short` | `Short` | 16 біт | від −32 768 до 32 767 | — | — |
| `int` | `Integer` | 32 біти | від −2,1×10⁹ до 2,1×10⁹ | — | — |
| `long` | `Long` | 64 біти | від −9,2×10¹⁸ до 9,2×10¹⁸ | — | `L` |
| `float` | `Float` | 32 біти | ±1,4×10⁻⁴⁵ … ±3,4×10³⁸ | ~6–9 цифр | `F` або `f` |
| `double` | `Double` | 64 біти | ±4,9×10⁻³²⁴ … ±1,8×10³⁰⁸ | ~15–17 цифр | `D` (необов'язковий) |
| `char` | `Character` | 16 біт | від `'\u0000'` до `'￿'` | — | — |
| `boolean` | `Boolean` | не визначено специфікацією | `true` / `false` | — | — |

Усі цілочисельні типи **знакові**: беззнакових типів у Java немає. Для роботи з беззнаковими значеннями є статичні методи: `Integer.toUnsignedString(x)`, `Integer.divideUnsigned(a, b)`, `Integer.compareUnsigned(a, b)`, `Byte.toUnsignedInt(b)`.

### Літерали

```java
int dec = 1_000_000;          // підкреслення для читабельності
int hex = 0xFF;               // 255
int bin = 0b1010_1010;        // 170
int oct = 017;                // 15 — увага: провідний 0 означає вісімкову систему!
long big = 10_000_000_000L;   // без L — помилка: число завелике для int
float f = 3.14f;              // без f — помилка: 3.14 має тип double
double d = 1.5e-3;            // 0.0015
char c = 'A';
```

## Перетворення числових типів

### Розширювальні перетворення (неявні)

Компілятор виконує їх автоматично, коли цільовий тип має більший діапазон:

```text
byte → short → int → long → float → double
             char ↗
```

```java
int i = 100;
long l = i;          // OK
float f = l;         // OK, але для великих чисел можлива втрата точності
double d = f;        // OK

int big = 123_456_789;
float lossy = big;
System.out.println((int) lossy);   // 123456792: float має лише ~7 значущих цифр
```

### Звужувальні перетворення (явні)

Потребують оператора приведення `(тип)`, бо можлива втрата інформації.

* З `double`/`float` до цілого типу дробова частина **відкидається** (округлення до нуля). Значення поза діапазоном насичуються до `MIN_VALUE`/`MAX_VALUE`, а `NaN` стає `0`.
* Між цілими типами старші біти, які не вміщаються, **відкидаються**.

```java
double d = 99.9;
int i = (int) d;                    // 99
int neg = (int) -99.9;              // -99
int sat = (int) 1e20;               // 2147483647 (Integer.MAX_VALUE)

long l = 3_000_000_000L;
int i2 = (int) l;                   // -1294967296: відкинуто старші 32 біти
byte b = (byte) 200;                // -56
```

### Переповнення

Цілочисельна арифметика в Java **тихо переповнюється** (wrap-around): результат обрізається до розміру типу без жодного винятку.

```java
int max = Integer.MAX_VALUE;
System.out.println(max + 1);        // -2147483648
```

Щоб переповнення стало помилкою, використовують методи `Math.*Exact`, які кидають `ArithmeticException`:

```java
try {
    int sum = Math.addExact(max, 1);
    int product = Math.multiplyExact(100_000, 100_000);
    int narrow = Math.toIntExact(3_000_000_000L);
} catch (ArithmeticException e) {
    System.out.println(e.getMessage());   // integer overflow
}
```

> [!WARNING]
> Типова пастка: `long nanos = 24 * 60 * 60 * 1000 * 1000;` дає неправильний результат, бо множення виконується в `int` і переповнюється **до** присвоєння в `long`. Правильно: `24L * 60 * 60 * 1000 * 1000`.

### Числові підвищення в виразах

У виразах `byte`, `short` і `char` спершу підвищуються до `int`:

```java
byte a = 10, b = 20;
// byte c = a + b;          // ПОМИЛКА: результат a + b має тип int
byte c = (byte) (a + b);    // явне звуження
a += b;                     // OK: складене присвоєння містить неявне приведення
```

### Особливі значення дробових типів

Дробова арифметика відповідає стандарту IEEE 754 і **не кидає винятків**:

```java
System.out.println(1.0 / 0);         // Infinity
System.out.println(-1.0 / 0);        // -Infinity
System.out.println(0.0 / 0);         // NaN
System.out.println(Double.NaN == Double.NaN);   // false! перевіряйте Double.isNaN(x)
System.out.println(0.1 + 0.2);       // 0.30000000000000004
System.out.println(1 / 0);           // ArithmeticException: / by zero (цілі числа)
```

Дробові числа не можна надійно порівнювати через `==`; порівнюють з допуском: `Math.abs(a - b) < 1e-9`.

## BigDecimal і BigInteger

Для фінансових розрахунків, де помилки округлення неприпустимі, використовують **`java.math.BigDecimal`** — десяткове число довільної точності.

* `BigDecimal` зберігає ціле число довільної довжини (`unscaledValue`) і **масштаб** (`scale`, кількість цифр після коми). Десяткові дроби (0.1, 0.2) представлені точно.
* Об'єкти незмінні: кожна операція повертає новий об'єкт. Операторів `+`, `*` немає, є методи.

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

BigDecimal price = new BigDecimal("19.99");          // створюйте з РЯДКА
BigDecimal qty = BigDecimal.valueOf(3);
BigDecimal total = price.multiply(qty);              // 59.97
BigDecimal withVat = total.multiply(new BigDecimal("1.23"))
                          .setScale(2, RoundingMode.HALF_UP);   // 73.76

System.out.println(new BigDecimal(0.1));             // 0.1000000000000000055511151231257827...
System.out.println(new BigDecimal("0.1"));           // 0.1

BigDecimal one = new BigDecimal("1");
// one.divide(new BigDecimal("3"));                  // ArithmeticException: нескінченний дріб
one.divide(new BigDecimal("3"), 10, RoundingMode.HALF_EVEN);   // 0.3333333333
```

> [!WARNING]
> `BigDecimal.equals` враховує масштаб: `new BigDecimal("2.0").equals(new BigDecimal("2.00"))` дає `false`. Значення порівнюйте через `compareTo(...) == 0`.

Недоліки `BigDecimal` порівняно з `double`:

* **швидкодія**: операції реалізовано програмно, вони в десятки разів повільніші за апаратні операції з плаваючою комою;
* **пам'ять**: це об'єкт у купі, а не 8 байтів;
* **зручність**: методи замість операторів, обов'язкове керування округленням.

Для наукових обчислень беруть `double`, для грошей — `BigDecimal` (або `long`, у копійках).

**`BigInteger`** — ціле число довільного розміру:

```java
BigInteger f = BigInteger.ONE;
for (int i = 2; i <= 50; i++) f = f.multiply(BigInteger.valueOf(i));
System.out.println(f);     // 30414093201713378043612608166064768844377641568960512000000000000
```

## Тип boolean

`boolean` має два значення: `true` і `false`. Розмір у пам'яті специфікація не фіксує: у масиві `boolean[]` HotSpot використовує 1 байт на елемент.

```java
int x = 1;
boolean flag = x > 0;
if (flag) {
    flag = false;
}
```

На відміну від C/C++, **немає жодних перетворень** між `boolean` і числовими типами: `if (x)` для `int x` не компілюється, писати треба `if (x != 0)`.

### Оператори порівняння

Для примітивних типів `==` порівнює **значення**:

```java
int a = 5, b = 5, c = 10;
System.out.println(a == b);   // true
System.out.println(a == c);   // false
```

Для посилальних типів `==` перевіряє, чи вказують посилання на **той самий об'єкт** (тотожність). Рівність вмісту перевіряє метод `equals`, який клас має перевизначити (сторінка «Клас Object»).

```java
Person p1 = new Person("Alice", 30);
Person p2 = new Person("Alice", 30);
Person p3 = p1;
System.out.println(p1 == p2);        // false: різні об'єкти
System.out.println(p1 == p3);        // true: той самий об'єкт
System.out.println(p1.equals(p2));   // true, якщо Person перевизначає equals (record — так)
```

Перевантажити оператори в Java неможливо: `==` для об'єктів завжди означає тотожність.

### Обчислення за короткою схемою

Логічні оператори `&&` і `||` обчислюються **за короткою схемою**: якщо результат зрозумілий з лівого операнда, правий не обчислюється. Оператори `&` і `|` для `boolean` завжди обчислюють обидва боки.

```java
if (user != null && user.hasPermission("admin")) {
    System.out.println("Користувач має права адміністратора");
}
```

Якщо `user` дорівнює `null`, метод `hasPermission` не викликається, і `NullPointerException` не виникає.

## Тип char і Unicode

`char` має розмір 2 байти й зберігає одну **кодову одиницю UTF-16**. Символи поза базовою багатомовною площиною (більшість емодзі, частина ієрогліфів) не вміщаються в один `char` і зберігаються **сурогатною парою** з двох `char`.

```java
char a = 'A';
char newLine = '\n';
char copyright = '©';       // ©
int code = a;                    // 65: char неявно розширюється до int
char next = (char) (a + 1);      // 'B'

String emoji = "😀";
System.out.println(emoji.length());                         // 2: дві кодові одиниці UTF-16
System.out.println(emoji.codePointCount(0, emoji.length())); // 1: одна кодова точка
emoji.codePoints().forEach(cp -> System.out.println(Integer.toHexString(cp)));   // 1f600
```

Клас `Character` має методи класифікації: `Character.isDigit(c)`, `isLetter`, `isWhitespace`, `toUpperCase`, `getNumericValue`.

## Перетворення рядків і чисел

Перетворення між рядками й числами виконують статичні методи обгорток:

```java
int n = Integer.parseInt("42");               // 42
double d = Double.parseDouble("3.14");        // 3.14
boolean b = Boolean.parseBoolean("TRUE");     // true (без урахування регістру; усе інше — false)
Integer boxed = Integer.valueOf("42");        // обгортка, з кешем для -128..127

int bin = Integer.parseInt("101010", 2);      // 42
String hex = Integer.toString(255, 16);       // "ff"
String hex2 = Integer.toHexString(255);       // "ff"
String binary = Integer.toBinaryString(42);   // "101010"

String s = String.valueOf(3.5);               // "3.5"
String s2 = "" + 7;                           // "7" (конкатенація)

Integer.parseInt("12a");                      // NumberFormatException
```

### Округлення

На відміну від приведення `(int)`, яке відкидає дробову частину, методи `Math` округлюють:

```java
Math.round(2.5);      // 3: найближче ціле, половини — вгору (до +∞)
Math.round(-2.5);     // -2
Math.rint(2.5);       // 2.0: половини — до парного («банківське» округлення)
Math.floor(-2.5);     // -3.0
Math.ceil(2.1);       // 3.0
Math.floorDiv(-7, 2); // -4 (на відміну від -7 / 2 == -3)
Math.floorMod(-7, 2); // 1  (на відміну від -7 % 2 == -1)
```

## Автоупакування

Узагальнені колекції працюють лише з посилальними типами, тож примітиви автоматично **упаковуються** в обгортки (autoboxing) і **розпаковуються** (unboxing):

```java
List<Integer> list = new ArrayList<>();
list.add(5);                 // autoboxing: Integer.valueOf(5)
int x = list.get(0);         // unboxing: list.get(0).intValue()

Integer a = 127, b = 127;
System.out.println(a == b);  // true: Integer.valueOf кешує -128..127
Integer c = 128, d = 128;
System.out.println(c == d);  // false: різні об'єкти!
System.out.println(c.equals(d));   // true

Integer missing = null;
int boom = missing;          // NullPointerException під час розпакування
```

> [!CAUTION]
> Ніколи не порівнюйте обгортки через `==`. І пам'ятайте, що автоупакування в «гарячому» циклі (`Long sum = 0L; for (...) sum += i;`) створює мільйони тимчасових об'єктів. У такому коді використовуйте примітиви.
