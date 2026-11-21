---
title: Вкладені типи
description: Статичні вкладені класи, внутрішні класи і Outer.this, локальні та анонімні класи, доступ до приватних членів, патерн Builder, вкладені інтерфейси, enum і records, витоки пам'яті через внутрішні класи.
---

## Вкладені типи

Тип можна оголосити всередині іншого типу. Це зручно, коли тип тісно пов'язаний з тим, що його містить, і не повинен «засмічувати» пакет. У Java є чотири види вкладених класів:

| Вид | Де оголошено | Пов'язаний з екземпляром зовнішнього класу |
| --- | --- | --- |
| **статичний вкладений** (static nested) | у тілі класу, з `static` | ні |
| **внутрішній** (inner) | у тілі класу, без `static` | так, через неявне `Outer.this` |
| **локальний** | усередині методу чи блоку | так (у методі екземпляра) + доступ до effectively final змінних |
| **анонімний** | у виразі `new Тип() { ... }` | так (у методі екземпляра) + доступ до effectively final змінних |

Вкладені **інтерфейси, enum і records** завжди неявно статичні.

## Статичні вкладені класи

Статичний вкладений клас поводиться як звичайний верхньорівневий клас, лише з іменем, «вкладеним» в ім'я зовнішнього (`Car.Engine`). Він не має доступу до полів екземпляра зовнішнього класу, але бачить усі його статичні члени, включно з **приватними**.

```java
public class Car {
    private final Engine engine;

    public Car(Engine engine) { this.engine = engine; }

    public static class Engine {
        private final int horsePower;
        private final EngineType type;

        public Engine(int horsePower, EngineType type) {
            this.horsePower = horsePower;
            this.type = type;
        }
    }

    public enum EngineType { GASOLINE, DIESEL, ELECTRIC }
}

Car.Engine engine = new Car.Engine(150, Car.EngineType.DIESEL);
Car car = new Car(engine);
```

Вкладений тип може мати будь-який модифікатор доступу. Зовнішній клас і вкладені класи мають **взаємний доступ до приватних членів**. Саме на цьому побудовано класичний **Builder**: вкладений клас викликає приватний конструктор зовнішнього.

```java
public final class Pizza {
    public enum Topping { PEPPERONI, SAUSAGE, MUSHROOMS, CHEESE, ONIONS }

    private final int sizeCm;
    private final List<Topping> toppings;

    private Pizza(Builder builder) {                 // створити можна лише через Builder
        this.sizeCm = builder.sizeCm;
        this.toppings = List.copyOf(builder.toppings);
    }

    public int sizeCm() { return sizeCm; }
    public List<Topping> toppings() { return toppings; }

    public static class Builder {
        private final int sizeCm;
        private final List<Topping> toppings = new ArrayList<>();

        public Builder(int sizeCm) { this.sizeCm = sizeCm; }

        public Builder addTopping(Topping topping) {
            toppings.add(topping);
            return this;
        }

        public Pizza build() { return new Pizza(this); }
    }
}
```

Ззовні вкладений тип використовують з кваліфікованим іменем (або імпортують: `import pl.mini.Pizza.Builder;`):

```java
Pizza largePepperoni = new Pizza.Builder(40)
        .addTopping(Pizza.Topping.PEPPERONI)
        .addTopping(Pizza.Topping.CHEESE)
        .build();
```

## Внутрішні класи

Вкладений клас **без** `static` — внутрішній. Кожен його об'єкт прив'язаний до конкретного об'єкта зовнішнього класу й має прямий доступ до всіх його полів і методів, навіть приватних. Посилання на зовнішній об'єкт доступне як `Outer.this`.

```java
public class Playlist implements Iterable<String> {
    private final String[] songs;
    private final String name;

    public Playlist(String name, String... songs) {
        this.name = name;
        this.songs = songs;
    }

    @Override
    public Iterator<String> iterator() {
        return new SongIterator();          // створюється «в контексті» this
    }

    private class SongIterator implements Iterator<String> {
        private int index = 0;

        @Override public boolean hasNext() { return index < songs.length; }   // поле зовнішнього об'єкта

        @Override public String next() {
            if (!hasNext()) throw new NoSuchElementException();
            return Playlist.this.name + ": " + songs[index++];
        }
    }
}

for (String s : new Playlist("Ранок", "Intro", "Sunrise")) {
    System.out.println(s);                  // Ранок: Intro, Ранок: Sunrise
}
```

Ззовні внутрішній клас створюють через екземпляр зовнішнього (синтаксис рідкісний):

```java
Playlist p = new Playlist("x", "a");
Playlist.SongIterator it = p.new SongIterator();   // якби клас був доступний
```

> [!WARNING]
> Об'єкт внутрішнього класу тримає приховане посилання на зовнішній об'єкт. Якщо внутрішній об'єкт живе довше (зареєстрований слухач, задача в пулі потоків, елемент кешу), зовнішній не може бути зібраний збирачем сміття, і виникає витік пам'яті. **Правило:** якщо вкладеному класу не потрібен доступ до екземпляра зовнішнього, оголошуйте його `static`.

## Локальні класи

Клас можна оголосити всередині методу. Він видимий лише в цьому блоці й має доступ до локальних змінних методу, якщо вони **effectively final**. Від Java 16 так само можна оголошувати локальні records, enum та інтерфейси (вони статичні й не бачать локальних змінних).

```java
List<String> topWords(List<String> words, int n) {
    record Count(String word, long count) { }          // локальний record

    return words.stream()
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()))
            .entrySet().stream()
            .map(e -> new Count(e.getKey(), e.getValue()))
            .sorted(Comparator.comparingLong(Count::count).reversed())
            .limit(n)
            .map(Count::word)
            .toList();
}
```

## Анонімні класи

Анонімний клас оголошується й інстанціюється одним виразом. Він реалізує інтерфейс або розширює клас «на місці»:

```java
Comparator<String> byLength = new Comparator<>() {
    @Override
    public int compare(String a, String b) {
        return Integer.compare(a.length(), b.length());
    }
};

Thread worker = new Thread() {
    @Override
    public void run() {
        System.out.println("працюю в " + getName());
    }
};
```

Для інтерфейсів з одним абстрактним методом (функціональних) замість анонімного класу пишуть **лямбду**: `Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());`. Анонімний клас потрібен, коли треба реалізувати кілька методів, мати стан (поля) або розширити клас.

> [!NOTE]
> У лямбді `this` означає об'єкт зовнішнього класу, а в анонімному класі — сам анонімний об'єкт. Це одна з причин, чому лямбда не є просто «скороченим записом» анонімного класу.
