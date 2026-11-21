---
title: Потоки введення-виведення
description: InputStream і OutputStream, читання й запис блоками, довільний доступ через RandomAccessFile і FileChannel, flush і close, відкриття файлів і StandardOpenOption, фасад Files, декоратори (буферизація, стиснення), текстові адаптери й кодування, бінарні DataInputStream/DataOutputStream і порядок байтів.
---

## Потоки введення-виведення

Потоки (I/O streams) у Java — абстракція для операцій введення-виведення. Потік представляє **послідовність байтів**, яку можна читати або записувати. Джерелом чи приймачем можуть бути файл, пам'ять, мережеве з'єднання чи канал між процесами. Незалежно від джерела, з даними працюють однаково.

> [!NOTE]
> Потоки введення-виведення (`java.io.InputStream`) і потоки Stream API (`java.util.stream.Stream`, сторінка «Stream API») — **різні** речі, що мають однакову назву.

На відміну від підходу «один потік, що вміє все», у Java напрям визначає **тип**:

| | Байти | Символи (текст) |
| --- | --- | --- |
| **Читання** | `InputStream` | `Reader` |
| **Запис** | `OutputStream` | `Writer` |

Помилки повідомляються винятками, переважно **`IOException`** та його нащадками (`FileNotFoundException`, `NoSuchFileException`, `AccessDeniedException`, `EOFException`). Це checked-винятки, тож їх треба обробити або оголосити.

> [!TIP]
> Працювати з «голим» байтовим потоком незручно. Зазвичай над ним надбудовують декоратори й адаптери (розділи нижче) або використовують готові методи класу `Files`.

## Робота з потоками

### Читання

Основний метод `int read(byte[] b, int off, int len)` читає **до** `len` байтів і повертає кількість реально прочитаних. Їх може бути **менше**, ніж просили (наприклад, мережа ще не доставила решту). Кінець потоку позначається значенням **`-1`**.

```java
try (InputStream in = new FileInputStream("lorem.txt")) {
    byte[] buffer = new byte[256];
    int read;
    while ((read = in.read(buffer, 0, buffer.length)) != -1) {
        System.out.println("Прочитано " + read + " байтів");
    }
}
```

Метод `read()` без параметрів читає один байт (0–255) або повертає `-1`. Для файлів без буфера це дуже неефективно: кожен виклик — системний виклик ОС.

Оскільки `read` може повернути менше байтів, ніж потрібно, для читання блоку відомого розміру є допоміжні методи:

```java
try (InputStream in = Files.newInputStream(Path.of("lorem.bin"))) {
    byte[] header = in.readNBytes(16);          // до 16 байтів; менше — лише в кінці потоку
    byte[] rest = in.readAllBytes();            // усе до кінця (обережно з великими потоками)
    in.skip(10);                                // пропустити байти
}

try (var din = new DataInputStream(new FileInputStream("lorem.bin"))) {
    byte[] exactly = new byte[16];
    din.readFully(exactly);                     // рівно 16 байтів або EOFException
}
```

### Запис

Метод `void write(byte[] b, int off, int len)` записує всі вказані байти (на відміну від `read`, частково не записує).

```java
try (OutputStream out = new FileOutputStream("data.bin")) {
    byte[] buffer = new byte[256];
    for (int i = 0; i < 256; i++) buffer[i] = (byte) i;
    out.write(buffer, 0, buffer.length);
    out.write(0xFF);                            // один байт: молодші 8 бітів int
}
```

### Копіювання потоку

```java
try (InputStream in = Files.newInputStream(src);
     OutputStream out = Files.newOutputStream(dst)) {
    long copied = in.transferTo(out);           // Java 9
}
```

### Довільний доступ

Потоки `InputStream`/`OutputStream` **послідовні**: змінити поточну позицію не можна. Для довільного доступу до файлу використовують `RandomAccessFile` або `FileChannel`:

```java
try (var raf = new RandomAccessFile("lorem.txt", "rw")) {
    raf.seek(0);                                // на початок
    raf.seek(raf.length());                     // у кінець
    raf.seek(10);
    int b = raf.read();
    raf.writeInt(42);                           // запис з поточної позиції
    long pos = raf.getFilePointer();
}

try (FileChannel ch = FileChannel.open(Path.of("lorem.txt"), StandardOpenOption.READ)) {
    ch.position(100);
    ByteBuffer buf = ByteBuffer.allocate(16);
    ch.read(buf);                               // з поточної позиції
    ch.read(buf.clear(), 500);                  // з позиції 500, НЕ змінюючи поточну
    long size = ch.size();
}
```

