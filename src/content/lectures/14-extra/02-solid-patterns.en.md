---
title: SOLID and Design Patterns
description: The five SOLID principles, the most important GoF patterns (creational, structural, behavioral) and Dependency Injection, on which frameworks like Spring are built.
---

## Introduction: Why Principles and Patterns

Writing code that *works* is only the beginning. The real task is to write code that is **easy to understand**, **simple to extend** and **withstands changing requirements**. The SOLID principles and design patterns are recipes proven in practice for this.

### What SOLID Is

SOLID is an acronym for five object-oriented design principles formulated by Robert Martin (Uncle Bob). They help write code that:

* is resilient to changes in business requirements;
* minimizes the "domino effect": a change in one place does not break a dozen others;
* is easily covered by unit tests.

### What Design Patterns Are

Design patterns are **recurring, proven solutions to typical design problems**. They are not ready-made code to copy, but schemes adapted to a concrete situation. They were systematized by the "Gang of Four" (GoF) in the book *"Design Patterns: Elements of Reusable Object-Oriented Software"* (1994).

Patterns are divided into three categories:

1. **Creational** — how to create objects.
2. **Structural** — how to compose classes and objects.
3. **Behavioral** — how objects interact.

## S — Single Responsibility Principle (SRP)

> **A class should have only one reason to change.**

Each class is responsible for **one, clearly defined thing**. If a class manages users, generates reports and sends e-mails, it has three reasons to change, and SRP is violated.

### ❌ Violating SRP

```java
public class UserService {
    public void registerUser(String name, String email) {
        // 1. Validation
        if (name.isBlank()) throw new IllegalArgumentException("Empty name");
        // 2. Saving to the database
        database.save(new User(name, email));
        // 3. A welcome e-mail
        emailClient.send(email, "Welcome!", "Hello, " + name);
        // 4. Logging
        logger.info("Registered: " + email);
    }
}
```

This class has **four reasons to change**: validation, the database, e-mail, logging.

### ✅ Following SRP

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

Now each class has **exactly one reason to change**, and `UserRegistrationService` only coordinates the process and delegates the details to "specialists".

## O — Open/Closed Principle (OCP)

> **Classes should be open for extension but closed for modification.**

It should be possible to add new functionality **without changing existing, tested code**. This is achieved with abstraction (interfaces) and polymorphism.

### ❌ Violating OCP

```java
public class DiscountCalculator {
    public double calculate(String customerType, double price) {
        return switch (customerType) {
            case "REGULAR" -> price * 0.95;
            case "VIP" -> price * 0.80;
            case "EMPLOYEE" -> price * 0.70;
            // a new customer type = a change to this code!
            default -> price;
        };
    }
}
```

### ✅ Following OCP

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

// a new type = a new class, WITHOUT changing the existing ones
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
> OCP does not mean "never write a switch". A switch over a sealed hierarchy (the "Pattern Matching" page) is a fine solution when the set of variants is closed and stable, and there are many operations on it.

## L — Liskov Substitution Principle (LSP)

> **Objects of a base class must be replaceable with objects of subclasses without breaking the correctness of the program.**

If a method takes an `Animal`, it must work correctly with a `Dog`, a `Cat` and a `Parrot` alike.

