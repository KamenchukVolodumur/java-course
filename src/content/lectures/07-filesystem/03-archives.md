---
title: Архіви
description: ZIP-архіви — запис і читання через ZipOutputStream і ZipInputStream, довільний доступ через ZipFile, ZIP як файлова система, JAR, захист від Zip Slip; GZIP для окремих файлів і TAR через Apache Commons Compress.
---

## Архіви

Архів — це файл-контейнер для інших файлів і каталогів. Стандартна бібліотека Java підтримує формат **ZIP** (пакет `java.util.zip`, а також «файлову систему ZIP» у `java.nio.file`) і стиснення окремих потоків у **GZIP**. Формат **TAR** у стандартній бібліотеці відсутній, для нього використовують бібліотеки, наприклад Apache Commons Compress.

## ZIP-архіви

ZIP, окрім групування файлів, за замовчуванням **стискає** кожен запис алгоритмом Deflate. Кожен запис (**entry**) має ім'я з відносним шляхом усередині архіву (роздільник завжди `/`), розмір до і після стиснення, час модифікації й метод (`DEFLATED` або `STORED` — без стиснення).

### Створення архіву з каталогу

`ZipOutputStream` — декоратор потоку: кожен запис відкривають `putNextEntry`, записують його вміст і закривають `closeEntry`.

