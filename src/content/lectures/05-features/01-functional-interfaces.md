---
title: Функціональні інтерфейси й лямбди
description: Функціональні інтерфейси як типобезпечні посилання на поведінку, стандартні інтерфейси java.util.function, композиція функцій, лямбда-вирази й цільова типізація, посилання на методи, захоплення змінних, як лямбди компілюються, анонімні класи.
---

## Функціональні інтерфейси

Щоб передати методу **поведінку** (функцію, що обчислює значення, реагує на подію чи порівнює елементи), у Java використовують **функціональний інтерфейс** — інтерфейс з **рівно одним абстрактним методом** (SAM, single abstract method). Об'єкт такого інтерфейсу — це типобезпечний аналог вказівника на функцію з C/C++.

```java
@FunctionalInterface
public interface Function1D {
    double apply(double x);
}
```

Анотація `@FunctionalInterface` необов'язкова, але компілятор тоді перевірить, що абстрактний метод рівно один. Default- і static-методи не рахуються.

Параметри й тип результату абстрактного методу визначають, яку поведінку можна присвоїти такому інтерфейсу: `Function1D` сумісний з будь-якою функцією `double → double`. Значення створюють **лямбда-виразом** або **посиланням на метод**:

```java
static double quadratic(double x) { return x * x - 2 * x + 1; }

Function1D f1 = x -> x * x - 2 * x + 1;      // лямбда
Function1D f2 = Main::quadratic;             // посилання на статичний метод

double y = f1.apply(2.0);                    // виклик — через метод інтерфейсу
```

> [!NOTE]
> Лямбда — це об'єкт, що реалізує інтерфейс. Якщо лямбда звертається до полів об'єкта чи посилається на метод екземпляра (`obj::method`), вона тримає посилання на цей об'єкт. Збережена надовго лямбда (у полі, у списку слухачів) може тому подовжити життя об'єкта й спричинити витік пам'яті.

Повний приклад — пошук кореня методом Ньютона:

```java
// Numerics.java
public final class Numerics {
    private Numerics() { }

    @FunctionalInterface
    public interface Function1D {
        double apply(double x);
    }

    public static double newtonRootFinding(Function1D f, Function1D df, double x0, double eps) {
        double x;
        double xn = x0;
        do {
            x = xn;
            xn = x - f.apply(x) / df.apply(x);
        } while (Math.abs(x - xn) >= eps);
        return xn;
    }

    public static double newtonRootFinding(Function1D f, Function1D df) {   // «параметри за замовчуванням»
        return newtonRootFinding(f, df, 0, 1e-6);
    }
}

// Quadratic.java
public record Quadratic(double a, double b, double c) {
    public double function(double x) { return a * x * x + b * x + c; }
    public double derivative(double x) { return 2 * a * x + b; }

    @Override
    public String toString() { return "f(x) = %sx^2 + %sx + %s".formatted(a, b, c); }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        var quadratic = new Quadratic(1.0, -7.0, 10.0);

        Numerics.Function1D function = quadratic::function;      // метод конкретного об'єкта
        Numerics.Function1D derivative = quadratic::derivative;

        double root = Numerics.newtonRootFinding(function, derivative);
        System.out.printf("Корінь %s: %.2f%n", quadratic, root);  // Корінь f(x) = 1.0x^2 + -7.0x + 10.0: 2.00
    }
}
```

### Узагальнені функціональні інтерфейси

Функціональний інтерфейс може бути узагальненим:

```java
@FunctionalInterface
interface Transformer<T> {
    T apply(T x);
}

Transformer<Double> square = x -> x * x;
Transformer<String> shout = s -> s.toUpperCase() + "!";
System.out.println(square.apply(3.0) + " " + shout.apply("hej"));   // 9.0 HEJ!
```

## Стандартні інтерфейси java.util.function

Здебільшого власні інтерфейси не потрібні: пакет `java.util.function` містить готові для типових сигнатур.

| Інтерфейс | Метод | Сигнатура |
| --- | --- | --- |
| `Supplier<T>` | `get()` | `() → T` |
| `Consumer<T>` | `accept(T)` | `T → void` |
| `BiConsumer<T, U>` | `accept(T, U)` | `(T, U) → void` |
| `Function<T, R>` | `apply(T)` | `T → R` |
| `BiFunction<T, U, R>` | `apply(T, U)` | `(T, U) → R` |
| `UnaryOperator<T>` | `apply(T)` | `T → T` |
| `BinaryOperator<T>` | `apply(T, T)` | `(T, T) → T` |
| `Predicate<T>` | `test(T)` | `T → boolean` |
| `BiPredicate<T, U>` | `test(T, U)` | `(T, U) → boolean` |

