---
title: UDP
description: Протокол UDP і відсутність гарантій, розмір датаграми й MTU, сценарії використання, порівняння з TCP, DatagramSocket і DatagramPacket, сервер і клієнт з повторними спробами, broadcast і multicast, DatagramChannel, типові пастки.
---

## Протокол

**UDP** (User Datagram Protocol) — другий основний протокол транспортного рівня. На відміну від TCP, він **не встановлює з'єднання**: кожне повідомлення — **датаграма** — надсилається незалежно на задану адресу й порт. UDP додає до IP лише 8-байтовий заголовок (порт джерела, порт призначення, довжина, контрольна сума). Тому він простий і швидкий, але всі гарантії залишає застосунку:

* **Межі повідомлень зберігаються.** Одна операція надсилання створює одну датаграму, а одна операція отримання повертає рівно одну цілу датаграму. На відміну від потоку байтів TCP, framing не потрібен.
* **Доставка не гарантована.** Датаграма може загубитися, і відправник про це не дізнається.
* **Порядок не гарантований.** Датаграми можуть надійти не в тому порядку, у якому їх надіслали.
* **Дублікати можливі.** Та сама датаграма може бути доставлена кілька разів.
* **Немає контролю потоку й перевантаження.** Відправник може надсилати як завгодно швидко. Якщо мережа чи отримувач не встигають, датаграми відкидаються (наприклад, коли заповнений буфер сокета отримувача).

Датаграму з неправильною контрольною сумою мовчки відкидають, тож для застосунку це просто ще одна втрачена датаграма.

> [!NOTE]
> Максимальний корисний вміст датаграми в IPv4 — **65 507 байтів** (65 535 байтів IP-пакета мінус 20 байтів заголовка IP і 8 байтів заголовка UDP). На практиці датаграми мають бути значно меншими. Датаграму, більшу за **MTU** (Maximum Transmission Unit) мережевого шляху, ділять на IP-фрагменти, а втрата будь-якого фрагмента означає втрату всієї датаграми (деякі мережі відкидають фрагменти взагалі). В Ethernet з MTU 1500 байтів це щонайбільше **1472 байти** корисного вмісту, а в інтернеті безпечніше триматися ще нижче.

## Сценарії використання

UDP використовують там, де низька затримка важливіша за надійність, де повідомлення малі й незалежні, або де застосунок реалізує власні механізми надійності:

* **DNS** — запит і відповідь зазвичай вміщуються в одну датаграму; якщо відповідь не надійшла, клієнт просто повторює запит.
* **VoIP, відеодзвінки, трансляції** — повторно надісланий фрагмент звуку чи відео надійшов би надто пізно, щоб його відтворити, тож краще його пропустити.
* **Онлайн-ігри** — важливий лише останній стан гри; втрачене застаріле оновлення позиції не потрібно надсилати повторно.
* **Виявлення сервісів у локальній мережі** — broadcast і multicast (DHCP, mDNS) доступні лише з UDP.
* **QUIC** і **HTTP/3** поверх нього — QUIC реалізує надійність, порядок, контроль перевантаження й шифрування в просторі користувача поверх UDP. Це усуває блокування «голови черги» TCP: у HTTP/2 один втрачений TCP-сегмент зупиняє всі запити, мультиплексовані в з'єднанні. Крім того, протокол може розвиватися без змін в операційних системах і мережевих пристроях.

## TCP проти UDP

| | TCP | UDP |
| --- | --- | --- |
| З'єднання | з'єднання (рукостискання, потім потік) | без з'єднання |
| Одиниця даних | потік байтів без меж повідомлень | датаграма, межі зберігаються |
| Доставка | гарантована (підтвердження, повтори) | не гарантована |
| Порядок | гарантований | не гарантований |
| Дублікати | усуваються | можливі |
| Контроль потоку й перевантаження | так | ні |
| Розмір заголовка | 20–60 байтів | 8 байтів |
| Broadcast/multicast | ні | так |
| Класи Java | `ServerSocket`, `Socket` | `DatagramSocket`, `DatagramPacket` |
| Типове використання | HTTP/1.1, HTTP/2, SMTP, SSH, передача файлів | DNS, VoIP, ігри, виявлення сервісів, QUIC |

