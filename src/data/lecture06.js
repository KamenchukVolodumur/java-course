export const lecture06 = {
  id: "06",
  title: "Лекція 06: Потоки вводу-виводу, файлова система та архіви",
  description: "Класичний java.io: байтові й символьні потоки, патерн Decorator, буферизація і кодування. Сучасний NIO.2: Path і Files, обхід каталогів, атрибути, WatchService. Бінарні формати, RandomAccessFile і робота з ZIP-архівами.",
  sections: [
    {
      title: "1. Модель потоків java.io",
      content: `
Аналог \`System.IO.Stream\` з C#. У Java чотири базові абстрактні класи:

| | Читання | Запис |
| --- | --- | --- |
| **Байти** (\`byte\`) | \`InputStream\` | \`OutputStream\` |
| **Символи** (\`char\`) | \`Reader\` | \`Writer\` |

Байтові потоки працюють з «сирими» даними (зображення, бінарні файли), символьні — з текстом. Між ними стоять **мости**, яким явно вказують кодування: \`InputStreamReader\` і \`OutputStreamWriter\`.

### Патерн Decorator

Потоки нашаровуються один на одного: кожен шар додає нову можливість.

\`\`\`java
try (var in = new DataInputStream(               // читання int/double/UTF
             new BufferedInputStream(             // буферизація
                 new FileInputStream("data.bin")))) {   // джерело — файл
    int n = in.readInt();
    double x = in.readDouble();
}
\`\`\`

| Клас | Призначення |
| --- | --- |
| \`FileInputStream\` / \`FileOutputStream\` | байти з файлу або у файл |
| \`ByteArrayInputStream\` / \`ByteArrayOutputStream\` | байти в пам'яті |
| \`BufferedInputStream\` / \`BufferedReader\` | буфер (8 КБ за замовчуванням) |
| \`DataInputStream\` / \`DataOutputStream\` | примітиви в бінарному форматі (big-endian) |
| \`InputStreamReader\` / \`OutputStreamWriter\` | байти ↔ символи з кодуванням |
| \`PrintWriter\` / \`PrintStream\` | \`println\`, \`printf\` |
| \`GZIPInputStream\` / \`GZIPOutputStream\` | стиснення на льоту |

> [!IMPORTANT]
> Завжди вказуйте кодування явно: \`StandardCharsets.UTF_8\`. До Java 18 кодування за замовчуванням залежало від ОС (на Windows — cp1252/cp1251), і кирилиця на іншому комп'ютері ламалася.

### Чому буферизація важлива

\`FileInputStream.read()\` без буфера — це **системний виклик на кожен байт**. Читання файлу розміром 10 МБ по байту займає секунди, а з буфером — мілісекунди.

\`\`\`java
try (var in = new BufferedInputStream(new FileInputStream("big.bin"));
     var out = new BufferedOutputStream(new FileOutputStream("copy.bin"))) {
    byte[] buf = new byte[8192];
    int n;
    while ((n = in.read(buf)) != -1) {    // -1 означає кінець потоку
        out.write(buf, 0, n);             // записуємо лише n прочитаних байтів!
    }
}
// або коротше (Java 9+): in.transferTo(out);
\`\`\`
`
    },
    {
      title: "2. Текстові файли",
      content: `
\`\`\`java
Path p = Path.of("notes.txt");

// невеликі файли — одним викликом
String all = Files.readString(p);                         // UTF-8 за замовчуванням
List<String> lines = Files.readAllLines(p);
Files.writeString(p, "привіт\\n");
Files.write(p, List.of("a", "b"), StandardOpenOption.APPEND);

// великі файли — построково, без завантаження в пам'ять
try (BufferedReader r = Files.newBufferedReader(p, StandardCharsets.UTF_8)) {
    String line;
    while ((line = r.readLine()) != null) {
        process(line);
    }
}

// як потік рядків — обов'язково в try-with-resources (тримає файл відкритим)
try (Stream<String> s = Files.lines(p)) {
    long errors = s.filter(l -> l.contains("ERROR")).count();
}

try (PrintWriter w = new PrintWriter(Files.newBufferedWriter(p))) {
    w.printf("%-10s %5d%n", "total", 42);
}
\`\`\`

### Консоль

\`\`\`java
Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
String word = sc.next();
sc.nextLine();                 // "з'їсти" залишок рядка після nextInt!
String line = sc.nextLine();

var br = new BufferedReader(new InputStreamReader(System.in));   // швидше за Scanner
\`\`\`

> [!WARNING]
> \`Scanner\` зручний, але повільний: для великих обсягів введення (олімпіадні задачі, мільйони рядків) використовуйте \`BufferedReader\`.
`
    },
    {
      title: "3. NIO.2: Path і Files",
      content: `
Пакет \`java.nio.file\` (Java 7) — сучасний API для роботи з файловою системою. Він замінює старий клас \`java.io.File\`. Аналоги в C#: \`Path\`, \`File\`, \`Directory\`.

### Path — шлях (лише значення, файлу може не існувати)

\`\`\`java
Path p = Path.of("data", "logs", "app.log");    // data/logs/app.log (роздільник ОС)
p.getFileName();          // app.log
p.getParent();            // data/logs
p.getRoot();              // null для відносного шляху
p.toAbsolutePath();
p.normalize();            // прибирає "." і ".."
p.resolve("x.txt");       // data/logs/app.log/x.txt
p.resolveSibling("old.log");   // data/logs/old.log
Path.of("/a/b").relativize(Path.of("/a/c/d"));   // ../c/d
p.toString().endsWith(".log");   // розширення перевіряємо через toString
\`\`\`

### Files — операції

\`\`\`java
Files.exists(p); Files.isDirectory(p); Files.isRegularFile(p); Files.isReadable(p);
Files.size(p);
Files.getLastModifiedTime(p);
Files.createDirectories(Path.of("out/reports"));   // з усіма батьківськими каталогами
Files.createFile(p);                               // FileAlreadyExistsException, якщо файл є
Files.createTempFile("tmp", ".txt");
Files.copy(src, dst, StandardCopyOption.REPLACE_EXISTING);
Files.move(src, dst, StandardCopyOption.ATOMIC_MOVE);
Files.delete(p);                                   // NoSuchFileException, якщо файлу немає
Files.deleteIfExists(p);
\`\`\`

### Атрибути

\`\`\`java
BasicFileAttributes a = Files.readAttributes(p, BasicFileAttributes.class);
a.size(); a.creationTime(); a.lastModifiedTime(); a.isSymbolicLink();
\`\`\`

> [!NOTE]
> \`Files.delete\` для непорожнього каталогу кидає \`DirectoryNotEmptyException\`. Каталог видаляють рекурсивно, обходячи його від глибших елементів до кореня (див. далі).
`
    },
    {
      title: "4. Обхід каталогів",
      content: `
\`\`\`java
// лише безпосередній вміст каталогу
try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir, "*.{java,kt}")) {
    for (Path f : ds) System.out.println(f.getFileName());
}

try (Stream<Path> s = Files.list(dir)) {
    s.filter(Files::isRegularFile).forEach(System.out::println);
}

// рекурсивно
try (Stream<Path> s = Files.walk(root)) {
    long totalSize = s.filter(Files::isRegularFile)
                      .mapToLong(f -> {
                          try { return Files.size(f); }
                          catch (IOException e) { throw new UncheckedIOException(e); }
                      })
                      .sum();
}

// пошук за умовою
try (Stream<Path> s = Files.find(root, 10,
        (path, attrs) -> attrs.isRegularFile() && attrs.size() > 1_000_000)) {
    s.forEach(System.out::println);
}

// рекурсивне видалення: спочатку вміст, потім сам каталог
try (Stream<Path> s = Files.walk(dir)) {
    s.sorted(Comparator.reverseOrder()).forEach(path -> {
        try { Files.delete(path); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    });
}
\`\`\`

### FileVisitor — повний контроль

\`\`\`java
Files.walkFileTree(root, new SimpleFileVisitor<>() {
    @Override
    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
        return dir.getFileName().toString().equals(".git")
                ? FileVisitResult.SKIP_SUBTREE        // пропустити гілку
                : FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
        System.out.println(file + " " + attrs.size());
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFileFailed(Path file, IOException exc) {
        System.err.println("Немає доступу: " + file);
        return FileVisitResult.CONTINUE;              // не падати через один файл
    }
});
\`\`\`
`
    },
    {
      title: "5. WatchService — події файлової системи",
      content: `
Аналог \`FileSystemWatcher\` з C#. Дозволяє отримувати повідомлення про створення, зміну і видалення файлів у каталозі.

\`\`\`java
try (WatchService ws = FileSystems.getDefault().newWatchService()) {
    dir.register(ws,
            StandardWatchEventKinds.ENTRY_CREATE,
            StandardWatchEventKinds.ENTRY_MODIFY,
            StandardWatchEventKinds.ENTRY_DELETE);

    while (true) {
        WatchKey key = ws.take();                         // блокується до події
        for (WatchEvent<?> ev : key.pollEvents()) {
            if (ev.kind() == StandardWatchEventKinds.OVERFLOW) continue;
            Path name = (Path) ev.context();              // шлях ВІДНОСНО dir
            System.out.println(ev.kind().name() + ": " + dir.resolve(name));
        }
        if (!key.reset()) break;                          // каталог зник
    }
}
\`\`\`

> [!WARNING]
> WatchService **не рекурсивний**: кожен підкаталог треба реєструвати окремо. Одна зміна файлу може породити кілька подій \`ENTRY_MODIFY\`, тож обробник має бути готовим до дублікатів.

Поєднання з лекцією 04: події файлової системи зручно перетворювати на власні події з підпискою (\`addListener\`), щоб решта програми не залежала від WatchService.
`
    },
    {
      title: "6. Бінарні дані та довільний доступ",
      content: `
\`\`\`java
record Measurement(long timestamp, double value) { }

static void save(Path p, List<Measurement> data) throws IOException {
    try (var out = new DataOutputStream(new BufferedOutputStream(Files.newOutputStream(p)))) {
        out.writeInt(0xCAFE_0001);          // "магічне число" + версія формату
        out.writeInt(data.size());
        for (var m : data) {
            out.writeLong(m.timestamp());
            out.writeDouble(m.value());
        }
    }
}

static List<Measurement> load(Path p) throws IOException {
    try (var in = new DataInputStream(new BufferedInputStream(Files.newInputStream(p)))) {
        if (in.readInt() != 0xCAFE_0001) throw new IOException("Невідомий формат");
        int n = in.readInt();
        var list = new ArrayList<Measurement>(n);
        for (int i = 0; i < n; i++) list.add(new Measurement(in.readLong(), in.readDouble()));
        return list;
    }
}
\`\`\`

### RandomAccessFile і FileChannel

Читання й запис з довільної позиції, корисні для файлів із записами фіксованої довжини:

\`\`\`java
try (var raf = new RandomAccessFile("records.bin", "rw")) {
    final int RECORD = 16;                   // long + double
    raf.seek(5L * RECORD);                   // перейти до 6-го запису
    long ts = raf.readLong();
    raf.seek(5L * RECORD + 8);
    raf.writeDouble(42.0);                   // перезаписати значення
}
\`\`\`

\`FileChannel\` + \`ByteBuffer\` (NIO) дають ще більше контролю: блокування фрагментів файлу, \`transferTo\` без копіювання через user space і відображення файлу в пам'ять (\`MappedByteBuffer\`, лекція 12).
`
    },
    {
      title: "7. ZIP-архіви",
      content: `
Аналог \`ZipArchive\` з C#.

### Створення архіву

\`\`\`java
static void zipDirectory(Path dir, Path zipFile) throws IOException {
    try (var zos = new ZipOutputStream(Files.newOutputStream(zipFile));
         Stream<Path> files = Files.walk(dir)) {
        for (Path f : (Iterable<Path>) files.filter(Files::isRegularFile)::iterator) {
            String entryName = dir.relativize(f).toString().replace('\\\\', '/');
            zos.putNextEntry(new ZipEntry(entryName));
            Files.copy(f, zos);
            zos.closeEntry();
        }
    }
}
\`\`\`

### Читання архіву

\`\`\`java
try (var zis = new ZipInputStream(Files.newInputStream(zipFile))) {
    ZipEntry e;
    while ((e = zis.getNextEntry()) != null) {
        System.out.println(e.getName() + " " + e.getSize());
        // zis зараз читає вміст поточного запису
    }
}
\`\`\`

### ZIP як файлова система

\`\`\`java
try (FileSystem zipFs = FileSystems.newFileSystem(zipFile)) {
    Path inside = zipFs.getPath("/reports/2025.csv");
    List<String> rows = Files.readAllLines(inside);
    Files.writeString(zipFs.getPath("/readme.txt"), "оновлено");   // запис усередину архіву
}
\`\`\`

> [!CAUTION]
> **Zip Slip:** назва запису може містити \`../../etc/passwd\`. Під час розпакування завжди перевіряйте, що \`target.resolve(name).normalize().startsWith(target)\`, інакше архів запише файл за межами цільового каталогу.
`
    }
  ],
  quiz: [
    {
      question: "Чим відрізняються InputStream і Reader?",
      options: [
        "InputStream читає байти, Reader — символи з урахуванням кодування",
        "Reader працює лише з мережею",
        "InputStream не можна буферизувати",
        "Нічим"
      ],
      answer: 0,
      explanation: "Байтові потоки працюють із сирими даними, символьні — з текстом. Між ними стоять мости InputStreamReader і OutputStreamWriter, яким вказують кодування."
    },
    {
      question: "Чому Files.lines(path) треба використовувати в try-with-resources?",
      options: [
        "Бо він кидає checked-виняток",
        "Бо потік тримає відкритий дескриптор файлу, доки його не закрити",
        "Бо інакше рядки читаються у зворотному порядку",
        "Не треба"
      ],
      answer: 1,
      explanation: "Stream з Files.lines/list/walk лінивий і тримає ресурс ОС. Без close() дескриптори вичерпаються, а на Windows файл ще й лишиться заблокованим."
    },
    {
      question: "Що повертає InputStream.read(byte[] buf)?",
      options: [
        "Завжди buf.length",
        "Кількість реально прочитаних байтів або -1 у кінці потоку",
        "true або false",
        "Прочитаний рядок"
      ],
      answer: 1,
      explanation: "Метод може прочитати менше, ніж розмір буфера. Тому записувати треба write(buf, 0, n), а не весь буфер."
    },
    {
      question: "Як рекурсивно видалити каталог за допомогою Files.walk?",
      options: [
        "Files.delete(dir)",
        "Відсортувати шляхи у зворотному порядку і видаляти від найглибших елементів до кореня",
        "Files.walk(dir).forEach(Files::delete) у будь-якому порядку",
        "Неможливо"
      ],
      answer: 1,
      explanation: "Каталог можна видалити лише тоді, коли він порожній. Зворотний порядок гарантує, що вміст каталогу видаляється раніше за сам каталог."
    },
    {
      question: "Що таке атака Zip Slip?",
      options: [
        "Надто великий архів",
        "Запис в архіві з назвою на кшталт ../../file, який під час розпакування потрапляє за межі цільового каталогу",
        "Пошкоджена контрольна сума",
        "Повільне стиснення"
      ],
      answer: 1,
      explanation: "Під час розпакування нормалізуйте шлях і перевіряйте startsWith(targetDir)."
    }
  ]
};