### ❌ The Classic Violation: a Square and a Rectangle

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
    assert r.getArea() == 50;   // ❌ for a Square the area is 100
}
```

`Square` changes the behavior of `setWidth`/`setHeight` in a way that code working with `Rectangle` does not expect.

### ✅ The Right Approach

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

Now they are equal implementations of `Shape`, not inheritance.

> [!TIP]
> Signs of an LSP violation: a subclass throws `UnsupportedOperationException` in a parent's method, strengthens the preconditions (requires more than the parent) or weakens the guarantees of the result.

## I — Interface Segregation Principle (ISP)

> **Clients should not depend on methods they do not use.**

Many small specialized interfaces are better than one big "fat" one.

### ❌ Violating ISP

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

### ✅ Following ISP

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

## D — Dependency Inversion Principle (DIP) and Dependency Injection

> **High-level modules should not depend on low-level modules. Both should depend on abstractions.**

This is the most important principle to learn before Spring, because **Dependency Injection (DI)** is built on it.

### ❌ Violating DIP

```java
public class OrderService {
    private final MySqlOrderRepository repository = new MySqlOrderRepository();

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
```

`OrderService` is hard-wired to MySQL. To switch to PostgreSQL or to test the service without a database, the service itself would have to be changed.

### ✅ Following DIP

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
    private final OrderRepository repository;     // depends on the INTERFACE

    public OrderService(OrderRepository repository) {   // constructor injection
        this.repository = repository;
    }

    public void placeOrder(Order order) {
        repository.save(order);
    }
}

// the implementation is chosen FROM OUTSIDE:
OrderService service = new OrderService(new PostgresOrderRepository());
```

### Dependency Injection

**DI is a technique for implementing DIP**: an object **does not create its dependencies itself** (with `new`), but **receives them from outside**.

```java
// 1. Through the constructor (RECOMMENDED: the dependencies are explicit, the fields can be final)
public OrderService(OrderRepository repo) { this.repository = repo; }

// 2. Through a setter (for optional dependencies)
public void setRepository(OrderRepository repo) { this.repository = repo; }

// 3. Through a field (in Spring: @Autowired; makes testing harder)
@Autowired
private OrderRepository repository;
```

In Spring, the provider of dependencies is the **IoC container (Inversion of Control)**: the programmer only declares what is needed, and the container creates the objects and "injects" them.

## Creational Patterns: Singleton

> **A Singleton guarantees that a class has exactly one instance and provides a global point of access to it.**

This is the best-known (and most frequently abused) pattern. In Spring **every bean is a singleton by default** (within the container).

### The Best Implementation in Java — an enum

```java
public enum AppConfig {
    INSTANCE;

    private String databaseUrl = "jdbc:postgresql://localhost:5432/shop";

    public String getDatabaseUrl() { return databaseUrl; }
}

String url = AppConfig.INSTANCE.getDatabaseUrl();
```

The JVM guarantees a one-time thread-safe initialization of an enum, and the enum itself is resistant to serialization and reflection.

### Lazy and Thread-Safe: the Holder Idiom

```java
public final class AppConfig {
    private AppConfig() { }                       // a private constructor

    private static final class Holder {           // loaded on the first getInstance()
        static final AppConfig INSTANCE = new AppConfig();
    }

    public static AppConfig getInstance() { return Holder.INSTANCE; }
}
```

The classic variant is *double-checked locking* with a `volatile` field. It is also correct, but more complex.

> [!WARNING]
> A Singleton is hidden global state: it makes testing harder (the instance cannot be substituted) and hides dependencies. That is why frameworks prefer DI: the container itself guarantees a single instance, and the class does not even know about it.

## Creational Patterns: Factory Method and Builder

### Factory Method

> **Defines an interface for creating an object, while the decision about which class to create is made by a separate method (or a subclass).**

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
            default -> throw new IllegalArgumentException("Unknown channel: " + channel);
        };
    }
}

Notification n = NotificationFactory.create("email");
n.send("Welcome!");
```

The client code does not know the concrete classes; it works with the `Notification` interface. Factories in the JDK: `List.of`, `Path.of`, `Executors.newFixedThreadPool`, `HttpClient.newHttpClient`.

---

### Builder

> **Makes it possible to build complex objects step by step, separating the construction process from the representation.**

The Builder is especially useful in Java, which has **no named parameters and no default values**:

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
        private final String url;                       // required
        private String method = "GET";                  // a default value
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
                throw new IllegalStateException("GET cannot have a body");
            return new HttpRequestSpec(this);
        }
    }
}

HttpRequestSpec req = HttpRequestSpec.builder("https://api.example.com/users")
        .method("POST")
        .header("Content-Type", "application/json")
        .body("{\"name\": \"Jan\"}")
        .timeoutMs(5000)
        .build();
```

