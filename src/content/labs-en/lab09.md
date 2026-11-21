---
title: Lab 09: Networking and Serialization — a TCP Chat with Weather
description: A messaging protocol on sealed records serialized to JSON (one object per line), a multi-client TCP server with a thread per client, message broadcasting, a client with a background reader and a BlockingQueue, and a /weather command that calls a REST API through HttpClient and CompletableFuture.
---

## Before You Start

> [!NOTE]
> **Lectures:** 09.3 "Asynchronous Programming", 09.5 "Virtual Threads", 10.4 "TCP", 10.7 "Serialization", 12.5 "Thread-Safe Collections", 14.4 "HTTP, REST and JSON" · **Time:** 3 h · **Points:** 10

```text
          TCP, JSON lines                     HTTPS
ChatClient ◄─────────────► ChatServer ──────────────► api.open-meteo.com
ChatClient ◄─────────────►    │  ClientHandler (a thread per client)
                              └─ WeatherProvider (an interface; a fake in tests)
```

```text
src/main/java/pl/mini/chat/
├── Message.java  MessageCodec.java  ProtocolException.java
├── ChatServer.java  ClientHandler.java  ChatClient.java
├── WeatherProvider.java  OpenMeteoProvider.java
└── Main.java   (given)
```

### The JSON Dependency

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.2</version>
</dependency>
```

You may use Gson or write your own minimal codec: only the wire format matters.

### Rules

* The encoding in sockets is **UTF-8**, and always explicit.
* The server **does not crash** because of one client: any error in a client handler closes only that connection.
* All sockets and threads are closed (`ChatServer` and `ChatClient` implement `AutoCloseable`).

> [!CAUTION]
> `ObjectOutputStream`/`ObjectInputStream` (Java's built-in serialization) are forbidden: data from the network is never deserialized this way (see the "Serialization" page).

## A Quick Theory Recap

### Framing: One JSON per Line

TCP is a stream of bytes without message boundaries. The simplest framing protocol: **each message is one line of JSON** ending with `\n`. A JSON encoder escapes line breaks inside strings as `\n`, so a real line break cannot appear inside a message.

```text
{"type":"join","user":"ann"}
{"type":"say","user":"ann","text":"hi"}
```

### Polymorphic JSON in Jackson

```java
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
```

### The Server: a Thread per Client

```java
ServerSocket server = new ServerSocket(0);        // 0 = any free port
int port = server.getLocalPort();
Thread.ofPlatform().daemon().start(() -> {        // the accept loop in the background (Java 21; on 17 use new Thread)
    while (!server.isClosed()) {
        Socket s = server.accept();
        executor.submit(() -> handle(s));
    }
});
```

### The Client: a Background Reader + a Queue

```java
BlockingQueue<Message> inbox = new LinkedBlockingQueue<>();
// the reader thread: reads lines from the socket, decodes them, puts them into inbox
Message m = inbox.poll(2, TimeUnit.SECONDS);      // null after the timeout
```

## The Expected Output

This is what `Main` from the starter project prints once all the stages are uncommented:

```text
true
Say[user=ann, text=hello "everyone"]
OK: ProtocolException
Info[text=welcome, ann! online: 1]
Info[text=welcome, bob! online: 2]
Info[text=bob joined]
Say[user=ann, text=hi]
Info[text=Warsaw: 12.5°C]
Error[reason=no data for Atlantis]
Error[reason=name ann is taken]
Info[text=bob left]
silence: true
```

> [!NOTE]
> Stages 2–5 are checked by one block: uncomment it after stage 2 and add the lines of the following stages gradually.

## Stage 1: The Protocol and Serialization (2 pts)

```java
public sealed interface Message {
    record Join(String user) implements Message { }
    record Say(String user, String text) implements Message { }
    record Leave(String user) implements Message { }
    record Info(String text) implements Message { }       // server -> client
    record Error(String reason) implements Message { }    // server -> client
}

public class ProtocolException extends Exception { ... }

