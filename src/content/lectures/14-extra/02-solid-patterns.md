---
title: SOLID і патерни проєктування
description: П'ять принципів SOLID, найважливіші патерни GoF (породжувальні, структурні, поведінкові) і впровадження залежностей (Dependency Injection), на якому побудовані фреймворки на кшталт Spring.
---

## Вступ: навіщо принципи й патерни
Написати код, який *працює*, — це лише початок. Справжнє завдання — написати код, який **легко зрозуміти**, **просто розширити** і який **витримує зміни вимог**. Принципи SOLID і патерни проєктування — перевірені практикою рецепти для цього.

### Що таке SOLID

SOLID — акронім п'яти принципів об'єктно-орієнтованого проєктування, які сформулював Роберт Мартін (Uncle Bob). Вони допомагають писати код, який:

* стійкий до змін бізнес-вимог;
* мінімізує «ефект доміно»: зміна в одному місці не ламає десяток інших;
* легко покривається модульними тестами.

### Що таке патерни проєктування

Патерни (design patterns) — це **повторювані, перевірені рішення типових задач проєктування**. Це не готовий код для копіювання, а схеми, які адаптують до конкретної ситуації. Їх систематизувала «Банда чотирьох» (Gang of Four, GoF) у книзі *«Design Patterns: Elements of Reusable Object-Oriented Software»* (1994).

Патерни поділяють на три категорії:

1. **Породжувальні** (creational) — як створювати об'єкти.
2. **Структурні** (structural) — як компонувати класи й об'єкти.
3. **Поведінкові** (behavioral) — як об'єкти взаємодіють.

## S — Single Responsibility Principle (SRP)
> **Клас повинен мати лише одну причину для зміни.**

Кожен клас відповідає за **одну, чітко визначену річ**. Якщо клас керує користувачами, генерує звіти й надсилає листи, у нього три причини для змін, і SRP порушено.

### ❌ Порушення SRP

```java
public class UserService {
    public void registerUser(String name, String email) {
        // 1. Валідація
        if (name.isBlank()) throw new IllegalArgumentException("Порожнє ім'я");
        // 2. Збереження в БД
        database.save(new User(name, email));
        // 3. Вітальний лист
        emailClient.send(email, "Вітаємо!", "Привіт, " + name);
        // 4. Логування
        logger.info("Зареєстровано: " + email);
    }
}
```

У цього класу **чотири причини для зміни**: валідація, база даних, пошта, логування.

### ✅ Відповідно до SRP

```java
public class UserValidator {
    public void validate(String name, String email) { /* ... */ }
}

public class UserRepository {
    public void save(User user) { /* ... */ }
}

public class WelcomeEmailSender {
    public void send(String email, String name) { /* ... */ }
}

public class UserRegistrationService {
    private final UserValidator validator;
    private final UserRepository repository;
    private final WelcomeEmailSender emailSender;

    public UserRegistrationService(UserValidator validator,
                                   UserRepository repository,
                                   WelcomeEmailSender emailSender) {
        this.validator = validator;
        this.repository = repository;
        this.emailSender = emailSender;
    }

    public void registerUser(String name, String email) {
        validator.validate(name, email);
        repository.save(new User(name, email));
        emailSender.send(email, name);
    }
}
```

Тепер кожен клас має **рівно одну причину для зміни**, а `UserRegistrationService` лише координує процес і делегує деталі «спеціалістам».

## O — Open/Closed Principle (OCP)
> **Класи мають бути відкриті для розширення, але закриті для модифікації.**

Нову функціональність має бути можливо додати **без зміни наявного, протестованого коду**. Досягається це абстракцією (інтерфейси) і поліморфізмом.

### ❌ Порушення OCP

```java
public class DiscountCalculator {
    public double calculate(String customerType, double price) {
        return switch (customerType) {
            case "REGULAR" -> price * 0.95;
            case "VIP" -> price * 0.80;
            case "EMPLOYEE" -> price * 0.70;
            // новий тип клієнта = зміна цього коду!
            default -> price;
        };
    }
}
```

### ✅ Відповідно до OCP

