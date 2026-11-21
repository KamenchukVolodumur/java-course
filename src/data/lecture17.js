export const lecture17 = {
  id: "17",
  title: "Лекція 17: HTTP, REST API і JSON",
  description: "Основи протоколу HTTP (методи, коди статусу, заголовки), архітектура REST і проєктування ендпоінтів, формат JSON, клієнт HttpClient із обробкою помилок, десеріалізація через Jackson і найпростіший HTTP-сервер без фреймворків.",
  sections: [
    {
      title: "1. Протокол HTTP",
      content: `
Перш ніж писати мережеві сервіси (наприклад, на Spring Boot), треба розуміти, як програми спілкуються в інтернеті. Найчастіше для цього використовують **HTTP** (HyperText Transfer Protocol) — текстовий протокол поверх TCP (лекція 10).

HTTP завжди працює за моделлю **клієнт — сервер**:

1. **Клієнт** (браузер, мобільний застосунок, інша Java-програма) надсилає **запит (request)**.
2. **Сервер** обробляє його і повертає **відповідь (response)**.

\`\`\`text
POST /api/users HTTP/1.1                ← метод, шлях, версія
Host: api.example.com                   ← заголовки
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
                                        ← порожній рядок
{"name": "Анна", "email": "a@x.pl"}     ← тіло

HTTP/1.1 201 Created                    ← версія, код статусу
Location: /api/users/42
Content-Type: application/json

{"id": 42, "name": "Анна", "email": "a@x.pl"}
\`\`\`

Запит складається з:

* **методу** — *що* зробити;
* **URL** — *з яким ресурсом* (\`/api/users/1?expand=orders\`; після \`?\` — параметри запиту);
* **заголовків** — метаданих (\`Content-Type\`, \`Accept\`, \`Authorization\`);
* **тіла** — необов'язкових даних (JSON, форма).

Відповідь складається з **коду статусу**, **заголовків** і **тіла**.
`
    },
    {
      title: "2. Методи HTTP і коди статусу",
      content: `
### Методи

| Метод | Призначення | Безпечний | Ідемпотентний | Приклад |
| --- | --- | --- | --- | --- |
| **GET** | отримати ресурс | так | так | \`GET /users\` |
| **POST** | створити новий ресурс / виконати дію | ні | ні | \`POST /users\` |
| **PUT** | повністю замінити ресурс | ні | так | \`PUT /users/123\` |
| **PATCH** | частково змінити ресурс | ні | не обов'язково | \`PATCH /users/123\` |
| **DELETE** | видалити ресурс | ні | так | \`DELETE /users/123\` |

* **Безпечний** — не змінює стану сервера.
* **Ідемпотентний** — повторний запит дає той самий стан, що й один. Тому PUT і DELETE можна безпечно повторити після тайм-ауту, а POST — ні (буде два замовлення).

### Коди статусу

* **2xx — успіх**: \`200 OK\`; \`201 Created\` (після POST, з заголовком \`Location\`); \`204 No Content\` (успіх без тіла, часто після DELETE).
* **3xx — перенаправлення**: \`301 Moved Permanently\`, \`302 Found\`, \`304 Not Modified\` (кеш).
* **4xx — помилка клієнта**:
  * \`400 Bad Request\` — некоректні дані (зламаний JSON, помилка валідації);
  * \`401 Unauthorized\` — не автентифіковано (немає або неправильний токен);
  * \`403 Forbidden\` — автентифіковано, але немає прав;
  * \`404 Not Found\` — ресурсу немає;
  * \`409 Conflict\` — конфлікт стану (наприклад, такий email уже існує);
  * \`429 Too Many Requests\` — перевищено ліміт запитів.
* **5xx — помилка сервера**: \`500 Internal Server Error\` (неперехоплений виняток), \`502 Bad Gateway\`, \`503 Service Unavailable\`, \`504 Gateway Timeout\`.

> [!TIP]
> Простий спосіб запам'ятати: 4xx — «ви зробили щось не так», 5xx — «ми зробили щось не так». 4xx повторювати без змін безглуздо, а 503/504 часто має сенс повторити із затримкою.
`
    },
    {
      title: "3. REST API",
      content: `
**REST** (Representational State Transfer) — архітектурний стиль API поверх HTTP.

1. **Ресурси мають URI**: кожен об'єкт (користувач, товар, замовлення) має унікальну адресу.
2. **Дію визначає метод HTTP**, а не URL.
3. **Без стану (stateless)**: сервер не зберігає сесії між запитами. Кожен запит містить усе потрібне, зокрема токен у заголовку. Тому сервери легко масштабувати.
4. **Розділення клієнта і сервера**: фронтенд (React, Android) і бекенд (Java) спілкуються лише через HTTP.

### Добрі й погані ендпоінти

* ✅ \`GET /api/products\` — список
* ✅ \`GET /api/products?category=books&page=2&size=20\` — фільтрація і пагінація
* ✅ \`POST /api/products\` — створити
* ✅ \`GET /api/products/42\` — один товар
* ✅ \`PUT /api/products/42\` — замінити
* ✅ \`DELETE /api/products/42\` — видалити
* ✅ \`GET /api/users/7/orders\` — вкладений ресурс
* ❌ \`GET /api/getProducts\` — дія в URL
* ❌ \`POST /api/products/42/delete\` — для видалення є DELETE
* ❌ \`GET /api/products/42/remove\` — GET ніколи не змінює стану!

Назви ресурсів — **іменники в множині**.

### Формат помилки

Узгоджений формат помилок дуже полегшує життя клієнтам. Стандарт RFC 9457 (Problem Details):

\`\`\`json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "Поле 'email' має некоректний формат",
  "instance": "/api/users"
}
\`\`\`
`
    },
    {
      title: "4. JSON",
      content: `
Фронтенд і бекенд можуть бути написані різними мовами, тому об'єкти передають в універсальному текстовому форматі. Стандартом для API сьогодні є **JSON** (JavaScript Object Notation).

* **об'єкти** — \`{ }\`;
* **масиви** — \`[ ]\`;
* пари **ключ: значення**, де ключ **завжди** в подвійних лапках;
* значення: рядки (\`"..."\`), числа (без лапок), \`true\`, \`false\`, \`null\`, об'єкти, масиви.

\`\`\`json
{
  "id": 101,
  "name": "Ян Ковальський",
  "isActive": true,
  "balance": 1500.50,
  "roles": ["USER", "ADMIN"],
  "address": {
    "city": "Варшава",
    "street": "Вейська 1"
  },
  "department": null
}
\`\`\`

> [!WARNING]
> У JSON немає коментарів, дат і кінцевих ком. Дати передають рядком у форматі ISO-8601 (\`"2025-03-14T10:15:30Z"\`). Великі цілі числа (\`long\` > 2^53) JavaScript-клієнти читають з утратою точності, тому id іноді передають рядком.

Бібліотеки **Jackson** і **Gson** автоматично перетворюють JSON на Java-об'єкти і навпаки (лекція 10). Spring Boot використовує Jackson «під капотом».
`
    },
    {
      title: "5. Клієнт: HttpClient",
      content: `
\`\`\`java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class WeatherClient {
    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();                                    // один на весь застосунок

    public static String fetch(double lat, double lon) throws IOException, InterruptedException {
        URI uri = URI.create("https://api.open-meteo.com/v1/forecast"
                + "?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m");

        HttpRequest request = HttpRequest.newBuilder(uri)
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() / 100 != 2) {           // HttpClient НЕ кидає виняток для 4xx/5xx
            throw new IOException("HTTP " + response.statusCode() + ": " + response.body());
        }
        return response.body();
    }
}
\`\`\`

### Параметри запиту і кодування

\`\`\`java
String q = URLEncoder.encode("Нью-Йорк & околиці", StandardCharsets.UTF_8);
URI uri = URI.create("https://geocoding-api.open-meteo.com/v1/search?name=" + q);
\`\`\`

> [!CAUTION]
> Ніколи не вставляйте введення користувача в URL без \`URLEncoder.encode\`: пробіли, \`&\` чи \`#\` зламають запит або змінять його зміст.

### Повторні спроби

\`\`\`java
static HttpResponse<String> sendWithRetry(HttpRequest req, int maxAttempts) throws Exception {
    for (int attempt = 1; ; attempt++) {
        try {
            var resp = CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() < 500 || attempt == maxAttempts) return resp;
        } catch (HttpTimeoutException e) {
            if (attempt == maxAttempts) throw e;
        }
        Thread.sleep(200L * (1L << attempt));           // експоненційна затримка
    }
}
\`\`\`
`
    },
    {
      title: "6. Десеріалізація JSON через Jackson",
      content: `
### Залежність

\`\`\`xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.2</version>
</dependency>
\`\`\`

### Модель — records

Назви компонентів мають збігатися з ключами JSON (або задаватися через \`@JsonProperty\`):

\`\`\`java
@JsonIgnoreProperties(ignoreUnknown = true)      // не падати на зайвих полях
public record Forecast(double latitude, double longitude, Current current) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(String time,
                          @JsonProperty("temperature_2m") double temperature) { }
}
\`\`\`

\`\`\`java
ObjectMapper mapper = new ObjectMapper();
Forecast f = mapper.readValue(json, Forecast.class);
System.out.printf("Зараз %.1f°C%n", f.current().temperature());

// без класу-моделі — через дерево
JsonNode root = mapper.readTree(json);
double t = root.path("current").path("temperature_2m").asDouble(Double.NaN);

// серіалізація
String out = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(f);
\`\`\`

> [!NOTE]
> Для \`java.time\` (LocalDate, Instant) підключіть модуль \`jackson-datatype-jsr310\` і викличте \`mapper.findAndRegisterModules()\`.

Spring Boot робить усе це автоматично: перетворює тіло запиту на об'єкт (\`@RequestBody\`) і результат методу контролера на JSON. Але розуміння механізму незамінне під час налагодження.
`
    },
    {
      title: "7. Найпростіший HTTP-сервер без фреймворків",
      content: `
У JDK є вбудований легкий сервер \`com.sun.net.httpserver.HttpServer\`. Для production він не призначений, але для лабораторних, тестів і моків — ідеальний.

\`\`\`java
import com.sun.net.httpserver.*;

public class TodoServer {
    private static final Map<Integer, String> TODOS = new ConcurrentHashMap<>();
    private static final AtomicInteger IDS = new AtomicInteger();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        server.createContext("/todos", exchange -> {
            try (exchange) {
                switch (exchange.getRequestMethod()) {
                    case "GET" -> send(exchange, 200, TODOS.toString());
                    case "POST" -> {
                        String text = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                        int id = IDS.incrementAndGet();
                        TODOS.put(id, text);
                        exchange.getResponseHeaders().add("Location", "/todos/" + id);
                        send(exchange, 201, "{\\"id\\":" + id + "}");
                    }
                    default -> send(exchange, 405, "Method Not Allowed");
                }
            }
        });
        server.start();
        System.out.println("http://localhost:8080/todos");
    }

    private static void send(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
    }
}
\`\`\`

\`\`\`bash
curl -X POST -d "купити молоко" http://localhost:8080/todos
curl http://localhost:8080/todos
\`\`\`

Від Java 18 є ще й \`jwebserver\` — статичний файловий сервер одною командою.
`
    }
  ],
  quiz: [
    {
      question: "Який метод HTTP використати для часткового оновлення профілю користувача (лише телефон)?",
      options: ["POST", "PATCH", "GET", "UPDATE"],
      answer: 1,
      explanation: "PATCH змінює частину ресурсу, а PUT замінює ресурс повністю. Методу UPDATE у HTTP немає."
    },
    {
      question: "Клієнт звернувся до /api/users/999, а такого користувача немає. Який код статусу правильний?",
      options: ["200 OK", "400 Bad Request", "404 Not Found", "500 Internal Server Error"],
      answer: 2,
      explanation: "404 означає, що ресурсу не знайдено. 400 — некоректний запит, 500 — помилка в коді сервера."
    },
    {
      question: "Що означає принцип stateless у REST?",
      options: [
        "Сервер зберігає сесію для кожного клієнта",
        "Кожен запит містить усю потрібну інформацію (наприклад, токен), і сервер не покладається на збережену сесію",
        "Стан зберігається лише в cookie на сервері",
        "Сервер не має бази даних"
      ],
      answer: 1,
      explanation: "Будь-який екземпляр сервера може обробити будь-який запит, тому сервіс легко масштабувати горизонтально."
    },
    {
      question: "Які методи HTTP ідемпотентні?",
      options: [
        "Лише GET",
        "GET, PUT, DELETE",
        "POST і PATCH",
        "Усі"
      ],
      answer: 1,
      explanation: "Повтор PUT або DELETE залишає сервер у тому самому стані. Повтор POST зазвичай створює ще один ресурс."
    },
    {
      question: "HttpClient.send отримав відповідь 503. Що станеться?",
      options: [
        "Буде кинуто IOException",
        "Метод поверне HttpResponse зі statusCode() == 503; перевіряти статус потрібно самостійно",
        "Запит автоматично повториться",
        "Програма завершиться"
      ],
      answer: 1,
      explanation: "Винятки кидаються лише для мережевих помилок і тайм-аутів. HTTP-статус помилки — це звичайна відповідь."
    },
    {
      question: "Чому у Forecast використано @JsonIgnoreProperties(ignoreUnknown = true)?",
      options: [
        "Щоб пришвидшити парсинг",
        "Щоб десеріалізація не падала, коли в JSON є поля, яких немає в record",
        "Щоб ігнорувати null",
        "Без цього record не працює"
      ],
      answer: 1,
      explanation: "За замовчуванням Jackson кидає UnrecognizedPropertyException на невідомих полях. Зовнішні API часто повертають більше даних, ніж нам потрібно."
    }
  ]
};
