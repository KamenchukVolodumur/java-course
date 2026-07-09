export const lecture16 = {
  id: "16",
  title: "Wykład 16: Zasady SOLID i Wzorce Projektowe (Design Patterns)",
  description: "Kompletny przewodnik po pięciu zasadach SOLID, najważniejszych wzorcach projektowych GoF (kreacyjnych, strukturalnych i behawioralnych) oraz koncepcji Dependency Injection — fundamencie frameworków takich jak Spring.",
  sections: [
    {
      title: "1. Wprowadzenie: Po co nam zasady i wzorce?",
      content: `
Pisanie kodu, który *działa*, to dopiero początek. Prawdziwym wyzwaniem jest pisanie kodu, który jest **łatwy do zrozumienia**, **prosty do rozszerzenia** i **odporny na zmiany**. Zasady SOLID i wzorce projektowe to sprawdzone w praktyce receptury, które pomagają osiągnąć te cele.

### Czym są zasady SOLID?
SOLID to akronim opisujący pięć fundamentalnych zasad projektowania obiektowego, sformułowanych przez Roberta C. Martina (Uncle Bob). Ich celem jest tworzenie kodu, który:
* Jest odporny na zmiany wymagań biznesowych.
* Minimalizuje efekt "domina" — zmiana w jednym miejscu nie powoduje kaskady błędów w innych.
* Jest łatwy do testowania jednostkowego.

### Czym są wzorce projektowe?
Wzorce projektowe (Design Patterns) to **powtarzalne, sprawdzone rozwiązania typowych problemów projektowych**. Nie są gotowym kodem do skopiowania, lecz schematami, które programista adaptuje do swojej konkretnej sytuacji. Zostały skatalogowane w 1994 roku przez tzw. "Gang of Four" (GoF) w książce *"Design Patterns: Elements of Reusable Object-Oriented Software"*.

Dzielą się na trzy kategorie:
1. **Kreacyjne** (Creational) — dotyczą sposobu tworzenia obiektów.
2. **Strukturalne** (Structural) — dotyczą kompozycji klas i obiektów.
3. **Behawioralne** (Behavioral) — dotyczą komunikacji między obiektami.
`
    },
    {
      title: "2. Zasada S — Single Responsibility Principle (SRP)",
      content: `
> **Klasa powinna mieć tylko jeden powód do zmiany.**

Oznacza to, że każda klasa powinna być odpowiedzialna za **jedną, dobrze zdefiniowaną rzecz**. Jeśli klasa zarządza użytkownikami, generuje raporty i wysyła emaile — ma trzy powody do zmiany i łamie SRP.

### ❌ Złamanie SRP:
\`\`\`java
public class UserService {
    public void registerUser(String name, String email) {
        // 1. Walidacja danych
        if (name.isBlank()) throw new IllegalArgumentException("Puste imię");
        // 2. Zapis do bazy danych
        database.save(new User(name, email));
        // 3. Wysłanie emaila powitalnego
        emailClient.send(email, "Witamy!", "Cześć " + name);
        // 4. Logowanie zdarzenia
        logger.info("Zarejestrowano: " + email);
    }
}
\`\`\`
Ta klasa ma **cztery powody do zmiany**: zmiana walidacji, zmiana bazy danych, zmiana systemu email, zmiana logowania.

### ✅ Zgodne z SRP:
\`\`\`java
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
\`\`\`
Teraz każda klasa ma **dokładnie jeden powód do zmiany**. \`UserRegistrationService\` jedynie koordynuje przepływ, delegując szczegóły do specjalistów.
`
    },
    {
      title: "3. Zasada O — Open/Closed Principle (OCP)",
      content: `
> **Klasy powinny być otwarte na rozszerzanie, ale zamknięte na modyfikację.**

Oznacza to, że powinno być możliwe dodanie nowej funkcjonalności **bez zmieniania istniejącego, przetestowanego kodu**. Osiąga się to przez abstrakcję (interfejsy) i polimorfizm.

### ❌ Złamanie OCP:
\`\`\`java
public class DiscountCalculator {
    public double calculate(String customerType, double price) {
        return switch (customerType) {
            case "REGULAR" -> price * 0.95;
            case "VIP" -> price * 0.80;
            case "EMPLOYEE" -> price * 0.70;
            // Dodanie nowego typu = modyfikacja tego kodu!
            default -> price;
        };
    }
}
\`\`\`
Każdy nowy typ klienta wymaga modyfikacji istniejącej klasy.

### ✅ Zgodne z OCP:
\`\`\`java
public interface DiscountStrategy {
    double apply(double price);
}

public class RegularDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.95; }
}

public class VipDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.80; }
}

// Dodanie nowego typu = nowa klasa, BEZ modyfikacji istniejących!
public class StudentDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) { return price * 0.90; }
}

public class DiscountCalculator {
    public double calculate(DiscountStrategy strategy, double price) {
        return strategy.apply(price);
    }
}
\`\`\`
Teraz dodanie nowego rabatu wymaga jedynie utworzenia nowej klasy implementującej \`DiscountStrategy\`.
`
    },
    {
      title: "4. Zasada L — Liskov Substitution Principle (LSP)",
      content: `
> **Obiekty klasy bazowej powinny być zastępowalne obiektami klas pochodnych bez zmiany poprawności programu.**

Innymi słowy: jeśli metoda przyjmuje parametr typu \`Animal\`, to powinno działać poprawnie niezależnie od tego, czy przekażemy \`Dog\`, \`Cat\` czy \`Parrot\`.

### ❌ Klasyczny przykład złamania LSP — Kwadrat i Prostokąt:
\`\`\`java
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { this.width = w; this.height = w; }
    @Override
    public void setHeight(int h) { this.width = h; this.height = h; }
}
\`\`\`
\`\`\`java
void resize(Rectangle r) {
    r.setWidth(5);
    r.setHeight(10);
    assert r.getArea() == 50; // ❌ FAILS dla Square! (area = 100)
}
\`\`\`
\`Square\` zmienia zachowanie \`setWidth\`/\`setHeight\` w sposób nieoczekiwany dla kodu, który operuje na \`Rectangle\`.

### ✅ Poprawne podejście:
Zamiast dziedziczenia, użyj osobnych klas lub wspólnego interfejsu \`Shape\`:
\`\`\`java
public interface Shape {
    int getArea();
}

public record Rectangle(int width, int height) implements Shape {
    public int getArea() { return width * height; }
}

public record Square(int side) implements Shape {
    public int getArea() { return side * side; }
}
\`\`\`
Teraz \`Rectangle\` i \`Square\` to równorzędne implementacje \`Shape\`, a nie relacja dziedziczenia.
`
    },
    {
      title: "5. Zasada I — Interface Segregation Principle (ISP)",
      content: `
> **Klienty nie powinny być zmuszane do zależności od metod, których nie używają.**

Lepiej mieć wiele małych, wyspecjalizowanych interfejsów niż jeden duży, "gruby" interfejs.

### ❌ Złamanie ISP — "Gruby" interfejs:
\`\`\`java
public interface MultiFunctionPrinter {
    void print(Document doc);
    void scan(Document doc);
    void fax(Document doc);
    void staple(Document doc);
}
\`\`\`
Prosta drukarka musi implementować \`scan()\`, \`fax()\`, \`staple()\`, choć ich nie obsługuje:
\`\`\`java
public class BasicPrinter implements MultiFunctionPrinter {
    public void print(Document doc) { /* OK */ }
    public void scan(Document doc) { throw new UnsupportedOperationException(); }
    public void fax(Document doc) { throw new UnsupportedOperationException(); }
    public void staple(Document doc) { throw new UnsupportedOperationException(); }
}
\`\`\`

### ✅ Zgodne z ISP:
\`\`\`java
public interface Printable    { void print(Document doc); }
public interface Scannable    { void scan(Document doc); }
public interface Faxable      { void fax(Document doc); }

public class BasicPrinter implements Printable {
    public void print(Document doc) { /* OK */ }
}

public class OfficePrinter implements Printable, Scannable, Faxable {
    public void print(Document doc) { /* ... */ }
    public void scan(Document doc) { /* ... */ }
    public void fax(Document doc) { /* ... */ }
}
\`\`\`
Teraz każda klasa implementuje tylko te interfejsy, które faktycznie obsługuje.
`
    },
    {
      title: "6. Zasada D — Dependency Inversion Principle (DIP)",
      content: `
> **Moduły wysokiego poziomu nie powinny zależeć od modułów niskiego poziomu. Oba powinny zależeć od abstrakcji.**

To najważniejsza zasada przed nauką Springa, ponieważ jest ona fundamentem **Dependency Injection (DI)**.

### ❌ Złamanie DIP — bezpośrednia zależność:
\`\`\`java
public class OrderService {
    private final MySqlOrderRepository repository = new MySqlOrderRepository();

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
\`\`\`
\`OrderService\` jest na stałe "przybity" do \`MySqlOrderRepository\`. Aby zmienić bazę danych na PostgreSQL, trzeba modyfikować \`OrderService\`.

### ✅ Zgodne z DIP — zależność od abstrakcji:
\`\`\`java
public interface OrderRepository {
    void save(Order order);
}

public class MySqlOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) { /* Zapis do MySQL */ }
}

public class PostgresOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) { /* Zapis do PostgreSQL */ }
}

public class OrderService {
    private final OrderRepository repository; // Zależy od INTERFEJSU

    // Dependency Injection przez konstruktor!
    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
\`\`\`
\`\`\`java
// Wybór implementacji dokonywany jest NA ZEWNĄTRZ klasy:
OrderService service = new OrderService(new PostgresOrderRepository());
\`\`\`

### Dependency Injection (DI) — klucz do Springa
**DI to technika realizacji DIP**, w której obiekt **nie tworzy swoich zależności sam** (przez \`new\`), ale **otrzymuje je z zewnątrz** — przez konstruktor, setter lub pole.

Trzy formy DI:
\`\`\`java
// 1. Przez konstruktor (REKOMENDOWANE)
public OrderService(OrderRepository repo) { this.repository = repo; }

// 2. Przez setter
public void setRepository(OrderRepository repo) { this.repository = repo; }

// 3. Przez pole (w Springu: @Autowired)
@Autowired
private OrderRepository repository;
\`\`\`

W Springu rolę "dostawcy zależności" pełni **kontener IoC (Inversion of Control)**. Programista jedynie deklaruje, czego potrzebuje (\`@Autowired\`), a Spring sam tworzy obiekty i "wstrzykuje" je w odpowiednie miejsca.
`
    },
    {
      title: "7. Wzorce Kreacyjne: Singleton",
      content: `
> **Singleton gwarantuje, że klasa ma dokładnie jedną instancję i zapewnia globalny punkt dostępu do niej.**

Jest to najczęściej spotykany (i najczęściej nadużywany) wzorzec. W Springu **domyślnie każdy bean jest Singletonem**.

### Implementacja (thread-safe — enum):
Najprostsza i najlepsza implementacja Singletona w Javie to użycie enuma:
\`\`\`java
public enum AppConfig {
    INSTANCE;

    private String databaseUrl = "jdbc:mysql://localhost:3306/mydb";

    public String getDatabaseUrl() { return databaseUrl; }
}

// Użycie:
String url = AppConfig.INSTANCE.getDatabaseUrl();
\`\`\`
JVM gwarantuje, że enum zostanie zainicjowany dokładnie raz, jest thread-safe i odporny na serializację.

### Implementacja klasyczna (lazy, thread-safe):
\`\`\`java
public class AppConfig {
    private static volatile AppConfig instance;

    private AppConfig() {} // Prywatny konstruktor!

    public static AppConfig getInstance() {
        if (instance == null) {
            synchronized (AppConfig.class) {
                if (instance == null) {
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }
}
\`\`\`

> [!WARNING]
> Singleton utrudnia testowanie jednostkowe (globalna, współdzielona instancja). Dlatego we frameworkach takich jak Spring preferuje się DI zamiast ręcznego wywoływania \`getInstance()\` — kontener zarządza cyklem życia obiektów.
`
    },
    {
      title: "8. Wzorce Kreacyjne: Factory Method i Builder",
      content: `
### Factory Method
> **Definiuje interfejs tworzenia obiektu, ale pozwala podklasom zdecydować, która klasa zostanie utworzona.**

\`\`\`java
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    public void send(String message) { System.out.println("Email: " + message); }
}

public class SmsNotification implements Notification {
    public void send(String message) { System.out.println("SMS: " + message); }
}

public class PushNotification implements Notification {
    public void send(String message) { System.out.println("Push: " + message); }
}

// FACTORY — logika tworzenia w jednym miejscu
public class NotificationFactory {
    public static Notification create(String channel) {
        return switch (channel.toLowerCase()) {
            case "email" -> new EmailNotification();
            case "sms"   -> new SmsNotification();
            case "push"  -> new PushNotification();
            default -> throw new IllegalArgumentException(
                           "Nieznany kanał: " + channel);
        };
    }
}

// Użycie:
Notification n = NotificationFactory.create("email");
n.send("Witamy!");
\`\`\`
Kod kliencki nie zna konkretnych klas — operuje na interfejsie \`Notification\`.

---

### Builder
> **Pozwala konstruować złożone obiekty krok po kroku, oddzielając proces konstrukcji od reprezentacji.**

Builder jest idealny, gdy konstruktor miałby zbyt wiele parametrów:
\`\`\`java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final int timeout;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = builder.headers;
        this.body = builder.body;
        this.timeout = builder.timeout;
    }

    public static class Builder {
        private final String url;       // Wymagane
        private String method = "GET";  // Domyślne
        private Map<String, String> headers = new HashMap<>();
        private String body = "";
        private int timeout = 30_000;

        public Builder(String url) { this.url = url; }

        public Builder method(String method) {
            this.method = method; return this;
        }
        public Builder header(String key, String value) {
            this.headers.put(key, value); return this;
        }
        public Builder body(String body) {
            this.body = body; return this;
        }
        public Builder timeout(int ms) {
            this.timeout = ms; return this;
        }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}

// Użycie — czytelna, płynna składnia:
HttpRequest request = new HttpRequest.Builder("https://api.example.com/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .body("{\\"name\\": \\"Jan\\"}")
    .timeout(5000)
    .build();
\`\`\`

> [!TIP]
> Biblioteka **Lombok** (z Wykładu 14) potrafi wygenerować Builder automatycznie za pomocą adnotacji \`@Builder\` nad klasą.
`
    },
    {
      title: "9. Wzorce Strukturalne: Adapter i Decorator",
      content: `
### Adapter
> **Przekształca interfejs jednej klasy na interfejs oczekiwany przez klienta. Pozwala współpracować klasom, które normalnie nie mogłyby ze sobą działać.**

Wyobraź sobie, że masz stary system logowania, który używa interfejsu \`OldLogger\`, ale twój nowy kod wymaga \`NewLogger\`:
\`\`\`java
// Stary interfejs (np. z zewnętrznej biblioteki)
public interface OldLogger {
    void writeLog(String text);
}

// Nowy interfejs (wymagany przez Twój kod)
public interface NewLogger {
    void log(Level level, String message);
}

// ADAPTER — most między starym a nowym
public class LoggerAdapter implements NewLogger {
    private final OldLogger oldLogger;

    public LoggerAdapter(OldLogger oldLogger) {
        this.oldLogger = oldLogger;
    }

    @Override
    public void log(Level level, String message) {
        oldLogger.writeLog("[" + level + "] " + message);
    }
}
\`\`\`
Adapter jest powszechnie używany w Javie — np. \`Arrays.asList()\` adaptuje tablicę na interfejs \`List\`.

---

### Decorator
> **Dynamicznie dodaje nowe zachowanie do obiektu, opakowując go w inny obiekt o tym samym interfejsie.**

\`\`\`java
public interface DataSource {
    void writeData(String data);
    String readData();
}

public class FileDataSource implements DataSource {
    private final String filename;
    public FileDataSource(String filename) { this.filename = filename; }
    public void writeData(String data) { /* Zapis do pliku */ }
    public String readData() { /* Odczyt z pliku */ return "dane"; }
}

// DECORATOR — dodaje szyfrowanie
public class EncryptionDecorator implements DataSource {
    private final DataSource wrapped;

    public EncryptionDecorator(DataSource source) {
        this.wrapped = source;
    }

    @Override
    public void writeData(String data) {
        wrapped.writeData(encrypt(data)); // Dodatkowe zachowanie
    }

    @Override
    public String readData() {
        return decrypt(wrapped.readData()); // Dodatkowe zachowanie
    }

    private String encrypt(String data) { return Base64.getEncoder().encodeToString(data.getBytes()); }
    private String decrypt(String data) { return new String(Base64.getDecoder().decode(data)); }
}
\`\`\`
\`\`\`java
// Dekoratory można "zagnieżdżać" (nakładać warstwami):
DataSource source = new EncryptionDecorator(
                        new CompressionDecorator(
                            new FileDataSource("secret.txt")));
source.writeData("Bardzo ważne dane");
\`\`\`

W Javie Decorator jest wszechobecny w strumieniach I/O:
\`BufferedReader(new InputStreamReader(new FileInputStream("plik.txt")))\`
`
    },
    {
      title: "10. Wzorce Strukturalne: Proxy",
      content: `
> **Proxy dostarcza obiekt zastępczy, kontrolujący dostęp do innego obiektu.**

Proxy wygląda identycznie jak oryginalny obiekt (implementuje ten sam interfejs), ale dodaje dodatkową logikę "przed" lub "po" wywołaniu metody.

\`\`\`java
public interface ImageLoader {
    void display();
}

public class RealImage implements ImageLoader {
    private final String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk(); // Kosztowna operacja!
    }

    private void loadFromDisk() {
        System.out.println("Ładowanie obrazu: " + filename);
    }

    public void display() {
        System.out.println("Wyświetlanie: " + filename);
    }
}

// PROXY — ładuje obraz dopiero przy pierwszym użyciu (lazy loading)
public class LazyImageProxy implements ImageLoader {
    private final String filename;
    private RealImage realImage; // null dopóki nie jest potrzebny

    public LazyImageProxy(String filename) {
        this.filename = filename;
        // NIE ładujemy obrazu w konstruktorze!
    }

    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename); // Lazy initialization
        }
        realImage.display();
    }
}
\`\`\`

### Rodzaje Proxy:
* **Lazy Proxy** — opóźnia kosztowną inicjalizację (jak powyżej).
* **Logging Proxy** — loguje każde wywołanie metody.
* **Access Proxy** — sprawdza uprawnienia przed wywołaniem.
* **Caching Proxy** — zapamiętuje wyniki wcześniejszych wywołań.

> [!IMPORTANT]
> **Spring AOP (Aspect-Oriented Programming)** jest w całości oparty na wzorcu Proxy. Gdy dodajesz \`@Transactional\` do metody, Spring automatycznie tworzy obiekt Proxy, który otwiera transakcję PRZED wywołaniem i commituje ją PO wywołaniu. Zrozumienie tego wzorca jest kluczowe dla zrozumienia "magii" Springa.
`
    },
    {
      title: "11. Wzorce Behawioralne: Strategy",
      content: `
> **Strategy definiuje rodzinę algorytmów, hermetyzuje każdy z nich i umożliwia ich wymianę.**

Ten wzorzec już widzieliśmy przy zasadzie OCP! Wydzielamy algorytm do osobnego interfejsu i przekazujemy go jako zależność.

\`\`\`java
public interface SortStrategy {
    <T extends Comparable<T>> void sort(List<T> list);
}

public class BubbleSortStrategy implements SortStrategy {
    @Override
    public <T extends Comparable<T>> void sort(List<T> list) {
        System.out.println("Sortowanie bąbelkowe...");
        // Implementacja bubble sort
    }
}

public class QuickSortStrategy implements SortStrategy {
    @Override
    public <T extends Comparable<T>> void sort(List<T> list) {
        System.out.println("Sortowanie szybkie...");
        Collections.sort(list); // Uproszczone
    }
}

// Kontekst — używa strategii, nie wiedząc, jaka to implementacja
public class DataProcessor {
    private SortStrategy strategy;

    public DataProcessor(SortStrategy strategy) {
        this.strategy = strategy;
    }

    // Możliwość zmiany strategii w runtime!
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void process(List<String> data) {
        strategy.sort(data);
        data.forEach(System.out::println);
    }
}
\`\`\`

> [!TIP]
> W Javie od wersji 8+ Strategy jest naturalnie wyrażany przez **interfejsy funkcyjne i lambdy**. Zamiast tworzyć oddzielne klasy, można po prostu przekazać lambdę:
> \`\`\`java
> // Comparator to Strategy!
> list.sort((a, b) -> a.length() - b.length());
> list.sort(Comparator.comparing(String::length));
> \`\`\`
`
    },
    {
      title: "12. Wzorce Behawioralne: Observer",
      content: `
> **Observer definiuje mechanizm subskrypcji, pozwalając obiektom automatycznie reagować na zmiany stanu innego obiektu.**

Używany wszędzie tam, gdzie istnieje relacja "jeden-do-wielu" (np. system zdarzeń, powiadomienia, GUI).

\`\`\`java
// Interfejs obserwatora
public interface EventListener {
    void onEvent(String eventType, String data);
}

// Menedżer subskrypcji (Publisher)
public class EventManager {
    private final Map<String, List<EventListener>> listeners = new HashMap<>();

    public void subscribe(String eventType, EventListener listener) {
        listeners.computeIfAbsent(eventType, k -> new ArrayList<>()).add(listener);
    }

    public void unsubscribe(String eventType, EventListener listener) {
        listeners.getOrDefault(eventType, List.of()).remove(listener);
    }

    public void notify(String eventType, String data) {
        listeners.getOrDefault(eventType, List.of())
                 .forEach(listener -> listener.onEvent(eventType, data));
    }
}

// Konkretni obserwatorzy
public class EmailAlertListener implements EventListener {
    @Override
    public void onEvent(String eventType, String data) {
        System.out.println("📧 Email: Zdarzenie '" + eventType + "' — " + data);
    }
}

public class LoggingListener implements EventListener {
    @Override
    public void onEvent(String eventType, String data) {
        System.out.println("📝 Log: [" + eventType + "] " + data);
    }
}
\`\`\`
\`\`\`java
// Użycie:
EventManager events = new EventManager();
events.subscribe("user.registered", new EmailAlertListener());
events.subscribe("user.registered", new LoggingListener());
events.subscribe("order.placed", new LoggingListener());

// Powiadomienie wszystkich subskrybentów:
events.notify("user.registered", "jan@example.com");
// 📧 Email: Zdarzenie 'user.registered' — jan@example.com
// 📝 Log: [user.registered] jan@example.com
\`\`\`

> [!IMPORTANT]
> W Springu wzorzec Observer jest realizowany przez mechanizm **ApplicationEvent** i \`@EventListener\`. Kiedy publikujesz zdarzenie (\`applicationEventPublisher.publishEvent(event)\`), Spring automatycznie wywołuje wszystkie metody oznaczone \`@EventListener\`, które nasłuchują na ten typ zdarzenia.
`
    },
    {
      title: "13. Wzorce Behawioralne: Template Method",
      content: `
> **Template Method definiuje szkielet algorytmu w klasie bazowej, pozwalając podklasom nadpisać konkretne kroki bez zmiany ogólnej struktury.**

\`\`\`java
public abstract class DataMiner {

    // TEMPLATE METHOD — definiuje szkielet algorytmu
    // Metoda finalna, nie może być nadpisana!
    public final void mine(String path) {
        openFile(path);
        String rawData = extractData();
        List<String> parsed = parseData(rawData);
        analyzeData(parsed);
        generateReport(parsed);
        closeFile();
    }

    // Kroki wspólne — implementacja w klasie bazowej
    void generateReport(List<String> data) {
        System.out.println("Raport: znaleziono " + data.size() + " rekordów.");
    }

    // Kroki abstrakcyjne — MUSZĄ być zaimplementowane przez podklasy
    protected abstract void openFile(String path);
    protected abstract String extractData();
    protected abstract List<String> parseData(String rawData);
    protected abstract void analyzeData(List<String> data);
    protected abstract void closeFile();
}

public class CsvDataMiner extends DataMiner {
    @Override
    protected void openFile(String path) { System.out.println("Otwieranie CSV: " + path); }
    @Override
    protected String extractData() { return "jan,28\\nmaria,35"; }
    @Override
    protected List<String> parseData(String rawData) {
        return List.of(rawData.split("\\\\n"));
    }
    @Override
    protected void analyzeData(List<String> data) {
        System.out.println("Analiza " + data.size() + " wierszy CSV...");
    }
    @Override
    protected void closeFile() { System.out.println("Zamknięto CSV."); }
}

public class JsonDataMiner extends DataMiner {
    // ... analogiczna implementacja dla JSON
}
\`\`\`
\`\`\`java
DataMiner miner = new CsvDataMiner();
miner.mine("dane.csv");
// Otwieranie CSV: dane.csv
// Analiza 2 wierszy CSV...
// Raport: znaleziono 2 rekordów.
// Zamknięto CSV.
\`\`\`

Szkielet algorytmu (\`mine()\`) jest taki sam, ale każda podklasa realizuje kroki na swój sposób.
`
    },
    {
      title: "14. Podsumowanie: SOLID + Wzorce — Tabela Referencyjna",
      content: `
### Zasady SOLID — krótki przegląd

| Zasada | Akronim | Esencja |
|--------|---------|---------|
| Single Responsibility | **S** | Jedna klasa = jeden powód do zmiany |
| Open/Closed | **O** | Rozszerzaj przez nowe klasy, nie modyfikuj starych |
| Liskov Substitution | **L** | Podklasa musi działać wszędzie tam, gdzie klasa bazowa |
| Interface Segregation | **I** | Wiele małych interfejsów > jeden duży |
| Dependency Inversion | **D** | Zależ od abstrakcji, nie od konkretnych klas |

### Wzorce — krótki przegląd

| Wzorzec | Kategoria | Kiedy używać | Przykład w Javie/Springu |
|---------|-----------|--------------|--------------------------|
| **Singleton** | Kreacyjny | Jedna instancja w całej aplikacji | Spring Bean (domyślny scope) |
| **Factory Method** | Kreacyjny | Tworzenie obiektów bez ujawniania klasy | \`Calendar.getInstance()\` |
| **Builder** | Kreacyjny | Obiekt z wieloma opcjonalnymi parametrami | \`StringBuilder\`, Lombok \`@Builder\` |
| **Adapter** | Strukturalny | Integracja niekompatybilnych interfejsów | \`Arrays.asList()\`, \`InputStreamReader\` |
| **Decorator** | Strukturalny | Dodawanie zachowań bez zmiany klasy | \`BufferedReader(FileReader)\` |
| **Proxy** | Strukturalny | Kontrola dostępu, lazy loading, logowanie | Spring AOP, \`@Transactional\` |
| **Strategy** | Behawioralny | Wymienialny algorytm | \`Comparator\`, \`Predicate\` |
| **Observer** | Behawioralny | Reagowanie na zdarzenia | Spring \`@EventListener\` |
| **Template Method** | Behawioralny | Stały szkielet algorytmu, zmienne kroki | \`HttpServlet.doGet()/doPost()\` |

> [!TIP]
> Nie musisz zapamiętywać wszystkich wzorców na raz. Najważniejsze przed Springiem to: **Singleton**, **Factory**, **Proxy**, **Strategy** i **Observer** — oraz zrozumienie zasady **DIP / Dependency Injection**.
`
    }
  ],
  quiz: [
    {
      question: "Która zasada SOLID mówi, że klasa powinna mieć tylko jeden powód do zmiany?",
      options: [
        "Open/Closed Principle",
        "Single Responsibility Principle",
        "Liskov Substitution Principle",
        "Dependency Inversion Principle"
      ],
      answer: 1,
      explanation: "Single Responsibility Principle (SRP) — klasa powinna odpowiadać za jedną, dobrze zdefiniowaną odpowiedzialność. Jeśli klasa ma wiele powodów do zmiany, powinna zostać podzielona."
    },
    {
      question: "Czym jest Dependency Injection (DI)?",
      options: [
        "Techniką tworzenia zależności wewnątrz klasy za pomocą operatora new",
        "Wzorcem, w którym obiekt NIE tworzy swoich zależności sam, ale otrzymuje je z zewnątrz (np. przez konstruktor)",
        "Mechanizmem automatycznego usuwania nieużywanych obiektów z pamięci",
        "Sposobem na ukrycie implementacji za interfejsem"
      ],
      answer: 1,
      explanation: "DI to technika realizacji zasady DIP (Dependency Inversion Principle). Obiekt deklaruje, czego potrzebuje (przez konstruktor lub adnotację), a kontener (np. Spring) 'wstrzykuje' odpowiednią implementację."
    },
    {
      question: "Który wzorzec projektowy jest fundamentem mechanizmu @Transactional w Springu?",
      options: [
        "Observer",
        "Singleton",
        "Proxy",
        "Factory Method"
      ],
      answer: 2,
      explanation: "Spring tworzy obiekt Proxy, który 'owija' oryginalny obiekt i dodaje logikę transakcyjną (otwieranie transakcji przed wywołaniem metody i commitowanie po jej zakończeniu). To klasyczny wzorzec Proxy."
    },
    {
      question: "Jaka jest różnica między wzorcami Decorator a Proxy?",
      options: [
        "Nie ma różnicy, to synonimy",
        "Decorator dodaje NOWE zachowanie (np. szyfrowanie), a Proxy kontroluje DOSTĘP do istniejącego obiektu (np. lazy loading, autoryzacja)",
        "Proxy może mieć wiele warstw, a Decorator nie",
        "Decorator działa tylko z interfejsami, a Proxy z klasami abstrakcyjnymi"
      ],
      answer: 1,
      explanation: "Choć strukturalnie są podobne (oba opakowują obiekt o tym samym interfejsie), ich intencje się różnią. Decorator wzbogaca funkcjonalność, a Proxy kontroluje lub zarządza cyklem życia obiektu docelowego."
    },
    {
      question: "Który z poniższych przykładów najlepiej ilustruje wzorzec Strategy w standardowej Javie?",
      options: [
        "System.out.println()",
        "Comparator<T> przekazywany do metody sort()",
        "StringBuilder",
        "HashMap"
      ],
      answer: 1,
      explanation: "Comparator<T> to klasyczny przykład wzorca Strategy — definiuje algorytm porównywania (strategię) jako obiekt, który można wymieniać. Metoda sort() nie wie, jak porównywać elementy — deleguje to do przekazanej strategii."
    }
  ]
};
