export const lab11 = {
  id: "Lab11",
  title: "Лабораторна 11: Патерни проєктування — система замовлень",
  description: "Ядро інтернет-магазину на патернах: незмінне замовлення через Builder, знижки через Strategy і Factory, сповіщення підсистем через Observer з ізоляцією помилок слухачів, додаткові послуги через Decorator і фасад OrderService, який поєднує все в один сценарій.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 05.1 «Функціональні інтерфейси й лямбди», 05.2 «Події», 14.2 «SOLID і патерни проєктування», 14.3 «Патерни на практиці» · **Час:** 3 год · **Бали:** 10

Наприкінці система вмітиме:

1. Створювати незмінні замовлення з багатьма необов'язковими параметрами (**Builder**).
2. Обирати найвигіднішу знижку з кількох можливих (**Strategy** + **Factory**).
3. Сповіщати склад, пошту й аналітику про замовлення, не знаючи про них (**Observer**).
4. Додавати пакування, страхування й доставку, не змінюючи базового розрахунку (**Decorator**).
5. Ховати все це за одним методом \`place\` (**Facade**).

\`\`\`text
src/main/java/pl/mini/shop/
├── model/      Customer  CustomerType  OrderItem  Order (+ Builder)
├── discount/   DiscountPolicy  Discount  DiscountFactory  (+ реалізації)
├── events/     OrderEvents  OrderPlaced  OrderCancelled  Inventory  Analytics
├── pricing/    Priced  BasePrice  GiftWrap  Insurance  Shipping
├── OrderService.java  OrderRequest.java  Receipt.java
└── Main.java   (наданий)
\`\`\`

### Правила

* Гроші — \`BigDecimal\` з масштабом 2 (\`setScale(2, RoundingMode.HALF_UP)\` після кожного множення).
* Модель (\`Order\`, \`OrderItem\`) незмінна: жодних сетерів, колекції — \`List.copyOf\`.

> [!CAUTION]
> Заборонено \`instanceof\` і \`switch\` за типом клієнта поза \`DiscountFactory\`: вибір стратегії має бути в одному місці. Заборонено змінювати \`BasePrice\`, щоб додати нову послугу: лише новий декоратор.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
| Патерн | Проблема | Рішення в цій лабораторній |
| --- | --- | --- |
| Builder | 6+ параметрів, більшість необов'язкові | \`Order.builder()...build()\` з валідацією в \`build()\` |
| Strategy | алгоритм знижки змінюється | \`DiscountPolicy\` — функціональний інтерфейс |
| Factory | хто вирішує, які знижки застосувати | \`DiscountFactory.best(order)\` |
| Observer | замовлення має сповістити N підсистем | \`OrderEvents.subscribe/publish\` |
| Decorator | послуги додаються в довільних комбінаціях | \`new Shipping(new Insurance(new GiftWrap(base)))\` |
| Facade | клієнтові не потрібні деталі | \`OrderService.place(request)\` |

### toBuilder — «with» для незмінних об'єктів

\`\`\`java
Order changed = order.toBuilder().promoCode("MINUS20").build();   // оригінал не змінюється
\`\`\`

### Шина подій за типом події

\`\`\`java
public <E> void subscribe(Class<E> type, Consumer<? super E> listener) {
    listeners.computeIfAbsent(type, k -> new CopyOnWriteArrayList<>()).add(listener);
}
\`\`\`

### Декоратор

\`\`\`java
public record GiftWrap(Priced inner) implements Priced {
    public BigDecimal price() { return inner.price().add(FEE); }
    public String description() { return inner.description() + "\\n+ подарункове пакування " + FEE; }
}
\`\`\`
`
    },
    {
      title: "Очікуваний вивід",
      content: `
Так має виглядати вивід \`Main\` зі стартового проєкту, коли розкоментовано всі етапи:

\`\`\`text
211.00 3 Optional.empty
OK: замовлення без товарів
OK: ціна має бути > 0
student -> 15.00
promo:MINUS20 -> 20.00
bulk -> 2.50
none -> 0.00
5 1 [до Ola: замовлення ORD-1 прийнято] 196.00
[брак товару: Миша (є 1, потрібно 2)]
0.00
товари 211.00, знижка student -15.00
+ подарункове пакування 5.00
+ страхування 4.02
+ доставка 0.00
РАЗОМ 205.02
=== ORD-0001 / Jan ===
товари 899.99, знижка vip -135.00
+ подарункове пакування 5.00
+ страхування 15.40
+ доставка 25.00
РАЗОМ 810.39
810.39 2 2
\`\`\`
`
    },
    {
      title: "Етап 1: Builder — незмінне замовлення (2 б.)",
      content: `
\`\`\`java
public enum CustomerType { REGULAR, STUDENT, VIP }
public record Customer(String name, CustomerType type) { }
public record OrderItem(String name, BigDecimal price, int qty) {
    public BigDecimal total();      // price * qty, масштаб 2
}

public final class Order {
    public static Builder builder();
    public Builder toBuilder();     // builder, заповнений поточними значеннями

    public Customer customer();
    public List<OrderItem> items();          // незмінний список
    public String shippingAddress();
    public Optional<String> promoCode();
    public BigDecimal subtotal();            // сума total() усіх позицій
    public int itemCount();                  // сума qty

    public static final class Builder {
        public Builder customer(Customer c);
        public Builder item(String name, String price, int qty);   // ціна рядком: без похибок double
        public Builder item(OrderItem item);
        public Builder clearItems();
        public Builder shipTo(String address);
        public Builder promoCode(String code);   // null або порожній -> відсутній
        public Order build();
    }
}
\`\`\`

### Валідація

| Де | Умова | Виняток |
| --- | --- | --- |
| \`item(...)\` | ціна ≤ 0 | \`IllegalArgumentException("ціна має бути > 0")\` |
| \`item(...)\` | qty ≤ 0 | \`IllegalArgumentException("кількість має бути > 0")\` |
| \`build()\` | немає клієнта | \`IllegalStateException("немає клієнта")\` |
| \`build()\` | немає позицій | \`IllegalStateException("замовлення без товарів")\` |
| \`build()\` | немає адреси | \`IllegalStateException("немає адреси доставки")\` |

> [!TIP]
> Перевірки окремих значень (ціна) робіть одразу в методі builder-а: помилку видно в тому рядку, де її зроблено. Перевірки цілісності (чи є товари) — у \`build()\`, бо порядок викликів довільний.
`
    },
    {
      title: "Етап 2: Strategy + Factory — знижки (2 б.)",
      content: `
\`\`\`java
public interface DiscountPolicy {
    String name();
    BigDecimal discount(Order order);      // >= 0, масштаб 2
}

public record Discount(String source, BigDecimal amount) { }

public final class DiscountFactory {
    public static List<DiscountPolicy> applicable(Order order);
    public static Discount best(Order order);
}
\`\`\`

### Політики

| Назва | Коли застосовується | Знижка |
| --- | --- | --- |
| \`student\` | клієнт STUDENT | 10% від subtotal, але не більше 15.00 |
| \`vip\` | клієнт VIP | 15% від subtotal |
| \`bulk\` | \`itemCount() >= 5\` | 5% від subtotal |
| \`promo:WELCOME10\` | промокод WELCOME10 | 10% від subtotal |
| \`promo:MINUS20\` | промокод MINUS20 | 20.00 фіксовано |

* \`applicable\` повертає політики в порядку: за типом клієнта → bulk → промокод. Невідомий промокод ігнорується.
* \`best\` обирає політику з **найбільшою** знижкою (за рівності — першу у списку). Знижка не може перевищувати \`subtotal\`. Якщо політик немає → \`Discount("none", 0.00)\`.
* Реалізації — лямбди або маленькі класи. Промокоди — у \`Map<String, DiscountPolicy>\`, а не в \`switch\`: новий промокод = новий запис у мапі (OCP).

> [!NOTE]
> Знижки **не сумуються**: обирається одна, найвигідніша. Це бізнес-правило, і воно міститься в одному методі \`best\`. Якщо завтра правило зміниться на «сумувати, але не більше 30%», змінити доведеться лише цей метод.
`
    },
    {
      title: "Етап 3: Observer — події замовлень (2 б.)",
      content: `
\`\`\`java
public record OrderPlaced(String orderId, Order order, BigDecimal total) { }
public record OrderCancelled(String orderId, BigDecimal total) { }

public class OrderEvents {
    public <E> void subscribe(Class<E> type, Consumer<? super E> listener);
    public void publish(Object event);
    public List<String> errors();              // повідомлення винятків слухачів, у порядку виникнення
}

public class Inventory {
    public Inventory(Map<String, Integer> initialStock);
    public void onPlaced(OrderPlaced e);       // списує залишки; брак -> IllegalStateException
    public int stock(String product);          // 0 для невідомого товару
}

public class Analytics {
    public void onPlaced(OrderPlaced e);       // revenue += total
    public void onCancelled(OrderCancelled e); // revenue -= total
    public BigDecimal revenue();               // починається з 0.00
}
\`\`\`

* \`publish\` викликає слухачів **точного** класу події в порядку підписки.
* Виняток одного слухача **не зупиняє** інших: шина перехоплює \`RuntimeException\`, додає \`e.getMessage()\` до \`errors()\` і продовжує.
* \`Inventory.onPlaced\` спочатку перевіряє **всі** позиції, і лише якщо товару вистачає на все, списує залишки (усе або нічого). Повідомлення: \`"брак товару: <назва> (є X, потрібно Y)"\` для першої позиції, якої бракує.

> [!WARNING]
> Ізоляція помилок — це компроміс. Замовлення прийнято, лист надіслано, а склад не списав товар: система в неузгодженому стані. У production таку подію відправили б у чергу на повторну обробку або на ручний розгляд (dead-letter queue). Тут ми лише фіксуємо помилку в \`errors()\`.
`
    },
    {
      title: "Етап 4: Decorator — послуги і доставка (2 б.)",
      content: `
\`\`\`java
public interface Priced {
    BigDecimal price();
    String description();
}

public record BasePrice(Order order, Discount discount) implements Priced { }
public record GiftWrap(Priced inner) implements Priced { }       // +5.00
public record Insurance(Priced inner) implements Priced { }      // +2% від inner.price(), HALF_UP
public record Shipping(Priced inner, boolean express) implements Priced { }
\`\`\`

* \`BasePrice\`: \`subtotal − discount\`. Опис: \`"товари <subtotal>, знижка <source> -<amount>"\`; якщо знижка нульова — лише \`"товари <subtotal>"\`.
* \`Shipping\`: експрес — завжди 25.00; стандарт — 15.00, але **безкоштовно**, якщо \`inner.price() >= 200.00\`.
* Кожен декоратор додає до опису **новий рядок** \`"+ <послуга> <сума>"\`: \`подарункове пакування\`, \`страхування\`, \`доставка\`.

> [!IMPORTANT]
> Порядок обгортання змінює результат: страхування рахується від ціни **разом** з пакуванням, а безкоштовна доставка залежить від суми **після** страхування. Тому в \`Main\` порядок саме такий: Base → GiftWrap → Insurance → Shipping.
`
    },
    {
      title: "Етап 5: Facade — OrderService (2 б.)",
      content: `
\`\`\`java
public record OrderRequest(Customer customer, List<OrderItem> items, String address, String promoCode,
                           boolean giftWrap, boolean insurance, boolean express) { }

public record Receipt(String orderId, String customerName, String details, BigDecimal total) {
    @Override public String toString();
    // === ORD-0001 / Jan ===
    // <details>
    // РАЗОМ <total>
    // (кожен рядок закінчується \\n)
}

public class OrderService {
    public OrderService(OrderEvents events);
    public Receipt place(OrderRequest request);
}
\`\`\`

\`place\` — це фасад, що поєднує всі попередні етапи:

1. Побудувати \`Order\` через Builder (помилки валідації пропускаються до викликача).
2. \`DiscountFactory.best(order)\`.
3. Зібрати ланцюжок декораторів за прапорцями запиту (\`Shipping\` додається **завжди**).
4. Видати ідентифікатор \`ORD-0001\`, \`ORD-0002\`, … (\`AtomicInteger\` + \`String.format("ORD-%04d", n)\`).
5. Опублікувати \`OrderPlaced\`.
6. Повернути \`Receipt\`.

> [!TIP]
> Фасад не містить бізнес-логіки: він лише **координує**. Якщо в \`place\` з'являються \`if\` щодо знижок чи цін, ця логіка потрапила не в той клас.

Закомітьте, позначте тегом \`lab11\` і запуште.
`
    }
  ],
  quiz: [
    {
      question: "Чому ціну в Builder.item передають рядком (\"45.50\"), а не double?",
      options: [
        "Так коротше",
        "new BigDecimal(45.50) з double переносить двійкову похибку; з рядка BigDecimal точний",
        "BigDecimal не має конструктора з double",
        "Так вимагає патерн Builder"
      ],
      answer: 1,
      explanation: "new BigDecimal(0.1) дорівнює 0.1000000000000000055511151231257827... Для грошей використовують рядок або BigDecimal.valueOf."
    },
    {
      question: "Яка перевага Map<String, DiscountPolicy> для промокодів над switch?",
      options: [
        "Мапа швидша",
        "Новий промокод — це новий запис, а наявний код не змінюється (OCP); мапу можна завантажити з конфігурації",
        "switch не працює з рядками",
        "Переваги немає"
      ],
      answer: 1,
      explanation: "Дані замість коду: реєстр стратегій можна розширювати без перекомпіляції логіки вибору."
    },
    {
      question: "Чому результат залежить від порядку new Insurance(new GiftWrap(base)) і new GiftWrap(new Insurance(base))?",
      options: [
        "Не залежить",
        "Кожен декоратор рахує від ціни внутрішнього шару: у першому варіанті страхування нараховується і на пакування",
        "Через округлення BigDecimal",
        "Через порядок полів у record"
      ],
      answer: 1,
      explanation: "Декоратори утворюють конвеєр, і порядок шарів — частина бізнес-правил."
    },
    {
      question: "Склад кинув виняток в onPlaced. Що має зробити шина подій у цій лабораторній?",
      options: [
        "Зупинити розсилку й скасувати замовлення",
        "Зафіксувати помилку в errors() і продовжити розсилку іншим слухачам",
        "Ігнорувати виняток без сліду",
        "Перезапустити застосунок"
      ],
      answer: 1,
      explanation: "Один зламаний слухач не повинен блокувати інших. Але помилка має лишатися видимою, щоб її можна було обробити."
    }
  ]
};
