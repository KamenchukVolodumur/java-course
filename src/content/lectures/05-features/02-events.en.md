---
title: Events
description: The observer pattern in Java — the event object, the listener interface, a publisher with listener registration, encapsulation, thread safety, unsubscribing and memory leaks, PropertyChangeSupport, event-driven programming.
---

## Events

An **event** is a mechanism through which an object (the **publisher**) notifies other objects (the **subscribers**) that something has happened. It is an implementation of the **Observer** pattern, which makes it possible to build loosely coupled components: the publisher does not know who will react and how.

Java has no separate keyword for events. An event is built from ordinary language elements:

1. **The event object** — data about what happened.
2. **The listener interface** — a functional interface with a handler method.
3. **The publisher** — a class that stores a list of listeners, provides subscribe/unsubscribe methods and dispatches events.

This approach is used by Swing and JavaFX (`ActionListener`, `ChangeListener`), servlets (`ServletContextListener`), Spring (`ApplicationListener`) and custom libraries.

### 1. Event Data

An event is described by a small immutable object: a record or a subclass of `java.util.EventObject`, which stores the event source (`getSource()`). Besides the fact of the event, it carries the details: the old and new price, the click coordinates and so on.

```java
public record PriceChangedEvent(Product source, BigDecimal oldPrice, BigDecimal newPrice) { }
```

### 2. The Listener Interface

```java
@FunctionalInterface
public interface PriceChangedListener {
    void priceChanged(PriceChangedEvent event);
}
```

A functional interface makes it possible to subscribe with a lambda or a method reference.

### 3. The Publisher

The publisher keeps the listeners in a **private** list and exposes only the `add...Listener` and `remove...Listener` methods. Dispatching is done by a protected `fire...` method, so only the class itself (and subclasses, which may change the dispatch behavior) can raise the event.

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

### Subscribing

A subscriber provides a method compatible with the listener interface:

```java
public class Notifier {
    public void onPriceChanged(PriceChangedEvent e) {
        System.out.printf("The price of %s changed: %s -> %s%n",
                e.source().name(), e.oldPrice(), e.newPrice());
    }
}

var product = new Product("Laptop", new BigDecimal("1199.90"));
var notifier = new Notifier();

PriceChangedListener listener = notifier::onPriceChanged;   // keep it to unsubscribe later
product.addPriceChangedListener(listener);
product.addPriceChangedListener(e -> System.out.println("log: " + e));

product.setPrice(product.price().subtract(new BigDecimal("200.00")));
// The price of Laptop changed: 1199.90 -> 999.90
// log: PriceChangedEvent[source=..., oldPrice=1199.90, newPrice=999.90]

product.removePriceChangedListener(listener);               // unsubscribing
```

> [!WARNING]
> You can unsubscribe only with **the same object** you subscribed with. Every evaluation of `notifier::onPriceChanged` or of a capturing lambda creates a **new** object, so `remove(notifier::onPriceChanged)` removes nothing. Keep a listener you will need to remove in a variable or a field.

## Encapsulation

Why is the list of listeners private rather than a public field `List<PriceChangedListener>`? If the list were accessible from outside, any code could:

* dispatch an event on behalf of the publisher (`product.listeners.forEach(l -> l.priceChanged(fake))`);
* remove other subscribers' listeners (`product.listeners.clear()`).

The `add`/`remove` methods expose **only** subscribing and unsubscribing. Only the owner can dispatch the event. The subscription methods can be extended with logic: argument validation, logging, limiting the number of listeners.

## Thread Safety and Dispatch Behavior

* Listeners are called **synchronously**, in the thread that changed the state, in subscription order.
* If a listener throws an exception, without extra protection the remaining listeners will not receive the event and the exception will propagate out of `setPrice`. Libraries often catch each listener's exceptions separately and log them.
* A listener may want to unsubscribe **during** dispatch. With an ordinary `ArrayList` this would give a `ConcurrentModificationException`. **`CopyOnWriteArrayList`** iterates over a snapshot of the list, so modifications during iteration are safe. It is also safe for multiple threads. Listeners are read often and changed rarely, so copying on write is cheap here.

