---
title: Lab 11: Design Patterns — an Order System
description: The core of an online shop built on patterns: an immutable order through a Builder, discounts through Strategy and Factory, notifying subsystems through an Observer with listener error isolation, extra services through Decorators and an OrderService facade that combines everything into one scenario.
---

## Before You Start

> [!NOTE]
> **Lectures:** 05.1 "Functional Interfaces and Lambdas", 05.2 "Events", 14.2 "SOLID and Design Patterns", 14.3 "Patterns in Practice" · **Time:** 3 h · **Points:** 10

By the end the system will be able to:

1. Create immutable orders with many optional parameters (**Builder**).
2. Choose the most favorable discount out of several possible ones (**Strategy** + **Factory**).
3. Notify the warehouse, mail and analytics about an order without knowing about them (**Observer**).
4. Add gift wrapping, insurance and shipping without changing the base calculation (**Decorator**).
5. Hide all of this behind one `place` method (**Facade**).

```text
src/main/java/pl/mini/shop/
├── model/      Customer  CustomerType  OrderItem  Order (+ Builder)
├── discount/   DiscountPolicy  Discount  DiscountFactory  (+ implementations)
├── events/     OrderEvents  OrderPlaced  OrderCancelled  Inventory  Analytics
├── pricing/    Priced  BasePrice  GiftWrap  Insurance  Shipping
├── OrderService.java  OrderRequest.java  Receipt.java
└── Main.java   (given)
```

### Rules

* Money is `BigDecimal` with scale 2 (`setScale(2, RoundingMode.HALF_UP)` after every multiplication).
* The model (`Order`, `OrderItem`) is immutable: no setters, collections through `List.copyOf`.

> [!CAUTION]
> `instanceof` and `switch` on the customer type outside `DiscountFactory` are forbidden: the choice of strategy must be in one place. Changing `BasePrice` to add a new service is forbidden: only a new decorator.

## A Quick Theory Recap

| Pattern | Problem | Solution in this lab |
| --- | --- | --- |
| Builder | 6+ parameters, most of them optional | `Order.builder()...build()` with validation in `build()` |
| Strategy | the discount algorithm varies | `DiscountPolicy` is a functional interface |
| Factory | who decides which discounts apply | `DiscountFactory.best(order)` |
| Observer | an order must notify N subsystems | `OrderEvents.subscribe/publish` |
| Decorator | services are added in arbitrary combinations | `new Shipping(new Insurance(new GiftWrap(base)))` |
| Facade | the client does not need the details | `OrderService.place(request)` |

### toBuilder — "with" for Immutable Objects

```java
Order changed = order.toBuilder().promoCode("MINUS20").build();   // the original does not change
```

### An Event Bus Keyed by Event Type

```java
public <E> void subscribe(Class<E> type, Consumer<? super E> listener) {
    listeners.computeIfAbsent(type, k -> new CopyOnWriteArrayList<>()).add(listener);
}
```

### A Decorator

```java
public record GiftWrap(Priced inner) implements Priced {
    public BigDecimal price() { return inner.price().add(FEE); }
    public String description() { return inner.description() + "\n+ gift wrap " + FEE; }
}
```

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
211.00 3 Optional.empty
OK: order has no items
OK: price must be > 0
student -> 15.00
promo:MINUS20 -> 20.00
bulk -> 2.50
none -> 0.00
5 1 [to Ola: order ORD-1 accepted] 196.00
[out of stock: Mouse (have 1, need 2)]
0.00
items 211.00, discount student -15.00
+ gift wrap 5.00
+ insurance 4.02
+ shipping 0.00
TOTAL 205.02
=== ORD-0001 / Jan ===
items 899.99, discount vip -135.00
+ gift wrap 5.00
+ insurance 15.40
+ shipping 25.00
TOTAL 810.39
810.39 2 2
```

## Stage 1: Builder — an Immutable Order (2 pts)

```java
public enum CustomerType { REGULAR, STUDENT, VIP }
public record Customer(String name, CustomerType type) { }
public record OrderItem(String name, BigDecimal price, int qty) {
    public BigDecimal total();      // price * qty, scale 2
}

public final class Order {
    public static Builder builder();
    public Builder toBuilder();     // a builder filled with the current values

    public Customer customer();
    public List<OrderItem> items();          // an unmodifiable list
    public String shippingAddress();
    public Optional<String> promoCode();
    public BigDecimal subtotal();            // the sum of total() of all items
    public int itemCount();                  // the sum of qty

    public static final class Builder {
        public Builder customer(Customer c);
        public Builder item(String name, String price, int qty);   // the price as a string: no double errors
        public Builder item(OrderItem item);
        public Builder clearItems();
        public Builder shipTo(String address);
        public Builder promoCode(String code);   // null or empty -> absent
        public Order build();
    }
}
```

### Validation

| Where | Condition | Exception |
| --- | --- | --- |
| `item(...)` | price ≤ 0 | `IllegalArgumentException("price must be > 0")` |
| `item(...)` | qty ≤ 0 | `IllegalArgumentException("quantity must be > 0")` |
| `build()` | no customer | `IllegalStateException("no customer")` |
| `build()` | no items | `IllegalStateException("order has no items")` |
| `build()` | no address | `IllegalStateException("no shipping address")` |

> [!TIP]
> Check individual values (the price) right away in the builder method: the error shows up on the line where it was made. Check integrity (are there any items) in `build()`, because the order of calls is arbitrary.

## Stage 2: Strategy + Factory — Discounts (2 pts)

```java
public interface DiscountPolicy {
    String name();
    BigDecimal discount(Order order);      // >= 0, scale 2
}

