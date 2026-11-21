---
title: Вступ
description: Категорії засобів синхронізації в Java, проблема видимості й перестановок, модель пам'яті Java і відношення happens-before, volatile, бар'єри пам'яті, атомарні операції, класи Atomic*, LongAdder, VarHandle і CAS.
---

## Огляд

Одночасний доступ до ресурсів потребує синхронізації, щоб уникнути **гонок даних** і зберегти узгодженість даних. Java надає набір засобів, що відрізняються призначенням, областю дії (у межах процесу чи між процесами) і вартістю.

Їх можна поділити на чотири категорії:

* **Ексклюзивне блокування** — у кожен момент доступ до ресурсу має лише один потік:
  * `synchronized` (вбудований монітор об'єкта);
  * `ReentrantLock`;
  * `FileLock` — між процесами.
* **Неексклюзивне блокування** — обмежує конкурентність:
  * `Semaphore`;
  * `ReentrantReadWriteLock`, `StampedLock`.
* **Сигналізація** — потоки повідомляють один одного й чекають на події:
  * `wait`/`notify`, `Condition` (змінні умов);
  * `CountDownLatch`, `CyclicBarrier`, `Phaser`, `Exchanger`;
  * `LockSupport.park`/`unpark`.
* **Неблокувальні засоби нижчого рівня**:
  * `volatile`;
  * атомарні класи `AtomicInteger`, `AtomicReference`, `LongAdder`;
  * `VarHandle` і бар'єри пам'яті.

## Проблема

У прикладі нижче поле `complete` нічим не захищене. JIT-компілятор може оптимізувати цикл `while` так, що значення `complete` буде прочитано в регістр процесора **лише раз**. Хоча головний потік змінює значення на `true`, фоновий потік може цього ніколи не побачити, і програма «зависне».

```java
public class Visibility {
    private static boolean complete = false;

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            boolean toggle = false;
            while (!complete) {
                toggle = !toggle;
            }
            System.out.println("Потік побачив complete = true");
        });
        thread.start();
        Thread.sleep(1000);
        complete = true;
        thread.join();                       // на HotSpot з JIT часто чекає вічно
    }
}
```

Проблем насправді дві:

1. **Видимість.** Запис одного потоку може залишатися в регістрі чи буфері запису ядра (store buffer) й не бути видимим іншим ядрам.
2. **Перестановки.** І компілятор, і процесор можуть змінювати порядок інструкцій, якщо в межах **одного** потоку результат від цього не змінюється. Інший потік може побачити зміни в «неправильному» порядку.

```java
// Потік 1                       // Потік 2
data = 42;                       if (ready) {
ready = true;                        System.out.println(data);   // може надрукувати 0!
                                 }
```

## Модель пам'яті Java

**Модель пам'яті Java** (Java Memory Model, JMM) визначає, коли запис одного потоку **гарантовано видимий** іншому. Ключове поняття — відношення **happens-before** («відбувається раніше»): якщо дія A happens-before дії B, то B бачить усі ефекти A (і всіх дій до A).

Основні правила:

| Дія A | happens-before дії B |
| --- | --- |
| будь-яка дія в потоці | наступна дія в тому самому потоці (програмний порядок) |
| звільнення монітора (`synchronized`, `unlock`) | наступне захоплення **того самого** монітора/замка |
| запис у `volatile`-поле | наступне читання **того самого** поля |
| `thread.start()` | будь-яка дія в запущеному потоці |
| будь-яка дія в потоці | повернення з `thread.join()` для цього потоку |
| подання задачі виконавцю, `queue.put(x)`, `future.complete(x)` | виконання задачі, `queue.take()`, отримання результату |
| завершення конструктора (для `final`-полів) | будь-яке читання об'єкта, опублікованого після конструктора |

Відношення транзитивне: якщо потік 1 записав `data`, а потім звільнив замок, а потік 2 захопив той самий замок, то потік 2 бачить `data`.

> [!IMPORTANT]
> Програма **без гонок даних** (кожен доступ до спільної змінної, з яких хоч один — запис, упорядкований через happens-before) поводиться так, ніби всі потоки виконуються почергово на одному ядрі (*sequential consistency*). Із гонками можливі будь-які «дивні» результати.

## volatile

Поле з модифікатором **`volatile`** гарантує:

* **видимість** — кожне читання бачить останній запис з будь-якого потоку;
* **порядок** — запис у `volatile` не переставляється з попередніми записами (семантика *release*), а читання — з наступними читаннями (семантика *acquire*). Тому все, що потік записав **до** запису `volatile`, видно потокові, що прочитав це значення.

```java
private static volatile boolean complete = false;    // виправлення першого прикладу

// Публікація даних:
private int data;
private volatile boolean ready;

void writer() { data = 42; ready = true; }                       // release
void reader() { if (ready) System.out.println(data); }           // acquire: гарантовано 42
```

> [!WARNING]
> `volatile` **не робить** складені операції атомарними: `volatileCounter++` — це все ще «прочитати, змінити, записати», і два потоки можуть втратити оновлення. `volatile` підходить для прапорців і публікації посилань; для лічильників — атомарні класи.

## Бар'єри пам'яті

**Бар'єр пам'яті** (memory fence) — інструкція процесора чи компілятора, що задає порядок операцій з пам'яттю:

1. **Забороняє перестановки** — інструкції до бар'єра виконуються до інструкцій після нього.
2. **Гарантує видимість** — змушує завершити відкладені записи й не читати застарілих копій. (Всупереч поширеній думці, бар'єр не «скидає кеш у RAM»: апаратура сама підтримує когерентність кешів усіх ядер.)

У Java бар'єри рідко ставлять вручну, бо вони генеруються неявно:

1. на вході в блок `synchronized` і виході з нього, у `lock()`/`unlock()`;
2. у методах синхронізаційних примітивів і потокобезпечних колекцій;
3. під час читання й запису `volatile`-полів;
4. в атомарних операціях;
5. під час запуску потоку й `join()`.

Явні бар'єри дають статичні методи `VarHandle.fullFence()`, `acquireFence()`, `releaseFence()`. Вони потрібні лише в низькорівневому коді неблокувальних структур даних.

## Атомарні операції

**Атомарна** операція неподільна: з погляду інших потоків вона виконується або повністю, або зовсім не виконується.

Неатомарні, наприклад:

* інкремент і декремент (`counter++`);
* «перевірити, потім діяти» (`if (map.get(k) == null) map.put(k, v)`);
* обмін двох значень;
* читання й запис `long`/`double` без `volatile` (JLS дозволяє розбивати їх на дві 32-бітні половини, хоча на 64-бітних JVM цього не буває).

`counter++` і `counter--` складаються з трьох кроків: прочитати, змінити, записати. Коли два потоки роблять це одночасно, кроки перемежовуються, і кінцеве значення непередбачуване:

```java
public class Counter {
    static int counter = 0;

    public static void main(String[] args) throws InterruptedException {
        int times = 1_000_000;
        Thread increment = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter++; });
        Thread decrement = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter--; });
        increment.join();
        decrement.join();
        System.out.println("Counter: " + counter);            // наприклад, Counter: -48213
    }
}
```

### Атомарні класи

Пакет `java.util.concurrent.atomic` містить класи, операції яких виконуються однією апаратною інструкцією (на x86 — з префіксом `lock`) і мають семантику `volatile`:

```java
static final AtomicInteger counter = new AtomicInteger();

Thread increment = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter.incrementAndGet(); });
Thread decrement = Thread.ofPlatform().start(() -> { for (int i = 0; i < times; i++) counter.decrementAndGet(); });
increment.join();
decrement.join();
System.out.println("Counter: " + counter.get());               // завжди 0
```

| Метод | Дія |
| --- | --- |
| `get()`, `set(v)` | `volatile`-читання й запис |
| `incrementAndGet()`, `getAndAdd(d)` | атомарне додавання |
| `getAndSet(v)` | атомарний обмін, повертає старе значення |
| `compareAndSet(expected, v)` | **CAS**: записати `v`, лише якщо поточне значення дорівнює `expected` |
| `updateAndGet(fn)`, `accumulateAndGet(x, fn)` | довільне оновлення в циклі CAS |

Класи: `AtomicInteger`, `AtomicLong`, `AtomicBoolean`, `AtomicReference<V>`, масиви `AtomicIntegerArray`, `AtomicReferenceArray`.

### Compare-and-set

**CAS** (compare-and-set) — основа неблокувальних алгоритмів. Будь-яке оновлення можна виразити циклом: прочитати значення, обчислити нове й спробувати записати; якщо інший потік встиг змінити значення, спробувати ще раз:

```java
static final AtomicInteger max = new AtomicInteger(Integer.MIN_VALUE);

static void updateMax(int candidate) {
    int current;
    do {
        current = max.get();
        if (candidate <= current) return;
    } while (!max.compareAndSet(current, candidate));
}
// те саме коротше: max.accumulateAndGet(candidate, Math::max);
```

Неблокувальний стек Трайбера на `AtomicReference`:

```java
public class LockFreeStack<T> {
    private record Node<T>(T value, Node<T> next) { }
    private final AtomicReference<Node<T>> head = new AtomicReference<>();

    public void push(T value) {
        Node<T> oldHead;
        Node<T> newHead;
        do {
            oldHead = head.get();
            newHead = new Node<>(value, oldHead);
        } while (!head.compareAndSet(oldHead, newHead));
    }

    public T pop() {
        Node<T> oldHead;
        do {
            oldHead = head.get();
            if (oldHead == null) return null;
        } while (!head.compareAndSet(oldHead, oldHead.next()));
        return oldHead.value();
    }
}
```

### LongAdder

За великої конкуренції багато потоків постійно «б'ються» за ту саму комірку `AtomicLong`, і CAS часто не вдається. **`LongAdder`** розподіляє лічильник на кілька комірок (по одній на групу потоків) і сумує їх лише під час читання. Запис значно швидший, а `sum()` повільніший і не є миттєвим знімком. Ідеальний для статистики: лічильників запитів, метрик.

```java
LongAdder requests = new LongAdder();
requests.increment();                      // з багатьох потоків
long total = requests.sum();
```

### VarHandle

`VarHandle` (Java 9) дає атомарні операції та різні режими доступу до **звичайного** поля або елемента масиву без обгортання в `Atomic*`. Він економить пам'ять, коли таких полів мільйони:

```java
class Node {
    volatile int state;
    private static final VarHandle STATE;
    static {
        try {
            STATE = MethodHandles.lookup().findVarHandle(Node.class, "state", int.class);
        } catch (ReflectiveOperationException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    boolean tryClaim() {
        return STATE.compareAndSet(this, 0, 1);       // CAS над полем цього об'єкта
    }
}
```

Режими доступу від найслабшого до найсильнішого: *plain* (звичайний), *opaque*, *acquire/release* (`getAcquire`, `setRelease`), *volatile*. Слабші режими дешевші, але вимагають точного розуміння моделі пам'яті.
