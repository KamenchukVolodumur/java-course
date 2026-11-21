---
title: File System
description: The Path interface and working with paths, file operations with Files, attributes and permissions, the old File class, creating and listing directories, recursive traversal and glob search, special directories, disk volumes, file system events with WatchService.
---

## The File System in Java

The **`java.nio.file`** package (NIO.2, Java 7) is intended for working with the file system:

* **`Path`** — a path to a file or directory;
* **`Files`** — static methods for operations on files and directories;
* **`FileSystem`**, **`FileStore`** — file systems and volumes;
* **`WatchService`** — file system events.

The old `java.io.File` class still appears in code and APIs, but new code uses `Path` and `Files`: they throw informative exceptions (instead of returning `false`) and support symbolic links, attributes and different file systems (e.g. the contents of a ZIP archive).

## Paths: Path

A `Path` is an **immutable** object representing a path. Creating a `Path` does not touch the disk: the file may not exist at all. Paths are built using the separator of the current OS (`/` or `\`).

```java
Path path = Path.of("Workspace", "java-course", "pom.xml");

System.out.println(path);                          // Workspace/java-course/pom.xml (on Windows: Workspace\java-course\pom.xml)
System.out.println(path.getFileName());            // pom.xml
System.out.println(path.getParent());              // Workspace/java-course
System.out.println(path.getRoot());                // null: the path is relative
System.out.println(path.getNameCount());           // 3
System.out.println(path.getName(1));               // java-course
System.out.println(path.toAbsolutePath());         // /home/anna/Workspace/java-course/pom.xml (relative to the current directory)
System.out.println(path.isAbsolute());             // false
```

There is no separate method for the file extension, so the name is handled as a string:

```java
String name = path.getFileName().toString();                  // "pom.xml"
int dot = name.lastIndexOf('.');
String extension = dot > 0 ? name.substring(dot) : "";        // ".xml"
String baseName = dot > 0 ? name.substring(0, dot) : name;    // "pom"
Path changed = path.resolveSibling(baseName + ".bak");        // Workspace/java-course/pom.bak
boolean isXml = name.endsWith(".xml");
```

### Combining Paths

```java
Path base = Path.of("/home/anna/project");
base.resolve("src/Main.java");             // /home/anna/project/src/Main.java
base.resolveSibling("other");              // /home/anna/other
base.relativize(Path.of("/home/anna/docs/a.txt"));   // ../docs/a.txt
Path.of("a/./b/../c").normalize();         // a/c
Path.of("lorem.txt").toRealPath();         // an absolute path with symbolic links resolved; throws if the file does not exist
```

> [!WARNING]
> If the argument of `resolve` is an **absolute** path, the base path is discarded: `Path.of("data").resolve("/etc/passwd")` gives `/etc/passwd`. And a relative path with `..` can escape the directory: `Path.of("uploads").resolve("../../etc/passwd")`. When a path is built from user data, normalize the result and check that it stays inside the allowed directory:

```java
Path root = Path.of("uploads").toAbsolutePath().normalize();
Path target = root.resolve(userFileName).normalize();
if (!target.startsWith(root)) throw new SecurityException("Forbidden path: " + userFileName);
```

System separators: `File.separator` (`/` or `\` between the parts of a path), `File.pathSeparator` (`:` or `;` between paths in `PATH`/the classpath), `FileSystems.getDefault().getSeparator()`.

## File Operations: Files

The `Files` class provides high-level methods: check existence, copy, move, delete.

```java
Path path = Path.of("lorem.txt");
Files.writeString(path, "Lorem ipsum");

Files.copy(path, Path.of("copy.txt"), StandardCopyOption.REPLACE_EXISTING);
Files.move(Path.of("copy.txt"), Path.of("moved.txt"),
           StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);

if (Files.exists(Path.of("moved.txt"))) {
    Files.delete(Path.of("moved.txt"));            // NoSuchFileException if the file does not exist
}
Files.deleteIfExists(Path.of("moved.txt"));        // no exception

Files.createFile(Path.of("new.txt"));              // FileAlreadyExistsException if it exists
Files.createSymbolicLink(Path.of("link.txt"), path);
```

> [!NOTE]
> Checks like `if (Files.exists(p)) Files.delete(p);` contain a race: between the check and the action the file may disappear or appear (another process). It is more reliable to perform the action right away and handle the exception, or to use the atomic variants (`deleteIfExists`, `createFile`, `ATOMIC_MOVE`).

### File Information and Attributes

```java
Path path = Path.of("lorem.txt");

Files.isRegularFile(path);  Files.isDirectory(path);  Files.isSymbolicLink(path);
Files.isReadable(path);  Files.isWritable(path);  Files.isExecutable(path);  Files.isHidden(path);
long size = Files.size(path);
FileTime modified = Files.getLastModifiedTime(path);
Files.setLastModifiedTime(path, FileTime.from(Instant.now()));
String type = Files.probeContentType(path);        // "text/plain" (when possible)

BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
System.out.println(attrs.creationTime() + " " + attrs.lastAccessTime() + " " + attrs.size());

// Unix permissions (on POSIX systems)
Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rw-r-----");
Files.setPosixFilePermissions(path, perms);
System.out.println(PosixFilePermissions.toString(Files.getPosixFilePermissions(path)));   // rw-r-----
```

`readAttributes` reads all attributes in one system call, so it is faster than several separate calls when many attributes are needed.

### The File Class

The old `java.io.File` describes a path and provides the `exists()`, `length()`, `isDirectory()`, `listFiles()`, `delete()`, `mkdirs()`, `getName()` methods. Most of its methods report an error by returning `false` without explaining the reason. It is easy to switch between the old and new APIs:

```java
File legacy = new File("lorem.txt");
Path modern = legacy.toPath();
File back = modern.toFile();
```

## Directories

```java
Path newDir = Path.of("NewDirectory", "sub");

Files.createDirectories(newDir);                   // with all parents, no error if it already exists
Files.createDirectory(Path.of("Single"));          // only one level; an error if it exists

if (Files.isDirectory(newDir)) {
    System.out.println("The directory exists");
}

Path tmpDir = Files.createTempDirectory("lab-");   // a unique directory in the temp folder
Path tmpFile = Files.createTempFile("report-", ".csv");
```

### Listing Contents

Directory contents are read **lazily**: the entries arrive during traversal, so even a directory with thousands of files does not require loading the whole listing into memory. The resulting streams hold an open directory handle, so they must be closed.

```java
try (Stream<Path> entries = Files.list(Path.of("."))) {          // only the immediate contents
    entries.filter(Files::isRegularFile).forEach(System.out::println);
}

try (DirectoryStream<Path> ds = Files.newDirectoryStream(Path.of("."), "*.{java,md}")) {   // a glob filter
    for (Path p : ds) System.out.println(p.getFileName());
}
```

### Recursive Traversal and Search

`Files.walk` traverses the directory tree depth-first (with a depth limit if needed), `Files.find` additionally filters by path and attributes:

```java
try (Stream<Path> all = Files.walk(Path.of("."))) {
    long totalSize = all.filter(Files::isRegularFile)
                        .mapToLong(p -> p.toFile().length())
                        .sum();
}

PathMatcher pdf = FileSystems.getDefault().getPathMatcher("glob:**/*.pdf");
try (Stream<Path> pdfs = Files.find(Path.of("."), Integer.MAX_VALUE,
        (p, attrs) -> attrs.isRegularFile() && pdf.matches(p))) {
    pdfs.forEach(System.out::println);
}
```

Glob syntax: `*` — any characters within one level, `**` — across several levels, `?` — a single character, `{a,b}` — alternatives, `[0-9]` — a character set. You can also use `"regex:.*\\.pdf"`.

A directory with contents can be deleted only after deleting the nested entries first, i.e. by traversing the tree in reverse order:

```java
try (Stream<Path> tree = Files.walk(Path.of("NewDirectory"))) {
    tree.sorted(Comparator.reverseOrder())
        .forEach(p -> {
            try { Files.delete(p); }
            catch (IOException e) { throw new UncheckedIOException(e); }
        });
}
```

For full control over the traversal (skipping branches, handling access errors, actions before and after a directory), implement a `FileVisitor`:

```java
Files.walkFileTree(Path.of("."), new SimpleFileVisitor<>() {
    @Override
    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
        return dir.getFileName() != null && dir.getFileName().toString().equals(".git")
                ? FileVisitResult.SKIP_SUBTREE : FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
        System.out.println(file + " " + attrs.size());
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFileFailed(Path file, IOException exc) {
        System.err.println("No access: " + file);
        return FileVisitResult.CONTINUE;                      // do not stop the traversal because of one file
    }
});
```

### The Current and Special Directories

The paths to standard directories are given by JVM **system properties**:

```java
Path current = Path.of(System.getProperty("user.dir"));    // the current working directory
Path home = Path.of(System.getProperty("user.home"));      // the user's home directory
Path tmp = Path.of(System.getProperty("java.io.tmpdir"));  // the temporary directory
Path documents = home.resolve("Documents");                // folder names depend on the OS and language
```

The process's current directory cannot be changed from Java: relative paths are always resolved against the directory from which the JVM was started.

## Disk Volumes

Information about volumes (partitions) is provided by the `FileStore` class:

```java
final long GB = 1024L * 1024 * 1024;
FileStore store = Files.getFileStore(Path.of("/"));        // on Windows, e.g. Path.of("C:\\")

System.out.println("Size: " + store.getTotalSpace() / GB + " GB");
System.out.println("Free: " + store.getUnallocatedSpace() / GB + " GB");
System.out.println("Usable: " + store.getUsableSpace() / GB + " GB");   // taking quotas and permissions into account
System.out.println("Type: " + store.type());

for (FileStore fs : FileSystems.getDefault().getFileStores()) {
    System.out.println(fs.name() + " (" + fs.type() + ")");
}
for (Path root : FileSystems.getDefault().getRootDirectories()) {
    System.out.println(root);                              // "/" or "C:\", "D:\"
}
```

## File System Events

`WatchService` lets you receive notifications about files being created, modified and deleted in a directory. Under the hood it uses OS mechanisms (`inotify` on Linux, `ReadDirectoryChangesW` on Windows); on systems without them — periodic polling.

```java
public static void watch(Path dir) throws IOException, InterruptedException {
    try (WatchService watcher = FileSystems.getDefault().newWatchService()) {
        dir.register(watcher,
                StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_MODIFY,
                StandardWatchEventKinds.ENTRY_DELETE);
        System.out.println("Listening for events in " + dir.toAbsolutePath() + " (Ctrl+C to exit)");

        while (true) {
            WatchKey key = watcher.take();                      // blocks until events arrive
            for (WatchEvent<?> event : key.pollEvents()) {
                WatchEvent.Kind<?> kind = event.kind();
                if (kind == StandardWatchEventKinds.OVERFLOW) {
                    System.out.println("Some events were lost (buffer overflow)");
                    continue;
                }
                Path name = (Path) event.context();             // a path RELATIVE to dir
                Path full = dir.resolve(name);
                if (kind == StandardWatchEventKinds.ENTRY_CREATE) System.out.println("Created: " + full);
                else if (kind == StandardWatchEventKinds.ENTRY_MODIFY) System.out.println("Modified: " + full);
                else if (kind == StandardWatchEventKinds.ENTRY_DELETE) System.out.println("Deleted: " + full);
            }
            if (!key.reset()) break;                            // the directory was deleted or became inaccessible
        }
    }
}
```

Peculiarities:

* `WatchService` is **not recursive**: each subdirectory must be registered separately (usually during `Files.walk` and when new directories appear).
* There is no separate "rename" event: it arrives as `ENTRY_DELETE` + `ENTRY_CREATE`.
* A single file change may produce several `ENTRY_MODIFY` events (a content change, then a modification time change).
* The `OVERFLOW` event means the OS could not deliver all events and some were lost. Then the directory state should be re-examined.
* `take()` blocks the thread, so watching is usually run in a separate thread, and the events are passed to the rest of the program via listeners (the "Events" page) or a queue.
