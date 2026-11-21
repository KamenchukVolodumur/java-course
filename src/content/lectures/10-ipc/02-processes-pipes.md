---
title: Процеси і канали
description: Запуск дочірніх процесів через ProcessBuilder, стандартні потоки як анонімні канали, переспрямування, кінець файлу й взаємні блокування, програма в ролі батька і дитини, ланцюжки процесів, ProcessHandle, іменовані канали — FIFO і сокети домену Unix.
---

## Канали

**Канал** (pipe) — механізм IPC, що передає дані між процесами в одному або обох напрямках. Він поводиться як потік байтів: один процес пише в один кінець каналу, інший читає з другого.

> [!NOTE]
> Читання з каналу **блокувальне**: якщо канал порожній, читач чекає, доки на іншому кінці з'являться дані або канал буде закрито. Якщо канал повний (буфер ОС має обмежений розмір, часто 4–64 КБ), блокується вже запис.

Розрізняють:

* **анонімні** канали — без імені в системі; їх успадковує дочірній процес від батька. Саме так пов'язані стандартні потоки `stdin`/`stdout` процесів у конвеєрі оболонки `ls | grep java`;
* **іменовані** канали — мають ім'я, тож до них можуть під'єднатися будь-які два процеси.

## Дочірні процеси

`ProcessBuilder` описує команду, яку треба запустити, а `start()` створює процес і повертає об'єкт `Process`:

```java
Process process = new ProcessBuilder("git", "--version")
        .directory(new File("."))                      // робочий каталог
        .redirectErrorStream(true)                     // stderr -> той самий канал, що й stdout
        .start();

String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
int exitCode = process.waitFor();                      // чекати завершення
System.out.println(exitCode + ": " + output.strip());  // 0: git version 2.47.0
```

> [!WARNING]
> Команда й аргументи передаються **окремими рядками**, а не одним рядком з пробілами: `new ProcessBuilder("git", "commit", "-m", message)`. Оболонка не використовується, тож `|`, `>`, `*` і змінні середовища в аргументах не мають спеціального значення. Це водночас і захист від ін'єкції команд, якщо аргументи надходять від користувача.

### Стандартні потоки як канали

За замовчуванням JVM створює для дочірнього процесу **три анонімні канали**. Назви методів дано з погляду батька:

| Метод `Process` | Потік дитини | Батько |
| --- | --- | --- |
| `getOutputStream()` | stdin | пише |
| `getInputStream()` | stdout | читає |
| `getErrorStream()` | stderr | читає |

Java 17 додала зручні обгортки `outputWriter()`, `inputReader()` та `errorReader()` з кодуванням.

Замість каналу потік можна **переспрямувати**:

```java
new ProcessBuilder("javac", "Main.java")
        .redirectOutput(ProcessBuilder.Redirect.INHERIT)                 // в консоль батька
        .redirectError(ProcessBuilder.Redirect.appendTo(new File("errors.log")))
        .redirectInput(ProcessBuilder.Redirect.from(new File("input.txt")))
        .start()
        .waitFor();

new ProcessBuilder("java", "-jar", "app.jar").inheritIO().start();      // усі три — успадкувати
```

### Кінець даних і взаємні блокування

Дві типові помилки роботи з каналами:

