---
title: Formatting
description: Locales and regional rules, the Formatter and printf syntax, NumberFormat and DecimalFormat, custom format symbols, Locale.ROOT for machine-readable data, the Formattable interface, formatting dates with DateTimeFormatter.
---

## Formatting and Locales

Every object has `toString()`, but precise control over the textual representation is often needed: showing a number as an amount of money, grouping digits, printing a date in a particular pattern. Moreover, the rules differ between countries: the decimal separator (a comma or a dot), the currency symbol, the names of weekdays.

Regional rules in Java are described by the **`java.util.Locale`** class (language + country + variants):

```java
Locale pl = Locale.of("pl", "PL");          // Java 19+; previously new Locale("pl", "PL")
Locale us = Locale.US;
Locale uk = Locale.forLanguageTag("uk-UA");
Locale.getDefault();                        // the JVM locale (from OS settings or -Duser.language)
```

Every formatting API accepts a `Locale` (or uses the default locale). For `Formatter`/`printf` it is the first argument:

```java
double price = 1250.50;
System.out.println(String.format(pl, "%,.2f", price));   // 1 250,50
System.out.println(String.format(us, "%,.2f", price));   // 1,250.50
```

### Locale.ROOT for Machine-Readable Data

The special locale **`Locale.ROOT`** is neutral, independent of any country. It guarantees **the same result on every computer**. It is used when the data is meant for programs, not for people:

* configuration files, JSON, XML, CSV;
* data sent over the network, protocols;
* keys, identifiers, logs for automated analysis.

```java
String csvLine = String.format(Locale.ROOT, "%s;%.3f;%d", "Kraków", 50.0647, 779_115);
// Kraków;50.065;779115 — a dot as the decimal separator on any machine
"TITLE".toLowerCase(Locale.ROOT);           // no surprises (in a Turkish locale "I" -> "ı")
```

> [!WARNING]
> Bugs like "the program crashes only on a user's computer in Poland" are usually related to the default locale: `String.format("%.2f", x)` gives `3,14`, and `Double.parseDouble("3,14")` throws an exception. For data, always specify `Locale.ROOT`.

## The Formatter and printf Syntax

`String.format`, `String.formatted`, `PrintStream.printf` and the `java.util.Formatter` class use the same specifier syntax:

```text
%[index$][flags][width][.precision]conversion
```

| Conversion | Type | Example | Result (`Locale.US`) |
| --- | --- | --- | --- |
| `d` | a decimal integer | `"%05d", 123` | `00123` |
| `x`, `X`, `o` | hexadecimal, octal | `"%X", 255` | `FF` |
| `f` | fixed-point floating-point | `"%.2f", 1234.567` | `1234.57` |
| `e`, `E` | scientific notation | `"%.2e", 1234.567` | `1.23e+03` |
| `g` | `f` or `e` depending on magnitude | `"%g", 0.00001234` | `1.23400e-05` |
| `s`, `S` | a string (`toString`) | `"%-6s|", "ab"` | `ab    \|` |
| `c` | a character | `"%c", 'x'` | `x` |
| `b` | a boolean | `"%b", null` | `false` |
| `n` | a line break for the current OS | `"%n"` | `\n` or `\r\n` |
| `%` | a percent sign | `"%d%%", 12` | `12%` |

| Flag | Meaning | Example | Result |
| --- | --- | --- | --- |
| `-` | left-justify | `"%-8d|", 42` | `42      \|` |
| `0` | zero padding | `"%08.2f", 3.14159` | `00003.14` |
| `,` | digit grouping | `"%,d", 1234567` | `1,234,567` |
| `+` | always a sign | `"%+d", 5` | `+5` |
| `(` | negatives in parentheses | `"%(.2f", -12.5` | `(12.50)` |
| `#` | alternate form | `"%#x", 255` | `0xff` |

```java
System.out.printf(Locale.US, "%-10s|%8.2f|%,10d%n", "Laptop", 1199.9, 25_000);
// Laptop    | 1199.90|    25,000
System.out.printf("%2$s %1$s%n", "world", "Hello");   // argument indexes
```

## Formatting Numbers: NumberFormat

For numbers shown to people, the **`java.text.NumberFormat`** class is more convenient: it knows the regional rules for ordinary numbers, percentages and currencies.

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

Number parsed = NumberFormat.getInstance(Locale.of("pl", "PL")).parse("1 250,5");   // parsing by the locale's rules
```

> [!WARNING]
> `NumberFormat`, `DecimalFormat` and `SimpleDateFormat` objects are **not thread-safe**. Do not keep them in static fields used by several threads. The `java.time.format.DateTimeFormatter` classes are immutable and safe.

### Custom Patterns: DecimalFormat

`DecimalFormat` lets you specify a pattern made of symbols:

| Symbol | Description | Pattern and number | Result (`Locale.US`) |
| --- | --- | --- | --- |
| `0` | a digit, or zero if there is none | `"0000.000"`, 123.45 | `0123.450` |
| `#` | a digit or nothing | `"####.###"`, 123.45 | `123.45` |
| `.` | the decimal separator | `"0.00"`, 1234 | `1234.00` |
| `,` | digit grouping | `"#,##0"`, 1234567 | `1,234,567` |
| `%` | multiplies by 100 and adds `%` | `"0.0 %"`, 0.123 | `12.3 %` |
| `E` | scientific notation | `"0.###E0"`, 12345 | `1.234E4` |
| `'...'` | literal text | `"#,##0 'pcs'"`, 1500 | `1,500 pcs` |
| `;` | a separate pattern for negatives | `"#,##0.00;(#,##0.00)"`, -5 | `(5.00)` |

