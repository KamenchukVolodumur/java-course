---
title: Сигналізація
description: Очікування подій між потоками, змінні умов — wait, notify і notifyAll, хибні пробудження, Condition для ReentrantLock, обмежена черга виробник–споживач, CountDownLatch, CyclicBarrier, Phaser, Exchanger, ворота з ручним скиданням, LockSupport.
---

## Огляд

Механізми **сигналізації** призначені для взаємодії потоків: один потік призупиняє виконання, доки не отримає сигнал від іншого. Java має:

* **змінні умов** — `wait`/`notify` вбудованого монітора і `Condition` для `ReentrantLock`: низькорівнева основа, на якій можна побудувати будь-яку сигналізацію;
* готові **синхронізатори** пакета `java.util.concurrent`: `CountDownLatch`, `CyclicBarrier`, `Phaser`, `Exchanger`, `Semaphore`;
* **блокувальні черги** (`BlockingQueue`, сторінка «Потокобезпечні колекції»), які найчастіше роблять ручну сигналізацію непотрібною.

## wait і notify

Кожен об'єкт, крім монітора, має **набір очікування** (wait set) — це змінна умови, пов'язана з монітором:

* `obj.wait()` — **звільняє** монітор `obj` і призупиняє потік, доки його не розбудять; перед поверненням знову захоплює монітор;
* `obj.notify()` — будить **один** потік, що чекає на `obj`;
* `obj.notifyAll()` — будить **усі** потоки, що чекають на `obj`.

Усі три методи можна викликати лише всередині `synchronized (obj)`, інакше — `IllegalMonitorStateException`.

Стандартний шаблон — очікування **в циклі**, що перевіряє умову:

```java
synchronized (lock) {
    while (!condition) {          // while, а не if!
        lock.wait();
    }
    // умова виконується, і ми тримаємо монітор
}

// в іншому потоці
synchronized (lock) {
    condition = true;
    lock.notifyAll();
}
```

Цикл `while` потрібен з трьох причин:

1. **Хибні пробудження** (spurious wakeups): специфікація дозволяє `wait()` повернутися без жодного `notify`.
2. Між пробудженням і повторним захопленням монітора **інший потік** міг уже «забрати» те, на що ми чекали.
3. З `notifyAll` прокидаються потоки, що чекають на **різні** умови.

> [!WARNING]
> `notify()` будить випадковий потік. Якщо на тому самому моніторі чекають потоки з різними умовами (виробники чекають на місце, споживачі — на елементи), `notify` може розбудити «не того», і сигнал загубиться. За сумнівів використовуйте `notifyAll()` або окремі `Condition`.

## Обмежена черга: виробник і споживач

Класичний приклад — черга обмеженої місткості: виробник чекає, доки з'явиться місце, а споживач — доки з'явиться елемент. На `ReentrantLock` з двома **окремими** умовами кожен сигнал будить лише потоки потрібного типу:

```java
public class BoundedQueue<T> {
    private final Object[] items;
    private int head, tail, count;

    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notEmpty = lock.newCondition();
    private final Condition notFull = lock.newCondition();

    public BoundedQueue(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity");
        items = new Object[capacity];
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) {
                notFull.await();                 // звільняє lock, чекає на сигнал notFull
            }
            items[tail] = item;
            tail = (tail + 1) % items.length;
            count++;
            notEmpty.signal();                   // будимо одного споживача
        } finally {
            lock.unlock();
        }
    }

    @SuppressWarnings("unchecked")
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) {
                notEmpty.await();
            }
            T item = (T) items[head];
            items[head] = null;                  // не тримати посилання для збирача сміття
            head = (head + 1) % items.length;
            count--;
            notFull.signal();                    // будимо одного виробника
            return item;
        } finally {
            lock.unlock();
        }
    }
}
```

Саме так реалізовано `ArrayBlockingQueue` у JDK, тож у реальному коді використовують готову чергу. `Condition` також має `await(timeout, unit)`, `awaitNanos` і `awaitUninterruptibly`.

## CountDownLatch

**Засувка зі зворотним відліком** відкривається, коли внутрішній лічильник дійде до нуля. Кожен `countDown()` зменшує лічильник, а `await()` чекає на нуль. Корисна, коли один потік має дочекатися, доки певна кількість інших завершить роботу або досягне певної точки.