Позиційні `read(buffer, position)`/`write(buffer, position)` у `FileChannel` не змінюють поточної позиції каналу, тож їх можна безпечно використовувати з кількох потоків одночасно.

### Скидання буферів і закриття

Записані дані зазвичай потрапляють до приймача не одразу: їх буферизує потік, ОС чи диск. Метод **`flush()`** передає дані з буферів потоку операційній системі. Він **не** гарантує, що ОС фізично записала їх на диск. Для цього є `FileChannel.force(true)` або `FileOutputStream.getFD().sync()` (аналог `fsync`).

Закриття потоку (`close()`) спершу скидає буфери, а потім звільняє ресурси ОС. Потоки завжди відкривають у **try-with-resources**, щоб закриття відбулося навіть за винятку:

```java
try (OutputStream out = new BufferedOutputStream(new FileOutputStream("log.bin"))) {
    out.write(data);
}   // flush() + close()

// компілятор перетворює це приблизно на:
OutputStream out = new BufferedOutputStream(new FileOutputStream("log.bin"));
try {
    out.write(data);
} finally {
    out.close();                                // з обробкою придушених винятків
}
```

## Файлові потоки

Файли можна відкрити класами `FileInputStream`/`FileOutputStream` або, сучасніше, методами класу `java.nio.file.Files`, які приймають `Path` і **опції відкриття**:

```java
InputStream in1 = new FileInputStream("file1.txt");
OutputStream out1 = new FileOutputStream("file2.txt");              // створює або ОБРІЗАЄ
OutputStream out2 = new FileOutputStream("log.txt", true);          // дописування в кінець

InputStream in2 = Files.newInputStream(Path.of("file3.txt"));
OutputStream out3 = Files.newOutputStream(Path.of("file4.txt"),
        StandardOpenOption.CREATE, StandardOpenOption.APPEND);
```

Поведінку відкриття задають константи `StandardOpenOption`:

| Опції | Файл **існує** | Файлу **немає** |
| --- | --- | --- |
| `CREATE_NEW, WRITE` | `FileAlreadyExistsException` | створює новий |
| *(без опцій)* або `CREATE, TRUNCATE_EXISTING, WRITE` | **обрізає** до нуля | створює новий |
| `READ` (за замовчуванням для читання) | відкриває | `NoSuchFileException` |
| `CREATE, WRITE` | відкриває без обрізання (запис з початку) | створює новий |
| `TRUNCATE_EXISTING, WRITE` | **обрізає** | `NoSuchFileException` |
| `CREATE, APPEND` | відкриває, запис у кінець | створює новий |

Інші корисні опції: `SYNC`/`DSYNC` (кожен запис одразу на диск), `DELETE_ON_CLOSE` (тимчасові файли).

```text
Чи існує файл?
├── так ──► обрізати? ──► так: TRUNCATE_EXISTING
│                     └─► ні:  READ / WRITE
├── ні ───► CREATE_NEW
└── не знаю / байдуже ──► що робити, якщо існує?
                          ├── обрізати:  CREATE + TRUNCATE_EXISTING (за замовчуванням для newOutputStream)
                          ├── залишити:  CREATE + WRITE
                          └── дописати:  CREATE + APPEND
```

### Фасад Files

Клас `java.nio.file.Files` надає простий інтерфейс: прочитати чи записати файл повністю одним викликом, без роботи з потоками.

```java
Path path = Path.of("lorem.txt");

// увесь текст
String content = Files.readString(path);                     // UTF-8 за замовчуванням
Files.writeString(Path.of("lorem.txt.bak"), content);

// рядки
List<String> lines = Files.readAllLines(path);
Files.write(Path.of("lorem.txt.bak"), lines);

// байти
byte[] bytes = Files.readAllBytes(Path.of("lorem.bin"));
Files.write(Path.of("lorem.bin.bak"), bytes);

// дописування
Path logFile = Path.of("log.txt");
for (int i = 0; i < 100; i++) {
    Files.writeString(logFile, "[Info] Запис журналу №" + i + System.lineSeparator(),
            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
}

// ліниве читання рядків
try (Stream<String> stream = Files.lines(path)) {
    long errors = stream.filter(line -> line.contains("Error")).count();
}
```

