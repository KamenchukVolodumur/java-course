export const lecture07 = {
  id: "07",
  title: "Лекція 07: Керування ресурсами, анотації, рефлексія та модулі",
  description: "AutoCloseable і try-with-resources (аналог IDisposable/using), Cleaner замість фіналізаторів, власні анотації та їх обробка під час виконання, Reflection API, динамічні проксі, завантажувачі класів, JAR і модульна система JPMS.",
  sections: [
    {
      title: "1. AutoCloseable і try-with-resources",
      content: `
GC звільняє лише **пам'ять**. Файли, сокети, з'єднання з БД і блокування треба звільняти явно. У C# для цього є \`IDisposable\` + \`using\`, у Java — \`AutoCloseable\` + **try-with-resources**.

\`\`\`java
public class Connection implements AutoCloseable {
    private final String name;
    private boolean closed;

    public Connection(String name) {
        this.name = name;
        System.out.println("відкрито " + name);
    }

    public void send(String msg) {
        if (closed) throw new IllegalStateException("з'єднання закрите");
        System.out.println(name + " <- " + msg);
    }

    @Override
    public void close() {                 // має бути ідемпотентним
        if (closed) return;
        closed = true;
        System.out.println("закрито " + name);
    }
}

try (var a = new Connection("A"); var b = new Connection("B")) {
    a.send("hi");
    throw new RuntimeException("бум");
} catch (RuntimeException e) {
    System.out.println("перехоплено: " + e.getMessage());
}
// відкрито A, відкрито B, A <- hi, закрито B, закрито A, перехоплено: бум
\`\`\`

* Ресурси закриваються у **зворотному** порядку і **до** виконання \`catch\`/\`finally\`.
* Якщо \`close()\` теж кидає виняток, він не губиться, а додається до основного як *suppressed*.
* \`Closeable\` (з \`java.io\`) — це підінтерфейс \`AutoCloseable\`, чий \`close()\` кидає \`IOException\`.
* Від Java 9 можна використати вже наявну effectively final змінну: \`try (conn) { ... }\`.

### Що було до Java 7

\`\`\`java
InputStream in = null;
try {
    in = new FileInputStream("x");
    // ...
} finally {
    if (in != null) {
        try { in.close(); } catch (IOException ignored) { }   // виняток з close() губився
    }
}
\`\`\`

### Фіналізатори і Cleaner

\`Object.finalize()\` (аналог деструктора \`~Class()\` у C#) **застарів** і буде видалений: невідомо, коли і чи взагалі він виконається. Як «страховку» на випадок, коли програміст забув викликати \`close()\`, використовують \`java.lang.ref.Cleaner\`:

\`\`\`java
public class NativeBuffer implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();
    private final Cleaner.Cleanable cleanable;

    private record State(long address) implements Runnable {   // НЕ тримає посилання на NativeBuffer
        public void run() { freeNative(address); }
    }

    public NativeBuffer(long size) {
        this.cleanable = CLEANER.register(this, new State(allocNative(size)));
    }

    @Override public void close() { cleanable.clean(); }   // виконається рівно один раз
}
\`\`\`
`
    },
    {
      title: "2. Анотації",
      content: `
Анотації — це метадані, прикріплені до класів, методів, полів і параметрів. Аналог **атрибутів** у C# (\`[Obsolete]\`).

### Вбудовані анотації

| Анотація | Значення |
| --- | --- |
| \`@Override\` | компілятор перевіряє, що метод справді перевизначає батьківський |
| \`@Deprecated(since = "2.0", forRemoval = true)\` | застарілий елемент |
| \`@SuppressWarnings("unchecked")\` | вимкнути попередження |
| \`@FunctionalInterface\` | перевірка, що абстрактний метод рівно один |
| \`@SafeVarargs\` | generic varargs безпечні |

### Оголошення власної анотації

\`\`\`java
@Retention(RetentionPolicy.RUNTIME)       // доступна через рефлексію під час виконання
@Target(ElementType.METHOD)               // де можна поставити
public @interface Test {
    String name() default "";             // "параметри" — це методи
    long timeoutMs() default 1000;
    Class<? extends Throwable> expected() default None.class;

    final class None extends Throwable { }
}

public class CalculatorTests {
    @Test(name = "додавання")
    void add() { assert 2 + 2 == 4; }

    @Test(expected = ArithmeticException.class)
    void divByZero() { int x = 1 / 0; }
}
\`\`\`

### Retention

| Політика | Де живе | Використання |
| --- | --- | --- |
| \`SOURCE\` | лише у вихідному коді | \`@Override\`, Lombok, процесори анотацій |
| \`CLASS\` (за замовчуванням) | у \`.class\`, але не видна рефлексії | інструменти байт-коду |
| \`RUNTIME\` | доступна під час виконання | JUnit, Spring, Jackson, JPA |

Типи параметрів анотації обмежені: примітиви, \`String\`, \`Class\`, enum, інші анотації і масиви цих типів. Якщо параметр називається \`value\`, його ім'я можна не писати: \`@Table("users")\`.

> [!TIP]
> \`@Repeatable\` дозволяє ставити ту саму анотацію кілька разів, а \`@Inherited\` — успадковувати анотацію класу в підкласах.
`
    },
    {
      title: "3. Reflection API",
      content: `
Рефлексія дозволяє під час виконання досліджувати й використовувати класи, яких ви не знали під час компіляції. На ній побудовані JUnit, Spring, Hibernate і серіалізатори.

### Отримання Class<?>

\`\`\`java
Class<String> c1 = String.class;                 // літерал класу (аналог typeof)
Class<?> c2 = "abc".getClass();                  // з об'єкта (аналог GetType())
Class<?> c3 = Class.forName("java.util.ArrayList");   // за повною назвою
\`\`\`

### Огляд класу

\`\`\`java
Class<?> c = Person.class;
c.getName(); c.getSimpleName(); c.getPackageName();
c.getSuperclass(); c.getInterfaces();
Modifier.isAbstract(c.getModifiers());
c.isRecord(); c.isEnum(); c.isInterface();

for (Field f : c.getDeclaredFields()) {          // усі поля ЦЬОГО класу (включно з private)
    System.out.println(f.getType().getSimpleName() + " " + f.getName());
}
for (Method m : c.getMethods()) { }              // лише public, включно з успадкованими
c.getDeclaredMethods();                          // усі методи цього класу
c.getDeclaredConstructors();
c.getRecordComponents();                         // компоненти record
\`\`\`

### Створення об'єктів, виклик методів, доступ до полів

\`\`\`java
Class<?> c = Class.forName("pl.mini.plugins.HelloPlugin");
Object obj = c.getDeclaredConstructor().newInstance();   // конструктор без параметрів

Method m = c.getMethod("greet", String.class);           // назва + типи параметрів
Object result = m.invoke(obj, "Світ");

Field f = c.getDeclaredField("counter");
f.setAccessible(true);                                   // обійти private
f.setInt(obj, 42);

Method staticM = Math.class.getMethod("max", int.class, int.class);
staticM.invoke(null, 3, 7);                              // null для static
\`\`\`

### Читання анотацій: міні-JUnit

\`\`\`java
static void runTests(Class<?> testClass) throws Exception {
    Object instance = testClass.getDeclaredConstructor().newInstance();
    for (Method m : testClass.getDeclaredMethods()) {
        Test t = m.getAnnotation(Test.class);
        if (t == null) continue;
        String name = t.name().isEmpty() ? m.getName() : t.name();
        try {
            m.setAccessible(true);
            m.invoke(instance);
            System.out.println(t.expected() == Test.None.class ? "✓ " + name : "✗ " + name + " (немає винятку)");
        } catch (InvocationTargetException e) {          // виняток з тесту загорнуто!
            Throwable cause = e.getCause();
            boolean ok = t.expected().isInstance(cause);
            System.out.println((ok ? "✓ " : "✗ ") + name + " -> " + cause);
        }
    }
}
\`\`\`

> [!IMPORTANT]
> \`Method.invoke\` загортає будь-який виняток, кинутий викликаним методом, в \`InvocationTargetException\`. Справжня причина лежить у \`getCause()\`. Аналог у C# — \`TargetInvocationException\`.

> [!WARNING]
> Рефлексія повільніша за прямий виклик, обходить перевірки компілятора і ламається під час рефакторингу (назви методів — це рядки). Використовуйте її в інфраструктурному коді (фреймворки, плагіни), а не в бізнес-логіці.
`
    },
    {
      title: "4. Динамічні проксі та MethodHandle",
      content: `
\`java.lang.reflect.Proxy\` створює під час виконання об'єкт, який реалізує задані інтерфейси і передає всі виклики в \`InvocationHandler\`. Так працюють Spring AOP (\`@Transactional\`), Mockito і клієнти Retrofit.

\`\`\`java
@SuppressWarnings("unchecked")
static <T> T timed(T target, Class<T> iface) {
    return (T) Proxy.newProxyInstance(
            iface.getClassLoader(),
            new Class<?>[]{iface},
            (proxy, method, args) -> {
                long start = System.nanoTime();
                try {
                    return method.invoke(target, args);
                } catch (InvocationTargetException e) {
                    throw e.getCause();                 // прокинути справжній виняток
                } finally {
                    System.out.printf("%s: %d мкс%n", method.getName(),
                            (System.nanoTime() - start) / 1000);
                }
            });
}

List<String> list = timed(new ArrayList<>(), List.class);
list.add("x");          // add: 12 мкс
\`\`\`

> [!NOTE]
> JDK-проксі працюють **лише з інтерфейсами**. Для класів бібліотеки на кшталт ByteBuddy генерують підкласи на льоту.

### MethodHandle

Швидша альтернатива рефлексії (\`java.lang.invoke\`): права доступу перевіряються один раз, під час пошуку, і JIT може вбудувати такий виклик.

\`\`\`java
MethodHandle h = MethodHandles.lookup()
        .findVirtual(String.class, "repeat", MethodType.methodType(String.class, int.class));
String s = (String) h.invokeExact("ab", 3);    // "ababab"
\`\`\`
`
    },
    {
      title: "5. Завантажувачі класів і JAR — «збірки» Java",
      content: `
Аналог .NET-збірки (\`.dll\`) — **JAR**: ZIP-архів із \`.class\`-файлами, ресурсами та \`META-INF/MANIFEST.MF\`.

\`\`\`bash
jar --create --file app.jar --main-class pl.mini.App -C target/classes .
java -jar app.jar
java -cp "app.jar:libs/*" pl.mini.App      # classpath (на Windows роздільник ;)
\`\`\`

### ClassLoader

Класи завантажуються **ліниво**, коли вперше знадобляться. Ієрархія завантажувачів:

1. **Bootstrap** — ядро JDK (\`java.base\`).
2. **Platform** — решта модулів JDK.
3. **Application (System)** — ваш classpath.

Завантажувач спочатку **делегує** запит батькові, і лише якщо той не знайде клас, шукає сам. Клас ідентифікується парою *(назва, завантажувач)*: той самий \`.class\`, завантажений двома різними завантажувачами, дає два **різні** класи.

### Завантаження плагінів під час виконання

\`\`\`java
Path pluginsDir = Path.of("plugins");
URL[] urls;
try (Stream<Path> s = Files.list(pluginsDir)) {
    urls = s.filter(p -> p.toString().endsWith(".jar"))
            .map(p -> { try { return p.toUri().toURL(); } catch (MalformedURLException e) { throw new RuntimeException(e); } })
            .toArray(URL[]::new);
}

try (var loader = new URLClassLoader(urls, App.class.getClassLoader())) {
    // спосіб 1: рефлексія за назвою класу
    Class<?> c = loader.loadClass("com.example.MyPlugin");
    Plugin p = (Plugin) c.getDeclaredConstructor().newInstance();

    // спосіб 2 (рекомендований): ServiceLoader
    for (Plugin plugin : ServiceLoader.load(Plugin.class, loader)) {
        plugin.execute();
    }
}
\`\`\`

\`ServiceLoader\` знаходить реалізації за файлом \`META-INF/services/pl.mini.Plugin\` (у ньому повна назва класу-реалізації) або за директивою \`provides\` у \`module-info.java\`.

### Ресурси всередині JAR

\`\`\`java
try (InputStream in = App.class.getResourceAsStream("/config/default.json")) {
    String json = new String(in.readAllBytes(), StandardCharsets.UTF_8);
}
\`\`\`
`
    },
    {
      title: "6. Модулі JPMS (Java 9)",
      content: `
Модуль — це набір пакетів із явно оголошеними **залежностями** та **експортованими** пакетами. Він вирішує проблеми classpath: конфлікти класів, відсутність інкапсуляції між JAR-файлами («JAR hell»).

\`\`\`java
// src/main/java/module-info.java
module pl.mini.shop {
    requires java.net.http;                  // залежність від модуля
    requires transitive pl.mini.model;       // ті, хто залежить від нас, теж отримають model
    exports pl.mini.shop.api;                // публічний API модуля
    exports pl.mini.shop.spi to pl.mini.plugins;   // експорт лише конкретному модулю
    opens pl.mini.shop.dto to com.google.gson;      // дозвіл на глибоку рефлексію
    uses pl.mini.shop.spi.PaymentProvider;   // споживає сервіс
    provides pl.mini.shop.spi.PaymentProvider with pl.mini.shop.impl.CardPayment;
}
\`\`\`

* \`public\`-клас у неекспортованому пакеті **недоступний** іншим модулям. Це справжній аналог \`internal\` з C#.
* \`exports\` відкриває доступ до public-типів на етапі компіляції, а \`opens\` дозволяє рефлексію, зокрема \`setAccessible\` для private-членів. Серіалізаторам і DI-фреймворкам потрібен саме \`opens\`.

> [!NOTE]
> Якщо в проєкті немає \`module-info.java\`, увесь код потрапляє в *unnamed module* і працює по-старому, через classpath. Більшість застосунків досі так і збирається. Але сам JDK модульний, тому \`setAccessible\` на внутрішніх класах JDK кидає \`InaccessibleObjectException\`.
`
    }
  ],
  quiz: [
    {
      question: "У якому порядку закриються ресурси: try (var a = ...; var b = ...) { }?",
      options: [
        "a, потім b",
        "b, потім a",
        "Одночасно",
        "Порядок не визначено"
      ],
      answer: 1,
      explanation: "Ресурси закриваються у зворотному порядку створення. b може залежати від a, тому закривається першим."
    },
    {
      question: "Яку політику Retention треба вказати для анотації, яку читатимемо через рефлексію?",
      options: ["SOURCE", "CLASS", "RUNTIME", "Будь-яку"],
      answer: 2,
      explanation: "Лише RUNTIME-анотації доступні під час виконання через getAnnotation(). CLASS є політикою за замовчуванням: така анотація є в байт-коді, але рефлексія її не бачить."
    },
    {
      question: "Тестовий метод, викликаний через Method.invoke, кинув IllegalStateException. Що отримає викликач?",
      options: [
        "IllegalStateException",
        "InvocationTargetException, у якого getCause() — це IllegalStateException",
        "ReflectiveOperationException без причини",
        "Нічого: винятки поглинаються"
      ],
      answer: 1,
      explanation: "Рефлексія загортає винятки викликаного методу в InvocationTargetException. Справжню причину дістають через getCause()."
    },
    {
      question: "Чим getDeclaredMethods() відрізняється від getMethods()?",
      options: [
        "Нічим",
        "getDeclaredMethods — усі методи цього класу (включно з private), getMethods — лише public, включно з успадкованими",
        "getMethods повертає лише статичні методи",
        "getDeclaredMethods повертає лише абстрактні методи"
      ],
      answer: 1,
      explanation: "Declared означає «оголошені саме в цьому класі»: з усіма модифікаторами, але без успадкованих."
    },
    {
      question: "Що в Java є найближчим аналогом модифікатора internal з C#?",
      options: [
        "protected",
        "Public-клас у пакеті, який модуль не експортує (exports) у module-info.java",
        "private",
        "final"
      ],
      answer: 1,
      explanation: "Неекспортовані пакети модуля невидимі ззовні навіть для public-класів. Package-private обмежує видимість лише одним пакетом."
    },
    {
      question: "Які типи можна обгорнути JDK-проксі (Proxy.newProxyInstance)?",
      options: [
        "Будь-які класи",
        "Лише інтерфейси",
        "Лише final-класи",
        "Лише records"
      ],
      answer: 1,
      explanation: "JDK-проксі генерує клас, який реалізує вказані інтерфейси. Для звичайних класів потрібні бібліотеки, що генерують байт-код (ByteBuddy, cglib)."
    }
  ]
};
