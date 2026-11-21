---
title: Patterns in Practice
description: Practical application of GoF patterns in real systems: Builder, Factory, Observer, Strategy and Decorator on examples from production code, combining patterns, anti-patterns (global state, over-engineering, God Object) and the pitfalls of excessive abstraction.
---

## Why This Page: Patterns Are Tools, Not Theory

On the "SOLID and Design Patterns" page we covered the definitions of the GoF patterns and the SOLID principles. But knowing a definition does not yet mean understanding a pattern. Understanding comes when you can answer three questions:

1. **When** is it worth applying this pattern?
2. **When is it NOT** worth applying it?
3. **How to combine** several patterns in one system?

This page is practical: instead of repeating definitions — **real scenarios**, anti-patterns and refactoring.

> [!IMPORTANT]
> **The main rule:** a pattern is applied **when a problem appears**. Do not invent a problem in order to apply a pattern. That is **over-engineering**, one of the most common sins of ambitious beginners.

## Builder: When a Constructor Becomes a Nightmare

### The Problem: the Telescoping Constructor

A class has 8 fields, 5 of which are optional. How many constructors will you have to write?

```java
// ❌ AN ANTI-PATTERN
public class HttpRequest {
    public HttpRequest(String url) { this(url, "GET", null, null, 30, false, null, null); }
    public HttpRequest(String url, String method) { this(url, method, null, null, 30, false, null, null); }
    public HttpRequest(String url, String method, String body) { this(url, method, body, null, 30, false, null, null); }
    // ... a combinatorial explosion!
    public HttpRequest(String url, String method, String body, Map<String, String> headers,
                       int timeoutSeconds, boolean followRedirects, String proxyHost, Integer proxyPort) { }
}

new HttpRequest("https://x", "POST", null, null, 30, false, null, null);   // what do 30 and false mean here?
```

### The Solution: a Builder

```java
HttpRequest request = HttpRequest.builder()
        .url("https://api.example.com/users")
        .method("POST")
        .body("{\"name\": \"Jan\"}")
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer token123")
        .timeoutSeconds(10)
        .followRedirects(true)
        .build();
```

The code is **self-documenting**: each parameter has a name, and the order does not matter.

### A Manual Implementation (without Lombok)

```java
public final class HttpRequest {
    private final String url;
    private final String method;
    private final String body;
    private final Map<String, String> headers;
    private final int timeoutSeconds;

    private HttpRequest(Builder b) {                      // private: only through the Builder
        this.url = Objects.requireNonNull(b.url, "url is required");
        this.method = b.method;
        this.body = b.body;
        this.headers = Map.copyOf(b.headers);             // a defensive copy: immutability
        this.timeoutSeconds = b.timeoutSeconds;
    }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private String url;
        private String method = "GET";                    // a default value
        private String body;
        private final Map<String, String> headers = new LinkedHashMap<>();
        private int timeoutSeconds = 30;

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String m) { this.method = m; return this; }
        public Builder body(String b) { this.body = b; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }   // return this -> chaining
        public Builder timeoutSeconds(int s) { this.timeoutSeconds = s; return this; }

        public HttpRequest build() {
            if (timeoutSeconds <= 0) throw new IllegalStateException("timeout > 0");    // validation in one place
            return new HttpRequest(this);
        }
    }
}
```

> [!TIP]
> Builders are everywhere: `HttpRequest.newBuilder()` in the JDK, `ResponseEntity.ok().body(x)` and `WebClient.builder()` in Spring, `MockMvcBuilders` in tests.

> [!NOTE]
> When it is NOT needed: 2–3 required parameters. A constructor or a record is enough here. A Builder makes sense with a large number of optional parameters or complex validation.

## Factory: Hiding the Creation Logic

### The Problem

The client must know **which concrete class** to create. A new type requires changes in every place where `new` appears, and that violates OCP.

```java
// ❌ the client knows too much
public class NotificationService {
    public void send(String channel, String message) {
        if (channel.equals("email")) new EmailSender().send(message);
        else if (channel.equals("sms")) new SmsSender().send(message);
        else if (channel.equals("push")) new PushSender().send(message);
        // a new channel = a change to THIS code
    }
}
```

