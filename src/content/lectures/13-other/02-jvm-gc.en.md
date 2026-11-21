---
title: JVM and Garbage Collection
description: JVM memory areas, the class lifecycle, how garbage collectors work (generations, G1, ZGC, Parallel, Serial), weak references, startup options and diagnostics (jcmd, JFR, heap dumps), as well as AOT compilation with GraalVM Native Image.
---

## JVM Memory Areas

```text
┌──────────────────────── JVM process ───────────────────────┐
│ Heap (shared, managed by the GC)  Metaspace (native)        │
│  ├─ Young: Eden + Survivor S0/S1   class and method metadata │
│  └─ Old (Tenured)                  Code Cache (JIT code)     │
│                                                             │
│ Per thread: Java Stack (frames), PC register,               │
│             Native Method Stack                             │
│ Direct memory (ByteBuffer.allocateDirect, FFM)              │
└─────────────────────────────────────────────────────────────┘
```

| Area | What it stores | Error when exhausted |
| --- | --- | --- |
| Heap | objects and arrays | `OutOfMemoryError: Java heap space` |
| Stack | call frames, local variables | `StackOverflowError` (deep recursion) |
| Metaspace | classes (since Java 8, instead of PermGen) | `OutOfMemoryError: Metaspace` |
| Code Cache | JIT-compiled code | the JIT is turned off, the program slows down |
| Direct | off-heap buffers | `OutOfMemoryError: Direct buffer memory` |

### What an Object Looks Like in Memory

Every object has a **header** (the mark word: the hash, the lock state, the GC age; plus a pointer to the class) — 12–16 bytes on a 64-bit JVM, with alignment to 8 bytes. That is why an `Integer` takes ~16 bytes versus 4 for an `int`, and a `List<Integer>` of a million elements ~20 MB versus 4 MB for an `int[]`. (Java 25 reduces the header to 8 bytes: Compact Object Headers.)

### The Class Lifecycle

1. **Loading** — a ClassLoader reads the bytecode.
2. **Linking**: *verification* (checking the bytecode), *preparation* (static fields receive default values), *resolution* (symbolic references are replaced with direct ones).
3. **Initialization** — `static` blocks and initializers run. It happens on the first active use of the class.

## How the GC Finds Garbage

The GC does not count references (as Python or COM do). It looks for **reachable** objects, starting from the **roots** (GC roots):

* local variables and parameters on the stacks of all threads;
* static fields of loaded classes;
* references from JNI and monitors in use.

Everything that cannot be reached from the roots is garbage, even if the objects refer to each other (cycles are not a problem).

### The Generational Hypothesis

**Most objects die young**: temporary strings, iterators, request DTOs. That is why the heap is divided into generations:

1. New objects are created in **Eden** (very fast: just a pointer bump, TLAB).
2. When Eden fills up, a **Minor GC** happens: live objects are copied to a Survivor space, and the rest of Eden is cleared entirely. The cost is proportional to the number of **live** objects, not dead ones.
3. An object that has survived several collections (age ~15) moves to **Old**.
4. A **Major/Full GC** cleans Old. This is more expensive.

### Stop-the-World

Some phases require stopping all program threads (a *safepoint*). Modern collectors do most of the work **concurrently** with the program, and reduce pauses to milliseconds.

## HotSpot Garbage Collectors

| Collector | Flag | Idea | When |
| --- | --- | --- | --- |
| **Serial** | `-XX:+UseSerialGC` | one thread, a full stop | small heaps, containers with 1 CPU |
| **Parallel** | `-XX:+UseParallelGC` | several threads, a full stop, maximum throughput | batch processing where pauses do not matter |
| **G1** (default) | `-XX:+UseG1GC` | the heap is split into regions of 1–32 MB; the "most garbage-filled" ones are cleaned first; a pause goal `-XX:MaxGCPauseMillis=200` | most server applications |
| **ZGC** | `-XX:+UseZGC` | almost everything concurrently with the program; pauses < 1 ms regardless of heap size; generational since Java 21 | large heaps, low latency |
| **Shenandoah** | `-XX:+UseShenandoahGC` | concurrent compaction | low latency (OpenJDK) |
| **Epsilon** | `-XX:+UseEpsilonGC` | collects nothing | performance tests, short-lived tasks |

### Throughput vs Latency vs Memory

