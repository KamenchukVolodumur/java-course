export const lab06 = {
  id: "Lab06",
  title: "Лабораторна 06: Файли, потоки вводу-виводу та події — аналізатор логів",
  description: "Розбір рядків журналу регулярними виразами, потокова обробка великих файлів без завантаження в пам'ять, рекурсивний обхід каталогів зі стиснутими файлами .gz, CSV-звіт і ZIP-архів із захистом від Zip Slip, а також спостерігач за файлами з подіями через слухачів.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 05.2 «Події», 05.3 «Керування ресурсами», 05.8 «Винятки», 07.1 «Потоки введення-виведення», 07.2 «Файлова система», 07.3 «Архіви» · **Час:** 3 год · **Бали:** 10

Ви пишете інструмент для адміністратора: він аналізує журнали застосунку, архівує їх і стежить за новими записами в реальному часі.

\`\`\`text
src/main/java/pl/mini/logs/
├── Level.java  LogEntry.java  LogParser.java
├── LogStats.java  LogAnalyzer.java  DirectoryAnalyzer.java
├── ReportWriter.java
├── LogListener.java  LogWatcher.java
└── Main.java   (наданий)
\`\`\`

Формат рядка журналу:

\`\`\`text
2025-03-14T10:00:05 WARN [db] slow query 1200ms
└──── час ────────┘ └рівень┘ └компонент┘ └повідомлення┘
\`\`\`

### Правила

* Усі ресурси (потоки, читачі, \`Stream\` з \`Files.lines/walk\`) — **лише** в try-with-resources.
* Кодування — завжди явно UTF-8.
* \`LogAnalyzer\` має працювати з файлами, **більшими за доступну пам'ять**: заборонено \`Files.readAllLines\` і \`Files.readString\` у ньому.

> [!CAUTION]
> Заборонено ковтати винятки (\`catch (IOException e) {}\`). Або прокидайте \`IOException\` далі, або загортайте в \`UncheckedIOException\`, або (лише в \`DirectoryAnalyzer\`) пишіть попередження в \`System.err\` і продовжуйте.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Регулярні вирази з іменованими групами

\`\`\`java
private static final Pattern LINE = Pattern.compile(
        "^(?<time>\\\\S+) (?<level>[A-Z]+) \\\\[(?<comp>[^\\\\]]+)] (?<msg>.*)$");

Matcher m = LINE.matcher(line);
if (m.matches()) {
    String level = m.group("level");
}
\`\`\`

\`Pattern\` компілюйте **один раз** (static final): компіляція дорога.

### Потокове читання і декоратори

\`\`\`java
try (BufferedReader r = new BufferedReader(new InputStreamReader(
        new GZIPInputStream(Files.newInputStream(path)), StandardCharsets.UTF_8))) {
    String line;
    while ((line = r.readLine()) != null) { ... }
}
\`\`\`

### Обхід каталогу

\`\`\`java
try (Stream<Path> files = Files.walk(dir)) {
    List<Path> logs = files.filter(Files::isRegularFile)
                           .filter(p -> p.getFileName().toString().endsWith(".log"))
                           .sorted()
                           .toList();
}
\`\`\`

### Читання «хвоста» файлу з певної позиції

\`\`\`java
try (FileChannel ch = FileChannel.open(path, StandardOpenOption.READ)) {
    ch.position(offset);
    ByteBuffer buf = ByteBuffer.allocate((int) (ch.size() - offset));
    while (buf.hasRemaining() && ch.read(buf) > 0) { }
    String appended = new String(buf.array(), 0, buf.position(), StandardCharsets.UTF_8);
}
\`\`\`

### Події: слухач — функціональний інтерфейс

\`\`\`java
@FunctionalInterface
public interface LogListener {
    void onEntry(Path file, LogEntry entry);
}
private final List<LogListener> listeners = new CopyOnWriteArrayList<>();
\`\`\`
`
    },
    {
      title: "Очікуваний вивід",
      content: `
Так має виглядати вивід \`Main\` зі стартового проєкту, коли розкоментовано всі етапи:

\`\`\`text
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
OK: небезпечний запис в архіві: ../escaped.txt
[]
ALERT new.log: crash
[app.log:INFO, new.log:ERROR]
ALERT new.log: crash again
2
\`\`\`
`
    },
    {
      title: "Етап 1: Модель і парсер (2 б.)",
      content: `
\`\`\`java
public enum Level { TRACE, DEBUG, INFO, WARN, ERROR }

public record LogEntry(LocalDateTime time, Level level, String component, String message) { }

public final class LogParser {
    public static Optional<LogEntry> parse(String line);
}
\`\`\`

* Рядок, що не відповідає формату, має невідомий рівень або некоректну дату → \`Optional.empty()\` (а **не** виняток: зламаний рядок у журналі — нормальна ситуація).
* Невідомий рівень перевіряйте без \`try/catch\` навколо \`Level.valueOf\`: побудуйте \`static final Map<String, Level>\` з \`Level.values()\`.
* Некоректну дату (\`DateTimeParseException\`) ловіть і повертайте порожній результат.

> [!TIP]
> Чому \`Optional\`, а не \`null\`? Сигнатура одразу говорить викликачу: «результату може не бути». Крім того, \`parse\` зручно використовувати в потоках: \`lines.map(LogParser::parse).flatMap(Optional::stream)\`.
`
    },
    {
      title: "Етап 2: Потоковий аналіз одного файлу (2 б.)",
      content: `
\`\`\`java
public record LogStats(Map<Level, Long> counts,           // EnumMap: лише рівні, що трапилися
                       long malformed,
                       LocalDateTime first, LocalDateTime last,   // null, якщо записів немає
                       Map<String, Long> errorsByComponent,       // TreeMap
                       int files) {
    public Optional<String> topErrorComponent();   // найбільше ERROR; за рівності — менший за абеткою
    public LogStats merge(LogStats other);         // поєднання статистик (етап 3)
    public static LogStats empty();
}

public final class LogAnalyzer {
    public static LogStats analyze(Path file) throws IOException;   // files = 1
}
\`\`\`

* Читайте рядок за рядком через \`BufferedReader\`. Порожні рядки ігноруйте (не рахуйте як malformed).
* Файли з назвою \`*.gz\` читайте через \`GZIPInputStream\`. Вибір декоратора — в одному приватному методі \`openReader(Path)\`.
* \`LogStats\` — **незмінний**: у компактному конструкторі зробіть захисні копії мап (\`new EnumMap<>(counts)\`, \`new TreeMap<>(...)\`) і огорніть їх у \`Collections.unmodifiableMap\`.

> [!WARNING]
> \`EnumMap\` не можна створити з порожньої звичайної мапи конструктором \`new EnumMap<>(map)\`: він кидає \`IllegalArgumentException\`. Використовуйте \`new EnumMap<>(Level.class)\` + \`putAll\`.
`
    },
    {
      title: "Етап 3: Аналіз каталогу (2 б.)",
      content: `
\`\`\`java
public final class DirectoryAnalyzer {
    public static LogStats analyzeAll(Path dir) throws IOException;
}
\`\`\`

* Рекурсивно знаходить файли \`*.log\` і \`*.log.gz\` (\`Files.walk\`) і поєднує їх статистики через \`LogStats.merge\`. Інші файли ігноруються.
* Якщо окремий файл не вдалося прочитати (немає прав, пошкоджений gzip), друкуйте \`ПОПЕРЕДЖЕННЯ: <шлях>: <повідомлення>\` у \`System.err\` і продовжуйте. Такий файл не враховується в \`files\`.
* \`merge\`: суми лічильників, \`min\` для \`first\`, \`max\` для \`last\` (з урахуванням \`null\`), сума \`files\`.

> [!TIP]
> \`merge\` для мап — одним рядком на ключ: \`result.merge(level, count, Long::sum)\`. Отже, \`analyzeAll\` — це просто \`reduce(LogStats.empty(), LogStats::merge)\` по всіх файлах.
`
    },
    {
      title: "Етап 4: CSV-звіт і ZIP-архів (2 б.)",
      content: `
\`\`\`java
public final class ReportWriter {
    public static void writeCsv(LogStats stats, Path out) throws IOException;
    public static void archive(Path dir, Path zipFile) throws IOException;
    public static void unzip(Path zipFile, Path targetDir) throws IOException;
}
\`\`\`

* \`writeCsv\`: заголовок \`level,count\`, далі рядки в порядку оголошення \`Level\` (лише ті рівні, що трапилися), роздільник рядків — \`\\n\` (не системний).
* \`archive\`: до архіву потрапляють файли \`*.log\`, \`*.log.gz\` і \`report.csv\` з каталогу і підкаталогів. Назви записів **відносні** до \`dir\` і завжди з \`/\` (навіть на Windows). Сам архів у себе не потрапляє.
* \`unzip\`: розпаковує архів у \`targetDir\`. Для кожного запису перевіряйте:
\`\`\`java
Path target = targetDir.resolve(entry.getName()).normalize();
if (!target.startsWith(targetDir.normalize()))
    throw new IOException("небезпечний запис в архіві: " + entry.getName());
\`\`\`

> [!CAUTION]
> **Zip Slip** — реальна вразливість, через яку свого часу постраждали тисячі проєктів. Запис \`../../.bashrc\` в архіві, отриманому з інтернету, перезаписав би файл користувача.
`
    },
    {
      title: "Етап 5: Спостерігач за журналами з подіями (2 б.)",
      content: `
На відміну від \`WatchService\`, тут використовується опитування (polling): так поведінка детермінована і її легко тестувати.

\`\`\`java
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
\`\`\`

* Спостерігаємо лише файли \`*.log\` **безпосередньо** в \`dir\` (без підкаталогів і без \`.gz\`).
* Під час створення спостерігач запам'ятовує поточний **розмір** кожного файлу: старі записи не цікаві, як у \`tail -f\`. Файли, що з'являться пізніше, читаються з початку.
* \`poll()\` обходить файли **в алфавітному порядку**, читає байти від запам'ятованої позиції до кінця, розбирає **повні** рядки (ті, що закінчуються на \`\\n\`) і для кожного коректного запису викликає всіх слухачів. Позиція зсувається лише на довжину повних рядків: недописаний рядок буде прочитано під час наступного опитування.
* Слухачі зберігаються в \`CopyOnWriteArrayList\`, тож слухач може відписатися навіть під час розсилки події.
* Виняток у слухачі не повинен зупиняти розсилку іншим слухачам: перехопіть його і надрукуйте в \`System.err\`.

> [!NOTE]
> Позицію рахуйте в **байтах**, а не в символах: кирилиця в UTF-8 займає 2 байти на літеру. Тому використовуйте \`FileChannel\` чи \`RandomAccessFile\`, а не \`BufferedReader.skip\`.

### Без балів: справжній WatchService

Додайте метод \`watchForever()\`, який замість циклу з \`Thread.sleep\` чекає на події \`ENTRY_CREATE\`/\`ENTRY_MODIFY\` з \`WatchService\` і після кожної викликає \`poll()\`.

Закомітьте, позначте тегом \`lab06\` і запуште.
`
    }
  ],
  quiz: [
    {
      question: "Чому LogAnalyzer читає файл через BufferedReader, а не через Files.readAllLines?",
      options: [
        "readAllLines не підтримує UTF-8",
        "readAllLines завантажує весь файл у пам'ять, а журнали бувають більшими за доступну пам'ять",
        "BufferedReader швидше компілюється",
        "Різниці немає"
      ],
      answer: 1,
      explanation: "Потокова обробка тримає в пам'яті лише поточний рядок і буфер, незалежно від розміру файлу."
    },
    {
      question: "Чому позицію в LogWatcher треба зберігати в байтах?",
      options: [
        "Байти — це швидше",
        "Символ UTF-8 може займати кілька байтів, а FileChannel.position працює з байтами; підрахунок у символах дасть неправильний зсув",
        "Java не має типу char",
        "Так вимагає ZIP"
      ],
      answer: 1,
      explanation: "Кириличні літери займають 2 байти, емодзі — 4. Зсув у символах «з'їхав» би посеред багатобайтового символу."
    },
    {
      question: "Яка перевірка захищає від Zip Slip?",
      options: [
        "Перевірити розширення файлу",
        "Нормалізувати шлях цілі й переконатися, що він починається з каталогу розпакування",
        "Обмежити розмір архіву",
        "Перевірити CRC"
      ],
      answer: 1,
      explanation: "resolve(\"../x\").normalize() виходить за межі каталогу, і startsWith(targetDir) повертає false."
    },
    {
      question: "Чому список слухачів — CopyOnWriteArrayList?",
      options: [
        "Він швидший за ArrayList",
        "Розсилка обходить знімок списку, тож слухач може відписатися (змінити список) під час розсилки без ConcurrentModificationException",
        "Він сортує слухачів",
        "Так вимагає FileChannel"
      ],
      answer: 1,
      explanation: "Список слухачів читають часто, а змінюють рідко. Для такого сценарію CopyOnWrite ідеальний."
    }
  ]
};
