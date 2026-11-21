export const lecture10 = {
  id: "10",
  title: "Лекція 10: Міжпроцесна взаємодія, мережа TCP/UDP і серіалізація",
  description: "Огляд способів обміну даними між процесами; запуск процесів і канали (ProcessBuilder); сокети TCP (Socket/ServerSocket) і багатоклієнтний сервер; UDP (DatagramSocket); HttpClient; серіалізація: вбудована в Java, JSON (Jackson/Gson) і бінарні формати.",
  sections: [
    {
      title: "1. Огляд: як процеси обмінюються даними",
      content: `
Процеси мають **окремі адресні простори**: один процес не може просто прочитати змінну іншого. Способи взаємодії:

| Механізм | Де | Java API |
| --- | --- | --- |
| Стандартні потоки і канали (pipes) | одна машина, батьківський і дочірній процеси | \`ProcessBuilder\`, \`Process.getInputStream()\` |
| Файли | одна машина | \`java.nio.file\`, \`FileChannel.lock()\` |
| Відображення файлу в пам'ять | одна машина, найшвидше | \`MappedByteBuffer\` (лекція 12) |
| Unix domain sockets | одна машина | \`SocketChannel\` + \`UnixDomainSocketAddress\` (Java 16) |
| TCP | мережа, надійний потік байтів | \`Socket\`, \`ServerSocket\` |
| UDP | мережа, окремі датаграми без гарантій | \`DatagramSocket\` |
| HTTP, gRPC, черги повідомлень | мережа, протоколи високого рівня | \`HttpClient\`, бібліотеки |

Хай би який був канал, дані треба **серіалізувати**: перетворити об'єкти на байти і відновити їх на іншому боці (розділ 6).
`
    },
    {
      title: "2. Процеси та канали",
      content: `
\`\`\`java
ProcessBuilder pb = new ProcessBuilder("git", "log", "--oneline", "-5")
        .directory(new File("/path/to/repo"))
        .redirectErrorStream(true);           // stderr -> stdout

Process p = pb.start();
try (var reader = p.inputReader(StandardCharsets.UTF_8)) {   // stdout дочірнього процесу
    reader.lines().forEach(System.out::println);
}
int exitCode = p.waitFor();                   // або p.waitFor(5, TimeUnit.SECONDS)
System.out.println("код виходу: " + exitCode);
\`\`\`

### Двобічний обмін

\`\`\`java
Process sort = new ProcessBuilder("sort").start();
try (var w = sort.outputWriter()) {           // stdin дочірнього процесу
    w.write("banana\\napple\\ncherry\\n");
}                                             // закрили stdin -> sort отримує EOF
System.out.println(new String(sort.getInputStream().readAllBytes()));
\`\`\`

> [!WARNING]
> Якщо дочірній процес багато пише в stdout, а ви не читаєте, буфер каналу (кілька КБ) заповниться і процес **зависне**. Читайте вивід (за потреби в окремому потоці) або перенаправляйте його у файл: \`redirectOutput(File)\`.

### Конвеєри

\`\`\`java
List<Process> pipeline = ProcessBuilder.startPipeline(List.of(
        new ProcessBuilder("cat", "access.log"),
        new ProcessBuilder("grep", "ERROR"),
        new ProcessBuilder("wc", "-l")));
\`\`\`

\`ProcessHandle.current().pid()\` повертає PID поточного процесу, а \`ProcessHandle.allProcesses()\` — список процесів системи.

### Канали всередині одного процесу

\`PipedInputStream\` і \`PipedOutputStream\` з'єднують два **потоки** (threads) одного процесу. Сьогодні замість них частіше використовують \`BlockingQueue\`.
`
    },
    {
      title: "3. TCP: Socket і ServerSocket",
      content: `
TCP дає **надійний впорядкований потік байтів** між двома точками. Межі повідомлень він **не зберігає**: два \`write\` можуть прийти одним \`read\`, і навпаки. Тому потрібен **протокол кадрування**: рядки з \`\\n\`, префікс довжини тощо.

### Echo-сервер (по потоку на клієнта)

\`\`\`java
public class EchoServer {
    public static void main(String[] args) throws IOException {
        try (var server = new ServerSocket(5000);
             var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            System.out.println("слухаю порт 5000");
            while (true) {
                Socket client = server.accept();       // блокується до підключення
                pool.submit(() -> handle(client));
            }
        }
    }

    static void handle(Socket socket) {
        try (socket;
             var in = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
             var out = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true)) {
            String line;
            while ((line = in.readLine()) != null) {   // null = клієнт закрив з'єднання
                if (line.equals("BYE")) break;
                out.println("ECHO: " + line);          // autoFlush=true
            }
        } catch (IOException e) {
            System.err.println("клієнт відпав: " + e.getMessage());
        }
    }
}
\`\`\`

### Клієнт

\`\`\`java
try (var socket = new Socket("localhost", 5000);
     var out = new PrintWriter(socket.getOutputStream(), true);
     var in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
    socket.setSoTimeout(5000);                 // тайм-аут читання -> SocketTimeoutException
    out.println("привіт");
    System.out.println(in.readLine());         // ECHO: привіт
    out.println("BYE");
}
\`\`\`

> [!IMPORTANT]
> Без \`flush()\` (або \`autoFlush\`) дані лишаються в буфері, і обидві сторони чекають одна на одну безкінечно. Це найчастіша помилка на лабораторних з мережі.

### Бінарний протокол із префіксом довжини

\`\`\`java
static void sendFrame(DataOutputStream out, byte[] payload) throws IOException {
    out.writeInt(payload.length);
    out.write(payload);
    out.flush();
}

static byte[] readFrame(DataInputStream in) throws IOException {
    int len = in.readInt();                    // EOFException, якщо з'єднання закрито
    if (len < 0 || len > 10_000_000) throw new IOException("некоректна довжина " + len);
    return in.readNBytes(len);                 // читає РІВНО len байтів
}
\`\`\`

> [!NOTE]
> Для десятків тисяч з'єднань без віртуальних потоків використовують неблокувальний NIO: \`ServerSocketChannel\` + \`Selector\` (на ньому побудовано Netty). З віртуальними потоками простий блокувальний код з прикладу вище масштабується так само.
`
    },
    {
      title: "4. UDP: DatagramSocket",
      content: `
UDP надсилає окремі **датаграми** (до ~64 КБ, на практиці < 1500 байтів). Доставку, порядок і відсутність дублікатів він не гарантує, але дає мінімальну затримку. Використовується в DNS, іграх, стрімінгу та для виявлення сервісів.

\`\`\`java
// приймач
try (var socket = new DatagramSocket(6000)) {
    byte[] buf = new byte[1500];
    while (true) {
        var packet = new DatagramPacket(buf, buf.length);
        socket.receive(packet);                // блокується до отримання датаграми
        String msg = new String(packet.getData(), 0, packet.getLength(), StandardCharsets.UTF_8);
        System.out.println(packet.getSocketAddress() + ": " + msg);

        byte[] reply = "OK".getBytes(StandardCharsets.UTF_8);
        socket.send(new DatagramPacket(reply, reply.length, packet.getSocketAddress()));
    }
}

// відправник
try (var socket = new DatagramSocket()) {
    byte[] data = "ping".getBytes(StandardCharsets.UTF_8);
    socket.send(new DatagramPacket(data, data.length, InetAddress.getByName("localhost"), 6000));
    socket.setSoTimeout(1000);                 // відповідь може не прийти!
}
\`\`\`

| | TCP | UDP |
| --- | --- | --- |
| З'єднання | так (handshake) | ні |
| Надійність і порядок | гарантовані | не гарантовані |
| Межі повідомлень | немає (потік байтів) | є (датаграма) |
| Широкомовлення | ні | broadcast / multicast (\`MulticastSocket\`) |

> [!WARNING]
> \`packet.getLength()\` — це розмір **отриманих** даних, а не буфера. Якщо використати \`new String(buf)\`, у повідомлення потраплять залишки попередніх датаграм.
`
    },
    {
      title: "5. HttpClient (Java 11)",
      content: `
\`\`\`java
HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();                                   // створюйте один раз і перевикористовуйте

HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create("https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current=temperature_2m"))
        .header("Accept", "application/json")
        .timeout(Duration.ofSeconds(10))
        .GET()
        .build();

// синхронно (у віртуальному потоці — найпростіший варіант)
HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.statusCode() + " " + resp.body());

// асинхронно
CompletableFuture<String> body = client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body);

// POST з JSON
HttpRequest post = HttpRequest.newBuilder(URI.create("https://httpbin.org/post"))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString("{\\"name\\":\\"Anna\\"}"))
        .build();
\`\`\`

> [!NOTE]
> \`send\` **не кидає** виняток для статусів 4xx/5xx. Перевіряйте \`statusCode()\` самі. Детальніше про HTTP і REST — у лекції 17.
`
    },
    {
      title: "6. Серіалізація",
      content: `
### 6.1 Вбудована серіалізація Java (Serializable)

\`\`\`java
public class Player implements Serializable {
    @Serial private static final long serialVersionUID = 1L;
    private String name;
    private int score;
    private transient String sessionToken;    // не серіалізується
}

try (var out = new ObjectOutputStream(Files.newOutputStream(Path.of("p.bin")))) {
    out.writeObject(player);
}
try (var in = new ObjectInputStream(Files.newInputStream(Path.of("p.bin")))) {
    Player p = (Player) in.readObject();
}
\`\`\`

> [!CAUTION]
> Вбудована серіалізація вважається **небезпечною**: десеріалізація недовірених даних дозволяє віддалене виконання коду (gadget chains). Формат крихкий (зміни класу ламають сумісність) і прив'язаний до Java. **Ніколи** не десеріалізуйте дані з мережі через \`ObjectInputStream\`. В іншому коді використовуйте JSON або Protobuf.

### 6.2 JSON — Jackson / Gson

\`\`\`java
// Jackson (com.fasterxml.jackson.core:jackson-databind)
record Weather(String city, double temperature, List<String> tags) { }

ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new Weather("Варшава", 12.5, List.of("хмарно")));
// {"city":"Варшава","temperature":12.5,"tags":["хмарно"]}

Weather w = mapper.readValue(json, Weather.class);
List<Weather> list = mapper.readValue(arrayJson, new TypeReference<List<Weather>>() { });  // generics!
JsonNode tree = mapper.readTree(json);
double t = tree.path("current").path("temperature_2m").asDouble();

// Gson (com.google.code.gson:gson)
Gson gson = new GsonBuilder().setPrettyPrinting().create();
String s = gson.toJson(w);
Weather back = gson.fromJson(s, Weather.class);
\`\`\`

Налаштування через анотації (Jackson): \`@JsonProperty("temp_c")\`, \`@JsonIgnore\`, \`@JsonIgnoreProperties(ignoreUnknown = true)\`, \`@JsonFormat(pattern = "yyyy-MM-dd")\`.

> [!NOTE]
> \`new TypeReference<List<Weather>>() { }\` — анонімний підклас, який зберігає параметр типу. Без нього стирання типів (лекція 03) не дасть бібліотеці дізнатися тип елементів списку.

### 6.3 Бінарні формати

* **Protocol Buffers** (Google): схема в \`.proto\` → згенеровані класи; компактно, швидко, з контрольованою еволюцією схеми.
* **Власний формат** через \`DataOutputStream\` (лекція 06) — коли потрібен повний контроль.

| Формат | Читабельність | Розмір/швидкість | Між мовами | Безпека |
| --- | --- | --- | --- | --- |
| Java Serializable | ні | середні | ні | ❌ |
| JSON | так | гірші | так | ✅ |
| Protobuf | ні | найкращі | так | ✅ |
`
    }
  ],
  quiz: [
    {
      question: "Клієнт надіслав два повідомлення через TCP двома викликами write. Скільки викликів read знадобиться серверу?",
      options: [
        "Рівно два",
        "Невідомо: TCP — потік байтів без меж повідомлень, тому потрібен власний протокол кадрування",
        "Рівно один",
        "TCP гарантує одне повідомлення на пакет"
      ],
      answer: 1,
      explanation: "TCP може об'єднати або розбити дані довільно. Межі задає протокол: рядки з \\n, префікс довжини тощо."
    },
    {
      question: "Клієнт і сервер зависли: кожен чекає відповіді. Найімовірніша причина?",
      options: [
        "Неправильний порт",
        "Дані лишилися в буфері PrintWriter/BufferedWriter без flush()",
        "UDP замість TCP",
        "Забагато потоків"
      ],
      answer: 1,
      explanation: "Буферизований writer відправляє дані лише після flush() (або коли буфер заповниться). Використовуйте autoFlush=true або явний flush()."
    },
    {
      question: "Чому ObjectInputStream не можна використовувати для даних з мережі?",
      options: [
        "Він повільний",
        "Десеріалізація недовірених даних дозволяє атакувальнику виконати код (gadget chains)",
        "Він не підтримує рядки",
        "Він працює лише з файлами"
      ],
      answer: 1,
      explanation: "Під час десеріалізації можуть виконуватися методи класів із classpath. Підібраний ланцюжок таких викликів дає віддалене виконання коду."
    },
    {
      question: "Що з наведеного правда про UDP?",
      options: [
        "Гарантує доставку і порядок",
        "Зберігає межі повідомлень (датаграм), але не гарантує доставку і порядок",
        "Вимагає handshake",
        "Не підтримує широкомовлення"
      ],
      answer: 1,
      explanation: "UDP надсилає незалежні датаграми. Тому застосунок сам вирішує, що робити з втратами, наприклад через тайм-аут і повторну відправку."
    },
    {
      question: "Що станеться, якщо дочірній процес пише багато даних у stdout, а батьківський їх не читає?",
      options: [
        "Дані відкинуться",
        "Дочірній процес зависне, коли заповниться буфер каналу",
        "Дані автоматично запишуться у файл",
        "Нічого"
      ],
      answer: 1,
      explanation: "Буфер каналу ОС невеликий (кілька КБ). Його треба читати або перенаправити вивід у файл."
    },
    {
      question: "Навіщо в Jackson new TypeReference<List<Weather>>() { }?",
      options: [
        "Для швидкодії",
        "Щоб обійти стирання типів: анонімний підклас зберігає повний generic-тип, і бібліотека знає тип елементів",
        "Для валідації JSON",
        "Це застарілий синтаксис"
      ],
      answer: 1,
      explanation: "List.class не містить інформації про Weather. Параметр типу надкласу анонімного класу зберігається в байт-коді і доступний рефлексії."
    }
  ]
};
