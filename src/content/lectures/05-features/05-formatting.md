---
title: Форматування
description: Локалі та регіональні правила, синтаксис Formatter і printf, NumberFormat і DecimalFormat, власні символи формату, Locale.ROOT для машиночитних даних, інтерфейс Formattable, форматування дат через DateTimeFormatter.
---

## Форматування й локалі

Кожен об'єкт має `toString()`, але часто потрібен точний контроль над текстовим представленням: показати число як грошову суму, згрупувати розряди, вивести дату за певним шаблоном. До того ж правила відрізняються між країнами: десятковий роздільник (кома чи крапка), символ валюти, назви днів тижня.

Регіональні правила в Java описує клас **`java.util.Locale`** (мова + країна + варіанти):

```java
Locale pl = Locale.of("pl", "PL");          // Java 19+; раніше new Locale("pl", "PL")
Locale us = Locale.US;
Locale uk = Locale.forLanguageTag("uk-UA");
Locale.getDefault();                        // локаль JVM (з налаштувань ОС або -Duser.language)
```

Кожен API форматування приймає `Locale` (або використовує локаль за замовчуванням). Для `Formatter`/`printf` — це перший аргумент:

```java
double price = 1250.50;
System.out.println(String.format(pl, "%,.2f", price));   // 1 250,50
System.out.println(String.format(us, "%,.2f", price));   // 1,250.50
```

### Locale.ROOT для машиночитних даних

Особлива локаль **`Locale.ROOT`** — нейтральна, незалежна від країни. Вона гарантує **однаковий результат на кожному комп'ютері**. Її використовують, коли дані призначені для програм, а не для людей:

* файли конфігурації, JSON, XML, CSV;
* передавання даних мережею, протоколи;
* ключі, ідентифікатори, логи для автоматичного аналізу.

```java
String csvLine = String.format(Locale.ROOT, "%s;%.3f;%d", "Kraków", 50.0647, 779_115);
// Kraków;50.065;779115 — крапка як десятковий роздільник на будь-якій машині
"TITLE".toLowerCase(Locale.ROOT);           // без сюрпризів (у турецькій локалі "I" -> "ı")
```

> [!WARNING]
> Помилки на кшталт «програма падає лише на комп'ютері користувача з Польщі» зазвичай пов'язані з локаллю за замовчуванням: `String.format("%.2f", x)` дає `3,14`, а `Double.parseDouble("3,14")` кидає виняток. Для даних завжди вказуйте `Locale.ROOT`.

## Синтаксис Formatter і printf

`String.format`, `String.formatted`, `PrintStream.printf` і клас `java.util.Formatter` використовують однаковий синтаксис специфікатора:

```text
%[індекс$][прапорці][ширина][.точність]перетворення
```

| Перетворення | Тип | Приклад | Результат (`Locale.US`) |
| --- | --- | --- | --- |
| `d` | ціле десяткове | `"%05d", 123` | `00123` |
| `x`, `X`, `o` | шістнадцяткове, вісімкове | `"%X", 255` | `FF` |
| `f` | дробове з фіксованою точкою | `"%.2f", 1234.567` | `1234.57` |
| `e`, `E` | експоненційна форма | `"%.2e", 1234.567` | `1.23e+03` |
| `g` | `f` або `e`, залежно від величини | `"%g", 0.00001234` | `1.23400e-05` |
| `s`, `S` | рядок (`toString`) | `"%-6s|", "ab"` | `ab    \|` |
| `c` | символ | `"%c", 'x'` | `x` |
| `b` | логічне значення | `"%b", null` | `false` |
| `n` | перенос рядка для поточної ОС | `"%n"` | `\n` або `\r\n` |
| `%` | символ відсотка | `"%d%%", 12` | `12%` |

| Прапорець | Значення | Приклад | Результат |
| --- | --- | --- | --- |
| `-` | вирівнювання ліворуч | `"%-8d|", 42` | `42      \|` |
| `0` | доповнення нулями | `"%08.2f", 3.14159` | `00003.14` |
| `,` | групування розрядів | `"%,d", 1234567` | `1,234,567` |
| `+` | завжди знак | `"%+d", 5` | `+5` |
| `(` | від'ємні в дужках | `"%(.2f", -12.5` | `(12.50)` |
| `#` | альтернативна форма | `"%#x", 255` | `0xff` |

```java
System.out.printf(Locale.US, "%-10s|%8.2f|%,10d%n", "Laptop", 1199.9, 25_000);
// Laptop    | 1199.90|    25,000
System.out.printf("%2$s %1$s%n", "світ", "Привіт");   // індекси аргументів
```

