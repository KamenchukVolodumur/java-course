---
title: Потокобезпечні колекції
description: Синхронізовані обгортки й їхні обмеження, ConcurrentHashMap та атомарні складені операції, ConcurrentSkipListMap, CopyOnWriteArrayList, ConcurrentLinkedQueue і Deque, слабко узгоджені ітератори, BlockingQueue і її реалізації, шаблон виробник–споживач, завершення «отруйною пігулкою», TransferQueue, незмінні колекції.
---

## Огляд

Звичайні колекції (`ArrayList`, `HashMap`) **не потокобезпечні**: одночасна зміна з кількох потоків може зіпсувати їхню внутрішню структуру, загубити елементи чи навіть зациклити `HashMap`. Пакет `java.util.concurrent` містить колекції для багатопотокового доступу. Синхронізацію вони виконують самі, часто неблокувальними алгоритмами (CAS) або дрібнозернистими замками.

> [!WARNING]
> Без конкуренції звичайні колекції ефективніші за потокобезпечні. Використовуйте потокобезпечні лише там, де до колекції справді звертаються кілька потоків.

## Синхронізовані обгортки

Найпростіший спосіб — обгортки `Collections.synchronizedList/Map/Set`: кожен метод виконується під одним спільним замком.

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());
list.add("a");                                     // потокобезпечно

synchronized (list) {                              // ітерацію треба синхронізувати ВРУЧНУ
    for (String s : list) System.out.println(s);
}
```

Проблеми:

* один замок на всю колекцію: потоки чекають один на одного навіть для читання;
* **складені** операції не атомарні: `if (!list.contains(x)) list.add(x)` з двох потоків може додати `x` двічі;
* ітерація без ручного `synchronized` кидає `ConcurrentModificationException`.

Тому в новому коді використовують спеціалізовані колекції нижче.

## ConcurrentHashMap

`ConcurrentHashMap<K, V>` — потокобезпечна хеш-мапа. Читання не блокуються взагалі, а записи блокують лише окремий «кошик» (bucket), тож різні ключі змінюються паралельно.

Головне — **атомарні складені операції**, що замінюють небезпечні «перевірити, потім діяти»:

```java
ConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>();

stock.putIfAbsent("apple", 0);                          // додати, якщо ключа немає
stock.merge("apple", 5, Integer::sum);                   // атомарно додати 5 (або вставити 5)
stock.compute("apple", (k, v) -> v == null ? 1 : v + 1);
stock.computeIfPresent("apple", (k, v) -> v > 1 ? v - 1 : null);   // null -> видалити ключ
stock.replace("apple", 5, 6);                            // CAS: замінити, лише якщо значення 5
stock.remove("apple", 6);                                // видалити, лише якщо значення 6
```

Кеш з ледачим обчисленням, без повторних обчислень для того самого ключа:

```java
private final ConcurrentHashMap<String, Report> cache = new ConcurrentHashMap<>();

Report report(String id) {
    return cache.computeIfAbsent(id, this::buildReport);   // buildReport викликається не більше разу на ключ
}
```

> [!WARNING]
> Функція в `compute*` виконується **під замком** кошика. Вона має бути короткою й не змінювати ту саму мапу: інакше можливі взаємні блокування або `IllegalStateException: Recursive update`.

Лічильник частот слів з кількох потоків:

```java
ConcurrentHashMap<String, LongAdder> frequencies = new ConcurrentHashMap<>();
words.parallelStream().forEach(w ->
        frequencies.computeIfAbsent(w, k -> new LongAdder()).increment());
