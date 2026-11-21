---
title: Resource Management
description: The AutoCloseable and Closeable interfaces, try-with-resources and how the compiler expands it, suppressed exceptions, the semantics of a correct close implementation, Cleaner as a safety net instead of finalizers.
---

## Resources and AutoCloseable

The garbage collector frees only the **memory** of objects. But a program also holds other **resources** that the JVM does not free by itself: files and sockets (OS handles), database connections, locks, off-heap memory, GPU memory. They must be released **explicitly and in time**, because the garbage collector may not run for a long while, and the number of handles in the system is limited.

That is what the `java.lang.AutoCloseable` interface with a single method is for:

```java
public interface AutoCloseable {
    void close() throws Exception;
}
```

Its subinterface `java.io.Closeable` narrows the signature (`void close() throws IOException`) and requires that a repeated call does nothing. These interfaces are implemented by I/O streams, `Socket`, JDBC's `Connection`, `ExecutorService` (Java 19), `Scanner`, `Arena` and others.

## The try-with-resources Statement

`try` with resources guarantees that `close()` will be called when control leaves the block: normally, via `return` or via an exception.

```java
try (BufferedReader in = Files.newBufferedReader(Path.of("file.txt"))) {
    System.out.println(in.readLine());
}   // in.close() is called automatically here
```

* **Several** resources can be declared in the parentheses, separated by `;`. They are closed in **reverse** order of declaration: the last one opened is closed first.
* Since Java 9 an existing variable can be given if it is `final` or effectively final.
* `catch` and `finally` blocks run **after** the resources are closed.

```java
try (var in = Files.newInputStream(Path.of("a.bin"));
     var out = Files.newOutputStream(Path.of("b.bin"))) {
    in.transferTo(out);
}   // first out.close(), then in.close()

Connection conn = dataSource.getConnection();
try (conn) {                       // Java 9: an existing effectively final variable
    // ...
} catch (SQLException e) {
    System.err.println("Database error: " + e.getMessage());   // conn is already closed
}
```

### How the Compiler Expands try-with-resources

The compiler turns the statement into roughly this code:

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
                primary.addSuppressed(closeError);   // the close exception does not lose the primary one
            }
        } else {
            in.close();
        }
    }
}
```

The key detail is **suppressed exceptions**. If an exception occurs both in the block body and in `close()`, the exception **from the body** propagates (it is usually the one describing the real problem), and the exception from `close()` is attached to it and available via `getSuppressed()`. A resource whose value is `null` is simply skipped.

```java
class Res implements AutoCloseable {
    public void close() { throw new IllegalStateException("close error"); }
}

try (var r = new Res()) {
    throw new RuntimeException("error in body");
} catch (RuntimeException e) {
    System.out.println(e.getMessage());                     // error in body
    System.out.println(e.getSuppressed()[0].getMessage());  // close error
}
```

Manual closing in `finally`, as was done before Java 7, lost the primary exception if `close()` failed too. That is why try-with-resources is the only correct way to work with resources.

## Implementing AutoCloseable

The `close()` method releases resources. Usually this comes down to closing all resources the object owns:

```java
public class Logger implements Closeable {
    private final BufferedWriter writer;
    private boolean closed;

    public Logger(Path path) throws IOException {
        this.writer = Files.newBufferedWriter(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    public void log(String message) throws IOException {
        if (closed) throw new IllegalStateException("The logger is closed");
        writer.write(message);
        writer.newLine();
    }

    @Override
    public void close() throws IOException {
        if (closed) return;          // a repeated call does nothing
        closed = true;
        writer.close();              // close the resources we own
    }
}

try (var log = new Logger(Path.of("app.log"))) {
    log.log("start");
}
```

An object implementing `AutoCloseable` should behave like this:

* after `close()` other methods throw `IllegalStateException` (or a specialized exception, e.g. `ClosedChannelException`);
* a repeated `close()` causes no error (mandatory for `Closeable`, desirable for `AutoCloseable`);
* everything the object **owns** is closed. Resources obtained from outside (e.g. streams passed into the constructor) are closed by whoever created them — this should be documented;
* the `close()` signature should declare the narrowest possible exception or none at all, so that users do not have to catch `Exception`.

> [!WARNING]
> If an object's constructor opens several resources and the second one throws an exception, the first must be closed manually: the object was never created, so nobody will call `close()`.

## Cleaner: a Safety Net for a Forgotten close

Sometimes a class **directly** owns a resource outside the JVM: memory allocated by a native library, a raw handle. Then, besides `close()`, it is worth having a **safety net** in case the user forgets to close the object. In the past `finalize()` was used for this, but this mechanism is deprecated for removal: it is unknown when or whether it is called at all, it slows down garbage collection and can "resurrect" an object.

The modern replacement is `java.lang.ref.Cleaner`. An object registers a **cleaning action** that runs after the object becomes unreachable, or earlier, on an explicit `close()`. The action runs **exactly once**.

```java
public final class NativeBuffer implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();

    // The state needed for cleaning. It MUST NOT refer to NativeBuffer,
    // otherwise the object would never become unreachable.
    private record State(long address) implements Runnable {
        @Override public void run() {
            NativeLib.free(address);          // release only our own native resource
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
        cleanable.clean();                    // deterministic release; a repeated call does nothing
    }
}
```

> [!IMPORTANT]
> A cleaning action must release **only** resources outside the JVM that the object owns directly. It must not access other Java objects (e.g. close streams): at that moment they may already be collected or in an inconsistent state. A class that owns only other `AutoCloseable` objects (like `Logger` above) does not need a `Cleaner`: those objects take care of themselves.

In practice a custom `Cleaner` is rarely written: standard classes (`FileChannel`, `Arena`, direct `ByteBuffer`s) already have such a safety net. But you cannot rely on it. Always close resources explicitly with try-with-resources.
