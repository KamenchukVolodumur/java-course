---
title: Асинхронне програмування
description: Блокувальний і асинхронний код, CompletableFuture як обіцянка результату, продовження і як вони виконуються, ручне завершення й обгортання callback-API, композиція етапів, паралельне виконання, allOf і anyOf, обробка в порядку завершення, винятки, тайм-аути, скасування.
---

## Блокувальний і асинхронний код

**Асинхронне програмування** дозволяє виконувати тривалі операції, не блокуючи потік, що їх запустив. Від цього залежить чуйність інтерфейсу (потік UI не «зависає») і масштабованість серверів (потік не простоює, чекаючи на мережу чи базу даних).

Синхронний варіант: метод `getPrimesCount` блокує потік, що його викликав, на одну секунду. Якби це був потік інтерфейсу, програма на цей час перестала б реагувати.

```java
void printPrimesCount() throws InterruptedException {
    int primes = getPrimesCount();
    System.out.println("Primes: " + primes);
}

int getPrimesCount() throws InterruptedException {
    Thread.sleep(1000);
    return 42;
}
```

Асинхронний варіант повертає **одразу**, і не результат, а **обіцянку** результату: `CompletableFuture<Integer>`. Що зробити з результатом, описують **продовженням** (continuation) — функцією, яку буде викликано, коли результат з'явиться:

```java
void printPrimesCountAsync() {
    CompletableFuture<Integer> primesFuture = getPrimesCountAsync();
    primesFuture.thenAccept(primes -> System.out.println("Primes: " + primes));
    System.out.println("Цей рядок друкується першим: потік не чекав");
}

CompletableFuture<Integer> getPrimesCountAsync() {
    Executor afterOneSecond = CompletableFuture.delayedExecutor(1, TimeUnit.SECONDS);
    return CompletableFuture.supplyAsync(() -> 42, afterOneSecond);
}
```

Протягом цієї секунди **жоден потік не заблокований**: `delayedExecutor` лише планує задачу на таймері. Саме це відрізняє асинхронну операцію від синхронної, запущеної в іншому потоці.

> [!NOTE]
> У Java є два підходи до неблокувального коду. Перший — **асинхронні ланцюжки** `CompletableFuture`, описані на цій сторінці: код розбивається на етапи й продовження. Другий — **віртуальні потоки** (сторінка «Віртуальні потоки»): код пишуть звичайним блокувальним стилем, а JVM сама звільняє потік ОС, коли віртуальний потік чекає. Для нового серверного коду другий підхід зазвичай простіший, але `CompletableFuture` залишається основою багатьох API (`HttpClient.sendAsync`, асинхронні драйвери, фреймворки).

## CompletableFuture

`CompletableFuture<T>` реалізує два інтерфейси:

* `Future<T>` — результат, який можна отримати (`get`, `join`, `isDone`);
* `CompletionStage<T>` — етап обчислення, до якого можна приєднати наступні етапи.

Створення:

```java
CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> compute());          // ForkJoinPool.commonPool()
CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> compute(), executor); // на своєму виконавці
CompletableFuture<Void>    c = CompletableFuture.runAsync(() -> log("тик"));             // без результату
CompletableFuture<String>  d = CompletableFuture.completedFuture("готово");             // уже завершене
CompletableFuture<String>  e = CompletableFuture.failedFuture(new IOException("збій")); // уже з помилкою
```

Отримати результат можна блокувально: `get()` кидає checked-винятки `InterruptedException` і `ExecutionException`, а `join()` — unchecked `CompletionException`. Тому в лямбдах зручніший `join()`. Але суть асинхронного стилю саме в тому, щоб **не блокуватися**, а приєднувати продовження.

### Як виконуються продовження

`thenApply(fn)` нічого не чекає: він **реєструє** функцію і негайно повертає новий `CompletableFuture`, що завершиться її результатом. Коли попередній етап завершиться, зареєстровані продовження буде викликано:

* якщо етап ще не завершений, продовження виконає **потік, що його завершує** (наприклад, потік пулу, який щойно порахував значення);
* якщо етап **уже** завершений у момент реєстрації, продовження виконається **одразу, у потоці, що викликав** `thenApply`;
* варіант `thenApplyAsync(fn)` завжди подає продовження виконавцю (за замовчуванням спільному пулу), а `thenApplyAsync(fn, executor)` — указаному виконавцю (сторінка «Контекст виконання»).

```java
CompletableFuture
        .supplyAsync(() -> {
            System.out.println("supply: " + Thread.currentThread().getName());
            return 21;
        })
        .thenApply(x -> {
            System.out.println("apply:  " + Thread.currentThread().getName());
            return x * 2;
        })
        .thenAccept(x -> System.out.println("accept: " + Thread.currentThread().getName() + " -> " + x))
        .join();
// supply: ForkJoinPool.commonPool-worker-1
// apply:  ForkJoinPool.commonPool-worker-1    (або main, якщо supply встиг завершитися раніше)
// accept: ForkJoinPool.commonPool-worker-1 -> 42
```

