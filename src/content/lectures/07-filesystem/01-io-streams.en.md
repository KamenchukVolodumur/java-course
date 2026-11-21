---
title: I/O Streams
description: InputStream and OutputStream, reading and writing in blocks, random access with RandomAccessFile and FileChannel, flush and close, opening files and StandardOpenOption, the Files facade, decorators (buffering, compression), text adapters and encodings, binary DataInputStream/DataOutputStream and byte order.
---

## I/O Streams

I/O streams in Java are an abstraction for input/output operations. A stream represents **a sequence of bytes** that can be read or written. The source or destination can be a file, memory, a network connection or a pipe between processes. Regardless of the source, data is handled the same way.

> [!NOTE]
> I/O streams (`java.io.InputStream`) and Stream API streams (`java.util.stream.Stream`, the "Stream API" page) are **different** things that happen to share a name.

Unlike the "one stream that can do everything" approach, in Java the direction is determined by the **type**:

| | Bytes | Characters (text) |
| --- | --- | --- |
| **Reading** | `InputStream` | `Reader` |
| **Writing** | `OutputStream` | `Writer` |

Errors are reported with exceptions, mostly **`IOException`** and its descendants (`FileNotFoundException`, `NoSuchFileException`, `AccessDeniedException`, `EOFException`). These are checked exceptions, so they must be handled or declared.

> [!TIP]
> Working with a "bare" byte stream is inconvenient. Usually decorators and adapters (the sections below) are layered on top of it, or the ready-made methods of the `Files` class are used.

## Working with Streams

### Reading

The main method `int read(byte[] b, int off, int len)` reads **up to** `len` bytes and returns the number of bytes actually read. There may be **fewer** than requested (e.g. the network has not delivered the rest yet). The end of the stream is signaled by the value **`-1`**.

```java
try (InputStream in = new FileInputStream("lorem.txt")) {
    byte[] buffer = new byte[256];
    int read;
    while ((read = in.read(buffer, 0, buffer.length)) != -1) {
        System.out.println("Read " + read + " bytes");
    }
}
```

The parameterless `read()` method reads a single byte (0–255) or returns `-1`. For files without a buffer this is very inefficient: every call is an OS system call.

Since `read` may return fewer bytes than needed, there are helper methods for reading a block of known size:

```java
try (InputStream in = Files.newInputStream(Path.of("lorem.bin"))) {
    byte[] header = in.readNBytes(16);          // up to 16 bytes; fewer only at the end of the stream
    byte[] rest = in.readAllBytes();            // everything to the end (careful with large streams)
    in.skip(10);                                // skip bytes
}

try (var din = new DataInputStream(new FileInputStream("lorem.bin"))) {
    byte[] exactly = new byte[16];
    din.readFully(exactly);                     // exactly 16 bytes or EOFException
}
```

### Writing

The `void write(byte[] b, int off, int len)` method writes all the given bytes (unlike `read`, it does not write partially).

```java
try (OutputStream out = new FileOutputStream("data.bin")) {
    byte[] buffer = new byte[256];
    for (int i = 0; i < 256; i++) buffer[i] = (byte) i;
    out.write(buffer, 0, buffer.length);
    out.write(0xFF);                            // a single byte: the low 8 bits of the int
}
```

### Copying a Stream

```java
try (InputStream in = Files.newInputStream(src);
     OutputStream out = Files.newOutputStream(dst)) {
    long copied = in.transferTo(out);           // Java 9
}
```

### Random Access

`InputStream`/`OutputStream` streams are **sequential**: the current position cannot be changed. For random access to a file, `RandomAccessFile` or `FileChannel` is used:

```java
try (var raf = new RandomAccessFile("lorem.txt", "rw")) {
    raf.seek(0);                                // to the beginning
    raf.seek(raf.length());                     // to the end
    raf.seek(10);
    int b = raf.read();
    raf.writeInt(42);                           // writing from the current position
    long pos = raf.getFilePointer();
}

try (FileChannel ch = FileChannel.open(Path.of("lorem.txt"), StandardOpenOption.READ)) {
    ch.position(100);
    ByteBuffer buf = ByteBuffer.allocate(16);
    ch.read(buf);                               // from the current position
    ch.read(buf.clear(), 500);                  // from position 500, WITHOUT changing the current one
    long size = ch.size();
}
```

The positional `read(buffer, position)`/`write(buffer, position)` of `FileChannel` do not change the channel's current position, so they can be safely used from several threads at once.

### Flushing Buffers and Closing

Written data usually does not reach the destination immediately: it is buffered by the stream, the OS or the disk. The **`flush()`** method passes the data from the stream's buffers to the operating system. It does **not** guarantee that the OS has physically written it to disk. For that there is `FileChannel.force(true)` or `FileOutputStream.getFD().sync()` (the counterpart of `fsync`).

