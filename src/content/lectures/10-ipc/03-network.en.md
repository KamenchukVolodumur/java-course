---
title: Network
description: Network layers and Java classes, the TCP and UDP transport protocols, application protocols, IPv4 and IPv6 addresses, ports and endpoints, DNS, URI, network interfaces.
---

## Network Architecture

```text
Application layer     HTTP, FTP, SMTP, DNS, WebSocket   ──  HttpClient, URL / URI
Transport layer       TCP                 UDP            ──  Socket, ServerSocket, SocketChannel
                                                              DatagramSocket, DatagramChannel
Network layer         IP (IPv4, IPv6)                    ──  InetAddress, InetSocketAddress
```

### The Transport Layer

The transport layer has two main protocols: **TCP** (Transmission Control Protocol) and **UDP** (User Datagram Protocol).

* **TCP** is connection-oriented and guarantees that data arrives completely and in the right order.
* **UDP** does not establish a connection and does not guarantee delivery, but it supports broadcasting. It is used where speed matters more than reliability: video streaming, voice calls, games.

TCP and UDP only transmit data: they do not define which messages can be sent or in which order they are exchanged. When working with them directly, authentication and encryption have to be organized by yourself (or the connection wrapped in TLS: `SSLSocket`).

Both protocols have their own pages: "TCP" and "UDP".

### The Application Layer

Application protocols (HTTP, FTP, SMTP, DNS) define **the message format and the rules of interaction** between a client and a server. Most of them are TCP or UDP wrapped in message exchange semantics: HTTP up to version 2, SMTP and FTP run on top of TCP; HTTP/3 (via QUIC), VoIP, BitTorrent and DNS on top of UDP.

In Java the main way to work with HTTP services is the `java.net.http.HttpClient` class (Java 11), covered in the "Extras" chapter.

## Addresses and Ports

Devices on a network need addresses to communicate. There are two standards: the 32-bit **IPv4** (`192.168.8.1`) and the 128-bit **IPv6** (`2001:db8:85a3::8a2e:370:7334`). Both kinds are represented by the `java.net.InetAddress` class with its subclasses `Inet4Address` and `Inet6Address`.

```java
InetAddress ipv4 = InetAddress.ofLiteral("192.168.0.100");           // Java 22; without a DNS lookup
System.out.println(ipv4 + ", " + ipv4.getClass().getSimpleName());
InetAddress ipv6 = InetAddress.getByName("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
System.out.println(ipv6 + ", " + ipv6.getClass().getSimpleName());
// /192.168.0.100, Inet4Address
// /2001:db8:85a3:0:0:8a2e:370:7334, Inet6Address

InetAddress loopback = InetAddress.getLoopbackAddress();              // 127.0.0.1 (localhost)
InetAddress any = new InetSocketAddress(0).getAddress();              // 0.0.0.0 — "all interfaces"
```

> [!NOTE]
> `InetAddress.getByName(text)` only parses a string containing an IP address, but performs a (blocking) DNS lookup for a host name. The slash at the beginning of the output `/192.168.0.100` is the place for the host name, which is unknown here.

TCP and UDP divide each IP address into **65,536 ports** (0–65535), so one computer with a single address can run many network applications, each on its own port. Ports 0–1023 are "well-known" (80 — HTTP, 443 — HTTPS, 22 — SSH) and require administrator rights on Unix. An address together with a port (an **endpoint**) is represented by `InetSocketAddress`:

```java
InetSocketAddress endpoint = new InetSocketAddress(InetAddress.ofLiteral("192.168.0.100"), 5000);
System.out.println(endpoint);                                         // /192.168.0.100:5000

InetSocketAddress byName = new InetSocketAddress("example.com", 443);          // with a DNS lookup
InetSocketAddress later = InetSocketAddress.createUnresolved("example.com", 443);  // without a lookup
```

## DNS

**DNS** (Domain Name System) converts human-friendly domain names (`example.com`) into IP addresses and back.

```java
for (InetAddress address : InetAddress.getAllByName("pw.edu.pl")) {
    System.out.println(address.getHostAddress());
}
// 194.29.151.9

InetAddress address = InetAddress.ofLiteral("194.29.151.9");
System.out.println(address.getCanonicalHostName());                   // a reverse lookup
// www-virt6.ci.pw.edu.pl
```

The JVM caches DNS results (successful ones for 30 s by default, the `networkaddress.cache.ttl` security property), so a change of a DNS record is not immediately visible to a running program.

## URI

A resource on the network is identified by a **URI** (`scheme://user@host:port/path?query#fragment`). The `java.net.URI` class parses and builds such strings, while `URL` is an outdated class with its own network logic (and, for example, DNS lookups in `equals`), so new code uses `URI` for identifiers:

```java
URI uri = URI.create("https://example.com:8443/api/users?page=2#top");
System.out.println(uri.getScheme());    // https
System.out.println(uri.getHost());      // example.com
System.out.println(uri.getPort());      // 8443
System.out.println(uri.getPath());      // /api/users
System.out.println(uri.getQuery());     // page=2

URI resolved = uri.resolve("../health");                              // https://example.com:8443/health
String encoded = URLEncoder.encode("coffee & tea", StandardCharsets.UTF_8);  // coffee+%26+tea
```

## Network Interfaces

```java
NetworkInterface.networkInterfaces()
        .filter(ni -> { try { return ni.isUp() && !ni.isLoopback(); } catch (SocketException e) { return false; } })
        .forEach(ni -> System.out.println(ni.getDisplayName() + ": "
                + ni.inetAddresses().map(InetAddress::getHostAddress).toList()));
// Wi-Fi: [192.168.1.23, fe80:0:0:0:1c2b:...]
```