public record Discount(String source, BigDecimal amount) { }

public final class DiscountFactory {
    public static List<DiscountPolicy> applicable(Order order);
    public static Discount best(Order order);
}
```

### Policies

| Name | When it applies | Discount |
| --- | --- | --- |
| `student` | a STUDENT customer | 10% of the subtotal, but at most 15.00 |
| `vip` | a VIP customer | 15% of the subtotal |
| `bulk` | `itemCount() >= 5` | 5% of the subtotal |
| `promo:WELCOME10` | the promo code WELCOME10 | 10% of the subtotal |
| `promo:MINUS20` | the promo code MINUS20 | a fixed 20.00 |

* `applicable` returns the policies in this order: by customer type → bulk → promo code. An unknown promo code is ignored.
* `best` picks the policy with the **largest** discount (on a tie, the first in the list). The discount cannot exceed the `subtotal`. If there are no policies → `Discount("none", 0.00)`.
* The implementations are lambdas or small classes. Promo codes live in a `Map<String, DiscountPolicy>`, not in a `switch`: a new promo code = a new entry in the map (OCP).

> [!NOTE]
> Discounts **do not add up**: one, the most favorable, is chosen. This is a business rule, and it lives in one method, `best`. If tomorrow the rule changes to "add up, but at most 30%", only this method will have to change.

## Stage 3: Observer — Order Events (2 pts)

```java
public record OrderPlaced(String orderId, Order order, BigDecimal total) { }
public record OrderCancelled(String orderId, BigDecimal total) { }

public class OrderEvents {
    public <E> void subscribe(Class<E> type, Consumer<? super E> listener);
    public void publish(Object event);
    public List<String> errors();              // messages of listener exceptions, in the order they occurred
}

public class Inventory {
    public Inventory(Map<String, Integer> initialStock);
    public void onPlaced(OrderPlaced e);       // deducts stock; a shortage -> IllegalStateException
    public int stock(String product);          // 0 for an unknown product
}

public class Analytics {
    public void onPlaced(OrderPlaced e);       // revenue += total
    public void onCancelled(OrderCancelled e); // revenue -= total
    public BigDecimal revenue();               // starts at 0.00
}
```

* `publish` calls the listeners of the **exact** event class in subscription order.
* An exception in one listener **does not stop** the others: the bus catches the `RuntimeException`, adds `e.getMessage()` to `errors()` and continues.
* `Inventory.onPlaced` first checks **all** the items, and only if there is enough of everything does it deduct the stock (all or nothing). The message: `"out of stock: <name> (have X, need Y)"` for the first item that is short.

> [!WARNING]
> Error isolation is a trade-off. The order is accepted, the mail is sent, but the warehouse did not deduct the goods: the system is in an inconsistent state. In production such an event would go to a retry queue or for manual review (a dead-letter queue). Here we only record the error in `errors()`.

## Stage 4: Decorator — Services and Shipping (2 pts)

```java
public interface Priced {
    BigDecimal price();
    String description();
}

public record BasePrice(Order order, Discount discount) implements Priced { }
public record GiftWrap(Priced inner) implements Priced { }       // +5.00
public record Insurance(Priced inner) implements Priced { }      // +2% of inner.price(), HALF_UP
public record Shipping(Priced inner, boolean express) implements Priced { }
```

* `BasePrice`: `subtotal − discount`. The description: `"items <subtotal>, discount <source> -<amount>"`; if the discount is zero, only `"items <subtotal>"`.
* `Shipping`: express is always 25.00; standard is 15.00, but **free** if `inner.price() >= 200.00`.
* Each decorator adds a **new line** `"+ <service> <amount>"` to the description: `gift wrap`, `insurance`, `shipping`.

> [!IMPORTANT]
> The wrapping order changes the result: insurance is computed from the price **including** the gift wrap, and free shipping depends on the sum **after** insurance. That is why the order in `Main` is exactly Base → GiftWrap → Insurance → Shipping.

## Stage 5: Facade — OrderService (2 pts)

```java
public record OrderRequest(Customer customer, List<OrderItem> items, String address, String promoCode,
                           boolean giftWrap, boolean insurance, boolean express) { }

public record Receipt(String orderId, String customerName, String details, BigDecimal total) {
    @Override public String toString();
    // === ORD-0001 / Jan ===
    // <details>
    // TOTAL <total>
    // (each line ends with \n)
}

public class OrderService {
    public OrderService(OrderEvents events);
    public Receipt place(OrderRequest request);
}
```

`place` is a facade that combines all the previous stages:

1. Build the `Order` through the Builder (validation errors propagate to the caller).
2. `DiscountFactory.best(order)`.
3. Assemble the decorator chain according to the request flags (`Shipping` is **always** added).
4. Issue an id `ORD-0001`, `ORD-0002`, … (an `AtomicInteger` + `String.format("ORD-%04d", n)`).
5. Publish `OrderPlaced`.
6. Return the `Receipt`.

> [!TIP]
> A facade contains no business logic: it only **coordinates**. If `if`s about discounts or prices appear in `place`, that logic ended up in the wrong class.

Commit, tag it `lab11` and push.
