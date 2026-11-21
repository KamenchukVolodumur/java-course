---
title: Неексклюзивне блокування
description: Semaphore для обмеження конкурентності, дозволи, справедливість, приклад обмеження паралельних завантажень, ReentrantReadWriteLock для частого читання й рідкого запису, пониження замка, StampedLock і оптимістичне читання.
---

**Неексклюзивне блокування** дозволяє кільком потокам одночасно мати доступ до ресурсу за певних умов: з обмеженням кількості потоків або лише для читання.

## Semaphore

**Семафор** обмежує кількість потоків, що одночасно мають доступ до ресурсу чи ділянки коду. Він створюється з певною кількістю **дозволів** (permits):

* `acquire()` забирає дозвіл; якщо дозволів немає, потік чекає;
* `release()` повертає дозвіл і будить потік, що чекає;
* `tryAcquire()` і `tryAcquire(timeout, unit)` — без очікування або з обмеженим очікуванням;
* `acquire(n)`/`release(n)` — кілька дозволів одразу.

Типове застосування — **обмеження пропускної здатності** (throttling): не більше 5 одночасних завантажень файлів, не більше 10 з'єднань з базою даних.

> [!NOTE]
> На відміну від замка, семафор **не має власника**: дозвіл може повернути будь-який потік, а не лише той, що його взяв. Семафор з одним дозволом схожий на ексклюзивний замок, але не реентерабельний.

### Приклад

`Downloader` обмежує кількість одночасних завантажень значенням `concurrency`. Кожне завантаження виконується у власному віртуальному потоці, а семафор пропускає лише частину з них:

```java
public class Downloader {
    private final Semaphore semaphore;
    private final HttpClient client = HttpClient.newHttpClient();

    public Downloader(int concurrency) {
        this.semaphore = new Semaphore(concurrency);
    }

    public void download(String url, Path file) throws InterruptedException {
        System.out.println("[" + file + "] Чекаємо на початок завантаження...");
        semaphore.acquire();
        try {
            System.out.println("[" + file + "] Завантаження...");
            HttpRequest request = HttpRequest.newBuilder(URI.create(url)).build();
            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
            System.out.printf("[%s] Завантажено %.2f КБ%n", file, response.body().length / 1024.0);
            Files.write(file, response.body());
            System.out.println("[" + file + "] Завершено.");
        } catch (IOException e) {
            System.out.println("[" + file + "] Помилка: " + e.getMessage());
        } finally {
            semaphore.release();
        }
    }
}

Downloader downloader = new Downloader(2);
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 1; i <= 6; i++) {
        String url = "https://example.com/file" + i + ".bin";
        Path file = Path.of("file" + i + ".bin");
        executor.submit(() -> { downloader.download(url, file); return null; });
    }
}
```

`new Semaphore(n, true)` — **справедливий** семафор: дозволи видаються в порядку черги очікування.

## ReentrantReadWriteLock

`ReadWriteLock` оптимізований для сценаріїв, де **читання значно частіші за записи**. Він має два режими:

* **читання** (`readLock()`) — будь-яка кількість потоків одночасно;
* **запис** (`writeLock()`) — лише один потік; поки він пише, ніхто не читає й не пише.

Найчастіше його використовують для спільних структур даних, конфігурації застосунку, кешів: скрізь, де читань багато, а записів дуже мало.

```java
public class Cache<K, V> {
    private final Map<K, V> map = new HashMap<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock read = rwLock.readLock();
    private final Lock write = rwLock.writeLock();

    public V get(K key) {
        read.lock();
        try {
            return map.get(key);                      // багато потоків одночасно
        } finally {
            read.unlock();
        }
    }

    public void put(K key, V value) {
        write.lock();
        try {
            map.put(key, value);                      // ексклюзивно
        } finally {
            write.unlock();
        }
    }
}
```

Правила `ReentrantReadWriteLock`:

* обидва замки реентерабельні;
* **пониження** (downgrade) дозволене: тримаючи замок запису, можна захопити замок читання, а потім звільнити замок запису;
* **підвищення** (upgrade) з читання до запису **не підтримується**: спроба захопити замок запису, тримаючи замок читання, призведе до взаємного блокування самого з собою.

> [!NOTE]
> Замок читання-запису виграє лише тоді, коли читання **тривалі** й справді паралельні. Для коротких операцій його накладні витрати більші, ніж у звичайного замка, а для мап простіше й швидше використати `ConcurrentHashMap`. У простих випадках звичайного `synchronized` зазвичай достатньо.

## StampedLock

`StampedLock` (Java 8) додає **оптимістичне читання**: читач не захоплює замок, а отримує «штамп» (число), читає дані й перевіряє, чи не було запису за цей час. Якщо був — повторює читання вже під справжнім замком. Коли записи рідкі, читачі взагалі не конкурують між собою.

```java
public class Point {
    private double x, y;
    private final StampedLock lock = new StampedLock();

    public void move(double dx, double dy) {
        long stamp = lock.writeLock();
        try {
            x += dx;
            y += dy;
        } finally {
            lock.unlockWrite(stamp);
        }
    }

    public double distanceFromOrigin() {
        long stamp = lock.tryOptimisticRead();            // без блокування
        double currentX = x, currentY = y;                // копії в локальні змінні
        if (!lock.validate(stamp)) {                      // був запис — читаємо під замком
            stamp = lock.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return Math.hypot(currentX, currentY);
    }
}
```

> [!WARNING]
> `StampedLock` **не реентерабельний** і не підтримує `Condition`. В оптимістичному режимі дані можуть бути неузгодженими до виклику `validate`, тож їх лише копіюють у локальні змінні й нічого з ними не роблять до перевірки.
