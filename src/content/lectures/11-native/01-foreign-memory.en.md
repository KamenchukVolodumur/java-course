---
title: Native Memory
description: Memory safety in Java and why to go beyond it, ByteBuffer.allocateDirect and the deprecated sun.misc.Unsafe, the Foreign Memory API — MemorySegment, arenas and their kinds, ValueLayout, "pointer arithmetic" with offsets and slices, sizes, struct layouts and VarHandle, unions, arrays of structs, a linked list in native memory, heap array segments, reinterpreting bits.
---

## A Safe Language and Native Memory

Java is a memory-**safe** language: there are no pointers, every array access is checked, and memory is managed by a garbage collector that may move objects. But in some situations memory **outside the heap** (off-heap) is needed:

* exchanging data with native C/C++ libraries (the next page), which expect raw addresses and structs with an exact field layout;
* large buffers that should not burden the garbage collector (gigabyte caches, I/O buffers);
* memory-mapped files and shared memory between processes.

Historically, the following were used for this:

* **`ByteBuffer.allocateDirect(n)`** — an off-heap buffer with an `int` index (up to 2 GB). The memory is released when the garbage collector removes the buffer object itself, i.e. at an unspecified moment;
* **`sun.misc.Unsafe`** — an internal JDK class with raw addresses (`allocateMemory`, `putInt(address, value)`, `freeMemory`) without any checks. A mistake meant a JVM crash. The memory access methods in `Unsafe` were deprecated for removal (Java 23).

The modern replacement is the **Foreign Function & Memory API** (FFM, the `java.lang.foreign` package, final in Java 22). It gives the performance of raw pointers while preserving safety:

* **spatial** — every access checks the segment's bounds;
* **temporal** — access to already freed memory throws an exception instead of reading garbage;
* **thread** — a segment can be confined to one thread.

## MemorySegment and Arenas

A **`MemorySegment`** is a contiguous region of memory of known size: native (off-heap), a mapped file or an array on the heap. An **`Arena`** manages the **lifetime** of native segments: all segments allocated in an arena are freed together with it.

```java
try (Arena arena = Arena.ofConfined()) {
    MemorySegment segment = arena.allocate(100 * Integer.BYTES);         // 400 bytes, zero-filled

    for (int i = 0; i < 100; i++) {
        segment.setAtIndex(ValueLayout.JAVA_INT, i, i * i);
    }
    System.out.println(segment.getAtIndex(ValueLayout.JAVA_INT, 99));    // 9801

    segment.setAtIndex(ValueLayout.JAVA_INT, 100, 0);                     // IndexOutOfBoundsException
}   // the memory is freed here — deterministically, like free() in C
```

| Arena | Closing | Thread access |
| --- | --- | --- |
| `Arena.ofConfined()` | explicit (`close`) | only the owner thread |
| `Arena.ofShared()` | explicit (`close`) | any threads |
| `Arena.ofAuto()` | by the garbage collector when the arena becomes unreachable | any threads |
| `Arena.global()` | never (until the end of the program) | any threads |

```java
MemorySegment leaked;
try (Arena arena = Arena.ofConfined()) {
    leaked = arena.allocate(16);
}
leaked.get(ValueLayout.JAVA_INT, 0);     // IllegalStateException: Already closed — instead of reading garbage
```

## ValueLayout and Offsets

A **value layout** (`ValueLayout`) describes how to interpret bytes: the size, alignment and byte order. The main ones are `JAVA_BYTE`, `JAVA_SHORT`, `JAVA_CHAR`, `JAVA_INT`, `JAVA_LONG`, `JAVA_FLOAT`, `JAVA_DOUBLE` and `ADDRESS` (a pointer).

Access can be:

* by **byte offset**: `get(layout, offset)`, `set(layout, offset, value)`;
* by **element index**: `getAtIndex(layout, index)` (offset = index × size).

```java
try (Arena arena = Arena.ofConfined()) {
    MemorySegment buffer = arena.allocate(16);

    buffer.set(ValueLayout.JAVA_INT, 0, 0xCAFEBABE);
    buffer.set(ValueLayout.JAVA_SHORT, 4, (short) 7);
    buffer.set(ValueLayout.JAVA_DOUBLE, 8, Math.PI);

    System.out.printf("%X%n", buffer.get(ValueLayout.JAVA_INT, 0));    // CAFEBABE
    System.out.println(buffer.get(ValueLayout.JAVA_BYTE, 0));           // -66 = 0xBE (little-endian on x86)

    buffer.set(ValueLayout.JAVA_INT, 1, 42);   // IllegalArgumentException: offset 1 is not aligned to 4
    buffer.set(ValueLayout.JAVA_INT_UNALIGNED, 1, 42);                  // this is allowed
}
```

> [!NOTE]
> The `JAVA_*` layouts use the platform's **native** byte order (little-endian on x86 and ARM), unlike `ByteBuffer`, which is big-endian by default. A different order is set with `JAVA_INT.withOrder(ByteOrder.BIG_ENDIAN)`.

### "Pointer Arithmetic"

