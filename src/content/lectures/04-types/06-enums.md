---
title: Перелічення (enum)
description: Enum як повноцінні класи, вбудовані методи values, valueOf, ordinal, поля, конструктори й методи, поведінка окремих констант, enum у switch, EnumSet як набір прапорців, EnumMap.
---

## Перелічення

Enum у Java — це **повноцінний клас**, який неявно наслідує `java.lang.Enum`. Кожна константа — це єдиний екземпляр цього класу, створений під час завантаження класу. Тому enum — не набір чисел, а типобезпечний набір об'єктів.

```java
public enum BorderSide {
    LEFT, RIGHT, TOP, BOTTOM
}

BorderSide side = BorderSide.TOP;
System.out.println(side);              // TOP
```

* Іншого значення, ніж оголошені константи (і `null`), змінна типу enum мати не може.
* Створити новий екземпляр через `new` неможливо; конструктор enum завжди `private`.
* Константи порівнюють через `==` (кожна існує в одному екземплярі) або `switch`.

## Вбудовані методи

```java
BorderSide.values();                   // [LEFT, RIGHT, TOP, BOTTOM] — новий масив щоразу
BorderSide.valueOf("TOP");             // TOP; невідома назва -> IllegalArgumentException
BorderSide.TOP.name();                 // "TOP"
BorderSide.TOP.ordinal();              // 2: позиція в оголошенні
BorderSide.TOP.compareTo(BorderSide.LEFT);   // > 0: порівняння за ordinal
BorderSide.TOP.getDeclaringClass();    // class BorderSide
```

**Неявних перетворень** між enum і числами немає, і арифметики над константами теж немає. Позицію дає `ordinal()`, а константу за позицією — `values()[i]`.

> [!WARNING]
> Не використовуйте `ordinal()` як «значення» константи (код у базі даних, номер у протоколі). Перестановка або вставка нової константи тихо змінить усі номери. Якщо константі потрібне число, оголосіть для нього поле.

## Поля, конструктори й методи

Оскільки enum — клас, він може мати поля, конструктори, методи й реалізовувати інтерфейси. Константи передають аргументи конструктору:

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);      // крапка з комою, якщо далі є члени

    private static final double G = 6.67300E-11;
    private final double mass;         // кг
    private final double radius;       // м

    Planet(double mass, double radius) {   // завжди private
        this.mass = mass;
        this.radius = radius;
    }

    public double surfaceGravity() {
        return G * mass / (radius * radius);
    }

    public double surfaceWeight(double otherMass) {
        return otherMass * surfaceGravity();
    }
}

double earthWeight = 70;
double mass = earthWeight / Planet.EARTH.surfaceGravity();
for (Planet p : Planet.values()) {
    System.out.printf("Вага на %s: %.2f%n", p, p.surfaceWeight(mass));
}
```

Типовий приклад — enum з кодом для зовнішньої системи і зворотним пошуком:

```java
public enum HttpStatus {
    OK(200), NOT_FOUND(404), SERVER_ERROR(500);

    private final int code;
    HttpStatus(int code) { this.code = code; }
    public int code() { return code; }

    private static final Map<Integer, HttpStatus> BY_CODE =
            Arrays.stream(values()).collect(Collectors.toMap(HttpStatus::code, s -> s));

    public static Optional<HttpStatus> fromCode(int code) {
        return Optional.ofNullable(BY_CODE.get(code));
    }
}
```

## Поведінка окремих констант

Кожна константа може мати **власне тіло класу** і перевизначати методи. Так замість `switch` усередині методу кожна константа реалізує свою версію:

```java
public enum Operation {
    PLUS("+") {
        @Override public int apply(int a, int b) { return a + b; }
    },
    MINUS("-") {
        @Override public int apply(int a, int b) { return a - b; }
    },
    TIMES("*") {
        @Override public int apply(int a, int b) { return a * b; }
    };

    private final String symbol;

    Operation(String symbol) { this.symbol = symbol; }

    public abstract int apply(int a, int b);     // кожна константа зобов'язана реалізувати

    @Override public String toString() { return symbol; }
}

for (Operation op : Operation.values()) {
    System.out.println("6 " + op + " 3 = " + op.apply(6, 3));
}
```

Якщо до такого enum додати нову константу без реалізації `apply`, програма не скомпілюється.

## Enum у switch

```java
String describe(BorderSide side) {
    return switch (side) {          // default не потрібен: перелічено всі константи
        case LEFT, RIGHT -> "вертикальна";
        case TOP, BOTTOM -> "горизонтальна";
    };
}
```

У `switch` пишуть імена констант без імені типу. Перевага `switch`-виразу над ланцюжком `if/else` — перевірка вичерпності: нова константа змусить оновити всі такі вирази.

## Набори прапорців: EnumSet

Часто значення має бути **комбінацією** кількох констант (наприклад, «ліва і нижня рамки»). У Java для цього використовують не бітові маски, а **`EnumSet`**: типобезпечну множину констант. Усередині це бітовий вектор (`long`), тож операції такі ж швидкі, як побітові.

```java
EnumSet<BorderSide> none = EnumSet.noneOf(BorderSide.class);
EnumSet<BorderSide> leftRight = EnumSet.of(BorderSide.LEFT, BorderSide.RIGHT);
EnumSet<BorderSide> all = EnumSet.allOf(BorderSide.class);
EnumSet<BorderSide> allButTop = EnumSet.complementOf(EnumSet.of(BorderSide.TOP));

System.out.println(allButTop.contains(BorderSide.LEFT));    // true
System.out.println(allButTop.contains(BorderSide.TOP));     // false
System.out.println(allButTop);                              // [LEFT, RIGHT, BOTTOM]

EnumSet<BorderSide> union = EnumSet.copyOf(leftRight);
union.add(BorderSide.BOTTOM);                               // об'єднання
union.retainAll(allButTop);                                 // перетин
EnumSet<BorderSide> range = EnumSet.range(BorderSide.RIGHT, BorderSide.BOTTOM);   // [RIGHT, TOP, BOTTOM]
```

Якщо набір прапорців треба зберегти чи передати як число (наприклад, до бази даних), зручно додати до enum поле з бітом і методи перетворення:

```java
static int toMask(Set<BorderSide> sides) {
    int mask = 0;
    for (BorderSide s : sides) mask |= 1 << s.ordinal();
    return mask;
}
```

## EnumMap

`EnumMap<K, V>` — мапа з ключами-константами enum. Усередині це масив, індексований `ordinal()`: дуже швидка і компактна, а ітерація йде в порядку оголошення констант.

```java
EnumMap<DayOfWeek, List<String>> schedule = new EnumMap<>(DayOfWeek.class);
schedule.put(DayOfWeek.MONDAY, List.of("Java", "Алгоритми"));
schedule.put(DayOfWeek.FRIDAY, List.of("Лабораторна"));
schedule.forEach((day, subjects) -> System.out.println(day + ": " + subjects));
```

> [!TIP]
> Enum з однією константою — найпростіший потокобезпечний **singleton**: JVM гарантує, що екземпляр створюється рівно один раз, і його неможливо продублювати навіть через рефлексію чи серіалізацію.