Поза пакетом широко використовують `Runnable` (`() → void`), `Callable<V>` (`() → V`, може кидати checked-винятки) і `Comparator<T>` (`(T, T) → int`).

Щоб уникати упакування, існують **примітивні спеціалізації**: `IntPredicate`, `IntFunction<R>` (`int → R`), `ToIntFunction<T>` (`T → int`), `IntUnaryOperator`, `IntBinaryOperator`, `DoubleUnaryOperator`, `LongSupplier`, `ObjIntConsumer<T>` тощо.

```java
DoubleUnaryOperator square = x -> x * x;          // без Double-упакування
IntBinaryOperator add = Integer::sum;
ToIntFunction<String> length = String::length;
Predicate<String> isEmpty = String::isEmpty;
Supplier<List<String>> listFactory = ArrayList::new;
BiFunction<Character, Integer, String> repeat = (c, n) -> String.valueOf(c).repeat(n);
```

Готових інтерфейсів для трьох і більше параметрів немає. Якщо потрібен такий, його оголошують самостійно (або групують аргументи в record).

## Композиція функцій

Окремого механізму «складання» кількох функцій в одну (як у мовах з делегатами з кількома методами) у Java немає. Натомість стандартні інтерфейси мають **default-методи композиції**, що повертають нову функцію:

```java
Function<Integer, Integer> plus2 = x -> x + 2;
Function<Integer, Integer> times3 = x -> x * 3;
plus2.andThen(times3).apply(1);       // (1 + 2) * 3 = 9
plus2.compose(times3).apply(1);       // 1 * 3 + 2 = 5
Function.<Integer>identity();         // x -> x

Predicate<String> blank = String::isBlank;
Predicate<String> valid = blank.negate().and(s -> s.length() <= 20);
Predicate<String> notBlank = Predicate.not(String::isBlank);

Consumer<String> writeLog = System.out::println;
writeLog = writeLog.andThen(Main::writeLogToFile);    // кілька дій по черзі
writeLog.accept("DEBUG: тестовий запис");

Comparator<Person> order = Comparator.comparing(Person::lastName)
        .thenComparing(Person::firstName)
        .reversed();
```

Якщо треба викликати змінний набір обробників (додавати й видаляти їх під час роботи), їх зберігають у списку. Саме так реалізують події (сторінка «Події»).

## Лямбда-вирази

Лямбда — анонімна функція, яку можна присвоїти змінній функціонального інтерфейсу.

```text
(параметри) -> вираз
(параметри) -> { інструкції; }
```

```java
DoubleUnaryOperator square = x -> x * x;                     // один параметр — без дужок
BiFunction<Character, Integer, String> rep = (c, i) -> String.valueOf(c).repeat(i);
Consumer<String> write = str -> System.out.print(str);
Supplier<String> greet = () -> "Hello, world";               // без параметрів
Supplier<String> greet2 = () -> {                            // блокове тіло потребує return
    String name = System.getProperty("user.name");
    return "Hello, " + name;
};
```

* Якщо параметр один і його тип не вказано, дужки можна пропустити.
* Тіло-вираз повертає своє значення без `return`; блокове тіло потребує `return` (якщо метод щось повертає).
* Типи параметрів зазвичай виводяться з цільового типу, але їх можна вказати явно, або для всіх параметрів через `var` (наприклад, щоб додати анотацію).

```java
BinaryOperator<Integer> add = (Integer a, Integer b) -> a + b;
BinaryOperator<Integer> add2 = (var a, var b) -> a + b;
BiFunction<String, String, Boolean> eq = (@NonNull var a, @NonNull var b) -> a.equals(b);
```

### Цільова типізація

Лямбда **не має власного типу**: її тип визначається **контекстом**, тобто функціональним інтерфейсом, якого очікує присвоєння, параметр методу чи приведення. Та сама лямбда може мати різні типи:

```java
Function<Integer, Integer> f = x -> x * 2;
UnaryOperator<Integer> u = x -> x * 2;
IntUnaryOperator i = x -> x * 2;

// var g = x -> x * 2;           // ПОМИЛКА: lambda expression needs an explicit target-type
Object o = (Runnable) () -> { };  // явне приведення задає цільовий тип
```

Тому `var` з лямбдою не працює, а перевантаження методів, які приймають різні функціональні інтерфейси з однаковою кількістю параметрів, можуть бути неоднозначними.

### Посилання на методи

