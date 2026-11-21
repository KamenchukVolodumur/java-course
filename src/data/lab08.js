export const lab08 = {
  id: "Lab08",
  title: "Лабораторна 08: Багатопотоковість — біржовий стакан",
  description: "Гонки даних і атомарні змінні, біржовий стакан ордерів (order book) із зіставленням за пріоритетом ціни й часу, захист спільного стану через ReentrantReadWriteLock, симуляція трейдерів у пулі потоків з CountDownLatch і асинхронна перевірка ризиків через CompletableFuture.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 09.1 «Потоки», 09.2 «Виконавці й Future», 12.1 «Вступ», 12.2 «Ексклюзивне блокування», 12.4 «Сигналізація», 12.5 «Потокобезпечні колекції» · **Час:** 3 год · **Бали:** 10

**Біржовий стакан** (order book) — це дві черги заявок: на купівлю (**bids**) і на продаж (**asks**). Нова заявка спочатку намагається «зіставитися» з протилежною стороною; якщо її не виконано повністю, залишок стає в стакан.

\`\`\`text
          ASK (продаж)                 BID (купівля)
   102 | ████ 5 (bob)            100 | ███ 3 (cid)
   101 | █████ 5 (ann)  ← best    99 | ██ 2
                        best bid ↑   best ask = 101 > best bid = 100: стакан не «перехрещений»
\`\`\`

\`\`\`text
src/main/java/pl/mini/exchange/
├── Side.java  Order.java  Trade.java  Counters.java
├── OrderBook.java  BookSnapshot.java
├── Simulation.java  RiskService.java
└── Main.java   (наданий)
\`\`\`

### Правила

* Ціни — у цілих одиницях (\`long\`, «центи»), **не** \`double\`.
* Будь-який доступ до спільного змінюваного стану — під замком або через атомарні/конкурентні структури.
* Пули потоків закривайте (try-with-resources або \`shutdown\` + \`awaitTermination\`).

> [!CAUTION]
> Заборонено \`Thread.sleep\` як «синхронізація» (наприклад, «зачекати 100 мс, поки потоки закінчать»). Чекати можна лише явно: \`join\`, \`Future.get\`, \`CountDownLatch.await\`, \`awaitTermination\`.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Атомарні змінні

\`\`\`java
private static final AtomicLong NEXT_ID = new AtomicLong(1);
long id = NEXT_ID.getAndIncrement();      // атомарно: жодних дублікатів між потоками
\`\`\`

### ReentrantReadWriteLock

\`\`\`java
private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();

public List<Trade> submit(Order o) {
    rw.writeLock().lock();
    try { return match(o); }
    finally { rw.writeLock().unlock(); }
}

public BookSnapshot snapshot() {
    rw.readLock().lock();               // багато читачів одночасно
    try { return new BookSnapshot(...); }
    finally { rw.readLock().unlock(); }
}
\`\`\`

### Відсортовані рівні цін

\`\`\`java
NavigableMap<Long, Deque<Order>> asks = new TreeMap<>();                           // зростання: найкраща — найменша
NavigableMap<Long, Deque<Order>> bids = new TreeMap<>(Comparator.reverseOrder());  // спадання: найкраща — найбільша
Map.Entry<Long, Deque<Order>> best = asks.firstEntry();                             // null, якщо порожньо
\`\`\`

### Одночасний старт потоків

\`\`\`java
CountDownLatch start = new CountDownLatch(1);
for (int i = 0; i < n; i++) pool.submit(() -> { start.await(); work(); return null; });
start.countDown();                      // усі потоки стартують разом: гонки проявляються частіше
\`\`\`

### CompletableFuture

\`\`\`java
CompletableFuture<Boolean> ok = CompletableFuture.supplyAsync(() -> check(o), executor);
ok.thenApply(accepted -> accepted ? book.submit(o) : List.<Trade>of());
CompletableFuture.allOf(futures).join();
\`\`\`
`
    },
    {
      title: "Очікуваний вивід",
      content: `
Так має виглядати вивід \`Main\` зі стартового проєкту, коли розкоментовано всі етапи:

\`\`\`text
atomic ok: true
unsafe <= expected: true
bid 100x3 | ask 101x5
[Trade[buyId=4, sellId=1, price=101, qty=5], Trade[buyId=4, sellId=2, price=102, qty=2]]
bid 100x3 | ask 102x3
[Trade[buyId=3, sellId=5, price=100, qty=3]]
bid - | ask 99x1
traded=10 resting=4 submitted=24
conservation: true
orders=8000 trades>0: true
conservation: true
crossed: false
accepted=50 rejected=50
conservation: true
\`\`\`

> [!NOTE]
> Ідентифікатори ордерів видає один глобальний лічильник, тож у виводі етапу 2 вони починаються з 1 лише тоді, коли до цього не створювалося жодного \`Order\`. Етап 1 ордерів не створює.
`
    },
    {
      title: "Етап 1: Гонка даних і атомарні змінні (1 б.)",
      content: `
\`\`\`java
public final class Counters {
    public static long unsafeCount(int threads, int perThread) throws InterruptedException;
    public static long atomicCount(int threads, int perThread) throws InterruptedException;
}
\`\`\`

* Обидва методи запускають \`threads\` платформних потоків (\`new Thread\` / \`Thread.ofPlatform()\`), кожен з яких \`perThread\` разів збільшує спільний лічильник. Повертають підсумкове значення після \`join\` усіх потоків.
* \`unsafeCount\`: звичайне поле \`long\` (у статичному вкладеному класі-тримачі) і \`counter++\`.
* \`atomicCount\`: \`AtomicLong.incrementAndGet()\` (або \`LongAdder\`).

Запустіть \`unsafeCount\` кілька разів і запишіть результати в коментарі в коді. Поясніть у коментарі, **чому** вони різні і менші за 800 000.

> [!TIP]
> Якщо \`unsafeCount\` випадково дає рівно 800 000, збільште \`perThread\` або кількість потоків. Гонка не гарантує помилки — вона лише робить її можливою. Тому баги конкурентності такі підступні.
`
    },
    {
      title: "Етап 2: Стакан і зіставлення ордерів (3 б.)",
      content: `
\`\`\`java
public enum Side { BUY, SELL }

public record Order(long id, Side side, String trader, long price, int qty) {
    public static Order create(Side side, String trader, long price, int qty);   // id з AtomicLong від 1
    // qty <= 0 або price <= 0 -> IllegalArgumentException
}

public record Trade(long buyId, long sellId, long price, int qty) { }

public record BookSnapshot(Long bestBid, int bidQty, Long bestAsk, int askQty) {
    public boolean crossed();         // обидві сторони є і bestBid >= bestAsk
    @Override public String toString();   // "bid 100x3 | ask 101x5"; порожня сторона — "-"
}

public class OrderBook {
    public List<Trade> submit(Order o);
    public BookSnapshot snapshot();   // bidQty/askQty — сума qty на НАЙКРАЩОМУ рівні
}
\`\`\`

### Правила зіставлення (price-time priority)

1. Ордер **BUY** з ціною P зіставляється з ордерами SELL, ціна яких **≤ P**, починаючи з найнижчої. Ордер **SELL** — з BUY, ціна яких **≥ P**, починаючи з найвищої.
2. На одному рівні ціни — у порядку надходження (FIFO, \`ArrayDeque\`).
3. Угода виконується за ціною **ордера, що вже стояв у стакані** (resting order), в обсязі \`min(qty1, qty2)\`.
4. Частково виконаний ордер у стакані лишається на своєму місці в черзі з меншою кількістю. Оскільки \`Order\` — record, замініть його на копію з новим \`qty\`: \`deque.pollFirst()\` + \`offerFirst(...)\`.
5. Невиконаний залишок нового ордера стає в стакан на свою сторону за своєю ціною.
6. Порожні рівні цін треба видаляти з мапи.

> [!IMPORTANT]
> Пройдіть приклад з \`Main\` на папері: dan купує 7 за ціною до 102 → 5 у ann за 101, потім 2 у bob за 102; у bob лишається 3. Далі eve продає 4 за ціною від 99 → 3 у cid за 100, і залишок 1 стає в стакан як ask 99.
`
    },
    {
      title: "Етап 3: Потокобезпечність та інваріанти (2 б.)",
      content: `
1. Захистіть \`OrderBook\` одним \`ReentrantReadWriteLock\`: \`submit\` — під write-lock, \`snapshot\` і методи нижче — під read-lock.
2. Додайте облік (лічильники змінюються **всередині** критичної секції \`submit\`):

\`\`\`java
public long submittedQty();   // сума qty усіх поданих ордерів
public long tradedQty();      // сума qty усіх угод
public long restingQty();     // сума qty усіх ордерів у стакані зараз
public boolean checkInvariants();
\`\`\`

\`checkInvariants()\` перевіряє:

* **закон збереження**: \`submittedQty == 2 * tradedQty + restingQty\` (кожна угода «з'їдає» однакову кількість з обох боків);
* стакан не перехрещений (\`!snapshot().crossed()\`);
* у мапах немає порожніх рівнів.

> [!WARNING]
> \`checkInvariants\` має бачити **узгоджений** стан: усі три лічильники й мапи треба читати під **одним** read-lock, а не викликати три окремі синхронізовані методи. Інакше між викликами може проскочити \`submit\` з іншого потоку.
`
    },
    {
      title: "Етап 4: Симуляція трейдерів (2 б.)",
      content: `
\`\`\`java
public final class Simulation {
    public record Result(int orders, long trades) { }
    public static Result run(OrderBook book, int traders, int ordersPerTrader, long seed) throws InterruptedException;
}
\`\`\`

* Пул \`Executors.newFixedThreadPool(traders)\`. Кожен трейдер — окрема задача, яка подає \`ordersPerTrader\` випадкових ордерів: сторона 50/50, ціна з [95, 105], кількість з [1, 10].
* Кожен трейдер має **власний** \`new Random(seed + traderIndex)\`: \`Random\` не варто використовувати спільно з багатьох потоків (це повільно, а відтворюваність губиться).
* Усі трейдери стартують **одночасно** за сигналом \`CountDownLatch(1)\`.
* Кількість угод рахуйте через \`LongAdder\` (сума розмірів списків, які повертає \`submit\`).
* Задачі подавайте через \`submit\`, і після завершення викличте \`get()\` для кожного \`Future\`, щоб винятки з потоків не зникли.

> [!TIP]
> Перевірте себе: тимчасово приберіть замки з \`OrderBook\` і запустіть симуляцію кілька разів. Як швидко \`checkInvariants\` поверне \`false\` (або вилетить \`NullPointerException\`/\`ConcurrentModificationException\` з \`TreeMap\`)?
`
    },
    {
      title: "Етап 5: Асинхронна перевірка ризиків (2 б.)",
      content: `
\`\`\`java
public class RiskService {
    public RiskService(int maxQty, Executor executor);
    public CompletableFuture<Boolean> check(Order o);            // асинхронно: o.qty() <= maxQty
    public CompletableFuture<Boolean> submitChecked(OrderBook book, Order o);
}
\`\`\`

* \`check\` імітує звернення до зовнішнього сервісу: \`supplyAsync(..., executor)\` з затримкою 5–20 мс (\`Thread.sleep\` тут **дозволено**: це симуляція мережі, а не синхронізація).
* \`submitChecked\`: якщо перевірка успішна — подає ордер у стакан і завершується \`true\`, інакше нічого не подає і завершується \`false\`. Використайте \`thenApply\` (подумайте, чому тут не потрібен \`thenCompose\`).
* Додайте тайм-аут: \`orTimeout(1, TimeUnit.SECONDS)\`, а після тайм-ауту ордер вважається відхиленим (\`exceptionally(ex -> false)\`).

> [!NOTE]
> Віртуальні потоки (\`newVirtualThreadPerTaskExecutor\`, Java 21) ідеальні для таких задач: 100 одночасних «мережевих викликів» не займають 100 потоків ОС. На Java 17 використайте \`Executors.newCachedThreadPool()\`.

Закомітьте, позначте тегом \`lab08\` і запуште.
`
    }
  ],
  quiz: [
    {
      question: "Чому counter++ з восьми потоків дає менше за очікуване значення?",
      options: [
        "Через повільний процесор",
        "++ складається з читання, додавання і запису; потоки перезаписують оновлення одне одного (lost update)",
        "Через збирач сміття",
        "Через переповнення long"
      ],
      answer: 1,
      explanation: "Без атомарності чи блокування два потоки можуть прочитати те саме значення і записати однаковий результат."
    },
    {
      question: "За якою ціною виконується угода, коли новий BUY за 102 зустрічає SELL, що стоїть за 101?",
      options: ["102", "101", "101.5", "За ціною останньої угоди"],
      answer: 1,
      explanation: "Угода виконується за ціною ордера, що вже стояв у стакані: покупець погодився на «до 102», а продавець виставив 101."
    },
    {
      question: "Чому checkInvariants має читати всі лічильники під одним read-lock?",
      options: [
        "Так швидше",
        "Щоб отримати узгоджений знімок: між окремими викликами інший потік може змінити частину стану",
        "Read-lock не потрібен",
        "Щоб уникнути взаємоблокування"
      ],
      answer: 1,
      explanation: "Кожен виклик окремо потокобезпечний, але їх послідовність — ні (та сама проблема, що й з check-then-act)."
    },
    {
      question: "Чому кожен трейдер має власний Random(seed + i), а не спільний?",
      options: [
        "Random не можна створити двічі",
        "Спільний Random синхронізується на кожному виклику (повільно), а порядок отримання чисел залежить від планувальника, тож симуляція не відтворюється",
        "Так вимагає ExecutorService",
        "Різниці немає"
      ],
      answer: 1,
      explanation: "Для багатопотокового коду є ThreadLocalRandom, а коли потрібна відтворюваність, кожен потік отримує свій генератор із власним seed."
    }
  ]
};
