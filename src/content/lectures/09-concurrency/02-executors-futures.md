---
title: Виконавці й Future
description: ExecutorService як абстракція виконання задач, види пулів, Runnable і Callable, Future і отримання результату, винятки в задачах, invokeAll і invokeAny, скасування, коректне завершення пулу, довгі задачі й власні пули, задачі за розкладом.
---

## Задачі й виконавці

Замість прямої роботи з потоками в Java використовують **задачі** (tasks) і **виконавців** (executors). Задача — це одиниця роботи, а виконавець вирішує, **де й коли** її виконати: у новому потоці, у пулі потоків, у віртуальному потоці чи навіть синхронно. Код, що подає задачі, від цього не залежить.

Основний інтерфейс — `java.util.concurrent.ExecutorService`. Задачу описує:

* `Runnable` — задача **без** результату (`void run()`);
* `Callable<V>` — задача, що **повертає** значення типу `V` і може кидати checked-винятки (`V call() throws Exception`).

Подання задачі повертає **`Future<V>`** — об'єкт, що представляє результат, який буде готовий **у майбутньому**.

```java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
    Future<?> done = pool.submit(() -> System.out.println("задача без результату"));
    Future<Integer> answer = pool.submit(() -> 6 * 7);       // Callable<Integer>

    System.out.println("Завершено? " + answer.isDone());
    System.out.println("Результат: " + answer.get());          // блокується до готовності: 42
}
```

> [!WARNING]
> Потоки пулу продовжують працювати, доки пул не закрито. Якщо забути закрити `ExecutorService` (створений, наприклад, `newFixedThreadPool`), програма **не завершиться**: його потоки звичайні, не daemon. Використовуйте try-with-resources (Java 19+) або `shutdown()`.

## Види виконавців

Фабрики класу `Executors`:

| Фабрика | Поведінка |
| --- | --- |
| `newFixedThreadPool(n)` | n потоків, необмежена черга задач |
| `newCachedThreadPool()` | створює потоки за потреби й прибирає ті, що простоюють 60 с; добрий для багатьох коротких задач |
| `newSingleThreadExecutor()` | один потік: задачі виконуються **послідовно** в порядку подання |
| `newScheduledThreadPool(n)` | задачі із затримкою чи періодичні |
| `newWorkStealingPool()` | `ForkJoinPool`: потоки «крадуть» задачі один в одного |
| `newVirtualThreadPerTaskExecutor()` | новий **віртуальний** потік на кожну задачу (Java 21) |

Для повного контролю (розмір черги, політика переповнення, фабрика потоків з іменами) створюють `ThreadPoolExecutor` напряму:

```java
ExecutorService pool = new ThreadPoolExecutor(
        2, 8,                                         // базова й максимальна кількість потоків
        30, TimeUnit.SECONDS,                         // час життя зайвих потоків
        new ArrayBlockingQueue<>(100),                // обмежена черга
        Thread.ofPlatform().name("worker-", 0).factory(),
        new ThreadPoolExecutor.CallerRunsPolicy());   // черга повна -> виконати в потоці, що подає
```

## Отримання результату

```java
public static void main(String[] args) throws Exception {
    try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
        Future<Long> task1 = pool.submit(() -> countPrimes(1_000_000, 1_000_000));
        Future<Long> task2 = pool.submit(() -> countPrimes(2_000_000, 1_000_000));
        System.out.println("Запущено дві задачі підрахунку простих чисел");
        System.out.println("Простих у [1 000 000, 2 000 000): " + task1.get());
        System.out.println("Простих у [2 000 000, 3 000 000): " + task2.get());
    }
}

static long countPrimes(int from, int count) {
    return IntStream.range(from, from + count).filter(n -> {
        if (n <= 1) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
        int boundary = (int) Math.sqrt(n);
        for (int i = 3; i <= boundary; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }).count();
}
```

| Метод `Future` | Призначення |
| --- | --- |
| `get()` | чекати результату (блокує потік) |
| `get(timeout, unit)` | чекати не довше; інакше `TimeoutException` |
| `isDone()` | чи завершилася задача (успіхом, помилкою чи скасуванням) |
| `cancel(mayInterrupt)` | скасувати задачу |
| `isCancelled()` | чи скасовано |
| `resultNow()`, `exceptionNow()`, `state()` | Java 19: результат/виняток уже завершеної задачі без checked-винятків |