```java
public interface DiscountStrategy {
    double apply(double price);
}

public class RegularDiscount implements DiscountStrategy {
    @Override public double apply(double price) { return price * 0.95; }
}

public class VipDiscount implements DiscountStrategy {
    @Override public double apply(double price) { return price * 0.80; }
}

// новий тип = новий клас, БЕЗ зміни наявних
public class StudentDiscount implements DiscountStrategy {
    @Override public double apply(double price) { return price * 0.90; }
}

public class DiscountCalculator {
    public double calculate(DiscountStrategy strategy, double price) {
        return strategy.apply(price);
    }
}
```

> [!NOTE]
> OCP не означає «ніколи не пишіть switch». Switch за sealed-ієрархією (сторінка «Зіставлення зі зразком») — нормальне рішення, коли набір варіантів закритий і стабільний, а операцій над ним багато.

## L — Liskov Substitution Principle (LSP)
> **Об'єкти базового класу мають бути замінні об'єктами підкласів без порушення коректності програми.**

Якщо метод приймає `Animal`, він має коректно працювати і з `Dog`, і з `Cat`, і з `Parrot`.

### ❌ Класичне порушення: квадрат і прямокутник

```java
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override public void setWidth(int w) { this.width = w; this.height = w; }
    @Override public void setHeight(int h) { this.width = h; this.height = h; }
}

void resize(Rectangle r) {
    r.setWidth(5);
    r.setHeight(10);
    assert r.getArea() == 50;   // ❌ для Square площа 100
}
```

`Square` змінює поведінку `setWidth`/`setHeight` так, як код, що працює з `Rectangle`, не очікує.

### ✅ Правильний підхід

```java
public interface Shape {
    int getArea();
}

public record Rectangle(int width, int height) implements Shape {
    public int getArea() { return width * height; }
}

public record Square(int side) implements Shape {
    public int getArea() { return side * side; }
}
```

Тепер це рівноправні реалізації `Shape`, а не наслідування.

> [!TIP]
> Ознаки порушення LSP: підклас кидає `UnsupportedOperationException` у методі батька, посилює передумови (вимагає більше, ніж батько) або послаблює гарантії результату.

## I — Interface Segregation Principle (ISP)
> **Клієнти не повинні залежати від методів, якими вони не користуються.**

Краще багато маленьких спеціалізованих інтерфейсів, ніж один великий «товстий».

### ❌ Порушення ISP

```java
public interface MultiFunctionPrinter {
    void print(Document doc);
    void scan(Document doc);
    void fax(Document doc);
    void staple(Document doc);
}

public class BasicPrinter implements MultiFunctionPrinter {
    public void print(Document doc) { /* OK */ }
    public void scan(Document doc) { throw new UnsupportedOperationException(); }
    public void fax(Document doc) { throw new UnsupportedOperationException(); }
    public void staple(Document doc) { throw new UnsupportedOperationException(); }
}
```

### ✅ Відповідно до ISP

```java
public interface Printable { void print(Document doc); }
public interface Scannable { void scan(Document doc); }
public interface Faxable   { void fax(Document doc); }

public class BasicPrinter implements Printable {
    public void print(Document doc) { /* OK */ }
}

public class OfficePrinter implements Printable, Scannable, Faxable {
    public void print(Document doc) { /* ... */ }
    public void scan(Document doc) { /* ... */ }
    public void fax(Document doc) { /* ... */ }
}
```

## D — Dependency Inversion Principle (DIP) і Dependency Injection
> **Модулі вищого рівня не повинні залежати від модулів нижчого рівня. І ті, й інші мають залежати від абстракцій.**

Це найважливіший принцип перед вивченням Spring, бо на ньому побудовано **Dependency Injection (DI)**.

### ❌ Порушення DIP

```java
public class OrderService {
    private final MySqlOrderRepository repository = new MySqlOrderRepository();

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
```

`OrderService` намертво прив'язаний до MySQL. Щоб перейти на PostgreSQL або протестувати сервіс без бази, доведеться змінювати сам сервіс.

### ✅ Відповідно до DIP