```java
int workers = 3;
CountDownLatch ready = new CountDownLatch(workers);
CountDownLatch start = new CountDownLatch(1);              // «ворота» для одночасного старту

for (int i = 0; i < workers; i++) {
    int id = i;
    Thread.ofPlatform().start(() -> {
        System.out.println("Робітник " + id + " готовий");
        ready.countDown();
        try {
            start.await();                                 // чекаємо на сигнал старту
            System.out.println("Робітник " + id + " працює");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
}

ready.await();                                             // усі готові
System.out.println("Старт!");
start.countDown();                                         // відкрити ворота всім одночасно
```

`CountDownLatch` **одноразовий**: лічильник не можна скинути. Засувка з лічильником 1 працює як **ворота з ручним відкриттям**: доки закриті, усі чекають; після відкриття проходять усі, і ворота залишаються відкритими.

## CyclicBarrier

**Бар'єр** синхронізує групу потоків, що працюють **фазами**. Потоки доходять до бар'єра (`await()`) і чекають, доки прийдуть усі учасники. Лише коли зібралися всі, вони разом переходять до наступної фази. Бар'єр **циклічний**: після проходу він знову готовий. Необов'язкова **дія бар'єра** виконується один раз на кожну фазу, коли прийшов останній учасник.

### Приклад: гра в кості

Три потоки кидають кубик. Бар'єр гарантує, що всі потоки зроблять кидок у поточному раунді, перш ніж будь-який перейде до наступного, а результати раунду друкуються в одному рядку:

```java
public class DiceGame {
    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(3, System.out::println);   // дія: новий рядок

        Runnable rollDice = () -> {
            try {
                for (int i = 0; i < 5; i++) {
                    System.out.print(d6() + " ");
                    barrier.await();
                }
            } catch (InterruptedException | BrokenBarrierException e) {
                Thread.currentThread().interrupt();
            }
        };
        for (int i = 0; i < 3; i++) Thread.ofPlatform().start(rollDice);
    }

    static int d6() {
        return 1 + ThreadLocalRandom.current().nextInt(6);
    }
}
// 4 1 6
// 2 2 5
// ...
```

Якщо один з учасників перерваний або отримав тайм-аут, бар'єр стає **зламаним**, і всі інші отримують `BrokenBarrierException`. Так група не чекає вічно на учасника, що вибув.

## Phaser

`Phaser` — гнучкіший бар'єр: кількість учасників може змінюватися (`register`, `arriveAndDeregister`), а фази нумеруються.

```java
Phaser phaser = new Phaser(1);                         // зареєстрований головний потік
for (int i = 0; i < 3; i++) {
    phaser.register();
    int id = i;
    Thread.ofPlatform().start(() -> {
        for (int phase = 0; phase < 3; phase++) {
            System.out.println("Потік " + id + ", фаза " + phase);
            phaser.arriveAndAwaitAdvance();
        }
        phaser.arriveAndDeregister();
    });
}
phaser.arriveAndDeregister();                          // головний потік не бере участі у фазах
```

## Exchanger

`Exchanger<V>` — точка зустрічі **двох** потоків: кожен викликає `exchange(value)` і отримує значення іншого. Типове застосування — обмін буферами: виробник заповнює один буфер, споживач спорожнює інший, і в точці зустрічі вони міняються.

```java
Exchanger<List<String>> exchanger = new Exchanger<>();
// виробник: full = exchanger.exchange(full)   -> отримує порожній буфер
// споживач: empty = exchanger.exchange(empty) -> отримує повний буфер
```

## LockSupport

На найнижчому рівні всі синхронізатори побудовані на `LockSupport`:

* `LockSupport.park()` — призупиняє поточний потік;
* `LockSupport.unpark(thread)` — дає потоку «дозвіл» продовжити. Якщо дозвіл надано **до** `park`, наступний `park` поверне одразу, тож сигнал не губиться.

```java
Thread waiter = Thread.ofPlatform().start(() -> {
    System.out.println("Чекаю...");
    LockSupport.park();
    System.out.println("Розбуджено");
});
Thread.sleep(500);
LockSupport.unpark(waiter);
```

Як і `wait`, `park` може повернутися хибно, тож його теж викликають у циклі з перевіркою умови. У прикладному коді `LockSupport` майже не використовують: він потрібен авторам власних синхронізаторів (разом з `AbstractQueuedSynchronizer`).

> [!TIP]
> Порядок вибору: спершу **високорівневі** засоби (`BlockingQueue`, `CompletableFuture`, `ExecutorService.invokeAll`), потім готові синхронізатори (`CountDownLatch`, `CyclicBarrier`, `Semaphore`), і лише в крайньому разі `Condition` чи `wait`/`notify`.
