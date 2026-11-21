---
title: Потоки
description: Потоки як одиниця виконання, створення й запуск Thread, join і sleep, блокувальні операції, стани потоку, daemon-потоки, гонки даних і synchronized, необроблені винятки в потоках, переривання, пули потоків.
---

## Вступ

**Потік** (thread) — базова одиниця виконання коду всередині процесу. Потоки одного процесу **спільно** використовують його пам'ять (купу) і ресурси ОС (відкриті файли, мережеві з'єднання). Але кожен потік має власні:

* **стек викликів** — локальні змінні, параметри методів і адреси повернення. Змінна, оголошена всередині методу, належить лише потоку, що виконує цей метод;
* **контекст процесора** — стан регістрів, зокрема вказівник інструкцій, який зберігається й відновлюється під час перемикання потоків.

> [!NOTE]
> Створити потік значно дешевше, ніж процес. Але звичайний (платформний) потік Java — це потік ОС з власним стеком розміром близько 1 МБ, тож тисячі таких потоків уже відчутно навантажують систему. Легкі **віртуальні** потоки розглянуто на окремій сторінці.

Планувальник ОС перемикає потоки, тож навіть на одному ядрі процесора вони виконуються **конкурентно** (почергово). На багатоядерних системах потоки виконуються **паралельно**, кожен на своєму ядрі.

> [!WARNING]
> Операції над спільними даними з кількох потоків потребують **синхронізації**. Без неї результат залежить від випадкового порядку виконання (розділ «Синхронізація»).

## Створення потоків

Клас `java.lang.Thread` представляє потік ОС, яким керує JVM. Код потоку передають об'єктом `Runnable` (функціональний інтерфейс `void run()`), найчастіше лямбдою. Метод `start()` запускає потік.

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread(Main::printA);
        thread.start();

        printB();
    }

    static void printA() {
        for (int i = 0; i < 100; i++) System.out.print('A');
    }

    static void printB() {
        for (int i = 0; i < 100; i++) System.out.print('B');
    }
}
```

Результат такої програми не є однозначним. Зазвичай це перемішані послідовності літер, наприклад:

```text
BBBAAAAAAAAAAAAABAAAAAAAAAAAAAAABBBBABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAAAAAAAAAAAAAAAAAA...
```

Інші способи створення:

```java
Thread t1 = new Thread(() -> System.out.println("лямбда"), "worker-1");   // з іменем

Thread t2 = new Thread() {                    // підклас Thread (застарілий стиль)
    @Override public void run() { System.out.println("підклас"); }
};

Thread t3 = Thread.ofPlatform()               // Java 21: будівник
        .name("worker-", 0)                   // worker-0, worker-1, ...
        .daemon(true)
        .start(() -> System.out.println("будівник"));
```

> [!CAUTION]
> `thread.run()` **не** створює нового потоку: це просто виклик методу в поточному потоці. Новий потік запускає лише `start()`. Повторний `start()` того самого об'єкта кидає `IllegalThreadStateException`.

## Очікування і призупинення

Метод `join()` чекає, доки інший потік завершиться:

```java
Thread thread = new Thread(Main::printA);
thread.start();

printB();
thread.join();                    // InterruptedException — checked

System.out.println("\nПотік завершився.");
```

`Thread.sleep()` призупиняє **поточний** потік на заданий час:

```java
Thread.sleep(10);                               // мілісекунди
Thread.sleep(Duration.ofMillis(10));            // Java 19
thread.join(Duration.ofSeconds(2));             // чекати не довше 2 с; повертає, чи завершився
```

> [!NOTE]
> `sleep` і `join` — **блокувальні** операції: ОС призупиняє потік, і він не займає процесор, доки не настане подія, на яку він чекає. Інші типові блокувальні операції — очікування на синхронізаційні примітиви (`lock.lock()`, `queue.take()`) і введення-виведення (`Files.readString`, читання з сокета).

### Стани потоку

```text
NEW ──start()──► RUNNABLE ◄────────────────────────► BLOCKED (чекає на монітор synchronized)
                    │  ▲
          sleep/join│  │ час минув / подія / notify
          wait/park ▼  │
           WAITING / TIMED_WAITING
                    │
                    ▼
               TERMINATED
```

Стан повертає `thread.getState()`, а дамп усіх потоків з їхніми стеками можна отримати командою `jcmd <pid> Thread.print`.

## Звичайні та daemon-потоки

* **Звичайні** потоки (за замовчуванням) утримують процес живим: JVM не завершиться, доки працює хоча б один такий потік.
* **Daemon**-потоки процес не утримують: JVM завершується, коли закінчаться всі звичайні потоки, а daemon-потоки, що ще працюють, **обриваються** без можливості завершити роботу (блоки `finally` не виконуються). Вони підходять для фонової роботи, яку не шкода перервати: обслуговування кешу, моніторинг.

```java
Thread worker = new Thread(() -> {
    System.out.println("Фоновий потік стартував");
    new Scanner(System.in).nextLine();
    System.out.println("Фоновий потік завершився");      // не виконається
}, "BackgroundWorker");
worker.setDaemon(true);                                   // до start()!
worker.start();

