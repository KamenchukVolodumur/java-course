---
title: Паралельні обчислення
description: Паралельні аналоги «виконати кілька дій», циклу for і foreach, ранній вихід з паралельного циклу, обмеження ступеня паралелізму й скасування, Fork/Join і RecursiveTask, коли паралельність окуповується, паралельне введення-виведення.
---

## Огляд

Для обчислень (CPU-bound), які можна розбити на незалежні частини, у Java є кілька інструментів, що приховують керування потоками:

* **паралельні потоки Stream API** (`parallel()`, `parallelStream()`) — паралельні аналоги циклів `for` і `foreach`;
* **`ExecutorService.invokeAll`** — паралельне виконання кількох різних дій;
* **Fork/Join** (`ForkJoinPool`, `RecursiveTask`) — рекурсивний поділ задачі «розділяй і володарюй».

Спільне для всіх:

1. Робота розбивається на частини й виконується в пулі потоків: паралельні потоки використовують спільний `ForkJoinPool.commonPool()`.
2. Виклик **блокує** потік, доки вся робота не завершиться.
3. Якщо одна з частин кине виняток, він передається потоку, що викликав (інші частини можуть ще деякий час виконуватися).

> [!WARNING]
> Паралельний код, що змінює спільний стан (поле, список, словник), потребує синхронізації. Найкраще не змінювати спільного стану взагалі, а збирати результат **редукцією** (`sum`, `count`, `collect`): тоді синхронізацію бере на себе бібліотека.

## Кілька дій

```java
public static void main(String[] args) throws InterruptedException {
    List<Callable<Void>> actions = List.of(
            () -> downloadFile("https://example.com/a.jpg", "a.jpg"),
            () -> downloadFile("https://example.com/b.jpg", "b.jpg"),
            () -> downloadFile("https://example.com/c.jpg", "c.jpg"));

    try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
        pool.invokeAll(actions);                  // блокує, доки всі не завершаться
    }
}

static Void downloadFile(String url, String outputPath) {
    try (HttpClient client = HttpClient.newHttpClient()) {           // AutoCloseable з Java 21
        HttpRequest request = HttpRequest.newBuilder(URI.create(url)).build();
        HttpResponse<Path> response = client.send(request, HttpResponse.BodyHandlers.ofFile(Path.of(outputPath)));
        if (response.statusCode() != 200) throw new IOException("HTTP " + response.statusCode());
        System.out.println(outputPath + " завантажено");
    } catch (IOException | InterruptedException e) {
        System.out.println("Помилка завантаження " + url + ": " + e.getMessage());
    }
    return null;
}
```

Для обчислювальних дій на спільному пулі зручно скористатися `CompletableFuture`:

```java
CompletableFuture.allOf(
        CompletableFuture.runAsync(() -> sortPart(data, 0, mid)),
        CompletableFuture.runAsync(() -> sortPart(data, mid, data.length))
).join();
```

## Паралельний цикл for

Аналог циклу `for` за діапазоном індексів — `IntStream.range(...).parallel()`:

```java
int from = 1_000_000, to = 1_000_100;
IntStream.range(from, to).parallel().forEach(i ->
        System.out.println("Чи просте " + i + ": " + isPrime(i)));
```

> [!NOTE]
> Ітерації виконуються не по порядку, тож рядки друкуються в недетермінованому порядку. Якщо порядок важливий, використовують `forEachOrdered`, але тоді частина паралелізму втрачається.

Обчислювати краще не побічними ефектами, а редукцією:

```java
long primes = IntStream.range(0, 10_000_000).parallel().filter(Main::isPrime).count();

Map<Boolean, Long> byParity = IntStream.range(0, 10_000_000).parallel().boxed()
        .filter(Main::isPrime)
        .collect(Collectors.partitioningBy(n -> n % 4 == 1, Collectors.counting()));
```

### Ранній вихід

Аналог `break` у паралельному циклі — короткозамкнені операції:

* `findFirst()` — знаходить елемент з **найменшим індексом**, що задовольняє умову. Робота над більшими індексами припиняється, але всі менші мають бути перевірені;
* `findAny()` — будь-який елемент; паралельний потік зупиняється, щойно хоч один потік знайде відповідь (швидше);
* `anyMatch`, `allMatch`, `noneMatch` — зупиняються, щойно відповідь відома.

```java
int from = 1_000_000, to = 1_000_100;
OptionalInt firstPrime = IntStream.range(from, to).parallel().filter(Main::isPrime).findFirst();

firstPrime.ifPresentOrElse(
        p -> System.out.println("Є просте число: " + p),        // 1000003, як і в послідовному циклі
        () -> System.out.println("Простих немає"));
```

`takeWhile` у паралельному впорядкованому потоці теж працює коректно, але дорого: йому доводиться буферизувати елементи, щоб зберегти порядок.

## Паралельний foreach

Для колекцій — `parallelStream()`:

```java
record Download(String url, String output) { }

List<Download> downloads = List.of(
        new Download("https://example.com/1.jpg", "1.jpg"),
        new Download("https://example.com/2.jpg", "2.jpg"),
        new Download("https://example.com/3.jpg", "3.jpg"));

downloads.parallelStream().forEach(d -> processImage(d.output()));
```

Ефективність залежить від того, наскільки добре джерело **ділиться** на частини (його `Spliterator`):

| Добре діляться | Погано діляться |
| --- | --- |
| масиви, `ArrayList`, `IntStream.range` | `LinkedList`, `Stream.iterate`, `BufferedReader.lines()` |
| `HashSet`, `HashMap.keySet()` | `Stream.generate().limit(n)` |

