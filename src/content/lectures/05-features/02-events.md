---
title: Події
description: Патерн спостерігача в Java — об'єкт події, інтерфейс слухача, видавець з реєстрацією слухачів, інкапсуляція, потокобезпечність, відписка й витоки пам'яті, PropertyChangeSupport, подієво-орієнтоване програмування.
---

## Події

**Подія** — механізм, через який об'єкт (**видавець**, publisher) повідомляє інші об'єкти (**підписників**, subscribers) про те, що щось сталося. Це реалізація патерну **Observer** (спостерігач), що дозволяє будувати слабко пов'язані компоненти: видавець не знає, хто і як реагуватиме.

Окремого ключового слова для подій у Java немає. Подію реалізують зі звичайних елементів мови:

1. **Об'єкт події** — дані про те, що сталося.
2. **Інтерфейс слухача** (listener) — функціональний інтерфейс з методом-обробником.
3. **Видавець** — клас, що зберігає список слухачів, дає методи підписки/відписки і розсилає події.

Цей підхід використовують Swing і JavaFX (`ActionListener`, `ChangeListener`), сервлети (`ServletContextListener`), Spring (`ApplicationListener`) і власні бібліотеки.

### 1. Дані події

Подію описує невеликий незмінний об'єкт: record або підклас `java.util.EventObject`, який зберігає джерело події (`getSource()`). Окрім самого факту події, він передає подробиці: стару й нову ціну, координати кліку тощо.

```java
public record PriceChangedEvent(Product source, BigDecimal oldPrice, BigDecimal newPrice) { }
```

### 2. Інтерфейс слухача

```java
@FunctionalInterface
public interface PriceChangedListener {
    void priceChanged(PriceChangedEvent event);
}
```

Функціональний інтерфейс дозволяє підписуватися лямбдою або посиланням на метод.

### 3. Видавець

Видавець зберігає слухачів у **приватному** списку й надає лише методи `add...Listener` і `remove...Listener`. Розсилку робить захищений метод `fire...`, тож викликати подію може лише сам клас (і підкласи, які можуть змінити поведінку розсилки).

```java
public class Product {
    private final String name;
    private BigDecimal price;
    private final List<PriceChangedListener> priceListeners = new CopyOnWriteArrayList<>();

    public Product(String name, BigDecimal price) {
        this.name = name;
        this.price = price;
    }

    public String name() { return name; }
    public BigDecimal price() { return price; }

    public void setPrice(BigDecimal newPrice) {
        if (newPrice.compareTo(price) == 0) return;
        BigDecimal oldPrice = price;
        price = newPrice;
        firePriceChanged(new PriceChangedEvent(this, oldPrice, newPrice));
    }

    public void addPriceChangedListener(PriceChangedListener l) {
        priceListeners.add(Objects.requireNonNull(l));
    }

    public void removePriceChangedListener(PriceChangedListener l) {
        priceListeners.remove(l);
    }

    protected void firePriceChanged(PriceChangedEvent e) {
        for (PriceChangedListener l : priceListeners) {
            l.priceChanged(e);
        }
    }
}
```

### Підписка

Підписник надає метод, сумісний з інтерфейсом слухача:

```java
public class Notifier {
    public void onPriceChanged(PriceChangedEvent e) {
        System.out.printf("Ціна %s змінилася: %s -> %s%n",
                e.source().name(), e.oldPrice(), e.newPrice());
    }
}

var product = new Product("Laptop", new BigDecimal("1199.90"));
var notifier = new Notifier();

PriceChangedListener listener = notifier::onPriceChanged;   // збережемо, щоб потім відписатися
product.addPriceChangedListener(listener);
product.addPriceChangedListener(e -> System.out.println("лог: " + e));

product.setPrice(product.price().subtract(new BigDecimal("200.00")));
// Ціна Laptop змінилася: 1199.90 -> 999.90
// лог: PriceChangedEvent[source=..., oldPrice=1199.90, newPrice=999.90]

product.removePriceChangedListener(listener);               // відписка
```

> [!WARNING]
> Відписатися можна лише **тим самим об'єктом**, який підписали. Кожне обчислення `notifier::onPriceChanged` чи лямбди з захопленням створює **новий** об'єкт, тож `remove(notifier::onPriceChanged)` нічого не видалить. Слухача, якого доведеться видаляти, зберігайте в змінній або полі.

## Інкапсуляція

Чому список слухачів приватний, а не публічне поле `List<PriceChangedListener>`? Якби список був доступний ззовні, будь-який код міг би:

* розіслати подію від імені видавця (`product.listeners.forEach(l -> l.priceChanged(fake))`);
* видалити чужих слухачів (`product.listeners.clear()`).

Методи `add`/`remove` дають назовні **лише** підписку й відписку. Розсилати подію може тільки власник. Методи підписки можна доповнити логікою: перевіркою аргументів, логуванням, обмеженням кількості слухачів.

## Потокобезпечність і поведінка розсилки

* Слухачі викликаються **синхронно**, у потоці, що змінив стан, і в порядку підписки.
* Якщо слухач кидає виняток, без додаткового захисту решта слухачів не отримає подію, а виняток вилетить із `setPrice`. Бібліотеки часто перехоплюють винятки кожного слухача окремо й логують їх.
* Слухач може захотіти відписатися **під час** розсилки. Зі звичайним `ArrayList` це дало б `ConcurrentModificationException`. **`CopyOnWriteArrayList`** обходить знімок списку, тож зміни під час обходу безпечні. Він також безпечний для кількох потоків. Слухачів читають часто, а змінюють рідко, тож копіювання при записі тут дешеве.

