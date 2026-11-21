---
title: Винятки
description: Ієрархія Throwable, checked і unchecked винятки, перехоплення й порядок catch, multi-catch, throws, кидання і повторне кидання, ланцюжки причин, власні винятки, finally та його пастки, добрі практики.
---

## Винятки

Синтаксично винятки в Java схожі на C++: код, що може кинути виняток, обгортають блоком `try`, а обробники пишуть у блоках `catch`. Але кинути можна **лише** об'єкт класу `Throwable` або його нащадка.

```text
Throwable
├── Error                        серйозні збої JVM: зазвичай не перехоплюють
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── AssertionError ...
└── Exception                    CHECKED: компілятор вимагає обробити або оголосити
    ├── IOException
    │   ├── FileNotFoundException, NoSuchFileException ...
    ├── SQLException
    ├── InterruptedException ...
    └── RuntimeException         UNCHECKED: обробка необов'язкова
        ├── NullPointerException
        ├── IllegalArgumentException
        │   └── NumberFormatException
        ├── IllegalStateException
        ├── IndexOutOfBoundsException
        ├── ArithmeticException
        ├── ClassCastException
        └── UnsupportedOperationException ...
```

## Checked і unchecked

Унікальна особливість Java — **перевірювані** (checked) винятки. Якщо метод може кинути checked-виняток (нащадок `Exception`, але не `RuntimeException`), він мусить або **обробити** його в `catch`, або **оголосити** в сигнатурі через `throws`. Інакше програма не скомпілюється.

```java
public static String readFirstLine(Path path) throws IOException {   // оголошуємо
    try (var reader = Files.newBufferedReader(path)) {
        return reader.readLine();
    }
}

void caller() {
    // readFirstLine(Path.of("a.txt"));    // ПОМИЛКА: unreported exception IOException
    try {
        readFirstLine(Path.of("a.txt"));    // обробляємо
    } catch (IOException e) {
        System.err.println("Не вдалося прочитати: " + e.getMessage());
    }
}
```

**Неперевірювані** (unchecked) винятки — `RuntimeException`, `Error` та їхні нащадки — компілятор не відстежує.

| | Checked | Unchecked |
| --- | --- | --- |
| Що означає | очікувана ситуація зовнішнього світу, яку викликач може обробити | помилка програміста або порушення контракту |
| Приклади | файл не знайдено, мережа недоступна, БД відповіла помилкою | `null` там, де його не має бути, неправильний індекс, некоректний аргумент |
| Компілятор | вимагає `catch` або `throws` | не вимагає |

> [!NOTE]
> Checked-винятки — предмет давніх суперечок. Вони роблять можливі помилки частиною API, але погано поєднуються з лямбдами (стандартні функціональні інтерфейси не оголошують `throws`) і змушують «протягувати» `throws` через багато шарів. Сучасні бібліотеки (Spring, Jackson для багатьох API) часто загортають їх в unchecked.

## Перехоплення винятків

Коли виникає виняток, JVM шукає відповідний блок `catch` **згори донизу**: перший блок, тип якого є типом винятку або його надтипом. Тому конкретніші типи пишуть **вище**. Компілятор забороняє недосяжний `catch` (наприклад, `catch (IOException)` після `catch (Exception)`).

```java
try {
    String text = Files.readString(Path.of("file.txt"));
    int number = Integer.parseInt(text.strip());
    System.out.println(100 / number);
} catch (NoSuchFileException e) {
    System.out.println("Файл не знайдено: " + e.getFile());
} catch (IOException e) {
    System.out.println("Помилка читання: " + e);
} catch (NumberFormatException e) {
    System.out.println("Некоректне число: " + e.getMessage());
} catch (RuntimeException e) {                  // будь-який інший unchecked
    System.out.println("Неочікувана помилка: " + e);
}
```

### Кілька типів в одному catch

Якщо обробка однакова, типи об'єднують через `|` (multi-catch). Типи не можуть бути підтипами один одного, а змінна неявно `final`.

```java
try {
    loadConfiguration();
} catch (IOException | IllegalArgumentException e) {
    System.err.println("Не вдалося завантажити конфігурацію: " + e.getMessage());
}
```

### Умови перехоплення

Окремих фільтрів винятків у Java немає. Якщо обробити треба лише частину винятків певного типу, умову перевіряють усередині `catch`, а решту кидають далі. Але краще, щоб різні ситуації мали **різні типи винятків**: тоді `catch` обирає обробник сам.

```java
// умова всередині catch: обробляємо лише частину винятків SQLException
try {
    repository.insert(user);
} catch (SQLException e) {
    if (e.getSQLState().startsWith("23")) {      // порушення обмеження цілісності
        System.out.println("Такий користувач уже існує");
    } else {
        throw e;                                 // решту — далі (метод оголошує throws SQLException)
    }
}

// краще: окремий тип винятку для окремої ситуації
try {
    User u = userService.findByEmail(email);
} catch (UserNotFoundException e) {
    System.out.println("Користувача не знайдено: " + e.getMessage());
} catch (DataAccessException e) {
    System.out.println("Помилка бази даних");
}
```

## Кидання винятків

