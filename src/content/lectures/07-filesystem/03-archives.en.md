---
title: Archives
description: ZIP archives — writing and reading with ZipOutputStream and ZipInputStream, random access with ZipFile, ZIP as a file system, JAR, protection against Zip Slip; GZIP for single files and TAR via Apache Commons Compress.
---

## Archives

An archive is a container file for other files and directories. The Java standard library supports the **ZIP** format (the `java.util.zip` package, and also the "ZIP file system" in `java.nio.file`) and compression of single streams with **GZIP**. The **TAR** format is missing from the standard library; libraries such as Apache Commons Compress are used for it.

## ZIP Archives

Besides grouping files, ZIP **compresses** each entry with the Deflate algorithm by default. Each **entry** has a name with a relative path inside the archive (the separator is always `/`), the sizes before and after compression, a modification time and a method (`DEFLATED` or `STORED` — without compression).

### Creating an Archive from a Directory

`ZipOutputStream` is a stream decorator: each entry is opened with `putNextEntry`, its contents are written, and it is closed with `closeEntry`.

```java
static void zipDirectory(Path sourceDir, Path zipPath) throws IOException {
    try (var zip = new ZipOutputStream(new BufferedOutputStream(Files.newOutputStream(zipPath)));
         Stream<Path> files = Files.walk(sourceDir)) {
        for (Path file : (Iterable<Path>) files.filter(Files::isRegularFile)::iterator) {
            String entryName = sourceDir.relativize(file).toString().replace('\\', '/');
            ZipEntry entry = new ZipEntry(entryName);
            entry.setLastModifiedTime(Files.getLastModifiedTime(file));
            zip.putNextEntry(entry);
            Files.copy(file, zip);                       // file contents -> the current entry
            zip.closeEntry();
        }
    }
}

Path source = Path.of("my_files_to_zip");
Files.createDirectories(source.resolve("subfolder"));
Files.writeString(source.resolve("file1.txt"), "Hello");
Files.writeString(source.resolve("subfolder/file2.txt"), "World");
zipDirectory(source, Path.of("archive.zip"));
```

> [!NOTE]
> The `(Iterable<Path>) stream::iterator` construct lets you traverse a stream with an ordinary for-each loop. This is convenient when the loop body throws checked exceptions (`IOException`), which cannot be thrown from a lambda.

The compression level is set with `zip.setLevel(Deflater.BEST_COMPRESSION)` (0–9), and an uncompressed entry with the `STORED` method (then the size and CRC-32 must be set in advance).

### Extracting and Protecting against Zip Slip

`ZipInputStream` reads the entries sequentially: `getNextEntry` moves to the next entry, after which the stream itself returns that entry's contents.

```java
static void unzip(Path zipPath, Path targetDir) throws IOException {
    Path root = targetDir.toAbsolutePath().normalize();
    try (var zip = new ZipInputStream(new BufferedInputStream(Files.newInputStream(zipPath)))) {
        ZipEntry entry;
        while ((entry = zip.getNextEntry()) != null) {
            Path target = root.resolve(entry.getName()).normalize();
            if (!target.startsWith(root)) {
                throw new IOException("Unsafe entry in the archive: " + entry.getName());
            }
            if (entry.isDirectory()) {
                Files.createDirectories(target);
            } else {
                Files.createDirectories(target.getParent());
                Files.copy(zip, target, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }
}
```

> [!CAUTION]
> **Zip Slip:** an entry name may contain `../../` or be an absolute path. Without the `startsWith(root)` check, extracting an archive downloaded from the internet could overwrite any file accessible to the process (e.g. `~/.bashrc`). It is also worth limiting the total size of the extracted data: a "zip bomb" of a few kilobytes expands into terabytes.

### Random Access: ZipFile

`ZipFile` reads the archive's **central directory** (located at the end of the file) and gives access to any entry without reading the whole archive sequentially:

```java
try (ZipFile zip = new ZipFile("archive.zip")) {
    System.out.println("Archive contents:");
    zip.stream().forEach(e -> System.out.printf("%-32s %6d -> %6d bytes%n",
            e.getName(), e.getSize(), e.getCompressedSize()));

    ZipEntry entry = zip.getEntry("subfolder/file2.txt");
    try (InputStream in = zip.getInputStream(entry)) {
        System.out.println(new String(in.readAllBytes(), StandardCharsets.UTF_8));   // World
    }
}
```

