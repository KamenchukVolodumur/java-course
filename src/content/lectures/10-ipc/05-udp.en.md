---
title: UDP
description: The UDP protocol and its lack of guarantees, datagram size and MTU, use cases, comparison with TCP, DatagramSocket and DatagramPacket, a server and a client with retries, broadcast and multicast, DatagramChannel, typical pitfalls.
---

## The Protocol

**UDP** (User Datagram Protocol) is the second fundamental transport-layer protocol. Unlike TCP, it **does not establish a connection**: each message — a **datagram** — is sent independently to a given address and port. UDP adds only an 8-byte header to IP (source port, destination port, length, checksum). That is why it is simple and fast, but leaves all guarantees to the application:

* **Message boundaries are preserved.** One send operation creates one datagram, and one receive operation returns exactly one whole datagram. Unlike a TCP byte stream, no framing is needed.
* **No delivery guarantee.** A datagram may be lost, and the sender will not find out.
* **No ordering guarantee.** Datagrams may arrive in a different order than they were sent.
* **Duplicates are possible.** The same datagram may be delivered several times.
* **No flow or congestion control.** The sender can send as fast as it wants. If the network or the receiver cannot keep up, datagrams are dropped (e.g. when the receiver's socket buffer is full).

A datagram with an invalid checksum is silently discarded, so for the application it is just another lost datagram.

> [!NOTE]
> The maximum payload of a datagram in IPv4 is **65,507 bytes** (65,535 bytes of an IP packet minus 20 bytes of the IP header and 8 bytes of the UDP header). In practice datagrams should be much smaller. A datagram larger than the **MTU** (Maximum Transmission Unit) of the network path is split into IP fragments, and the loss of any fragment means the loss of the whole datagram (some networks drop fragments altogether). On Ethernet with an MTU of 1500 bytes this means at most **1472 bytes** of payload, and on the internet it is safer to stay even lower.

## Use Cases

UDP is used where low latency matters more than reliability, where messages are small and independent, or where the application implements its own reliability mechanisms:

* **DNS** — a query and its response usually fit into one datagram; if the response does not arrive, the client simply repeats the query.
* **VoIP, video calls, live streaming** — a retransmitted fragment of audio or video would arrive too late to be played, so it is better to skip it.
* **Online games** — only the latest game state matters; a lost, outdated position update does not need to be resent.
* **Service discovery in a local network** — broadcast and multicast (DHCP, mDNS) are available only with UDP.
* **QUIC** and **HTTP/3** on top of it — QUIC implements reliability, ordering, congestion control and encryption in user space on top of UDP. This removes TCP's head-of-line blocking: in HTTP/2 a single lost TCP segment stalls all requests multiplexed over the connection. Moreover, the protocol can evolve without changes to operating systems and network devices.

## TCP versus UDP

| | TCP | UDP |
| --- | --- | --- |
| Connection | connection-oriented (handshake, then a stream) | connectionless |
| Unit of data | a byte stream without message boundaries | a datagram, boundaries preserved |
| Delivery | guaranteed (acknowledgements, retransmissions) | not guaranteed |
| Ordering | guaranteed | not guaranteed |
| Duplicates | eliminated | possible |
| Flow and congestion control | yes | no |
| Header size | 20–60 bytes | 8 bytes |
| Broadcast/multicast | no | yes |
| Java classes | `ServerSocket`, `Socket` | `DatagramSocket`, `DatagramPacket` |
| Typical uses | HTTP/1.1, HTTP/2, SMTP, SSH, file transfer | DNS, VoIP, games, service discovery, QUIC |

## DatagramSocket

In Java, UDP is served by the `java.net.DatagramSocket` and `DatagramPacket` classes. There are no connections, so the same class is used by both the server and the client: there is no listener and no accepting of clients.

* `new DatagramSocket(port)` binds the socket to a local port. A server needs this, because clients must know where to send their requests. `new DatagramSocket()` binds the socket to a free (ephemeral) port chosen by the OS.
* `send(packet)` sends one datagram. A `DatagramPacket` contains the data and the destination address.
* `receive(packet)` waits for one datagram and writes it into the packet's buffer. After the call, `packet.getLength()` is the number of bytes received, and `packet.getSocketAddress()` is the sender's address, to which a reply can be sent.
* `connect(address)`, despite its name, **sends nothing**. It only sets the default address: after that packets can be sent without an address, and the OS discards datagrams from other addresses.
* `setSoTimeout(ms)` limits waiting in `receive`: after the timeout a `SocketTimeoutException` is thrown.

> [!WARNING]
> If the packet's buffer is smaller than the datagram, the datagram is **truncated**, and the extra bytes are lost. Set a buffer of sufficient size for every receive.

## The Server

The example implements the same simple protocol as on the TCP page: the client sends the text commands `date` or `time`, and the server returns the reply. Compare it with the TCP server: there is no `accept()`, no thread per client and no byte stream — **one socket serves all clients**. Each datagram is a complete command, and the server replies by sending a datagram to the sender. The `exit` command is not needed either: there is no connection to close, so the client simply stops sending. TCP and UDP ports are independent, so this server can use port 5000 even while the TCP server is running.

The loopback interface practically never loses datagrams, so to demonstrate a loss on one machine the server deliberately ignores some of the requests (`LOSS_RATE`).

```java
public class Server {
    static final int PORT = 5000;
    static final double LOSS_RATE = 0.25;                     // the probability of a simulated loss

    public static void main(String[] args) throws IOException {
        try (DatagramSocket socket = new DatagramSocket(PORT)) {
            Thread.ofVirtual().start(() -> {
                System.out.println("Press Enter to exit");
                new Scanner(System.in).nextLine();
                socket.close();                               // receive() will throw SocketException
            });

            byte[] buffer = new byte[1472];
            while (true) {
                DatagramPacket request = new DatagramPacket(buffer, buffer.length);
                try {
                    socket.receive(request);
                } catch (SocketException e) {
                    break;                                    // the socket is closed
                }
                String command = new String(request.getData(), 0, request.getLength(), StandardCharsets.UTF_8);
                System.out.println("Command: " + command + " from " + request.getSocketAddress());

                if (ThreadLocalRandom.current().nextDouble() < LOSS_RATE) {
                    System.out.println("Request lost (simulated)");
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

## The Client

The client calls `connect` to set the server as the default address, then reads commands from the console and sends each one as a single datagram. Since both the request and the response may be lost, the client cannot wait for the response forever: `setSoTimeout` limits waiting to one second, after which the request is sent again, up to three times.

```java
public class Client {
    static final int PORT = 5000;
    static final int MAX_ATTEMPTS = 3;
    static final Duration RESPONSE_TIMEOUT = Duration.ofSeconds(1);

    public static void main(String[] args) throws IOException {
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.connect(new InetSocketAddress(InetAddress.getLoopbackAddress(), PORT));  // sends nothing
            socket.setSoTimeout((int) RESPONSE_TIMEOUT.toMillis());
            System.out.println("Client bound to " + socket.getLocalSocketAddress());

            BufferedReader console = new BufferedReader(new InputStreamReader(System.in));
            String line;
            while ((line = console.readLine()) != null && !line.equals("exit")) {
                String response = sendRequest(socket, line);
                System.out.println(response != null ? response : "No response from the server");
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
                System.out.println("Timeout (attempt " + attempt + "/" + MAX_ATTEMPTS + ")");
            } catch (PortUnreachableException e) {
                // ICMP "port unreachable": nothing is listening on the server port
                System.out.println("Server unreachable (attempt " + attempt + "/" + MAX_ATTEMPTS + ")");
                try { Thread.sleep(RESPONSE_TIMEOUT); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return null; }
            }
        }
        return null;
    }
}
```

A sample session in which one request was lost:

```text
Client bound to /127.0.0.1:34853
date
2026-11-20
time
Timeout (attempt 1/3)
18:40
```

When the server is not running, the client usually finds out quickly: the server's host replies with an ICMP *port unreachable* message, which a **connected** UDP socket reports as a `PortUnreachableException`. But when a datagram gets lost somewhere in the network, nobody reports it, and only the timeout helps.

## Broadcast and Multicast

UDP makes it possible to send one datagram to many receivers at once. A **broadcast** datagram sent to the address `255.255.255.255` is received by all hosts of the local network (routers do not forward it further). This is convenient for discovering services whose address is not known in advance. Sending broadcasts must be enabled: `socket.setBroadcast(true)`.

```java
// The server: answers discovery requests
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
// The client: ask all hosts of the local network
try (DatagramSocket socket = new DatagramSocket()) {
    socket.setBroadcast(true);
    byte[] discover = "DISCOVER".getBytes(StandardCharsets.UTF_8);
    socket.send(new DatagramPacket(discover, discover.length,
            InetAddress.getByName("255.255.255.255"), DISCOVERY_PORT));

    socket.setSoTimeout(2000);
    byte[] buffer = new byte[64];
    try {
        while (true) {                                    // collect responses until the timeout
            DatagramPacket response = new DatagramPacket(buffer, buffer.length);
            socket.receive(response);
            System.out.println("Server found: " + response.getAddress());
        }
    } catch (SocketTimeoutException e) {
        // the time for collecting responses is up
    }
}
```

**Multicast** delivers a datagram only to the hosts that have joined a certain **group** — an address in the range `224.0.0.0`–`239.255.255.255` (the `239.0.0.0/8` range is intended for use within an organization). A receiver joins the group with the `joinGroup` method of `MulticastSocket`, and the sender does not need to join. Multicast is used, for example, by mDNS (`224.0.0.251`) and SSDP (`239.255.255.250`). IPv6 has no broadcast at all: multicast replaces it.

```java
InetAddress group = InetAddress.getByName("239.0.0.1");

