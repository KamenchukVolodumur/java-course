export const lecture21 = {
  id: "21",
  title: "Лекція 21: Патерни на практиці — коли застосовувати, коли ні і як поєднувати",
  description: "Практичне застосування патернів GoF у реальних системах: Builder, Factory, Observer, Strategy і Decorator на прикладах із production-коду, поєднання патернів, антипатерни (глобальний стан, over-engineering, God Object) і пастки надмірної абстракції.",
  sections: [
    {
      title: "1. Навіщо ця лекція: патерни — це інструменти, а не теорія",
      content: `
У лекції 16 ми розібрали визначення патернів GoF і принципи SOLID. Але знати визначення ще не означає розуміти патерн. Розуміння приходить, коли можеш відповісти на три питання:

1. **Коли** варто застосувати цей патерн?
2. **Коли НЕ** варто його застосовувати?
3. **Як поєднати** кілька патернів в одній системі?

Ця лекція практична: замість повторення визначень — **реальні сценарії**, антипатерни і рефакторинг.

> [!IMPORTANT]
> **Головне правило:** патерн застосовують **тоді, коли з'являється проблема**. Не вигадуйте проблему, щоб застосувати патерн. Це **over-engineering**, один із найчастіших гріхів амбітних початківців.
`
    },
    {
      title: "2. Builder: коли конструктор стає жахіттям",
      content: `
### Проблема: телескопічний конструктор

Клас має 8 полів, з яких 5 необов'язкові. Скільки конструкторів доведеться написати?

\`\`\`java
// ❌ АНТИПАТЕРН
public class HttpRequest {
    public HttpRequest(String url) { this(url, "GET", null, null, 30, false, null, null); }
    public HttpRequest(String url, String method) { this(url, method, null, null, 30, false, null, null); }
    public HttpRequest(String url, String method, String body) { this(url, method, body, null, 30, false, null, null); }
    // ... комбінаторний вибух!
    public HttpRequest(String url, String method, String body, Map<String, String> headers,
                       int timeoutSeconds, boolean followRedirects, String proxyHost, Integer proxyPort) { }
}

new HttpRequest("https://x", "POST", null, null, 30, false, null, null);   // що тут означають 30 і false?
\`\`\`

### Рішення: Builder

\`\`\`java
HttpRequest request = HttpRequest.builder()
        .url("https://api.example.com/users")
        .method("POST")
        .body("{\\"name\\": \\"Ян\\"}")
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer token123")
        .timeoutSeconds(10)
        .followRedirects(true)
        .build();
\`\`\`

Код **самодокументований**: кожен параметр має назву, порядок не важливий.

### Ручна реалізація (без Lombok)

\`\`\`java
public final class HttpRequest {
    private final String url;
    private final String method;
    private final String body;
    private final Map<String, String> headers;
    private final int timeoutSeconds;

    private HttpRequest(Builder b) {                      // приватний: лише через Builder
        this.url = Objects.requireNonNull(b.url, "url обов'язковий");
        this.method = b.method;
        this.body = b.body;
        this.headers = Map.copyOf(b.headers);             // захисна копія: незмінність
        this.timeoutSeconds = b.timeoutSeconds;
    }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private String url;
        private String method = "GET";                    // значення за замовчуванням
        private String body;
        private final Map<String, String> headers = new LinkedHashMap<>();
        private int timeoutSeconds = 30;

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String m) { this.method = m; return this; }
        public Builder body(String b) { this.body = b; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }   // return this -> chaining
        public Builder timeoutSeconds(int s) { this.timeoutSeconds = s; return this; }

        public HttpRequest build() {
            if (timeoutSeconds <= 0) throw new IllegalStateException("timeout > 0");    // валідація в одному місці
            return new HttpRequest(this);
        }
    }
}
\`\`\`

> [!TIP]
> Builder трапляється всюди: \`HttpRequest.newBuilder()\` у JDK, \`ResponseEntity.ok().body(x)\` і \`WebClient.builder()\` у Spring, \`MockMvcBuilders\` у тестах.

> [!NOTE]
> Коли НЕ треба: 2–3 обов'язкові параметри. Тут досить конструктора або record. Builder має сенс за великої кількості необов'язкових параметрів або складної валідації.
`
    },
    {
      title: "3. Factory: приховуємо логіку створення",
      content: `
### Проблема

Клієнт мусить знати, **який конкретний клас** створити. Новий тип вимагає змін у кожному місці, де стоїть \`new\`, а це порушення OCP.

\`\`\`java
// ❌ клієнт знає забагато
public class NotificationService {
    public void send(String channel, String message) {
        if (channel.equals("email")) new EmailSender().send(message);
        else if (channel.equals("sms")) new SmsSender().send(message);
        else if (channel.equals("push")) new PushSender().send(message);
        // новий канал = зміна ЦЬОГО коду
    }
}
\`\`\`

### Рішення

\`\`\`java
public interface NotificationSender { void send(String message); }

public class EmailSender implements NotificationSender {
    public void send(String m) { System.out.println("📧 Email: " + m); }
}
public class SmsSender implements NotificationSender {
    public void send(String m) { System.out.println("📱 SMS: " + m); }
}

// фабрика — єдине місце, яке знає про конкретні класи
public final class NotificationFactory {
    private static final Map<String, Supplier<NotificationSender>> REGISTRY = Map.of(
            "email", EmailSender::new,
            "sms",   SmsSender::new,
            "push",  PushSender::new);

    public static NotificationSender create(String channel) {
        var supplier = REGISTRY.get(channel.toLowerCase());
        if (supplier == null) throw new IllegalArgumentException("Невідомий канал: " + channel);
        return supplier.get();
    }
}

public class NotificationService {
    public void send(String channel, String message) {
        NotificationFactory.create(channel).send(message);   // знає лише інтерфейс
    }
}
\`\`\`

Новий канал (\`"telegram"\`) — це новий клас і один рядок у реєстрі. У \`NotificationService\` нічого не змінюється. Мапа постачальників замість switch робить фабрику ще ближчою до OCP, а на її основі легко зробити реєстрацію плагінів (лабораторна 07).
`
    },
    {
      title: "4. Observer: подієва архітектура",
      content: `
### Проблема

Після реєстрації користувача треба: надіслати вітальний лист, створити гаманець, записати подію в журнал аудиту, нарахувати бонус. Якщо записати все це в \`register()\`, метод матиме чотири причини для змін (порушення SRP). А завтра додадуть ще push-сповіщення.

### Рішення: Observer (Pub/Sub)

\`register()\` лише **оголошує** подію; хто на неї реагує, він не знає.

\`\`\`java
public record UserRegisteredEvent(String email, Instant at) { }

@FunctionalInterface
public interface Listener<T> { void onEvent(T event); }

public class EventBus {
    private final Map<Class<?>, List<Listener<?>>> listeners = new ConcurrentHashMap<>();

    public <T> void subscribe(Class<T> type, Listener<? super T> listener) {
        listeners.computeIfAbsent(type, k -> new CopyOnWriteArrayList<>()).add(listener);
    }

    @SuppressWarnings("unchecked")
    public <T> void publish(T event) {
        for (Listener<?> l : listeners.getOrDefault(event.getClass(), List.of())) {
            try {
                ((Listener<T>) l).onEvent(event);
            } catch (RuntimeException e) {               // один зламаний слухач не валить решту
                System.err.println("Слухач упав: " + e);
            }
        }
    }
}

public class RegistrationService {
    private final EventBus bus;
    public RegistrationService(EventBus bus) { this.bus = bus; }

    public void register(String email, String password) {
        // ... збереження в базі ...
        bus.publish(new UserRegisteredEvent(email, Instant.now()));
    }
}
\`\`\`

\`\`\`java
EventBus bus = new EventBus();
bus.subscribe(UserRegisteredEvent.class, e -> System.out.println("📧 Лист для " + e.email()));
bus.subscribe(UserRegisteredEvent.class, e -> System.out.println("🎁 Бонус для " + e.email()));
bus.subscribe(UserRegisteredEvent.class, e -> System.out.println("📝 Аудит: " + e.email() + " о " + e.at()));

new RegistrationService(bus).register("jan@example.com", "secret");
\`\`\`

Push-сповіщення — це ще один \`bus.subscribe(...)\`. У \`RegistrationService\` **нуль змін**.

> [!IMPORTANT]
> Так само працює \`@EventListener\` у Spring. Якщо реалізувати це вручну, стає зрозуміло, що фреймворк робить «під капотом».

> [!WARNING]
> Ціна: потік керування стає неявним. З коду \`register()\` уже не видно, що станеться далі. Не робіть через події те, що мусить виконатися транзакційно разом з основною операцією.
`
    },
    {
      title: "5. Strategy: змінний алгоритм",
      content: `
### Проблема

Інтернет-магазин рахує податок, і ставка залежить від країни: Польща 23%, Німеччина 19%, у США — від штату. Величезний \`if/else\` швидко стає нечитабельним.

\`\`\`java
@FunctionalInterface
public interface TaxStrategy {
    BigDecimal taxFor(BigDecimal amount);

    static TaxStrategy flat(String rate) {
        BigDecimal r = new BigDecimal(rate);
        return amount -> amount.multiply(r).setScale(2, RoundingMode.HALF_UP);
    }
}

public class OrderService {
    private final TaxStrategy tax;
    public OrderService(TaxStrategy tax) { this.tax = tax; }

    public BigDecimal total(BigDecimal price) {
        BigDecimal t = tax.taxFor(price);
        System.out.printf("Ціна: %s, податок: %s, разом: %s%n", price, t, price.add(t));
        return price.add(t);
    }
}

new OrderService(TaxStrategy.flat("0.23")).total(new BigDecimal("100"));   // податок 23.00
new OrderService(TaxStrategy.flat("0.19")).total(new BigDecimal("100"));   // податок 19.00
new OrderService(a -> BigDecimal.ZERO).total(new BigDecimal("100"));       // лямбда!
\`\`\`

> [!TIP]
> Strategy + Factory — потужна комбінація: фабрика обирає стратегію за даними (країна замовлення), а стратегія виконує алгоритм. У Spring для цього можна впровадити \`Map<String, TaxStrategy>\` (ключ — назва bean-а).
`
    },
    {
      title: "6. Decorator: нова поведінка без зміни класу",
      content: `
### Проблема

Інтерфейс \`DataSource\` читає й пише дані. Треба додати стиснення, шифрування і логування, **не змінюючи** \`FileDataSource\`, причому в будь-якій комбінації.

\`\`\`java
public interface DataSource {
    String readData();
    void writeData(String data);
}

public class FileDataSource implements DataSource {
    private final String filename;
    public FileDataSource(String filename) { this.filename = filename; }
    public String readData() { return "сирі дані з " + filename; }
    public void writeData(String data) { System.out.println("Запис у " + filename + ": " + data); }
}

public abstract class DataSourceDecorator implements DataSource {
    protected final DataSource wrappee;
    protected DataSourceDecorator(DataSource wrappee) { this.wrappee = wrappee; }
    public String readData() { return wrappee.readData(); }
    public void writeData(String data) { wrappee.writeData(data); }
}

public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource s) { super(s); }
    @Override public void writeData(String data) {
        super.writeData(Base64.getEncoder().encodeToString(data.getBytes(StandardCharsets.UTF_8)));
    }
    @Override public String readData() {
        return new String(Base64.getDecoder().decode(super.readData()), StandardCharsets.UTF_8);
    }
}

public class LoggingDecorator extends DataSourceDecorator {
    public LoggingDecorator(DataSource s) { super(s); }
    @Override public void writeData(String data) {
        System.out.println("LOG: запис " + data.length() + " символів");
        super.writeData(data);
    }
}
\`\`\`

\`\`\`java
DataSource source = new FileDataSource("data.txt");
source = new EncryptionDecorator(source);   // шар 1
source = new LoggingDecorator(source);      // шар 2

source.writeData("Таємні дані!");
// LOG: запис 12 символів
// Запис у data.txt: 0KLQsNGU0LzQvdGWINC00LDQvdGWIQ==
\`\`\`

Це **той самий** механізм, що й \`new BufferedReader(new InputStreamReader(new FileInputStream("f.txt")))\`.

> [!NOTE]
> Порядок шарів важливий: «спочатку стиснути, потім зашифрувати» працює, а навпаки — ні (зашифровані дані майже не стискаються).
`
    },
    {
      title: "7. Антипатерни: чого НЕ робити",
      content: `
### Антипатерн 1: Singleton зі змінюваним глобальним станом

\`\`\`java
// ❌
public class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig();
    private String databaseUrl = "jdbc:h2:mem:test";
    public static AppConfig getInstance() { return INSTANCE; }
    public void setDatabaseUrl(String url) { this.databaseUrl = url; }   // НЕБЕЗПЕЧНО
}
\`\`\`

Тест, який викликав \`setDatabaseUrl()\`, змінює стан для **всіх** наступних тестів. Результат залежить від порядку запуску (flaky tests), а в багатопотоковому коді з'являються гонки даних.

**Рішення:** singleton лише для **безстанових** або **незмінних** об'єктів. Сервіси (\`@Service\`) у Spring — singleton-и, але без змінюваних полів.

### Антипатерн 2: Over-engineering

\`\`\`java
// ❌ фабрика, стратегія, спостерігач і фасад... для одного типу сповіщення
public interface NotificationStrategy { void send(String msg); }
public class EmailNotificationStrategy implements NotificationStrategy { }
public class NotificationStrategyFactory { }
public class NotificationObserver { }
public class NotificationFacade { }
// 6 класів, щоб надіслати один лист

// ✅ поки канал один
public class EmailService {
    public void send(String to, String message) { /* просто і зрозуміло */ }
}
\`\`\`

> [!CAUTION]
> **Rule of Three:** перший раз пишіть просто. Удруге помітьте повтор. Утретє виносьте спільне в абстракцію. Абстракція «на майбутнє», яке так і не настане, — це зайвий код, який треба читати, тестувати й підтримувати.

### Антипатерн 3: God Object

\`\`\`java
// ❌ клас, який робить УСЕ
public class ApplicationManager {
    public void registerUser() { }
    public void processPayment() { }
    public void sendNotification() { }
    public void generateReport() { }
    public void updateInventory() { }
    // ... 3000 рядків, 47 методів
}
\`\`\`

Порушує SRP. Розбийте на \`UserService\`, \`PaymentService\`, \`NotificationService\`, \`ReportService\`, \`InventoryService\`.

### Антипатерн 4: Anemic Domain + «Manager/Helper/Util»

Класи з назвами \`*Manager\`, \`*Helper\`, \`*Utils\`, які обробляють чужі дані, часто означають, що логіку відірвано від даних. Якщо \`OrderUtils.calculateTotal(order)\` знає все про поля \`Order\`, цьому методу місце в самому \`Order\`.
`
    },
    {
      title: "8. Поєднання патернів у реальній системі",
      content: `
У реальних системах патерни **майже ніколи** не трапляються поодинці. Ось як типовий сервіс замовлень поєднує чотири:

\`\`\`text
┌──────────────────────────────────────────────────────┐
│                     OrderService                     │
│   (отримує TaxFactory та EventBus через конструктор) │
├──────────────────────────────────────────────────────┤
│ 1. Order order = Order.builder()                     │
│        .product("Laptop").quantity(1)                │
│        .build();                        ← BUILDER    │
│                                                      │
│ 2. TaxStrategy tax = taxFactory.forCountry(country); │
│                                         ← FACTORY    │
│ 3. BigDecimal total = tax.taxFor(price) ← STRATEGY   │
│                                                      │
│ 4. bus.publish(new OrderPlaced(order)); ← OBSERVER   │
└──────────────────────────────────────────────────────┘
\`\`\`

* **Builder** створює складний об'єкт \`Order\` з валідацією.
* **Factory** обирає стратегію податку за країною.
* **Strategy** рахує податок; \`OrderService\` про ставки нічого не знає.
* **Observer** сповіщає склад, пошту й аналітику без жорстких залежностей.

### Що з цього є в Spring Boot

| Механізм Spring | Патерн |
| --- | --- |
| bean-и (scope singleton) | Singleton |
| \`@Transactional\`, \`@Cacheable\`, \`@Async\` | Proxy |
| \`@EventListener\` | Observer |
| впровадження інтерфейсів | Strategy + DI |
| \`JdbcTemplate\`, \`RestTemplate\` | Template Method |
| \`FactoryBean\`, \`@Bean\`-методи | Factory |

> [!TIP]
> У **лабораторній 11** ви реалізуєте саме таку систему й побачите, як ці патерни працюють разом в одній програмі.
`
    }
  ],
  quiz: [
    {
      question: "Конструктор класу має 12 необов'язкових параметрів. Який патерн підходить найкраще?",
      options: [
        "Singleton",
        "Factory Method",
        "Builder: задаються лише потрібні параметри з назвами, решта бере значення за замовчуванням",
        "Observer"
      ],
      answer: 2,
      explanation: "Builder розв'язує проблему телескопічного конструктора: замість купи перевантажень — ланцюжок викликів з назвами параметрів."
    },
    {
      question: "Що таке over-engineering і як його уникнути?",
      options: [
        "Надто прості рішення; уникати, додаючи абстракції",
        "Абстракції і патерни «на запас» без реальної потреби; уникати за правилом трьох: абстрагувати, коли з'явилася реальна повторюваність",
        "Відсутність тестів",
        "Використання нових версій Java"
      ],
      answer: 1,
      explanation: "Шість класів і три інтерфейси, щоб надіслати один лист, лише марнують час команди. Просте рішення краще, доки немає реальної потреби в абстракції."
    },
    {
      question: "Яке поєднання патернів найчастіше трапляється в Spring Boot?",
      options: [
        "Builder + Template Method",
        "Singleton (bean-и) + Proxy (@Transactional) + Observer (@EventListener) + Strategy (впровадження інтерфейсів)",
        "Лише Factory Method",
        "Adapter + Decorator"
      ],
      answer: 1,
      explanation: "Хто розуміє ці патерни, той розуміє, як Spring працює «під капотом»."
    },
    {
      question: "Чому singleton зі змінюваним станом — антипатерн?",
      options: [
        "Singleton не може мати полів екземпляра",
        "Він надто повільний",
        "Глобальний змінюваний стан робить тести залежними від порядку запуску, а в багатопотоковому коді спричиняє гонки даних",
        "GC не може його видалити"
      ],
      answer: 2,
      explanation: "Безпечний singleton — безстановий або незмінний."
    },
    {
      question: "Що є ціною використання Observer/EventBus?",
      options: [
        "Код стає повільнішим у 10 разів",
        "Потік керування стає неявним: з коду, що публікує подію, не видно, хто і що на неї зробить",
        "Не можна використовувати лямбди",
        "Ціни немає"
      ],
      answer: 1,
      explanation: "Слабке зв'язування ускладнює відстеження логіки. Тому не варто виносити в події те, що мусить виконатися разом з основною операцією."
    }
  ]
};
