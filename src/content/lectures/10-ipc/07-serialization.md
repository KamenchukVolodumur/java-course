---
title: Серіалізація
description: Серіалізація й десеріалізація, Jackson — ObjectMapper, записи й java.time, анотації, налаштування й строгість, поліморфізм з дискримінатором і безпека, деревна модель і потоковий API; Gson; вбудована серіалізація Java і її небезпеки; XML і двійкові формати.
---

## Огляд

**Серіалізація** — перетворення об'єкта (його поточного стану в пам'яті) на формат, який легко зберегти чи передати: двійковий або текстовий, як-от JSON чи XML. **Десеріалізація** — зворотний процес, відтворення об'єкта з серіалізованої форми.

Основні застосування:

1. **Збереження.** Об'єкт записують у файл чи базу даних, а після перезапуску застосунку відтворюють у тому самому стані.
2. **Комунікація.** Один застосунок серіалізує об'єкт і надсилає його (каналом, через TCP, HTTP), а інший отримує дані й десеріалізує, відтворюючи вихідний об'єкт.

У стандартній бібліотеці Java немає API для JSON. Фактичний стандарт — бібліотека **Jackson** (`com.fasterxml.jackson.core:jackson-databind`), яку використовують Spring, Quarkus і більшість інших фреймворків. Популярна також компактніша **Gson** від Google. Обидві працюють «автомагічно» на основі **рефлексії**: під час виконання читають поля, геттери й конструктори класу і за ними будують JSON або створюють об'єкт. На процес впливають **анотаціями** на класах і їхніх членах.

> [!NOTE]
> Приклади нижче використовують Jackson 2.x — найпоширенішу гілку. Jackson 3 переніс класи в пакет `tools.jackson` і змінив кілька налаштувань за замовчуванням, але модель роботи та анотації ті самі.

## Jackson

Центральний клас — `ObjectMapper` (або його будівник `JsonMapper.builder()`). Він потокобезпечний і кешує метадані типів, тож його створюють **один раз** і використовують повторно.

```java
public record Forecast(String location, Map<OffsetDateTime, Double> temperatures, List<String> summary) { }
```

```java
static final JsonMapper MAPPER = JsonMapper.builder()
        .addModule(new JavaTimeModule())                            // підтримка java.time (jackson-datatype-jsr310)
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)    // дати як ISO-рядки, а не числа
        .enable(SerializationFeature.INDENT_OUTPUT)
        .build();
```

### Серіалізація

```java
String json = MAPPER.writeValueAsString(forecast);
MAPPER.writeValue(Path.of("forecast.json").toFile(), forecast);   // одразу у файл
```

```json
{
  "location" : "Warsaw",
  "temperatures" : {
    "2025-12-07T22:00+01:00" : 3.463462782637311,
    "2025-12-07T23:00+01:00" : -19.053981902530726,
    "2025-12-08T00:00+01:00" : -1.900355712285556
  },
  "summary" : [ "Hot", "Windy" ]
}
```

Jackson бере імена властивостей з **компонентів запису** або **геттерів** (`getLocation()` → `location`). Звичайні поля серіалізуються, лише якщо вони публічні.

### Десеріалізація

```java
Forecast forecast = MAPPER.readValue(json, Forecast.class);

List<Forecast> list = MAPPER.readValue(jsonArray, new TypeReference<List<Forecast>>() { });   // узагальнений тип
```

Через стирання типів `List<Forecast>.class` не існує, тому узагальнений тип передають анонімним підкласом `TypeReference`: його параметр типу зберігається в метаданих класу й доступний рефлексії.

Записи (records) Jackson створює через **канонічний конструктор**, а звичайні класи — через конструктор без параметрів і сетери або через конструктор, позначений `@JsonCreator`.

### Анотації

```java
@JsonInclude(JsonInclude.Include.NON_NULL)                 // не записувати null-властивості
@JsonIgnoreProperties(ignoreUnknown = true)                // ігнорувати невідомі властивості під час читання
public class Person {
    @JsonProperty("FirstName")                             // інше ім'я в JSON
    private String name;

    @JsonProperty                                          // приватне поле без геттера теж серіалізувати
    private LocalDate dateOfBirth;

    @JsonIgnore                                            // не серіалізувати
    private int age;

    @JsonFormat(pattern = "dd.MM.yyyy HH:mm")              // формат дати
    private LocalDateTime lastLogin;

    @JsonCreator
    public Person(@JsonProperty("FirstName") String name) { this.name = name; }
}
```

### Налаштування і строгість

Налаштування `ObjectMapper` визначають, наскільки строгим буде читання. Деякі за замовчуванням суворі, а деякі поблажливі:

```java
record User(String name, int age) { }
```

```java
String json = """
        {"name":"Ann","age":"25","email":"ann@example.com"}""";

MAPPER.readValue(json, User.class);
// UnrecognizedPropertyException: Unrecognized field "email" — FAIL_ON_UNKNOWN_PROPERTIES увімкнено

JsonMapper lenient = MAPPER.rebuild()                      // копія налаштувань
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        .build();
lenient.readValue(json, User.class);
// User[name=Ann, age=25] — рядок "25" перетворено на int (поблажливість за замовчуванням)
```

