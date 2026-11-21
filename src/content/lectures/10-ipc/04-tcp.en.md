---
title: TCP
description: The TCP protocol and its guarantees, ServerSocket and Socket, a server with a virtual thread per client, clean shutdown, message boundaries (framing), buffering of readers and writers, timeouts, the client, non-blocking NIO with a Selector.
---

## The Protocol

**TCP** (Transmission Control Protocol) is one of the foundations of the internet. It is **connection-oriented**: before exchanging data, the client and server establish a connection (a "handshake"). TCP guarantees **reliable and ordered** delivery: lost segments are retransmitted, duplicates are discarded, and the transmission rate adapts to the network and the receiver. That is why TCP is used where data integrity matters: file transfer, e-mail, HTTP.

In Java, TCP is served by classes of the `java.net` package:

* `ServerSocket` — on the server side: listens on a port and accepts connections;
* `Socket` — a single connection; on the server it is returned by `accept()`, on the client it is created with the server's address.

After connecting, both sides work with a pair of streams `getInputStream()`/`getOutputStream()`, which are usually wrapped in a text reader and writer.

## Message Boundaries

TCP transmits **a continuous byte stream** and **does not preserve message boundaries**: data written in one operation may arrive in several parts, and data from several writes may arrive in one. That is why the application protocol must define where a message ends (**framing**):

* with a **delimiter** — e.g. a newline character (as in the example below, in HTTP/1.1, SMTP);
* with a **length prefix** — first the length, then that many bytes (`DataOutputStream.writeInt(length)` and `write(bytes)`, on the other side `readInt()` and `readFully(buffer)`).

> [!WARNING]
> `BufferedReader` and buffered writers have **internal buffers**. A `BufferedReader` may read more bytes from the socket than the line it returns; the rest waits in its buffer. That is why, once a `BufferedReader` has been created, all further reading must go through it: reading directly from the socket's stream would skip the buffered data. A writer sends data only after its buffer is flushed, hence `new PrintWriter(out, true)` (autoFlush for `println`) or an explicit `flush()`. Text wrappers suit protocols where every message is a line best. For protocols that mix text and binary data, `DataInputStream`/`DataOutputStream` with exact control over every byte are better.

## The Server

The example's protocol is very simple: the client sends the text commands `date`, `time` or `exit`, and the server replies with the corresponding line. In real applications protocols are more complex and are often based on JSON or binary structures.

The server accepts connections in a loop and starts **a separate virtual thread** for each client, so it serves many clients at once while the client-handling code stays simple and sequential.

```java
public class Server {
    static final int PORT = 5000;

    public static void main(String[] args) throws Exception {
        try (ServerSocket listener = new ServerSocket(PORT, 10);               // backlog: the connection queue
             ExecutorService clients = Executors.newVirtualThreadPerTaskExecutor()) {

            Thread.ofVirtual().start(() -> {                                   // stop on Enter
                System.out.println("Press Enter to exit");
                new Scanner(System.in).nextLine();
                try { listener.close(); } catch (IOException ignored) { }      // accept() will throw SocketException
            });

            while (true) {
                Socket client;
                try {
                    client = listener.accept();                                // waits for a client
                } catch (SocketException e) {
                    break;                                                     // the listener is closed
                }
                clients.submit(() -> handleClient(client));
            }
        }                                                                      // close(): waits for the clients
    }

    static void handleClient(Socket socket) {
        System.out.println("New client: " + socket.getRemoteSocketAddress());
        try (socket;
             BufferedReader reader = new BufferedReader(
                     new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
             PrintWriter writer = new PrintWriter(
                     new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true)) {

            socket.setSoTimeout((int) Duration.ofMinutes(5).toMillis());       // an idle client -> timeout
            String command;
            while ((command = reader.readLine()) != null) {                    // null: the client closed the connection
                System.out.println("Command: " + command);
                switch (command) {
                    case "date" -> writer.println(LocalDate.now());
                    case "time" -> writer.println(LocalTime.now().truncatedTo(ChronoUnit.MINUTES));
                    case "exit" -> { return; }
                    default -> writer.println("Unknown command");
                }
            }
        } catch (SocketTimeoutException e) {
            System.out.println("The client is idle, disconnecting");
        } catch (IOException e) {
            System.out.println("The client disconnected abruptly: " + e.getMessage());
        } finally {
            System.out.println("Client disconnected");
        }
    }
}
```