### Ручне завершення

`CompletableFuture` можна створити порожнім і завершити вручну з будь-якого потоку методами `complete(value)` або `completeExceptionally(ex)`. Так старі API з функціями зворотного виклику (callback) обгортають у `CompletableFuture`:

```java
interface Callback<T> {
    void onSuccess(T value);
    void onError(Throwable error);
}

// старе API: void fetch(String key, Callback<String> callback)

static CompletableFuture<String> fetchAsync(LegacyClient client, String key) {
    CompletableFuture<String> future = new CompletableFuture<>();
    client.fetch(key, new Callback<>() {
        @Override public void onSuccess(String value) { future.complete(value); }
        @Override public void onError(Throwable error) { future.completeExceptionally(error); }
    });
    return future;
}
```

Лише перше завершення має ефект: повторні `complete` повертають `false` і нічого не змінюють.

## Композиція етапів

| Метод | Вхід → вихід | Призначення |
| --- | --- | --- |
| `thenApply(fn)` | `T → U` | перетворити результат |
| `thenAccept(consumer)` | `T → void` | використати результат |
| `thenRun(action)` | `() → void` | виконати дію після завершення |
| `thenCompose(fn)` | `T → CompletionStage<U>` | наступна **асинхронна** операція (аналог `flatMap`) |
| `thenCombine(other, fn)` | `(T, U) → V` | поєднати результати двох незалежних етапів |
| `applyToEither(other, fn)` | `T → U` | взяти той результат, що прийде першим |
| `whenComplete(action)` | `(T, Throwable) → void` | побічна дія за будь-якого результату |
| `handle(fn)` | `(T, Throwable) → U` | перетворити і результат, і помилку |
| `exceptionally(fn)` | `Throwable → T` | значення на заміну помилці |

`thenApply` проти `thenCompose`: якщо функція сама повертає `CompletableFuture`, `thenApply` дасть вкладений `CompletableFuture<CompletableFuture<U>>`, а `thenCompose` його «розгорне»:

```java
CompletableFuture<User> user = findUserAsync(id);

CompletableFuture<CompletableFuture<List<Order>>> nested = user.thenApply(u -> loadOrdersAsync(u));
CompletableFuture<List<Order>> flat = user.thenCompose(u -> loadOrdersAsync(u));
```

Ланцюжок читається зверху вниз, як синхронний код:

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder(URI.create("https://example.com/users/42")).build();

client.sendAsync(request, HttpResponse.BodyHandlers.ofString())     // мережа без блокування потоку
        .thenApply(HttpResponse::body)
        .thenApply(User::fromJson)
        .thenCompose(u -> loadOrdersAsync(u))
        .thenAccept(orders -> System.out.println("Замовлень: " + orders.size()))
        .exceptionally(ex -> { System.err.println("Помилка: " + ex); return null; });
```

## Паралельне виконання

Запущені етапи виконуються незалежно, тож асинхронність дає паралелізм: обидві задачі нижче рахують одночасно, а результати поєднуються, коли готові обидва.

```java
public class Main {
    public static void main(String[] args) {
        CompletableFuture<Long> task1 = countPrimesAsync(0, 1_000_000);
        CompletableFuture<Long> task2 = countPrimesAsync(1_000_000, 2_000_000);

        task1.thenCombine(task2, (p1, p2) -> "Простих: " + p1 + " + " + p2 + " = " + (p1 + p2))
             .thenAccept(System.out::println)
             .join();                                  // у main лише для того, щоб JVM не завершилася
    }

