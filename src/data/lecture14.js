export const lecture14 = {
  id: "14",
  title: "Лекція 14: Спільні блокування, сигналізація, конкурентні колекції та процесори анотацій",
  description: "ReadWriteLock і StampedLock; примітиви сигналізації: CountDownLatch, CyclicBarrier, Semaphore, Phaser; конкурентні колекції: ConcurrentHashMap, BlockingQueue, CopyOnWriteArrayList; ThreadLocal; генерація коду під час компіляції процесорами анотацій (аналог source generators у C#).",
  sections: [
    {
      title: "1. ReadWriteLock — багато читачів, один записувач",
      content: `
Якщо дані часто читають і рідко змінюють, звичайний замок зайво серіалізує читачів. \`ReadWriteLock\` дозволяє **багатьом читачам** працювати одночасно, а **записувачу** — лише одному і без читачів. Аналог \`ReaderWriterLockSlim\` у C#.

\`\`\`java
public class Cache<K, V> {
    private final Map<K, V> map = new HashMap<>();
    private final ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
    private final Lock read = rw.readLock();
    private final Lock write = rw.writeLock();

    public V get(K key) {
        read.lock();
        try { return map.get(key); }
        finally { read.unlock(); }
    }

    public void put(K key, V value) {
        write.lock();
        try { map.put(key, value); }
        finally { write.unlock(); }
    }
}
\`\`\`

> [!WARNING]
> **Підвищити** read-lock до write-lock не можна: якщо, тримаючи read, викликати \`write.lock()\`, потік заблокує сам себе. **Знизити** можна: захопити read, тримаючи write, а потім звільнити write.

### StampedLock — оптимістичне читання

\`\`\`java
public class Point {
    private double x, y;
    private final StampedLock sl = new StampedLock();

    public double distanceFromOrigin() {
        long stamp = sl.tryOptimisticRead();    // без блокування!
        double cx = x, cy = y;
        if (!sl.validate(stamp)) {              // хтось писав за цей час
            stamp = sl.readLock();
            try { cx = x; cy = y; }
            finally { sl.unlockRead(stamp); }
        }
        return Math.hypot(cx, cy);
    }

    public void move(double dx, double dy) {
        long stamp = sl.writeLock();
        try { x += dx; y += dy; }
        finally { sl.unlockWrite(stamp); }
    }
}
\`\`\`

\`StampedLock\` **не реентерабельний** і не підтримує \`Condition\`. Використовуйте його, лише коли профілювання покаже, що \`ReadWriteLock\` справді заважає.
`
    },
    {
      title: "2. Примітиви сигналізації",
      content: `
### CountDownLatch — «дочекатися N подій»

Одноразовий лічильник: \`await()\` блокується, доки інші потоки не викличуть \`countDown()\` N разів. Аналог \`CountdownEvent\` у C#.

\`\`\`java
CountDownLatch ready = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    int id = i;
    pool.submit(() -> {
        loadPart(id);
        ready.countDown();
    });
}
ready.await();                         // або await(5, TimeUnit.SECONDS)
System.out.println("усі частини завантажено");
\`\`\`

### CyclicBarrier — «зустріч» N потоків, багаторазово

\`\`\`java
CyclicBarrier barrier = new CyclicBarrier(4, () -> System.out.println("крок завершено"));
for (int w = 0; w < 4; w++) {
    pool.submit(() -> {
        for (int step = 0; step < 10; step++) {
            computeMyPart(step);
            barrier.await();           // чекаємо інших; дію бар'єра виконує останній потік
        }
        return null;
    });
}
\`\`\`

Аналог у C# — \`Barrier\`. Корисно для ітеративних симуляцій (гра «Життя», методи скінченних різниць), де крок k+1 потребує результатів усіх потоків з кроку k.

### Semaphore — обмеження кількості одночасних доступів

\`\`\`java
Semaphore permits = new Semaphore(3);         // не більше 3 одночасних з'єднань
void callApi() throws InterruptedException {
    permits.acquire();
    try { http.send(...); }
    finally { permits.release(); }
}
\`\`\`

Аналог \`SemaphoreSlim\`. Семафор не має власника: \`release()\` може викликати будь-який потік.

### Phaser і Exchanger

* \`Phaser\` — гнучкий бар'єр зі змінною кількістю учасників (\`register\`, \`arriveAndDeregister\`).
* \`Exchanger<T>\` — два потоки обмінюються об'єктами в точці зустрічі.

| Задача | Інструмент |
| --- | --- |
| Головний потік чекає на N робітників | \`CountDownLatch\` |
| N потоків синхронізуються на кожному кроці | \`CyclicBarrier\` / \`Phaser\` |
| Обмежити паралельність | \`Semaphore\` |
| Передавати дані між потоками | \`BlockingQueue\` |
| Чекати на результат задачі | \`Future\` / \`CompletableFuture\` |
`
    },
    {
      title: "3. Конкурентні колекції",
      content: `
\`Collections.synchronizedMap(map)\` обгортає **кожен** метод одним замком. Складені дії («перевірити — покласти») все одно не атомарні, а під час ітерації колекцію треба блокувати вручну. Пакет \`java.util.concurrent\` пропонує кращі рішення.

### ConcurrentHashMap

\`\`\`java
ConcurrentHashMap<String, LongAdder> hits = new ConcurrentHashMap<>();

// атомарні складені операції
hits.computeIfAbsent(url, k -> new LongAdder()).increment();
counts.merge(word, 1, Integer::sum);
map.putIfAbsent(key, value);
map.compute(key, (k, v) -> v == null ? 1 : v + 1);

// ПОМИЛКА: гонка між get і put
if (!map.containsKey(k)) map.put(k, v);
\`\`\`

* Блокування дрібнозернисте (на рівні кошика), а читання майже завжди без блокувань.
* Ітератори **слабо узгоджені** (weakly consistent): не кидають \`ConcurrentModificationException\`, але можуть не побачити зміни, зроблені під час обходу.
* \`null\` як ключ чи значення **заборонений**.
* Паралельні масові операції: \`map.forEach(1000, (k, v) -> ...)\`, \`reduceValues\`, \`search\`.

Аналог — \`ConcurrentDictionary\` (\`GetOrAdd\` ↔ \`computeIfAbsent\`, \`AddOrUpdate\` ↔ \`merge\`).

### BlockingQueue — виробник/споживач

\`\`\`java
BlockingQueue<Order> queue = new ArrayBlockingQueue<>(100);   // обмежена черга

// виробник
queue.put(order);                       // блокується, якщо черга повна
queue.offer(order, 1, TimeUnit.SECONDS);

// споживач
while (!Thread.currentThread().isInterrupted()) {
    Order o = queue.take();             // блокується, якщо черга порожня
    process(o);
}
\`\`\`

| Реалізація | Особливість |
| --- | --- |
| \`ArrayBlockingQueue\` | обмежена, на масиві |
| \`LinkedBlockingQueue\` | опційно обмежена |
| \`PriorityBlockingQueue\` | з пріоритетами, необмежена |
| \`DelayQueue\` | елемент доступний після затримки |
| \`SynchronousQueue\` | без буфера: передача «з рук у руки» |

Аналог — \`BlockingCollection<T>\` / \`Channel<T>\` у .NET.

> [!TIP]
> Щоб зупинити споживачів, використовують **отруйну пігулку** (poison pill): спеціальний об'єкт-маркер, побачивши який, споживач завершує роботу.

### Інші

* \`CopyOnWriteArrayList\` — кожна зміна копіює масив. Ідеальний, коли читань багато, а змін мало (списки слухачів).
* \`ConcurrentLinkedQueue\` / \`ConcurrentLinkedDeque\` — неблокувальні черги на CAS.
* \`ConcurrentSkipListMap\` / \`Set\` — відсортовані конкурентні колекції (замість \`TreeMap\`).
`
    },
    {
      title: "4. ThreadLocal",
      content: `
Окрема копія змінної для кожного потоку. Аналог \`ThreadLocal<T>\` / \`[ThreadStatic]\` у C#.

\`\`\`java
private static final ThreadLocal<SimpleDateFormat> FMT =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));   // SimpleDateFormat не потокобезпечний

String s = FMT.get().format(date);
\`\`\`

Типове застосування — контекст запиту (id користувача, транзакція, MDC у логуванні, лекція 19).

> [!WARNING]
> У пулах потоки живуть довго. Якщо не викликати \`remove()\`, значення «перетече» в наступну задачу і створить витік пам'яті. Шаблон: \`try { CTX.set(x); ... } finally { CTX.remove(); }\`. Для віртуальних потоків замість \`ThreadLocal\` призначені **ScopedValue** (Java 25).
`
    },
    {
      title: "5. Процесори анотацій — генерація коду під час компіляції",
      content: `
У C# є **source generators**. Їхній аналог у Java — **процесори анотацій** (JSR 269). Компілятор \`javac\` викликає їх під час компіляції, вони аналізують анотований код і можуть **генерувати нові файли**: класи, ресурси. На цьому побудовано Lombok, MapStruct, Dagger, AutoValue і Micronaut.

\`\`\`java
@Retention(RetentionPolicy.SOURCE)        // анотація потрібна лише компілятору
@Target(ElementType.TYPE)
public @interface GenerateBuilder { }

@GenerateBuilder
public class User {
    String name;
    int age;
}
\`\`\`

\`\`\`java
@SupportedAnnotationTypes("pl.mini.GenerateBuilder")
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class BuilderProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment env) {
        for (Element e : env.getElementsAnnotatedWith(GenerateBuilder.class)) {
            if (e.getKind() != ElementKind.CLASS) {
                processingEnv.getMessager().printMessage(
                        Diagnostic.Kind.ERROR, "@GenerateBuilder лише для класів", e);
                continue;
            }
            TypeElement type = (TypeElement) e;
            String pkg = processingEnv.getElementUtils().getPackageOf(type).toString();
            String name = type.getSimpleName() + "Builder";

            List<VariableElement> fields = ElementFilter.fieldsIn(type.getEnclosedElements());
            try (Writer w = processingEnv.getFiler()
                    .createSourceFile(pkg + "." + name, type).openWriter()) {
                w.write(generateSource(pkg, name, type, fields));   // звичайний текст Java
            } catch (IOException ex) {
                processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR, ex.getMessage());
            }
        }
        return true;
    }
}
\`\`\`

Реєстрація: файл \`META-INF/services/javax.annotation.processing.Processor\` з повною назвою класу процесора. Процесор пакується в окремий JAR і підключається через \`annotationProcessorPaths\` у Maven або \`annotationProcessor\` у Gradle.

### Обмеження

* Стандартний API дозволяє **лише створювати нові файли**, а не змінювати існуючі класи. Lombok обходить це хаком з внутрішнім API компілятора.
* Обробка йде **раундами**: згенерований код теж проходить через процесори.
* Процесор бачить модель коду (\`Element\`, \`TypeMirror\`), а не дерево виразів усередині методів.

| | C# Source Generators | Java Annotation Processors |
| --- | --- | --- |
| Коли працює | під час компіляції | під час компіляції |
| Змінює наявний код | ні (partial-класи) | ні |
| Тригер | будь-який синтаксис | анотації |
| Видимість у тілах методів | так (Roslyn) | ні |
`
    }
  ],
  quiz: [
    {
      question: "Чому if (!map.containsKey(k)) map.put(k, v) некоректний для ConcurrentHashMap?",
      options: [
        "ConcurrentHashMap не має containsKey",
        "Між перевіркою і вставкою інший потік може вставити той самий ключ; потрібна атомарна операція putIfAbsent або computeIfAbsent",
        "put кидає виняток",
        "Це коректний код"
      ],
      answer: 1,
      explanation: "Кожен метод окремо потокобезпечний, але їх послідовність — ні. Використовуйте атомарні складені операції."
    },
    {
      question: "Який примітив обрати, щоб головний потік дочекався завершення ініціалізації трьох сервісів?",
      options: ["Semaphore(3)", "CountDownLatch(3)", "ReentrantLock", "Exchanger"],
      answer: 1,
      explanation: "Кожен сервіс викликає countDown(), а головний потік чекає в await(), доки лічильник не дійде до нуля."
    },
    {
      question: "Що станеться, якщо потік, який тримає read-lock ReentrantReadWriteLock, викличе writeLock().lock()?",
      options: [
        "Блокування підвищиться до запису",
        "Потік заблокує сам себе: записувач чекає, доки звільняться всі читачі, зокрема він сам",
        "Виняток IllegalMonitorStateException",
        "Read-lock звільниться автоматично"
      ],
      answer: 1,
      explanation: "Підвищення (upgrade) не підтримується. Спочатку треба звільнити read-lock, а потім захопити write-lock і повторно перевірити умову."
    },
    {
      question: "Що робить BlockingQueue.take() на порожній черзі?",
      options: [
        "Повертає null",
        "Кидає NoSuchElementException",
        "Блокує потік, доки не з'явиться елемент",
        "Повертає Optional.empty()"
      ],
      answer: 2,
      explanation: "take/put блокуються, poll/offer повертають null/false або чекають до тайм-ауту. Так легко реалізувати патерн «виробник — споживач»."
    },
    {
      question: "Що можуть процесори анотацій зі стандартного API?",
      options: [
        "Змінювати байт-код наявних класів",
        "Генерувати нові вихідні файли та повідомляти про помилки компіляції",
        "Працювати під час виконання програми",
        "Змінювати тіла методів"
      ],
      answer: 1,
      explanation: "Через Filer процесор створює нові файли, а через Messager виводить попередження й помилки. Змінювати наявний код стандартний API не дозволяє."
    }
  ]
};
