export const lab11 = {
  id: "Lab11",
  title: "Лабораторна 11: Система Замовлень з Патернами Проектування",
  description: "Побудова повноцінної системи обробки замовлень, яка використовує Builder, Factory, Strategy, Observer та Decorator у зв'язці — як у реальному e-commerce бекенді.",
  sections: [
    {
      title: "Опис завдання",
      content: `
> [!NOTE]
> **Рекомендовані лекції для цієї лаби:** Лекція 16 (SOLID та Design Patterns — теорія) та Лекція 21 (Design Patterns в практиці — антипатерни, композиція).

Ви будуєте ядро системи замовлень для інтернет-магазину. Завдання побудовано як **послідовний рефакторинг**: ви почнете з простого коду "в лоб" і крок за кроком перетворите його на гнучку, розширювану архітектуру за допомогою патернів проектування.

**Кінцева система буде вміти:**
1. Створювати складні замовлення з багатьма параметрами (Builder).
2. Автоматично вибирати стратегію нарахування знижки залежно від типу клієнта (Factory + Strategy).
3. Сповіщувати різні підсистеми (склад, email, аналітику) про нове замовлення без жорсткої прив'язки (Observer).
4. Додавати нові обгортки до замовлення (подарункове пакування, страхування) без зміни базового класу (Decorator).
`
    },
    {
      title: "Task 1: Builder — Створення замовлення (2 бали)",
      content: `
Замовлення (\`Order\`) має багато полів: список товарів, адресу доставки, спосіб оплати, коментар, промокод, номер телефону. Більшість з них — опціональні.

### Ваше завдання:
1. Створіть Record або клас \`OrderItem\`:
\`\`\`java
public record OrderItem(String productName, double price, int quantity) {
    public double total() {
        return price * quantity;
    }
}
\`\`\`

2. Створіть клас \`Order\` з приватним конструктором та вкладеним класом \`Builder\`:
\`\`\`java
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.time.LocalDateTime;

public class Order {
    private final String orderId;
    private final List<OrderItem> items;
    private final String deliveryAddress;
    private final String paymentMethod;
    private final String customerEmail;
    private final String comment;          // Opcjonalne
    private final String promoCode;        // Opcjonalne
    private final LocalDateTime createdAt;

    private Order(Builder builder) {
        // TODO: Przepisz pola z buildera
        // WAŻNE: Użyj Collections.unmodifiableList() na liście itemów (Immutability!)
        // WAŻNE: Użyj Objects.requireNonNull() na polach wymaganych (orderId, items, customerEmail)
        this.orderId = null;        // <- zmień na builder.orderId
        this.items = List.of();     // <- zmień na Collections.unmodifiableList(builder.items)
        this.deliveryAddress = null;
        this.paymentMethod = null;
        this.customerEmail = null;
        this.comment = null;
        this.promoCode = null;
        this.createdAt = LocalDateTime.now();
    }

    public static Builder builder() { return new Builder(); }
    
    // Metoda obliczająca sumę zamówienia
    public double subtotal() {
        return items.stream().mapToDouble(OrderItem::total).sum();
    }

    // TODO: Gettery (orderId(), items(), customerEmail(), itd.)

    public static class Builder {
        private String orderId;
        private final List<OrderItem> items = new ArrayList<>();
        private String deliveryAddress;
        private String paymentMethod = "KARTA";   // Domyślna wartość
        private String customerEmail;
        private String comment;
        private String promoCode;

        public Builder orderId(String orderId) { 
            this.orderId = orderId; 
            return this; 
        }
        
        // TODO: Zaimplementuj metody: deliveryAddress(), paymentMethod(), 
        //       customerEmail(), comment(), promoCode()
        //       Każda metoda musi zwracać 'this' (return this)!

        public Builder addItem(String name, double price, int quantity) {
            this.items.add(new OrderItem(name, price, quantity));
            return this;
        }

        public Order build() {
            // TODO: Walidacja — rzuć IllegalStateException jeśli:
            //   - orderId jest null/pusty
            //   - items jest pusta
            //   - customerEmail jest null/pusty
            return new Order(this);
        }
    }
}
\`\`\`

### Перевірка:
\`\`\`java
Order order = Order.builder()
    .orderId("ORD-2024-001")
    .customerEmail("jan@example.com")
    .addItem("Laptop", 3999.99, 1)
    .addItem("Mysz bezprzewodowa", 149.99, 2)
    .deliveryAddress("ul. Marszałkowska 10, Warszawa")
    .promoCode("LATO20")
    .build();

System.out.println("Zamówienie: " + order.orderId());
System.out.println("Suma: " + order.subtotal()); 
// Powinno wydrukować: 4299.97 (3999.99 + 149.99*2)
\`\`\`
`
    },
    {
      title: "Task 2: Strategy + Factory — Система знижок (2 бали)",
      content: `
Різні типи клієнтів отримують різну знижку:
* **REGULAR** — без знижки (0%).
* **PREMIUM** — 10%.
* **VIP** — 20% + безкоштовна доставка.
* Якщо є **промокод** "LATO20" — додатково 5%.

### Ваше завдання:
1. Створіть інтерфейс стратегії:
\`\`\`java
@FunctionalInterface
public interface DiscountStrategy {
    /**
     * Oblicza kwotę zniżki dla podanej sumy zamówienia.
     * @param subtotal suma zamówienia przed zniżką
     * @return kwota zniżki (nie procent, ale konkretna wartość w złotych!)
     */
    double calculateDiscount(double subtotal);
}
\`\`\`

2. Створіть конкретні стратегії:
\`\`\`java
public class RegularDiscount implements DiscountStrategy {
    public double calculateDiscount(double subtotal) {
        return 0.0;   // Brak zniżki
    }
}

public class PremiumDiscount implements DiscountStrategy {
    public double calculateDiscount(double subtotal) {
        return subtotal * 0.10;   // 10%
    }
}

public class VipDiscount implements DiscountStrategy {
    public double calculateDiscount(double subtotal) {
        return subtotal * 0.20;   // 20%
    }
}
\`\`\`

3. Створіть Фабрику:
\`\`\`java
public class DiscountFactory {
    
    public static DiscountStrategy create(String customerType) {
        // TODO: Użyj switch expression (Java 17+)
        // "REGULAR" -> new RegularDiscount()
        // "PREMIUM" -> new PremiumDiscount()
        // "VIP"     -> new VipDiscount()
        // default   -> throw new IllegalArgumentException(...)
        return null;
    }

    /**
     * Tworzy KOMPOZYCJĘ strategii: bazowa zniżka + dodatkowy bonus za promokod.
     * To jest przykład kompozycji funkcji (Function Composition)!
     */
    public static DiscountStrategy createWithPromo(String customerType, String promoCode) {
        DiscountStrategy base = create(customerType);
        
        if ("LATO20".equalsIgnoreCase(promoCode)) {
            // Kompozycja: bazowa zniżka + dodatkowe 5%
            return subtotal -> base.calculateDiscount(subtotal) + (subtotal * 0.05);
        }
        
        return base;
    }
}
\`\`\`

### Перевірка:
\`\`\`java
double subtotal = 1000.0;

DiscountStrategy regular = DiscountFactory.create("REGULAR");
System.out.println("Regular: -" + regular.calculateDiscount(subtotal)); // 0.0

DiscountStrategy vip = DiscountFactory.create("VIP");
System.out.println("VIP: -" + vip.calculateDiscount(subtotal));         // 200.0

DiscountStrategy vipPromo = DiscountFactory.createWithPromo("VIP", "LATO20");
System.out.println("VIP+Promo: -" + vipPromo.calculateDiscount(subtotal)); // 250.0 (20% + 5%)
\`\`\`

> [!TIP]
> Зверніть увагу на \`createWithPromo\`: ми не створюємо новий клас! Ми використовуємо **лямбду** для композиції двох стратегій. Це надзвичайно елегантне рішення, яке стало можливим завдяки \`@FunctionalInterface\`.
`
    },
    {
      title: "Task 3: Observer — Система сповіщень (2 бали)",
      content: `
Коли замовлення оформлене, система повинна:
1. Відправити email клієнту.
2. Зменшити кількість товарів на складі.
3. Записати подію в аналітику.
4. (В майбутньому) відправити Push-повідомлення.

Якщо ви впишете це все в один метод \`placeOrder()\`, він стане монстром на 200 рядків. Кожна зміна ("додай ще SMS") потребуватиме його редагування.

### Ваше завдання:
1. Створіть Event і Listener:
\`\`\`java
// Подія — Record (незмінний об'єкт)
public record OrderPlacedEvent(Order order, double finalPrice, LocalDateTime timestamp) {}

// Інтерфейс слухача (Functional Interface!)
@FunctionalInterface
public interface OrderEventListener {
    void onOrderPlaced(OrderPlacedEvent event);
}
\`\`\`

2. Створіть EventBus для замовлень:
\`\`\`java
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class OrderEventBus {
    // CopyOnWriteArrayList — bezпечний для багатопоточності (Thread-safe)
    private final List<OrderEventListener> listeners = new CopyOnWriteArrayList<>();

    public void subscribe(OrderEventListener listener) {
        listeners.add(listener);
    }

    public void publish(OrderPlacedEvent event) {
        for (OrderEventListener listener : listeners) {
            // TODO: Wywołaj listener.onOrderPlaced(event)
            // BONUS: Opakuj w try/catch, żeby awaria jednego listenera 
            //        nie zablokowała pozostałych!
        }
    }
}
\`\`\`

3. Створіть конкретних слухачів:
\`\`\`java
public class EmailNotificationListener implements OrderEventListener {
    public void onOrderPlaced(OrderPlacedEvent event) {
        System.out.printf("📧 Email do %s: Zamówienie %s na kwotę %.2f zł potwierdzone!%n",
            event.order().customerEmail(),
            event.order().orderId(),
            event.finalPrice());
    }
}

public class InventoryListener implements OrderEventListener {
    public void onOrderPlaced(OrderPlacedEvent event) {
        // TODO: Dla każdego itemu w zamówieniu wydrukuj:
        // "📦 Magazyn: Rezerwuję [quantity]x [productName]"
    }
}

public class AnalyticsListener implements OrderEventListener {
    public void onOrderPlaced(OrderPlacedEvent event) {
        System.out.printf("📊 Analityka: Nowe zamówienie %s, przychód: %.2f zł, czas: %s%n",
            event.order().orderId(),
            event.finalPrice(),
            event.timestamp());
    }
}
\`\`\`

> [!IMPORTANT]
> Зверніть увагу на \`try/catch\` у методі \`publish\`. У реальних системах це критично: якщо слухач "Аналітики" впав з помилкою, це **не повинно** завадити відправці email-у або оновленню складу. Кожен слухач працює ізольовано.
`
    },
    {
      title: "Task 4: Decorator — Додаткові послуги (2 бали)",
      content: `
Клієнт може додати до замовлення опціональні послуги:
* **Подарункове пакування** (+25 zł).
* **Страхування доставки** (+2% від суми замовлення).
* **Експрес-доставка** (+49.99 zł).

Замість того, щоб додавати купу \`if\`-ів в клас \`Order\`, ми "обгорнемо" замовлення декораторами.

### Ваше завдання:
1. Створіть інтерфейс:
\`\`\`java
public interface PricedOrder {
    double totalPrice();
    String description();
}
\`\`\`

2. Створіть базову обгортку для \`Order\`:
\`\`\`java
public class BasicOrder implements PricedOrder {
    private final Order order;
    private final DiscountStrategy discount;

    public BasicOrder(Order order, DiscountStrategy discount) {
        this.order = order;
        this.discount = discount;
    }

    public double totalPrice() {
        double subtotal = order.subtotal();
        return subtotal - discount.calculateDiscount(subtotal);
    }

    public String description() {
        return "Zamówienie " + order.orderId();
    }
}
\`\`\`

3. Створіть декоратори:
\`\`\`java
public class GiftWrapDecorator implements PricedOrder {
    private final PricedOrder wrapped;

    public GiftWrapDecorator(PricedOrder wrapped) { this.wrapped = wrapped; }

    public double totalPrice() {
        return wrapped.totalPrice() + 25.0;
    }

    public String description() {
        return wrapped.description() + " + Pakowanie prezentowe";
    }
}

public class InsuranceDecorator implements PricedOrder {
    private final PricedOrder wrapped;

    public InsuranceDecorator(PricedOrder wrapped) { this.wrapped = wrapped; }

    public double totalPrice() {
        return wrapped.totalPrice() * 1.02;  // +2%
    }

    public String description() {
        return wrapped.description() + " + Ubezpieczenie";
    }
}

// TODO: Створіть ExpressDeliveryDecorator (+49.99 zł) за аналогією
\`\`\`

### Перевірка (Збираємо все разом!):
\`\`\`java
// 1. BUILDER — tworzymy zamówienie
Order order = Order.builder()
    .orderId("ORD-2024-042")
    .customerEmail("anna@example.com")
    .addItem("Monitor 27\\"", 1499.00, 1)
    .addItem("Kabel HDMI", 39.99, 2)
    .build();

// 2. FACTORY + STRATEGY — wybieramy zniżkę
DiscountStrategy discount = DiscountFactory.createWithPromo("PREMIUM", "LATO20");

// 3. DECORATOR — dodajemy usługi
PricedOrder pricedOrder = new BasicOrder(order, discount);
pricedOrder = new GiftWrapDecorator(pricedOrder);
pricedOrder = new InsuranceDecorator(pricedOrder);

System.out.println(pricedOrder.description());
// Zamówienie ORD-2024-042 + Pakowanie prezentowe + Ubezpieczenie

System.out.printf("Do zapłaty: %.2f zł%n", pricedOrder.totalPrice());
// Subtotal: 1578.98
// Po zniżce (15%): 1342.13
// + Pakowanie: 1367.13
// + Ubezpieczenie (2%): 1394.47

// 4. OBSERVER — powiadamiamy system
OrderEventBus eventBus = new OrderEventBus();
eventBus.subscribe(new EmailNotificationListener());
eventBus.subscribe(new InventoryListener());
eventBus.subscribe(new AnalyticsListener());

eventBus.publish(new OrderPlacedEvent(order, pricedOrder.totalPrice(), LocalDateTime.now()));
\`\`\`
`
    },
    {
      title: "Task 5 (Bonus): OrderService — Фасад (1 бал)",
      content: `
Зберіть усе в один чистий клас \`OrderService\`, який буде "входом" у систему:

\`\`\`java
public class OrderService {
    private final OrderEventBus eventBus;

    public OrderService(OrderEventBus eventBus) {
        this.eventBus = eventBus;
    }

    public void placeOrder(Order order, String customerType, 
                           boolean giftWrap, boolean insurance, boolean express) {
        
        // 1. Strategy: Wyznacz zniżkę
        DiscountStrategy discount = DiscountFactory.createWithPromo(
            customerType, order.promoCode()
        );

        // 2. Decorator: Bazowa cena + opcjonalne usługi
        PricedOrder pricedOrder = new BasicOrder(order, discount);
        if (giftWrap)  pricedOrder = new GiftWrapDecorator(pricedOrder);
        if (insurance) pricedOrder = new InsuranceDecorator(pricedOrder);
        if (express)   pricedOrder = new ExpressDeliveryDecorator(pricedOrder);

        // 3. Wydruk podsumowania
        System.out.println("═══════════════════════════════════════");
        System.out.println(pricedOrder.description());
        System.out.printf("Suma przed zniżką: %.2f zł%n", order.subtotal());
        System.out.printf("Do zapłaty:         %.2f zł%n", pricedOrder.totalPrice());
        System.out.println("═══════════════════════════════════════");

        // 4. Observer: Publikuj zdarzenie
        eventBus.publish(new OrderPlacedEvent(
            order, pricedOrder.totalPrice(), LocalDateTime.now()
        ));
    }
}
\`\`\`

### Фінальний запуск:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        // Konfiguracja Event Bus
        OrderEventBus eventBus = new OrderEventBus();
        eventBus.subscribe(new EmailNotificationListener());
        eventBus.subscribe(new InventoryListener());
        eventBus.subscribe(new AnalyticsListener());

        // Serwis
        OrderService service = new OrderService(eventBus);

        // Złożenie zamówienia
        Order order = Order.builder()
            .orderId("ORD-2024-100")
            .customerEmail("vip.client@company.com")
            .addItem("MacBook Pro 16\\"", 12999.00, 1)
            .addItem("Etui skórzane", 299.00, 1)
            .addItem("Adapter USB-C", 79.00, 3)
            .deliveryAddress("al. Jerozolimskie 100, Warszawa")
            .paymentMethod("BLIK")
            .promoCode("LATO20")
            .build();

        service.placeOrder(order, "VIP", true, true, false);
        
        // Oczekiwane wyjście:
        // ═══════════════════════════════════════
        // Zamówienie ORD-2024-100 + Pakowanie prezentowe + Ubezpieczenie
        // Suma przed zniżką: 13535.00 zł
        // Do zapłaty:         ~10356.05 zł (po zniżce 25%, +25 pakowanie, +2% ubezpieczenie)
        // ═══════════════════════════════════════
        // 📧 Email do vip.client@company.com: Zamówienie ORD-2024-100 ...
        // 📦 Magazyn: Rezerwuję 1x MacBook Pro 16"
        // 📦 Magazyn: Rezerwuję 1x Etui skórzane
        // 📦 Magazyn: Rezerwuję 3x Adapter USB-C
        // 📊 Analityka: Nowe zamówienie ORD-2024-100 ...
    }
}
\`\`\`

> [!TIP]
> Порахуйте, скільки класів ви створили. Здається, що багато? Але тепер уявіть: шеф каже "додай знижку для студентів -15%". Вам потрібно створити ОДИН клас \`StudentDiscount\` і додати ОДИН рядок у \`DiscountFactory\`. **Жоден інший файл не потребує змін.** Це і є сила патернів проектування.
`
    }
  ],
  quiz: [
    {
      question: "Dlaczego w klasie Order konstruktor jest PRYWATNY (private), a jedynym sposobem tworzenia obiektu jest Builder?",
      options: [
        "Ponieważ Java nie pozwala na publiczne konstruktory w klasach z wieloma polami.",
        "Aby wymusić walidację danych przed utworzeniem obiektu (w metodzie build()) oraz zapewnić, że obiekt zawsze jest w poprawnym stanie. Publiczny konstruktor pozwoliłby na tworzenie niepoprawnych zamówień (np. bez produktów).",
        "Aby klasa Order mogła być dziedziczona przez inne klasy zamówień.",
        "Jest to wymóg serializacji JSON — biblioteka Jackson wymaga prywatnych konstruktorów."
      ],
      answer: 1,
      explanation: "Prywatny konstruktor + Builder to gwarancja, że nie powstanie 'pusty' lub 'niepełny' obiekt Order. Metoda build() sprawdza wymagane pola ZANIM obiekt zostanie utworzony."
    },
    {
      question: "W Task 2 (Strategy) metoda createWithPromo() zwraca LAMBDĘ zamiast nowego obiektu klasy. Dlaczego to jest poprawne?",
      options: [
        "Ponieważ lambdy działają szybciej niż klasy w JVM.",
        "Ponieważ DiscountStrategy jest @FunctionalInterface (ma jedną metodę abstrakcyjną), więc lambda jest pełnoprawną implementacją tego interfejsu. Nie trzeba tworzyć nowej klasy dla każdej kombinacji zniżek.",
        "Ponieważ lambdy pozwalają na wielokrotne dziedziczenie, co jest niemożliwe z klasami.",
        "Ponieważ lambdy są automatycznie serializowalne do JSON, a klasy nie."
      ],
      answer: 1,
      explanation: "Każdy @FunctionalInterface może być zaimplementowany przez lambdę. To umożliwia elegancką kompozycję strategii (bazowa + promo) bez eksplozji małych klas."
    },
    {
      question: "Dlaczego w EventBus warto opakować wywołanie każdego listenera w try/catch?",
      options: [
        "Ponieważ bez try/catch Java nie pozwala na użycie pętli for-each.",
        "Aby zapobiec sytuacji, w której awaria jednego subskrybenta (np. AnalyticsListener rzucił NullPointerException) zablokuje wykonanie pozostałych subskrybentów (np. EmailListener nigdy nie wyśle powiadomienia).",
        "Ponieważ try/catch automatycznie powtarza wywołanie, jeśli się nie powiodło (retry mechanism).",
        "Ponieważ CopyOnWriteArrayList wymaga obsługi wyjątków ConcurrentModificationException."
      ],
      answer: 1,
      explanation: "W systemach produkcyjnych KAŻDY listener powinien być izolowany. Jeśli analityka padła, klient nadal MUSI dostać email z potwierdzeniem. To fundament niezawodności (Fault Tolerance)."
    },
    {
      question: "Jaką kluczową zaletę daje wzorzec Decorator w porównaniu z dodawaniem parametrów boolean (giftWrap, insurance) bezpośrednio do klasy Order?",
      options: [
        "Dekoratory są szybsze w działaniu, ponieważ nie alokują dodatkowej pamięci.",
        "Dekoratory można łączyć w dowolnej kolejności i dowolnych kombinacjach BEZ zmiany klasy Order. Dodanie nowej usługi (np. 'priorytetowa obsługa') to jedna nowa klasa, zero zmian w istniejącym kodzie (Open/Closed Principle).",
        "Dekoratory pozwalają na dziedziczenie klasy Order, co jest niemożliwe z polami boolean.",
        "Java nie pozwala na więcej niż 5 pól typu boolean w jednej klasie."
      ],
      answer: 1,
      explanation: "Gdybyśmy dodawali booleany do Order, każda nowa usługa wymagałaby zmiany klasy Order, Buildera i logiki obliczania ceny. Z Dekoratorem dodajemy jedną nową klasę i gotowe — istniejący kod NIE jest ruszany."
    },
    {
      question: "W tej laboratorium użyto 4 wzorców (Builder, Factory+Strategy, Observer, Decorator). Który z nich byłby NAJBARDZIEJ zbędny (over-engineering), gdyby system miał obsługiwać tylko JEDNEGO klienta z JEDNYM typem zniżki, bez żadnych dodatkowych usług?",
      options: [
        "Builder — bo nawet z jednym klientem zamówienie nadal ma wiele pól.",
        "Observer — bo powiadomienia są potrzebne zawsze, niezależnie od liczby klientów.",
        "Factory + Strategy — bo przy JEDNYM typie zniżki tworzenie Fabryki i interfejsu to niepotrzebna abstrakcja. Wystarczy zwykłe mnożenie w jednej linijce kodu.",
        "Decorator — bo zawsze warto mieć możliwość dodawania nowych usług w przyszłości."
      ],
      answer: 2,
      explanation: "To klucz do zrozumienia antywzorca Over-engineering! Jeśli jest JEDEN typ zniżki, wystarczy 'price * 0.9'. Fabryka, interfejs i klasy strategii to overkill. Ale gdy pojawi się DRUGI typ — wtedy refaktoryzuj. 'Rule of Three' w akcji!"
    }
  ]
};