    static CompletableFuture<Long> countPrimesAsync(int start, int end) {
        return CompletableFuture.supplyAsync(() ->
                IntStream.range(start, end).filter(Main::isPrime).count());
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; (long) i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}
```

## Очікування кількох задач

### allOf

`CompletableFuture.allOf(...)` повертає `CompletableFuture<Void>`, що завершується, коли завершаться **всі** передані. Результатів він не збирає, тож їх забирають з вихідних об'єктів: після `allOf` вони вже завершені, і `join()` не блокує.

```java
List<CompletableFuture<Long>> tasks = List.of(
        countPrimesAsync(0, 1_000_000),
        countPrimesAsync(1_000_000, 2_000_000),
        countPrimesAsync(2_000_000, 3_000_000));

CompletableFuture<List<Long>> all = CompletableFuture
        .allOf(tasks.toArray(CompletableFuture[]::new))
        .thenApply(v -> tasks.stream().map(CompletableFuture::join).toList());   // порядок як у tasks

System.out.println(all.join());
```

Якщо будь-яка задача завершилася помилкою, `allOf` теж завершиться помилкою (але лише після завершення всіх).

### anyOf

`CompletableFuture.anyOf(...)` завершується результатом **першої** завершеної задачі. Тип результату — `Object`, бо задачі можуть мати різні типи:

```java
CompletableFuture<Object> first = CompletableFuture.anyOf(
        fetchFromMirrorAsync("eu"), fetchFromMirrorAsync("us"));
String data = (String) first.join();
```

Решта задач **не скасовуються** й продовжують працювати. Для двох задач одного типу зручніший типобезпечний `a.applyToEither(b, x -> x)`.

### У порядку завершення

Щоб обробляти результати **щойно вони з'являються**, достатньо приєднати продовження до кожної задачі:

```java
tasks.forEach(t -> t.thenAccept(primes -> System.out.println("Готово: " + primes)));
```

Для звичайних `Future` те саме робить `ExecutorCompletionService`: метод `take()` повертає задачі в порядку завершення.

```java
CompletionService<Long> service = new ExecutorCompletionService<>(pool);
service.submit(() -> countPrimes(0, 3_000_000));
service.submit(() -> countPrimes(3_000_000, 4_000_000));
service.submit(() -> countPrimes(4_000_000, 5_000_000));

for (int i = 0; i < 3; i++) {
    System.out.println("Primes: " + service.take().get());    // спершу найшвидша
}
```

## Винятки

Виняток в етапі не кидається одразу: етап завершується **з помилкою**, і помилка поширюється далі ланцюжком, пропускаючи `thenApply`/`thenAccept`, до першого обробника.

```java
CompletableFuture<Integer> result = CompletableFuture
        .supplyAsync(() -> Integer.parseInt("не число"))     // NumberFormatException
        .thenApply(x -> x * 2)                                // пропущено
        .exceptionally(ex -> {
            System.out.println("Помилка: " + ex);              // CompletionException: NumberFormatException
            return -1;
        });
System.out.println(result.join());                           // -1
```

Між етапами виняток загорнуто в **`CompletionException`**; справжня причина — у `getCause()`. `join()` кидає `CompletionException`, а `get()` — `ExecutionException`.

```java
CompletableFuture<String> page = downloadAsync(url)
        .handle((body, ex) -> ex == null ? body : "<сторінка недоступна>")      // і результат, і помилка
        .whenComplete((body, ex) -> log("завантаження завершено"));            // побічна дія, результат не змінює

CompletableFuture<String> withFallback = downloadAsync(primaryUrl)
        .exceptionallyCompose(ex -> downloadAsync(backupUrl));                  // Java 12: асинхронна заміна
```

> [!WARNING]
> Ланцюжок без обробника помилок і без `join()` наприкінці **мовчки ковтає винятки**. Завершуйте ланцюжки `exceptionally`/`handle`/`whenComplete` з логуванням.

## Тайм-аути

```java
downloadAsync(url)
        .orTimeout(5, TimeUnit.SECONDS)                         // помилка TimeoutException після 5 с
        .exceptionally(ex -> "тайм-аут");

downloadAsync(url)
        .completeOnTimeout("значення за замовчуванням", 5, TimeUnit.SECONDS);   // замінити значенням
```

## Скасування

`future.cancel(true)` завершує `CompletableFuture` винятком `CancellationException`, і всі залежні етапи теж завершуються помилкою. Але, на відміну від `Future` з `ExecutorService`, **обчислення, що вже виконується, не переривається**: `CompletableFuture` не знає, у якому потоці воно працює, і параметр `mayInterruptIfRunning` ігнорується.

Тому довгі задачі, які треба вміти скасовувати, отримують **сигнал скасування** і перевіряють його самі. Сигналом може бути простий потокобезпечний прапорець:

```java
public class Main {
    public static void main(String[] args) {
        AtomicBoolean cancelled = new AtomicBoolean();
        CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS)
                .execute(() -> cancelled.set(true));          // «скасувати через 5 с»

        try {
            List<Integer> primes = getPrimesAsync(2, cancelled).join();
            System.out.println("Кількість простих: " + primes.size());
        } catch (CompletionException e) {
            if (e.getCause() instanceof CancellationException) {
                System.out.println("Скасовано");
            } else {
                throw e;
            }
        }
    }

    static CompletableFuture<List<Integer>> getPrimesAsync(int start, AtomicBoolean cancelled) {
        return CompletableFuture.supplyAsync(() -> {
            List<Integer> primes = new ArrayList<>();
            for (int i = start; i < Integer.MAX_VALUE; i++) {
                if (cancelled.get()) throw new CancellationException();
                if (isPrime(i)) primes.add(i);
            }
            return primes;
        });
    }
}
```

Інший варіант — запускати задачу через `ExecutorService` і скасовувати її `Future.cancel(true)`: тоді потік задачі отримує переривання, яке задача перевіряє через `Thread.currentThread().isInterrupted()` (сторінка «Виконавці й Future»). Віртуальні потоки й структурована конкурентність роблять скасування ще простішим: скасування області перериває всі її підзадачі.