```java
static void zipDirectory(Path sourceDir, Path zipPath) throws IOException {
    try (var zip = new ZipOutputStream(new BufferedOutputStream(Files.newOutputStream(zipPath)));
         Stream<Path> files = Files.walk(sourceDir)) {
        for (Path file : (Iterable<Path>) files.filter(Files::isRegularFile)::iterator) {
            String entryName = sourceDir.relativize(file).toString().replace('\\', '/');
            ZipEntry entry = new ZipEntry(entryName);
            entry.setLastModifiedTime(Files.getLastModifiedTime(file));
            zip.putNextEntry(entry);
            Files.copy(file, zip);                       // вміст файлу -> поточний запис
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
> Конструкція `(Iterable<Path>) stream::iterator` дозволяє обійти потік звичайним циклом for-each. Це зручно, коли тіло циклу кидає checked-винятки (`IOException`), які не можна кинути з лямбди.

Рівень стиснення задає `zip.setLevel(Deflater.BEST_COMPRESSION)` (0–9), а запис без стиснення — метод `STORED` (тоді розмір і CRC-32 треба задати заздалегідь).

### Розпакування і захист від Zip Slip

`ZipInputStream` читає записи послідовно: `getNextEntry` переходить до наступного запису, після чого сам потік повертає вміст цього запису.

```java
static void unzip(Path zipPath, Path targetDir) throws IOException {
    Path root = targetDir.toAbsolutePath().normalize();
    try (var zip = new ZipInputStream(new BufferedInputStream(Files.newInputStream(zipPath)))) {
        ZipEntry entry;
        while ((entry = zip.getNextEntry()) != null) {
            Path target = root.resolve(entry.getName()).normalize();
            if (!target.startsWith(root)) {
                throw new IOException("Небезпечний запис в архіві: " + entry.getName());
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
> **Zip Slip:** ім'я запису може містити `../../` або бути абсолютним шляхом. Без перевірки `startsWith(root)` розпакування архіву, отриманого з інтернету, могло б перезаписати будь-який файл, доступний процесу (наприклад, `~/.bashrc`). Варто також обмежувати загальний розмір розпакованих даних: «zip-бомба» розміром кілька кілобайтів розпаковується в терабайти.

### Довільний доступ: ZipFile

`ZipFile` читає **центральний каталог** архіву (він у кінці файлу) і дає доступ до будь-якого запису без послідовного читання всього архіву:

```java
try (ZipFile zip = new ZipFile("archive.zip")) {
    System.out.println("Вміст архіву:");
    zip.stream().forEach(e -> System.out.printf("%-32s %6d -> %6d байтів%n",
            e.getName(), e.getSize(), e.getCompressedSize()));

    ZipEntry entry = zip.getEntry("subfolder/file2.txt");
    try (InputStream in = zip.getInputStream(entry)) {
        System.out.println(new String(in.readAllBytes(), StandardCharsets.UTF_8));   // World
    }
}
```

| Клас або метод | Призначення |
| --- | --- |
| `ZipOutputStream.putNextEntry(entry)` / `closeEntry()` | почати й завершити запис |
| `ZipInputStream.getNextEntry()` | перейти до наступного запису під час послідовного читання |
| `ZipFile.stream()` / `entries()` | усі записи архіву |
| `ZipFile.getEntry(name)` | запис за ім'ям |
| `ZipFile.getInputStream(entry)` | вміст запису |
| `ZipEntry.getSize()` / `getCompressedSize()` / `getLastModifiedTime()` / `isDirectory()` | метадані запису |

### ZIP як файлова система

Найзручніший спосіб **змінювати** архів — відкрити його як окрему файлову систему і працювати з вмістом через `Path` і `Files`, як зі звичайними файлами:

```java
Path zipPath = Path.of("archive.zip");
try (FileSystem zipFs = FileSystems.newFileSystem(zipPath, Map.of("create", "true"))) {   // create: створити, якщо немає
    Path inside = zipFs.getPath("/reports/2025.csv");
    Files.createDirectories(inside.getParent());
    Files.writeString(inside, "month;total\n01;100\n");                 // додати запис
    Files.copy(Path.of("lorem.txt"), zipFs.getPath("/lorem.txt"), StandardCopyOption.REPLACE_EXISTING);
    Files.deleteIfExists(zipFs.getPath("/file1.txt"));                 // видалити запис

    try (Stream<Path> all = Files.walk(zipFs.getPath("/"))) {
        all.forEach(System.out::println);
    }
}   // зміни записуються в архів під час закриття файлової системи
```

### JAR

Файл **JAR** — це ZIP-архів із класами, ресурсами й файлом `META-INF/MANIFEST.MF`. Для нього є класи `JarFile`, `JarInputStream`, `JarOutputStream` і `Manifest`, а також інструмент `jar` з JDK:

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

## GZIP і TAR

**GZIP** стискає **один** потік даних і не має поняття «записів» чи каталогів. Для окремого файлу (наприклад, ротованого журналу) досить декоратора:

```java
try (InputStream in = Files.newInputStream(Path.of("app.log"));
     OutputStream out = new GZIPOutputStream(Files.newOutputStream(Path.of("app.log.gz")))) {
    in.transferTo(out);
}
```

Формат **TAR** («tape archive») лише групує файли в контейнер **без стиснення**, зберігаючи атрибути Unix (права, власника, символьні посилання). На практиці його поєднують зі стисненням: `.tar.gz` (`.tgz`), `.tar.xz`, `.tar.zst`. У стандартній бібліотеці Java підтримки TAR немає, тож використовують **Apache Commons Compress** (`org.apache.commons:commons-compress`):

```java
// створення .tar.gz
try (var out = new TarArchiveOutputStream(
        new GzipCompressorOutputStream(new BufferedOutputStream(Files.newOutputStream(Path.of("logs.tar.gz")))));
     Stream<Path> files = Files.walk(Path.of("logs"))) {
    out.setLongFileMode(TarArchiveOutputStream.LONGFILE_POSIX);        // довгі імена файлів
    for (Path file : (Iterable<Path>) files.filter(Files::isRegularFile)::iterator) {
        TarArchiveEntry entry = new TarArchiveEntry(file, file.toString().replace('\\', '/'));
        out.putArchiveEntry(entry);
        Files.copy(file, out);
        out.closeArchiveEntry();
    }
}

// читання .tar.gz
try (var in = new TarArchiveInputStream(
        new GzipCompressorInputStream(new BufferedInputStream(Files.newInputStream(Path.of("logs.tar.gz")))))) {
    TarArchiveEntry entry;
    while ((entry = in.getNextEntry()) != null) {
        System.out.printf("%-20s %5d байтів, права: %o%n", entry.getName(), entry.getSize(), entry.getMode());
    }
}
```

```text
logs/app.log           9 байтів, права: 100644
logs/info.log         20 байтів, права: 100644
```

Та сама бібліотека підтримує 7z, xz, bzip2, zstd та інші формати. Перевірка на Zip Slip потрібна й під час розпакування TAR.