### The Solution

```java
public interface NotificationSender { void send(String message); }

public class EmailSender implements NotificationSender {
    public void send(String m) { System.out.println("📧 Email: " + m); }
}
public class SmsSender implements NotificationSender {
    public void send(String m) { System.out.println("📱 SMS: " + m); }
}

// the factory is the only place that knows the concrete classes
public final class NotificationFactory {
    private static final Map<String, Supplier<NotificationSender>> REGISTRY = Map.of(
            "email", EmailSender::new,
            "sms",   SmsSender::new,
            "push",  PushSender::new);

    public static NotificationSender create(String channel) {
        var supplier = REGISTRY.get(channel.toLowerCase());
        if (supplier == null) throw new IllegalArgumentException("Unknown channel: " + channel);
        return supplier.get();
    }
}

public class NotificationService {
    public void send(String channel, String message) {
        NotificationFactory.create(channel).send(message);   // knows only the interface
    }
}
```

A new channel (`"telegram"`) is a new class and one line in the registry. Nothing changes in `NotificationService`. A map of suppliers instead of a switch brings the factory even closer to OCP, and it is easy to build plugin registration on top of it (lab 07).

## Observer: an Event-Driven Architecture

### The Problem

After a user registers, we must: send a welcome e-mail, create a wallet, write an event to the audit log, award a bonus. If all of this is written in `register()`, the method will have four reasons to change (an SRP violation). And tomorrow push notifications will be added too.

### The Solution: Observer (Pub/Sub)

`register()` only **announces** the event; it does not know who reacts to it.

```java
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
            } catch (RuntimeException e) {               // one broken listener does not bring down the rest
                System.err.println("A listener failed: " + e);
            }
        }
    }
}

public class RegistrationService {
    private final EventBus bus;
    public RegistrationService(EventBus bus) { this.bus = bus; }

    public void register(String email, String password) {
        // ... saving to the database ...
        bus.publish(new UserRegisteredEvent(email, Instant.now()));
    }
}
```

```java
EventBus bus = new EventBus();
bus.subscribe(UserRegisteredEvent.class, e -> System.out.println("📧 E-mail for " + e.email()));
bus.subscribe(UserRegisteredEvent.class, e -> System.out.println("🎁 Bonus for " + e.email()));
bus.subscribe(UserRegisteredEvent.class, e -> System.out.println("📝 Audit: " + e.email() + " at " + e.at()));

new RegistrationService(bus).register("jan@example.com", "secret");
```

Push notifications are one more `bus.subscribe(...)`. **Zero changes** in `RegistrationService`.

> [!IMPORTANT]
> `@EventListener` in Spring works the same way. Implementing it by hand makes it clear what the framework does "under the hood".

> [!WARNING]
> The price: the control flow becomes implicit. The code of `register()` no longer shows what happens next. Do not do through events what must execute transactionally together with the main operation.

## Strategy: an Interchangeable Algorithm

### The Problem

An online shop calculates tax, and the rate depends on the country: Poland 23%, Germany 19%, in the US — depending on the state. A huge `if/else` quickly becomes unreadable.

```java
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
        System.out.printf("Price: %s, tax: %s, total: %s%n", price, t, price.add(t));
        return price.add(t);
    }
}

new OrderService(TaxStrategy.flat("0.23")).total(new BigDecimal("100"));   // tax 23.00
new OrderService(TaxStrategy.flat("0.19")).total(new BigDecimal("100"));   // tax 19.00
new OrderService(a -> BigDecimal.ZERO).total(new BigDecimal("100"));       // a lambda!
```

