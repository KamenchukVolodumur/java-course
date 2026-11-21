---
title: Керування ресурсами
description: Інтерфейси AutoCloseable і Closeable, try-with-resources і його розгортання компілятором, придушені винятки, семантика правильної реалізації close, Cleaner як страховка замість фіналізаторів.
---

## Ресурси і AutoCloseable

Збирач сміття звільняє лише **пам'ять** об'єктів. Але програма тримає й інші **ресурси**, яких JVM сама не звільняє: файли й сокети (дескриптори ОС), з'єднання з базою даних, блокування, пам'ять поза купою, пам'ять відеокарти. Їх треба звільняти **явно і вчасно**, бо збирач сміття може не спрацювати ще довго, а кількість дескрипторів у системі обмежена.

Для цього існує інтерфейс `java.lang.AutoCloseable` з одним методом:

```java
public interface AutoCloseable {
    void close() throws Exception;
}
```

Його підінтерфейс `java.io.Closeable` уточнює сигнатуру (`void close() throws IOException`) і вимагає, щоб повторний виклик нічого не робив. Ці інтерфейси реалізують потоки введення-виведення, `Socket`, `Connection` з JDBC, `ExecutorService` (Java 19), `Scanner`, `Arena` тощо.

## Інструкція try-with-resources

`try` з ресурсами гарантує, що `close()` буде викликано, коли керування покине блок: нормально, через `return` чи через виняток.

```java
try (BufferedReader in = Files.newBufferedReader(Path.of("file.txt"))) {
    System.out.println(in.readLine());
}   // тут автоматично викликається in.close()
```

* У дужках можна оголосити **кілька** ресурсів через `;`. Вони закриваються у **зворотному** порядку оголошення: останній відкритий закривається першим.
* Від Java 9 можна вказати вже наявну змінну, якщо вона `final` або effectively final.
* Блоки `catch` і `finally` виконуються **після** закриття ресурсів.

```java
try (var in = Files.newInputStream(Path.of("a.bin"));
     var out = Files.newOutputStream(Path.of("b.bin"))) {
    in.transferTo(out);
}   // спершу out.close(), потім in.close()

Connection conn = dataSource.getConnection();
try (conn) {                       // Java 9: наявна effectively final змінна
    // ...
} catch (SQLException e) {
    System.err.println("Помилка бази даних: " + e.getMessage());   // conn уже закрито
}
```

### Як компілятор розгортає try-with-resources

Компілятор перетворює інструкцію приблизно на такий код:

```java
BufferedReader in = Files.newBufferedReader(path);
Throwable primary = null;
try {
    System.out.println(in.readLine());
} catch (Throwable t) {
    primary = t;
    throw t;
} finally {
    if (in != null) {
        if (primary != null) {
            try {
                in.close();
            } catch (Throwable closeError) {
                primary.addSuppressed(closeError);   // виняток close не губить основний
            }
        } else {
            in.close();
        }
    }
}
```

Ключова деталь — **придушені винятки** (suppressed exceptions). Якщо виняток виник і в тілі блоку, і в `close()`, назовні вилітає виняток **з тіла** (зазвичай саме він описує справжню проблему), а виняток із `close()` додається до нього і доступний через `getSuppressed()`. Ресурс зі значенням `null` просто пропускається.

```java
class Res implements AutoCloseable {
    public void close() { throw new IllegalStateException("помилка закриття"); }
}

try (var r = new Res()) {
    throw new RuntimeException("помилка в тілі");
} catch (RuntimeException e) {
    System.out.println(e.getMessage());                     // помилка в тілі
    System.out.println(e.getSuppressed()[0].getMessage());  // помилка закриття
}
```

Ручне закриття в `finally`, як писали до Java 7, губило основний виняток, якщо `close()` теж падав. Тому try-with-resources — єдиний правильний спосіб працювати з ресурсами.

## Реалізація AutoCloseable

У методі `close()` звільняють ресурси. Зазвичай це зводиться до закриття всіх ресурсів, якими володіє об'єкт:

```java
public class Logger implements Closeable {
    private final BufferedWriter writer;
    private boolean closed;

    public Logger(Path path) throws IOException {
        this.writer = Files.newBufferedWriter(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    public void log(String message) throws IOException {
        if (closed) throw new IllegalStateException("Logger закрито");
        writer.write(message);
        writer.newLine();
    }

    @Override
    public void close() throws IOException {
        if (closed) return;          // повторний виклик нічого не робить
        closed = true;
        writer.close();              // закриваємо ресурси, якими володіємо
    }
}

try (var log = new Logger(Path.of("app.log"))) {
    log.log("старт");
}
```

Об'єкт, що реалізує `AutoCloseable`, має поводитися так:

* після `close()` інші методи кидають `IllegalStateException` (або спеціалізований виняток, наприклад `ClosedChannelException`);
* повторний `close()` не спричиняє помилки (обов'язково для `Closeable`, бажано для `AutoCloseable`);
* закривається все, чим об'єкт **володіє**. Ресурси, отримані ззовні (наприклад, передані в конструктор потоки), закриває той, хто їх створив, — це варто описати в документації;
* у сигнатурі `close()` варто вказувати якомога вужчий виняток або не вказувати жодного, щоб користувачам не доводилося перехоплювати `Exception`.

> [!WARNING]
> Якщо конструктор об'єкта відкриває кілька ресурсів і другий кидає виняток, перший треба закрити вручну: об'єкт так і не створено, тож `close()` ніхто не викличе.

## Cleaner: страховка на випадок забутого close

Іноді клас **безпосередньо** володіє ресурсом поза JVM: пам'яттю, виділеною нативною бібліотекою, сирим дескриптором. Тоді, окрім `close()`, варто мати **страховку** на випадок, якщо користувач забуде закрити об'єкт. Раніше для цього використовували `finalize()`, але цей механізм застарів і буде видалений: невідомо, коли і чи взагалі його буде викликано, він сповільнює збирання сміття і може «воскресити» об'єкт.

Сучасна заміна — `java.lang.ref.Cleaner`. Об'єкт реєструє **дію очищення**, яка виконається після того, як об'єкт стане недосяжним, або раніше, під час явного `close()`. Дія виконується **рівно один раз**.

```java
public final class NativeBuffer implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();

    // Стан, потрібний для очищення. НЕ може посилатися на NativeBuffer,
    // інакше об'єкт ніколи не стане недосяжним.
    private record State(long address) implements Runnable {
        @Override public void run() {
            NativeLib.free(address);          // звільняємо лише власний нативний ресурс
        }
    }

    private final Cleaner.Cleanable cleanable;
    private final long address;

    public NativeBuffer(long size) {
        this.address = NativeLib.allocate(size);
        this.cleanable = CLEANER.register(this, new State(address));
    }

    @Override
    public void close() {
        cleanable.clean();                    // детерміноване звільнення; повторний виклик нічого не робить
    }
}
```

> [!IMPORTANT]
> Дія очищення має звільняти **лише** ресурси поза JVM, якими об'єкт володіє безпосередньо. Звертатися до інших об'єктів Java (наприклад, закривати потоки) з неї не можна: у цей момент вони можуть бути вже зібрані або в некоректному стані. Класу, який володіє лише іншими `AutoCloseable`-об'єктами (як `Logger` вище), `Cleaner` не потрібен: ті об'єкти дбають про себе самі.

На практиці власний `Cleaner` пишуть рідко: стандартні класи (`FileChannel`, `Arena`, прямі `ByteBuffer`) уже мають таку страховку. Але покладатися на неї не можна. Ресурси завжди закривайте явно через try-with-resources.