```java
public interface OrderRepository {
    void save(Order order);
}

public class MySqlOrderRepository implements OrderRepository {
    @Override public void save(Order order) { /* MySQL */ }
}

public class PostgresOrderRepository implements OrderRepository {
    @Override public void save(Order order) { /* PostgreSQL */ }
}

public class OrderService {
    private final OrderRepository repository;     // залежить від ІНТЕРФЕЙСУ

    public OrderService(OrderRepository repository) {   // впровадження через конструктор
        this.repository = repository;
    }

    public void placeOrder(Order order) {
        repository.save(order);
    }
}

// реалізацію обирають ЗЗОВНІ:
OrderService service = new OrderService(new PostgresOrderRepository());
```

### Dependency Injection

**DI — техніка реалізації DIP**: об'єкт **не створює залежності сам** (через `new`), а **отримує їх ззовні**.

```java
// 1. Через конструктор (РЕКОМЕНДОВАНО: залежності явні, поля можуть бути final)
public OrderService(OrderRepository repo) { this.repository = repo; }

// 2. Через setter (для необов'язкових залежностей)
public void setRepository(OrderRepository repo) { this.repository = repo; }

// 3. Через поле (у Spring: @Autowired; ускладнює тести)
@Autowired
private OrderRepository repository;
```

У Spring постачальником залежностей виступає **IoC-контейнер (Inversion of Control)**: програміст лише оголошує, що йому потрібно, а контейнер створює об'єкти й «впроваджує» їх.

## Породжувальні патерни: Singleton
> **Singleton гарантує, що клас має рівно один екземпляр, і надає глобальну точку доступу до нього.**

Це найвідоміший (і найчастіше зловживаний) патерн. У Spring **кожен bean за замовчуванням — singleton** (у межах контейнера).

### Найкраща реалізація в Java — enum

```java
public enum AppConfig {
    INSTANCE;

    private String databaseUrl = "jdbc:postgresql://localhost:5432/shop";

    public String getDatabaseUrl() { return databaseUrl; }
}

String url = AppConfig.INSTANCE.getDatabaseUrl();
```

JVM гарантує одноразову потокобезпечну ініціалізацію enum, а сам enum стійкий до серіалізації й рефлексії.

### Ліниво і потокобезпечно: holder idiom

```java
public final class AppConfig {
    private AppConfig() { }                       // приватний конструктор

    private static final class Holder {           // завантажиться при першому getInstance()
        static final AppConfig INSTANCE = new AppConfig();
    }

    public static AppConfig getInstance() { return Holder.INSTANCE; }
}
```

Класичний варіант — *double-checked locking* з `volatile`-полем. Він теж коректний, але складніший.

> [!WARNING]
> Singleton — це прихований глобальний стан: він ускладнює тестування (екземпляр не підміниш) і приховує залежності. Тому у фреймворках віддають перевагу DI: контейнер сам гарантує єдиний екземпляр, а клас про це навіть не знає.

## Породжувальні патерни: Factory Method і Builder
### Factory Method

> **Визначає інтерфейс для створення об'єкта, а рішення, який клас створити, приймає окремий метод (або підклас).**

```java
public interface Notification { void send(String message); }

public class EmailNotification implements Notification {
    public void send(String message) { System.out.println("Email: " + message); }
}
public class SmsNotification implements Notification {
    public void send(String message) { System.out.println("SMS: " + message); }
}
public class PushNotification implements Notification {
    public void send(String message) { System.out.println("Push: " + message); }
}

public final class NotificationFactory {
    public static Notification create(String channel) {
        return switch (channel.toLowerCase()) {
            case "email" -> new EmailNotification();
            case "sms"   -> new SmsNotification();
            case "push"  -> new PushNotification();
            default -> throw new IllegalArgumentException("Невідомий канал: " + channel);
        };
    }
}

Notification n = NotificationFactory.create("email");
n.send("Вітаємо!");
```

Клієнтський код не знає конкретних класів, він працює з інтерфейсом `Notification`. Фабрики в JDK: `List.of`, `Path.of`, `Executors.newFixedThreadPool`, `HttpClient.newHttpClient`.

