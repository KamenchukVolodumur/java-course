---
title: Exceptions
description: The Throwable hierarchy, checked and unchecked exceptions, catching and the order of catch blocks, multi-catch, throws, throwing and rethrowing, cause chains, custom exceptions, finally and its pitfalls, good practices.
---

## Exceptions

Syntactically, exceptions in Java are similar to C++: code that may throw an exception is wrapped in a `try` block, and handlers are written in `catch` blocks. But you can throw **only** an object of the `Throwable` class or one of its descendants.

```text
Throwable
├── Error                        serious JVM failures: usually not caught
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── AssertionError ...
└── Exception                    CHECKED: the compiler requires handling or declaring
    ├── IOException
    │   ├── FileNotFoundException, NoSuchFileException ...
    ├── SQLException
    ├── InterruptedException ...
    └── RuntimeException         UNCHECKED: handling is optional
        ├── NullPointerException
        ├── IllegalArgumentException
        │   └── NumberFormatException
        ├── IllegalStateException
        ├── IndexOutOfBoundsException
        ├── ArithmeticException
        ├── ClassCastException
        └── UnsupportedOperationException ...
```

## Checked and Unchecked

A unique feature of Java is **checked** exceptions. If a method can throw a checked exception (a descendant of `Exception` but not of `RuntimeException`), it must either **handle** it in a `catch` or **declare** it in its signature with `throws`. Otherwise the program will not compile.

```java
public static String readFirstLine(Path path) throws IOException {   // declaring
    try (var reader = Files.newBufferedReader(path)) {
        return reader.readLine();
    }
}

void caller() {
    // readFirstLine(Path.of("a.txt"));    // ERROR: unreported exception IOException
    try {
        readFirstLine(Path.of("a.txt"));    // handling
    } catch (IOException e) {
        System.err.println("Could not read: " + e.getMessage());
    }
}
```

**Unchecked** exceptions — `RuntimeException`, `Error` and their descendants — are not tracked by the compiler.

| | Checked | Unchecked |
| --- | --- | --- |
| Meaning | an expected situation in the outside world that the caller can handle | a programmer error or a contract violation |
| Examples | file not found, network unavailable, the database returned an error | `null` where it should not be, a wrong index, an invalid argument |
| Compiler | requires `catch` or `throws` | does not require anything |

> [!NOTE]
> Checked exceptions are the subject of long-running debates. They make possible errors part of the API, but combine poorly with lambdas (the standard functional interfaces declare no `throws`) and force `throws` to be "threaded" through many layers. Modern libraries (Spring, Jackson for many APIs) often wrap them in unchecked ones.

## Catching Exceptions

When an exception occurs, the JVM looks for a matching `catch` block **from top to bottom**: the first block whose type is the exception's type or its supertype. That is why more specific types are written **higher**. The compiler forbids an unreachable `catch` (e.g. `catch (IOException)` after `catch (Exception)`).

```java
try {
    String text = Files.readString(Path.of("file.txt"));
    int number = Integer.parseInt(text.strip());
    System.out.println(100 / number);
} catch (NoSuchFileException e) {
    System.out.println("File not found: " + e.getFile());
} catch (IOException e) {
    System.out.println("Read error: " + e);
} catch (NumberFormatException e) {
    System.out.println("Invalid number: " + e.getMessage());
} catch (RuntimeException e) {                  // any other unchecked
    System.out.println("Unexpected error: " + e);
}
```

### Several Types in One catch

If the handling is the same, types are combined with `|` (multi-catch). The types cannot be subtypes of each other, and the variable is implicitly `final`.

```java
try {
    loadConfiguration();
} catch (IOException | IllegalArgumentException e) {
    System.err.println("Could not load the configuration: " + e.getMessage());
}
```

### Catch Conditions

Java has no separate exception filters. If only part of the exceptions of a given type must be handled, the condition is checked inside the `catch`, and the rest are rethrown. But it is better when different situations have **different exception types**: then `catch` chooses the handler by itself.

```java
// a condition inside catch: handle only part of the SQLExceptions
try {
    repository.insert(user);
} catch (SQLException e) {
    if (e.getSQLState().startsWith("23")) {      // an integrity constraint violation
        System.out.println("Such a user already exists");
    } else {
        throw e;                                 // the rest go further (the method declares throws SQLException)
    }
}

// better: a separate exception type for a separate situation
try {
    User u = userService.findByEmail(email);
} catch (UserNotFoundException e) {
    System.out.println("User not found: " + e.getMessage());
} catch (DataAccessException e) {
    System.out.println("Database error");
}
```

