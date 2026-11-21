---
title: Клас Object
description: java.lang.Object — корінь ієрархії класів, його методи, автоупакування примітивів, toString, equals і hashCode, getClass і літерал класу, clone.
---

## Object

`java.lang.Object` — **базовий клас для всіх класів**. Якщо клас не вказує `extends`, компілятор неявно додає `extends Object`. Масиви, enum і records теж є нащадками `Object`, тож будь-яке посилання можна присвоїти змінній типу `Object` (висхідне приведення).

**Примітивні типи** до цієї ієрархії **не належать**: `int` не є об'єктом і не має методів. Щоб використати примітив там, де очікується об'єкт, його треба загорнути в клас-обгортку.

## Упакування (boxing)

Присвоєння примітиву змінній типу `Object` (чи `Integer`) автоматично **упаковує** значення: створює об'єкт-обгортку в купі й копіює туди значення. Зворотне перетворення **розпаковує** його. Низхідне приведення від `Object` вимагає явного cast; якщо тип не збігається, кидається `ClassCastException`.

```java
int num = 42;
Object obj = num;               // упакування: Integer.valueOf(42)
int unboxed = (Integer) obj;    // приведення до Integer + розпакування
// long l = (Long) obj;         // ClassCastException: усередині Integer, а не Long
long ok = (Integer) obj;        // OK: розпакування в int, потім розширення до long
```

Упакування — дорога операція (виділення пам'яті в купі), тож у критичному за продуктивністю коді його уникають. Це також причина, чому в бібліотеці є спеціалізовані `IntStream`, `OptionalInt`, `IntFunction` тощо.

## Визначення класу Object

Спрощено клас `Object` виглядає так. Методи без `final` призначені для перевизначення в підкласах:

```java
public class Object {
    public Object() { }

    public final native Class<?> getClass();
    public boolean equals(Object obj) { return this == obj; }
    public native int hashCode();
    public String toString() {
        return getClass().getName() + "@" + Integer.toHexString(hashCode());
    }
    protected native Object clone() throws CloneNotSupportedException;

    public final native void notify();
    public final native void notifyAll();
    public final void wait() throws InterruptedException { ... }
    public final void wait(long timeoutMillis) throws InterruptedException { ... }

    @Deprecated(since = "9", forRemoval = true)
    protected void finalize() throws Throwable { }
}
```

| Метод | За замовчуванням | Призначення |
| --- | --- | --- |
| `toString()` | `ClassName@hex-хеш` | текстове представлення для логів і налагодження |
| `equals(Object)` | `this == obj` (тотожність) | логічна рівність об'єктів |
| `hashCode()` | число, пов'язане з ідентичністю об'єкта | хеш для `HashMap`/`HashSet` |
| `getClass()` | — (final) | клас об'єкта під час виконання |
| `clone()` | поверхнева копія, якщо клас реалізує `Cloneable` | копіювання (застарілий підхід) |
| `wait`/`notify`/`notifyAll` | — (final) | сигналізація між потоками (розділ «Синхронізація») |
| `finalize()` | — | застарілий, буде видалений; не використовуйте |

## toString

Метод `toString` повертає текстове представлення об'єкта. Його викликають `println`, конкатенація рядків, налагоджувач і логери. Усі стандартні класи його перевизначають. Якщо клас не перевизначив `toString`, виводиться назва класу з хешем, що для людини мало інформативно.

```java
class Person {
    private final String name;
    private final int age;

    Person(String name, int age) { this.name = name; this.age = age; }

    @Override
    public String toString() {
        return name + ", " + age;
    }
}

Person alice = new Person("Alice", 30);
System.out.println(alice);              // Alice, 30
System.out.println("Особа: " + alice);  // Особа: Alice, 30
```

Records генерують `toString` автоматично: `Person[name=Alice, age=30]`.

## equals і hashCode

За замовчуванням `equals` перевіряє **тотожність** — те саме, що `==`. Класи, які представляють *значення* (точка, гроші, ключ у мапі), перевизначають `equals`, щоб порівнювати вміст. Разом з ним **обов'язково** перевизначають `hashCode`.

Контракт `equals`:

1. **рефлексивність**: `x.equals(x)` дорівнює `true`;
2. **симетричність**: `x.equals(y)` тоді й лише тоді, коли `y.equals(x)`;
3. **транзитивність**: з `x.equals(y)` і `y.equals(z)` випливає `x.equals(z)`;
4. **узгодженість**: повторні виклики дають той самий результат, доки об'єкти не змінюються;
5. `x.equals(null)` дорівнює `false`.

Контракт `hashCode`: якщо `x.equals(y)`, то `x.hashCode() == y.hashCode()`. Зворотне не вимагається: різні об'єкти можуть мати однаковий хеш (колізія).

```java
public final class Point {
    private final int x, y;

    public Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                      // швидка перевірка
        if (!(o instanceof Point other)) return false;   // також відсікає null
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);                       // 31 * (31 + x) + y
    }
}

Set<Point> set = new HashSet<>();
set.add(new Point(1, 2));
System.out.println(set.contains(new Point(1, 2)));      // true; без hashCode було б false
```

> [!CAUTION]
> Якщо перевизначити `equals`, але не `hashCode`, рівні об'єкти потраплять у різні кошики `HashMap`/`HashSet`, і колекція їх «не знайде». І навпаки: не змінюйте поля, від яких залежить `hashCode`, поки об'єкт лежить у хеш-колекції.

> [!TIP]
> `equals`, `hashCode` і `toString` рідко пишуть вручну. Records генерують їх автоматично, а для звичайних класів їх генерує IDE (*Generate → equals() and hashCode()*).

## getClass і літерал класу

Метод `getClass()` повертає об'єкт `Class<?>`, що описує **фактичний** клас об'єкта **під час виконання**. **Літерал класу** `Тип.class` дає той самий об'єкт для типу, відомого **під час компіляції**. Для кожного класу існує рівно один об'єкт `Class` (у межах завантажувача класів), тож їх можна порівнювати через `==`.

```java
LocalDateTime now = LocalDateTime.now();

System.out.println(now.getClass());                         // class java.time.LocalDateTime
System.out.println(LocalDateTime.class);                    // те саме, обчислене під час компіляції
System.out.println(LocalDateTime.class == now.getClass());  // true

Object o = "text";
System.out.println(o.getClass().getSimpleName());           // String: фактичний тип, а не Object
System.out.println(int.class + " " + int[].class.getName()); // int [I
```

`Class` — вхідна точка рефлексії: через нього можна дізнатися поля, методи, анотації класу й навіть створити екземпляр (розділ «Рефлексія»).

## clone

`clone()` створює **поверхневу копію** об'єкта (копіюються значення полів, тобто посилання, а не об'єкти, на які вони вказують). Щоб метод працював, клас мусить реалізувати маркерний інтерфейс `Cloneable` і зробити `clone` публічним; інакше кидається `CloneNotSupportedException`.

```java
int[] a = {1, 2, 3};
int[] b = a.clone();     // для масивів clone працює «з коробки» й не кидає винятків
b[0] = 99;
System.out.println(a[0]);   // 1
```

Механізм `Cloneable` вважається невдалим (порушує звичайні правила конструкторів, погано поєднується з `final`-полями). Для власних класів замість нього роблять **конструктор копіювання** (`new Person(other)`) або метод-фабрику (`Person.copyOf(other)`).