---

### Builder

> **Дозволяє будувати складні об'єкти крок за кроком, відокремлюючи процес побудови від представлення.**

Builder особливо корисний у Java, де **немає іменованих параметрів і значень за замовчуванням**:

```java
public final class HttpRequestSpec {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final int timeoutMs;

    private HttpRequestSpec(Builder b) {
        this.url = b.url;
        this.method = b.method;
        this.headers = Map.copyOf(b.headers);
        this.body = b.body;
        this.timeoutMs = b.timeoutMs;
    }

    public static Builder builder(String url) { return new Builder(url); }

    public static final class Builder {
        private final String url;                       // обов'язкове
        private String method = "GET";                  // значення за замовчуванням
        private final Map<String, String> headers = new HashMap<>();
        private String body = "";
        private int timeoutMs = 30_000;

        private Builder(String url) { this.url = Objects.requireNonNull(url); }

        public Builder method(String m)              { this.method = m; return this; }
        public Builder header(String k, String v)    { headers.put(k, v); return this; }
        public Builder body(String b)                { this.body = b; return this; }
        public Builder timeoutMs(int ms)             { this.timeoutMs = ms; return this; }

        public HttpRequestSpec build() {
            if (method.equals("GET") && !body.isEmpty())
                throw new IllegalStateException("GET не може мати тіла");
            return new HttpRequestSpec(this);
        }
    }
}

HttpRequestSpec req = HttpRequestSpec.builder("https://api.example.com/users")
        .method("POST")
        .header("Content-Type", "application/json")
        .body("{\"name\": \"Ян\"}")
        .timeoutMs(5000)
        .build();
```

> [!TIP]
> Бібліотека **Lombok** генерує builder анотацією `@Builder` (процесори анотацій, розділ «Інше»). У JDK так влаштовані `HttpRequest.newBuilder()`, `Thread.ofVirtual()` і `StringBuilder`.

## Структурні патерни: Adapter і Decorator
### Adapter

> **Перетворює інтерфейс одного класу на інтерфейс, який очікує клієнт.**

```java
// старий інтерфейс (наприклад, зі сторонньої бібліотеки)
public interface OldLogger { void writeLog(String text); }

// новий інтерфейс, якого вимагає ваш код
public interface NewLogger { void log(Level level, String message); }

public class LoggerAdapter implements NewLogger {
    private final OldLogger oldLogger;

    public LoggerAdapter(OldLogger oldLogger) { this.oldLogger = oldLogger; }

    @Override
    public void log(Level level, String message) {
        oldLogger.writeLog("[" + level + "] " + message);
    }
}
```

Адаптери в JDK: `Arrays.asList()` (масив → `List`), `InputStreamReader` (байти → символи).

---

### Decorator

> **Динамічно додає об'єкту нову поведінку, обгортаючи його іншим об'єктом з тим самим інтерфейсом.**

```java
public interface DataSource {
    void writeData(String data);
    String readData();
}

public class FileDataSource implements DataSource {
    private final Path file;
    public FileDataSource(Path file) { this.file = file; }
    public void writeData(String data) { /* запис у файл */ }
    public String readData() { /* читання з файлу */ return "дані"; }
}

public class EncryptionDecorator implements DataSource {
    private final DataSource wrapped;

    public EncryptionDecorator(DataSource wrapped) { this.wrapped = wrapped; }

    @Override public void writeData(String data) { wrapped.writeData(encrypt(data)); }
    @Override public String readData() { return decrypt(wrapped.readData()); }

    private String encrypt(String s) { return Base64.getEncoder().encodeToString(s.getBytes()); }
    private String decrypt(String s) { return new String(Base64.getDecoder().decode(s)); }
}

// декоратори нашаровуються:
DataSource source = new EncryptionDecorator(
                        new CompressionDecorator(
                            new FileDataSource(Path.of("secret.txt"))));
source.writeData("Дуже важливі дані");
```

У Java декоратори всюди в I/O: `new BufferedReader(new InputStreamReader(new FileInputStream("f.txt")))` (сторінка «Потоки введення-виведення»).