## Винятки в задачах

На відміну від «голого» потоку, виняток у задачі не губиться і не завершує жоден потік пулу: він **зберігається у `Future`** і кидається під час `get()`, загорнутий в **`ExecutionException`**. Справжня причина — у `getCause()`.

```java
try (ExecutorService pool = Executors.newSingleThreadExecutor()) {
    Future<?> task = pool.submit(() -> {
        throw new IllegalStateException("Необроблений виняток");
    });

    try {
        task.get();
    } catch (ExecutionException e) {
        System.out.println("Оброблено: " + e.getCause().getMessage());
    }
}
```

> [!WARNING]
> Якщо результат задачі ніхто не читає, її виняток **зникає безслідно**: ні stack trace у консолі, ні аварійного завершення. Задачі, результат яких не потрібен, подають через `execute(runnable)`: тоді необроблений виняток потрапить до обробника потоку й буде надрукований.

## Кілька задач: invokeAll і invokeAny

```java
List<Callable<String>> downloads = urls.stream()
        .<Callable<String>>map(url -> () -> download(url))
        .toList();

try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
    List<Future<String>> all = pool.invokeAll(downloads);          // чекає, доки завершаться всі
    for (Future<String> f : all) {
        System.out.println(f.get().length());
    }

    String fastest = pool.invokeAny(downloads);                     // результат першої успішної; решту скасовано
}
```

## Скасування

`future.cancel(true)` скасовує задачу: якщо вона ще не почалася, вона не виконається взагалі; якщо вже виконується — її потік отримує **переривання** (`interrupt`). Як і з потоками, скасування кооперативне: задача мусить реагувати на переривання (перевіряти `Thread.currentThread().isInterrupted()` або використовувати блокувальні методи, що кидають `InterruptedException`).

```java
Future<?> task = pool.submit(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        processNextChunk();
    }
});
Thread.sleep(1000);
task.cancel(true);                              // перериваємо
System.out.println(task.isCancelled());         // true; task.get() кине CancellationException
```

## Завершення роботи пулу

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
try {
    // подання задач...
} finally {
    pool.shutdown();                            // нових задач не приймаємо, подані — доробляються
    if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
        pool.shutdownNow();                     // переривання всіх потоків + список невиконаних задач
    }
}
```

Від Java 19 `ExecutorService` реалізує `AutoCloseable`: `close()` викликає `shutdown()` і чекає завершення всіх задач. Тому в коротких програмах достатньо try-with-resources.

## Довгі задачі

Пул з фіксованою кількістю потоків розрахований на **короткі** задачі. Якщо задача займає потік надовго (обчислення на хвилини, нескінченний цикл обробки черги, блокувальне очікування), вона «з'їдає» потік пулу, і решта задач чекатимуть у черзі. Особливо небезпечно блокувати **спільний** `ForkJoinPool.commonPool()`, на якому працюють паралельні потоки й `CompletableFuture` усієї програми.

Довгій задачі дають **окремий** потік або окремий пул:

```java
Thread longRunner = Thread.ofPlatform().name("prime-counter").start(() ->
        System.out.println(countPrimes(2, 100_000_000)));

ExecutorService ioPool = Executors.newFixedThreadPool(16);   // окремий пул для блокувального I/O
```

Задачам, що здебільшого **чекають** (мережа, бази даних, файли), найкраще підходять **віртуальні потоки**: їх можна мати мільйони (сторінка «Віртуальні потоки»).

## Задачі за розкладом

`ScheduledExecutorService` виконує задачі із затримкою або періодично:

```java
try (ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1)) {
    scheduler.schedule(() -> System.out.println("через 2 секунди"), 2, TimeUnit.SECONDS);

    ScheduledFuture<?> heartbeat = scheduler.scheduleAtFixedRate(
            () -> System.out.println("тік " + LocalTime.now()),
            0, 1, TimeUnit.SECONDS);                       // кожну секунду від початку попереднього запуску

    scheduler.scheduleWithFixedDelay(this::cleanup, 5, 5, TimeUnit.MINUTES);   // 5 хв після завершення попереднього

    Thread.sleep(5_000);
    heartbeat.cancel(false);
}
```

> [!WARNING]
> Якщо періодична задача кине виняток, її **подальші запуски тихо припиняються**. Обгортайте тіло періодичних задач у `try/catch` з логуванням.