```

Масові операції з порогом паралелізму:

```java
long total = stock.reduceValuesToLong(1_000, Integer::longValue, 0L, Long::sum);
stock.forEach(1_000, (k, v) -> System.out.println(k + "=" + v));
```

`ConcurrentHashMap` не допускає `null` ні як ключ, ні як значення: інакше `get` не міг би відрізнити «ключа немає» від «значення null» без додаткової (неатомарної) перевірки.

Потокобезпечна множина: `ConcurrentHashMap.newKeySet()`.

## Інші колекції

| Колекція | Опис |
| --- | --- |
| `ConcurrentSkipListMap`, `ConcurrentSkipListSet` | **відсортовані** потокобезпечні мапа й множина (аналоги `TreeMap`/`TreeSet`) на основі списку з пропусками; неблокувальні |
| `CopyOnWriteArrayList`, `CopyOnWriteArraySet` | кожна зміна **копіює** весь масив; читання й ітерація без замків. Для списків, що читаються дуже часто, а змінюються рідко (слухачі подій) |
| `ConcurrentLinkedQueue` | неблокувальна необмежена черга FIFO (CAS) |
| `ConcurrentLinkedDeque` | неблокувальна двостороння черга; використовується і як стек LIFO |

```java
CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
listeners.add(listener);                          // рідко: копіювання
for (Listener l : listeners) l.onEvent(event);    // часто: без замків, навіть якщо інший потік додає слухача
```

### Ітератори

Ітерація потокобезпечної колекції, яку інший потік саме змінює, **ніколи не кидає** `ConcurrentModificationException`, але гарантії різні:

* ітератори `CopyOnWrite*` працюють зі **знімком** на момент створення ітератора: зміни після цього не видно;
* ітератори `ConcurrentHashMap`, `ConcurrentLinkedQueue`, `ConcurrentSkipListMap` **слабко узгоджені** (weakly consistent): кожен елемент повертається не більше одного разу, а зміни, зроблені під час ітерації, можуть бути видимі, а можуть і ні.

Так само `size()` у потокобезпечних колекціях — лише оцінка, що могла застаріти ще до повернення.

## BlockingQueue

`BlockingQueue<E>` реалізує класичний шаблон **виробник–споживач**: додає до черги блокувальні операції.

| | Кидає виняток | Повертає значення | Блокується | З тайм-аутом |
| --- | --- | --- | --- | --- |
| Вставка | `add(e)` | `offer(e)` → `false` | `put(e)` | `offer(e, time, unit)` |
| Вилучення | `remove()` | `poll()` → `null` | `take()` | `poll(time, unit)` |

* **Виробник:** якщо черга обмеженої місткості заповнена, `put` блокує потік виробника, доки не з'явиться місце. Це природний зворотний тиск.
* **Споживач:** `take` блокує потік споживача, доки не з'явиться елемент.

| Реалізація | Особливості |
| --- | --- |
| `ArrayBlockingQueue` | обмежена, на масиві, один замок |
| `LinkedBlockingQueue` | за замовчуванням необмежена; окремі замки для голови й хвоста |
| `PriorityBlockingQueue` | необмежена, елементи за пріоритетом |
| `DelayQueue` | елемент доступний лише після закінчення його затримки |
| `SynchronousQueue` | місткість 0: кожен `put` чекає на `take` (пряма передача з рук у руки) |
| `LinkedBlockingDeque` | двостороння блокувальна черга |

### Приклад

Виробник додає числа до черги, а споживач забирає їх. Черга не має операції «завершити додавання», тож про кінець даних повідомляють спеціальним елементом — **«отруйною пігулкою»** (poison pill):

```java
public class ProducerConsumer {
    private static final int POISON = -1;

    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        Thread producer = Thread.ofPlatform().start(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    System.out.println("Виробляємо: " + i);
                    queue.put(i);                         // блокується, якщо черга повна
                    Thread.sleep(500);
                }
                queue.put(POISON);                        // сигнал кінця даних
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread consumer = Thread.ofPlatform().start(() -> {
            try {
                while (true) {
                    int item = queue.take();              // блокується, якщо черга порожня
                    if (item == POISON) break;
                    System.out.println("Споживаємо: " + item);
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.join();
        consumer.join();
    }
}
```

> [!NOTE]
> Якщо споживачів кілька, кожен має отримати свою пігулку: виробник додає їх стільки, скільки є споживачів. Інший спосіб зупинки — переривання потоків споживачів: `take()` реагує на `interrupt()` винятком `InterruptedException`.

Споживання у стилі Stream API з тайм-аутом:

```java
Stream.generate(() -> {
            try { return queue.poll(2, TimeUnit.SECONDS); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); return null; }
        })
        .takeWhile(item -> item != null && item != POISON)        // кінець даних або тайм-аут
        .forEach(item -> System.out.println("Споживаємо: " + item));
```

> [!TIP]
> Блокувальні черги чудово поєднуються з віртуальними потоками: блокування в `put`/`take` у віртуальному потоці не займає потік ОС. Тому окремий асинхронний аналог черги в Java не потрібен.

### TransferQueue

`LinkedTransferQueue` додає метод `transfer(e)`: виробник чекає не лише на місце в черзі, а доки споживач **забере** саме цей елемент. Так виробник знає, що елемент оброблено.

## Незмінні колекції

Найпростіша потокобезпечність — **незмінність**. Колекції `List.of`, `Map.of`, `Set.of`, `List.copyOf` і результат `Stream.toList()` змінити неможливо, тож їх можна вільно передавати між потоками без синхронізації. Шаблон «копіювати при зміні» вручну: зберігати незмінну колекцію у `volatile`-полі (або `AtomicReference`) і при зміні замінювати її новою.

```java
private volatile List<String> servers = List.of();

void addServer(String server) {                        // рідкісні записи під замком
    synchronized (this) {
        List<String> copy = new ArrayList<>(servers);
        copy.add(server);
        servers = List.copyOf(copy);
    }
}

String pick(int i) {                                   // часті читання без замка
    List<String> current = servers;
    return current.get(i % current.size());
}
```