## DatagramSocket

У Java UDP обслуговують класи `java.net.DatagramSocket` і `DatagramPacket`. З'єднань немає, тож той самий клас використовують і сервер, і клієнт: немає ні слухача, ні прийняття клієнтів.

* `new DatagramSocket(port)` прив'язує сокет до локального порту. Серверу це потрібно, бо клієнти мусять знати, куди надсилати запити. `new DatagramSocket()` прив'язує сокет до вільного (ефемерного) порту, який вибирає ОС.
* `send(packet)` надсилає одну датаграму. `DatagramPacket` містить дані й адресу призначення.
* `receive(packet)` чекає на одну датаграму й записує її в буфер пакета. Після виклику `packet.getLength()` — кількість отриманих байтів, а `packet.getSocketAddress()` — адреса відправника, якій можна відповісти.
* `connect(address)` попри назву **нічого не надсилає**. Він лише задає адресу за замовчуванням: після цього пакети можна надсилати без адреси, а ОС відкидає датаграми від інших адрес.
* `setSoTimeout(ms)` обмежує очікування в `receive`: після тайм-ауту кидається `SocketTimeoutException`.

> [!WARNING]
> Якщо буфер пакета менший за датаграму, датаграму **обрізано**, і зайві байти втрачено. Для кожного отримання встановлюйте буфер достатнього розміру.

## Сервер

Приклад реалізує той самий простий протокол, що й на сторінці TCP: клієнт надсилає текстові команди `date` чи `time`, а сервер повертає відповідь. Порівняйте з TCP-сервером: немає `accept()`, немає потоку на клієнта і немає потоку байтів — **один сокет обслуговує всіх клієнтів**. Кожна датаграма — повна команда, а сервер відповідає, надсилаючи датаграму відправникові. Команда `exit` теж не потрібна: з'єднання, яке треба закрити, немає, тож клієнт просто перестає надсилати. TCP- і UDP-порти незалежні, тож цей сервер може використовувати порт 5000, навіть поки працює TCP-сервер.

Інтерфейс loopback практично не втрачає датаграм, тож щоб показати втрату на одній машині, сервер навмисно ігнорує частину запитів (`LOSS_RATE`).

```java
public class Server {
    static final int PORT = 5000;
    static final double LOSS_RATE = 0.25;                     // імовірність імітованої втрати

    public static void main(String[] args) throws IOException {
        try (DatagramSocket socket = new DatagramSocket(PORT)) {
            Thread.ofVirtual().start(() -> {
                System.out.println("Натисніть Enter, щоб завершити");
                new Scanner(System.in).nextLine();
                socket.close();                               // receive() кине SocketException
            });

            byte[] buffer = new byte[1472];
            while (true) {
                DatagramPacket request = new DatagramPacket(buffer, buffer.length);
                try {
                    socket.receive(request);
                } catch (SocketException e) {
                    break;                                    // сокет закрито
                }
                String command = new String(request.getData(), 0, request.getLength(), StandardCharsets.UTF_8);
                System.out.println("Команда: " + command + " від " + request.getSocketAddress());

                if (ThreadLocalRandom.current().nextDouble() < LOSS_RATE) {
                    System.out.println("Запит втрачено (імітація)");
                    continue;
                }

                String response = switch (command) {
                    case "date" -> LocalDate.now().toString();
                    case "time" -> LocalTime.now().truncatedTo(ChronoUnit.MINUTES).toString();
                    default -> "Unknown command";
                };
                byte[] data = response.getBytes(StandardCharsets.UTF_8);
                socket.send(new DatagramPacket(data, data.length, request.getSocketAddress()));
            }
        }
    }
}
```

## Клієнт

Клієнт викликає `connect`, щоб задати сервер адресою за замовчуванням, потім читає команди з консолі й надсилає кожну однією датаграмою. Оскільки загубитися може і запит, і відповідь, клієнт не може чекати на відповідь вічно: `setSoTimeout` обмежує очікування однією секундою, після чого запит надсилається знову, до трьох разів.