System.out.println("Головний потік завершився.");         // JVM завершується, не чекаючи worker
```

## Потокобезпечність і синхронізація

Потоки одного процесу спільно використовують ресурси (статичні поля, об'єкти в купі), тож доступ до них треба синхронізувати, щоб уникнути **гонок даних** (race conditions).

Метод `unsafePrintOnce` має надрукувати `Done` лише раз, але за паралельного виконання може надрукувати двічі: обидва потоки можуть перевірити `done` до того, як хтось із них встановить `true`.

```java
public class RaceDemo {
    private static boolean done = false;

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(RaceDemo::unsafePrintOnce);
        thread.start();
        unsafePrintOnce();
        thread.join();
    }

    static void unsafePrintOnce() {
        if (done) return;          // обидва потоки можуть побачити false...
        done = true;               // ...і обидва надрукувати
        System.out.println("Done");
    }
}
```

### synchronized

Найпростіший засіб синхронізації в Java — блок **`synchronized`**. Він гарантує, що позначену ділянку коду (**критичну секцію**) одночасно виконує лише один потік; інші чекають, доки вона звільниться. Кожен об'єкт Java має вбудований **монітор**, і `synchronized (obj)` захоплює монітор саме цього об'єкта.

```java
public class SafeDemo {
    private static boolean done = false;
    private static final Object LOCK = new Object();      // окремий приватний об'єкт-замок

    static void safePrintOnce() {
        synchronized (LOCK) {                              // критична секція
            if (done) return;
            done = true;
        }
        System.out.println("Done");
    }
}
```

Замість окремого блоку можна позначити весь метод: `synchronized void m()` блокує `this`, а `static synchronized void m()` — об'єкт `SafeDemo.class`. Детальніше про блокування, видимість змін між потоками і `ReentrantLock` — у розділі «Синхронізація».

## Винятки в потоках

Необроблений виняток у потоці **завершує лише цей потік**: JVM друкує stack trace у `System.err`, а решта програми продовжує роботу. Потік, що викликав `join()`, про помилку не дізнається.

```java
Thread thread = new Thread(() -> {
    throw new IllegalStateException("Необроблений виняток");
});
thread.start();

System.out.println("Головний потік чекає...");
thread.join();
System.out.println("Головний потік завершився.");     // виконається!
// Exception in thread "Thread-0" java.lang.IllegalStateException: Необроблений виняток
```

Тихе «зникнення» помилки — небезпечна поведінка. Перехопити необроблені винятки можна обробником:

```java
thread.setUncaughtExceptionHandler((t, e) ->
        System.err.println("Потік " + t.getName() + " впав: " + e));
Thread.setDefaultUncaughtExceptionHandler((t, e) -> log.error("Необроблений виняток у " + t, e));
```

Задачі в пулах потоків (наступна сторінка) повертають винятки через `Future`, що значно зручніше.

## Переривання

Примусово зупинити потік у Java неможливо (метод `Thread.stop()` видалено: він міг залишити дані в некоректному стані). Замість цього є **кооперативне переривання**: `thread.interrupt()` встановлює потоку прапорець, а потік сам перевіряє його й коректно завершує роботу. Блокувальні методи (`sleep`, `join`, `wait`, `BlockingQueue.take`) реагують на переривання негайно, кидаючи `InterruptedException`.

```java
Thread worker = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            doSomeWork();
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();   // виняток скидає прапорець — відновлюємо
            break;
        }
    }
    System.out.println("Коректне завершення");
});
worker.start();
Thread.sleep(2000);
worker.interrupt();                                // просимо зупинитися
worker.join();
```

> [!IMPORTANT]
> Ніколи не ігноруйте `InterruptedException` порожнім `catch`. Або прокиньте виняток далі (`throws InterruptedException`), або відновіть прапорець через `Thread.currentThread().interrupt()`, щоб код вище по стеку дізнався про запит на зупинку.

## Пул потоків

Створювати й знищувати платформний потік для кожної короткої задачі дорого. **Пул потоків** тримає набір потоків і віддає їм задачі з черги: потоки використовуються повторно. У Java пули представлені інтерфейсом `ExecutorService`:

```java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    pool.submit(() -> {
        System.out.println(Thread.currentThread().getName());   // pool-1-thread-1
        System.out.println("Привіт з пулу потоків");
    });
}   // close(): чекає завершення задач (Java 19)
```

Спільний пул JVM — `ForkJoinPool.commonPool()`: кількість потоків у ньому — кількість ядер мінус один. Його використовують паралельні потоки Stream API і `CompletableFuture` за замовчуванням.

> [!NOTE]
> Хоча потоки — основа конкурентності, у сучасному Java-коді їх рідко створюють напряму. Перевагу мають абстракції вищого рівня: `ExecutorService` і `Future`, `CompletableFuture`, паралельні потоки та віртуальні потоки, розглянуті на наступних сторінках.