Java has no pointers, but their role is played by **offsets** and **slices**. `asSlice(offset, size)` returns a segment pointing inside another one, without copying, like `ptr + offset` in C, but with its own bounds:

```java
static void memCopy(MemorySegment src, MemorySegment dst, long bytes) {
    MemorySegment.copy(src, 0, dst, 0, bytes);                            // the counterpart of memcpy with bounds checks
}

MemorySegment second = segment.asSlice(4 * Integer.BYTES, 10 * Integer.BYTES);  // elements 4..13
second.fill((byte) 0);                                                   // the counterpart of memset, only for the slice
```

Converting a segment into a Java array and back:

```java
MemorySegment nativeInts = arena.allocateFrom(ValueLayout.JAVA_INT, 5, 3, 8, 1);  // allocate and fill
int[] copy = nativeInts.toArray(ValueLayout.JAVA_INT);                             // [5, 3, 8, 1]
```

## Structs

The field layout of a C struct is described by a **struct layout** (`StructLayout`). The size and the offsets of the fields, taking alignment into account, are computed automatically. This is the counterpart of the `sizeof` and `offsetof` operators in C:

```c
struct Vector3 {
    float x;
    float y;
    float z;
};
```

```java
static final StructLayout VECTOR3 = MemoryLayout.structLayout(
        ValueLayout.JAVA_FLOAT.withName("x"),
        ValueLayout.JAVA_FLOAT.withName("y"),
        ValueLayout.JAVA_FLOAT.withName("z"));

static final VarHandle X = VECTOR3.varHandle(MemoryLayout.PathElement.groupElement("x"));
static final VarHandle Y = VECTOR3.varHandle(MemoryLayout.PathElement.groupElement("y"));
static final VarHandle Z = VECTOR3.varHandle(MemoryLayout.PathElement.groupElement("z"));

System.out.println(VECTOR3.byteSize());                                   // 12 = sizeof(Vector3)
System.out.println(VECTOR3.byteOffset(MemoryLayout.PathElement.groupElement("z")));   // 8 = offsetof(z)

try (Arena arena = Arena.ofConfined()) {
    MemorySegment v = arena.allocate(VECTOR3);
    X.set(v, 0L, 1f);                                                     // (segment, base offset, value)
    Y.set(v, 0L, 2f);
    Z.set(v, 0L, 2f);
    float x = (float) X.get(v, 0L), y = (float) Y.get(v, 0L), z = (float) Z.get(v, 0L);
    System.out.println(Math.sqrt(x * x + y * y + z * z));                 // 3.0
}
```

A **`VarHandle`** is a typed "variable handle": it knows the field's offset in the struct and the value type. The JIT compiler turns such accesses into ordinary machine load and store instructions.

Field alignment, as in C, sometimes requires explicit "holes":

```c
struct Packet { char kind; int length; double value; };   // sizeof = 16
```

```java
StructLayout PACKET = MemoryLayout.structLayout(
        ValueLayout.JAVA_BYTE.withName("kind"),
        MemoryLayout.paddingLayout(3),                      // align the int to 4
        ValueLayout.JAVA_INT.withName("length"),
        ValueLayout.JAVA_DOUBLE.withName("value"));         // offset 8; 16 bytes in total
```

Without the `paddingLayout`, creating the layout throws an `IllegalArgumentException`: an `int` at offset 1 is not aligned.

### Unions

A C `union` — several fields at the same offset — is described with `MemoryLayout.unionLayout`:

```c
struct Color {
    union {
        struct { uint8_t r, g, b, a; };
        uint32_t rgba;
    };
};
```

```java
static final GroupLayout COLOR = MemoryLayout.unionLayout(
        MemoryLayout.structLayout(
                ValueLayout.JAVA_BYTE.withName("r"),
                ValueLayout.JAVA_BYTE.withName("g"),
                ValueLayout.JAVA_BYTE.withName("b"),
                ValueLayout.JAVA_BYTE.withName("a")).withName("channels"),
        ValueLayout.JAVA_INT.withName("rgba"));

static final VarHandle R = COLOR.varHandle(
        MemoryLayout.PathElement.groupElement("channels"), MemoryLayout.PathElement.groupElement("r"));
static final VarHandle RGBA = COLOR.varHandle(MemoryLayout.PathElement.groupElement("rgba"));

MemorySegment color = arena.allocate(COLOR);
RGBA.set(color, 0L, 0xFF336699);
System.out.printf("%X%n", (byte) R.get(color, 0L));        // 99 — the low byte on little-endian
```

### Arrays of Structs

`MemoryLayout.sequenceLayout(n, element)` describes an array. The `sequenceElement()` path gives a `VarHandle` with an additional coordinate — the index:

```java
SequenceLayout POINTS = MemoryLayout.sequenceLayout(1000, VECTOR3);
VarHandle POINT_X = POINTS.varHandle(MemoryLayout.PathElement.sequenceElement(),
                                     MemoryLayout.PathElement.groupElement("x"));

MemorySegment points = arena.allocate(POINTS);                   // 12,000 bytes
for (long i = 0; i < 1000; i++) {
    POINT_X.set(points, 0L, i, (float) i);                       // points[i].x = i
}

points.elements(VECTOR3)                                          // Stream<MemorySegment> — one slice per element
      .limit(3)
      .forEach(p -> System.out.println(X.get(p, 0L)));            // 0.0, 1.0, 2.0
```

