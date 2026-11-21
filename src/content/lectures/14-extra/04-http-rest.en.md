---
title: HTTP, REST and JSON
description: The basics of the HTTP protocol (methods, status codes, headers), the REST architecture and endpoint design, the JSON format, the HttpClient with error handling, deserialization with Jackson and the simplest HTTP server without frameworks.
---

## The HTTP Protocol

Before writing network services (e.g. with Spring Boot), you need to understand how programs communicate on the internet. Most often **HTTP** (HyperText Transfer Protocol) is used for this — a text protocol on top of TCP (the "TCP" page).

HTTP always works in the **client — server** model:

1. **The client** (a browser, a mobile app, another Java program) sends a **request**.
2. **The server** processes it and returns a **response**.

```text
POST /api/users HTTP/1.1                ← the method, path, version
Host: api.example.com                   ← headers
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
                                        ← an empty line
{"name": "Anna", "email": "a@x.pl"}     ← the body

HTTP/1.1 201 Created                    ← the version, status code
Location: /api/users/42
Content-Type: application/json

{"id": 42, "name": "Anna", "email": "a@x.pl"}
```

A request consists of:

* **a method** — *what* to do;
* **a URL** — *with which resource* (`/api/users/1?expand=orders`; after `?` — query parameters);
* **headers** — metadata (`Content-Type`, `Accept`, `Authorization`);
* **a body** — optional data (JSON, a form).

A response consists of a **status code**, **headers** and a **body**.

## HTTP Methods and Status Codes

### Methods

| Method | Purpose | Safe | Idempotent | Example |
| --- | --- | --- | --- | --- |
| **GET** | get a resource | yes | yes | `GET /users` |
| **POST** | create a new resource / perform an action | no | no | `POST /users` |
| **PUT** | replace a resource completely | no | yes | `PUT /users/123` |
| **PATCH** | modify a resource partially | no | not necessarily | `PATCH /users/123` |
| **DELETE** | delete a resource | no | yes | `DELETE /users/123` |

* **Safe** — does not change the server's state.
* **Idempotent** — a repeated request leads to the same state as a single one. That is why PUT and DELETE can be safely retried after a timeout, but POST cannot (there would be two orders).

### Status Codes

* **2xx — success**: `200 OK`; `201 Created` (after a POST, with a `Location` header); `204 No Content` (success without a body, often after a DELETE).
* **3xx — redirection**: `301 Moved Permanently`, `302 Found`, `304 Not Modified` (cache).
* **4xx — client error**:
  * `400 Bad Request` — invalid data (broken JSON, a validation error);
  * `401 Unauthorized` — not authenticated (no token or a wrong one);
  * `403 Forbidden` — authenticated, but without permission;
  * `404 Not Found` — the resource does not exist;
  * `409 Conflict` — a state conflict (e.g. such an e-mail already exists);
  * `429 Too Many Requests` — the request limit has been exceeded.
* **5xx — server error**: `500 Internal Server Error` (an uncaught exception), `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`.

> [!TIP]
> An easy way to remember: 4xx — "you did something wrong", 5xx — "we did something wrong". Retrying a 4xx without changes is pointless, while a 503/504 is often worth retrying after a delay.

## REST APIs

**REST** (Representational State Transfer) is an architectural style for APIs on top of HTTP.

1. **Resources have URIs**: every object (a user, a product, an order) has a unique address.
2. **The action is determined by the HTTP method**, not by the URL.
3. **Stateless**: the server does not keep sessions between requests. Each request contains everything needed, including a token in a header. That is why servers are easy to scale.
4. **Separation of client and server**: the frontend (React, Android) and the backend (Java) communicate only over HTTP.

### Good and Bad Endpoints

* ✅ `GET /api/products` — a list
* ✅ `GET /api/products?category=books&page=2&size=20` — filtering and pagination
* ✅ `POST /api/products` — create
* ✅ `GET /api/products/42` — one product
* ✅ `PUT /api/products/42` — replace
* ✅ `DELETE /api/products/42` — delete
* ✅ `GET /api/users/7/orders` — a nested resource
* ❌ `GET /api/getProducts` — an action in the URL
* ❌ `POST /api/products/42/delete` — there is DELETE for deletion
* ❌ `GET /api/products/42/remove` — GET never changes state!

Resource names are **plural nouns**.

