---
title: TCP
description: Протокол TCP і його гарантії, ServerSocket і Socket, сервер з віртуальним потоком на клієнта, коректне завершення, межі повідомлень (framing), буферизація читачів і записувачів, тайм-аути, клієнт, неблокувальний NIO з Selector.
---

## Протокол

**TCP** (Transmission Control Protocol) — одна з основ інтернету. Він **орієнтований на з'єднання**: перш ніж обмінюватися даними, клієнт і сервер встановлюють з'єднання («рукостискання»). TCP гарантує **надійну й упорядковану** доставку: втрачені сегменти передаються повторно, дублікати відкидаються, а швидкість передачі пристосовується до мережі й отримувача. Тому TCP використовують там, де важлива цілісність даних: передача файлів, пошта, HTTP.

У Java TCP обслуговують класи пакета `java.net`:

* `ServerSocket` — на боці сервера: слухає порт і приймає з'єднання;
* `Socket` — одне з'єднання; на сервері його повертає `accept()`, на клієнті його створюють, указавши адресу сервера.

Після з'єднання обидві сторони працюють з парою потоків `getInputStream()`/`getOutputStream()`, які зазвичай обгортають текстовими читачем і записувачем.

## Межі повідомлень

TCP передає **неперервний потік байтів** і **не зберігає меж повідомлень**: дані, записані однією операцією, можуть надійти кількома частинами, а дані кількох записів — однією. Тому прикладний протокол мусить визначати, де закінчується повідомлення (**framing**):

* **роздільником** — наприклад, символом нового рядка (як у прикладі нижче, у HTTP/1.1, SMTP);
* **префіксом довжини** — спершу довжина, потім стільки байтів (`DataOutputStream.writeInt(length)` і `write(bytes)`, на іншому боці `readInt()` і `readFully(buffer)`).

> [!WARNING]
> `BufferedReader` і буферизовані записувачі мають **внутрішні буфери**. `BufferedReader` може прочитати з сокета більше байтів, ніж повертає рядок; решта чекає в його буфері. Тому після створення `BufferedReader` усе подальше читання має йти через нього: читання напряму з потоку сокета пропустить буферизовані дані. Записувач надсилає дані лише після спорожнення буфера, звідси `new PrintWriter(out, true)` (autoFlush для `println`) або явний `flush()`. Текстові обгортки найкраще підходять для протоколів, де кожне повідомлення — рядок. Для протоколів, що змішують текст і двійкові дані, краще `DataInputStream`/`DataOutputStream` з точним контролем над кожним байтом.

## Сервер

Протокол прикладу дуже простий: клієнт надсилає текстові команди `date`, `time` або `exit`, а сервер відповідає відповідним рядком. У реальних застосунках протоколи складніші й часто базуються на JSON або двійкових структурах.

Сервер приймає з'єднання в циклі і для кожного клієнта запускає **окремий віртуальний потік**, тож обслуговує багато клієнтів одночасно, а код обробки клієнта залишається простим і послідовним.

```java
public class Server {
    static final int PORT = 5000;

    public static void main(String[] args) throws Exception {
        try (ServerSocket listener = new ServerSocket(PORT, 10);               // backlog: черга з'єднань
             ExecutorService clients = Executors.newVirtualThreadPerTaskExecutor()) {

            Thread.ofVirtual().start(() -> {                                   // зупинка за Enter
                System.out.println("Натисніть Enter, щоб завершити");
                new Scanner(System.in).nextLine();
                try { listener.close(); } catch (IOException ignored) { }      // accept() кине SocketException
            });

            while (true) {
                Socket client;
                try {
                    client = listener.accept();                                // чекає на клієнта
                } catch (SocketException e) {
                    break;                                                     // слухача закрито
                }
                clients.submit(() -> handleClient(client));
            }
        }                                                                      // close(): чекає на клієнтів
    }

    static void handleClient(Socket socket) {
        System.out.println("Новий клієнт: " + socket.getRemoteSocketAddress());
        try (socket;
             BufferedReader reader = new BufferedReader(
                     new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
             PrintWriter writer = new PrintWriter(
                     new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true)) {

            socket.setSoTimeout((int) Duration.ofMinutes(5).toMillis());       // неактивний клієнт -> тайм-аут
            String command;
            while ((command = reader.readLine()) != null) {                    // null: клієнт закрив з'єднання
                System.out.println("Команда: " + command);
                switch (command) {
                    case "date" -> writer.println(LocalDate.now());
                    case "time" -> writer.println(LocalTime.now().truncatedTo(ChronoUnit.MINUTES));
                    case "exit" -> { return; }
                    default -> writer.println("Unknown command");
                }
            }
        } catch (SocketTimeoutException e) {
            System.out.println("Клієнт неактивний, від'єднуємо");
        } catch (IOException e) {
            System.out.println("Клієнт аварійно від'єднався: " + e.getMessage());
        } finally {
            System.out.println("Клієнт від'єднався");
        }
    }
}
```

