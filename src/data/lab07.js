export const lab07 = {
  id: "Lab07",
  title: "Лабораторна 07: Анотації та рефлексія — міні-JUnit, серіалізатор і плагіни",
  description: "Власні анотації з RetentionPolicy.RUNTIME, тест-раннер на рефлексії (@Test, @BeforeEach, @Disabled, очікувані винятки), серіалізатор records у JSON з анотаціями @JsonName/@JsonIgnore, завантаження плагінів за назвою класу і динамічні проксі для логування й кешування.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 04.8 «Generics», 08.1 «Анотації», 08.2 «Рефлексія», 08.3 «Модулі й завантажувачі класів» · **Час:** 3 год · **Бали:** 10

Ви напишете спрощені версії механізмів, на яких тримаються JUnit, Jackson і Spring. Після цієї лабораторної «магія» фреймворків стане зрозумілою.

\`\`\`text
src/main/java/pl/mini/reflect/
├── testing/   Test.java  BeforeEach.java  Disabled.java  Assert.java  TestRunner.java  TestReport.java
├── json/      JsonName.java  JsonIgnore.java  Json.java
├── plugins/   Plugin.java  PluginInfo.java  PluginRegistry.java
├── proxy/     Cacheable.java  Proxies.java
└── Main.java  (наданий)
\`\`\`

### Правила

* Розкоментовуйте блоки \`STAGE N\` у \`Main\` по черзі. Вивід має збігатися з очікуваним.
* Порядок методів, що повертає \`getDeclaredMethods()\`, **не гарантовано**. Скрізь, де важливий порядок, сортуйте за назвою.

> [!CAUTION]
> Заборонено використовувати готові бібліотеки (JUnit, Jackson, Gson, ByteBuddy). Лише \`java.lang.reflect\` і \`java.lang.annotation\`.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Оголошення анотації

\`\`\`java
@Retention(RetentionPolicy.RUNTIME)       // без цього рефлексія анотації не побачить!
@Target(ElementType.METHOD)
public @interface Test {
    Class<? extends Throwable> expected() default None.class;
    final class None extends Throwable { private None() { } }
}
\`\`\`

### Рефлексія: методи, конструктори, виклик

\`\`\`java
Class<?> c = obj.getClass();
Method[] ms = c.getDeclaredMethods();          // усі методи ЦЬОГО класу
Arrays.sort(ms, Comparator.comparing(Method::getName));

Object instance = c.getDeclaredConstructor().newInstance();
m.setAccessible(true);                         // для не-public методів
try {
    m.invoke(instance);
} catch (InvocationTargetException e) {
    Throwable real = e.getCause();             // справжній виняток із методу
}
\`\`\`

### Records через рефлексію

\`\`\`java
for (RecordComponent rc : obj.getClass().getRecordComponents()) {   // у порядку оголошення
    String name = rc.getName();
    Object value = rc.getAccessor().invoke(obj);
    JsonName ann = rc.getAnnotation(JsonName.class);    // анотація з @Target(RECORD_COMPONENT)
}
\`\`\`

### Динамічний проксі

\`\`\`java
@SuppressWarnings("unchecked")
static <T> T wrap(T target, Class<T> iface, InvocationHandler h) {
    return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class<?>[]{iface}, h);
}
\`\`\`

Через \`InvocationHandler\` проходять **усі** виклики проксі, включно з \`toString\`, \`hashCode\` і \`equals\`.
`
    },
    {
      title: "Очікуваний вивід",
      content: `
Так має виглядати вивід \`Main\` зі стартового проєкту, коли розкоментовано всі етапи:

\`\`\`text
✓ addsElement
✓ freshDataEachTime
- notReady (вимкнено)
Пройдено: 2, провалено: 0, пропущено: 1
✗ crashes: IllegalStateException: бум
✓ dividesByZero
✗ expectedButNotThrown: очікувався IllegalStateException
✗ wrongSum: очікувалось 7, отримано 6
Пройдено: 1, провалено: 3, пропущено: 0
{"name":"Анна","age":21,"address":{"city":"Варшава","zip_code":"00-661"},"tags":["java","kotlin"],"score":null}
["say \\"hi\\"",1,true]
OK: непідтримуваний тип: java.lang.Object
NotAPlugin: не реалізує Plugin
NoDefaultCtor: немає публічного конструктора без параметрів
pl.mini.Missing: клас не знайдено
reverse v?
upper v1.2
AVAJ
2 [price(tea) -> 4.5, price(coffee) -> 9.0, hello(Ola) -> Hi Ola, hello(Ola) -> Hi Ola]
OK: NPE, price(null) !! NullPointerException
\`\`\`
`
    },
    {
      title: "Етап 1: Тест-раннер (2 б.)",
      content: `
Анотації (усі \`RUNTIME\`, \`METHOD\`): \`@Test\` (з елементом \`expected\`, див. теорію), \`@BeforeEach\`, \`@Disabled\`.

\`\`\`java
public final class Assert {
    public static void equal(Object expected, Object actual);   // AssertionError("очікувалось E, отримано A")
}

public record TestReport(int passed, int failed, int skipped, List<String> lines) {
    @Override public String toString();   // усі lines + підсумковий рядок, кожен закінчується \\n
}

public final class TestRunner {
    public static TestReport run(Class<?> testClass);
}
\`\`\`

* Тестові методи — методи з \`@Test\`, **відсортовані за назвою**. Методи без анотації не викликаються.
* Для **кожного** тесту створюється **новий** екземпляр класу (як у JUnit), а потім викликаються всі \`@BeforeEach\`-методи.
* \`@Disabled\` → рядок \`- name (вимкнено)\`, метод не викликається.
* Успіх → \`✓ name\`. Підсумок: \`Пройдено: P, провалено: F, пропущено: S\`.
* Методи можуть бути package-private: використовуйте \`setAccessible(true)\`.
* \`Assert.equal\` порівнює через \`Objects.equals\`.

> [!TIP]
> Поміркуйте, чому JUnit створює новий екземпляр для кожного тесту. Якби екземпляр був один, \`addsElement\` залишив би в \`data\` чотири елементи, і результат \`freshDataEachTime\` залежав би від порядку тестів.
`
    },
    {
      title: "Етап 2: Помилки та очікувані винятки (2 б.)",
      content: `
Розширте \`TestRunner\`:

| Ситуація | Рядок звіту |
| --- | --- |
| \`AssertionError\` | \`✗ name: <повідомлення>\` |
| інший виняток, не очікуваний | \`✗ name: <SimpleName>: <повідомлення>\` |
| \`expected = X\`, кинуто X або його підклас | \`✓ name\` |
| \`expected = X\`, нічого не кинуто | \`✗ name: очікувався <X.SimpleName>\` |
| \`expected = X\`, кинуто інший виняток | \`✗ name: очікувався X, отримано <SimpleName>\` |

* Не забудьте розгорнути \`InvocationTargetException\` → \`getCause()\`.
* Виняток у \`@BeforeEach\` → тест провалений, рядок \`✗ name: помилка в @BeforeEach: ...\`.
* «Підклас» перевіряйте через \`expected.isInstance(cause)\`.
`
    },
    {
      title: "Етап 3: Серіалізатор JSON на рефлексії (2 б.)",
      content: `
Анотації \`@JsonName(String value)\` і \`@JsonIgnore\`: \`RUNTIME\`, \`@Target(ElementType.RECORD_COMPONENT)\`.

\`\`\`java
public final class Json {
    public static String write(Object value);
}
\`\`\`

Підтримувані значення:

| Тип | JSON |
| --- | --- |
| \`null\` | \`null\` |
| \`String\`, \`Character\` | рядок у лапках; \`"\` → \`\\"\`, \`\\\` → \`\\\\\`, перенос рядка → \`\\n\` |
| \`Number\`, \`Boolean\` | як є (\`String.valueOf\`) |
| \`Collection\`, масив об'єктів | \`[a,b,c]\` |
| \`Map<String, ?>\` | \`{"k":v}\` |
| **record** | об'єкт; поля в порядку компонентів; \`@JsonName\` змінює ключ; \`@JsonIgnore\` пропускає поле |
| будь-що інше | \`IllegalArgumentException("непідтримуваний тип: " + повна назва класу)\` |

* Без пробілів між елементами (компактний формат).
* Рекурсія для вкладених records і колекцій.

> [!NOTE]
> Анотація на компоненті record «розповсюджується» на поле, аксесор і параметр конструктора лише тоді, коли її \`@Target\` це дозволяє. З \`@Target(RECORD_COMPONENT)\` її видно саме через \`RecordComponent.getAnnotation\`. Так працюють анотації Jackson на records.
`
    },
    {
      title: "Етап 4: Реєстр плагінів (2 б.)",
      content: `
\`\`\`java
public interface Plugin {
    String name();
    String apply(String input);
}

@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.TYPE)
public @interface PluginInfo { String version(); }

public final class PluginRegistry {
    public static PluginRegistry load(List<String> classNames);
    public List<Plugin> plugins();               // відсортовані за name()
    public List<String> errors();                // у порядку вхідного списку
    public String version(Plugin p);             // з @PluginInfo або "?"
    public UnaryOperator<String> pipeline(String... names);   // композиція в заданому порядку
}
\`\`\`

Для кожної назви:

1. \`Class.forName(name)\`. \`ClassNotFoundException\` → помилка \`"<name>: клас не знайдено"\`.
2. \`Plugin.class.isAssignableFrom(c)\`, інакше → \`"<SimpleName>: не реалізує Plugin"\`.
3. Публічний конструктор без параметрів (\`c.getConstructor()\`), інакше → \`"<SimpleName>: немає публічного конструктора без параметрів"\`.
4. Створити екземпляр і зареєструвати його.

* \`pipeline\` для невідомої назви → \`IllegalArgumentException\`. Композицію будуйте через \`Function.andThen\`, а не циклом під час кожного виклику.

> [!TIP]
> Без балів: завантажте плагін з окремого JAR через \`URLClassLoader\` або \`ServiceLoader\` (файл \`META-INF/services/pl.mini.reflect.plugins.Plugin\`), як описано на сторінці «Модулі й завантажувачі класів».
`
    },
    {
      title: "Етап 5: Динамічні проксі (2 б.)",
      content: `
\`\`\`java
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
public @interface Cacheable { }

public final class Proxies {
    public static <T> T logging(T target, Class<T> iface, List<String> log);
    public static <T> T cached(T target, Class<T> iface);
}
\`\`\`

### logging

Після кожного виклику методу інтерфейсу додає до \`log\` рядок:

* успіх: \`name(arg1, arg2) -> result\` (аргументи через \`String.valueOf\`, без аргументів — \`name()\`);
* виняток: \`name(args) !! SimpleName\`, після чого **той самий** виняток прокидається далі (а не \`InvocationTargetException\` чи \`UndeclaredThrowableException\`).

### cached

Для методів з \`@Cacheable\` запам'ятовує результат за списком аргументів (\`Arrays.asList(args)\` як ключ \`HashMap\`) і повторно не викликає цільовий об'єкт. Інші методи передаються без змін. Винятки не кешуються.

* Методи класу \`Object\` (\`toString\`, \`hashCode\`, \`equals\`) не логуйте і не кешуйте: просто передавайте \`target\`.

> [!IMPORTANT]
> Саме так працюють \`@Transactional\` і \`@Cacheable\` у Spring. Звідси й відома пастка: якщо метод об'єкта викликає інший свій метод через \`this.other()\`, виклик іде **повз проксі**, і анотація не спрацьовує.

Закомітьте, позначте тегом \`lab07\` і запуште.
`
    }
  ],
  quiz: [
    {
      question: "Чому TestRunner не побачить анотацію @Test, оголошену без @Retention?",
      options: [
        "Бо за замовчуванням Retention — SOURCE",
        "Бо за замовчуванням Retention — CLASS: анотація є в байт-коді, але недоступна рефлексії під час виконання",
        "Бо анотації на методах взагалі невидимі",
        "Побачить"
      ],
      answer: 1,
      explanation: "Для читання через getAnnotation потрібен RetentionPolicy.RUNTIME."
    },
    {
      question: "Що повертає getCause() для InvocationTargetException з Method.invoke?",
      options: [
        "null",
        "Справжній виняток, кинутий викликаним методом",
        "IllegalAccessException",
        "Той самий InvocationTargetException"
      ],
      answer: 1,
      explanation: "Рефлексія загортає виняток методу, щоб відрізнити його від помилок самої рефлексії (неправильні аргументи, немає доступу)."
    },
    {
      question: "Чому cached(logging(real)) не записує в лог повторний виклик price(\"tea\")?",
      options: [
        "Лог переповнений",
        "Зовнішній проксі кешування повертає збережений результат і взагалі не викликає внутрішній проксі логування",
        "Логування вимикається для double",
        "Через помилку в Proxy"
      ],
      answer: 1,
      explanation: "Проксі нашаровуються, як декоратори: порядок обгортання визначає поведінку."
    },
    {
      question: "Як перевірити, що клас c реалізує інтерфейс Plugin?",
      options: [
        "c instanceof Plugin",
        "Plugin.class.isAssignableFrom(c)",
        "c.getName().contains(\"Plugin\")",
        "c.isInterface()"
      ],
      answer: 1,
      explanation: "instanceof працює з об'єктами, а не з Class. isAssignableFrom відповідає на питання, чи можна присвоїти екземпляр c змінній типу Plugin."
    }
  ]
};