1. **Дитина чекає на кінець введення.** Програма, що читає stdin до кінця (наприклад, `sort`), не завершиться, доки батько не **закриє** свій кінець каналу: лише закриття означає «даних більше не буде» (EOF).
2. **Переповнення буфера.** Якщо батько чекає `waitFor()`, не читаючи stdout дитини, а дитина пише більше, ніж вміщує буфер каналу, дитина заблокується на записі, батько — на очікуванні, і обидва чекатимуть вічно. Вихід читають **до** `waitFor()`, а stdout і stderr — паралельно (або об'єднують через `redirectErrorStream(true)`).

```java
Process sort = new ProcessBuilder("sort").start();

try (BufferedWriter toChild = sort.outputWriter()) {        // закриття = EOF для дитини
    for (String word : List.of("груша", "яблуко", "абрикос")) {
        toChild.write(word);
        toChild.newLine();
    }
}

try (BufferedReader fromChild = sort.inputReader()) {
    fromChild.lines().forEach(System.out::println);          // абрикос, груша, яблуко
}
System.out.println("Код завершення: " + sort.waitFor());
```

## Батько й дитина в одній програмі

Та сама програма може грати обидві ролі залежно від аргументів. Батько запускає копію себе з аргументом `child`, пише рядки в її stdin, а дитина перетворює їх на великі літери й друкує:

```java
public class PipeDemo {
    public static void main(String[] args) throws Exception {
        if (args.length == 1 && args[0].equals("child")) {
            childWork();
        } else {
            parentWork();
        }
    }

    static void parentWork() throws Exception {
        String java = ProcessHandle.current().info().command().orElse("java");   // той самий java
        Process child = new ProcessBuilder(java, "-cp", System.getProperty("java.class.path"),
                PipeDemo.class.getName(), "child")
                .redirectOutput(ProcessBuilder.Redirect.INHERIT)                  // stdout дитини -> консоль
                .start();
        System.out.println("Дочірній процес стартував, PID: " + child.pid());

        try (BufferedWriter writer = child.outputWriter()) {
            for (String line : Files.readAllLines(Path.of("lorem.txt"))) {
                Thread.sleep(500);
                writer.write(line);
                writer.newLine();
                writer.flush();                                 // інакше рядок застрягне в буфері
            }
        }                                                       // спробуйте прибрати закриття

        child.waitFor();
    }

    static void childWork() throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String line;
        while ((line = reader.readLine()) != null) {            // null = батько закрив канал
            System.out.println(line.toUpperCase());
        }
    }
}
```

Ключовий момент — закриття `writer` у батька. Воно надсилає дитині кінець файлу: `readLine()` повертає `null`, цикл завершується, і дитина виходить. Без закриття дитина чекала б на дані вічно, а батько — на завершення дитини: **взаємне блокування**.

### Ланцюжки процесів

`ProcessBuilder.startPipeline` (Java 9) з'єднує stdout кожного процесу зі stdin наступного, як `|` в оболонці:

```java
List<Process> pipeline = ProcessBuilder.startPipeline(List.of(
        new ProcessBuilder("cat", "access.log"),
        new ProcessBuilder("grep", "ERROR"),
        new ProcessBuilder("wc", "-l")));

Process last = pipeline.getLast();
System.out.println(new String(last.getInputStream().readAllBytes()).strip());
```

### ProcessHandle

`ProcessHandle` дає інформацію про процеси ОС, зокрема й не запущені нашою програмою:

```java
ProcessHandle self = ProcessHandle.current();
System.out.println(self.pid());
self.info().commandLine().ifPresent(System.out::println);

ProcessHandle.allProcesses()
        .filter(p -> p.info().command().map(c -> c.endsWith("java")).orElse(false))
        .forEach(p -> System.out.println(p.pid() + " " + p.info().startInstant().orElse(null)));

child.toHandle().onExit().thenAccept(p -> System.out.println("Процес " + p.pid() + " завершився"));
child.destroy();                                      // «ввічливе» завершення (SIGTERM)
child.destroyForcibly();                              // примусове (SIGKILL)
```

## Іменовані канали

У стандартній бібліотеці Java немає окремого API іменованих каналів. Використовують:

* **FIFO-файли** в Unix: канал створює команда `mkfifo`, а далі з ним працюють як зі звичайним файлом (`Files.newBufferedReader`, `Files.newBufferedWriter`). Відкриття на читання блокується, доки хтось не відкриє канал на запис, і навпаки. FIFO однонапрямлений: для відповіді потрібен другий канал.
* **Сокети домену Unix** (Java 16, працюють також у Windows 10+) — двонапрямлене з'єднання між процесами однієї машини через файл-сокет у файловій системі. API той самий, що й для TCP-каналів NIO (`SocketChannel`, `ServerSocketChannel`), лише адреса інша: `UnixDomainSocketAddress`. Це найближчий аналог іменованого каналу.

Сервер створює сокет і чекає на клієнта, потім повертає отримані рядки великими літерами:

```java
public class Server {
    public static void main(String[] args) throws IOException {
        Path socketFile = Path.of(System.getProperty("java.io.tmpdir"), "p3_pipe.socket");
        Files.deleteIfExists(socketFile);                    // залишок попереднього запуску
        var address = UnixDomainSocketAddress.of(socketFile);

        try (ServerSocketChannel server = ServerSocketChannel.open(StandardProtocolFamily.UNIX)) {
            server.bind(address);
            try (SocketChannel channel = server.accept();     // чекає на клієнта
                 BufferedReader reader = new BufferedReader(Channels.newReader(channel, StandardCharsets.UTF_8));
                 PrintWriter writer = new PrintWriter(Channels.newWriter(channel, StandardCharsets.UTF_8), true)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    writer.println(line.toUpperCase());
                }
            }
        } finally {
            Files.deleteIfExists(socketFile);
        }
    }
}
```

Клієнт під'єднується за тією самою адресою, надсилає рядки файлу й друкує відповіді:

```java
public class Client {
    public static void main(String[] args) throws Exception {
        Path socketFile = Path.of(System.getProperty("java.io.tmpdir"), "p3_pipe.socket");

        try (SocketChannel channel = SocketChannel.open(UnixDomainSocketAddress.of(socketFile));
             BufferedReader reader = new BufferedReader(Channels.newReader(channel, StandardCharsets.UTF_8));
             PrintWriter writer = new PrintWriter(Channels.newWriter(channel, StandardCharsets.UTF_8), true)) {
            for (String line : Files.readAllLines(Path.of("lorem.txt"))) {
                Thread.sleep(500);
                writer.println(line);                         // autoFlush = true: println надсилає одразу
                System.out.println(reader.readLine());
            }
        }
    }
}
```

> [!NOTE]
> Усередині одного процесу для зв'язку **потоків** є `PipedInputStream`/`PipedOutputStream`. Але це не IPC, і для обміну між потоками зручніші блокувальні черги.
