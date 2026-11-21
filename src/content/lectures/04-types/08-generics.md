---
title: Generics
description: Узагальнені класи й методи, виведення типів, обмеження (bounded types), рекурсивні обмеження, інваріантність, wildcards і правило PECS, стирання типів та його наслідки, сирі типи.
---

## Generics

Узагальнені типи (generics) дозволяють писати код, незалежний від конкретного типу даних, зі збереженням перевірки типів компілятором. Вони з'явилися в Java 5 і слугують тій самій меті, що шаблони в C++, але влаштовані інакше.

Шаблон C++ — це заготовка, з якої компілятор генерує **окрему копію** коду для кожного типу. Generics у Java компілюються **один раз**: компілятор перевіряє типи, а потім **стирає** їх (type erasure). У байт-коді `List<String>` і `List<Integer>` — це той самий клас `List`, а замість `T` стоїть `Object` (або верхня межа типу). У потрібних місцях компілятор сам вставляє приведення типів.

Код generic-класу перевіряється **в момент оголошення**, а не в момент використання. Щоб викликати на значенні типу `T` якісь методи, треба явно обмежити `T`. Ось метод, що повертає більше з двох значень: без обмеження компілятор не дозволить викликати `compareTo`:

```java
static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

max(3, 7);              // 7
max("pear", "apple");   // "pear"
// max(new Object(), new Object());   // ПОМИЛКА: Object не реалізує Comparable
```

Параметрами generic-типу можуть бути **лише посилальні типи**. Нетипових параметрів (сталих значень на кшталт `10` чи `true`, як у шаблонах C++) немає, а примітиви замінюються обгортками: `List<Integer>`, а не `List<int>`.

## Без generics

Уявімо, що потрібен стек для `int`, `double` і `String`. Без generics можна написати три класи (`IntStack`, `DoubleStack`, `StringStack`) з однаковим кодом або один стек на `Object`:

```java
public class ObjectStack {
    private Object[] items = new Object[8];
    private int count;

    public void push(Object item) {
        if (items.length == count) items = Arrays.copyOf(items, count * 2);
        items[count++] = item;
    }

    public Object pop() {
        if (count == 0) throw new IllegalStateException("Стек порожній");
        Object item = items[--count];
        items[count] = null;                 // не тримати посилання: інакше витік пам'яті
        return item;
    }

    public int size() { return count; }
}
```

Використання такого стеку виявляє проблеми. По-перше, числа доводиться упаковувати. По-друге, немає безпеки типів: діставання елемента — це небезпечне низхідне приведення, і помилка виявиться лише під час виконання.

```java
ObjectStack stack = new ObjectStack();
for (int i = 0; i < 10; i++) stack.push(i);      // упакування в Integer

int number = (Integer) stack.pop();
String str = (String) stack.pop();               // ClassCastException під час виконання
```

## Узагальнені класи

Узагальнена версія:

```java
public class Stack<T> {
    private T[] items;
    private int count;

    @SuppressWarnings("unchecked")
    public Stack() {
        items = (T[]) new Object[8];             // new T[8] неможливо (див. «Стирання типів»)
    }

    public void push(T item) {
        if (items.length == count) items = Arrays.copyOf(items, count * 2);
        items[count++] = item;
    }

    public T pop() {
        if (count == 0) throw new IllegalStateException("Стек порожній");
        T item = items[--count];
        items[count] = null;
        return item;
    }

    public int size() { return count; }
    public boolean isEmpty() { return count == 0; }
}
```

Тепер стек типобезпечний, а помилка виявляється під час компіляції:

```java
Stack<Integer> stack = new Stack<>();            // diamond <>: компілятор виводить Integer
for (int i = 0; i < 10; i++) stack.push(i);

// String str = stack.pop();                     // ПОМИЛКА КОМПІЛЯЦІЇ
while (!stack.isEmpty()) {
    int number = stack.pop();                    // автоматичне розпакування
    System.out.println(number);
}
```

> [!NOTE]
> Узагальнений стек на `Integer` усе одно упаковує числа: generics не прибирають упакування, бо параметр завжди посилальний тип. Для мільйонів чисел використовують масиви примітивів або спеціалізовані бібліотеки (fastutil, Eclipse Collections).

Параметрів типу може бути кілька. За конвенцією їх позначають однією великою літерою: `T` (type), `E` (element), `K`/`V` (key/value), `R` (result).

```java
public record Pair<A, B>(A first, B second) {
    public <C> Pair<A, C> withSecond(C newSecond) { return new Pair<>(first, newSecond); }
}

var p = new Pair<>("age", 21);                   // Pair<String, Integer>
```

## Узагальнені методи

Метод може оголосити власні параметри типу — перед типом результату:

