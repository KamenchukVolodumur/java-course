---
title: null і Optional
description: Значення null у примітивах і посиланнях, NullPointerException і детальні повідомлення, обгортки як «число або нічого», трилогічна логіка, Optional і його API, антипатерни, заміни операторів для null, статичний аналіз через анотації.
---

## null у Java

* **Примітивні** змінні не можуть бути `null`: вони завжди містять значення. `int i = null;` — помилка компіляції.
* **Посилальні** змінні можуть бути `null`: це означає «не вказує на жоден об'єкт». Компілятор Java сам по собі **не перевіряє**, чи посилання може бути `null`.

Звертання до поля чи методу через `null` кидає **`NullPointerException`** (NPE). Від Java 14 (JEP 358) повідомлення точно вказує, що саме було `null`:

```java
record Address(String city) { }
record Customer(String name, Address address) { }

Customer c = new Customer("Ola", null);
System.out.println(c.address().city().length());
// java.lang.NullPointerException: Cannot invoke "Address.city()"
//     because the return value of "Customer.address()" is null
```

## Відсутнє значення для примітивів

Щоб змінна числового типу могла «не мати значення», використовують **обгортку** (`Integer`, `Double`, `Boolean`), яка є посилальним типом і допускає `null`:

```java
Integer maybe = null;            // «число або нічого»
Integer five = 5;                // автоупакування

if (maybe != null) {
    int value = maybe;           // розпакування після перевірки
}
int boom = maybe;                // NullPointerException під час розпакування!
```

> [!CAUTION]
> Розпакування `null` — підступне джерело NPE: `int total = map.get("x");` впаде, якщо ключа немає. Безпечніше `map.getOrDefault("x", 0)`.

Для примітивів є також спеціалізовані **`OptionalInt`**, **`OptionalLong`**, **`OptionalDouble`** без упакування (їх повертають, наприклад, `IntStream.max()` і `average()`).

### Арифметика з відсутніми значеннями

Оператори над обгортками автоматично розпаковують їх, тож будь-яке `null` дає NPE. Якщо `null` треба «поширювати» (результат відсутній, коли відсутній хоч один операнд), це роблять явно:

```java
static Integer add(Integer x, Integer y) {
    return (x == null || y == null) ? null : x + y;
}
```

### Трилогічна логіка

`Boolean` може мати три стани: `true`, `false` і `null` («невідомо»), але оператори `&&`, `||`, `!` з `null` кидають NPE. Якщо потрібна логіка «невідомого» значення (як `NULL` у SQL), її реалізують явно або моделюють enum:

```java
enum Answer { YES, NO, UNKNOWN }

static Answer and(Answer a, Answer b) {
    if (a == Answer.NO || b == Answer.NO) return Answer.NO;
    if (a == Answer.UNKNOWN || b == Answer.UNKNOWN) return Answer.UNKNOWN;
    return Answer.YES;
}
```

## Optional

`java.util.Optional<T>` — контейнер, що або містить ненульове значення, або порожній. Його основне призначення — **тип результату методу**, який може нічого не повернути. Сигнатура тоді явно повідомляє викликачу: «результату може не бути, обробіть цей випадок».

```java
Optional<User> findByEmail(String email) {
    return Optional.ofNullable(users.get(email));     // порожній, якщо get повернув null
}
```

### Створення

```java
Optional<String> a = Optional.of("value");           // значення не може бути null (інакше NPE)
Optional<String> b = Optional.ofNullable(maybeNull); // null -> порожній
Optional<String> c = Optional.empty();
```

### Отримання значення

| Метод | Значення є | Значення немає |
| --- | --- | --- |
| `orElse(x)` | значення | `x` (обчислюється **завжди**) |
| `orElseGet(() -> x)` | значення | результат постачальника (обчислюється лише за потреби) |
| `orElseThrow()` | значення | `NoSuchElementException` |
| `orElseThrow(() -> ex)` | значення | вказаний виняток |
| `get()` | значення | `NoSuchElementException` (уникайте: те саме, що `orElseThrow()`, але назва гірша) |

```java
String name = findByEmail("a@b.pl")
        .map(User::name)                       // перетворення, якщо значення є
        .filter(n -> !n.isBlank())             // відкинути, якщо умова хибна
        .orElse("гість");

User user = findByEmail(email)
        .orElseThrow(() -> new NoSuchElementException("Немає користувача " + email));

Config cfg = loadFromFile().orElseGet(Config::defaults);       // defaults() лише за потреби
```

### Робота без розпакування