## Форматування чисел: NumberFormat

Для чисел, що показуються людям, зручніший клас **`java.text.NumberFormat`**: він знає регіональні правила для звичайних чисел, відсотків і валют.

```java
BigDecimal price = new BigDecimal("1250.50");

NumberFormat plCurrency = NumberFormat.getCurrencyInstance(Locale.of("pl", "PL"));
NumberFormat usCurrency = NumberFormat.getCurrencyInstance(Locale.US);
System.out.println(plCurrency.format(price));          // 1 250,50 zł
System.out.println(usCurrency.format(price));          // $1,250.50

NumberFormat percent = NumberFormat.getPercentInstance(Locale.US);
percent.setMaximumFractionDigits(1);
System.out.println(percent.format(0.123));             // 12.3%

NumberFormat number = NumberFormat.getNumberInstance(Locale.GERMANY);
number.setMinimumFractionDigits(2);
System.out.println(number.format(1234.5));             // 1.234,50

NumberFormat compact = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
System.out.println(compact.format(1_250_000));         // 1M (Java 12+)

Number parsed = NumberFormat.getInstance(Locale.of("pl", "PL")).parse("1 250,5");   // розбір за правилами локалі
```

> [!WARNING]
> Об'єкти `NumberFormat`, `DecimalFormat` і `SimpleDateFormat` **не потокобезпечні**. Не зберігайте їх у статичних полях, якими користуються кілька потоків. Класи `java.time.format.DateTimeFormatter` незмінні й безпечні.

### Власні шаблони: DecimalFormat

`DecimalFormat` дозволяє задати шаблон з символів:

| Символ | Опис | Шаблон і число | Результат (`Locale.US`) |
| --- | --- | --- | --- |
| `0` | цифра або нуль, якщо цифри немає | `"0000.000"`, 123.45 | `0123.450` |
| `#` | цифра або нічого | `"####.###"`, 123.45 | `123.45` |
| `.` | десятковий роздільник | `"0.00"`, 1234 | `1234.00` |
| `,` | групування розрядів | `"#,##0"`, 1234567 | `1,234,567` |
| `%` | множить на 100 і додає `%` | `"0.0 %"`, 0.123 | `12.3 %` |
| `E` | експоненційна форма | `"0.###E0"`, 12345 | `1.234E4` |
| `'...'` | текст як є | `"#,##0 'шт.'"`, 1500 | `1,500 шт.` |
| `;` | окремий шаблон для від'ємних | `"#,##0.00;(#,##0.00)"`, -5 | `(5.00)` |

```java
DecimalFormat df = new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.US));
System.out.println(df.format(1234567.891));     // 1,234,567.89
df.setRoundingMode(RoundingMode.DOWN);
System.out.println(df.format(2.999));           // 2.99
```

### Змінені символи локалі

Регіональні символи зберігає об'єкт `DecimalFormatSymbols`. Його можна скопіювати з локалі й змінити окремі символи, залишивши решту правил:

```java
DecimalFormatSymbols symbols = DecimalFormatSymbols.getInstance(Locale.of("pl", "PL"));
symbols.setDecimalSeparator('.');
symbols.setGroupingSeparator(' ');
DecimalFormat custom = new DecimalFormat("#,##0.00 'PLN'", symbols);
System.out.println(custom.format(1250.5));      // 1 250.50 PLN
```

## Власні типи: інтерфейс Formattable

Специфікатор `%s` викликає `toString()`. Але якщо клас реалізує **`java.util.Formattable`**, `Formatter` викличе його метод `formatTo` і передасть прапорці, ширину й точність. Так власний тип може реагувати на форматування так само, як вбудовані.

Наприклад, температура: `%s` — градуси Цельсія, `%#s` (альтернативна форма) — Фаренгейта, точність — кількість знаків після коми, `%S` — великими літерами.

