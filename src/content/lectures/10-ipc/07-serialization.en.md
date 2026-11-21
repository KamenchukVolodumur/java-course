---
title: Serialization
description: Serialization and deserialization, Jackson — ObjectMapper, records and java.time, annotations, settings and strictness, polymorphism with a discriminator and security, the tree model and the streaming API; Gson; built-in Java serialization and its dangers; XML and binary formats.
---

## Overview

**Serialization** is converting an object (its current state in memory) into a format that is easy to store or transmit: binary or textual, such as JSON or XML. **Deserialization** is the reverse process, recreating an object from its serialized form.

The main applications:

1. **Persistence.** An object is written to a file or a database and recreated in the same state after the application restarts.
2. **Communication.** One application serializes an object and sends it (through a pipe, over TCP, over HTTP), and another receives the data and deserializes it, recreating the original object.

The Java standard library has no JSON API. The de facto standard is the **Jackson** library (`com.fasterxml.jackson.core:jackson-databind`), used by Spring, Quarkus and most other frameworks. Google's more compact **Gson** is also popular. Both work "automagically" based on **reflection**: at run time they read a class's fields, getters and constructors and use them to build JSON or create an object. The process is influenced with **annotations** on classes and their members.

> [!NOTE]
> The examples below use Jackson 2.x — the most widespread line. Jackson 3 moved the classes to the `tools.jackson` package and changed several defaults, but the working model and the annotations are the same.

## Jackson

The central class is `ObjectMapper` (or its builder `JsonMapper.builder()`). It is thread-safe and caches type metadata, so it is created **once** and reused.

```java
public record Forecast(String location, Map<OffsetDateTime, Double> temperatures, List<String> summary) { }
```

```java
static final JsonMapper MAPPER = JsonMapper.builder()
        .addModule(new JavaTimeModule())                            // java.time support (jackson-datatype-jsr310)
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)    // dates as ISO strings, not numbers
        .enable(SerializationFeature.INDENT_OUTPUT)
        .build();
```

### Serialization

```java
String json = MAPPER.writeValueAsString(forecast);
MAPPER.writeValue(Path.of("forecast.json").toFile(), forecast);   // straight into a file
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

Jackson takes property names from **record components** or **getters** (`getLocation()` → `location`). Ordinary fields are serialized only if they are public.

### Deserialization

```java
Forecast forecast = MAPPER.readValue(json, Forecast.class);

List<Forecast> list = MAPPER.readValue(jsonArray, new TypeReference<List<Forecast>>() { });   // a generic type
```

Because of type erasure there is no `List<Forecast>.class`, so a generic type is passed as an anonymous subclass of `TypeReference`: its type parameter is kept in the class metadata and is available to reflection.

Jackson creates records through the **canonical constructor**, and ordinary classes through a parameterless constructor and setters, or through a constructor annotated with `@JsonCreator`.

### Annotations

```java
@JsonInclude(JsonInclude.Include.NON_NULL)                 // do not write null properties
@JsonIgnoreProperties(ignoreUnknown = true)                // ignore unknown properties when reading
public class Person {
    @JsonProperty("FirstName")                             // a different name in JSON
    private String name;

    @JsonProperty                                          // serialize a private field without a getter too
    private LocalDate dateOfBirth;

    @JsonIgnore                                            // do not serialize
    private int age;

    @JsonFormat(pattern = "dd.MM.yyyy HH:mm")              // the date format
    private LocalDateTime lastLogin;

    @JsonCreator
    public Person(@JsonProperty("FirstName") String name) { this.name = name; }
}
```

### Settings and Strictness

The `ObjectMapper` settings determine how strict reading is. Some are strict by default, and some are lenient:

```java
record User(String name, int age) { }
```

```java
String json = """
        {"name":"Ann","age":"25","email":"ann@example.com"}""";

MAPPER.readValue(json, User.class);
// UnrecognizedPropertyException: Unrecognized field "email" — FAIL_ON_UNKNOWN_PROPERTIES is enabled