```java
findByEmail(email).ifPresent(u -> System.out.println("Вітаю, " + u.name()));

findByEmail(email).ifPresentOrElse(
        u -> System.out.println("Знайдено " + u.name()),
        () -> System.out.println("Не знайдено"));

Optional<Address> address = findByEmail(email).flatMap(User::address);   // метод, що сам повертає Optional

Optional<User> any = findInCache(id).or(() -> findInDatabase(id));        // запасне джерело (Java 9)

long count = Stream.of(id1, id2, id3)
        .map(this::findById)          // Stream<Optional<User>>
        .flatMap(Optional::stream)    // лише присутні значення
        .count();
```

`map` і `flatMap` дозволяють будувати безпечні ланцюжки звертань без перевірок на кожному кроці:

```java
String city = Optional.ofNullable(customer)
        .map(Customer::address)
        .map(Address::city)
        .orElse("невідомо");
```

### Антипатерни

> [!WARNING]
> * `Optional` як **поле** класу чи **параметр** методу: він не серіалізується, займає зайвий об'єкт і додає ще один можливий `null` (сам `Optional` може бути `null`). Для полів використовуйте `null` з документацією або значення за замовчуванням, а для параметрів — перевантаження.
> * `Optional<List<T>>`: повертайте порожню колекцію.
> * `if (opt.isPresent()) { opt.get() ... }`: це той самий null-check, тільки довший. Використовуйте `map`/`ifPresent`/`orElse`.
> * `Optional.of(possiblyNull)`: кидає NPE, потрібен `ofNullable`.
> * Повертати `null` з методу, тип якого `Optional`.

## Заміни операторів для null

Спеціальних операторів для роботи з `null` («значення або запасне», «безпечне звертання») у Java немає. Ось типові еквіваленти:

```java
// значення або запасне
String s2 = s1 != null ? s1 : "non-null";
String s3 = Objects.requireNonNullElse(s1, "non-null");
String s4 = Objects.requireNonNullElseGet(s1, () -> computeDefault());
String s5 = Optional.ofNullable(s1).orElse("non-null");

// значення або виняток (перевірка аргументів)
this.name = Objects.requireNonNull(name, "name не може бути null");

// присвоїти, лише якщо ще null (лінива ініціалізація)
if (cache == null) cache = new HashMap<>();
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);   // для мап

// безпечне звертання
String text = sb == null ? null : sb.toString();
String city = Optional.ofNullable(customer).map(Customer::address).map(Address::city).orElse(null);

// null-безпечні утиліти
Objects.equals(a, b);                 // true, якщо обидва null
Objects.hash(a, b);                   // null дає 0
String.valueOf(obj);                  // "null" замість NPE
Objects.toString(obj, "—");           // запасний текст
```

## Як уникати null

* Повертайте **порожні колекції** (`List.of()`, `Collections.emptyMap()`), а не `null`.
* Перевіряйте аргументи на вході публічних методів (`Objects.requireNonNull`), щоб помилка проявлялася одразу, а не десятьма викликами пізніше.
* Ініціалізуйте поля в конструкторі; використовуйте `final`.
* Для «може не бути» в результатах — `Optional`.
* Для «порожніх» об'єктів інколи зручний **Null Object** — реалізація, що нічого не робить: `Consumer<String> noLog = s -> { };`.

## Статичний аналіз: анотації @Nullable і @NonNull

Компілятор Java не відстежує `null`, але це можуть робити IDE та статичні аналізатори, якщо позначити наміри анотаціями. Сучасний стандарт — бібліотека **JSpecify** (`org.jspecify:jspecify`), анотації якої розуміють IntelliJ IDEA, NullAway, Checker Framework і Kotlin.

```java
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked                                 // у цьому класі (або пакеті) типи за замовчуванням non-null
public class UserService {

    public @Nullable User findByEmail(String email) {     // може повернути null
        return users.get(email);
    }

    public int nameLength(@Nullable String name) {
        // return name.length();          // IDE/NullAway: dereference of possibly-null reference
        return name == null ? 0 : name.length();
    }
}
```

```java
UserService service = new UserService();
service.nameLength(null);                   // OK: параметр позначено @Nullable
User u = service.findByEmail("x");
// u.name();                                // попередження: u може бути null
```

> [!NOTE]
> Анотації не змінюють поведінку програми під час виконання: `NullPointerException` усе одно виникне, якщо проігнорувати попередження. Але в поєднанні з аналізатором у збиранні (наприклад, NullAway як плагін компілятора, який перетворює попередження на помилки) вони ловлять більшість NPE ще до запуску. Анотацію `@NullMarked` зазвичай ставлять одразу на весь пакет у `package-info.java`.