## Структурні патерни: Proxy
> **Proxy надає об'єкт-замісник, який контролює доступ до іншого об'єкта.**

Proxy виглядає так само, як оригінал (реалізує той самий інтерфейс), але додає логіку «до» або «після» виклику.

```java
public interface Image { void display(); }

public class RealImage implements Image {
    private final String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();                 // дорога операція!
    }
    private void loadFromDisk() { System.out.println("Завантаження: " + filename); }
    public void display() { System.out.println("Показ: " + filename); }
}

// ліниве завантаження
public class LazyImageProxy implements Image {
    private final String filename;
    private RealImage real;             // null, доки не знадобиться

    public LazyImageProxy(String filename) { this.filename = filename; }

    @Override
    public void display() {
        if (real == null) real = new RealImage(filename);
        real.display();
    }
}
```

### Різновиди proxy

* **Lazy** — відкладає дорогу ініціалізацію.
* **Logging** — логує кожен виклик.
* **Protection** — перевіряє права перед викликом.
* **Caching** — запам'ятовує результати.
* **Remote** — приховує мережевий виклик (RMI, gRPC-стаби).

> [!IMPORTANT]
> **Spring AOP** повністю побудований на proxy (динамічні проксі зі сторінки «Рефлексія»). Коли ви ставите `@Transactional` на метод, Spring обгортає bean проксі, який відкриває транзакцію ДО виклику і робить commit/rollback ПІСЛЯ. Звідси відома пастка: виклик `this.otherMethod()` всередині того самого класу проходить повз проксі, і анотація не спрацює.

Decorator і Proxy структурно однакові, але різні за наміром: декоратор **додає функціональність**, а proxy **керує доступом** до об'єкта.

## Поведінкові патерни: Strategy
> **Strategy визначає сімейство алгоритмів, інкапсулює кожен з них і робить їх взаємозамінними.**

Ми вже бачили цей патерн у розділі про OCP: алгоритм виноситься в окремий інтерфейс і передається як залежність.

```java
public interface ShippingCost {
    BigDecimal calculate(Order order);
}

public class FlatRate implements ShippingCost {
    public BigDecimal calculate(Order o) { return new BigDecimal("15.00"); }
}

public class ByWeight implements ShippingCost {
    public BigDecimal calculate(Order o) {
        return BigDecimal.valueOf(o.totalWeightKg()).multiply(new BigDecimal("2.50"));
    }
}

public class Checkout {
    private ShippingCost shipping;
    public Checkout(ShippingCost shipping) { this.shipping = shipping; }
    public void setShipping(ShippingCost s) { this.shipping = s; }   // заміна під час виконання
    public BigDecimal total(Order o) { return o.subtotal().add(shipping.calculate(o)); }
}
```

### Strategy з лямбдами

З Java 8 стратегія — це часто просто **функціональний інтерфейс**, і окремі класи не потрібні:

```java
Checkout c = new Checkout(order -> BigDecimal.ZERO);          // безкоштовна доставка
list.sort(Comparator.comparing(String::length));               // Comparator — це стратегія
words.removeIf(w -> w.length() < 3);                            // Predicate — теж
```

## Поведінкові патерни: Observer
> **Observer визначає механізм підписки: об'єкти автоматично реагують на зміни стану іншого об'єкта.**

Використовується скрізь, де є зв'язок «один до багатьох»: системи подій, сповіщення, GUI. Детально — на сторінці «Події».

```java
public interface EventListener {
    void onEvent(String eventType, String data);
}

public class EventManager {
    private final Map<String, List<EventListener>> listeners = new HashMap<>();

    public void subscribe(String type, EventListener l) {
        listeners.computeIfAbsent(type, k -> new ArrayList<>()).add(l);
    }

    public void unsubscribe(String type, EventListener l) {
        listeners.getOrDefault(type, new ArrayList<>()).remove(l);
    }

    public void publish(String type, String data) {
        listeners.getOrDefault(type, List.of()).forEach(l -> l.onEvent(type, data));
    }
}

EventManager events = new EventManager();
events.subscribe("user.registered", (t, d) -> System.out.println("📧 Лист: " + d));
events.subscribe("user.registered", (t, d) -> System.out.println("📝 Лог: [" + t + "] " + d));
events.publish("user.registered", "jan@example.com");
// 📧 Лист: jan@example.com
// 📝 Лог: [user.registered] jan@example.com
```

