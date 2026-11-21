export const lecture13 = {
  id: "13",
  title: "Лекція 13: Нативний код, модель пам'яті Java і ексклюзивні блокування",
  description: "Виклик бібліотек C: JNI і сучасний Linker API (аналог P/Invoke). Java Memory Model: видимість, переупорядкування, happens-before, volatile. Ексклюзивні блокування: synchronized, ReentrantLock, tryLock, Condition; атомарні змінні та CAS; взаємоблокування і як їх уникати.",
  sections: [
    {
      title: "1. Виклик нативного коду: JNI і Linker API",
      content: `
### JNI (Java Native Interface) — класичний спосіб

\`\`\`java
public class NativeMath {
    static { System.loadLibrary("nativemath"); }   // libnativemath.so / nativemath.dll
    public static native int add(int a, int b);     // реалізацію написано на C
}
\`\`\`

\`\`\`c
// згенерований заголовок + реалізація
JNIEXPORT jint JNICALL Java_NativeMath_add(JNIEnv *env, jclass cls, jint a, jint b) {
    return a + b;
}
\`\`\`

Мінуси JNI: потрібно писати і компілювати C-«клей» під кожну платформу, помилка в ньому валить JVM, а самі виклики повільні.

### Linker API (FFM, Java 22) — аналог P/Invoke

Викликати функції C-бібліотеки можна **без жодного рядка C**:

\`\`\`java
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();

// size_t strlen(const char *s);
MethodHandle strlen = linker.downcallHandle(
        stdlib.find("strlen").orElseThrow(),
        FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment cStr = arena.allocateFrom("Привіт");     // UTF-8 + '\\0'
    long len = (long) strlen.invokeExact(cStr);
    System.out.println(len);                                // 12 байтів (кирилиця = 2 байти на символ)
}
\`\`\`

\`\`\`java
// int qsort(void *base, size_t n, size_t size, int (*cmp)(const void*, const void*));
// callback з C у Java — upcallStub
MethodHandle cmp = MethodHandles.lookup().findStatic(Main.class, "compareInts",
        MethodType.methodType(int.class, MemorySegment.class, MemorySegment.class));
MemorySegment cmpPtr = linker.upcallStub(cmp,
        FunctionDescriptor.of(ValueLayout.JAVA_INT, ValueLayout.ADDRESS.withTargetLayout(ValueLayout.JAVA_INT),
                              ValueLayout.ADDRESS.withTargetLayout(ValueLayout.JAVA_INT)), arena);
\`\`\`

| C# | Java (FFM) |
| --- | --- |
| \`[DllImport("lib")]\` | \`SymbolLookup.libraryLookup("lib", arena)\` |
| \`extern\`-метод | \`MethodHandle\` з \`downcallHandle\` |
| \`[StructLayout]\` | \`MemoryLayout.structLayout\` |
| делегат як callback | \`upcallStub\` |
| \`Marshal.StringToHGlobalAnsi\` | \`arena.allocateFrom(String)\` |

> [!TIP]
> Інструмент **jextract** генерує Java-обгортки за заголовком \`.h\`, тож дескриптори не доведеться писати вручну.
`
    },
    {
      title: "2. Java Memory Model: чому потоки «не бачать» змін",
      content: `
Сучасні процесори мають кеші й буфери запису, а компілятор і JIT **переставляють інструкції**. Без синхронізації один потік може **ніколи не побачити** запис іншого.

\`\`\`java
class Worker {
    private boolean running = true;     // без volatile!

    void run() {
        while (running) { }             // JIT може перетворити на while(true)
        System.out.println("зупинився");
    }
    void stop() { running = false; }    // запис з іншого потоку може бути невидимий
}
\`\`\`

### Відношення happens-before

JMM гарантує, що дії A **видимі** для B, якщо між ними є відношення *happens-before*:

1. У межах одного потоку — порядок у програмі.
2. **Звільнення монітора** (кінець \`synchronized\`) → наступне **захоплення того самого** монітора.
3. **Запис у volatile** → наступне читання цієї змінної.
4. \`thread.start()\` → перша дія запущеного потоку.
5. Остання дія потоку → повернення з \`thread.join()\`.
6. Запис \`final\`-поля в конструкторі → будь-яке читання об'єкта, опублікованого після конструктора.
7. Транзитивність: A→B і B→C означає A→C.

### volatile

\`\`\`java
private volatile boolean running = true;   // тепер stop() гарантовано видно
\`\`\`

\`volatile\` гарантує **видимість** і забороняє переупорядкування навколо змінної, але **не робить складені операції атомарними**:

\`\`\`java
private volatile int count;
count++;          // ВСЕ ОДНО гонка: читання і запис — дві окремі дії
\`\`\`

| Потреба | Засіб |
| --- | --- |
| Прапорець «стоп» (один пише, інші читають) | \`volatile boolean\` |
| Лічильник | \`AtomicInteger\` / \`LongAdder\` |
| Інваріант із кількох полів | \`synchronized\` / \`Lock\` |
| Безпечна публікація незмінного об'єкта | \`final\`-поля |

> [!NOTE]
> \`volatile\` у Java сильніший, ніж у C#: це повний бар'єр послідовної узгодженості для цієї змінної. Аналог у C# — \`Volatile.Read\`/\`Write\` плюс \`Interlocked\` для атомарності.
`
    },
    {
      title: "3. synchronized: монітори",
      content: `
\`\`\`java
public class BankAccount {
    private final Object lock = new Object();
    private long balance;

    public void deposit(long amount) {
        synchronized (lock) {           // захоплення монітора lock
            balance += amount;
        }                               // звільнення, навіть якщо вилетів виняток
    }

    public long getBalance() {
        synchronized (lock) { return balance; }   // читання теж під замком: видимість!
    }
}
\`\`\`

* \`synchronized\` **реентерабельний**: потік, який уже тримає монітор, може захопити його повторно (наприклад, викликати інший synchronized-метод).
* \`synchronized\`-метод екземпляра блокує \`this\`, а статичний — \`Klass.class\`.
* Потік, що чекає на монітор, **не реагує на interrupt** і не може відмовитися від очікування.

> [!WARNING]
> Не синхронізуйтеся на \`this\` у публічних класах (сторонній код може взяти той самий монітор), на рядках-літералах (вони спільні через String Pool) і на обгортках на кшталт \`Integer\` (кеш). Найкраще — \`private final Object lock\`.
`
    },
    {
      title: "4. ReentrantLock і Condition",
      content: `
\`java.util.concurrent.locks.ReentrantLock\` робить те саме, що й \`synchronized\`, але має більше можливостей:

\`\`\`java
private final ReentrantLock lock = new ReentrantLock();      // new ReentrantLock(true) — fair

public void transfer(long amount) {
    lock.lock();
    try {
        balance -= amount;
    } finally {
        lock.unlock();                 // ЗАВЖДИ у finally
    }
}

// спроба без вічного очікування
if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {
    try { /* ... */ } finally { lock.unlock(); }
} else {
    System.out.println("зайнято, спробуємо пізніше");
}

lock.lockInterruptibly();              // очікування можна перервати
\`\`\`

| | \`synchronized\` | \`ReentrantLock\` |
| --- | --- | --- |
| Звільнення | автоматичне | вручну в \`finally\` |
| \`tryLock\` / тайм-аут | ні | так |
| Переривання очікування | ні | \`lockInterruptibly\` |
| Справедливість (FIFO) | ні | опціонально |
| Кілька умов очікування | одна (\`wait/notify\`) | скільки завгодно \`Condition\` |
| Аналог у C# | \`lock\` / \`Monitor\` | \`Monitor.TryEnter\`, \`SemaphoreSlim(1)\` |

### Condition — обмежений буфер

\`\`\`java
public class BoundedBuffer<T> {
    private final Deque<T> items = new ArrayDeque<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public BoundedBuffer(int capacity) { this.capacity = capacity; }

    public void put(T x) throws InterruptedException {
        lock.lock();
        try {
            while (items.size() == capacity) notFull.await();   // while, а не if!
            items.addLast(x);
            notEmpty.signal();
        } finally { lock.unlock(); }
    }

    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (items.isEmpty()) notEmpty.await();
            T x = items.removeFirst();
            notFull.signal();
            return x;
        } finally { lock.unlock(); }
    }
}
\`\`\`
`
    },
    {
      title: "5. Атомарні змінні та CAS",
      content: `
**Compare-And-Swap (CAS)** — апаратна інструкція: «якщо в комірці значення X, запиши Y», виконана атомарно. На ній побудовано неблокувальні алгоритми.

\`\`\`java
AtomicInteger counter = new AtomicInteger();
counter.incrementAndGet();                 // ++counter
counter.getAndAdd(5);                      // counter += 5, повертає старе значення
counter.updateAndGet(x -> Math.max(x, 100));
counter.compareAndSet(100, 0);             // true, якщо значення було 100

AtomicLong total = new AtomicLong();
AtomicReference<Config> config = new AtomicReference<>(initial);
config.updateAndGet(c -> c.withTimeout(30));   // функція має бути без побічних ефектів:
                                               // за конфлікту її викличуть повторно

LongAdder hits = new LongAdder();          // швидше за AtomicLong за сильної конкуренції
hits.increment();
long sum = hits.sum();
\`\`\`

Як \`updateAndGet\` працює всередині:

\`\`\`java
int prev, next;
do {
    prev = get();
    next = f.applyAsInt(prev);
} while (!compareAndSet(prev, next));      // хтось устиг змінити — пробуємо ще раз
\`\`\`

Аналог у C#: \`Interlocked.Increment\`, \`Interlocked.CompareExchange\`.
`
    },
    {
      title: "6. Взаємоблокування (deadlock)",
      content: `
\`\`\`java
void transfer(Account from, Account to, long amount) {
    synchronized (from) {
        synchronized (to) {               // потік 1: A -> B, потік 2: B -> A
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
// Потік 1 тримає A і чекає на B; потік 2 тримає B і чекає на A. Вічно.
\`\`\`

Чотири умови взаємоблокування (Коффман): взаємне виключення, утримання з очікуванням, відсутність примусового відбирання ресурсу, **циклічне очікування**. Досить порушити одну.

### Глобальний порядок блокувань

\`\`\`java
void transfer(Account from, Account to, long amount) {
    Account first  = from.id() < to.id() ? from : to;   // завжди спочатку менший id
    Account second = from.id() < to.id() ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}
\`\`\`

Інші способи: \`tryLock\` з тайм-аутом і відкатом, одне грубіше блокування, незмінні дані.

### Діагностика

\`\`\`bash
jcmd <pid> Thread.print      # дамп потоків; JVM сама повідомить "Found one Java-level deadlock"
jstack <pid>
\`\`\`

> [!TIP]
> Інші проблеми живучості: **livelock** (потоки постійно поступаються одне одному і не просуваються) і **starvation** (потік ніколи не отримує ресурс, наприклад через нечесне блокування).
`
    }
  ],
  quiz: [
    {
      question: "Що гарантує volatile?",
      options: [
        "Атомарність count++",
        "Видимість запису для інших потоків і заборону переупорядкування навколо змінної",
        "Взаємне виключення",
        "Що змінна лежить у стеку"
      ],
      answer: 1,
      explanation: "volatile не робить складені операції атомарними. Для count++ потрібен AtomicInteger або блокування."
    },
    {
      question: "Чому unlock() викликають у finally?",
      options: [
        "Так швидше",
        "Щоб замок звільнився навіть тоді, коли в критичній секції виникне виняток",
        "Цього вимагає компілятор",
        "Щоб уникнути GC"
      ],
      answer: 1,
      explanation: "На відміну від synchronized, ReentrantLock сам не звільняється. Якщо виняток вилетить до unlock(), інші потоки чекатимуть вічно."
    },
    {
      question: "Чому await()/wait() викликають у циклі while, а не в if?",
      options: [
        "Це питання стилю",
        "Можливі хибні пробудження, а умову міг уже змінити інший потік",
        "if не компілюється",
        "while швидший"
      ],
      answer: 1,
      explanation: "Після пробудження умову треба перевірити знову: її могли «забрати» інші потоки, або пробудження могло бути хибним (spurious wakeup)."
    },
    {
      question: "Два потоки переказують гроші A→B і B→A, кожен блокує спочатку from, потім to. Що може статися і як це виправити?",
      options: [
        "Нічого поганого",
        "Взаємоблокування; виправлення — блокувати рахунки в глобальному порядку (наприклад, за id)",
        "Втрата грошей; виправлення — volatile",
        "Переповнення стеку"
      ],
      answer: 1,
      explanation: "Циклічне очікування — одна з чотирьох умов взаємоблокування. Єдиний порядок захоплення замків розриває цикл."
    },
    {
      question: "Чим Linker API (FFM) кращий за JNI?",
      options: [
        "Він працює лише на Linux",
        "Не потребує написання та компіляції C-«клею»: функцію описує Java-дескриптор, як у P/Invoke",
        "Він повільніший, зате безпечніший",
        "Він дозволяє викликати лише Java-код"
      ],
      answer: 1,
      explanation: "downcallHandle будує MethodHandle до нативної функції прямо в Java. JNI вимагає окремої C-бібліотеки під кожну платформу."
    }
  ]
};