```java
public static <T> void swap(T[] array, int i, int j) {
    T tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

public static <T> List<T> repeat(T value, int n) {
    List<T> result = new ArrayList<>(n);
    for (int i = 0; i < n; i++) result.add(value);
    return result;
}
```

Зазвичай компілятор **виводить** параметри типу з аргументів і з цільового типу (куди присвоюється результат). Якщо вивести не вдається, тип задають явно перед ім'ям методу:

```java
Integer[] nums = {3, 5};
swap(nums, 0, 1);                                // T = Integer
List<String> xs = repeat("a", 3);                // T = String
List<Number> ns = Collections.<Number>emptyList();   // явний аргумент типу
```

## Обмеження типів

Про параметр `T` без обмежень відомо лише те, що це `Object`: можна викликати методи `Object` і нічого більше. **Обмеження** (bound) повідомляє компілятору більше: якщо `T extends Тип`, на значеннях `T` можна викликати методи цього типу.

```java
public static <T extends Comparable<T>> T max(T first, T... rest) {
    T max = first;
    for (T t : rest) {
        if (max.compareTo(t) < 0) max = t;
    }
    return max;
}

static double sum(List<? extends Number> numbers) { ... }   // див. wildcards нижче
```

* `T extends Клас` — `T` є цим класом або його підкласом (для інтерфейсів теж пишуть `extends`, а не `implements`).
* Кілька обмежень поєднують через `&`: спершу клас (якщо є), потім інтерфейси.

```java
public static <T extends Number & Comparable<T>> T clampToMax(T value, T max) {
    return value.compareTo(max) > 0 ? max : value;
}
```

Інших видів обмежень (наявність конструктора, «лише типи-значення» тощо) немає. Якщо generic-коду потрібно створювати екземпляри `T`, йому передають **фабрику** (`Supplier<T>`) або об'єкт `Class<T>`.

## Рекурсивні обмеження

У визначенні типу можна використати сам тип як аргумент generic-інтерфейсу:

```java
public class Product implements Comparable<Product> {
    private final String ean;
    public Product(String ean) { this.ean = ean; }

    @Override
    public int compareTo(Product other) { return ean.compareTo(other.ean); }
}
```

Це має сенс: `Product` повідомляє, що його можна порівнювати з іншими екземплярами свого типу. Параметр типу можна обмежити ним самим:

```java
public class SortedBag<T extends Comparable<T>> {
    private final List<T> items = new ArrayList<>();

    public void add(T item) {
        int pos = Collections.binarySearch(items, item);
        items.add(pos >= 0 ? pos : -pos - 1, item);
    }
}
```

Найвідоміший приклад — оголошення enum у JDK: `abstract class Enum<E extends Enum<E>> implements Comparable<E>`. Завдяки цьому `compareTo` приймає лише константи того самого enum.

## Інваріантність

Generic-типи в Java **інваріантні**: навіть якщо `Car` є підтипом `Vehicle`, то `Stack<Car>` **не** є підтипом `Stack<Vehicle>` і навпаки.

```java
abstract class Vehicle { }
class Car extends Vehicle { }
class Bike extends Vehicle { }

Stack<Car> carStack = new Stack<>();
// Stack<Vehicle> vehicles = carStack;     // ПОМИЛКА
// vehicles.push(new Bike());              // інакше в стек машин потрапив би велосипед

Stack<Vehicle> vehicleStack = new Stack<>();
// Stack<Car> cars = vehicleStack;         // ПОМИЛКА
// Car c = cars.pop();                     // інакше звідси міг би вийти велосипед
```

Порівняйте з масивами, які коваріантні і тому перевіряють записи під час виконання (`ArrayStoreException`, сторінка «Масиви»). Generics перевіряють те саме під час компіляції.

## Wildcards: варіантність у місці використання

Щоб метод приймав «стек будь-яких транспортних засобів», використовують **wildcard** `?`. На відміну від мов, де варіантність оголошують на рівні типу, у Java її задають **у місці використання** (use-site variance), у сигнатурі методу.

### Коваріантність: ? extends

`Stack<? extends Vehicle>` означає «стек елементів **якогось** підтипу `Vehicle`». З нього можна **читати** значення як `Vehicle`, але **не можна записувати** (крім `null`): компілятор не знає, який саме підтип там лежить.

```java
static void washVehicles(Stack<? extends Vehicle> vehicles) {
    while (!vehicles.isEmpty()) {
        Vehicle v = vehicles.pop();             // читання — OK
        System.out.println("Мию " + v);
    }
    // vehicles.push(new Car());                // ПОМИЛКА: може бути Stack<Bike>
}

Stack<Car> cars = new Stack<>();
cars.push(new Car());
washVehicles(cars);                             // Stack<Car> підходить
```

### Контраваріантність: ? super

