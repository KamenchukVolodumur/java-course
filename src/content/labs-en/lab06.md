---
title: Lab 06: Files, I/O Streams and Events — a Log Analyzer
description: Parsing log lines with regular expressions, streaming processing of large files without loading them into memory, recursive traversal of directories with compressed .gz files, a CSV report and a ZIP archive with protection against Zip Slip, and a file watcher with events through listeners.
---

## Before You Start

> [!NOTE]
> **Lectures:** 05.2 "Events", 05.3 "Resource Management", 05.8 "Exceptions", 07.1 "I/O Streams", 07.2 "File System", 07.3 "Archives" · **Time:** 3 h · **Points:** 10

You are writing a tool for an administrator: it analyzes an application's logs, archives them and watches for new entries in real time.

```text
src/main/java/pl/mini/logs/
├── Level.java  LogEntry.java  LogParser.java
├── LogStats.java  LogAnalyzer.java  DirectoryAnalyzer.java
├── ReportWriter.java
├── LogListener.java  LogWatcher.java
└── Main.java   (given)
```

The format of a log line:

```text
2025-03-14T10:00:05 WARN [db] slow query 1200ms
└───── time ──────┘ └level┘ └component┘ └message┘
```

### Rules

* All resources (streams, readers, a `Stream` from `Files.lines/walk`) — **only** in try-with-resources.
* The encoding is always explicitly UTF-8.
* `LogAnalyzer` must work with files **larger than the available memory**: `Files.readAllLines` and `Files.readString` are forbidden in it.

> [!CAUTION]
> Swallowing exceptions (`catch (IOException e) {}`) is forbidden. Either propagate the `IOException`, or wrap it in an `UncheckedIOException`, or (only in `DirectoryAnalyzer`) print a warning to `System.err` and continue.

## A Quick Theory Recap

### Regular Expressions with Named Groups

```java
private static final Pattern LINE = Pattern.compile(
        "^(?<time>\\S+) (?<level>[A-Z]+) \\[(?<comp>[^\\]]+)] (?<msg>.*)$");

Matcher m = LINE.matcher(line);
if (m.matches()) {
    String level = m.group("level");
}
```

Compile a `Pattern` **once** (static final): compilation is expensive.

### Streaming Reading and Decorators

```java
try (BufferedReader r = new BufferedReader(new InputStreamReader(
        new GZIPInputStream(Files.newInputStream(path)), StandardCharsets.UTF_8))) {
    String line;
    while ((line = r.readLine()) != null) { ... }
}
```

### Directory Traversal

```java
try (Stream<Path> files = Files.walk(dir)) {
    List<Path> logs = files.filter(Files::isRegularFile)
                           .filter(p -> p.getFileName().toString().endsWith(".log"))
                           .sorted()
                           .toList();
}
```

### Reading the "Tail" of a File from a Given Position

```java
try (FileChannel ch = FileChannel.open(path, StandardOpenOption.READ)) {
    ch.position(offset);
    ByteBuffer buf = ByteBuffer.allocate((int) (ch.size() - offset));
    while (buf.hasRemaining() && ch.read(buf) > 0) { }
    String appended = new String(buf.array(), 0, buf.position(), StandardCharsets.UTF_8);
}
```

### Events: the Listener Is a Functional Interface

```java
@FunctionalInterface
public interface LogListener {
    void onEntry(Path file, LogEntry entry);
}
private final List<LogListener> listeners = new CopyOnWriteArrayList<>();
```

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
Optional[LogEntry[time=2025-03-14T10:00, level=INFO, component=auth, message=user anna logged in]]
Optional.empty
Optional.empty
{INFO=1, WARN=1, ERROR=3} malformed=1
2025-03-14T10:00 2025-03-14T10:03 Optional[db]
{INFO=2, WARN=1, ERROR=4} files=2
2025-03-13T23:59 2025-03-14T10:03 {auth=1, cache=1, db=2}
level,count
INFO,2
WARN,1
ERROR,4
app.log
old/app-2025-03-13.log.gz
report.csv
OK: unsafe entry in the archive: ../escaped.txt
[]
ALERT new.log: crash
[app.log:INFO, new.log:ERROR]
ALERT new.log: crash again
2
```

## Stage 1: The Model and the Parser (2 pts)

```java
public enum Level { TRACE, DEBUG, INFO, WARN, ERROR }

public record LogEntry(LocalDateTime time, Level level, String component, String message) { }

