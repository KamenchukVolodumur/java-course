export const lab09 = {
  id: "Lab09",
  title: "Лабораторна 09: Мережа і серіалізація — TCP-чат з погодою",
  description: "Протокол обміну повідомленнями на sealed-records із серіалізацією в JSON (один об'єкт на рядок), багатоклієнтський TCP-сервер з потоком на клієнта, розсилка повідомлень, клієнт із фоновим читачем і BlockingQueue, а також команда /weather, що звертається до REST API через HttpClient і CompletableFuture.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 09.3 «Асинхронне програмування», 09.5 «Віртуальні потоки», 10.4 «TCP», 10.7 «Серіалізація», 12.5 «Потокобезпечні колекції», 14.4 «HTTP, REST і JSON» · **Час:** 3 год · **Бали:** 10

\`\`\`text
          TCP, JSON lines                     HTTPS
ChatClient ◄─────────────► ChatServer ──────────────► api.open-meteo.com
ChatClient ◄─────────────►    │  ClientHandler (потік на клієнта)
                              └─ WeatherProvider (інтерфейс; у тестах — підробка)
\`\`\`

\`\`\`text
src/main/java/pl/mini/chat/
├── Message.java  MessageCodec.java  ProtocolException.java
├── ChatServer.java  ClientHandler.java  ChatClient.java
├── WeatherProvider.java  OpenMeteoProvider.java
└── Main.java   (наданий)
\`\`\`

### Залежність для JSON

\`\`\`xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.2</version>
</dependency>
\`\`\`

Можна використати Gson або написати власний мінімальний кодек: важливий лише формат на дроті.

### Правила

* Кодування в сокетах — **UTF-8**, і завжди явно.
* Сервер **не падає** через одного клієнта: будь-яка помилка в обробнику клієнта закриває лише це з'єднання.
* Усі сокети й потоки закриваються (\`ChatServer\` і \`ChatClient\` реалізують \`AutoCloseable\`).

> [!CAUTION]
> Заборонено \`ObjectOutputStream\`/\`ObjectInputStream\` (вбудована серіалізація Java): дані з мережі ніколи не десеріалізують таким способом (див. сторінку «Серіалізація»).
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Кадрування: один JSON на рядок

TCP — це потік байтів без меж повідомлень. Найпростіший протокол кадрування: **кожне повідомлення — один рядок JSON**, що закінчується \`\\n\`. JSON-кодувальник екранує переноси всередині рядків як \`\\n\`, тож справжній перенос рядка в повідомленні з'явитися не може.

\`\`\`text
{"type":"join","user":"ann"}
{"type":"say","user":"ann","text":"привіт"}
\`\`\`

### Поліморфний JSON у Jackson

\`\`\`java
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Message.Join.class, name = "join"),
        @JsonSubTypes.Type(value = Message.Say.class,  name = "say")
})
public sealed interface Message permits Message.Join, Message.Say {
    record Join(String user) implements Message { }
    record Say(String user, String text) implements Message { }
}

ObjectMapper mapper = new ObjectMapper();
String line = mapper.writeValueAsString(new Message.Say("ann", "hi"));   // {"type":"say","user":"ann","text":"hi"}
Message m = mapper.readValue(line, Message.class);
\`\`\`

### Сервер: потік на клієнта

\`\`\`java
ServerSocket server = new ServerSocket(0);        // 0 = будь-який вільний порт
int port = server.getLocalPort();
Thread.ofPlatform().daemon().start(() -> {        // цикл accept у фоні (Java 21; на 17 — new Thread)
    while (!server.isClosed()) {
        Socket s = server.accept();
        executor.submit(() -> handle(s));
    }
});
\`\`\`

### Клієнт: фоновий читач + черга

\`\`\`java
BlockingQueue<Message> inbox = new LinkedBlockingQueue<>();
// потік-читач: читає рядки з сокета, декодує, кладе в inbox
Message m = inbox.poll(2, TimeUnit.SECONDS);      // null після тайм-ауту
\`\`\`
`
    },
    {
      title: "Очікуваний вивід",
      content: `
Так має виглядати вивід \`Main\` зі стартового проєкту, коли розкоментовано всі етапи:

\`\`\`text
true
Say[user=ann, text=привіт "усім"]
OK: ProtocolException
Info[text=вітаємо, ann! онлайн: 1]
Info[text=вітаємо, bob! онлайн: 2]
Info[text=bob приєднався]
Say[user=ann, text=привіт]
Info[text=Варшава: 12.5°C]
Error[reason=немає даних для Атлантида]
Error[reason=ім'я ann зайняте]
Info[text=bob вийшов]
тиша: true
\`\`\`

> [!NOTE]
> Етапи 2–5 перевіряються одним блоком: розкоментуйте його після етапу 2, а рядки наступних етапів додавайте поступово.
`
    },
    {
      title: "Етап 1: Протокол і серіалізація (2 б.)",
      content: `
\`\`\`java
public sealed interface Message {
    record Join(String user) implements Message { }
    record Say(String user, String text) implements Message { }
    record Leave(String user) implements Message { }
    record Info(String text) implements Message { }       // сервер -> клієнт
    record Error(String reason) implements Message { }    // сервер -> клієнт
}

public class ProtocolException extends Exception { ... }

public final class MessageCodec {
    public static String encode(Message m);                        // один рядок без \\n у кінці
    public static Message decode(String line) throws ProtocolException;
}
\`\`\`

* Формат: \`{"type":"<join|say|leave|info|error>", ...поля record}\`.
* \`decode\` кидає \`ProtocolException\` для некоректного JSON, невідомого типу або відсутнього обов'язкового поля (\`null\` у \`user\`/\`text\` теж помилка). Причину (Jackson-виняток) зберігайте як \`cause\`.
* \`ObjectMapper\` створюйте **один раз** (\`static final\`): він потокобезпечний після налаштування і дорогий у створенні.

> [!TIP]
> \`Message.Error\` конфліктує за назвою з \`java.lang.Error\`. Імпорт \`pl.mini.chat.Message.*\` цей конфлікт **не** розв'язує: і він, і неявний \`java.lang.*\` — імпорти «на вимогу», тож компілятор повідомить «reference to Error is ambiguous». Потрібен явний імпорт одного типу, \`import pl.mini.chat.Message.Error;\`, як у \`Main\`, або повна назва \`Message.Error\`.
`
    },
    {
      title: "Етап 2: Сервер і приєднання (2 б.)",
      content: `
\`\`\`java
public class ChatServer implements AutoCloseable {
    public ChatServer(int port, WeatherProvider weather);
    public void start() throws IOException;       // відкриває ServerSocket і запускає цикл accept у фоні
    public int port();                            // фактичний порт (важливо для port = 0)
    @Override public void close();                // закриває ServerSocket, усіх клієнтів і пул
}
\`\`\`

* Кожен клієнт обслуговується окремою задачею в пулі (\`newVirtualThreadPerTaskExecutor\` у Java 21 або \`newCachedThreadPool\`).
* Перше повідомлення від клієнта **має** бути \`Join\`. Інакше сервер відповідає \`Error("спочатку join")\` і закриває з'єднання.
* Після успішного \`Join\` клієнт отримує \`Info("вітаємо, <user>! онлайн: <N>")\`.
* Некоректний рядок від клієнта (\`ProtocolException\`) → \`Error("некоректне повідомлення")\`, з'єднання **не** закривається.

> [!IMPORTANT]
> \`PrintWriter\` створюйте з \`autoFlush = true\` або викликайте \`flush()\` після кожного повідомлення. Без цього відповідь лишиться в буфері, і клієнт чекатиме вічно (див. сторінку «TCP»).
`
    },
    {
      title: "Етап 3: Розсилка (2 б.)",
      content: `
* Активні клієнти — у \`ConcurrentHashMap<String, ClientHandler>\` (ключ — ім'я).
* \`Say\` від користувача розсилається **всім іншим** (не відправнику). Поле \`user\` у розісланому повідомленні сервер встановлює сам — за ім'ям з \`Join\`, а не з того, що надіслав клієнт. Інакше будь-хто міг би писати від чужого імені.
* Після \`Join\` інші користувачі отримують \`Info("<user> приєднався")\`.
* \`Leave\` **або** розрив з'єднання (EOF, \`IOException\`) → видалення з мапи і \`Info("<user> вийшов")\` усім. Розсилка має відбутися **рівно один раз**, навіть якщо клієнт надіслав \`Leave\`, а потім закрив сокет.

> [!WARNING]
> Запис у сокет клієнта з **кількох** потоків одночасно (розсилки від різних відправників) може перемішати байти двох повідомлень в одному рядку. Зробіть метод \`ClientHandler.send(Message)\` \`synchronized\` (або використовуйте окремий замок на writer).
`
    },
    {
      title: "Етап 4: Клієнт і унікальні імена (2 б.)",
      content: `
\`\`\`java
public class ChatClient implements AutoCloseable {
    public ChatClient(String host, int port) throws IOException;   // запускає потік-читач
    public void send(Message m);
    public Optional<Message> poll(Duration timeout) throws InterruptedException;
    public Message receive() throws InterruptedException;          // poll(2 с) або IllegalStateException("немає відповіді")
    @Override public void close();
}
\`\`\`

* Потік-читач (daemon) читає рядки, декодує їх і кладе в \`LinkedBlockingQueue\`. Після закриття сокета потік має завершитися **без** стектрейсу в консолі.
* На сервері: \`Join\` з уже зайнятим ім'ям → \`Error("ім'я <user> зайняте")\` і закриття з'єднання. Перевірка й реєстрація мають бути **атомарними**: \`putIfAbsent\`, а не \`containsKey\` + \`put\`.

> [!TIP]
> Перевірте атомарність тестом: 20 клієнтів одночасно (за сигналом \`CountDownLatch\`) приєднуються з тим самим ім'ям. Успішно має приєднатися рівно один.
`
    },
    {
      title: "Етап 5: Команда /weather (2 б.)",
      content: `
\`\`\`java
@FunctionalInterface
public interface WeatherProvider {
    CompletableFuture<Double> currentTemperature(String city);   // NaN, якщо міста не знайдено
}
\`\`\`

* Якщо текст \`Say\` починається з \`/weather \`, сервер **не** розсилає повідомлення. Він асинхронно запитує провайдера і відповідає **лише відправнику**: \`Info("<місто>: <t>°C")\` (одна цифра після коми, \`Locale.ROOT\`) або \`Error("немає даних для <місто>")\`, якщо результат \`NaN\`, сталася помилка або минув тайм-аут 3 с (\`orTimeout\`).
* Потік обробника клієнта **не блокується** в очікуванні погоди: відповідь надсилається в \`thenAccept\`/\`whenComplete\`.

### Справжній провайдер: OpenMeteoProvider

\`\`\`java
public class OpenMeteoProvider implements WeatherProvider {
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    // 1) https://geocoding-api.open-meteo.com/v1/search?name=<місто>&count=1   -> results[0].latitude/longitude
    // 2) https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m
    //    -> current.temperature_2m
}
\`\`\`

* Два запити поєднайте через \`thenCompose\` (другий залежить від результату першого).
* Назву міста кодуйте через \`URLEncoder.encode(city, UTF_8)\`.
* Статус ≠ 200 або порожні \`results\` → \`NaN\`.
* Запустіть \`ChatServer\` з \`OpenMeteoProvider\` вручну (наприклад, \`main\` в окремому класі \`ServerApp\`) і поспілкуйтеся двома клієнтами з термінала.

> [!NOTE]
> Чому в \`Main\` підробний провайдер? Тест, що залежить від інтернету й поточної погоди, не є повторюваним (FIRST, див. сторінку «Тестування з JUnit 5»). Інтерфейс \`WeatherProvider\` — це межа, на якій ми підміняємо зовнішній світ.

Закомітьте, позначте тегом \`lab09\` і запуште.
`
    }
  ],
  quiz: [
    {
      question: "Навіщо протоколу правило «один JSON-об'єкт на рядок»?",
      options: [
        "Так JSON швидший",
        "TCP не зберігає меж повідомлень; перенос рядка — роздільник кадрів, а JSON гарантує, що всередині повідомлення сирого \\n не буде",
        "Так вимагає ServerSocket",
        "Щоб економити трафік"
      ],
      answer: 1,
      explanation: "Отримувач читає readLine() і щоразу отримує рівно одне повідомлення, незалежно від того, як TCP розбив байти на пакети."
    },
    {
      question: "Чому сервер має сам встановлювати поле user у розісланому Say?",
      options: [
        "Щоб економити пам'ять",
        "Щоб клієнт не міг підробити відправника: довіряти можна лише імені, перевіреному під час Join",
        "Цього вимагає Jackson",
        "Не має"
      ],
      answer: 1,
      explanation: "Дані від клієнта недовірені. Ідентичність відправника визначає сервер за станом з'єднання."
    },
    {
      question: "Чому реєстрація імені має використовувати putIfAbsent, а не containsKey + put?",
      options: [
        "putIfAbsent коротший",
        "containsKey + put — це check-then-act: два клієнти можуть одночасно пройти перевірку і обидва зареєструватися",
        "containsKey не працює з ConcurrentHashMap",
        "Різниці немає"
      ],
      answer: 1,
      explanation: "Кожен метод окремо потокобезпечний, але їх послідовність — ні. putIfAbsent виконує перевірку й вставку атомарно."
    },
    {
      question: "Чому для двох HTTP-запитів OpenMeteoProvider (геокодування, потім прогноз) використовують thenCompose?",
      options: [
        "thenApply не працює з HTTP",
        "Другий запит сам повертає CompletableFuture; thenCompose «сплющує» результат замість CompletableFuture<CompletableFuture<Double>>",
        "thenCompose виконує запити паралельно",
        "Так вимагає HttpClient"
      ],
      answer: 1,
      explanation: "thenCompose — це flatMap для асинхронних обчислень, наступний крок стартує, коли завершиться попередній future."
    }
  ]
};