```java
public class Client {
    static final int PORT = 5000;
    static final int MAX_ATTEMPTS = 3;
    static final Duration RESPONSE_TIMEOUT = Duration.ofSeconds(1);

    public static void main(String[] args) throws IOException {
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.connect(new InetSocketAddress(InetAddress.getLoopbackAddress(), PORT));  // нічого не надсилає
            socket.setSoTimeout((int) RESPONSE_TIMEOUT.toMillis());
            System.out.println("Клієнт прив'язаний до " + socket.getLocalSocketAddress());

            BufferedReader console = new BufferedReader(new InputStreamReader(System.in));
            String line;
            while ((line = console.readLine()) != null && !line.equals("exit")) {
                String response = sendRequest(socket, line);
                System.out.println(response != null ? response : "Немає відповіді від сервера");
            }
        }
    }

    static String sendRequest(DatagramSocket socket, String command) throws IOException {
        byte[] request = command.getBytes(StandardCharsets.UTF_8);
        byte[] buffer = new byte[1472];
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            socket.send(new DatagramPacket(request, request.length));
            DatagramPacket response = new DatagramPacket(buffer, buffer.length);
            try {
                socket.receive(response);
                return new String(response.getData(), 0, response.getLength(), StandardCharsets.UTF_8);
            } catch (SocketTimeoutException e) {
                System.out.println("Тайм-аут (спроба " + attempt + "/" + MAX_ATTEMPTS + ")");
            } catch (PortUnreachableException e) {
                // ICMP «port unreachable»: на порті сервера ніхто не слухає
                System.out.println("Сервер недоступний (спроба " + attempt + "/" + MAX_ATTEMPTS + ")");
                try { Thread.sleep(RESPONSE_TIMEOUT); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return null; }
            }
        }
        return null;
    }
}
```

Приклад сесії, у якій один запит загубився:

```text
Клієнт прив'язаний до /127.0.0.1:34853
date
2026-11-20
time
Тайм-аут (спроба 1/3)
18:40
```

Коли сервер не запущено, клієнт зазвичай дізнається про це швидко: хост сервера відповідає ICMP-повідомленням *port unreachable*, яке **з'єднаний** UDP-сокет повідомляє як `PortUnreachableException`. Але коли датаграма губиться десь у мережі, ніхто про це не повідомляє, і допомагає лише тайм-аут.

## Broadcast і multicast

UDP дозволяє надіслати одну датаграму багатьом отримувачам одночасно. Датаграму **broadcast**, надіслану на адресу `255.255.255.255`, отримують усі хости локальної мережі (маршрутизатори її далі не передають). Це зручно для виявлення сервісів, адреса яких заздалегідь невідома. Надсилання broadcast треба дозволити: `socket.setBroadcast(true)`.

```java
// Сервер: відповідає на запити виявлення
try (DatagramSocket socket = new DatagramSocket(DISCOVERY_PORT)) {
    byte[] buffer = new byte[64];
    while (true) {
        DatagramPacket request = new DatagramPacket(buffer, buffer.length);
        socket.receive(request);
        if (new String(buffer, 0, request.getLength(), StandardCharsets.UTF_8).equals("DISCOVER")) {
            byte[] here = "HERE".getBytes(StandardCharsets.UTF_8);
            socket.send(new DatagramPacket(here, here.length, request.getSocketAddress()));
        }
    }
}
```

```java
// Клієнт: питаємо всі хости локальної мережі
try (DatagramSocket socket = new DatagramSocket()) {
    socket.setBroadcast(true);
    byte[] discover = "DISCOVER".getBytes(StandardCharsets.UTF_8);
    socket.send(new DatagramPacket(discover, discover.length,
            InetAddress.getByName("255.255.255.255"), DISCOVERY_PORT));

    socket.setSoTimeout(2000);
    byte[] buffer = new byte[64];
    try {
        while (true) {                                    // збираємо відповіді до тайм-ауту
            DatagramPacket response = new DatagramPacket(buffer, buffer.length);
            socket.receive(response);
            System.out.println("Сервер знайдено: " + response.getAddress());
        }
    } catch (SocketTimeoutException e) {
        // час збору відповідей вичерпано
    }
}
```