> [!IMPORTANT]
> У Spring Observer реалізовано через `ApplicationEventPublisher.publishEvent(event)` і методи з анотацією `@EventListener`.

## Поведінкові патерни: Template Method
> **Template Method задає скелет алгоритму в базовому класі, а підкласи перевизначають окремі кроки, не змінюючи структури.**

```java
public abstract class DataMiner {

    // шаблонний метод: final, щоб скелет не змінили
    public final void mine(Path path) {
        String raw = read(path);
        List<String> records = parse(raw);
        analyze(records);
        report(records);
    }

    protected String read(Path path) {                    // спільний крок
        try { return Files.readString(path); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    }

    protected void report(List<String> records) {         // крок з реалізацією за замовчуванням
        System.out.println("Звіт: знайдено " + records.size() + " записів");
    }

    protected abstract List<String> parse(String raw);    // підклас МУСИТЬ реалізувати
    protected abstract void analyze(List<String> records);
}

public class CsvDataMiner extends DataMiner {
    @Override protected List<String> parse(String raw) { return raw.lines().skip(1).toList(); }
    @Override protected void analyze(List<String> r) { System.out.println("Аналіз " + r.size() + " рядків CSV"); }
}

new CsvDataMiner().mine(Path.of("data.csv"));
```

Приклади в JDK: `AbstractList` (реалізуєте `get` і `size`, решту клас дає сам), `HttpServlet.service()` → `doGet`/`doPost`, `RecursiveTask.compute()`.

> [!TIP]
> Сучасна альтернатива — композиція: передати кроки як функції (Strategy) замість наслідування. Наслідування жорстко зв'язує класи, а композиція гнучкіша.

## Підсумок: SOLID і патерни
### Принципи SOLID

| Принцип | Буква | Суть |
| --- | --- | --- |
| Single Responsibility | **S** | один клас — одна причина для змін |
| Open/Closed | **O** | розширюй новими класами, не змінюй старі |
| Liskov Substitution | **L** | підклас працює всюди, де працює базовий клас |
| Interface Segregation | **I** | багато малих інтерфейсів краще за один великий |
| Dependency Inversion | **D** | залежи від абстракцій, а не від конкретних класів |

### Патерни

| Патерн | Категорія | Коли застосовувати | Приклад у Java/Spring |
| --- | --- | --- | --- |
| **Singleton** | породжувальний | один екземпляр на застосунок | Spring bean (scope за замовчуванням) |
| **Factory Method** | породжувальний | створення без розкриття класу | `List.of()`, `Executors.new...` |
| **Builder** | породжувальний | багато необов'язкових параметрів | `HttpRequest.newBuilder()`, Lombok `@Builder` |
| **Adapter** | структурний | поєднати несумісні інтерфейси | `Arrays.asList()`, `InputStreamReader` |
| **Decorator** | структурний | додати поведінку без зміни класу | `BufferedReader(Reader)` |
| **Proxy** | структурний | контроль доступу, лінива ініціалізація, логування | Spring AOP, `@Transactional` |
| **Strategy** | поведінковий | змінний алгоритм | `Comparator`, `Predicate` |
| **Observer** | поведінковий | реакція на події | `@EventListener`, слухачі GUI |
| **Template Method** | поведінковий | сталий скелет зі змінними кроками | `AbstractList`, `HttpServlet` |

> [!TIP]
> Не намагайтеся запам'ятати всі патерни одразу. Перед Spring найважливіші **Singleton**, **Factory**, **Proxy**, **Strategy**, **Observer** і принцип **DIP / Dependency Injection**. Як поєднувати патерни на практиці й коли їх НЕ застосовувати — на сторінці «Патерни на практиці».