public final class LogParser {
    public static Optional<LogEntry> parse(String line);
}
```

* A line that does not match the format, has an unknown level or an invalid date → `Optional.empty()` (and **not** an exception: a broken line in a log is a normal situation).
* Check for an unknown level without a `try/catch` around `Level.valueOf`: build a `static final Map<String, Level>` from `Level.values()`.
* Catch an invalid date (`DateTimeParseException`) and return an empty result.

> [!TIP]
> Why `Optional` and not `null`? The signature immediately tells the caller: "there may be no result". Besides, `parse` is convenient to use in streams: `lines.map(LogParser::parse).flatMap(Optional::stream)`.

## Stage 2: Streaming Analysis of One File (2 pts)

```java
public record LogStats(Map<Level, Long> counts,           // an EnumMap: only the levels that occurred
                       long malformed,
                       LocalDateTime first, LocalDateTime last,   // null if there are no entries
                       Map<String, Long> errorsByComponent,       // a TreeMap
                       int files) {
    public Optional<String> topErrorComponent();   // the most ERRORs; for a tie — the alphabetically smaller one
    public LogStats merge(LogStats other);         // combining statistics (stage 3)
    public static LogStats empty();
}

public final class LogAnalyzer {
    public static LogStats analyze(Path file) throws IOException;   // files = 1
}
```

* Read line by line with a `BufferedReader`. Ignore empty lines (do not count them as malformed).
* Read files named `*.gz` through a `GZIPInputStream`. The choice of decorator goes in one private method `openReader(Path)`.
* `LogStats` is **immutable**: in the compact constructor make defensive copies of the maps (`new EnumMap<>(counts)`, `new TreeMap<>(...)`) and wrap them in `Collections.unmodifiableMap`.

> [!WARNING]
> An `EnumMap` cannot be created from an empty ordinary map with the `new EnumMap<>(map)` constructor: it throws an `IllegalArgumentException`. Use `new EnumMap<>(Level.class)` + `putAll`.

## Stage 3: Analyzing a Directory (2 pts)

```java
public final class DirectoryAnalyzer {
    public static LogStats analyzeAll(Path dir) throws IOException;
}
```

* It recursively finds the `*.log` and `*.log.gz` files (`Files.walk`) and combines their statistics with `LogStats.merge`. Other files are ignored.
* If an individual file could not be read (no permissions, a corrupted gzip), print `WARNING: <path>: <message>` to `System.err` and continue. Such a file is not counted in `files`.
* `merge`: sums of the counters, `min` for `first`, `max` for `last` (taking `null` into account), the sum of `files`.

> [!TIP]
> `merge` for maps — one line per key: `result.merge(level, count, Long::sum)`. Hence `analyzeAll` is simply `reduce(LogStats.empty(), LogStats::merge)` over all the files.

## Stage 4: A CSV Report and a ZIP Archive (2 pts)

```java
public final class ReportWriter {
    public static void writeCsv(LogStats stats, Path out) throws IOException;
    public static void archive(Path dir, Path zipFile) throws IOException;
    public static void unzip(Path zipFile, Path targetDir) throws IOException;
}
```

* `writeCsv`: the header `level,count`, then lines in the declaration order of `Level` (only the levels that occurred), the line separator is `\n` (not the system one).
* `archive`: the archive gets the `*.log`, `*.log.gz` and `report.csv` files from the directory and its subdirectories. The entry names are **relative** to `dir` and always with `/` (even on Windows). The archive itself does not get into itself.
* `unzip`: extracts the archive into `targetDir`. For each entry check:
```java
Path target = targetDir.resolve(entry.getName()).normalize();
if (!target.startsWith(targetDir.normalize()))
    throw new IOException("unsafe entry in the archive: " + entry.getName());
```

> [!CAUTION]
> **Zip Slip** is a real vulnerability that once affected thousands of projects. A `../../.bashrc` entry in an archive downloaded from the internet would overwrite the user's file.

## Stage 5: A Log Watcher with Events (2 pts)

A file watcher implemented with polling: this way its behavior is deterministic and easy to test.

```java
@FunctionalInterface
public interface LogListener {
    void onEntry(Path file, LogEntry entry);
}

public class LogWatcher {
    public LogWatcher(Path dir) throws IOException;
    public void addListener(LogListener l);
    public void removeListener(LogListener l);
    public void poll() throws IOException;
}
```

* We watch only the `*.log` files **directly** in `dir` (no subdirectories and no `.gz`).
* When created, the watcher remembers the current **size** of each file: old entries are not interesting, as in `tail -f`. Files that appear later are read from the beginning.
* `poll()` goes through the files **in alphabetical order**, reads the bytes from the remembered position to the end, parses the **complete** lines (those ending with `\n`) and calls all the listeners for each valid entry. The position moves only by the length of the complete lines: an unfinished line will be read on the next poll.
* Listeners are stored in a `CopyOnWriteArrayList`, so a listener can unsubscribe even while an event is being dispatched.
* An exception in a listener must not stop the dispatch to the other listeners: catch it and print it to `System.err`.

> [!NOTE]
> Count the position in **bytes**, not in characters: Cyrillic in UTF-8 takes 2 bytes per letter, and an emoji 4. That is why use a `FileChannel` or a `RandomAccessFile`, not `BufferedReader.skip`.

### No Points: a Real WatchService

Add a `watchForever()` method that, instead of a loop with `Thread.sleep`, waits for `ENTRY_CREATE`/`ENTRY_MODIFY` events from a `WatchService` and calls `poll()` after each.

Commit, tag it `lab06` and push.
