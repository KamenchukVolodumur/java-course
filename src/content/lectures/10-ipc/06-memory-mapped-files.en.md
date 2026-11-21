---
title: Memory-Mapped Files
description: Mapping a file into a process's address space, FileChannel.map and MappedByteBuffer, MemorySegment for large files, byte order and force, shared memory between processes, synchronization with FileLock, performance.
---

## The Idea

**Memory mapping** a file (a memory-mapped file) is an OS mechanism that projects a file's contents directly into a process's address space. After that the file can be read and modified like an array in memory, without `read`/`write` calls.

The main use cases:

1. **Efficient access to large files.** The program accesses the file as if it were entirely in memory, even if it is much larger than RAM. The OS loads and unloads the required pages (usually 4 KB each) on demand. This makes it possible to read and modify huge files at random without loading them entirely.
2. **Inter-process communication.** Several processes map the same file into their address spaces and **see the same physical memory**. This is one of the fastest forms of IPC.

## MappedByteBuffer

The classic API is `FileChannel.map(mode, position, size)`, which returns a `MappedByteBuffer` — a kind of `ByteBuffer` whose contents are the file:

| Mode | Meaning |
| --- | --- |
| `READ_ONLY` | read only |
| `READ_WRITE` | changes are written to the file and visible to other processes that map the same file |
| `PRIVATE` | copy-on-write: only this process sees the changes, the file does not change |

```java
Path path = Path.of("test.dat");
String message = "Hello, world!";
byte[] bytes = message.getBytes(StandardCharsets.UTF_8);

try (FileChannel channel = FileChannel.open(path,
        StandardOpenOption.CREATE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {

    MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 1024);  // the file grows to 1024 bytes
    buffer.putInt(0, bytes.length);              // an absolute write: the length at offset 0
    buffer.put(4, bytes);                        // Java 16: an absolute array write
    buffer.force();                              // guaranteed flushing of the changes to disk

    int length = buffer.getInt(0);
    byte[] read = new byte[length];
    buffer.get(4, read);
    System.out.println(new String(read, StandardCharsets.UTF_8));   // Hello, world!
}
```

Peculiarities:

* `ByteBuffer` uses **big-endian** byte order by default. For exchange with native programs, set `buffer.order(ByteOrder.LITTLE_ENDIAN)` or `ByteOrder.nativeOrder()`.
* The mapping is **not closed** together with the channel: it lives as long as the buffer is reachable and is released by the garbage collector at an unspecified moment. On Windows the file cannot be deleted while the mapping is alive.
* A `ByteBuffer` index is an `int`, so one mapping is limited to **2 GB**. Larger files had to be mapped in parts.

## MemorySegment

Since Java 22 (the Foreign Function & Memory API) a file can be mapped into a **`MemorySegment`**. It has `long` offsets without the 2 GB limit, and its lifetime is determined by an **arena**: closing it releases the mapping deterministically.

```java
try (Arena arena = Arena.ofConfined();
     FileChannel channel = FileChannel.open(Path.of("huge.bin"), StandardOpenOption.READ)) {

    MemorySegment file = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size(), arena);

    long sum = 0;
    long count = file.byteSize() / Long.BYTES;
    for (long i = 0; i < count; i++) {
        sum += file.getAtIndex(ValueLayout.JAVA_LONG_UNALIGNED, i);   // any offset, even > 2 GB
    }
    System.out.println(sum);
}   // closing the arena releases the mapping
```

More about `MemorySegment` and arenas is in the "Native Interoperability" chapter.

> [!NOTE]
> For **random** access to a large file, memory mapping is many times faster than streams: there is no system call and no copying per operation. For **sequential** reading or writing there is almost no gain, and buffered streams are often even faster.

## Shared Memory

**Shared memory** is a special case of mapping where the goal is not working with a file on disk, but **direct data exchange between processes**. The data is not copied between processes: both work with the same block of physical memory (the OS page cache).

Java has no API for named shared memory without a file, so the processes map **a shared file**:

* on Linux it is placed in `/dev/shm` — a `tmpfs` file system in RAM, so nothing is written to disk;
* on other OSes an ordinary temporary file works: actively used pages live in memory anyway, and the OS only writes them to disk from time to time.

> [!WARNING]
> When several processes (or threads) have access to the same memory, **synchronization** is needed. Without it a data race occurs: one process reads data that another is modifying at that very moment. Between processes, synchronization is done with **file locking** `FileChannel.lock()`: a system lock visible to all processes. (Within one JVM, two overlapping `lock()` calls on the same file throw `OverlappingFileLockException`: the lock belongs to the process, not to the thread.)

### Example: a Writer and a Reader

The writer fills the shared memory with the squares of numbers and sets a ready flag at the end. The reader, having acquired the lock, checks the flag and reads the data. The same program plays both roles depending on its argument.

```java
public class SharedMemory {
    static final Path SHM_FILE = Files.isDirectory(Path.of("/dev/shm"))
            ? Path.of("/dev/shm/shared_memory.shm")
            : Path.of(System.getProperty("java.io.tmpdir"), "shared_memory.shm");
    static final int COUNT = 500;
    static final int SIZE = Integer.BYTES * (COUNT + 1);           // the flag + the data

    public static void main(String[] args) throws Exception {
        switch (args.length == 1 ? args[0] : "") {
            case "writer" -> writer();
            case "reader" -> reader();
            default -> System.out.println("java SharedMemory [reader|writer]");
        }
    }

    static void writer() throws IOException {
        try (FileChannel channel = FileChannel.open(SHM_FILE,
                StandardOpenOption.CREATE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
            MappedByteBuffer shm = channel.map(FileChannel.MapMode.READ_WRITE, 0, SIZE);
            try (FileLock lock = channel.lock()) {                     // an exclusive lock on the whole file
                for (int i = 0; i < COUNT; i++) {
                    shm.putInt(Integer.BYTES * (i + 1), i * i);
                }
                shm.putInt(0, 1);                                      // the data is ready
            }
            System.out.println("Data written. Enter to exit");
            new Scanner(System.in).nextLine();
        }
    }

    static void reader() throws IOException {
        try (FileChannel channel = FileChannel.open(SHM_FILE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
            MappedByteBuffer shm = channel.map(FileChannel.MapMode.READ_WRITE, 0, SIZE);
            try (FileLock lock = channel.lock()) {                     // waits until the writer releases the lock
                if (shm.getInt(0) != 1) {
                    System.out.println("The writer has not prepared the data yet");
                    return;
                }
                for (int i = 0; i < COUNT; i++) {
                    System.out.println(shm.getInt(Integer.BYTES * (i + 1)));
                }
            }
        }
    }
}
```

Run it in two terminals: first `java SharedMemory writer`, then `java SharedMemory reader`. The reader prints `0, 1, 4, 9, ...`, although not a single byte was transferred through a pipe or the network: both processes read and write the same memory.

> [!NOTE]
> On Unix file locks are **advisory**: they protect only against processes that also call `lock()`. A process writing to the file without a lock will not notice anything. For frequent fine-grained synchronization (counters, queues in shared memory), instead of file locks, atomic operations on shared memory through a `VarHandle` for a `MemorySegment` are used. They are covered in the "Synchronization" chapter.