// The receiver: join the group on a specific network interface
try (MulticastSocket receiver = new MulticastSocket(PORT)) {
    NetworkInterface nic = NetworkInterface.getByInetAddress(InetAddress.getLocalHost());
    receiver.joinGroup(new InetSocketAddress(group, PORT), nic);
    DatagramPacket message = new DatagramPacket(new byte[1472], 1472);
    receiver.receive(message);
}
```

```java
// The sender: no need to join the group
try (DatagramSocket sender = new DatagramSocket()) {
    byte[] data = "Hello, group!".getBytes(StandardCharsets.UTF_8);
    sender.send(new DatagramPacket(data, data.length, group, PORT));
}
```

## DatagramChannel

The NIO counterpart is `DatagramChannel`: it works with a `ByteBuffer` that can be reused without new arrays and supports non-blocking mode with a `Selector`.

```java
try (DatagramChannel channel = DatagramChannel.open()) {
    channel.bind(new InetSocketAddress(PORT));
    ByteBuffer buffer = ByteBuffer.allocate(65_507);
    while (true) {
        buffer.clear();
        SocketAddress sender = channel.receive(buffer);    // one datagram; the excess is truncated
        buffer.flip();
        channel.send(buffer, sender);                       // echo back to the sender
    }
}
```

## Pitfalls

* **No framing, but no reliability either.** Every receive returns a whole datagram, so delimiters or length prefixes are not needed. But everything TCP does for us (acknowledgements, retransmissions, ordering, eliminating duplicates) must be implemented by the application itself if it needs it. Usually each message carries a **sequence number** (to detect lost, duplicated and reordered messages), the receiver sends **acknowledgements**, and the sender resends unacknowledged messages. If an application needs all of this, TCP (or QUIC) is the better choice.
* **A timeout does not mean the request was lost.** It may be the response that got lost, or merely delayed. Then the server processes the same request again (so requests should be **idempotent**, like `date`), and a late response may be mistaken for the response to the next request. Real protocols add an identifier to each request (DNS, for example, uses a 16-bit ID) and discard responses that do not match it. The example client ignores this problem for simplicity.
* **Datagram size.** Datagrams larger than the path MTU are fragmented, which increases the probability of their loss.
* **No flow control.** A sender that is too fast overflows the receiver's socket buffer (`setReceiveBufferSize`), and the excess datagrams are dropped without any notification.
* **Firewalls and NAT.** Firewalls often block incoming UDP traffic. UDP has no connection whose end a NAT device could observe (as it observes the end of a TCP connection). That is why NAT devices remove UDP mappings after a short period of inactivity, and long-lived communication through NAT requires periodic keep-alive messages.