Виняток кидають інструкцією `throw` з об'єктом винятку. Сам тип частково документує ситуацію, але варто додати повідомлення, яке пояснює, **що саме** сталося, і містить значення, що спричинили помилку.

```java
public static void validateInput(String input, int maxLength) {
    Objects.requireNonNull(input, "input не може бути null");
    if (input.length() > maxLength) {
        throw new IllegalArgumentException(
                "Довжина %d перевищує максимум %d".formatted(input.length(), maxLength));
    }
}
```

Типові стандартні винятки:

| Ситуація | Виняток |
| --- | --- |
| неправильне значення аргументу | `IllegalArgumentException` |
| аргумент `null` там, де не можна | `NullPointerException` (через `Objects.requireNonNull`) |
| індекс поза межами | `IndexOutOfBoundsException` (`Objects.checkIndex`) |
| об'єкт у неправильному стані для операції | `IllegalStateException` |
| операцію не підтримано | `UnsupportedOperationException` |
| не знайдено елемента | `NoSuchElementException` |

## Повторне кидання та ланцюжки причин

У блоці `catch` виняток можна частково обробити (наприклад, залогувати) і кинути далі. У Java повторне кидання `throw e;` **зберігає** початковий стек викликів (stack trace): він записується під час створення об'єкта винятку, а не під час кидання.

```java
try {
    validateInput(text, 16);
} catch (IllegalArgumentException e) {
    log.warn("Некоректні дані", e);
    throw e;                                   // той самий об'єкт, той самий stack trace
}
```

Часто виняток низького рівня **загортають** у виняток, зрозумілий на вищому рівні абстракції. Початковий виняток передають як **причину** (cause), щоб не втратити інформацію:

```java
public User loadUser(long id) {
    try {
        return repository.find(id);
    } catch (SQLException e) {
        throw new DataAccessException("Не вдалося завантажити користувача " + id, e);   // cause!
    }
}
```

У stack trace така пара виглядає як `... Caused by: java.sql.SQLException: ...`. Причину можна отримати через `getCause()`.

> [!CAUTION]
> Ніколи не «ковтайте» винятки: `catch (Exception e) { }` приховує помилку, і програма продовжить роботу в некоректному стані. Мінімум — залогувати виняток **разом зі stack trace**. Краще — обробити або кинути далі. І не губіть причину: `throw new MyException(e.getMessage())` без `e` як cause втрачає stack trace початкової помилки.

## Власні типи винятків

Стандартна бібліотека має багато типів винятків, але для бізнес-ситуацій варто створювати власні: код стає читабельнішим, а обробка — точнішою. Зазвичай реалізують чотири стандартні конструктори, до яких можна додати власні поля:

```java
public class InvalidOrderException extends RuntimeException {     // unchecked
    private final long orderId;

    public InvalidOrderException(long orderId, String message) {
        super(message);
        this.orderId = orderId;
    }

    public InvalidOrderException(long orderId, String message, Throwable cause) {
        super(message, cause);
        this.orderId = orderId;
    }

    public long getOrderId() { return orderId; }
}

public class ConfigNotFoundException extends Exception {           // checked
    public ConfigNotFoundException() { }
    public ConfigNotFoundException(String message) { super(message); }
    public ConfigNotFoundException(String message, Throwable cause) { super(message, cause); }
    public ConfigNotFoundException(Throwable cause) { super(cause); }
}
```

Батьківський клас обирають за змістом: `RuntimeException` (найчастіше) або `Exception`, якщо викликач реально може і мусить обробити ситуацію.

## Блок finally

До `try`/`catch` можна додати блок `finally`. Його код виконується **завжди**, хоч би як завершився блок `try`: нормально, через `return`/`break`/`continue` чи через виняток (перехоплений або ні). Виняток — лише аварійне завершення всього процесу (`System.exit`, `Runtime.halt`, падіння JVM).

```java
Lock lock = new ReentrantLock();
lock.lock();
try {
    updateSharedState();
} finally {
    lock.unlock();           // звільняємо, навіть якщо updateSharedState кинув виняток
}
```

Для ресурсів, що реалізують `AutoCloseable`, замість `finally` використовують **try-with-resources** (сторінка «Керування ресурсами»): він коректно обробляє винятки під час закриття.

> [!WARNING]
> Не пишіть `return` чи `throw` у блоці `finally`: він **перекриє** результат або виняток з блоку `try`, і початковий виняток буде тихо втрачено.

```java
static int surprise() {
    try {
        throw new IllegalStateException("загубиться");
    } finally {
        return 42;           // виняток зник безслідно; компілятор лише попереджає
    }
}
```

## Корисні методи Throwable

```java
try {
    riskyOperation();
} catch (Exception e) {
    e.getMessage();                  // повідомлення
    e.getCause();                    // причина (або null)
    e.getStackTrace();               // масив StackTraceElement
    e.getSuppressed();               // придушені винятки (з try-with-resources)
    e.printStackTrace();             // друк у System.err (у реальному коді — логер)
}
```

> [!TIP]
> Винятки — для **виняткових** ситуацій, а не для звичайного потоку керування. Створення винятку дороге (заповнення stack trace), тож перевірку «чи є такий ключ» роблять через `containsKey`/`Optional`, а не через перехоплення `NoSuchElementException`.