> [!TIP]
> Strategy + Factory is a powerful combination: the factory chooses the strategy based on the data (the order's country), and the strategy performs the algorithm. In Spring a `Map<String, TaxStrategy>` (the key is the bean name) can be injected for this.

## Decorator: New Behavior without Changing the Class

### The Problem

The `DataSource` interface reads and writes data. We need to add compression, encryption and logging **without changing** `FileDataSource`, and in any combination.

```java
public interface DataSource {
    String readData();
    void writeData(String data);
}

public class FileDataSource implements DataSource {
    private final String filename;
    public FileDataSource(String filename) { this.filename = filename; }
    public String readData() { return "raw data from " + filename; }
    public void writeData(String data) { System.out.println("Writing to " + filename + ": " + data); }
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
        System.out.println("LOG: writing " + data.length() + " characters");
        super.writeData(data);
    }
}
```

```java
DataSource source = new FileDataSource("data.txt");
source = new EncryptionDecorator(source);   // layer 1
source = new LoggingDecorator(source);      // layer 2

source.writeData("Secret data!");
// LOG: writing 12 characters
// Writing to data.txt: U2VjcmV0IGRhdGEh
```

This is **the same** mechanism as `new BufferedReader(new InputStreamReader(new FileInputStream("f.txt")))`.

> [!NOTE]
> The order of the layers matters: "first compress, then encrypt" works, but the other way around does not (encrypted data hardly compresses).

## Anti-Patterns: What NOT to Do

### Anti-Pattern 1: a Singleton with Mutable Global State

```java
// ❌
public class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig();
    private String databaseUrl = "jdbc:h2:mem:test";
    public static AppConfig getInstance() { return INSTANCE; }
    public void setDatabaseUrl(String url) { this.databaseUrl = url; }   // DANGEROUS
}
```

A test that called `setDatabaseUrl()` changes the state for **all** subsequent tests. The result depends on the run order (flaky tests), and data races appear in multithreaded code.

**The solution:** singletons only for **stateless** or **immutable** objects. Services (`@Service`) in Spring are singletons, but without mutable fields.

### Anti-Pattern 2: Over-Engineering

```java
// ❌ a factory, a strategy, an observer and a facade... for one notification type
public interface NotificationStrategy { void send(String msg); }
public class EmailNotificationStrategy implements NotificationStrategy { }
public class NotificationStrategyFactory { }
public class NotificationObserver { }
public class NotificationFacade { }
// 6 classes to send one e-mail

// ✅ while there is one channel
public class EmailService {
    public void send(String to, String message) { /* simple and clear */ }
}
```

> [!CAUTION]
> **The Rule of Three:** the first time, write it simply. The second time, notice the repetition. The third time, extract the common part into an abstraction. An abstraction "for a future" that never comes is extra code that has to be read, tested and maintained.

### Anti-Pattern 3: the God Object

```java
// ❌ a class that does EVERYTHING
public class ApplicationManager {
    public void registerUser() { }
    public void processPayment() { }
    public void sendNotification() { }
    public void generateReport() { }
    public void updateInventory() { }
    // ... 3000 lines, 47 methods
}
```

It violates SRP. Split it into `UserService`, `PaymentService`, `NotificationService`, `ReportService`, `InventoryService`.

### Anti-Pattern 4: an Anemic Domain + "Manager/Helper/Util"

Classes named `*Manager`, `*Helper`, `*Utils` that process someone else's data often mean that the logic has been torn away from the data. If `OrderUtils.calculateTotal(order)` knows everything about the fields of `Order`, this method belongs in `Order` itself.

## Combining Patterns in a Real System

In real systems patterns **almost never** appear alone. Here is how a typical order service combines four of them:

```text
┌──────────────────────────────────────────────────────┐
│                     OrderService                     │
│   (receives TaxFactory and EventBus via constructor) │
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
```

* **Builder** creates the complex `Order` object with validation.
* **Factory** chooses the tax strategy by country.
* **Strategy** calculates the tax; `OrderService` knows nothing about the rates.
* **Observer** notifies the warehouse, e-mail and analytics without hard dependencies.

### What of This Is in Spring Boot

| Spring mechanism | Pattern |
| --- | --- |
| beans (singleton scope) | Singleton |
| `@Transactional`, `@Cacheable`, `@Async` | Proxy |
| `@EventListener` | Observer |
| injecting interfaces | Strategy + DI |
| `JdbcTemplate`, `RestTemplate` | Template Method |
| `FactoryBean`, `@Bean` methods | Factory |

> [!TIP]
> In **lab 11** you will implement exactly such a system and see how these patterns work together in one program.