Якщо лямбда лише викликає наявний метод, її можна записати як **посилання на метод** `::`:

| Вид | Приклад | Еквівалентна лямбда |
| --- | --- | --- |
| статичний метод | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| метод конкретного об'єкта | `System.out::println`, `quadratic::function` | `x -> System.out.println(x)` |
| метод довільного об'єкта типу | `String::toUpperCase` | `s -> s.toUpperCase()` |
| конструктор | `ArrayList::new` | `() -> new ArrayList<>()` |
| конструктор масиву | `int[]::new` | `n -> new int[n]` |

```java
List<String> names = List.of("anna", "bob");
names.stream().map(String::toUpperCase).forEach(System.out::println);

BiFunction<String, String, Boolean> startsWith = String::startsWith;   // (s, p) -> s.startsWith(p)
Function<String, Path> toPath = Path::of;
```

> [!WARNING]
> Вираз перед `::` в посиланні на метод конкретного об'єкта обчислюється **одразу**, під час створення посилання, а не під час виклику. `Supplier<String> s = getConfig()::name;` викличе `getConfig()` одразу (і кине `NullPointerException`, якщо отримає `null`).

## Захоплення змінних

Лямбда може використовувати змінні з навколишнього контексту: локальні змінні, параметри, поля, `this`. Але **локальні змінні** можна захоплювати лише тоді, коли вони **effectively final**, тобто не змінюються після ініціалізації. Java **копіює значення** локальної змінної в об'єкт лямбди. Заборона змінювати змінну гарантує, що копія й оригінал не розійдуться.

```java
int factor = 3;
IntUnaryOperator triple = x -> x * factor;     // OK: factor не змінюється
// factor = 4;                                  // тоді рядок вище перестане компілюватися

int counter = 0;
// list.forEach(x -> counter++);                // ПОМИЛКА: counter не effectively final
```

Через це в Java неможлива класична пастка «усі лямбди в циклі бачать останнє значення лічильника»: змінну класичного циклу `for` захопити просто не вийде, а змінна циклу for-each — нова в кожній ітерації:

```java
List<Runnable> actions = new ArrayList<>();
for (int i = 0; i < 3; i++) {
    // actions.add(() -> System.out.print(i));  // ПОМИЛКА: i змінюється
    int copy = i;                               // нова effectively final змінна на кожну ітерацію
    actions.add(() -> System.out.print(copy));
}
for (String s : List.of("a", "b")) {
    actions.add(() -> System.out.print(s));     // OK
}
actions.forEach(Runnable::run);                 // 012ab
```

**Поля** (і `this`) захоплюються за посиланням: лямбда бачить їхні поточні значення й може їх змінювати. Так само можна змінювати **вміст** захопленого об'єкта:

```java
class Clicker {
    private int clicks;                         // поле можна змінювати з лямбди
    Runnable onClick = () -> clicks++;
}

AtomicInteger count = new AtomicInteger();      // посилання незмінне, вміст — так
names.forEach(n -> count.incrementAndGet());
```

### Як компілюються лямбди

Компілятор не генерує окремого `.class` для кожної лямбди. Тіло лямбди стає приватним методом класу, а в місці її створення стоїть інструкція `invokedynamic`, яка під час першого виконання через `LambdaMetafactory` будує клас, що реалізує інтерфейс.

* **Незахоплювальна** лямбда (без захоплених змінних) зазвичай створюється один раз і далі використовується повторно, без нових об'єктів.
* **Захоплювальна** лямбда створює новий об'єкт під час кожного обчислення виразу, бо зберігає захоплені значення в полях.

У «гарячих» циклах це варто пам'ятати, хоча JIT часто прибирає такі виділення пам'яті.

## Анонімні класи

До Java 8 поведінку передавали **анонімними класами**. Вони досі корисні, коли треба реалізувати кілька методів, мати поля або розширити клас, а не інтерфейс:

```java
Numerics.Function1D f = new Numerics.Function1D() {
    @Override
    public double apply(double x) {
        return x * x - 2 * x + 1;
    }
};
```

Відмінності від лямбди:

* у лямбді `this` — це об'єкт **зовнішнього** класу, в анонімному класі — сам анонімний об'єкт;
* анонімний клас завжди створює новий об'єкт і окремий файл `.class` (`Main$1.class`);
* анонімний клас може оголошувати поля й кілька методів.

Для «порожньої» реалізації (замість `null`, щоб не перевіряти його перед викликом) зручно мати готову константу:

```java
Consumer<String> noLog = s -> { };
noLog.accept("нічого не станеться");
```
