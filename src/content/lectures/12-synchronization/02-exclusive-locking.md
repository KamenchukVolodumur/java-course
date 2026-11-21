---
title: Ексклюзивне блокування
description: Критична секція, synchronized і монітори об'єктів, що відбувається під капотом, вибір об'єкта-замка, реентерабельність, ReentrantLock — tryLock, тайм-аути, переривання, справедливість, взаємні блокування та як їх уникати, активне очікування й onSpinWait, блокування між процесами через FileLock.
---

## Критична секція

**Ексклюзивне блокування** гарантує, що в кожен момент лише один потік має доступ до захищеного ресурсу — **критичної секції**. Інші потоки, що намагаються увійти, чекають (блокуються або «крутяться»), доки замок не звільниться.

## synchronized

Блок **`synchronized`** — найпростіший і найпоширеніший спосіб синхронізації в Java. Кожен об'єкт має вбудований **монітор**, і замком може бути будь-який об'єкт.

```java
synchronized (lockObject) {
    statements;
}
```

Компілятор перетворює блок на інструкції байт-коду `monitorenter` і `monitorexit`, причому `monitorexit` додається й на шлях винятку. Еквівалент у вигляді коду:

```java
monitorEnter(lockObject);            // псевдокод: інструкція байт-коду
try {
    statements;
} finally {
    monitorExit(lockObject);         // замок звільняється за будь-якого виходу з блоку
}
```

Без конкуренції захоплення монітора дуже дешеве: кілька атомарних інструкцій без звернення до ОС. За конкуренції потік якийсь час «крутиться», а потім ОС його блокує. Крім того, вхід і вихід з `synchronized` — бар'єри пам'яті: усе, що потік записав у критичній секції, бачить наступний потік, що захопить той самий монітор.

```java
public class Counter {
    private static int counter = 0;
    private static final Object LOCK = new Object();

    public static void main(String[] args) throws InterruptedException {
        int times = 1_000_000;
        Thread increment = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < times; i++) {
                synchronized (LOCK) { counter++; }
            }
        });
        Thread decrement = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < times; i++) {
                synchronized (LOCK) { counter--; }
            }
        });
        increment.join();
        decrement.join();
        System.out.println("Counter: " + counter);       // завжди 0
    }
}
```

Модифікатор методу — скорочення для блоку на весь метод:

```java
public synchronized void deposit(long amount) { balance += amount; }     // synchronized (this)
public static synchronized Config load() { ... }                         // synchronized (Config.class)
```

### Вибір об'єкта-замка

