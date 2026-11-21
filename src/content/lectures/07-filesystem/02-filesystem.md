---
title: Файлова система
description: Інтерфейс Path і робота зі шляхами, операції з файлами через Files, атрибути й права доступу, старий клас File, створення і перегляд каталогів, рекурсивний обхід і пошук за шаблоном, спеціальні каталоги, дискові томи, події файлової системи через WatchService.
---

## Файлова система в Java

Для роботи з файловою системою призначений пакет **`java.nio.file`** (NIO.2, Java 7):

* **`Path`** — шлях до файлу чи каталогу;
* **`Files`** — статичні методи для операцій над файлами й каталогами;
* **`FileSystem`**, **`FileStore`** — файлові системи й томи;
* **`WatchService`** — події файлової системи.

Старий клас `java.io.File` досі трапляється в коді й API, але для нового коду використовують `Path` і `Files`: вони кидають інформативні винятки (а не повертають `false`), підтримують символьні посилання, атрибути й різні файлові системи (наприклад, вміст ZIP-архіву).

## Шляхи: Path

`Path` — **незмінний** об'єкт, що представляє шлях. Створення `Path` не звертається до диска: файлу може й не бути. Шляхи будуються з урахуванням роздільника поточної ОС (`/` чи `\`).

```java
Path path = Path.of("Workspace", "java-course", "pom.xml");

System.out.println(path);                          // Workspace/java-course/pom.xml (на Windows: Workspace\java-course\pom.xml)
System.out.println(path.getFileName());            // pom.xml
System.out.println(path.getParent());              // Workspace/java-course
System.out.println(path.getRoot());                // null: шлях відносний
System.out.println(path.getNameCount());           // 3
System.out.println(path.getName(1));               // java-course
System.out.println(path.toAbsolutePath());         // /home/anna/Workspace/java-course/pom.xml (відносно поточного каталогу)
System.out.println(path.isAbsolute());             // false
```

Розширення файлу окремим методом не отримати, тож працюють з іменем як із рядком:

```java
String name = path.getFileName().toString();                  // "pom.xml"
int dot = name.lastIndexOf('.');
String extension = dot > 0 ? name.substring(dot) : "";        // ".xml"
String baseName = dot > 0 ? name.substring(0, dot) : name;    // "pom"
Path changed = path.resolveSibling(baseName + ".bak");        // Workspace/java-course/pom.bak
boolean isXml = name.endsWith(".xml");
```

### Поєднання шляхів

```java
Path base = Path.of("/home/anna/project");
base.resolve("src/Main.java");             // /home/anna/project/src/Main.java
base.resolveSibling("other");              // /home/anna/other
base.relativize(Path.of("/home/anna/docs/a.txt"));   // ../docs/a.txt
Path.of("a/./b/../c").normalize();         // a/c
Path.of("lorem.txt").toRealPath();         // абсолютний шлях з розкритими символьними посиланнями; кидає виняток, якщо файлу немає
```

> [!WARNING]
> Якщо аргумент `resolve` — **абсолютний** шлях, базовий шлях відкидається: `Path.of("data").resolve("/etc/passwd")` дає `/etc/passwd`. А відносний шлях з `..` може вийти за межі каталогу: `Path.of("uploads").resolve("../../etc/passwd")`. Коли шлях складається з даних користувача, нормалізуйте результат і перевіряйте, що він лишився всередині дозволеного каталогу:

```java
Path root = Path.of("uploads").toAbsolutePath().normalize();
Path target = root.resolve(userFileName).normalize();
if (!target.startsWith(root)) throw new SecurityException("Недозволений шлях: " + userFileName);
```