Важливі деталі:

* **Завершення.** `accept()` — блокувальний виклик, і перервати його через `interrupt()` неможливо. Стандартний спосіб — закрити `ServerSocket` з іншого потоку: `accept()` кине `SocketException`, і цикл завершиться. Блок try-with-resources з виконавцем потім дочекається, доки обробники клієнтів доберуть свою роботу.
* **`try (socket; ...)`** — уже створений ресурс можна передати в try-with-resources (Java 9), щоб він закрився наприкінці обробки.
* **Тайм-аут читання** `setSoTimeout` обмежує час очікування в `read`/`readLine`: після нього кидається `SocketTimeoutException`. Без нього «завислий» клієнт займав би обробник вічно.
* **Аварійне від'єднання** (клієнт закрився без `exit`, мережа зникла) проявляється як `IOException` (наприклад, `Connection reset`) у `readLine` або під час запису.

## Клієнт

Клієнт ініціює з'єднання, указавши адресу й порт сервера, і працює з потоками так само, як сервер:

```java
public class Client {
    static final int PORT = 5000;

    public static void main(String[] args) throws IOException {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(InetAddress.getLoopbackAddress(), PORT),
                    (int) Duration.ofSeconds(3).toMillis());          // тайм-аут з'єднання
            System.out.println("З'єднано з " + socket.getRemoteSocketAddress());

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            PrintWriter writer = new PrintWriter(
                    new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);
            BufferedReader console = new BufferedReader(new InputStreamReader(System.in));

            String line;
            while ((line = console.readLine()) != null) {
                writer.println(line);
                String response = reader.readLine();
                if (response == null) break;                         // сервер закрив з'єднання
                System.out.println(response);
            }
        } catch (ConnectException e) {
            System.out.println("Сервер недоступний: " + e.getMessage());   // Connection refused
        }
    }
}
```

Приклад сесії (введення користувача чергується з відповідями):

```text
З'єднано з localhost/127.0.0.1:5000
date
2026-11-20
time
18:40
hello
Unknown command
exit
```

## Опції сокета

| Метод | Призначення |
| --- | --- |
| `setSoTimeout(ms)` | тайм-аут блокувального читання |
| `setTcpNoDelay(true)` | вимкнути алгоритм Нейгла: дрібні повідомлення йдуть одразу, без накопичення (інтерактивні протоколи, ігри) |
| `setKeepAlive(true)` | періодично перевіряти, чи жива інша сторона |
| `shutdownOutput()` | закрити лише напрям запису: інша сторона отримає кінець потоку, але читати відповідь ще можна |
| `setReuseAddress(true)` | (на `ServerSocket`) дозволити повторну прив'язку до порту одразу після перезапуску сервера |

## Неблокувальний ввід-вивід

Модель «потік на з'єднання» з віртуальними потоками масштабується на сотні тисяч клієнтів. До віртуальних потоків для цього використовували **неблокувальний** ввід-вивід NIO: один потік через `Selector` стежить за багатьма каналами й обробляє лише ті, що готові до читання чи запису. На ньому побудовані Netty, Undertow, Vert.x.

```java
try (Selector selector = Selector.open();
     ServerSocketChannel server = ServerSocketChannel.open()) {
    server.bind(new InetSocketAddress(5000));
    server.configureBlocking(false);
    server.register(selector, SelectionKey.OP_ACCEPT);
    ByteBuffer buffer = ByteBuffer.allocate(1024);

    while (true) {
        selector.select();                                         // чекає, доки якийсь канал буде готовий
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
                if (client.read(buffer) == -1) {                   // клієнт закрив з'єднання
                    client.close();
                    continue;
                }
                buffer.flip();
                client.write(buffer);                              // ехо (спрощено: write може записати не все)
            }
        }
    }
}
```

Цей код складніший: стан кожного клієнта доводиться зберігати явно, а не в локальних змінних потоку. Тому для нового коду, де немає особливих вимог, простіше писати блокувальний код на віртуальних потоках.