## Pointers between Structs

A pointer to native memory is the `ADDRESS` layout. A pointer that has been read is returned as a **zero-length** segment (an address with no known bounds). To work with it, the segment is "reinterpreted" to the required size with the `reinterpret` method, or the target layout is given right away with `ADDRESS.withTargetLayout(...)`.

A singly linked list in native memory, the counterpart of `struct Node { Node* next; int value; }`:

```java
static final StructLayout NODE = MemoryLayout.structLayout(
        ValueLayout.ADDRESS.withName("next"),
        ValueLayout.JAVA_INT.withName("value"),
        MemoryLayout.paddingLayout(4));                               // alignment to 16 bytes
static final long NEXT = NODE.byteOffset(MemoryLayout.PathElement.groupElement("next"));
static final long VALUE = NODE.byteOffset(MemoryLayout.PathElement.groupElement("value"));

static MemorySegment push(Arena arena, MemorySegment head, int value) {
    MemorySegment node = arena.allocate(NODE);
    node.set(ValueLayout.ADDRESS, NEXT, head);                        // node->next = head
    node.set(ValueLayout.JAVA_INT, VALUE, value);                     // node->value = value
    return node;
}

static MemorySegment find(MemorySegment head, int value) {
    while (!head.equals(MemorySegment.NULL)) {
        MemorySegment node = head.reinterpret(NODE.byteSize());       // "dereferencing": now the size is known
        if (node.get(ValueLayout.JAVA_INT, VALUE) == value) return node;
        head = node.get(ValueLayout.ADDRESS, NEXT);                   // head = head->next
    }
    return MemorySegment.NULL;
}

try (Arena arena = Arena.ofConfined()) {
    MemorySegment head = MemorySegment.NULL;
    for (int i = 1; i <= 5; i++) head = push(arena, head, i * 10);
    System.out.println(find(head, 30).get(ValueLayout.JAVA_INT, VALUE));   // 30
}
```

> [!WARNING]
> `reinterpret` is a **restricted** method: it allows declaring any address a segment of any size, so a wrong size means reading someone else's memory and a possible JVM crash. That is why the JVM prints a warning when it is called, unless this is explicitly allowed at startup: `java --enable-native-access=ALL-UNNAMED` (or a module name).

## Heap Array Segments

A segment can also wrap an ordinary Java array: `MemorySegment.ofArray(array)`. This way the same methods work with any memory, just as one method accepts both a native and a heap buffer:

```java
static long sum(MemorySegment ints) {
    long sum = 0;
    for (long i = 0; i < ints.byteSize() / Integer.BYTES; i++) {
        sum += ints.getAtIndex(ValueLayout.JAVA_INT, i);
    }
    return sum;
}

int[] array = {1, 2, 3, 4};
System.out.println(sum(MemorySegment.ofArray(array)));                          // 10 — the heap
System.out.println(sum(arena.allocateFrom(ValueLayout.JAVA_INT, 1, 2, 3, 4)));  // 10 — native memory
```

The garbage collector may move heap arrays, so by default an array segment cannot be passed to a native function: the data is copied into native memory. The exception is short calls with the `Linker.Option.critical(true)` option, during which the JVM guarantees that the array does not move (the next page).

An ordinary Java array can also be processed as if it were an "image in memory". An example — converting ARGB pixels to grayscale through access to individual bytes:

```java
static void toGrayscale(int[] argbPixels) {
    MemorySegment bytes = MemorySegment.ofArray(argbPixels);
    for (long offset = 0; offset < bytes.byteSize(); offset += 4) {
        int b = Byte.toUnsignedInt(bytes.get(ValueLayout.JAVA_BYTE, offset));       // little-endian: B, G, R, A
        int g = Byte.toUnsignedInt(bytes.get(ValueLayout.JAVA_BYTE, offset + 1));
        int r = Byte.toUnsignedInt(bytes.get(ValueLayout.JAVA_BYTE, offset + 2));
        byte gray = (byte) (0.299 * r + 0.587 * g + 0.114 * b);
        bytes.set(ValueLayout.JAVA_BYTE, offset, gray);
        bytes.set(ValueLayout.JAVA_BYTE, offset + 1, gray);
        bytes.set(ValueLayout.JAVA_BYTE, offset + 2, gray);
    }
}
```

## Reinterpreting Bits

In C, reading the bits of an `int` as a `float` is done by casting pointers. Java has ready-made methods for this, without any memory:

```java
float f = Float.intBitsToFloat(0x40490FDB);                  // 3.1415927
int bits = Float.floatToRawIntBits(3.1415927f);              // 0x40490FDB
double d = Double.longBitsToDouble(0x400921FB54442D18L);     // 3.141592653589793
```

> [!TIP]
> Native memory is a tool for specific tasks. For ordinary code, Java arrays and collections are simpler, safer and, thanks to the JIT compiler, almost as fast.