Роздільники системи: `File.separator` (`/` або `\` між частинами шляху), `File.pathSeparator` (`:` або `;` між шляхами в `PATH`/classpath), `FileSystems.getDefault().getSeparator()`.

## Операції з файлами: Files

Клас `Files` надає високорівневі методи: перевірити наявність, скопіювати, перемістити, видалити.

```java
Path path = Path.of("lorem.txt");
Files.writeString(path, "Lorem ipsum");

Files.copy(path, Path.of("copy.txt"), StandardCopyOption.REPLACE_EXISTING);
Files.move(Path.of("copy.txt"), Path.of("moved.txt"),
           StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);

if (Files.exists(Path.of("moved.txt"))) {
    Files.delete(Path.of("moved.txt"));            // NoSuchFileException, якщо файлу немає
}
Files.deleteIfExists(Path.of("moved.txt"));        // без винятку

Files.createFile(Path.of("new.txt"));              // FileAlreadyExistsException, якщо існує
Files.createSymbolicLink(Path.of("link.txt"), path);
```

> [!NOTE]
> Перевірки на кшталт `if (Files.exists(p)) Files.delete(p);` мають гонку: між перевіркою й дією файл може зникнути чи з'явитися (інший процес). Надійніше одразу виконати дію й обробити виняток, або використовувати атомарні варіанти (`deleteIfExists`, `createFile`, `ATOMIC_MOVE`).

### Інформація про файл і атрибути

```java
Path path = Path.of("lorem.txt");

Files.isRegularFile(path);  Files.isDirectory(path);  Files.isSymbolicLink(path);
Files.isReadable(path);  Files.isWritable(path);  Files.isExecutable(path);  Files.isHidden(path);
long size = Files.size(path);
FileTime modified = Files.getLastModifiedTime(path);
Files.setLastModifiedTime(path, FileTime.from(Instant.now()));
String type = Files.probeContentType(path);        // "text/plain" (за можливості)

BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
System.out.println(attrs.creationTime() + " " + attrs.lastAccessTime() + " " + attrs.size());

// права Unix (на POSIX-системах)
Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rw-r-----");
Files.setPosixFilePermissions(path, perms);
System.out.println(PosixFilePermissions.toString(Files.getPosixFilePermissions(path)));   // rw-r-----
```

`readAttributes` читає всі атрибути одним системним викликом, тож він швидший за кілька окремих викликів, коли атрибутів потрібно багато.

### Клас File

Старий `java.io.File` описує шлях і надає методи `exists()`, `length()`, `isDirectory()`, `listFiles()`, `delete()`, `mkdirs()`, `getName()`. Більшість його методів повідомляють про помилку поверненням `false` без пояснення причини. Між старим і новим API легко переходити:

```java
File legacy = new File("lorem.txt");
Path modern = legacy.toPath();
File back = modern.toFile();
```

## Каталоги

```java
Path newDir = Path.of("NewDirectory", "sub");

Files.createDirectories(newDir);                   // з усіма батьківськими, без помилки, якщо вже існує
Files.createDirectory(Path.of("Single"));          // лише один рівень; помилка, якщо існує

if (Files.isDirectory(newDir)) {
    System.out.println("Каталог існує");
}

Path tmpDir = Files.createTempDirectory("lab-");   // унікальний каталог у тимчасовій теці
Path tmpFile = Files.createTempFile("report-", ".csv");
```

### Перегляд вмісту

Вміст каталогу читають **ліниво**: елементи надходять під час обходу, тож навіть каталог з тисячами файлів не потребує завантаження всього переліку в пам'ять. Отримані потоки тримають відкритий дескриптор каталогу, тож їх обов'язково закривають.

```java
try (Stream<Path> entries = Files.list(Path.of("."))) {          // лише безпосередній вміст
    entries.filter(Files::isRegularFile).forEach(System.out::println);
}

try (DirectoryStream<Path> ds = Files.newDirectoryStream(Path.of("."), "*.{java,md}")) {   // glob-фільтр
    for (Path p : ds) System.out.println(p.getFileName());
}
```

### Рекурсивний обхід і пошук

`Files.walk` обходить дерево каталогів у глибину (з обмеженням глибини за потреби), `Files.find` — додатково фільтрує за шляхом і атрибутами:

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

Синтаксис glob: `*` — будь-які символи в межах одного рівня, `**` — через кілька рівнів, `?` — один символ, `{a,b}` — альтернативи, `[0-9]` — набір символів. Можна також `"regex:.*\\.pdf"`.

Видалити каталог з вмістом можна, лише видаливши спершу вкладені елементи, тобто обходячи дерево у зворотному порядку:

```java
try (Stream<Path> tree = Files.walk(Path.of("NewDirectory"))) {
    tree.sorted(Comparator.reverseOrder())
        .forEach(p -> {
            try { Files.delete(p); }
            catch (IOException e) { throw new UncheckedIOException(e); }
        });
}
```

Для повного контролю над обходом (пропуск гілок, обробка помилок доступу, дії до й після каталогу) реалізують `FileVisitor`:

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
        System.err.println("Немає доступу: " + file);
        return FileVisitResult.CONTINUE;                      // не зупиняти обхід через один файл
    }
});
```

### Поточний і спеціальні каталоги

Шляхи до стандартних каталогів дають **системні властивості** JVM:

```java
Path current = Path.of(System.getProperty("user.dir"));    // поточний робочий каталог
Path home = Path.of(System.getProperty("user.home"));      // домашній каталог користувача
Path tmp = Path.of(System.getProperty("java.io.tmpdir"));  // тимчасовий каталог
Path documents = home.resolve("Documents");                // назви тек залежать від ОС і мови
```

Поточний каталог процесу змінити з Java не можна: відносні шляхи завжди розв'язуються від каталогу, з якого запущено JVM.

## Дискові томи

Інформацію про томи (розділи) дає клас `FileStore`:

```java
final long GB = 1024L * 1024 * 1024;
FileStore store = Files.getFileStore(Path.of("/"));        // на Windows, наприклад, Path.of("C:\\")

System.out.println("Розмір: " + store.getTotalSpace() / GB + " ГБ");
System.out.println("Вільно: " + store.getUnallocatedSpace() / GB + " ГБ");
System.out.println("Доступно: " + store.getUsableSpace() / GB + " ГБ");   // з урахуванням квот і прав
System.out.println("Тип: " + store.type());

for (FileStore fs : FileSystems.getDefault().getFileStores()) {
    System.out.println(fs.name() + " (" + fs.type() + ")");
}
for (Path root : FileSystems.getDefault().getRootDirectories()) {
    System.out.println(root);                              // "/" або "C:\", "D:\"
}
```

## Події файлової системи

`WatchService` дозволяє отримувати повідомлення про створення, зміну й видалення файлів у каталозі. Під капотом використовуються механізми ОС (`inotify` у Linux, `ReadDirectoryChangesW` у Windows); на системах без них — періодичне опитування.

```java
public static void watch(Path dir) throws IOException, InterruptedException {
    try (WatchService watcher = FileSystems.getDefault().newWatchService()) {
        dir.register(watcher,
                StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_MODIFY,
                StandardWatchEventKinds.ENTRY_DELETE);
        System.out.println("Слухаю події в " + dir.toAbsolutePath() + " (Ctrl+C — вихід)");

        while (true) {
            WatchKey key = watcher.take();                      // блокується до появи подій
            for (WatchEvent<?> event : key.pollEvents()) {
                WatchEvent.Kind<?> kind = event.kind();
                if (kind == StandardWatchEventKinds.OVERFLOW) {
                    System.out.println("Частину подій втрачено (переповнення буфера)");
                    continue;
                }
                Path name = (Path) event.context();             // шлях ВІДНОСНО dir
                Path full = dir.resolve(name);
                if (kind == StandardWatchEventKinds.ENTRY_CREATE) System.out.println("Створено: " + full);
                else if (kind == StandardWatchEventKinds.ENTRY_MODIFY) System.out.println("Змінено: " + full);
                else if (kind == StandardWatchEventKinds.ENTRY_DELETE) System.out.println("Видалено: " + full);
            }
            if (!key.reset()) break;                            // каталог видалено або недоступний
        }
    }
}
```

Особливості:

* `WatchService` **не рекурсивний**: кожен підкаталог треба зареєструвати окремо (зазвичай під час `Files.walk` і при появі нових каталогів).
* Окремої події «перейменування» немає: вона надходить як `ENTRY_DELETE` + `ENTRY_CREATE`.
* Одна зміна файлу може породити кілька подій `ENTRY_MODIFY` (зміна вмісту, потім часу модифікації).
* Подія `OVERFLOW` означає, що ОС не встигла передати всі події і частину втрачено. Тоді варто заново переглянути стан каталогу.
* `take()` блокує потік, тому спостереження зазвичай запускають в окремому потоці, а події передають решті програми через слухачів (сторінка «Події») або чергу.