## Throwing Exceptions

An exception is thrown with the `throw` statement and an exception object. The type itself partly documents the situation, but it is worth adding a message explaining **what exactly** happened and containing the values that caused the error.

```java
public static void validateInput(String input, int maxLength) {
    Objects.requireNonNull(input, "input must not be null");
    if (input.length() > maxLength) {
        throw new IllegalArgumentException(
                "Length %d exceeds the maximum of %d".formatted(input.length(), maxLength));
    }
}
```

Typical standard exceptions:

| Situation | Exception |
| --- | --- |
| an invalid argument value | `IllegalArgumentException` |
| a `null` argument where it is not allowed | `NullPointerException` (via `Objects.requireNonNull`) |
| an index out of bounds | `IndexOutOfBoundsException` (`Objects.checkIndex`) |
| the object is in the wrong state for the operation | `IllegalStateException` |
| the operation is not supported | `UnsupportedOperationException` |
| an element was not found | `NoSuchElementException` |

## Rethrowing and Cause Chains

In a `catch` block an exception can be partly handled (e.g. logged) and thrown further. In Java rethrowing with `throw e;` **preserves** the original stack trace: it is recorded when the exception object is created, not when it is thrown.

```java
try {
    validateInput(text, 16);
} catch (IllegalArgumentException e) {
    log.warn("Invalid data", e);
    throw e;                                   // the same object, the same stack trace
}
```

Often a low-level exception is **wrapped** in an exception that makes sense at a higher level of abstraction. The original exception is passed as the **cause**, so that no information is lost:

```java
public User loadUser(long id) {
    try {
        return repository.find(id);
    } catch (SQLException e) {
        throw new DataAccessException("Could not load user " + id, e);   // the cause!
    }
}
```

In a stack trace such a pair looks like `... Caused by: java.sql.SQLException: ...`. The cause can be obtained via `getCause()`.

> [!CAUTION]
> Never "swallow" exceptions: `catch (Exception e) { }` hides the error, and the program continues in an inconsistent state. At a minimum, log the exception **together with the stack trace**. Better — handle it or rethrow it. And do not lose the cause: `throw new MyException(e.getMessage())` without `e` as the cause loses the stack trace of the original error.

## Custom Exception Types

The standard library has many exception types, but for business situations it is worth creating your own: the code becomes more readable and the handling more precise. Usually the four standard constructors are implemented, and custom fields can be added:

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

The parent class is chosen by meaning: `RuntimeException` (most often) or `Exception` if the caller really can and must handle the situation.

## The finally Block

A `finally` block can be added to `try`/`catch`. Its code runs **always**, however the `try` block ends: normally, via `return`/`break`/`continue` or via an exception (caught or not). The only exception is an abnormal termination of the whole process (`System.exit`, `Runtime.halt`, a JVM crash).

```java
Lock lock = new ReentrantLock();
lock.lock();
try {
    updateSharedState();
} finally {
    lock.unlock();           // released even if updateSharedState threw an exception
}
```

For resources implementing `AutoCloseable`, **try-with-resources** is used instead of `finally` (the "Resource Management" page): it correctly handles exceptions during closing.

> [!WARNING]
> Do not write `return` or `throw` in a `finally` block: it **overrides** the result or the exception of the `try` block, and the original exception is silently lost.

```java
static int surprise() {
    try {
        throw new IllegalStateException("will be lost");
    } finally {
        return 42;           // the exception vanished without a trace; the compiler only warns
    }
}
```

## Useful Throwable Methods

```java
try {
    riskyOperation();
} catch (Exception e) {
    e.getMessage();                  // the message
    e.getCause();                    // the cause (or null)
    e.getStackTrace();               // an array of StackTraceElement
    e.getSuppressed();               // suppressed exceptions (from try-with-resources)
    e.printStackTrace();             // printing to System.err (in real code — a logger)
}
```

> [!TIP]
> Exceptions are for **exceptional** situations, not for ordinary control flow. Creating an exception is expensive (filling in the stack trace), so checking "is there such a key" is done with `containsKey`/`Optional`, not by catching `NoSuchElementException`.