Closing a stream (`close()`) first flushes the buffers and then releases OS resources. Streams are always opened in **try-with-resources** so that closing happens even on an exception:

```java
try (OutputStream out = new BufferedOutputStream(new FileOutputStream("log.bin"))) {
    out.write(data);
}   // flush() + close()

// the compiler turns this into roughly:
OutputStream out = new BufferedOutputStream(new FileOutputStream("log.bin"));
try {
    out.write(data);
} finally {
    out.close();                                // with suppressed exception handling
}
```

## File Streams

Files can be opened with the `FileInputStream`/`FileOutputStream` classes or, more modernly, with the methods of the `java.nio.file.Files` class, which take a `Path` and **open options**:

```java
InputStream in1 = new FileInputStream("file1.txt");
OutputStream out1 = new FileOutputStream("file2.txt");              // creates or TRUNCATES
OutputStream out2 = new FileOutputStream("log.txt", true);          // appending to the end

InputStream in2 = Files.newInputStream(Path.of("file3.txt"));
OutputStream out3 = Files.newOutputStream(Path.of("file4.txt"),
        StandardOpenOption.CREATE, StandardOpenOption.APPEND);
```

The opening behavior is set with the `StandardOpenOption` constants:

| Options | The file **exists** | The file **does not exist** |
| --- | --- | --- |
| `CREATE_NEW, WRITE` | `FileAlreadyExistsException` | creates a new one |
| *(no options)* or `CREATE, TRUNCATE_EXISTING, WRITE` | **truncates** it to zero | creates a new one |
| `READ` (the default for reading) | opens it | `NoSuchFileException` |
| `CREATE, WRITE` | opens it without truncating (writing from the beginning) | creates a new one |
| `TRUNCATE_EXISTING, WRITE` | **truncates** it | `NoSuchFileException` |
| `CREATE, APPEND` | opens it, writing at the end | creates a new one |

Other useful options: `SYNC`/`DSYNC` (every write goes straight to disk), `DELETE_ON_CLOSE` (temporary files).

```text
Does the file exist?
├── yes ──► truncate? ──► yes: TRUNCATE_EXISTING
│                     └─► no:  READ / WRITE
├── no ───► CREATE_NEW
└── don't know / don't care ──► what to do if it exists?
                          ├── truncate:  CREATE + TRUNCATE_EXISTING (the default for newOutputStream)
                          ├── keep:      CREATE + WRITE
                          └── append:    CREATE + APPEND
```

### The Files Facade

The `java.nio.file.Files` class provides a simple interface: read or write a whole file in one call, without dealing with streams.

```java
Path path = Path.of("lorem.txt");

// all the text
String content = Files.readString(path);                     // UTF-8 by default
Files.writeString(Path.of("lorem.txt.bak"), content);

// lines
List<String> lines = Files.readAllLines(path);
Files.write(Path.of("lorem.txt.bak"), lines);

// bytes
byte[] bytes = Files.readAllBytes(Path.of("lorem.bin"));
Files.write(Path.of("lorem.bin.bak"), bytes);

// appending
Path logFile = Path.of("log.txt");
for (int i = 0; i < 100; i++) {
    Files.writeString(logFile, "[Info] Log entry #" + i + System.lineSeparator(),
            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
}

// lazy reading of lines
try (Stream<String> stream = Files.lines(path)) {
    long errors = stream.filter(line -> line.contains("Error")).count();
}
```

> [!WARNING]
> `readString`, `readAllLines` and `readAllBytes` load **the whole** file into memory. For large files use `Files.lines` (lazily, line by line; close it with try-with-resources) or a `BufferedReader`.

## Stream Decorators

The **Decorator** pattern adds new functionality to an object without changing its class: the original object is wrapped in a new one with **the same interface**. The decorator delegates the work to the wrapped object and adds its own operations. The whole `java.io` package is built on this pattern.

```text
                    InputStream (abstract)
                    read(byte[], int, int)
                ▲               ▲               ▲
                │               │               │
     FileInputStream   FilterInputStream ◄── contains an InputStream
     (a source)          ▲            ▲
                         │            │
          BufferedInputStream    GZIPInputStream (via InflaterInputStream)
          (buffering)            (decompression)
```

### Buffering

`BufferedInputStream` and `BufferedOutputStream` keep a buffer in memory (8 KB by default). When reading even a single byte, the decorator fills the whole buffer with one system call and then serves data from memory. When writing, it accumulates data and writes it in large blocks.