> [!WARNING]
> `readString`, `readAllLines` і `readAllBytes` завантажують **увесь** файл у пам'ять. Для великих файлів використовуйте `Files.lines` (ліниво, рядок за рядком; закривайте його через try-with-resources) або `BufferedReader`.

## Декоратори потоків

Патерн **Decorator** додає об'єкту нову функціональність, не змінюючи його класу: оригінальний об'єкт загортають у новий з **тим самим інтерфейсом**. Декоратор передає роботу загорнутому об'єкту й додає власні операції. На цьому патерні побудовано весь пакет `java.io`.

```text
                    InputStream (abstract)
                    read(byte[], int, int)
                ▲               ▲               ▲
                │               │               │
     FileInputStream   FilterInputStream ◄── містить InputStream
     (джерело)           ▲            ▲
                         │            │
          BufferedInputStream    GZIPInputStream (через InflaterInputStream)
          (буферизація)          (розпакування)
```

### Буферизація

`BufferedInputStream` і `BufferedOutputStream` тримають буфер у пам'яті (8 КБ за замовчуванням). Під час читання навіть одного байта декоратор заповнює весь буфер одним системним викликом і далі віддає дані з пам'яті. Під час запису — накопичує дані й записує їх великими блоками.

```java
Files.write(Path.of("file.bin"), new byte[100_000]);

try (InputStream raw = new FileInputStream("file.bin");
     InputStream buffered = new BufferedInputStream(raw, 20_000)) {   // буфер 20 КБ
    buffered.read();                    // читає 20 000 байтів у буфер, повертає перший
    System.out.println(raw.available()); // 80000: з файлу вже прочитано 20 000
}
```

На відміну від деяких інших платформ, `FileInputStream`/`FileOutputStream` власного буфера **не мають**. Без `BufferedInputStream` кожен `read()` — окремий системний виклик, а читання файлу по байту стає в сотні разів повільнішим. (`Files.newBufferedReader`/`newBufferedWriter` і `Files.readAllBytes` вже буферизовані.)

### Стиснення

Пакет `java.util.zip` надає декоратори стиснення: `GZIPOutputStream`/`GZIPInputStream` (формат gzip), `DeflaterOutputStream`/`InflaterInputStream` (формат zlib або «сирий» deflate). Під час запису декоратор стискає дані, перш ніж передати їх загорнутому потоку, а під час читання — розпаковує.

1. Стиснення:

```java
try (InputStream in = Files.newInputStream(Path.of("file.txt"));
     OutputStream out = new GZIPOutputStream(Files.newOutputStream(Path.of("file.txt.gz")))) {
    in.transferTo(out);
}
```

2. Розпакування:

```java
try (InputStream in = new GZIPInputStream(Files.newInputStream(Path.of("file.txt.gz")));
     OutputStream out = Files.newOutputStream(Path.of("file.txt"))) {
    byte[] buffer = new byte[4096];
    int read;
    while ((read = in.read(buffer)) != -1) {
        out.write(buffer, 0, read);
    }
}
```

### Поєднання декораторів

Декоратори самі є потоками, тож їх можна з'єднувати в ланцюжки:

```java
try (OutputStream out = new GZIPOutputStream(
        new BufferedOutputStream(
                new FileOutputStream("data.bin.gz")))) {
    out.write(new byte[1000]);
}
```

Дані проходять шлях:

```text
дані -> GZIPOutputStream (стиснення) -> BufferedOutputStream (буферизація) -> FileOutputStream (запис на диск)
```

Закриття декоратора (чи адаптера) закриває й загорнутий потік, тож досить закрити **зовнішній** об'єкт ланцюжка. Потоки стиснення записують залишок стиснених даних (а gzip — ще й заголовок кінця) лише під час `finish()` чи `close()`:

