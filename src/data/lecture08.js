export const lecture08 = {
  id: "08",
  title: "Лекція 08: Javadoc, pattern matching і потоки (Thread)",
  description: "Документування коду через Javadoc (аналог XML-коментарів C#), чим замінити директиви препроцесора, сучасне зіставлення зі зразком: instanceof, switch за типом, record patterns, guard-умови. Основи багатопотоковості: Thread, Runnable, життєвий цикл потоку, join, interrupt, daemon-потоки і перші гонки даних.",
  sections: [
    {
      title: "1. Javadoc",
      content: `
Аналог XML-коментарів \`///\` у C#. Коментар \`/** ... */\` перед класом або методом потрапляє в HTML-документацію (\`javadoc\`, \`mvn javadoc:javadoc\`) і в підказки IDE.

\`\`\`java
/**
 * Рахунок у банку з підтримкою поповнень і зняття коштів.
 * <p>
 * Клас <b>не</b> є потокобезпечним.
 *
 * @author Олена Коваль
 * @since 1.2
 * @see Transaction
 */
public class Account {

    /**
     * Знімає кошти з рахунку.
     *
     * @param amount сума до зняття; має бути додатною
     * @return залишок після операції
     * @throws IllegalArgumentException якщо {@code amount <= 0}
     * @throws InsufficientFundsException якщо на рахунку недостатньо коштів
     * @see #deposit(BigDecimal)
     */
    public BigDecimal withdraw(BigDecimal amount) { ... }
}
\`\`\`

| Тег | Аналог у C# XML-doc |
| --- | --- |
| перше речення опису | \`<summary>\` |
| \`@param name\` | \`<param name="">\` |
| \`@return\` | \`<returns>\` |
| \`@throws Type\` | \`<exception cref="">\` |
| \`{@link Class#method}\` | \`<see cref=""/>\` |
| \`{@code x < y}\` | \`<c>\` |
| \`@deprecated\` | \`[Obsolete]\` + опис |

> [!TIP]
> Від Java 23 (JEP 467) можна писати Javadoc у **Markdown** через коментарі \`///\`, зовсім як у C#.
`
    },
    {
      title: "2. Препроцесора немає: чим його замінити",
      content: `
У Java немає \`#if DEBUG\`, \`#define\` чи \`#region\`. Типові задачі розв'язують інакше:

| Задача в C# | Рішення в Java |
| --- | --- |
| \`#if DEBUG ... #endif\` | \`static final boolean DEBUG = false;\` + \`if (DEBUG)\`: компілятор викине мертвий код |
| Різні конфігурації збирання | профілі Maven/Gradle, змінні середовища, \`System.getProperty("env")\` |
| \`[Conditional("DEBUG")]\` | рівні логування: \`log.debug(...)\` вимикається конфігурацією |
| \`Debug.Assert\` | \`assert x > 0 : "повідомлення";\`, працює лише з прапорцем \`java -ea\` |
| Генерація коду | процесори анотацій (лекція 14), Lombok, MapStruct |
| \`#region\` | \`// region ... // endregion\` (розуміє IntelliJ) |

\`\`\`java
public final class Config {
    public static final boolean DEBUG = Boolean.getBoolean("app.debug");  // -Dapp.debug=true
}

if (Config.DEBUG) {
    System.err.println("стан: " + state);
}

assert balance >= 0 : "баланс не може бути від'ємним: " + balance;
\`\`\`

> [!WARNING]
> \`assert\` за замовчуванням **вимкнені**. Не використовуйте їх для перевірки аргументів публічних методів: для цього є \`IllegalArgumentException\` і \`Objects.requireNonNull\`.
`
    },
    {
      title: "3. Pattern matching: instanceof і switch",
      content: `
### instanceof з прив'язкою змінної (Java 16)

\`\`\`java
// раніше
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// тепер
if (obj instanceof String s && !s.isEmpty()) {
    System.out.println(s.length());
}

if (!(obj instanceof Point p)) return;
System.out.println(p.x());          // p доступна після заперечної перевірки
\`\`\`

### switch за типом (Java 21)

\`\`\`java
static String describe(Object o) {
    return switch (o) {
        case null -> "null";                                 // без цієї гілки буде NPE
        case Integer i when i < 0 -> "від'ємне ціле";        // guard-умова (when)
        case Integer i -> "ціле " + i;
        case String s when s.isBlank() -> "порожній рядок";
        case String s -> "рядок: " + s;
        case int[] arr -> "масив довжини " + arr.length;
        default -> "невідомо: " + o.getClass().getSimpleName();
    };
}
\`\`\`

* Гілки перевіряються **по черзі**. Компілятор повідомить, якщо гілка недосяжна (наприклад, \`case Integer i\` стоїть перед \`case Integer i when ...\`).
* Відповідність C#: \`when\` ↔ \`when\`, \`case Integer i\` ↔ \`case int i\`.

### Record patterns (Java 21)

Записи можна **деконструювати** прямо в шаблоні, зокрема вкладено:

\`\`\`java
sealed interface Expr permits Num, Add, Mul, Neg { }
record Num(int value) implements Expr { }
record Add(Expr left, Expr right) implements Expr { }
record Mul(Expr left, Expr right) implements Expr { }
record Neg(Expr e) implements Expr { }

static int eval(Expr e) {
    return switch (e) {                     // default не потрібен: Expr sealed
        case Num(int v) -> v;
        case Add(Expr l, Expr r) -> eval(l) + eval(r);
        case Mul(Num(var a), Num(var b)) -> a * b;      // вкладений шаблон
        case Mul(Expr l, Expr r) -> eval(l) * eval(r);
        case Neg(Neg(var inner)) -> eval(inner);         // --x == x
        case Neg(var inner) -> -eval(inner);
    };
}

eval(new Add(new Num(2), new Mul(new Num(3), new Num(4))));   // 14
\`\`\`

Від Java 22 непотрібні компоненти можна пропускати через \`_\`: \`case Add(Num _, var r) -> ...\`.

> [!TIP]
> sealed-інтерфейс + records + switch — це ідіоматичний спосіб моделювати «один з кількох варіантів» (результат операції, команду, AST). Якщо додати новий варіант, компілятор покаже кожен switch, який треба оновити.
`
    },
    {
      title: "4. Потоки: Thread і Runnable",
      content: `
Потік (thread) — незалежна послідовність виконання з **власним стеком**, але **спільною купою** з іншими потоками процесу.

\`\`\`java
Runnable task = () -> {
    for (int i = 0; i < 3; i++) {
        System.out.println(Thread.currentThread().getName() + ": " + i);
    }
};

Thread t1 = new Thread(task, "worker-1");
Thread t2 = new Thread(task, "worker-2");
t1.start();          // запускає НОВИЙ потік
t2.start();
t1.join();           // чекаємо завершення (аналог Thread.Join у C#)
t2.join();
System.out.println("готово");
\`\`\`

Від Java 21 є фабрики: \`Thread.ofPlatform().name("w-", 0).start(task)\` і \`Thread.ofVirtual().start(task)\` (віртуальні потоки — у лекції 09).

> [!CAUTION]
> \`t.run()\` **не** створює потік, а просто викликає метод у поточному. Новий потік запускає лише \`start()\`. Повторний \`start()\` кидає \`IllegalThreadStateException\`.

### Стани потоку

\`\`\`text
NEW --start()--> RUNNABLE <--> BLOCKED (чекає на монітор synchronized)
                    |  ^
                    v  |
          WAITING / TIMED_WAITING (join, sleep, wait, park)
                    |
                    v
               TERMINATED
\`\`\`

### Daemon-потоки

\`t.setDaemon(true)\` до \`start()\`. JVM завершується, коли закінчилися всі **не-daemon** потоки, а daemon-потоки обриваються без попередження. Аналог \`IsBackground = true\` у C#.
`
    },
    {
      title: "5. Переривання потоку (interrupt)",
      content: `
Примусово зупинити потік у Java не можна: \`Thread.stop()\` видалено. Замість цього використовують **кооперативне переривання**: потік отримує прапорець і сам вирішує, як завершитися. Ідея та сама, що в \`CancellationToken\` у C#.

\`\`\`java
Thread worker = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            doSomeWork();
            Thread.sleep(500);                   // блокувальні методи реагують на interrupt
        } catch (InterruptedException e) {
            // sleep/wait/join кидають виняток І СКИДАЮТЬ прапорець
            Thread.currentThread().interrupt();  // відновлюємо прапорець
            break;
        }
    }
    System.out.println("worker завершився коректно");
});
worker.start();
Thread.sleep(2000);
worker.interrupt();       // просимо зупинитися
worker.join();
\`\`\`

> [!IMPORTANT]
> Ніколи не «ковтайте» \`InterruptedException\` порожнім \`catch\`. Або прокиньте його далі (\`throws InterruptedException\`), або відновіть прапорець через \`Thread.currentThread().interrupt()\`, інакше код вище по стеку не дізнається про запит на зупинку.
`
    },
    {
      title: "6. Перша гонка даних і synchronized",
      content: `
\`\`\`java
class Counter {
    private int value;
    void increment() { value++; }       // НЕ атомарно: прочитати, додати, записати
    int get() { return value; }
}

Counter c = new Counter();
Runnable r = () -> { for (int i = 0; i < 100_000; i++) c.increment(); };
Thread a = new Thread(r), b = new Thread(r);
a.start(); b.start(); a.join(); b.join();
System.out.println(c.get());            // очікуємо 200000, отримуємо, наприклад, 137412
\`\`\`

Обидва потоки читають те саме значення, додають 1 і записують. Одне з оновлень губиться. Це **race condition**.

### synchronized

Аналог \`lock (obj) { }\` з C#. Кожен об'єкт у Java має **монітор**: у блоці \`synchronized\` на тому самому об'єкті одночасно може перебувати лише один потік.

\`\`\`java
class Counter {
    private int value;
    synchronized void increment() { value++; }   // монітор this
    synchronized int get() { return value; }     // читання теж синхронізуємо!
}

// або блок з приватним об'єктом-замком (краще: ззовні його не захопити)
private final Object lock = new Object();
void increment() {
    synchronized (lock) { value++; }
}
\`\`\`

Для простих лічильників є \`AtomicInteger\` (\`incrementAndGet()\`), який працює без блокувань. Детально про синхронізацію та модель пам'яті Java — у лекціях 13–14.

### wait/notify — сигналізація (низький рівень)

\`\`\`java
synchronized (lock) {
    while (queue.isEmpty()) lock.wait();     // ЗАВЖДИ в циклі: можливі хибні пробудження
    item = queue.poll();
}
synchronized (lock) {
    queue.add(x);
    lock.notifyAll();
}
\`\`\`

У реальному коді замість \`wait/notify\` використовуйте \`BlockingQueue\` і класи з \`java.util.concurrent\` (лекція 14).
`
    }
  ],
  quiz: [
    {
      question: "Що робить виклик thread.run() замість thread.start()?",
      options: [
        "Запускає новий потік",
        "Виконує run() синхронно в поточному потоці, нового потоку не створюється",
        "Кидає виняток",
        "Запускає потік у фоні"
      ],
      answer: 1,
      explanation: "Новий потік ОС створює і запускає лише start(). run() — звичайний метод."
    },
    {
      question: "Чому value++ у двох потоках дає менший за очікуваний результат?",
      options: [
        "Через збирач сміття",
        "++ складається з трьох кроків (читання, додавання, запис), і потоки перезаписують оновлення одне одного",
        "int не може зберігати великі числа",
        "Потоки виконуються послідовно"
      ],
      answer: 1,
      explanation: "Це класична гонка даних. Захищайте операцію через synchronized або використовуйте AtomicInteger."
    },
    {
      question: "Як правильно обробити InterruptedException, якщо метод не може оголосити throws?",
      options: [
        "Порожній catch",
        "Відновити прапорець: Thread.currentThread().interrupt() і завершити роботу",
        "Викликати Thread.stop()",
        "Перезапустити потік"
      ],
      answer: 1,
      explanation: "Блокувальні методи скидають прапорець, коли кидають виняток. Його треба відновити, щоб код вище по стеку дізнався про запит на переривання."
    },
    {
      question: "Що виведе switch з case Integer i when i > 0 -> \"A\"; case Integer i -> \"B\"; для значення -5?",
      options: ["A", "B", "Помилка компіляції", "MatchException"],
      answer: 1,
      explanation: "Гілки перевіряються по черзі. Guard-умова першої гілки хибна, тож спрацьовує друга."
    },
    {
      question: "Чим у Java замінюють #if DEBUG?",
      options: [
        "Директивою #ifdef",
        "Константою static final boolean і звичайним if: компілятор викидає мертвий код",
        "Анотацією @Debug",
        "Ніяк"
      ],
      answer: 1,
      explanation: "Препроцесора в Java немає. Для «умовної компіляції» використовують константи часу компіляції, профілі збирання або рівні логування."
    },
    {
      question: "Що дає поєднання sealed interface + records + switch?",
      options: [
        "Швидшу роботу GC",
        "Перевірку вичерпності: компілятор вимагає обробити всі підтипи, і default стає непотрібним",
        "Можливість змінювати поля records",
        "Множинне наслідування класів"
      ],
      answer: 1,
      explanation: "Компілятор знає повний список дозволених підтипів sealed-типу, тому може перевірити, що switch охоплює всі варіанти."
    }
  ]
};
