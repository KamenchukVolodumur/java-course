---
title: Наслідування
description: extends і одиничне наслідування, поліморфізм і приведення типів, instanceof, віртуальні методи й @Override, super, абстрактні класи, приховування полів і статичних методів, final і sealed, конструктори та порядок ініціалізації.
---

## Наслідування

Клас наслідує інший клас ключовим словом `extends`. Наслідування в Java відповідає публічному наслідуванню в C++, але **множинного наслідування класів немає**: клас має рівно одного безпосереднього надкласу (за замовчуванням — `Object`). Множинність реалізується через інтерфейси.

```java
public class Person {
    protected String firstName;
    protected String lastName;
    protected int age;

    public Person(String firstName, String lastName, int age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }

    public String fullName() { return firstName + " " + lastName; }
}

public class Student extends Person {
    private final String studentId;

    public Student(String firstName, String lastName, int age, String studentId) {
        super(firstName, lastName, age);         // виклик конструктора надкласу
        this.studentId = studentId;
    }

    public String studentId() { return studentId; }
}
```

`Student` є також `Person` і має все, що має надклас (крім приватних членів, які існують в об'єкті, але недоступні з коду підкласу, і конструкторів, які не успадковуються).

```java
Student alice = new Student("Alice", "Brown", 25, "X-84355");
System.out.println(alice.fullName() + ", " + alice.age + ", " + alice.studentId());
```

## Поліморфізм

Посилання **поліморфні**: об'єкт підкласу можна використати всюди, де очікується надклас. Код, написаний для загального типу, працює з будь-якою реалізацією.

```java
static void register(Person person) {
    System.out.println("Зареєстровано: " + person.fullName());
}

register(alice);                 // Student передано як Person
```

**Висхідне** приведення (до надкласу) неявне і завжди безпечне. **Низхідне** (до підкласу) вимагає явного приведення і, якщо фактичний тип не відповідає, кидає `ClassCastException`:

```java
Person person = alice;                    // неявне висхідне
Student student = (Student) person;       // явне низхідне: OK, бо це справді Student

Person bob = new Person("Bob", "Smith", 40);
// Teacher t = (Teacher) bob;             // ClassCastException під час виконання
```

### Оператор instanceof

`instanceof` перевіряє, чи об'єкт є екземпляром типу (або його підтипу). Для `null` результат завжди `false`. Від Java 16 він підтримує **зразок типу**: якщо перевірка успішна, об'єкт одразу доступний як змінна потрібного типу.

```java
if (person instanceof Teacher) {               // класична форма
    Teacher teacher = (Teacher) person;
    System.out.println("SAP ID: " + teacher.sapId());
}

if (person instanceof Teacher teacher) {        // зразок типу
    System.out.println("SAP ID: " + teacher.sapId());
}

if (!(person instanceof Teacher teacher)) {
    return;
}
System.out.println(teacher.sapId());            // teacher доступна й тут
```

## Віртуальні методи

У Java **усі** нестатичні, не-`private` і не-`final` методи **віртуальні** за замовчуванням: під час виклику JVM дивиться на **фактичний** клас об'єкта, а не на тип змінної (динамічна диспетчеризація). Окремого ключового слова `virtual` немає.

Метод підкласу з тією самою сигнатурою **перевизначає** (overrides) метод надкласу. Анотація `@Override` необов'язкова, але настійно рекомендована: якщо сигнатура випадково не збігається (друкарська помилка, інший тип параметра), компілятор повідомить про помилку замість того, щоб тихо створити новий метод.

Ключове слово `super` має два значення:

* `super.method()` — виклик реалізації з надкласу;
* `super(...)` — виклик конструктора надкласу (першою інструкцією конструктора).

```java
public class Vehicle {
    protected float position = 0;
    protected float speed = 1.0f;
    private final String name;

    public Vehicle(String name) { this.name = name; }

    public String name() { return name; }
    public float position() { return position; }

    public float run(float dt) {
        System.out.println("Vehicle.run(" + dt + ")");
        position += dt * speed;
        return position;
    }
}

public class Car extends Vehicle {
    private final float acceleration;

    public Car(String name, float acceleration) {
        super(name);
        this.speed = 0.0f;
        this.acceleration = acceleration;
    }

    @Override
    public float run(float dt) {
        System.out.println("Car.run(" + dt + ")");
        position += dt * speed;
        speed += dt * acceleration;
        return position;
    }
}

public class Bike extends Vehicle {
    public Bike(String name) { super(name); }

    @Override
    public float run(float dt) {
        System.out.println("Bike.run(" + dt + ")");
        return super.run(dt);                  // реалізація з Vehicle
    }
}
```

```java
List<Vehicle> vehicles = List.of(new Bike("Romet"), new Car("Honda Civic", 1.5f), new Car("Toyota Yaris", 1.0f));

final float dt = 1.0f;
for (float time = 0.0f; time < 4.0f; time += dt) {
    System.out.printf("====== time: %5.1fs ======%n", time);
    for (Vehicle v : vehicles) v.run(dt);
    for (Vehicle v : vehicles) System.out.printf("%s: position %.1f%n", v.name(), v.position());
}
```

Якщо `v` — це `Car`, викликається `Car.run`; якщо `Bike` — `Bike.run`. Якби клас не перевизначив метод, викликався б `Vehicle.run`. Під капотом JVM використовує таблиці віртуальних методів (vtable), а JIT часто перетворює такі виклики на прямі, якщо бачить, що реалізація лише одна.

### Правила перевизначення

* Сигнатура (ім'я й типи параметрів) має збігатися.
* Тип результату може бути таким самим або **підтипом** (коваріантний тип результату): `Animal create()` можна перевизначити як `Dog create()`.
* Видимість можна **розширити**, але не звузити: `protected` → `public` можна, `public` → `protected` — ні.
* Метод не може оголосити нові чи ширші **checked**-винятки, ніж метод надкласу.
* `private`, `static` і `final` методи не перевизначаються.

## Абстрактні класи

Клас з модифікатором `abstract` не можна інстанціювати. Він може містити **абстрактні методи**: оголошення без тіла, які кожен неабстрактний підклас мусить реалізувати. Водночас абстрактний клас може мати поля, конструктори й звичайні методи.

```java
public abstract class Vehicle {
    protected float position = 0;
    protected float speed = 1.0f;
    private final String name;

    protected Vehicle(String name) { this.name = name; }   // конструктор для підкласів

    public abstract float run(float dt);                    // без реалізації

    public String name() { return name; }
}

// new Vehicle("x");      // ПОМИЛКА: Vehicle is abstract; cannot be instantiated
```

## Приховування членів

Підклас може оголосити **поле** з тим самим ім'ям, що й у надкласі, або **статичний метод** з тією самою сигнатурою. Тоді член надкласу **приховується** (hiding), а не перевизначається: що саме буде використано, визначає **статичний тип** посилання під час компіляції.

```java
public class Base {
    public int member = 0;
    public static String staticMethod() { return "Base.staticMethod"; }
    public String method() { return "Base.method"; }
}

public class Hider extends Base {
    public int member = 1;                                       // приховує поле
    public static String staticMethod() { return "Hider.staticMethod"; }   // приховує статичний метод
    @Override public String method() { return "Hider.method"; }  // ПЕРЕВИЗНАЧАЄ
}

Hider hider = new Hider();
Base asBase = hider;

System.out.println(hider.member);           // 1
System.out.println(asBase.member);          // 0: поле обирається за статичним типом
System.out.println(Hider.staticMethod());   // Hider.staticMethod
System.out.println(Base.staticMethod());    // Base.staticMethod
System.out.println(hider.method());         // Hider.method
System.out.println(asBase.method());        // Hider.method: динамічна диспетчеризація
```

> [!IMPORTANT]
> Методи **екземпляра** в Java приховати неможливо: метод з тією самою сигнатурою завжди перевизначає. Тому поліморфізм методів надійний, а приховування полів майже завжди є помилкою. Звертайтеся до полів через методи і робіть їх `private`.

## final і sealed

* `final` на **методі** забороняє його перевизначати в підкласах.
* `final` на **класі** забороняє від нього наслідуватися (`String`, `Integer`, records).

Від Java 17 є проміжний варіант — **sealed**-класи. Вони дозволяють наслідуватися лише явно перелікованим класам:

```java
public sealed class Shape permits Circle, Square, Polygon { }

public final class Circle extends Shape { }        // гілку закрито
public final class Square extends Shape { }
public non-sealed class Polygon extends Shape { }  // гілку знову відкрито для будь-яких підкласів
```

Кожен дозволений підклас мусить бути `final`, `sealed` або `non-sealed`. Закрита ієрархія дозволяє компілятору перевіряти вичерпність `switch` (сторінка «Зіставлення зі зразком»).

## Конструктори та порядок ініціалізації

Конструктори **не успадковуються**: підклас оголошує власні. Кожен конструктор підкласу мусить спершу ініціалізувати частину надкласу — явно викликати `super(...)` першою інструкцією. Якщо виклику немає, компілятор вставляє `super()`; якщо в надкласу немає конструктора без параметрів, це помилка компіляції.

```java
public class Base {
    protected final int x;
    public Base(int x) { this.x = x; }
}

public class Derived extends Base {
    private final int y;
    public Derived(int x, int y) {
        super(x);                 // обов'язково: у Base немає конструктора без параметрів
        this.y = y;
    }
}
```

### Порядок ініціалізації

Під час `new Derived(...)`:

1. статична ініціалізація `Base`, потім `Derived` (якщо класи ще не ініціалізовано);
2. виклик конструктора `Derived` → він викликає `super(...)`;
3. ініціалізатори полів і блоки екземпляра `Base`, потім тіло конструктора `Base`;
4. ініціалізатори полів і блоки екземпляра `Derived`;
5. тіло конструктора `Derived` після `super(...)`.

> [!CAUTION]
> Не викликайте в конструкторі методи, які може перевизначити підклас. Конструктор надкласу виконується **до** ініціалізації полів підкласу, тож перевизначений метод побачить їх незаповненими:

```java
class Parent {
    Parent() { describe(); }                 // виклик віртуального методу в конструкторі
    void describe() { System.out.println("Parent"); }
}

class Child extends Parent {
    private final List<String> items = new ArrayList<>();
    @Override void describe() { System.out.println(items.size()); }   // items ще null!
}

new Child();    // NullPointerException
```