It is impossible to optimize everything at once. Parallel gives the maximum throughput, ZGC the minimum pauses (at the cost of CPU and memory), and Serial the minimum overhead.

### The Main Options

```bash
java -Xms512m -Xmx2g \                 # the initial and maximum heap size
     -XX:+UseZGC \
     -XX:MaxRAMPercentage=75 \          # in containers: a share of the memory limit
     -Xss512k \                         # the thread stack size
     -Xlog:gc*:file=gc.log \            # the GC log
     -XX:+HeapDumpOnOutOfMemoryError \
     -jar app.jar
```

> [!TIP]
> Set `-Xms` equal to `-Xmx` for server applications: the heap will not resize at run time. And **do not call `System.gc()`**: it is only a hint that usually makes performance worse.

## Reference Types and Memory Leaks

| Reference | When the GC may collect the object | Use |
| --- | --- | --- |
| Strong (ordinary) | never, as long as the reference exists | everything |
| `SoftReference` | when memory runs short | memory-sensitive caches |
| `WeakReference` | at the next collection, if there are no strong references | canonicalization, metadata |
| `PhantomReference` | after finalization; `get()` is always null | resource cleanup (`Cleaner`) |

```java
WeakHashMap<Widget, Metadata> meta = new WeakHashMap<>();   // the key is a weak reference
meta.put(widget, new Metadata());
widget = null;          // after a GC the entry disappears from the map by itself
```

### Typical Memory Leaks in Java

1. Static collections that only grow (`static Map cache`).
2. Event listeners that were never unsubscribed (the "Events" page).
3. `ThreadLocal` without `remove()` in a thread pool.
4. Inner (non-static) classes and lambdas that hold the outer object.
5. Unclosed resources: streams, connections, `Files.lines`.
6. `HashMap` keys with a changed `hashCode`: the object is "lost" but reachable.

## Diagnostics

| Tool | What for |
| --- | --- |
| `jps` | a list of Java processes |
| `jcmd <pid> help` | the universal command |
| `jcmd <pid> GC.heap_info` | the heap state |
| `jcmd <pid> Thread.print` | a thread dump (deadlocks!) |
| `jcmd <pid> GC.heap_dump heap.hprof` | a heap snapshot → analysis in Eclipse MAT / VisualVM |
| `jstat -gcutil <pid> 1000` | generation occupancy every second |
| **JFR** (Java Flight Recorder) | profiling in production with < 2% overhead |
| JDK Mission Control | viewing JFR recordings |
| VisualVM, async-profiler | CPU and allocation profiling |

```bash
java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar
jcmd <pid> JFR.start duration=30s filename=now.jfr
jfr print --events jdk.GarbageCollection rec.jfr
```

### How to Look for a Leak

1. Look at the graph of used memory **after** a Full GC. If it keeps growing, it is a leak.
2. Take two heap dumps some time apart.
3. In MAT: the *Dominator Tree* and *Path to GC Roots* show **who holds** the objects.

## GraalVM and Native Image (AOT)

**GraalVM** is a JDK with an alternative JIT compiler (Graal, written in Java) and the ability to compile **ahead of time** into a native executable.

```bash
native-image -jar app.jar app        # the result: ./app without a JVM
./app                                # starts in ~10–50 ms instead of ~0.5–2 s
```

### How It Works

During the build a **reachability analysis** is performed (the closed-world assumption): everything that may be called is compiled into machine code, the rest is thrown away. Static initializers can be run already at build time.

| | JVM (JIT) | Native Image (AOT) |
| --- | --- | --- |
| Startup | slow (class loading, warm-up) | instant |
| Memory | more | much less |
| Peak performance | higher (the JIT optimizes based on the profile) | slightly lower |
| Reflection, proxies, dynamic class loading | fully | only with configuration |
| Build time | seconds | minutes |

> [!WARNING]
> Reflection, resources and dynamic proxies must be **described** in `reflect-config.json` and similar files (the `-agentlib:native-image-agent` agent helps). The Quarkus, Micronaut and Spring Boot 3 frameworks do this automatically.

Where it is useful: CLI utilities, serverless (AWS Lambda), microservices that scale often. Alternatives that do not change the programming model are **CDS/AppCDS** (a class cache) and **Project Leyden** (an AOT cache in Java 24+), which speed up the startup of an ordinary JVM.