### The Error Format

A consistent error format makes clients' lives much easier. The RFC 9457 standard (Problem Details):

```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "The 'email' field has an invalid format",
  "instance": "/api/users"
}
```

## JSON

The frontend and the backend may be written in different languages, so objects are transmitted in a universal text format. The standard for APIs today is **JSON** (JavaScript Object Notation).

* **objects** — `{ }`;
* **arrays** — `[ ]`;
* **key: value** pairs, where the key is **always** in double quotes;
* values: strings (`"..."`), numbers (without quotes), `true`, `false`, `null`, objects, arrays.

```json
{
  "id": 101,
  "name": "Jan Kowalski",
  "isActive": true,
  "balance": 1500.50,
  "roles": ["USER", "ADMIN"],
  "address": {
    "city": "Warsaw",
    "street": "Wiejska 1"
  },
  "department": null
}
```

> [!WARNING]
> JSON has no comments, no dates and no trailing commas. Dates are transmitted as strings in the ISO-8601 format (`"2025-03-14T10:15:30Z"`). JavaScript clients read large integers (`long` > 2^53) with a loss of precision, so ids are sometimes transmitted as strings.

The **Jackson** and **Gson** libraries automatically convert JSON into Java objects and back (the "Serialization" page). Spring Boot uses Jackson "under the hood".

## The Client: HttpClient

```java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class WeatherClient {
    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();                                    // one for the whole application

    public static String fetch(double lat, double lon) throws IOException, InterruptedException {
        URI uri = URI.create("https://api.open-meteo.com/v1/forecast"
                + "?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m");

        HttpRequest request = HttpRequest.newBuilder(uri)
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() / 100 != 2) {           // HttpClient does NOT throw an exception for 4xx/5xx
            throw new IOException("HTTP " + response.statusCode() + ": " + response.body());
        }
        return response.body();
    }
}
```

### Query Parameters and Encoding

```java
String q = URLEncoder.encode("New York & surroundings", StandardCharsets.UTF_8);
URI uri = URI.create("https://geocoding-api.open-meteo.com/v1/search?name=" + q);
```

> [!CAUTION]
> Never insert user input into a URL without `URLEncoder.encode`: spaces, `&` or `#` will break the request or change its meaning.

### Retries

```java
static HttpResponse<String> sendWithRetry(HttpRequest req, int maxAttempts) throws Exception {
    for (int attempt = 1; ; attempt++) {
        try {
            var resp = CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() < 500 || attempt == maxAttempts) return resp;
        } catch (HttpTimeoutException e) {
            if (attempt == maxAttempts) throw e;
        }
        Thread.sleep(200L * (1L << attempt));           // exponential backoff
    }
}
```

## Deserializing JSON with Jackson

### The Dependency

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.2</version>
</dependency>
```

### The Model — Records

The component names must match the JSON keys (or be set with `@JsonProperty`):

```java
@JsonIgnoreProperties(ignoreUnknown = true)      // do not fail on extra fields
public record Forecast(double latitude, double longitude, Current current) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(String time,
                          @JsonProperty("temperature_2m") double temperature) { }
}
```

```java
ObjectMapper mapper = new ObjectMapper();
Forecast f = mapper.readValue(json, Forecast.class);
System.out.printf("It is %.1f°C now%n", f.current().temperature());

// without a model class — through the tree
JsonNode root = mapper.readTree(json);
double t = root.path("current").path("temperature_2m").asDouble(Double.NaN);

// serialization
String out = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(f);
```

> [!NOTE]
> For `java.time` (LocalDate, Instant), add the `jackson-datatype-jsr310` module and call `mapper.findAndRegisterModules()`.

Spring Boot does all of this automatically: it converts the request body into an object (`@RequestBody`) and the controller method's result into JSON. But understanding the mechanism is indispensable when debugging.

## The Simplest HTTP Server without Frameworks

The JDK has a built-in lightweight server, `com.sun.net.httpserver.HttpServer`. It is not meant for production, but it is ideal for labs, tests and mocks.

```java
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
                        send(exchange, 201, "{\"id\":" + id + "}");
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
```

```bash
curl -X POST -d "buy milk" http://localhost:8080/todos
curl http://localhost:8080/todos
```

Since Java 18 there is also `jwebserver` — a static file server in one command.