```java
protected void firePriceChanged(PriceChangedEvent e) {
    for (PriceChangedListener l : priceListeners) {
        try {
            l.priceChanged(e);
        } catch (RuntimeException ex) {
            System.err.println("Listener " + l + " threw an exception: " + ex);   // do not stop the dispatch
        }
    }
}
```

## Memory Leaks

The publisher holds **strong references** to its listeners. If the publisher lives long (a global model, a service) while the subscriber should live briefly (a window, a screen, a session), a forgotten unsubscribe prevents the garbage collector from freeing the subscriber — and everything it refers to. This is the most common cause of memory leaks in GUI applications.

Solutions:

* unsubscribe when the subscriber closes (`close()`, `dispose()`, `onDestroy()`);
* return a "subscription" object from `add...Listener` that unsubscribes when closed:

```java
public AutoCloseable onPriceChanged(PriceChangedListener l) {
    priceListeners.add(l);
    return () -> priceListeners.remove(l);
}

try (var subscription = product.onPriceChanged(e -> System.out.println(e))) {
    product.setPrice(BigDecimal.TEN);
}   // automatic unsubscription here
```

## PropertyChangeSupport

For the typical "an object's property has changed" event, the standard library has a ready-made mechanism in the `java.beans` package: `PropertyChangeSupport` stores listeners and dispatches a `PropertyChangeEvent` with the property name and the old and new values.

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
        changes.firePropertyChange("balance", old, newBalance);   // does not dispatch if old.equals(new)
    }
}

Account acc = new Account();
acc.addPropertyChangeListener("balance",
        e -> System.out.println(e.getPropertyName() + ": " + e.getOldValue() + " -> " + e.getNewValue()));
acc.setBalance(new BigDecimal("50"));     // balance: 0 -> 50
```

## Event-Driven Programming

Event-driven programming is a paradigm in which the flow of control is determined by events occurring asynchronously. Unlike the procedural approach, where the program runs in a predetermined sequence, the main logic here is passive: it waits for events and reacts to them.

All user interfaces are built on this. User actions (a button click, a text change) produce events that change the application's state. A state change, in turn, produces new events, and the interface updates automatically to reflect the new state.

### Example

* `Product` is a **publisher**: it notifies about changes of the price and of the stock level.
* `Notifier` and `ShoppingCart` are **subscribers** of `Product`. `Notifier` reacts to stock changes, `ShoppingCart` to price changes, in order to recalculate the cart total.
* `ShoppingCart` is at the same time a **publisher** for `Display`: after every change of the cart it announces that the view needs updating.

```text
             PriceChanged                    CartUpdated
 Product ─────────────────► ShoppingCart ─────────────────► Display
    │       StockChanged
    └─────────────────────► Notifier
```

A chain of reactions arises: a change in `Product` updates `ShoppingCart`, which in turn updates `Display`.

```java
public class ShoppingCart {
    private final Map<Product, Integer> items = new LinkedHashMap<>();
    private final List<Consumer<BigDecimal>> cartUpdated = new CopyOnWriteArrayList<>();
    private final PriceChangedListener onPrice = e -> fireCartUpdated();   // one field, to be able to unsubscribe

    public void add(Product p, int qty) {
        if (items.merge(p, qty, Integer::sum) == qty) {    // a new product in the cart
            p.addPriceChangedListener(onPrice);
        }
        fireCartUpdated();
    }

    public void remove(Product p) {
        if (items.remove(p) != null) {
            p.removePriceChangedListener(onPrice);         // do not keep unnecessary subscriptions
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
cart.addCartUpdatedListener(total -> System.out.println("Display: total due " + total));
cart.add(laptop, 2);                              // Display: total due 1999.80
laptop.setPrice(new BigDecimal("899.90"));        // Display: total due 1799.80
```

> [!TIP]
> Events that must be handled **asynchronously** (in another thread, with buffering and rate control) are covered in the "Concurrency" chapter: the `Flow` API and reactive streams.