```java
Files.write(Path.of("file.bin"), new byte[100_000]);

try (InputStream raw = new FileInputStream("file.bin");
     InputStream buffered = new BufferedInputStream(raw, 20_000)) {   // a 20 KB buffer
    buffered.read();                    // reads 20,000 bytes into the buffer, returns the first one
    System.out.println(raw.available()); // 80000: 20,000 bytes have already been read from the file
}
```

Unlike some other platforms, `FileInputStream`/`FileOutputStream` have **no** buffer of their own. Without a `BufferedInputStream`, every `read()` is a separate system call, and reading a file byte by byte becomes hundreds of times slower. (`Files.newBufferedReader`/`newBufferedWriter` and `Files.readAllBytes` are already buffered.)

### Compression

The `java.util.zip` package provides compression decorators: `GZIPOutputStream`/`GZIPInputStream` (the gzip format), `DeflaterOutputStream`/`InflaterInputStream` (the zlib format or "raw" deflate). When writing, the decorator compresses the data before passing it to the wrapped stream, and when reading it decompresses.

1. Compression:

```java
try (InputStream in = Files.newInputStream(Path.of("file.txt"));
     OutputStream out = new GZIPOutputStream(Files.newOutputStream(Path.of("file.txt.gz")))) {
    in.transferTo(out);
}
```

2. Decompression:

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

### Combining Decorators

Decorators are streams themselves, so they can be chained:

```java
try (OutputStream out = new GZIPOutputStream(
        new BufferedOutputStream(
                new FileOutputStream("data.bin.gz")))) {
    out.write(new byte[1000]);
}
```

The data travels this path:

```text
data -> GZIPOutputStream (compression) -> BufferedOutputStream (buffering) -> FileOutputStream (writing to disk)
```

Closing a decorator (or adapter) also closes the wrapped stream, so it is enough to close the **outermost** object of the chain. Compression streams write the remainder of the compressed data (and gzip also the trailer) only on `finish()` or `close()`:

```java
var memory = new ByteArrayOutputStream();
var gz = new GZIPOutputStream(memory);
gz.write(new byte[1000]);
gz.finish();                                   // write out the compressed data, but do not close memory
System.out.println("Compressed to " + memory.size() + " bytes");   // ~30 bytes
```

## Adapters: Text

A byte stream knows nothing about characters. Conversion between bytes and characters is done by adapters with an **encoding** (`Charset`):

* `InputStreamReader` — `InputStream` → `Reader`;
* `OutputStreamWriter` — `OutputStream` → `Writer`;
* `BufferedReader` — a buffered `Reader` with the `readLine()` method;
* `BufferedWriter` with `newLine()`, `PrintWriter` with `println`/`printf`.

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

`Files.newBufferedReader(path)` and `Files.newBufferedWriter(path)` create such a chain in one call.

### Encodings

Since Java 18 (JEP 400) the default encoding is **UTF-8** on all platforms. Previously it depended on the OS (on Windows — cp1250/cp1251), and text with Cyrillic or Polish letters broke on another computer. That is why the encoding should be specified explicitly, especially in code that must run on older versions:

```java
Files.writeString(Path.of("a.txt"), "zażółć");                                  // UTF-8: 10 bytes
Files.writeString(Path.of("b.txt"), "zażółć", StandardCharsets.UTF_16LE);      // 12 bytes, no BOM
Files.writeString(Path.of("c.txt"), "zażółć", StandardCharsets.UTF_16);        // 14 bytes: BOM FE FF + big-endian
System.out.println(Files.readString(Path.of("c.txt"), StandardCharsets.UTF_16));   // zażółć
```

> [!WARNING]
> Java's UTF-8 decoder does **not strip** the BOM (`EF BB BF`) at the beginning of a file: it ends up in the first line as the invisible character `﻿` and may break, for example, the parsing of the first CSV header. Files with a BOM (typical of some Windows programs) need the character to be skipped explicitly.

## Adapters: Binary Data

`DataOutputStream` and `DataInputStream` write and read **primitive types** in binary form: `writeInt`, `writeLong`, `writeDouble`, `writeBoolean`, `writeUTF` and the corresponding `read*`.

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

Data is read in **the same order** in which it was written. The format contains no information about the structure: if the order does not match, "garbage" values are read.

> [!NOTE]
> `DataOutputStream` always uses **big-endian** (network) byte order, regardless of the platform. `writeUTF` writes a 2-byte length and the string in *modified* UTF-8 (up to 65,535 bytes). For other formats (little-endian, as in many Windows file formats and on x86 processors), a `ByteBuffer` with the required order is used:

```java
ByteBuffer buf = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN);
buf.putInt(100);                    // 64 00 00 00
byte[] bytes = buf.array();
int value = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).getInt();   // 100
```
