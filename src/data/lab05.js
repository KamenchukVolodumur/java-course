export const lab05 = {
  id: "Lab05",
  title: "Лабораторна 5: Аналізатор Логів",
  description: "Робота з файловою системою (I/O, NIO.2), безпечне управління ресурсами (try-with-resources) та обробка великих текстових файлів.",
  sections: [
    {
      title: "Опис завдання",
      content: `
> [!NOTE]
> **Рекомендовані лекції для цієї лаби:** Лекції 06, 07

У цій лабораторній роботі ви створите утиліту для системних адміністраторів — **Аналізатор серверних логів**. Ваша програма буде читати великий текстовий файл із записами про роботу сервера, знаходити помилки та генерувати звіт у форматі CSV.

Ця лабораторна покриває матеріал **Лекцій 6 та 7**:
* Робота зі шляхами: \`Path\` та \`Paths\` (NIO.2)
* Читання та запис файлів: \`Files\`, \`BufferedReader\`, \`BufferedWriter\`
* Безпечне закриття ресурсів: \`try-with-resources\`
* Обробка винятків: \`IOException\`
* Робота з рядками (парсинг): \`String.split()\`, регулярні вирази (опціонально)
`
    },
    {
      title: "Task 1: Підготовка та генерація тестових даних (1 бал)",
      content: `
Перш ніж аналізувати логи, нам потрібен сам файл логів. Створимо допоміжний клас, який згенерує для нас файл \`server.log\`.

Створіть клас \`LogGenerator\` у пакеті \`org.example.logs\`:

\`\`\`java
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class LogGenerator {
    private static final String[] LEVELS = {"INFO", "INFO", "INFO", "WARNING", "ERROR"};
    private static final String[] ENDPOINTS = {"/api/users", "/api/login", "/api/products", "/home"};
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static void generateLogFile(String fileName, int lineCount) {
        // TODO 1: Створіть об'єкт Path на основі fileName
        Path filePath = Paths.get(fileName);

        // TODO 2: Використайте try-with-resources для створення BufferedWriter.
        // Підказка: Files.newBufferedWriter(filePath)
        
        /* 
        try (...) {
            Random random = new Random();
            LocalDateTime time = LocalDateTime.now().minusDays(1);

            for (int i = 0; i < lineCount; i++) {
                String level = LEVELS[random.nextInt(LEVELS.length)];
                String endpoint = ENDPOINTS[random.nextInt(ENDPOINTS.length)];
                time = time.plusMinutes(random.nextInt(5));
                
                String logLine = String.format("[%s] %s - Zapytaie do %s zakoczone statusem %s\\n", 
                        time.format(formatter), level, endpoint, 
                        level.equals("ERROR") ? "500" : "200");
                
                // TODO 3: Запишіть logLine у файл
            }
            System.out.println("Plik logow wygenerowany: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Blad podczas generowania pliku: " + e.getMessage());
        }
        */
    }
}
\`\`\`

**Ваше завдання:** Розкоментуйте код та заповніть \`TODO\`. 
У класі \`Main\` викличте \`LogGenerator.generateLogFile("server.log", 1000);\`. Запустіть програму і переконайтеся, що файл \`server.log\` з'явився у корені вашого проекту.
`
    },
    {
      title: "Task 2: Аналіз логів (3 бали)",
      content: `
Створіть клас \`LogAnalyzer\`. Він повинен прочитати згенерований файл рядок за рядком (щоб не завантажувати весь великий файл в оперативну пам'ять) та зібрати статистику.

Ми хочемо дізнатися:
1. Скільки всього було запитів.
2. Скільки запитів завершилися помилкою (\`ERROR\`).
3. Скільки разів зверталися до кожного endpoint-у.

### Модель результату
Створіть запис (\`record\`) для зберігання зібраної статистики:
\`\`\`java
import java.util.Map;

public record LogStatistics(
        int totalRequests,
        int errorCount,
        Map<String, Integer> endpointHits
) {}
\`\`\`

### Клас Аналізатора
\`\`\`java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class LogAnalyzer {

    public LogStatistics analyze(Path logFilePath) {
        int total = 0;
        int errors = 0;
        Map<String, Integer> endpointHits = new HashMap<>();

        // TODO 1: Відкрийте файл для читання за допомогою try-with-resources.
        // Підказка: Files.newBufferedReader(logFilePath)
        
        // TODO 2: Читайте файл рядок za рядком у циклі while (line = reader.readLine() != null).
        // У кожній ітерації:
        // - Збільште лічильник 'total'.
        // - Якщо рядок містить "[ERROR]", збільште лічильник 'errors'.
        // - Витягніть endpoint з рядка. Зверніть увагу на структуру логу: 
        //   [2023-10-25 15:30:00] INFO - Zapytanie do /api/login zakonczone...
        //   Можете використати split() або regex. Найпростіше розбити рядок по пробілах.
        // - Оновіть кількість хітів для цього endpoint-у в мапі 'endpointHits' 
        //   (використайте map.merge() або map.put(key, map.getOrDefault(key, 0) + 1)).

        // TODO 3: Обробіть IOException у блоці catch.
        
        return new LogStatistics(total, errors, endpointHits);
    }
}
\`\`\`
`
    },
    {
      title: "Task 3: Експорт звіту в CSV (2 бали)",
      content: `
Результати аналізу потрібно не просто вивести в консоль, а зберегти в спеціальний файл звіту.

Додайте метод \`exportReport\` до класу \`LogAnalyzer\`:

\`\`\`java
import java.nio.file.StandardOpenOption;

public class LogAnalyzer {
    // ... попередній метод analyze ...

    public void exportReport(LogStatistics stats, Path reportPath) {
        // TODO: Відкрийте reportPath для запису (try-with-resources).
        // Оскільки це звіт, який ми можемо оновлювати, використайте опції:
        // StandardOpenOption.CREATE (створити, якщо не існує) 
        // StandardOpenOption.TRUNCATE_EXISTING (очистити файл перед записом нового)
        
        // Запишіть у файл наступні рядки:
        // 1. "Metryka,Wartosc" (заголовок CSV)
        // 2. "Total Requests,1000" (використайте stats.totalRequests())
        // 3. "Total Errors,50" (використайте stats.errorCount())
        // 4. Порожній рядок
        // 5. "Endpoint,Hits"
        // 6. У циклі пройдіться по stats.endpointHits() і запишіть кожен endpoint та кількість звернень,
        //    наприклад: "/api/login,250"
    }
}
\`\`\`

> [!TIP]
> У методі \`write\` класу \`BufferedWriter\` не забувайте додавати символ нового рядка (System.lineSeparator() або \`\\n\`), інакше весь звіт склеїться в один довгий рядок!
`
    },
    {
      title: "Task 4: Головна програма (1 бал)",
      content: `
Зберіть усе разом у класі \`Main\`.

\`\`\`java
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) {
        String logFileName = "server.log";
        String reportFileName = "report.csv";

        System.out.println("1. Generowanie logow...");
        LogGenerator.generateLogFile(logFileName, 5000);

        System.out.println("2. Analizowanie logow...");
        LogAnalyzer analyzer = new LogAnalyzer();
        Path logPath = Paths.get(logFileName);
        
        // Викличте метод analyze()
        LogStatistics stats = analyzer.analyze(logPath);
        
        System.out.println("   - Znaleziono zapytan: " + stats.totalRequests());
        System.out.println("   - Znaleziono bledow: " + stats.errorCount());

        System.out.println("3. Zapisywanie raportu...");
        Path reportPath = Paths.get(reportFileName);
        analyzer.exportReport(stats, reportPath);

        System.out.println("Zakonczono! Sprawdz plik: " + reportPath.toAbsolutePath());
    }
}
\`\`\`

**Бонусне завдання:** 
Замість \`BufferedReader\` у методі \`analyze\`, спробуйте використати сучасний підхід Java NIO.2 — метод \`Files.lines(logFilePath)\`. Він повертає \`Stream<String>\`, що дозволяє обробити файл повністю у функціональному стилі (через \`filter\`, \`map\` та \`reduce\` / \`collect\`), при цьому файл читається так само ефективно, не завантажуючи все в пам'ять (так як Stream є "лінивим"). **Пам'ятайте, що Stream від файлу ТАКОЖ потрібно обертати в try-with-resources!**
`
    }
  ],
  quiz: [
    {
      question: "Чому для читання великих файлів (наприклад, 10 GB) слід використовувати BufferedReader (або Files.lines()), а не Files.readAllLines()?",
      options: [
        "Metoda readAllLines() jest wolniejsza dla dysków SSD.",
        "Metoda readAllLines() zwraca tablicę char[], z którą trudno się pracuje w Javie.",
        "Metoda readAllLines() ładuje całą zawartość pliku do pamięci RAM naraz (do List<String>). Przy 10 GB pliku natychmiast wyrzuci wyjątek OutOfMemoryError.",
        "Nie ma różnicy, obie metody ładują plik po kawałku do pamięci podręcznej."
      ],
      answer: 2,
      explanation: "readAllLines() wczytuje wszystko do jednej wielkiej listy, zjadając całą pamięć RAM. BufferedReader czyta plik kawałek po kawałku (zwykle po 8KB), utrzymując zużycie pamięci na niemal zerowym poziomie."
    },
    {
      question: "Co gwarantuje konstrukcja try-with-resources w Javie?",
      options: [
        "Automatycznie łapie wszystkie wyjątki typu RuntimeException, dzięki czemu nie musimy pisać bloku catch.",
        "Zapewnia, że obiekt zasobu (np. BufferedWriter) zostanie zawsze zamknięty (wywołana zostanie metoda close()), niezależnie od tego, czy blok wykonał się poprawnie, czy poleciał wyjątek.",
        "Sprawia, że zasób jest zapisywany na dysk dwukrotnie dla zwiększenia bezpieczeństwa.",
        "Pozwala na równoległy dostęp do pliku z wielu wątków jednocześnie bez blokad (locks)."
      ],
      answer: 1,
      explanation: "try-with-resources automatycznie wywołuje metodę close() na obiektach implementujących interfejs AutoCloseable. Rozwiązuje to odwieczny problem z 'wyciekami zasobów' (np. gdy zablokujemy dostęp do pliku)."
    },
    {
      question: "Jaki jest poprawny sposób na połączenie (konkatenację) ścieżek z użyciem NIO.2 (interfejs Path)?",
      options: [
        "Path full = Path.of(\"logs\") + Path.of(\"server.log\");",
        "Path full = Paths.get(\"logs\").concat(\"server.log\");",
        "Path full = Paths.get(\"logs\").resolve(\"server.log\");",
        "Path full = new Path(\"logs\\\\server.log\");"
      ],
      answer: 2,
      explanation: "Metoda resolve() służy do poprawnego łączenia ścieżek, automatycznie dbając o odpowiednie ukośniki (slash lub backslash) w zależności od systemu operacyjnego."
    },
    {
      question: "Co się stanie, jeśli otworzysz plik do zapisu używając Files.newBufferedWriter(path, StandardOpenOption.APPEND)?",
      options: [
        "Nowe dane zostaną dodane na KOŃCU istniejącego pliku (lub plik zostanie utworzony, jeśli nie istniał).",
        "Cała zawartość pliku zostanie wyczyszczona przed rozpoczęciem zapisu (plik będzie nadpisany).",
        "Zostanie wyrzucony wyjątek FileAlreadyExistsException, jeśli plik już istnieje.",
        "Plik zostanie zablokowany, a nowa zawartość zostanie dopisana na jego POCZĄTKU."
      ],
      answer: 0,
      explanation: "Opcja APPEND ('dopisz') informuje system operacyjny, że wskaźnik zapisu ma zostać ustawiony na samym końcu pliku. Stare dane nie ulegną zniszczeniu."
    }
  ]
};