Important details:

* **Shutdown.** `accept()` is a blocking call, and it cannot be interrupted with `interrupt()`. The standard way is to close the `ServerSocket` from another thread: `accept()` throws a `SocketException`, and the loop ends. The try-with-resources block with the executor then waits until the client handlers finish their work.
* **`try (socket; ...)`** — an already created resource can be passed to try-with-resources (Java 9) so that it is closed at the end of handling.
* **The read timeout** `setSoTimeout` limits the waiting time in `read`/`readLine`: after it a `SocketTimeoutException` is thrown. Without it a "hung" client would occupy a handler forever.
* **An abrupt disconnection** (the client closed without `exit`, the network disappeared) shows up as an `IOException` (e.g. `Connection reset`) in `readLine` or during a write.

## The Client

The client initiates the connection with the server's address and port, and works with the streams just like the server:

```java
public class Client {
    static final int PORT = 5000;

    public static void main(String[] args) throws IOException {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(InetAddress.getLoopbackAddress(), PORT),
                    (int) Duration.ofSeconds(3).toMillis());          // the connection timeout
            System.out.println("Connected to " + socket.getRemoteSocketAddress());

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            PrintWriter writer = new PrintWriter(
                    new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);
            BufferedReader console = new BufferedReader(new InputStreamReader(System.in));

            String line;
            while ((line = console.readLine()) != null) {
                writer.println(line);
                String response = reader.readLine();
                if (response == null) break;                         // the server closed the connection
                System.out.println(response);
            }
        } catch (ConnectException e) {
            System.out.println("The server is unavailable: " + e.getMessage());   // Connection refused
        }
    }
}
```

A sample session (user input interleaved with the replies):

```text
Connected to localhost/127.0.0.1:5000
date
2026-11-20
time
18:40
hello
Unknown command
exit
```

## Socket Options

| Method | Purpose |
| --- | --- |
| `setSoTimeout(ms)` | the timeout of a blocking read |
| `setTcpNoDelay(true)` | turn off Nagle's algorithm: small messages go out immediately, without accumulation (interactive protocols, games) |
| `setKeepAlive(true)` | periodically check whether the other side is alive |
| `shutdownOutput()` | close only the write direction: the other side gets the end of the stream, but the reply can still be read |
| `setReuseAddress(true)` | (on a `ServerSocket`) allow rebinding to the port right after the server restarts |

## Non-Blocking I/O

The "thread per connection" model with virtual threads scales to hundreds of thousands of clients. Before virtual threads, **non-blocking** NIO I/O was used for this: one thread watches many channels through a `Selector` and handles only those that are ready for reading or writing. Netty, Undertow and Vert.x are built on it.

```java
try (Selector selector = Selector.open();
     ServerSocketChannel server = ServerSocketChannel.open()) {
    server.bind(new InetSocketAddress(5000));
    server.configureBlocking(false);
    server.register(selector, SelectionKey.OP_ACCEPT);
    ByteBuffer buffer = ByteBuffer.allocate(1024);

    while (true) {
        selector.select();                                         // waits until some channel is ready
        Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
        while (keys.hasNext()) {
            SelectionKey key = keys.next();
            keys.remove();
            if (key.isAcceptable()) {
                SocketChannel client = server.accept();
                client.configureBlocking(false);
                client.register(selector, SelectionKey.OP_READ);
            } else if (key.isReadable()) {
                SocketChannel client = (SocketChannel) key.channel();
                buffer.clear();
                if (client.read(buffer) == -1) {                   // the client closed the connection
                    client.close();
                    continue;
                }
                buffer.flip();
                client.write(buffer);                              // echo (simplified: write may not write everything)
            }
        }
    }
}
```

This code is more complex: each client's state has to be kept explicitly rather than in the thread's local variables. That is why for new code without special requirements it is simpler to write blocking code on virtual threads.