```java
DecimalFormat df = new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.US));
System.out.println(df.format(1234567.891));     // 1,234,567.89
df.setRoundingMode(RoundingMode.DOWN);
System.out.println(df.format(2.999));           // 2.99
```

### Modified Locale Symbols

Regional symbols are stored in a `DecimalFormatSymbols` object. It can be copied from a locale and individual symbols changed while keeping the remaining rules:

```java
DecimalFormatSymbols symbols = DecimalFormatSymbols.getInstance(Locale.of("pl", "PL"));
symbols.setDecimalSeparator('.');
symbols.setGroupingSeparator(' ');
DecimalFormat custom = new DecimalFormat("#,##0.00 'PLN'", symbols);
System.out.println(custom.format(1250.5));      // 1 250.50 PLN
```

## Custom Types: the Formattable Interface

The `%s` specifier calls `toString()`. But if a class implements **`java.util.Formattable`**, `Formatter` calls its `formatTo` method and passes the flags, width and precision. This way a custom type can respond to formatting just like the built-in ones.

For example, a temperature: `%s` — degrees Celsius, `%#s` (the alternate form) — Fahrenheit, the precision — the number of decimal places, `%S` — in uppercase.

```java
public record Temperature(BigDecimal celsius) implements Formattable {
    private static final BigDecimal ABSOLUTE_ZERO = new BigDecimal("-273.15");

    public Temperature {
        if (celsius.compareTo(ABSOLUTE_ZERO) < 0)
            throw new IllegalArgumentException(celsius + " is below absolute zero");
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
System.out.printf(Locale.US, "Water freezes at %s%n", t);      // 0.00 °C
System.out.printf(Locale.US, "Water freezes at %#.1s%n", t);   // 32.0 °F
System.out.printf(Locale.US, "[%12s]%n", t);                    // [     0.00 °C]
```

For types that need their own format **codes** (`"C"`, `"F"`, `"K"`), it is simpler to add explicit methods: `t.format(Unit.KELVIN, locale)`.

## Formatting Dates and Times

Dates and times from the `java.time` package are formatted by the immutable, thread-safe **`DateTimeFormatter`** class.

### Standard Formats

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

The **ISO-8601** format (`ISO_*`) is the "machine" format: all systems parse it the same way, and the `toString()` and `parse()` methods of `java.time` classes use exactly it. That is why `LocalDate.parse("2025-11-23")` needs no formatter.

### Custom Patterns

| Symbol | Description | Pattern | Result (`Locale.US`, 2025-11-23 14:30:05) |
| --- | --- | --- | --- |
| `dd` | day of month (01–31) | `dd` | `23` |
| `EEEE`, `EEE` | weekday name | `EEEE` | `Sunday` |
| `MM` | month (01–12) | `MM` | `11` |
| `MMMM`, `MMM` | month name | `MMMM` | `November` |
| `yyyy` / `uuuu` | year | `yyyy` | `2025` |
| `HH` | hour (00–23) | `HH` | `14` |
| `hh`, `a` | hour (01–12) and AM/PM | `hh a` | `02 PM` |
| `mm` | minutes | `mm` | `30` |
| `ss` | seconds | `ss` | `05` |
| `SSS` | milliseconds | `SSS` | `000` |
| `XXX`, `VV` | offset and zone | `XXX VV` | `+01:00 Europe/Warsaw` |
| `'...'` | literal text | `'T'` | `T` |

```java
DateTimeFormatter custom = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy", Locale.US);
System.out.println(date.format(custom));                   // Sunday, 23 November 2025
System.out.println(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));   // 2025-11-23 14:30:05

LocalDate parsed = LocalDate.parse("23.11.2025", DateTimeFormatter.ofPattern("dd.MM.yyyy"));
```

> [!CAUTION]
> Case matters in patterns: `MM` is the month, `mm` the minutes; `HH` is 0–23, `hh` 1–12; `dd` is the day of the month, `DD` the day of the year. `YYYY` is especially treacherous — it is the **week-based year**: on December 29–31 it may show the next year. For an ordinary year use `yyyy` or `uuuu`.

To store and transmit moments in time, use `Instant` and ISO-8601 with a zone: `Instant.now().toString()` gives `2025-11-23T13:30:05.123Z`, and such a string is parsed unambiguously on any system.