> [!TIP]
> The **Lombok** library generates a builder with the `@Builder` annotation (an annotation processor, the "Other Topics" chapter). In the JDK, `HttpRequest.newBuilder()`, `Thread.ofVirtual()` and `StringBuilder` are built this way.

## Structural Patterns: Adapter and Decorator

### Adapter

> **Converts the interface of one class into the interface the client expects.**

```java
// the old interface (e.g. from a third-party library)
public interface OldLogger { void writeLog(String text); }

// the new interface your code requires
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

Adapters in the JDK: `Arrays.asList()` (an array → a `List`), `InputStreamReader` (bytes → characters).

---

### Decorator

> **Dynamically adds new behavior to an object by wrapping it in another object with the same interface.**

```java
public interface DataSource {
    void writeData(String data);
    String readData();
}

public class FileDataSource implements DataSource {
    private final Path file;
    public FileDataSource(Path file) { this.file = file; }
    public void writeData(String data) { /* writing to the file */ }
    public String readData() { /* reading from the file */ return "data"; }
}

public class EncryptionDecorator implements DataSource {
    private final DataSource wrapped;

    public EncryptionDecorator(DataSource wrapped) { this.wrapped = wrapped; }

    @Override public void writeData(String data) { wrapped.writeData(encrypt(data)); }
    @Override public String readData() { return decrypt(wrapped.readData()); }

    private String encrypt(String s) { return Base64.getEncoder().encodeToString(s.getBytes()); }
    private String decrypt(String s) { return new String(Base64.getDecoder().decode(s)); }
}

// decorators are layered:
DataSource source = new EncryptionDecorator(
                        new CompressionDecorator(
                            new FileDataSource(Path.of("secret.txt"))));
source.writeData("Very important data");
```

In Java, decorators are everywhere in I/O: `new BufferedReader(new InputStreamReader(new FileInputStream("f.txt")))` (the "I/O Streams" page).

## Structural Patterns: Proxy

> **A Proxy provides a substitute object that controls access to another object.**

A proxy looks just like the original (it implements the same interface), but adds logic "before" or "after" the call.

```java
public interface Image { void display(); }

public class RealImage implements Image {
    private final String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();                 // an expensive operation!
    }
    private void loadFromDisk() { System.out.println("Loading: " + filename); }
    public void display() { System.out.println("Displaying: " + filename); }
}

// lazy loading
public class LazyImageProxy implements Image {
    private final String filename;
    private RealImage real;             // null until needed

    public LazyImageProxy(String filename) { this.filename = filename; }

    @Override
    public void display() {
        if (real == null) real = new RealImage(filename);
        real.display();
    }
}
```

### Kinds of Proxies

* **Lazy** — defers expensive initialization.
* **Logging** — logs every call.
* **Protection** — checks permissions before the call.
* **Caching** — remembers results.
* **Remote** — hides a network call (RMI, gRPC stubs).

> [!IMPORTANT]
> **Spring AOP** is built entirely on proxies (the dynamic proxies from the "Reflection" page). When you put `@Transactional` on a method, Spring wraps the bean in a proxy that opens a transaction BEFORE the call and commits/rolls back AFTER it. Hence a well-known trap: a call to `this.otherMethod()` inside the same class bypasses the proxy, and the annotation does not take effect.

Decorator and Proxy are structurally identical but differ in intent: a decorator **adds functionality**, while a proxy **controls access** to the object.

## Behavioral Patterns: Strategy

> **A Strategy defines a family of algorithms, encapsulates each of them and makes them interchangeable.**

We have already seen this pattern in the OCP section: the algorithm is moved into a separate interface and passed in as a dependency.

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
    public void setShipping(ShippingCost s) { this.shipping = s; }   // replacing it at run time
    public BigDecimal total(Order o) { return o.subtotal().add(shipping.calculate(o)); }
}
```

### Strategy with Lambdas

Since Java 8 a strategy is often just a **functional interface**, and separate classes are not needed:

```java
Checkout c = new Checkout(order -> BigDecimal.ZERO);          // free shipping
list.sort(Comparator.comparing(String::length));               // a Comparator is a strategy
words.removeIf(w -> w.length() < 3);                            // so is a Predicate
```