```java
protected void firePriceChanged(PriceChangedEvent e) {
    for (PriceChangedListener l : priceListeners) {
        try {
            l.priceChanged(e);
        } catch (RuntimeException ex) {
            System.err.println("Слухач " + l + " кинув виняток: " + ex);   // не зупиняти розсилку
        }
    }
}
```

## Витоки пам'яті

Видавець тримає **сильні посилання** на слухачів. Якщо видавець живе довго (глобальна модель, сервіс), а підписник має прожити недовго (вікно, екран, сесія), то забута відписка не дає збирачеві сміття звільнити підписника — і все, на що той посилається. Це найпоширеніша причина витоків пам'яті в GUI-застосунках.

Рішення:

* відписуватися, коли підписник закривається (`close()`, `dispose()`, `onDestroy()`);
* повертати з `add...Listener` об'єкт-«підписку», який відписує при закритті:

```java
public AutoCloseable onPriceChanged(PriceChangedListener l) {
    priceListeners.add(l);
    return () -> priceListeners.remove(l);
}

try (var subscription = product.onPriceChanged(e -> System.out.println(e))) {
    product.setPrice(BigDecimal.TEN);
}   // тут автоматична відписка
```

## PropertyChangeSupport

Для типової події «змінилася властивість об'єкта» стандартна бібліотека має готовий механізм у пакеті `java.beans`: `PropertyChangeSupport` зберігає слухачів і розсилає `PropertyChangeEvent` з назвою властивості, старим і новим значенням.

```java
public class Account {
    private final PropertyChangeSupport changes = new PropertyChangeSupport(this);
    private BigDecimal balance = BigDecimal.ZERO;

    public void addPropertyChangeListener(String property, PropertyChangeListener l) {
        changes.addPropertyChangeListener(property, l);
    }

    public void removePropertyChangeListener(String property, PropertyChangeListener l) {
        changes.removePropertyChangeListener(property, l);
    }

    public void setBalance(BigDecimal newBalance) {
        BigDecimal old = balance;
        balance = newBalance;
        changes.firePropertyChange("balance", old, newBalance);   // не розсилає, якщо old.equals(new)
    }
}

Account acc = new Account();
acc.addPropertyChangeListener("balance",
        e -> System.out.println(e.getPropertyName() + ": " + e.getOldValue() + " -> " + e.getNewValue()));
acc.setBalance(new BigDecimal("50"));     // balance: 0 -> 50
```

## Подієво-орієнтоване програмування

Подієво-орієнтоване програмування — парадигма, у якій потік керування визначають події, що виникають асинхронно. На відміну від процедурного підходу, де програма виконується в заздалегідь визначеній послідовності, основна логіка тут пасивна: вона чекає подій і реагує на них.

На цьому побудовано всі інтерфейси користувача. Дії користувача (клік кнопки, зміна тексту) породжують події, що змінюють стан застосунку. Зміна стану, своєю чергою, породжує нові події, і інтерфейс автоматично оновлюється, відображаючи новий стан.

### Приклад

* `Product` — **видавець**: повідомляє про зміну ціни й залишку на складі.
* `Notifier` і `ShoppingCart` — **підписники** `Product`. `Notifier` реагує на зміну залишку, `ShoppingCart` — на зміну ціни, щоб перерахувати суму кошика.
* `ShoppingCart` водночас є **видавцем** для `Display`: після кожної зміни кошика він повідомляє, що вигляд треба оновити.

```text
             PriceChanged                    CartUpdated
 Product ─────────────────► ShoppingCart ─────────────────► Display
    │       StockChanged
    └─────────────────────► Notifier
```

Виникає ланцюжок реакцій: зміна в `Product` оновлює `ShoppingCart`, а той оновлює `Display`.

```java
public class ShoppingCart {
    private final Map<Product, Integer> items = new LinkedHashMap<>();
    private final List<Consumer<BigDecimal>> cartUpdated = new CopyOnWriteArrayList<>();
    private final PriceChangedListener onPrice = e -> fireCartUpdated();   // одне поле, щоб відписуватися

    public void add(Product p, int qty) {
        if (items.merge(p, qty, Integer::sum) == qty) {    // новий товар у кошику
            p.addPriceChangedListener(onPrice);
        }
        fireCartUpdated();
    }

    public void remove(Product p) {
        if (items.remove(p) != null) {
            p.removePriceChangedListener(onPrice);         // не тримати зайвих підписок
            fireCartUpdated();
        }
    }

    public BigDecimal total() {
        return items.entrySet().stream()
                .map(e -> e.getKey().price().multiply(BigDecimal.valueOf(e.getValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addCartUpdatedListener(Consumer<BigDecimal> l) { cartUpdated.add(l); }

    private void fireCartUpdated() {
        BigDecimal total = total();
        cartUpdated.forEach(l -> l.accept(total));
    }
}

var laptop = new Product("Laptop", new BigDecimal("999.90"));
var cart = new ShoppingCart();
cart.addCartUpdatedListener(total -> System.out.println("Display: до сплати " + total));
cart.add(laptop, 2);                              // Display: до сплати 1999.80
laptop.setPrice(new BigDecimal("899.90"));        // Display: до сплати 1799.80
```

> [!TIP]
> Подій, які мають оброблятися **асинхронно** (в іншому потоці, з буферизацією та керуванням швидкістю), стосується розділ «Конкурентність»: `Flow` API і реактивні потоки.