```java
var memory = new ByteArrayOutputStream();
var gz = new GZIPOutputStream(memory);
gz.write(new byte[1000]);
gz.finish();                                   // дописати стиснені дані, але не закривати memory
System.out.println("Стиснено до " + memory.size() + " байтів");   // ~30 байтів
```

## Адаптери: текст

Байтовий потік не знає про символи. Перетворення між байтами й символами виконують адаптери з **кодуванням** (`Charset`):

* `InputStreamReader` — `InputStream` → `Reader`;
* `OutputStreamWriter` — `OutputStream` → `Writer`;
* `BufferedReader` — буферизований `Reader` з методом `readLine()`;
* `BufferedWriter` з `newLine()`, `PrintWriter` з `println`/`printf`.

```java
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new FileInputStream("lorem.txt"), StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}

try (PrintWriter writer = new PrintWriter(Files.newBufferedWriter(Path.of("fizzbuzz.txt")))) {
    for (int i = 1; i <= 100; i++) {
        writer.print(i + " : ");
        if (i % 15 == 0) writer.println("FizzBuzz");
        else if (i % 3 == 0) writer.println("Fizz");
        else if (i % 5 == 0) writer.println("Buzz");
        else writer.println(i);
    }
}
```

`Files.newBufferedReader(path)` і `Files.newBufferedWriter(path)` створюють такий ланцюжок одним викликом.

### Кодування

Від Java 18 (JEP 400) кодування за замовчуванням — **UTF-8** на всіх платформах. Раніше воно залежало від ОС (на Windows — cp1250/cp1251), і текст з кирилицею чи польськими літерами ламався на іншому комп'ютері. Тому кодування варто вказувати явно, особливо в коді, що має працювати на старших версіях:

```java
Files.writeString(Path.of("a.txt"), "zażółć");                                  // UTF-8: 10 байтів
Files.writeString(Path.of("b.txt"), "zażółć", StandardCharsets.UTF_16LE);      // 12 байтів, без BOM
Files.writeString(Path.of("c.txt"), "zażółć", StandardCharsets.UTF_16);        // 14 байтів: BOM FE FF + big-endian
System.out.println(Files.readString(Path.of("c.txt"), StandardCharsets.UTF_16));   // zażółć
```

> [!WARNING]
> Декодер UTF-8 у Java **не прибирає** BOM (`EF BB BF`) на початку файлу: він потрапить у перший рядок як невидимий символ `﻿` і може зламати, наприклад, розбір першого заголовка CSV. Файли з BOM (типові для деяких програм Windows) потребують явного пропуску цього символу.

## Адаптери: бінарні дані

`DataOutputStream` і `DataInputStream` записують і читають **примітивні типи** в бінарному вигляді: `writeInt`, `writeLong`, `writeDouble`, `writeBoolean`, `writeUTF` та відповідні `read*`.

```java
public record Player(String name, int health, long experience, long money, float x, float y) { }

Player player = new Player("Bob", 100, 2500, 10, 48.5f, 32.5f);

try (var out = new DataOutputStream(new BufferedOutputStream(Files.newOutputStream(Path.of("player.bin"))))) {
    out.writeUTF(player.name());
    out.writeInt(player.health());
    out.writeLong(player.experience());
    out.writeLong(player.money());
    out.writeFloat(player.x());
    out.writeFloat(player.y());
}

try (var in = new DataInputStream(new BufferedInputStream(Files.newInputStream(Path.of("player.bin"))))) {
    Player loaded = new Player(in.readUTF(), in.readInt(), in.readLong(), in.readLong(),
                               in.readFloat(), in.readFloat());
    System.out.println(loaded);
}
```

Дані читаються в **тому самому порядку**, у якому записані. Формат не містить жодної інформації про структуру: якщо порядок не збігається, прочитаються «сміттєві» значення.

> [!NOTE]
> `DataOutputStream` завжди використовує порядок байтів **big-endian** (мережевий), незалежно від платформи. `writeUTF` записує 2-байтову довжину й рядок у *модифікованому* UTF-8 (до 65 535 байтів). Для інших форматів (little-endian, як у багатьох форматах файлів Windows і процесорів x86) використовують `ByteBuffer` з потрібним порядком:

```java
ByteBuffer buf = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN);
buf.putInt(100);                    // 64 00 00 00
byte[] bytes = buf.array();
int value = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).getInt();   // 100
```