* Найкраще — **приватне незмінне поле** `private final Object lock = new Object()`. Ніхто ззовні не може захопити цей монітор і випадково (чи навмисно) заблокувати клас.
* `synchronized (this)` і `synchronized`-методи блокують сам об'єкт, тобто публічно доступний монітор: будь-який код може написати `synchronized (account)` і втрутитися в синхронізацію.
* **Не блокуйте** рядки-літерали (вони інтерновані й спільні для всієї JVM), обгортки на кшталт `Integer` (кешовані значення спільні) і поля, що переприсвоюються (різні потоки блокуватимуть різні об'єкти).

> [!IMPORTANT]
> Замок захищає дані, лише якщо **всі** звернення до цих даних, і читання, і записи, відбуваються під **тим самим** замком. Незахищене читання може побачити застаріле або «напівзаписане» значення.

### Реентерабельність

Монітори **реентерабельні**: потік, що вже тримає замок, може захопити його повторно (наприклад, один `synchronized`-метод викликає інший), не заблокувавши сам себе. Монітор рахує вкладені входи й звільняється після останнього виходу.

```java
public synchronized void transferAll(Account to) {
    to.deposit(withdrawAll());          // withdrawAll теж synchronized на this: повторний вхід
}
```

## ReentrantLock

`java.util.concurrent.locks.ReentrantLock` — явний замок з тими самими гарантіями, що й `synchronized` (реентерабельність, бар'єри пам'яті), але з додатковими можливостями. Звільнення **обов'язково** робиться у `finally`:

```java
private final ReentrantLock lock = new ReentrantLock();

public void increment() {
    lock.lock();
    try {
        counter++;
    } finally {
        lock.unlock();                  // інакше після винятку замок залишиться захопленим назавжди
    }
}
```

Додаткові можливості:

```java
if (lock.tryLock()) {                                      // не чекати, якщо зайнято
    try { refreshCache(); } finally { lock.unlock(); }
} else {
    useStaleCache();
}

if (lock.tryLock(500, TimeUnit.MILLISECONDS)) { ... }      // чекати не довше

lock.lockInterruptibly();                                  // очікування можна перервати interrupt()

ReentrantLock fair = new ReentrantLock(true);              // справедливий: потоки отримують замок у порядку черги
```

| | `synchronized` | `ReentrantLock` |
| --- | --- | --- |
| Звільнення | автоматичне | вручну у `finally` |
| Спроба без очікування, тайм-аут | ні | `tryLock` |
| Переривання очікування | ні | `lockInterruptibly` |
| Справедливість | ні | за вибором |
| Кілька умов очікування | одна (`wait`/`notify`) | скільки завгодно `Condition` |
| Діагностика | дамп потоків | `isLocked`, `getQueueLength`, `isHeldByCurrentThread` |

> [!NOTE]
> Справедливий замок усуває «голодування» потоків, але помітно знижує пропускну здатність: несправедливий замок дозволяє щойно звільненому замку одразу перейти потоку, який уже працює, без дорогого пробудження сплячого.

За замовчуванням використовуйте `synchronized`: він коротший і не дозволяє забути `unlock`. `ReentrantLock` обирають, коли потрібні його можливості.

## Взаємні блокування

**Взаємне блокування** (deadlock) виникає, коли потоки чекають один на одного по колу: потік 1 тримає замок A і чекає на B, а потік 2 тримає B і чекає на A.

```java
void transfer(Account from, Account to, long amount) {
    synchronized (from) {
        synchronized (to) {                  // transfer(a, b) і transfer(b, a) одночасно -> deadlock
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
```

Способи уникнути:

* **Глобальний порядок захоплення.** Усі потоки захоплюють замки в одному порядку, наприклад за ідентифікатором:

```java
void transfer(Account from, Account to, long amount) {
    Account first = from.id() < to.id() ? from : to;
    Account second = first == from ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
```

* **Тайм-аути:** `tryLock(timeout)` і відкат з повторною спробою.
* **Не викликати чужий код під замком:** обробники подій, зворотні виклики й перевизначувані методи можуть захоплювати власні замки.
* **Менше замків:** незмінні об'єкти, потокобезпечні колекції, обмін повідомленнями через черги.

Діагностика: `jcmd <pid> Thread.print` або `jstack` наприкінці дампу друкує «Found one Java-level deadlock» зі списком потоків і замків.

## Активне очікування

Блокування потоку (перехід у стан очікування й пробудження) коштує мікросекунди на перемикання контексту. Для **дуже коротких** критичних секцій інколи вигідніше **активне очікування** (busy waiting, spin): потік у циклі перевіряє, чи звільнився замок.

```java
public final class SpinLock {
    private final AtomicBoolean locked = new AtomicBoolean();

    public void lock() {
        while (!locked.compareAndSet(false, true)) {
            Thread.onSpinWait();          // підказка процесору (на x86 — інструкція PAUSE)
        }
    }

    public void unlock() {
        locked.set(false);
    }
}
```

> [!WARNING]
> Активне очікування займає ядро процесора на 100 % увесь час очікування. Неправильне використання (довгі критичні секції, більше потоків, ніж ядер) різко знижує продуктивність. Вбудовані замки JVM уже поєднують обидва підходи: спершу коротко «крутяться», потім блокуються. Тому власний spin lock майже ніколи не потрібен.

## Блокування між процесами

`synchronized` і `ReentrantLock` працюють лише всередині **однієї JVM**. Для синхронізації **процесів** на одній машині в Java використовують **блокування файлів**. Типове застосування — не дозволити запустити другий екземпляр програми:

```java
public static void main(String[] args) throws IOException {
    Path lockFile = Path.of(System.getProperty("java.io.tmpdir"), "myapp.lock");
    try (FileChannel channel = FileChannel.open(lockFile, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
         FileLock lock = channel.tryLock()) {                  // null, якщо замок тримає інший процес
        if (lock == null) {
            System.out.println("Програму вже запущено");
            return;
        }
        runApplication();
    }   // замок звільняється й тоді, коли процес аварійно завершився: ОС закриває його файли
}
```

* `channel.lock()` чекає на замок, `tryLock()` повертається одразу;
* `lock(position, size, shared)` блокує лише частину файлу; `shared = true` дає спільний замок для читачів;
* у Unix файлові замки **рекомендаційні**: вони не заважають процесам, які не викликають `lock`.

Для синхронізації між машинами використовують зовнішні системи: блокування в базі даних (`SELECT ... FOR UPDATE`), Redis, ZooKeeper.