`Stack<? super Car>` означає «стек елементів, що є `Car` або **надтипом** `Car`». У нього можна **записувати** `Car`, а прочитати можна лише як `Object`.

```java
static void deliverCars(Stack<? super Car> target, int count) {
    for (int i = 0; i < count; i++) {
        target.push(new Car());                 // запис — OK: Car підходить і в Stack<Vehicle>, і в Stack<Object>
    }
    // Car c = target.pop();                    // ПОМИЛКА: там може бути Bike
}

Stack<Vehicle> garage = new Stack<>();
garage.push(new Bike());
deliverCars(garage, 2);                         // Stack<Vehicle> підходить
```

### Правило PECS

**Producer `extends`, Consumer `super`**: якщо параметр **постачає** значення методу (з нього читають) — `? extends T`; якщо **споживає** (у нього пишуть) — `? super T`; якщо і те, і те — точний тип `T`.

```java
// Collections.copy зі стандартної бібліотеки:
public static <T> void copy(List<? super T> dest, List<? extends T> src) { ... }

// Collections.max:
public static <T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll) { ... }
```

`Comparable<? super T>` у `max` дозволяє знайти максимум у `List<java.sql.Timestamp>`, хоча `Timestamp` реалізує `Comparable<java.util.Date>` (надтипу), а не `Comparable<Timestamp>`.

### Необмежений wildcard: ?

`List<?>` — «список якогось невідомого типу». Елементи можна прочитати лише як `Object`, а записати лише `null`. Це зручно для методів, яким тип елементів байдужий:

```java
static int countNulls(Collection<?> items) {
    int n = 0;
    for (Object o : items) if (o == null) n++;
    return n;
}
```

## Стирання типів

Компілятор перевіряє generics, а потім **стирає** інформацію про параметри типу: `T` замінюється своєю межею (`Object` або `Comparable`), а там, де результат використовується, вставляються приведення. Так зроблено заради сумісності з кодом, написаним до Java 5.

```java
List<String> names = new ArrayList<>();
names.add("Ola");
String s = names.get(0);
// після стирання це приблизно:
// List names = new ArrayList();
// names.add("Ola");
// String s = (String) names.get(0);
```

Наслідки стирання:

```java
class Container<T> {
    // T value = new T();                  // ПОМИЛКА: тип T невідомий під час виконання
    // T[] array = new T[10];              // ПОМИЛКА: не можна створити масив T
    // static T shared;                    // ПОМИЛКА: статичні члени спільні для всіх T
    // boolean b = obj instanceof T;       // ПОМИЛКА
}

// if (list instanceof List<String>)       // ПОМИЛКА: можна лише instanceof List<?>
// List<String>[] arr = new List<String>[3];   // ПОМИЛКА: масиви параметризованих типів

class Printer {
    // void print(List<String> xs) { }
    // void print(List<Integer> xs) { }    // ПОМИЛКА: після стирання однакові сигнатури
}

System.out.println(new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass());   // true
```

Обхідні шляхи — передати потрібну інформацію явно:

```java
public class Repository<T> {
    private final Class<T> type;             // «токен типу»
    private final Supplier<T> factory;

    public Repository(Class<T> type, Supplier<T> factory) {
        this.type = type;
        this.factory = factory;
    }

    public T create() { return factory.get(); }
    public boolean accepts(Object o) { return type.isInstance(o); }
    public T[] newArray(int n) {
        @SuppressWarnings("unchecked")
        T[] arr = (T[]) java.lang.reflect.Array.newInstance(type, n);
        return arr;
    }
}

var repo = new Repository<>(StringBuilder.class, StringBuilder::new);
```

> [!NOTE]
> Стерто не все: інформація про generic-типи **в оголошеннях** (поля, параметри методів, надкласи) зберігається в байт-коді й доступна через рефлексію. На цьому побудовано трюк із «токеном типу» в бібліотеках серіалізації: `new TypeReference<List<Order>>() { }` — анонімний підклас, чий надклас зберігає повний тип.

## Сирі типи

Generic-тип без аргументів (`List` замість `List<String>`) називається **сирим** (raw type). Сирі типи існують лише для сумісності зі старим кодом: вони вимикають перевірку типів, і помилка проявиться як `ClassCastException` далеко від місця, де її зроблено (heap pollution).

```java
List raw = new ArrayList<String>();          // попередження: unchecked
raw.add(42);                                 // компілюється!
List<String> strings = raw;
String s = strings.get(0);                   // ClassCastException тут, а не там, де додали 42
```

> [!CAUTION]
> Не використовуйте сирі типи. Якщо тип елементів невідомий або байдужий, пишіть `List<?>` чи `List<Object>`. Попередження компілятора `unchecked` варто читати: кожне з них — місце, де Java не може гарантувати безпеку типів.