| Налаштування | За замовчуванням | Що робить |
| --- | --- | --- |
| `FAIL_ON_UNKNOWN_PROPERTIES` | увімкнено | невідома властивість JSON → виняток |
| `FAIL_ON_NULL_FOR_PRIMITIVES` | вимкнено | `null` або відсутнє значення для `int` → виняток (інакше 0) |
| `FAIL_ON_MISSING_CREATOR_PROPERTIES` | вимкнено | відсутній параметр конструктора → виняток (інакше `null`/0) |
| `FAIL_ON_TRAILING_TOKENS` | вимкнено | зайві дані після об'єкта → виняток |
| `StreamReadFeature.STRICT_DUPLICATE_DETECTION` | вимкнено | повторювана властивість → виняток (інакше «перемагає» останнє значення) |
| `MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES` | вимкнено | імена без урахування регістру |
| `PropertyNamingStrategies.SNAKE_CASE` | — | `firstName` ↔ `first_name` |

> [!TIP]
> Для даних з **ненадійних** джерел вмикайте строгі перевірки: відсутні обов'язкові властивості, дублікати й невідомі поля краще виявити одразу. Дублікати властивостей — відомий прийом атак, коли різні частини системи по-різному інтерпретують той самий документ.

### Поліморфізм

За замовчуванням об'єкт серіалізується за **фактичним** типом, але без інформації про тип: під час десеріалізації абстрактного типу Jackson не знає, який клас створити. Базовий тип перелічує дозволені підтипи анотаціями, і Jackson записує **дискримінатор типу**:

```java
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "kind")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Circle.class, name = "circle"),
        @JsonSubTypes.Type(value = Rectangle.class, name = "rectangle")
})
public sealed interface Shape permits Circle, Rectangle { }
public record Circle(double radius) implements Shape { }
public record Rectangle(double width, double height) implements Shape { }
```

```java
List<Shape> shapes = List.of(new Circle(1.5), new Rectangle(2, 3));
String json = MAPPER.writerFor(new TypeReference<List<Shape>>() { }).writeValueAsString(shapes);
// [{"kind":"circle","radius":1.5},{"kind":"rectangle","width":2.0,"height":3.0}]
List<Shape> back = MAPPER.readValue(json, new TypeReference<List<Shape>>() { });
// back.get(0) instanceof Circle c -> c.radius() == 1.5
```

Невідоме значення дискримінатора кидає виняток. Такий **список дозволених типів** — свідомий захід безпеки.

> [!CAUTION]
> Ніколи не використовуйте `JsonTypeInfo.Id.CLASS` чи `activateDefaultTyping` для даних з ненадійних джерел: тоді JSON містить повні імена класів, і зловмисник може змусити десеріалізатор створити довільний клас з classpath. Ланцюжки таких «гаджетів» призводили до виконання довільного коду: це десятки CVE у Jackson.

### Деревна модель і потоковий API

Коли структура JSON заздалегідь невідома або потрібна лише його частина, використовують **деревну модель** `JsonNode`:

```java
JsonNode root = MAPPER.readTree(json);
String location = root.get("location").asText();
double first = root.path("temperatures").elements().next().asDouble();
root.path("summary").forEach(tag -> System.out.println(tag.asText()));

ObjectNode node = MAPPER.createObjectNode().put("status", "ok").put("count", 3);
```

Для дуже великих документів — потоковий `JsonParser`, що читає токен за токеном, не будуючи об'єктів у пам'яті.

## Gson

```java
Gson gson = new GsonBuilder().setPrettyPrinting().create();
String json = gson.toJson(person);
Person back = gson.fromJson(json, Person.class);
List<Person> list = gson.fromJson(jsonArray, new TypeToken<List<Person>>() { }.getType());
```

Gson читає й пише **поля** напряму (усі, крім `transient` і `static`), ігноруючи геттери й конструктори. Інше ім'я задає `@SerializedName("FirstName")`, а виключення — `transient` або `@Expose`. Записи підтримуються з версії 2.10.

## Вбудована серіалізація Java

Java має власний двійковий механізм: клас реалізує маркерний інтерфейс `Serializable`, а `ObjectOutputStream`/`ObjectInputStream` записують і відтворюють **весь граф об'єктів**, зберігаючи посилання й цикли.

```java
public class Account implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;          // версія формату класу

    private String owner;
    private BigDecimal balance;
    private transient String sessionToken;                     // не серіалізується
}

try (var out = new ObjectOutputStream(Files.newOutputStream(Path.of("account.bin")))) {
    out.writeObject(account);
}
try (var in = new ObjectInputStream(Files.newInputStream(Path.of("account.bin")))) {
    Account restored = (Account) in.readObject();
}
```

* `serialVersionUID` перевіряється під час читання: якщо клас змінився несумісно і UID інший, буде `InvalidClassException`. Без явного UID він обчислюється з структури класу, і будь-яка зміна ламає читання старих даних.
* Записи серіалізуються безпечніше: відтворюються через канонічний конструктор з його перевірками.

> [!CAUTION]
> Вбудована серіалізація вважається **небезпечною й застарілою**. Десеріалізація викликає код класів з classpath (`readObject`, `readResolve`) **до** того, як програма отримає об'єкт, і на цьому побудовано багато атак з віддаленим виконанням коду. Ніколи не десеріалізуйте так дані з ненадійних джерел; якщо це неминуче, обмежте дозволені класи фільтром `ObjectInputFilter` (Java 9). Для нового коду обирайте JSON або схемні формати.

## Інші формати

* **XML** — `XmlMapper` з модуля `jackson-dataformat-xml` (ті самі анотації плюс `@JacksonXmlProperty`) або Jakarta XML Binding (JAXB) з анотаціями `@XmlRootElement`, `@XmlElement`.
* **YAML, CSV, CBOR, Smile** — модулі `jackson-dataformat-*` з тим самим API `ObjectMapper`.
* **Protocol Buffers, Avro** — компактні двійкові формати зі **схемою**: класи генеруються зі схеми, а формат підтримує еволюцію (додавання полів без поломки старих клієнтів). Використовуються в gRPC і Kafka.
