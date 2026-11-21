---
title: Пакети та import
description: Пакети як простори імен, відповідність каталогам, імпорт класів і статичних членів, конфлікти імен, пакет за замовчуванням, автоматичний імпорт java.lang, package-info.java.
---

## Пакети

**Пакет** групує пов'язані типи і створює для них простір імен. Повне ім'я класу складається з імені пакета й імені класу: `java.util.ArrayList`, `pl.edu.pw.mini.shop.Order`. Звертання до елементів пакета відбувається через крапку.

Пакет оголошують **першою інструкцією** файлу (раніше можуть бути лише коментарі та анотації):

```java
package pl.edu.pw.mini.shop;

public class Order { }
```

Усі типи у файлі належать до цього пакета. Пакет вкладати синтаксично не можна (немає блоків `package { }`), один файл належить рівно одному пакету.

### Відповідність каталогам

Структура пакетів **мусить відповідати структурі каталогів** відносно кореня джерел (`src/main/java`): клас `pl.edu.pw.mini.shop.Order` лежить у файлі `src/main/java/pl/edu/pw/mini/shop/Order.java`, а скомпільований — у `target/classes/pl/edu/pw/mini/shop/Order.class`. Саме так компілятор і JVM знаходять класи.

```text
src/main/java/
└── pl/edu/pw/mini/shop/
    ├── Order.java           package pl.edu.pw.mini.shop;
    ├── OrderService.java    package pl.edu.pw.mini.shop;
    └── payment/
        └── Card.java        package pl.edu.pw.mini.shop.payment;
```

### Конвенції іменування

* Назви пакетів пишуть **малими літерами**, без підкреслень, як перевернуте доменне ім'я організації: `com.google.gson`, `org.apache.commons.io`, `pl.edu.pw.mini`.
* Пакети `java.*` і `javax.*` зарезервовано для стандартної бібліотеки.

> [!IMPORTANT]
> Пакети **не утворюють ієрархії** з погляду мови: `pl.mini.shop` і `pl.mini.shop.payment` — два незалежні пакети, хоча назви й каталоги вкладені. Член з видимістю «в межах пакета» з `pl.mini.shop` невидимий у `pl.mini.shop.payment`, а `import pl.mini.shop.*` не імпортує типи з підпакета.

### Пакет за замовчуванням

Файл без оголошення `package` належить до **безіменного пакета**. Це зручно для однофайлових прикладів, але класи з безіменного пакета неможливо імпортувати з іменованих пакетів. У справжніх проєктах його не використовують.

## Інструкція import

Без імпорту до класу з іншого пакета звертаються за повним ім'ям. `import` дозволяє писати коротке ім'я:

```java
package pl.mini.app;

import java.util.List;                 // один тип (single-type import)
import java.util.Map.Entry;            // вкладений тип
import java.time.*;                    // усі публічні типи пакета (on-demand)

public class App {
    java.util.Set<String> tags;        // повне ім'я працює і без імпорту
    List<String> names;
    Entry<String, Integer> pair;
    LocalDate today = LocalDate.now();
}
```

Важливо розуміти, що `import` — це лише **скорочення імен** для компілятора. Він нічого не «включає» в програму, як `#include`, і не впливає на розмір чи швидкість коду. Бібліотеки стають доступними через classpath (або module path), а не через імпорт.

Типи з пакета **`java.lang`** (`String`, `Object`, `Math`, `System`, `Integer`, `Thread`, `Record` …) і типи з **власного пакета** доступні без імпорту.

> [!TIP]
> IDE автоматично додає й прибирає імпорти. Більшість стилів коду (Google Java Style) забороняють імпорти з `*`: явний перелік показує, звідки береться кожен тип, і не створює неочікуваних конфліктів, коли в бібліотеці з'являється новий клас.

## Статичний імпорт

`import static` імпортує не типи, а **статичні члени** класу: методи, поля, константи enum. Після цього їх можна використовувати без імені класу.

```java
import static java.lang.Math.*;                     // усі статичні члени Math
import static java.time.DayOfWeek.MONDAY;           // одна константа enum
import static java.util.stream.Collectors.groupingBy;
import static org.junit.jupiter.api.Assertions.assertEquals;

double r = sqrt(pow(3, 2) + pow(4, 2));            // замість Math.sqrt(Math.pow(...))
System.out.println(MONDAY);
assertEquals(5.0, r);
```

Статичний імпорт доречний для часто вживаних утиліт (`Math`, `Collectors`, перевірки в тестах). Надмірне використання шкодить читабельності: незрозуміло, звідки взявся метод.

## Конфлікти імен

У Java **немає псевдонімів** (aliases) для типів чи пакетів. Якщо потрібні два класи з однаковим ім'ям, один імпортують, а другий пишуть за повним ім'ям:

```java
import java.util.Date;

public class Report {
    Date created;                      // java.util.Date
    java.sql.Date reportDay;           // повне ім'я
}
```

Імпорт двох однойменних типів через `import a.X; import b.X;` — помилка компіляції. Імпорт `a.*` і `b.*` компілюється, доки неоднозначне ім'я `X` не використано в коді.

## package-info.java

Файл `package-info.java` у каталозі пакета містить **документацію пакета** (Javadoc) і **анотації**, які стосуються всього пакета:

```java
/**
 * Обробка замовлень інтернет-магазину: модель, валідація, розрахунок вартості.
 */
@NullMarked                       // наприклад, анотація JSpecify: усі типи пакета за замовчуванням non-null
package pl.mini.shop;

import org.jspecify.annotations.NullMarked;
```

> [!NOTE]
> Пакети керують видимістю лише частково: публічний клас видно всім, хто має його на classpath. Справжню інкапсуляцію на рівні цілих бібліотек дають **модулі** (`module-info.java`), які вирішують, які пакети експортувати (розділ «Рефлексія → Модулі й завантажувачі класів»).