public final class MessageCodec {
    public static String encode(Message m);                        // one line without a trailing \n
    public static Message decode(String line) throws ProtocolException;
}
```

* The format: `{"type":"<join|say|leave|info|error>", ...the record fields}`.
* `decode` throws a `ProtocolException` for malformed JSON, an unknown type or a missing required field (`null` in `user`/`text` is an error too). Keep the reason (the Jackson exception) as the `cause`.
* Create the `ObjectMapper` **once** (`static final`): it is thread-safe after configuration and expensive to create.

> [!TIP]
> `Message.Error` clashes by name with `java.lang.Error`. The import `pl.mini.chat.Message.*` does **not** resolve this: both it and the implicit `java.lang.*` are on-demand imports, so the compiler reports "reference to Error is ambiguous". You need a single-type import, `import pl.mini.chat.Message.Error;`, as in `Main`, or the full name `Message.Error`.

## Stage 2: The Server and Joining (2 pts)

```java
public class ChatServer implements AutoCloseable {
    public ChatServer(int port, WeatherProvider weather);
    public void start() throws IOException;       // opens the ServerSocket and starts the accept loop in the background
    public int port();                            // the actual port (important for port = 0)
    @Override public void close();                // closes the ServerSocket, all clients and the pool
}
```

* Each client is served by a separate task in a pool (`newVirtualThreadPerTaskExecutor` in Java 21 or `newCachedThreadPool`).
* The first message from a client **must** be a `Join`. Otherwise the server replies `Error("join first")` and closes the connection.
* After a successful `Join` the client receives `Info("welcome, <user>! online: <N>")`.
* A malformed line from a client (a `ProtocolException`) → `Error("malformed message")`; the connection is **not** closed.

> [!IMPORTANT]
> Create the `PrintWriter` with `autoFlush = true` or call `flush()` after every message. Without this the reply stays in the buffer, and the client waits forever (see the "TCP" page).

## Stage 3: Broadcasting (2 pts)

* Active clients live in a `ConcurrentHashMap<String, ClientHandler>` (the key is the name).
* A `Say` from a user is sent to **all others** (not to the sender). The server sets the `user` field of the broadcast message itself — from the name in the `Join`, not from what the client sent. Otherwise anyone could write on behalf of someone else.
* After a `Join` the other users receive `Info("<user> joined")`.
* A `Leave` **or** a dropped connection (EOF, `IOException`) → removal from the map and `Info("<user> left")` to everyone. The broadcast must happen **exactly once**, even if the client sent `Leave` and then closed the socket.

> [!WARNING]
> Writing to a client's socket from **several** threads at once (broadcasts from different senders) can interleave the bytes of two messages in one line. Make the `ClientHandler.send(Message)` method `synchronized` (or use a separate lock on the writer).

## Stage 4: The Client and Unique Names (2 pts)

```java
public class ChatClient implements AutoCloseable {
    public ChatClient(String host, int port) throws IOException;   // starts the reader thread
    public void send(Message m);
    public Optional<Message> poll(Duration timeout) throws InterruptedException;
    public Message receive() throws InterruptedException;          // poll(2 s) or IllegalStateException("no response")
    @Override public void close();
}
```

* The reader thread (a daemon) reads lines, decodes them and puts them into a `LinkedBlockingQueue`. After the socket is closed the thread must finish **without** a stack trace in the console.
* On the server: a `Join` with a name that is already taken → `Error("name <user> is taken")` and the connection is closed. The check and the registration must be **atomic**: `putIfAbsent`, not `containsKey` + `put`.

> [!TIP]
> Check the atomicity with a test: 20 clients join with the same name simultaneously (on the signal of a `CountDownLatch`). Exactly one must succeed.

## Stage 5: The /weather Command (2 pts)

```java
@FunctionalInterface
public interface WeatherProvider {
    CompletableFuture<Double> currentTemperature(String city);   // NaN if the city is not found
}
```

* If the text of a `Say` starts with `/weather `, the server does **not** broadcast the message. It queries the provider asynchronously and replies **only to the sender**: `Info("<city>: <t>°C")` (one digit after the decimal point, `Locale.ROOT`) or `Error("no data for <city>")` if the result is `NaN`, an error occurred or the 3 s timeout passed (`orTimeout`).
* The client handler thread is **not blocked** waiting for the weather: the reply is sent in `thenAccept`/`whenComplete`.

### The Real Provider: OpenMeteoProvider

```java
public class OpenMeteoProvider implements WeatherProvider {
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    // 1) https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1   -> results[0].latitude/longitude
    // 2) https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m
    //    -> current.temperature_2m
}
```

* Combine the two requests with `thenCompose` (the second depends on the result of the first).
* Encode the city name with `URLEncoder.encode(city, UTF_8)`.
* A status ≠ 200 or empty `results` → `NaN`.
* Run `ChatServer` with `OpenMeteoProvider` by hand (for example, `main` in a separate `ServerApp` class) and chat with two clients from the terminal.

> [!NOTE]
> Why is the provider in `Main` a fake? A test that depends on the internet and the current weather is not repeatable (FIRST, see the "Testing with JUnit 5" page). The `WeatherProvider` interface is the boundary at which we substitute the outside world.

Commit, tag it `lab09` and push.