**Multicast** доставляє датаграму лише хостам, що приєдналися до певної **групи** — адреси з діапазону `224.0.0.0`–`239.255.255.255` (діапазон `239.0.0.0/8` призначено для використання всередині організації). Отримувач приєднується до групи методом `joinGroup` класу `MulticastSocket`, а відправникові приєднуватися не потрібно. Multicast використовують, наприклад, mDNS (`224.0.0.251`) і SSDP (`239.255.255.250`). В IPv6 broadcast немає взагалі: його замінює multicast.

```java
InetAddress group = InetAddress.getByName("239.0.0.1");

// Отримувач: приєднатися до групи на конкретному мережевому інтерфейсі
try (MulticastSocket receiver = new MulticastSocket(PORT)) {
    NetworkInterface nic = NetworkInterface.getByInetAddress(InetAddress.getLocalHost());
    receiver.joinGroup(new InetSocketAddress(group, PORT), nic);
    DatagramPacket message = new DatagramPacket(new byte[1472], 1472);
    receiver.receive(message);
}
```

```java
// Відправник: приєднуватися до групи не потрібно
try (DatagramSocket sender = new DatagramSocket()) {
    byte[] data = "Привіт, групо!".getBytes(StandardCharsets.UTF_8);
    sender.send(new DatagramPacket(data, data.length, group, PORT));
}
```

## DatagramChannel

NIO-аналог — `DatagramChannel`: працює з `ByteBuffer`, який можна використовувати повторно без нових масивів, і підтримує неблокувальний режим із `Selector`.

```java
try (DatagramChannel channel = DatagramChannel.open()) {
    channel.bind(new InetSocketAddress(PORT));
    ByteBuffer buffer = ByteBuffer.allocate(65_507);
    while (true) {
        buffer.clear();
        SocketAddress sender = channel.receive(buffer);    // одна датаграма; надлишок обрізано
        buffer.flip();
        channel.send(buffer, sender);                       // ехо відправникові
    }
}
```

## Пастки

* **Без framing, але й без надійності.** Кожне отримання повертає цілу датаграму, тож роздільники чи префікси довжини не потрібні. Але все, що TCP робить за нас (підтвердження, повтори, порядок, усунення дублікатів), застосунок мусить реалізувати сам, якщо воно йому потрібне. Зазвичай кожне повідомлення має **порядковий номер** (щоб виявляти втрачені, продубльовані й переставлені повідомлення), отримувач надсилає **підтвердження**, а відправник повторює непідтверджені повідомлення. Якщо застосунку потрібне все це, краще обрати TCP (або QUIC).
* **Тайм-аут не означає, що запит загубився.** Могла загубитися або лише запізнитися відповідь. Тоді сервер обробить той самий запит ще раз (тож запити мають бути **ідемпотентними**, як `date`), а запізніла відповідь може бути сприйнята як відповідь на наступний запит. Справжні протоколи додають до запиту ідентифікатор (DNS, наприклад, використовує 16-бітний ID) і відкидають відповіді, що йому не відповідають. Клієнт з прикладу для простоти цю проблему ігнорує.
* **Розмір датаграми.** Датаграми, більші за MTU шляху, фрагментуються, що збільшує ймовірність їх втрати.
* **Немає контролю потоку.** Надто швидкий відправник переповнює буфер сокета отримувача (`setReceiveBufferSize`), і зайві датаграми відкидаються без будь-якого повідомлення.
* **Брандмауери й NAT.** Брандмауери часто блокують вхідний UDP-трафік. UDP не має з'єднання, кінець якого міг би помітити пристрій NAT (як він помічає кінець TCP-з'єднання). Тому NAT видаляє відповідності UDP після короткої неактивності, і тривалий обмін через NAT потребує періодичних повідомлень keep-alive.
