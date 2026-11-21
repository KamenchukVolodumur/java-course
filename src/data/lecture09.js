export const lecture09 = {
  id: "09",
  title: "Лекція 09: Пули потоків, CompletableFuture, віртуальні потоки та Flow API",
  description: "ExecutorService і Future, асинхронна композиція через CompletableFuture (аналог Task і async/await), обробка помилок і тайм-аути, віртуальні потоки Java 21 і структурована конкурентність, реактивні потоки Flow API (аналог IAsyncEnumerable/IObservable), а також дати й час (java.time).",
  sections: [
    {
      title: "1. ExecutorService — пул потоків",
      content: `
Створювати \`new Thread()\` на кожну задачу дорого: платформний потік — це потік ОС із мегабайтним стеком. **Пул потоків** тримає кілька потоків і роздає їм задачі з черги. Аналог \`ThreadPool\` і \`TaskScheduler\` у .NET.

\`\`\`java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {   // AutoCloseable від Java 19
    Future<Integer> f = pool.submit(() -> {       // Callable<Integer>
        Thread.sleep(500);
        return 42;
    });
    pool.submit(() -> System.out.println("Runnable без результату"));

    System.out.println("працюємо далі...");
    Integer result = f.get();                     // блокує до завершення
    Integer r2 = f.get(1, TimeUnit.SECONDS);      // з тайм-аутом -> TimeoutException
}   // close() = shutdown() + очікування завершення всіх задач
\`\`\`

| Фабрика | Поведінка |
| --- | --- |
| \`newFixedThreadPool(n)\` | n потоків, необмежена черга |
| \`newCachedThreadPool()\` | створює потоки за потреби, прибирає ті, що простоюють |
| \`newSingleThreadExecutor()\` | один потік: задачі виконуються послідовно |
| \`newScheduledThreadPool(n)\` | \`schedule\`, \`scheduleAtFixedRate\` |
| \`newWorkStealingPool()\` | ForkJoinPool |
| \`newVirtualThreadPerTaskExecutor()\` | новий віртуальний потік на кожну задачу (Java 21) |

### Завершення пулу (до Java 19 або без try-with-resources)

\`\`\`java
pool.shutdown();                                   // нових задач не приймаємо
if (!pool.awaitTermination(10, TimeUnit.SECONDS)) {
    pool.shutdownNow();                            // interrupt усім потокам
}
\`\`\`

> [!WARNING]
> Якщо задача, передана через \`submit\`, кинула виняток, він **не з'явиться в лозі**, а збережеться у \`Future\` і вилетить лише з \`get()\` як \`ExecutionException\`. Якщо результат ніхто не читає, помилка зникне безслідно.

### invokeAll / invokeAny

\`\`\`java
List<Callable<String>> tasks = urls.stream().<Callable<String>>map(u -> () -> download(u)).toList();
List<Future<String>> all = pool.invokeAll(tasks);     // чекає на всі
String fastest = pool.invokeAny(tasks);               // перший успішний, решта скасовуються
\`\`\`
`
    },
    {
      title: "2. CompletableFuture — асинхронна композиція",
      content: `
\`Future.get()\` блокує потік. \`CompletableFuture<T>\` дозволяє **будувати ланцюжки** дій, які виконаються, коли буде готовий результат. Це найближчий аналог \`Task<T>\` з \`ContinueWith\`. Ключових слів \`async/await\` у Java немає. Їх заміняють ланцюжки або (від Java 21) звичайний блокувальний код у віртуальних потоках.

\`\`\`java
CompletableFuture<User> userF = CompletableFuture.supplyAsync(() -> api.fetchUser(id), pool);

userF
    .thenApply(User::email)                              // map: T -> R
    .thenCompose(email -> mailer.sendAsync(email))       // flatMap: T -> CompletableFuture<R>
    .thenAccept(status -> log.info("надіслано: {}", status))   // кінцева дія
    .exceptionally(ex -> { log.error("збій", ex); return null; });
\`\`\`

| Метод | Аналог | Опис |
| --- | --- | --- |
| \`supplyAsync(supplier [, executor])\` | \`Task.Run\` | запуск задачі з результатом |
| \`runAsync(runnable)\` | \`Task.Run\` | задача без результату |
| \`thenApply(f)\` | \`ContinueWith\` + результат | перетворення результату |
| \`thenCompose(f)\` | \`await\` всередині \`async\` | продовження, що саме асинхронне |
| \`thenCombine(other, f)\` | \`WhenAll\` для двох задач | поєднати два результати |
| \`allOf(...)\` | \`Task.WhenAll\` | дочекатися всіх |
| \`anyOf(...)\` | \`Task.WhenAny\` | дочекатися першої |
| \`exceptionally(f)\` | \`catch\` | значення на випадок помилки |
| \`handle((res, ex) -> ...)\` | \`try/catch\` | обробка і успіху, і помилки |
| \`orTimeout\`, \`completeOnTimeout\` | \`WaitAsync(timeout)\` | тайм-аути |
| \`join()\` / \`get()\` | \`.Result\` / \`await\` | блокувальне очікування |

### Паралельне завантаження

\`\`\`java
List<CompletableFuture<Weather>> futures = cities.stream()
        .map(city -> CompletableFuture
                .supplyAsync(() -> client.fetch(city), pool)
                .orTimeout(3, TimeUnit.SECONDS)
                .exceptionally(ex -> Weather.unknown(city)))   // одне місто не валить усе
        .toList();

CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();
List<Weather> results = futures.stream().map(CompletableFuture::join).toList();
\`\`\`

> [!CAUTION]
> Без власного executor \`supplyAsync\` використовує \`ForkJoinPool.commonPool()\`. Блокувальні операції (HTTP, БД) у ньому «з'їдають» потоки, потрібні паралельним stream-ам усієї програми. Для I/O завжди передавайте окремий пул (або віртуальні потоки).

> [!NOTE]
> Винятки в ланцюжку загортаються в \`CompletionException\`. Справжня причина — у \`ex.getCause()\`.
`
    },
    {
      title: "3. Віртуальні потоки (Java 21, Project Loom)",
      content: `
**Платформний** потік = потік ОС: ~1 МБ стеку, дороге перемикання, на машину їх влазять тисячі. **Віртуальний** потік — легкий потік, яким керує JVM: стек зберігається в купі і росте за потреби, а самих потоків можуть бути **мільйони**.

\`\`\`java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 100_000).forEach(i ->
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));   // блокування НЕ займає потік ОС
            return i;
        }));
}   // 100 000 задач, кожна по 1 с, займуть разом приблизно 1 с

Thread.startVirtualThread(() -> System.out.println("привіт з віртуального потоку"));
\`\`\`

### Як це працює

Віртуальні потоки виконуються на невеликому пулі **потоків-носіїв** (carrier threads; їх стільки, скільки ядер). Коли віртуальний потік блокується на I/O, \`sleep\` чи \`BlockingQueue\`, JVM **відмонтовує** його від носія і зберігає стек у купі, а носій бере наступний віртуальний потік.

Результат: можна писати **простий блокувальний код** (як у C# з \`await\`, але без \`async\`-«зараження» сигнатур), і він масштабується так само добре, як асинхронний.

| | Платформні | Віртуальні |
| --- | --- | --- |
| Кількість | тисячі | мільйони |
| Створення | дороге → пули | дешеве → потік на задачу, без пулів |
| Призначення | CPU-bound обчислення | I/O-bound задачі (HTTP, БД, файли) |

> [!WARNING]
> Віртуальні потоки **не прискорюють обчислень**: для CPU-задач кількість ядер не зміниться. Не створюйте з них пулів (вони дешеві) і не кешуйте важкі об'єкти в \`ThreadLocal\`: потоків може бути мільйон. До Java 24 \`synchronized\` з блокуванням усередині «прибивав» (pinning) віртуальний потік до носія, тому для довгих секцій радили \`ReentrantLock\`.

### Структурована конкурентність (preview)

\`StructuredTaskScope\` групує підзадачі: якщо одна з них падає, решта скасовується, а жодна не «втече» за межі блоку. Ідея близька до \`Task.WhenAll\` з \`CancellationToken\`.

\`\`\`java
try (var scope = StructuredTaskScope.open()) {        // API Java 25 (preview)
    var user  = scope.fork(() -> findUser(id));
    var order = scope.fork(() -> fetchOrder(id));
    scope.join();                                     // чекаємо обидві; помилка -> виняток
    return new Response(user.get(), order.get());
}
\`\`\`
`
    },
    {
      title: "4. Реактивні потоки: Flow API",
      content: `
Stream (лекція 05) — це **pull**-модель: споживач сам запитує наступний елемент. Коли дані надходять **асинхронно** (події, повідомлення, рядки з мережі), потрібна **push**-модель з **backpressure**: споживач повідомляє, скільки елементів готовий прийняти.

\`java.util.concurrent.Flow\` (Java 9) — стандартні інтерфейси Reactive Streams. Аналоги: \`IObservable<T>\` і \`IAsyncEnumerable<T>\` у .NET.

\`\`\`text
Publisher --subscribe--> Subscriber
          <--request(n)--   (backpressure)
          ---onNext(x)--->  (не більше n разів)
          ---onComplete / onError-->
\`\`\`

\`\`\`java
class PrintSubscriber implements Flow.Subscriber<String> {
    private Flow.Subscription subscription;

    @Override public void onSubscribe(Flow.Subscription s) {
        this.subscription = s;
        s.request(1);                        // готовий прийняти 1 елемент
    }
    @Override public void onNext(String item) {
        System.out.println("отримано: " + item);
        subscription.request(1);             // беремо наступний
    }
    @Override public void onError(Throwable t) { t.printStackTrace(); }
    @Override public void onComplete() { System.out.println("кінець"); }
}

try (var publisher = new SubmissionPublisher<String>()) {   // готова реалізація з буфером
    publisher.subscribe(new PrintSubscriber());
    List.of("a", "b", "c").forEach(publisher::submit);      // блокується, якщо буфер повний
}   // close() надсилає onComplete
\`\`\`

\`Flow.Processor<T, R>\` — це одночасно Subscriber і Publisher, тобто проміжна ланка конвеєра.

> [!NOTE]
> Самі по собі ці інтерфейси низькорівневі. На практиці використовують Project Reactor (\`Flux\`/\`Mono\`, Spring WebFlux) або RxJava, які реалізують ті самі інтерфейси та мають сотні операторів (\`map\`, \`filter\`, \`buffer\`, \`debounce\`). А з віртуальними потоками багато реактивного коду можна замінити простим блокувальним.
`
    },
    {
      title: "5. Дата і час: java.time",
      content: `
Старі \`java.util.Date\` і \`Calendar\` змінювані й незручні, не використовуйте їх. Пакет \`java.time\` (Java 8) складається з **незмінних** потокобезпечних типів.

| Тип | Що зберігає | Приклад |
| --- | --- | --- |
| \`LocalDate\` | дата без часу і зони | 2025-03-14 |
| \`LocalTime\` | час без дати | 10:15:30 |
| \`LocalDateTime\` | дата + час без зони | 2025-03-14T10:15:30 |
| \`ZonedDateTime\` | дата + час + часова зона | ...+01:00[Europe/Warsaw] |
| \`Instant\` | момент на шкалі UTC | для логів і БД |
| \`Duration\` | тривалість у секундах/наносекундах | PT2H30M |
| \`Period\` | тривалість у днях/місяцях/роках | P1Y2M |

\`\`\`java
LocalDate today = LocalDate.now();
LocalDate exam = LocalDate.of(2025, Month.JUNE, 20);
long days = ChronoUnit.DAYS.between(today, exam);
LocalDate nextMonday = today.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
LocalDate plus = today.plusWeeks(2).minusDays(1);       // повертає НОВИЙ об'єкт

Instant start = Instant.now();
// ...
Duration took = Duration.between(start, Instant.now());
System.out.println(took.toMillis() + " мс");

ZonedDateTime warsaw = ZonedDateTime.now(ZoneId.of("Europe/Warsaw"));
ZonedDateTime kyiv = warsaw.withZoneSameInstant(ZoneId.of("Europe/Kyiv"));

DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
String s = LocalDateTime.now().format(fmt);             // "14.03.2025 10:15"
LocalDateTime parsed = LocalDateTime.parse("01.02.2025 08:00", fmt);
LocalDate iso = LocalDate.parse("2025-03-14");          // ISO-8601 без форматера
\`\`\`

> [!TIP]
> У базі даних і в мережевих протоколах зберігайте \`Instant\` (UTC). У часову зону користувача переводьте лише під час показу.
`
    }
  ],
  quiz: [
    {
      question: "Задача, передана через executor.submit(), кинула виняток. Що станеться?",
      options: [
        "Виняток надрукується в консоль і зупинить програму",
        "Виняток збережеться у Future і буде кинутий з get() як ExecutionException",
        "Пул потоків зупиниться",
        "Виняток буде проігноровано назавжди"
      ],
      answer: 1,
      explanation: "submit загортає задачу у FutureTask. Якщо результат не читають, помилка зникне безслідно."
    },
    {
      question: "Чим thenCompose відрізняється від thenApply?",
      options: [
        "Нічим",
        "thenCompose приймає функцію, що повертає CompletableFuture, і «сплющує» результат; thenApply — звичайне перетворення значення",
        "thenCompose виконується синхронно",
        "thenApply обробляє винятки"
      ],
      answer: 1,
      explanation: "Аналогія з потоками: thenApply — це map, а thenCompose — flatMap. Без thenCompose вийде CompletableFuture<CompletableFuture<T>>."
    },
    {
      question: "Коли віртуальні потоки дають найбільший виграш?",
      options: [
        "Для обчислень, що навантажують CPU",
        "Для великої кількості задач, які переважно чекають на I/O",
        "Для GUI",
        "Завжди однаково"
      ],
      answer: 1,
      explanation: "Під час блокування віртуальний потік звільняє потік-носій, тому можна тримати мільйони паралельних I/O-операцій. Для CPU-bound задач кількість ядер не змінюється."
    },
    {
      question: "Що таке backpressure у Flow API?",
      options: [
        "Тиск на GC",
        "Механізм, через який підписник повідомляє видавцю, скільки елементів готовий прийняти (request(n))",
        "Повторна відправка після помилки",
        "Пріоритет потоків"
      ],
      answer: 1,
      explanation: "Publisher не має права надіслати більше елементів, ніж підписник запросив через request(n). Так повільний споживач не захлинеться даними."
    },
    {
      question: "Який тип java.time найкраще підходить для збереження моменту події в базі даних?",
      options: ["LocalDateTime", "LocalDate", "Instant", "String"],
      answer: 2,
      explanation: "Instant — однозначна точка на шкалі UTC. LocalDateTime не має зони і тому неоднозначний."
    },
    {
      question: "Чому для I/O-задач у supplyAsync варто передавати власний executor?",
      options: [
        "Інакше задача не виконається",
        "За замовчуванням використовується ForkJoinPool.commonPool, і блокування в ньому гальмує паралельні stream-и всієї програми",
        "Власний executor автоматично повторює запити",
        "Так вимагає компілятор"
      ],
      answer: 1,
      explanation: "commonPool має стільки потоків, скільки ядер, мінус один, і розрахований на CPU-задачі. Блокувальний I/O швидко його вичерпує."
    }
  ]
};