## Ступінь паралелізму і скасування

Паралельні потоки використовують спільний пул з `кількість ядер − 1` потоками (плюс потік, що викликав). Змінити це можна:

* глобально: `-Djava.util.concurrent.ForkJoinPool.common.parallelism=4`;
* для одного обчислення: запустити термінальну операцію **всередині власного** `ForkJoinPool`. Паралельний потік використовує пул, у якому його запущено:

```java
try (ForkJoinPool pool = new ForkJoinPool(4)) {                 // не більше 4 потоків
    long primes = pool.submit(() ->
            IntStream.range(0, 10_000_000).parallel().filter(Main::isPrime).count()
    ).get();
    System.out.println("Простих: " + primes);
}
```

> [!NOTE]
> Те, що паралельний потік виконується в пулі, з якого його запущено, — поведінка реалізації, а не документований контракт, але на ній базується багато коду, і вона стабільна.

Скасування паралельних потоків не передбачене. Кооперативно його реалізують прапорцем, який перевіряють елементи:

```java
AtomicBoolean cancelled = new AtomicBoolean();
CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS).execute(() -> cancelled.set(true));

LongAdder primes = new LongAdder();                              // потокобезпечний лічильник
IntStream.range(0, 100_000_000).parallel().unordered()     // порядок не важливий — дешевший takeWhile
        .takeWhile(i -> !cancelled.get())                         // нові елементи не обробляються
        .filter(Main::isPrime)
        .forEach(i -> primes.increment());

System.out.println(cancelled.get()
        ? "Скасовано, знайдено щонайменше " + primes.sum()
        : "Знайдено рівно " + primes.sum());
```

`LongAdder` (або `AtomicLong`) — потокобезпечний аналог `count++`. Звичайне `int` поле тут дало б неправильний результат (розділ «Синхронізація»).

## Fork/Join

Паралельні потоки побудовані на **Fork/Join**: задача рекурсивно ділиться навпіл, доки частини не стануть достатньо малими, щоб обчислити їх послідовно. Кожен потік `ForkJoinPool` має власну чергу задач, а потік, що звільнився, **«краде»** задачі з хвоста черги іншого потоку (work stealing). Так навантаження вирівнюється без центральної черги.

```java
class SumTask extends RecursiveTask<Long> {
    private static final int THRESHOLD = 10_000;
    private final long[] data;
    private final int from, to;

    SumTask(long[] data, int from, int to) {
        this.data = data;
        this.from = from;
        this.to = to;
    }

    @Override
    protected Long compute() {
        if (to - from <= THRESHOLD) {                     // мала частина — рахуємо послідовно
            long sum = 0;
            for (int i = from; i < to; i++) sum += data[i];
            return sum;
        }
        int mid = (from + to) >>> 1;
        SumTask left = new SumTask(data, from, mid);
        SumTask right = new SumTask(data, mid, to);
        left.fork();                                      // ліву — у чергу (її може «вкрасти» інший потік)
        long rightSum = right.compute();                  // праву — самі
        return left.join() + rightSum;
    }
}

long[] data = LongStream.rangeClosed(1, 50_000_000).toArray();
long sum = ForkJoinPool.commonPool().invoke(new SumTask(data, 0, data.length));
System.out.println(sum);                                  // 1250000025000000
```

`RecursiveAction` — те саме без результату (наприклад, паралельне сортування злиттям). `Arrays.parallelSort` і `Arrays.parallelPrefix` реалізовані саме так.

## Коли паралельність окуповується

Розбиття, планування й злиття результатів мають ціну. Паралельний потік **повільніший** за послідовний, якщо:

* елементів мало або робота над елементом дешева. Орієнтир: `N × Q > 10 000`, де N — кількість елементів, Q — вартість обробки одного елемента в «простих операціях»;
* джерело погано ділиться (таблиця вище);
* операції залежать від порядку: `limit`, `skip`, `findFirst`, `forEachOrdered`, `sorted` на впорядкованому потоці. Якщо порядок не потрібен, `unordered()` знімає це обмеження;
* `collect` об'єднує багато проміжних колекцій. Для мап краще `Collectors.toConcurrentMap` і `groupingByConcurrent`.

> [!IMPORTANT]
> Рішення про паралелізм приймають за **вимірюваннями** (наприклад, JMH), а не інтуїцією. І ніколи не виконують блокувальне введення-виведення в паралельних потоках: воно займає потоки спільного пулу, від якого залежить уся програма.

## Паралельне введення-виведення

Для операцій, що здебільшого чекають (завантаження файлів, запити до сервісів), паралельні потоки не підходять: їх стільки, скільки ядер, і вони займають спільний пул. Натомість використовують віртуальні потоки й, за потреби, обмежують кількість одночасних операцій:

```java
try (HttpClient client = HttpClient.newHttpClient();
     ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Semaphore limit = new Semaphore(4);                  // не більше 4 завантажень одночасно
    for (Download d : downloads) {
        executor.submit(() -> {
            limit.acquire();
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(d.url())).build();
                client.send(request, HttpResponse.BodyHandlers.ofFile(Path.of(d.output())));
                System.out.println(d.output() + " завантажено");
            } finally {
                limit.release();
            }
            return null;
        });
    }
}
```

Від Java 24 те саме можна виразити в Stream API через **gatherer** `mapConcurrent`: він виконує функцію у віртуальних потоках, не більше заданої кількості одночасно, і зберігає порядок результатів:

```java
List<Path> files = downloads.stream()
        .gather(Gatherers.mapConcurrent(4, d -> download(client, d)))   // до 4 паралельних завантажень
        .toList();
```