| Class or method | Purpose |
| --- | --- |
| `ZipOutputStream.putNextEntry(entry)` / `closeEntry()` | start and finish an entry |
| `ZipInputStream.getNextEntry()` | move to the next entry during sequential reading |
| `ZipFile.stream()` / `entries()` | all entries of the archive |
| `ZipFile.getEntry(name)` | an entry by name |
| `ZipFile.getInputStream(entry)` | the contents of an entry |
| `ZipEntry.getSize()` / `getCompressedSize()` / `getLastModifiedTime()` / `isDirectory()` | entry metadata |

### ZIP as a File System

The most convenient way to **modify** an archive is to open it as a separate file system and work with its contents through `Path` and `Files`, as with ordinary files:

```java
Path zipPath = Path.of("archive.zip");
try (FileSystem zipFs = FileSystems.newFileSystem(zipPath, Map.of("create", "true"))) {   // create: create it if absent
    Path inside = zipFs.getPath("/reports/2025.csv");
    Files.createDirectories(inside.getParent());
    Files.writeString(inside, "month;total\n01;100\n");                 // add an entry
    Files.copy(Path.of("lorem.txt"), zipFs.getPath("/lorem.txt"), StandardCopyOption.REPLACE_EXISTING);
    Files.deleteIfExists(zipFs.getPath("/file1.txt"));                 // remove an entry

    try (Stream<Path> all = Files.walk(zipFs.getPath("/"))) {
        all.forEach(System.out::println);
    }
}   // the changes are written into the archive when the file system is closed
```

### JAR

A **JAR** file is a ZIP archive with classes, resources and a `META-INF/MANIFEST.MF` file. There are the `JarFile`, `JarInputStream`, `JarOutputStream` and `Manifest` classes for it, as well as the `jar` tool from the JDK:

```java
try (JarFile jar = new JarFile("app.jar")) {
    Manifest mf = jar.getManifest();
    System.out.println(mf.getMainAttributes().getValue("Main-Class"));
}
```

```bash
jar --list --file app.jar
jar --extract --file app.jar META-INF/MANIFEST.MF
```

## GZIP and TAR

**GZIP** compresses **a single** data stream and has no notion of "entries" or directories. For a single file (e.g. a rotated log) a decorator is enough:

```java
try (InputStream in = Files.newInputStream(Path.of("app.log"));
     OutputStream out = new GZIPOutputStream(Files.newOutputStream(Path.of("app.log.gz")))) {
    in.transferTo(out);
}
```

The **TAR** ("tape archive") format only groups files into a container **without compression**, preserving Unix attributes (permissions, owner, symbolic links). In practice it is combined with compression: `.tar.gz` (`.tgz`), `.tar.xz`, `.tar.zst`. The Java standard library has no TAR support, so **Apache Commons Compress** (`org.apache.commons:commons-compress`) is used:

```java
// creating a .tar.gz
try (var out = new TarArchiveOutputStream(
        new GzipCompressorOutputStream(new BufferedOutputStream(Files.newOutputStream(Path.of("logs.tar.gz")))));
     Stream<Path> files = Files.walk(Path.of("logs"))) {
    out.setLongFileMode(TarArchiveOutputStream.LONGFILE_POSIX);        // long file names
    for (Path file : (Iterable<Path>) files.filter(Files::isRegularFile)::iterator) {
        TarArchiveEntry entry = new TarArchiveEntry(file, file.toString().replace('\\', '/'));
        out.putArchiveEntry(entry);
        Files.copy(file, out);
        out.closeArchiveEntry();
    }
}

// reading a .tar.gz
try (var in = new TarArchiveInputStream(
        new GzipCompressorInputStream(new BufferedInputStream(Files.newInputStream(Path.of("logs.tar.gz")))))) {
    TarArchiveEntry entry;
    while ((entry = in.getNextEntry()) != null) {
        System.out.printf("%-20s %5d bytes, permissions: %o%n", entry.getName(), entry.getSize(), entry.getMode());
    }
}
```

```text
logs/app.log           9 bytes, permissions: 100644
logs/info.log         20 bytes, permissions: 100644
```

The same library supports 7z, xz, bzip2, zstd and other formats. The Zip Slip check is also needed when extracting TAR archives.