## Behavioral Patterns: Observer

> **An Observer defines a subscription mechanism: objects automatically react to changes in the state of another object.**

It is used wherever there is a "one to many" relationship: event systems, notifications, GUIs. In detail — on the "Events" page.

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
events.subscribe("user.registered", (t, d) -> System.out.println("📧 E-mail: " + d));
events.subscribe("user.registered", (t, d) -> System.out.println("📝 Log: [" + t + "] " + d));
events.publish("user.registered", "jan@example.com");
// 📧 E-mail: jan@example.com
// 📝 Log: [user.registered] jan@example.com
```

> [!IMPORTANT]
> In Spring the Observer is implemented with `ApplicationEventPublisher.publishEvent(event)` and methods annotated with `@EventListener`.

## Behavioral Patterns: Template Method

> **A Template Method defines the skeleton of an algorithm in a base class, and subclasses override individual steps without changing the structure.**

```java
public abstract class DataMiner {

    // the template method: final so that the skeleton cannot be changed
    public final void mine(Path path) {
        String raw = read(path);
        List<String> records = parse(raw);
        analyze(records);
        report(records);
    }

    protected String read(Path path) {                    // a shared step
        try { return Files.readString(path); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    }

    protected void report(List<String> records) {         // a step with a default implementation
        System.out.println("Report: found " + records.size() + " records");
    }

    protected abstract List<String> parse(String raw);    // a subclass MUST implement it
    protected abstract void analyze(List<String> records);
}

public class CsvDataMiner extends DataMiner {
    @Override protected List<String> parse(String raw) { return raw.lines().skip(1).toList(); }
    @Override protected void analyze(List<String> r) { System.out.println("Analyzing " + r.size() + " CSV rows"); }
}

new CsvDataMiner().mine(Path.of("data.csv"));
```

Examples in the JDK: `AbstractList` (you implement `get` and `size`, the class provides the rest), `HttpServlet.service()` → `doGet`/`doPost`, `RecursiveTask.compute()`.

> [!TIP]
> A modern alternative is composition: pass the steps as functions (Strategy) instead of using inheritance. Inheritance couples classes tightly, while composition is more flexible.

## Summary: SOLID and Patterns

### The SOLID Principles

| Principle | Letter | Essence |
| --- | --- | --- |
| Single Responsibility | **S** | one class — one reason to change |
| Open/Closed | **O** | extend with new classes, do not change old ones |
| Liskov Substitution | **L** | a subclass works wherever the base class works |
| Interface Segregation | **I** | many small interfaces are better than one large one |
| Dependency Inversion | **D** | depend on abstractions, not on concrete classes |

### Patterns

| Pattern | Category | When to apply | Example in Java/Spring |
| --- | --- | --- | --- |
| **Singleton** | creational | one instance per application | a Spring bean (the default scope) |
| **Factory Method** | creational | creation without exposing the class | `List.of()`, `Executors.new...` |
| **Builder** | creational | many optional parameters | `HttpRequest.newBuilder()`, Lombok `@Builder` |
| **Adapter** | structural | combining incompatible interfaces | `Arrays.asList()`, `InputStreamReader` |
| **Decorator** | structural | adding behavior without changing the class | `BufferedReader(Reader)` |
| **Proxy** | structural | access control, lazy initialization, logging | Spring AOP, `@Transactional` |
| **Strategy** | behavioral | an interchangeable algorithm | `Comparator`, `Predicate` |
| **Observer** | behavioral | reacting to events | `@EventListener`, GUI listeners |
| **Template Method** | behavioral | a fixed skeleton with variable steps | `AbstractList`, `HttpServlet` |

> [!TIP]
> Do not try to memorize all the patterns at once. Before Spring the most important ones are **Singleton**, **Factory**, **Proxy**, **Strategy**, **Observer** and the **DIP / Dependency Injection** principle. How to combine patterns in practice and when NOT to apply them is covered on the "Patterns in Practice" page.
