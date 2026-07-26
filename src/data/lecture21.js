export const lecture21 = {
  id: "21",
  title: "Wykład 21: Wzorce Projektowe w Praktyce — Kiedy Stosować, Kiedy Nie, i Jak Łączyć",
  description: "Praktyczne zastosowanie wzorców GoF w rzeczywistych systemach: kompozycja wzorców, antywzorce, refaktoryzacja kodu produkcyjnego oraz pułapki nadmiernej abstrakcji.",
  sections: [
    {
      title: "1. Po co ten wykład? Wzorce to nie teoria — to narzędzia",
      content: `
Na Wykładzie 16 poznaliśmy definicje wzorców GoF (Singleton, Factory, Builder, Observer, Strategy, itd.) i zasady SOLID. Ale definicja to nie zrozumienie. Prawdziwe zrozumienie przychodzi dopiero, gdy odpowiesz na trzy pytania:
1. **Kiedy** powinienem użyć tego wzorca?
2. **Kiedy NIE** powinienem go używać?
3. **Jak łączyć** kilka wzorców w jednym systemie?

Ten wykład jest praktyczny. Nie będziemy powtarzać definicji. Zamiast tego pokażemy **rzeczywiste scenariusze** z kodu produkcyjnego, antywzorce (typowe błędy) i refaktoryzacje.

> [!IMPORTANT]
> **Najważniejsza zasada:** Wzorzec projektowy stosujemy **wtedy, gdy pojawia się problem**. Nigdy nie "wymyślamy" problemu, żeby zastosować wzorzec. To się nazywa **over-engineering** i jest jednym z najczęstszych grzechów ambitnych Juniorów.
`
    },
    {
      title: "2. Builder — Kiedy konstruktor staje się koszmarem",
      content: `
### Problem (tzw. Telescoping Constructor):
Masz klasę z 8 polami, z których 5 jest opcjonalnych. Ile konstruktorów musisz napisać?
\`\`\`java
// ❌ ANTYPATTERN: Teleskopowy Konstruktor
public class HttpRequest {
    public HttpRequest(String url) { this(url, "GET", null, null, 30, false, null, null); }
    public HttpRequest(String url, String method) { this(url, method, null, null, 30, false, null, null); }
    public HttpRequest(String url, String method, String body) { this(url, method, body, null, 30, false, null, null); }
    public HttpRequest(String url, String method, String body, Map<String, String> headers) { /* ... */ }
    // ... i tak dalej, eksplozja kombinacji!
    
    public HttpRequest(String url, String method, String body, Map<String, String> headers,
                       int timeoutSeconds, boolean followRedirects, String proxyHost, Integer proxyPort) {
        // ...
    }
}
\`\`\`
Który parametr jest który? Co oznacza \`30\` i \`false\`? To **nieczytelne, kruche i niebezpieczne**.

### Rozwiązanie: Builder
\`\`\`java
// ✅ BUILDER — każdy parametr ma swoją nazwę
HttpRequest request = HttpRequest.builder()
    .url("https://api.example.com/users")
    .method("POST")
    .body("{\\"name\\": \\"Jan\\"}")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token123")
    .timeoutSeconds(10)
    .followRedirects(true)
    .build();
\`\`\`
Kod jest **samodokumentujący się**. Każdy parametr ma nazwę. Kolejność nie ma znaczenia.

### Jak zaimplementować Builder ręcznie (bez Lomboka):
\`\`\`java
public class HttpRequest {
    private final String url;
    private final String method;
    private final String body;
    private final Map<String, String> headers;
    private final int timeoutSeconds;

    // Prywatny konstruktor — NIKT nie może stworzyć obiektu bez Buildera!
    private HttpRequest(Builder builder) {
        this.url = Objects.requireNonNull(builder.url, "URL jest wymagany!");
        this.method = builder.method;
        this.body = builder.body;
        this.headers = Map.copyOf(builder.headers); // Defensywna kopia (immutability!)
        this.timeoutSeconds = builder.timeoutSeconds;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String url;
        private String method = "GET";          // Wartość domyślna
        private String body;
        private final Map<String, String> headers = new LinkedHashMap<>();
        private int timeoutSeconds = 30;        // Wartość domyślna

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder body(String body) { this.body = body; return this; }
        public Builder header(String key, String value) { 
            this.headers.put(key, value); 
            return this;   // <- Zwraca 'this', co pozwala na łańcuchowe wywoływanie (chaining)
        }
        public Builder timeoutSeconds(int seconds) { this.timeoutSeconds = seconds; return this; }
        
        public HttpRequest build() {
            return new HttpRequest(this);
        }
    }
}
\`\`\`

> [!TIP]
> W Springu wzorzec Builder jest wszechobecny: \`ResponseEntity.ok().body(data).build()\`, \`WebClient.builder().baseUrl(...).build()\`, \`MockMvc.standaloneSetup(...).build()\`. Poznając ten wzorzec teraz, będziesz w domu, gdy przejdziesz na Spring Boot.
`
    },
    {
      title: "3. Factory Method — Ukrywanie logiki tworzenia",
      content: `
### Problem:
Klient (klasa wywołująca) musi wiedzieć, którą **konkretną klasę** utworzyć, co łamie zasadę Open/Closed (OCP). Dodanie nowego typu wymaga zmiany w każdym miejscu, gdzie jest \`new\`.

\`\`\`java
// ❌ ANTYPATTERN: Klient wie za dużo
public class NotificationService {
    public void send(String channel, String message) {
        if (channel.equals("email")) {
            new EmailSender().send(message);     // Twarda zależność od klasy!
        } else if (channel.equals("sms")) {
            new SmsSender().send(message);        // Twarda zależność od klasy!
        } else if (channel.equals("push")) {
            new PushSender().send(message);       // Twarda zależność od klasy!
        }
        // Dodanie nowego kanału = zmiana TEGO kodu (naruszenie OCP!)
    }
}
\`\`\`

### Rozwiązanie: Factory Method
\`\`\`java
// Wspólny kontrakt
public interface NotificationSender {
    void send(String message);
}

// Implementacje
public class EmailSender implements NotificationSender {
    public void send(String message) { System.out.println("📧 Email: " + message); }
}
public class SmsSender implements NotificationSender {
    public void send(String message) { System.out.println("📱 SMS: " + message); }
}

// Fabryka — jedyne miejsce, które wie o konkretnych klasach
public class NotificationFactory {
    public static NotificationSender create(String channel) {
        return switch (channel.toLowerCase()) {
            case "email" -> new EmailSender();
            case "sms"   -> new SmsSender();
            case "push"  -> new PushNotificationSender();
            default -> throw new IllegalArgumentException("Nieznany kanał: " + channel);
        };
    }
}

// Klient — NIE WIE, jaką klasę dostaje. Zna tylko interfejs.
public class NotificationService {
    public void send(String channel, String message) {
        NotificationSender sender = NotificationFactory.create(channel);
        sender.send(message);
    }
}
\`\`\`

Teraz dodanie nowego kanału (\`"telegram"\`) wymaga:
1. Nowej klasy \`TelegramSender implements NotificationSender\`.
2. Nowego \`case\` w fabryce.
**Zero zmian w \`NotificationService\`!** To jest istota zasady Open/Closed.
`
    },
    {
      title: "4. Observer — System zdarzeń (Event-Driven Architecture)",
      content: `
### Problem: 
Kiedy użytkownik rejestruje się w systemie, musisz:
1. Wysłać email powitalny.
2. Utworzyć domyślny portfel.
3. Zapisać zdarzenie do logów.
4. Przyznać bonus za rejestrację.

Jeśli wpiszesz to wszystko w jedną metodę \`register()\`, klasa będzie miała 4 powody do zmiany (łamie SRP). A co jeśli jutro szef powie: "Dodaj jeszcze powiadomienie push"? Musisz edytować \`register()\`.

### Rozwiązanie: Observer (Pub/Sub)
Metoda \`register()\` nie wie, kto i co robi po rejestracji. Ona tylko **ogłasza** zdarzenie: *"Hej, ktoś się zarejestrował!"*. A zainteresowani (subskrybenci) reagują.

\`\`\`java
// 1. Zdarzenie (Event) — proste DTO
public record UserRegisteredEvent(String email, LocalDateTime timestamp) {}

// 2. Interfejs subskrybenta
@FunctionalInterface
public interface EventListener<T> {
    void onEvent(T event);
}

// 3. Magistrala zdarzeń (Event Bus)
public class EventBus {
    // Mapa: typ zdarzenia -> lista subskrybentów
    private final Map<Class<?>, List<EventListener<?>>> listeners = new ConcurrentHashMap<>();

    public <T> void subscribe(Class<T> eventType, EventListener<T> listener) {
        listeners.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>()).add(listener);
    }

    @SuppressWarnings("unchecked")
    public <T> void publish(T event) {
        List<EventListener<?>> subs = listeners.getOrDefault(event.getClass(), List.of());
        for (EventListener<?> listener : subs) {
            ((EventListener<T>) listener).onEvent(event);
        }
    }
}

// 4. Serwis rejestracji — prosty i czysty!
public class RegistrationService {
    private final EventBus eventBus;

    public RegistrationService(EventBus eventBus) { this.eventBus = eventBus; }

    public void register(String email, String password) {
        // ... logika rejestracji (zapis do bazy) ...
        
        // Publikujemy zdarzenie. NIE WIEMY, kto na nie zareaguje!
        eventBus.publish(new UserRegisteredEvent(email, LocalDateTime.now()));
    }
}
\`\`\`

### Podpinanie subskrybentów:
\`\`\`java
EventBus bus = new EventBus();

// Subskrybent 1: Wysyłka emaila
bus.subscribe(UserRegisteredEvent.class, event ->
    System.out.println("📧 Wysyłam powitalny email do: " + event.email())
);

// Subskrybent 2: Bonus
bus.subscribe(UserRegisteredEvent.class, event ->
    System.out.println("🎁 Przyznano bonus za rejestrację: " + event.email())
);

// Subskrybent 3: Log
bus.subscribe(UserRegisteredEvent.class, event ->
    System.out.println("📝 Log: nowy użytkownik " + event.email() + " o " + event.timestamp())
);

RegistrationService service = new RegistrationService(bus);
service.register("jan@example.com", "secret123");
// Wydrukuje wszystkie trzy wiadomości!
\`\`\`

Teraz dodanie powiadomienia push = jedna nowa linia \`bus.subscribe(...)\`. **Zero zmian w \`RegistrationService\`!**

> [!IMPORTANT]
> To jest dokładnie ten sam mechanizm, który używa **Spring Boot** pod nazwą \`@EventListener\`. Ucząc się tego ręcznie, rozumiesz, co Spring robi pod maską.
`
    },
    {
      title: "5. Strategy — Wymienialny algorytm w runtime",
      content: `
### Problem:
System e-commerce musi naliczać podatek. Ale stawka zależy od kraju: Polska 23%, Niemcy 19%, USA — zależy od stanu. Jeśli wpiszesz to w jeden wielki \`if/else\`, kod stanie się nieczytelny.

### Rozwiązanie: Strategy
\`\`\`java
// Interfejs strategii
@FunctionalInterface
public interface TaxStrategy {
    double calculateTax(double amount);
}

// Konkretne strategie
public class PolishTax implements TaxStrategy {
    public double calculateTax(double amount) { return amount * 0.23; }
}
public class GermanTax implements TaxStrategy {
    public double calculateTax(double amount) { return amount * 0.19; }
}

// Serwis — NIE WIE, jaki podatek nalicza. Deleguje do strategii.
public class OrderService {
    private final TaxStrategy taxStrategy;

    public OrderService(TaxStrategy taxStrategy) {
        this.taxStrategy = taxStrategy;
    }

    public double calculateTotal(double price) {
        double tax = taxStrategy.calculateTax(price);
        System.out.printf("Cena: %.2f, Podatek: %.2f, Razem: %.2f%n", price, tax, price + tax);
        return price + tax;
    }
}
\`\`\`

\`\`\`java
// Użycie — strategia wybierana w runtime!
OrderService polishShop = new OrderService(new PolishTax());
polishShop.calculateTotal(100.0); // Cena: 100.00, Podatek: 23.00, Razem: 123.00

OrderService germanShop = new OrderService(new GermanTax());
germanShop.calculateTotal(100.0); // Cena: 100.00, Podatek: 19.00, Razem: 119.00

// Dzięki @FunctionalInterface można nawet użyć lambdy:
OrderService customShop = new OrderService(amount -> amount * 0.07);
customShop.calculateTotal(100.0); // Cena: 100.00, Podatek: 7.00, Razem: 107.00
\`\`\`

> [!TIP]
> Wzorzec Strategy + Factory to potężna kombinacja. Fabryka wybiera strategię na podstawie danych (np. kraju z zamówienia), a Strategy wykonuje algorytm. W Springu można to zrealizować wstrzykując \`Map<String, TaxStrategy>\`, gdzie kluczem jest nazwa kraju.
`
    },
    {
      title: "6. Decorator — Dodawanie funkcji bez zmiany klasy",
      content: `
### Problem:
Masz interfejs \`DataSource\`, który czyta dane. Chcesz dodać:
1. Kompresję (gzip).
2. Szyfrowanie (AES).
3. Logowanie (ile bajtów przeczytano).
Ale NIE chcesz modyfikować oryginalnej klasy \`FileDataSource\`.

### Rozwiązanie: Decorator (Wrapper)
\`\`\`java
public interface DataSource {
    String readData();
    void writeData(String data);
}

// Bazowa implementacja
public class FileDataSource implements DataSource {
    private final String filename;
    public FileDataSource(String filename) { this.filename = filename; }

    public String readData() { return "surowe dane z " + filename; }
    public void writeData(String data) { System.out.println("Zapis do " + filename + ": " + data); }
}

// Bazowa klasa dekoratora
public abstract class DataSourceDecorator implements DataSource {
    protected final DataSource wrappee;    // <- Obiekt, który "owijamy"
    
    protected DataSourceDecorator(DataSource wrappee) { this.wrappee = wrappee; }
    
    public String readData() { return wrappee.readData(); }
    public void writeData(String data) { wrappee.writeData(data); }
}

// Dekorator 1: Szyfrowanie
public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource source) { super(source); }

    public void writeData(String data) {
        String encrypted = Base64.getEncoder().encodeToString(data.getBytes());
        super.writeData(encrypted);  // Szyfrujemy PRZED przekazaniem dalej
    }

    public String readData() {
        String data = super.readData();
        return new String(Base64.getDecoder().decode(data));  // Deszyfrujemy PO odczycie
    }
}

// Dekorator 2: Logowanie
public class LoggingDecorator extends DataSourceDecorator {
    public LoggingDecorator(DataSource source) { super(source); }

    public void writeData(String data) {
        System.out.println("LOG: Zapis " + data.length() + " bajtów...");
        super.writeData(data);
    }
}
\`\`\`

### Magia: Łańcuchowe owijanie (Nesting)
\`\`\`java
DataSource source = new FileDataSource("dane.txt");
source = new EncryptionDecorator(source);   // Warstwa 1: szyfrowanie
source = new LoggingDecorator(source);      // Warstwa 2: logowanie

source.writeData("Tajne dane!");
// LOG: Zapis 12 bajtów...
// Zapis do dane.txt: VGFqbmUgZGFuZSE=  (zaszyfrowane Base64!)
\`\`\`

To **dokładnie** ten sam mechanizm, który znasz z \`new BufferedReader(new InputStreamReader(new FileInputStream("plik.txt")))\`! Każda warstwa dodaje nowe zachowanie (buforowanie, dekodowanie), nie zmieniając oryginalnej klasy.
`
    },
    {
      title: "7. Antywzorce — Czego NIE robić",
      content: `
### Antywzorzec 1: Singleton z globalnym mutowalnym stanem
\`\`\`java
// ❌ ZŁO: Globalny stan + Singleton = koszmar w testach i wielowątkowości
public class AppConfig {
    private static final AppConfig INSTANCE = new AppConfig();
    private String databaseUrl = "jdbc:h2:mem:test";  // Mutowalny stan!

    public static AppConfig getInstance() { return INSTANCE; }
    public String getDatabaseUrl() { return databaseUrl; }
    public void setDatabaseUrl(String url) { this.databaseUrl = url; } // NIEBEZPIECZNE!
}
\`\`\`
**Problem:** Każdy test, który wywołuje \`setDatabaseUrl()\`, zmienia stan dla WSZYSTKICH testów. Testy stają się zależne od kolejności uruchamiania (flaky tests).

**Rozwiązanie:** Używaj Singletona TYLKO dla obiektów **bezstanowych** (Stateless) lub **niemutowalnych** (Immutable). W Springu beany \`@Service\` są singletonami, ale są bezstanowe — nie mają pól, które zmieniają się w runtime.

### Antywzorzec 2: Over-engineering (Wzorzec dla jednego przypadku)
\`\`\`java
// ❌ ZŁO: Fabryka, strategia i obserwator... dla jednego typu powiadomienia
public interface NotificationStrategy { void send(String msg); }
public class EmailNotificationStrategy implements NotificationStrategy { /* ... */ }
public class NotificationStrategyFactory { /* ... */ }
public class NotificationObserver { /* ... */ }
public class NotificationFacade { /* ... */ }
// ... 6 klas, żeby wysłać jednego emaila!

// ✅ DOBRZE: Proste rozwiązanie, jeśli jest tylko jeden kanał
public class EmailService {
    public void send(String to, String message) {
        // Bezpośrednia implementacja. Prosto, czytelnie, działa.
    }
}
\`\`\`

> [!CAUTION]
> **Złota Zasada:** Nie twórz abstrakcji "na zapas". Wprowadzaj wzorzec dopiero wtedy, gdy pojawia się **drugi** przypadek użycia. Pierwszy raz — pisz prosto. Drugi raz — refaktoryzuj do wzorca. Nazywa się to "Rule of Three" (Reguła Trzech).

### Antywzorzec 3: God Object (Boski Obiekt)
\`\`\`java
// ❌ ZŁO: Klasa, która robi WSZYSTKO
public class ApplicationManager {
    public void registerUser() { /* ... */ }
    public void processPayment() { /* ... */ }
    public void sendNotification() { /* ... */ }
    public void generateReport() { /* ... */ }
    public void updateInventory() { /* ... */ }
    // ... 3000 linii kodu, 47 metod, 0 szansy na utrzymanie
}
\`\`\`
To łamie SRP. Rozwiązanie: rozbij na \`UserService\`, \`PaymentService\`, \`NotificationService\`, \`ReportService\`, \`InventoryService\`.
`
    },
    {
      title: "8. Kompozycja wzorców — Jak łączyć je w prawdziwym systemie",
      content: `
W prawdziwych systemach wzorce **nigdy** nie występują samodzielnie. Oto jak typowy serwis e-commerce łączy 4 wzorce:

\`\`\`
┌──────────────────────────────────────────────────┐
│                   OrderService                    │
│  (otrzymuje TaxStrategy przez DI — Strategy)     │
├──────────────────────────────────────────────────┤
│                                                    │
│  1. Order order = Order.builder()                 │
│         .product("Laptop")                        │
│         .quantity(1)                               │
│         .build();                   ← BUILDER     │
│                                                    │
│  2. TaxStrategy tax =                             │
│       TaxFactory.create(country);   ← FACTORY     │
│                                                    │
│  3. double total =                                │
│       tax.calculateTax(price);      ← STRATEGY    │
│                                                    │
│  4. eventBus.publish(                             │
│       new OrderPlacedEvent(order)); ← OBSERVER    │
│                                                    │
└──────────────────────────────────────────────────┘
\`\`\`

* **Builder** tworzy złożony obiekt \`Order\`.
* **Factory** wybiera strategię podatkową na podstawie kraju.
* **Strategy** oblicza podatek bez wiedzy OrderService o stawkach.
* **Observer** powiadamia subskrybentów (magazyn, email, analitykę) bez twardych zależności.

> [!TIP]
> W **Laboratorium 11** zaimplementujesz dokładnie taki system. Zobaczysz, jak te cztery wzorce współpracują w jednym programie.
`
    }
  ],
  quiz: [
    {
      question: "Masz klasę z 12 opcjonalnymi parametrami w konstruktorze. Który wzorzec projektowy jest najlepszym rozwiązaniem?",
      options: [
        "Singleton — aby nie tworzyć wielu instancji z różnymi parametrami",
        "Factory Method — aby ukryć logikę tworzenia za metodą statyczną",
        "Builder — pozwala na czytelne ustawianie tylko tych parametrów, które są potrzebne, z domyślnymi wartościami dla reszty",
        "Observer — aby powiadomić system o nowo utworzonym obiekcie"
      ],
      answer: 2,
      explanation: "Builder rozwiązuje problem 'Telescoping Constructor'. Zamiast wielu konstruktorów z różnymi kombinacjami parametrów, Builder pozwala na łańcuchowe wywoływanie .metoda(wartość) z jasnymi nazwami i domyślnymi wartościami."
    },
    {
      question: "Czym jest antywzorzec 'Over-engineering' i jak go unikać?",
      options: [
        "Stosowaniem zbyt prostych rozwiązań, które nie skalują się. Unikamy go, dodając więcej abstrakcji.",
        "Tworzeniem zbyt wielu abstrakcji i wzorców 'na zapas', bez realnej potrzeby. Unikamy go stosując 'Rule of Three' — wprowadzamy wzorzec dopiero przy drugim lub trzecim przypadku użycia.",
        "Brakiem testów jednostkowych. Unikamy go pisząc testy dla każdej metody.",
        "Używaniem zbyt nowych wersji Javy. Unikamy go, pozostając na Java 11 LTS."
      ],
      answer: 1,
      explanation: "Over-engineering to tworzenie 'kosmicznej architektury' dla prostego problemu. 6 klas + 3 interfejsy, żeby wysłać emaila, to marnowanie czasu zespołu. Proste rozwiązanie jest lepsze, dopóki nie pojawi się realna potrzeba abstrakcji."
    },
    {
      question: "Jaką kombinację wzorców najczęściej spotkasz w Spring Boot?",
      options: [
        "Builder + Template Method",
        "Singleton (Beany) + Proxy (@Transactional) + Observer (@EventListener) + Strategy (interfejsy serwisów)",
        "Tylko Factory Method, reszta jest ukryta przez Spring",
        "Adapter + Decorator, ponieważ Spring jest zbudowany wyłącznie na strumieniach I/O"
      ],
      answer: 1,
      explanation: "Spring Boot łączy wiele wzorców: beany są Singletonami, @Transactional i @Cacheable działają przez Proxy (AOP), zdarzenia to Observer, a wstrzykiwanie interfejsów to Strategy + Dependency Injection. Rozumiejąc te wzorce, rozumiesz Springa."
    },
    {
      question: "Dlaczego Singleton z mutowalnym stanem jest uważany za antywzorzec?",
      options: [
        "Ponieważ Singleton nie może mieć pól instancyjnych, tylko statyczne.",
        "Ponieważ jest zbyt wolny — tworzenie jednej instancji blokuje wszystkie wątki.",
        "Ponieważ globalny mutowalny stan powoduje, że testy stają się zależne od kolejności uruchamiania (flaky tests), a w środowisku wielowątkowym prowadzi do Race Conditions.",
        "Ponieważ Garbage Collector nie może usunąć Singletona z pamięci, co powoduje Memory Leak."
      ],
      answer: 2,
      explanation: "Jeśli Singleton trzyma stan, który może być zmieniony (np. setDatabaseUrl()), to jeden test może zmienić ten stan i 'zanieczyścić' kolejne testy. Bezpieczny Singleton jest bezstanowy lub niemutowalny."
    }
  ]
};