JsonMapper lenient = MAPPER.rebuild()                      // a copy of the settings
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        .build();
lenient.readValue(json, User.class);
// User[name=Ann, age=25] — the string "25" was converted to an int (leniency by default)
```

| Setting | Default | What it does |
| --- | --- | --- |
| `FAIL_ON_UNKNOWN_PROPERTIES` | enabled | an unknown JSON property → an exception |
| `FAIL_ON_NULL_FOR_PRIMITIVES` | disabled | `null` or a missing value for an `int` → an exception (otherwise 0) |
| `FAIL_ON_MISSING_CREATOR_PROPERTIES` | disabled | a missing constructor parameter → an exception (otherwise `null`/0) |
| `FAIL_ON_TRAILING_TOKENS` | disabled | extra data after the object → an exception |
| `StreamReadFeature.STRICT_DUPLICATE_DETECTION` | disabled | a repeated property → an exception (otherwise the last value "wins") |
| `MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES` | disabled | case-insensitive names |
| `PropertyNamingStrategies.SNAKE_CASE` | — | `firstName` ↔ `first_name` |

> [!TIP]
> For data from **untrusted** sources, turn on strict checks: missing required properties, duplicates and unknown fields are better detected right away. Duplicate properties are a known attack technique in which different parts of a system interpret the same document differently.

### Polymorphism

By default an object is serialized according to its **actual** type, but without type information: when deserializing an abstract type, Jackson does not know which class to create. The base type lists the allowed subtypes with annotations, and Jackson writes a **type discriminator**:

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

An unknown discriminator value throws an exception. Such an **allow-list of types** is a deliberate security measure.

> [!CAUTION]
> Never use `JsonTypeInfo.Id.CLASS` or `activateDefaultTyping` for data from untrusted sources: then the JSON contains fully qualified class names, and an attacker can make the deserializer create an arbitrary class from the classpath. Chains of such "gadgets" have led to arbitrary code execution: dozens of CVEs in Jackson.

### The Tree Model and the Streaming API

When the structure of the JSON is not known in advance or only part of it is needed, the **tree model** `JsonNode` is used:

```java
JsonNode root = MAPPER.readTree(json);
String location = root.get("location").asText();
double first = root.path("temperatures").elements().next().asDouble();
root.path("summary").forEach(tag -> System.out.println(tag.asText()));

ObjectNode node = MAPPER.createObjectNode().put("status", "ok").put("count", 3);
```

For very large documents there is the streaming `JsonParser`, which reads token by token without building objects in memory.

## Gson

```java
Gson gson = new GsonBuilder().setPrettyPrinting().create();
String json = gson.toJson(person);
Person back = gson.fromJson(json, Person.class);
List<Person> list = gson.fromJson(jsonArray, new TypeToken<List<Person>>() { }.getType());
```

Gson reads and writes **fields** directly (all except `transient` and `static`), ignoring getters and constructors. A different name is set with `@SerializedName("FirstName")`, and exclusion with `transient` or `@Expose`. Records are supported since version 2.10.

## Built-in Java Serialization

Java has its own binary mechanism: a class implements the `Serializable` marker interface, and `ObjectOutputStream`/`ObjectInputStream` write and recreate **the whole object graph**, preserving references and cycles.

```java
public class Account implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;          // the version of the class format

    private String owner;
    private BigDecimal balance;
    private transient String sessionToken;                     // not serialized
}

try (var out = new ObjectOutputStream(Files.newOutputStream(Path.of("account.bin")))) {
    out.writeObject(account);
}
try (var in = new ObjectInputStream(Files.newInputStream(Path.of("account.bin")))) {
    Account restored = (Account) in.readObject();
}
```

* `serialVersionUID` is checked when reading: if the class has changed incompatibly and the UID differs, an `InvalidClassException` is thrown. Without an explicit UID it is computed from the class structure, and any change breaks reading old data.
* Records are serialized more safely: they are recreated through the canonical constructor with its checks.

> [!CAUTION]
> Built-in serialization is considered **dangerous and outdated**. Deserialization runs code of classes from the classpath (`readObject`, `readResolve`) **before** the program gets the object, and many remote code execution attacks are built on this. Never deserialize data from untrusted sources this way; if it is unavoidable, restrict the allowed classes with an `ObjectInputFilter` (Java 9). For new code choose JSON or schema-based formats.

## Other Formats

* **XML** — `XmlMapper` from the `jackson-dataformat-xml` module (the same annotations plus `@JacksonXmlProperty`) or Jakarta XML Binding (JAXB) with the `@XmlRootElement`, `@XmlElement` annotations.
* **YAML, CSV, CBOR, Smile** — `jackson-dataformat-*` modules with the same `ObjectMapper` API.
* **Protocol Buffers, Avro** — compact binary formats with a **schema**: classes are generated from the schema, and the format supports evolution (adding fields without breaking old clients). They are used in gRPC and Kafka.