```java
public record Temperature(BigDecimal celsius) implements Formattable {
    private static final BigDecimal ABSOLUTE_ZERO = new BigDecimal("-273.15");

    public Temperature {
        if (celsius.compareTo(ABSOLUTE_ZERO) < 0)
            throw new IllegalArgumentException(celsius + " нижче за абсолютний нуль");
    }

    public BigDecimal fahrenheit() {
        return celsius.multiply(BigDecimal.valueOf(9)).divide(BigDecimal.valueOf(5)).add(BigDecimal.valueOf(32));
    }

    public BigDecimal kelvin() { return celsius.subtract(ABSOLUTE_ZERO); }

    @Override
    public void formatTo(Formatter formatter, int flags, int width, int precision) {
        boolean fahrenheit = (flags & FormattableFlags.ALTERNATE) != 0;
        BigDecimal value = fahrenheit ? fahrenheit() : celsius;
        int digits = precision >= 0 ? precision : 2;
        String text = String.format(formatter.locale(), "%." + digits + "f %s", value, fahrenheit ? "°F" : "°C");
        if ((flags & FormattableFlags.UPPERCASE) != 0) text = text.toUpperCase(formatter.locale());
        String fmt = "%" + ((flags & FormattableFlags.LEFT_JUSTIFY) != 0 ? "-" : "") + (width > 0 ? width : "") + "s";
        formatter.format(fmt, text);
    }

    @Override
    public String toString() { return String.format("%s", this); }
}

Temperature t = new Temperature(BigDecimal.ZERO);
System.out.printf(Locale.US, "Вода замерзає при %s%n", t);      // 0.00 °C
System.out.printf(Locale.US, "Вода замерзає при %#.1s%n", t);   // 32.0 °F
System.out.printf(Locale.US, "[%12s]%n", t);                     // [     0.00 °C]
```

Для типів, яким потрібні власні **коди** формату (`"C"`, `"F"`, `"K"`), простіше додати явні методи: `t.format(Unit.KELVIN, locale)`.

## Форматування дат і часу

Дати й час з пакета `java.time` форматує незмінний і потокобезпечний клас **`DateTimeFormatter`**.

### Стандартні формати

```java
LocalDateTime date = LocalDateTime.of(2025, 11, 23, 14, 30, 5);

date.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);        // 2025-11-23T14:30:05
date.format(DateTimeFormatter.ISO_DATE);                   // 2025-11-23
date.toString();                                           // 2025-11-23T14:30:05 (ISO-8601)

DateTimeFormatter longPl = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL).withLocale(Locale.of("pl", "PL"));
DateTimeFormatter shortUs = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.SHORT).withLocale(Locale.US);
System.out.println(date.format(longPl));                   // niedziela, 23 listopada 2025
System.out.println(date.format(shortUs));                  // 11/23/25, 2:30 PM
```

Формат **ISO-8601** (`ISO_*`) — це «машинний» формат: його однаково розбирають усі системи, а `toString()` і `parse()` класів `java.time` використовують саме його. Тому `LocalDate.parse("2025-11-23")` не потребує форматера.

### Власні шаблони

| Символ | Опис | Шаблон | Результат (`Locale.US`, 2025-11-23 14:30:05) |
| --- | --- | --- | --- |
| `dd` | день місяця (01–31) | `dd` | `23` |
| `EEEE`, `EEE` | назва дня тижня | `EEEE` | `Sunday` |
| `MM` | місяць (01–12) | `MM` | `11` |
| `MMMM`, `MMM` | назва місяця | `MMMM` | `November` |
| `yyyy` / `uuuu` | рік | `yyyy` | `2025` |
| `HH` | година (00–23) | `HH` | `14` |
| `hh`, `a` | година (01–12) і AM/PM | `hh a` | `02 PM` |
| `mm` | хвилини | `mm` | `30` |
| `ss` | секунди | `ss` | `05` |
| `SSS` | мілісекунди | `SSS` | `000` |
| `XXX`, `VV` | зсув і зона | `XXX VV` | `+01:00 Europe/Warsaw` |
| `'...'` | текст як є | `'T'` | `T` |

```java
DateTimeFormatter custom = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy", Locale.US);
System.out.println(date.format(custom));                   // Sunday, 23 November 2025
System.out.println(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));   // 2025-11-23 14:30:05

LocalDate parsed = LocalDate.parse("23.11.2025", DateTimeFormatter.ofPattern("dd.MM.yyyy"));
```

> [!CAUTION]
> Регістр у шаблонах має значення: `MM` — місяць, `mm` — хвилини; `HH` — 0–23, `hh` — 1–12; `dd` — день місяця, `DD` — день року. Особливо підступний `YYYY` — це **рік тижня** (week-based year): 29–31 грудня він може показати наступний рік. Для звичайного року використовуйте `yyyy` або `uuuu`.

Для збереження й передавання моментів часу використовуйте `Instant` і ISO-8601 з зоною: `Instant.now().toString()` дає `2025-11-23T13:30:05.123Z`, і такий рядок однозначно розбирається на будь-якій системі.
