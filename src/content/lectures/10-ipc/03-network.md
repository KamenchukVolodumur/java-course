---
title: Мережа
description: Мережеві рівні й класи Java, транспортні протоколи TCP і UDP, прикладні протоколи, IP-адреси IPv4 і IPv6, порти й кінцеві точки, DNS, URI, мережеві інтерфейси.
---

## Мережева архітектура

```text
Прикладний рівень     HTTP, FTP, SMTP, DNS, WebSocket   ──  HttpClient, URL / URI
Транспортний рівень   TCP                 UDP            ──  Socket, ServerSocket, SocketChannel
                                                              DatagramSocket, DatagramChannel
Мережевий рівень      IP (IPv4, IPv6)                    ──  InetAddress, InetSocketAddress
```

### Транспортний рівень

Транспортний рівень має два основні протоколи: **TCP** (Transmission Control Protocol) і **UDP** (User Datagram Protocol).

* **TCP** орієнтований на з'єднання й гарантує, що дані надійдуть повністю і в правильному порядку.
* **UDP** не встановлює з'єднання й не гарантує доставки, зате підтримує широкомовлення (broadcast). Його використовують там, де швидкість важливіша за надійність: потокове відео, голосові дзвінки, ігри.

TCP і UDP лише передають дані: вони не визначають, які повідомлення можна надсилати і в якому порядку ними обмінюватися. Працюючи з ними напряму, автентифікацію й шифрування доводиться організовувати самостійно (або загорнути з'єднання в TLS: `SSLSocket`).

Обом протоколам присвячено окремі сторінки: «TCP» і «UDP».

### Прикладний рівень

Прикладні протоколи (HTTP, FTP, SMTP, DNS) визначають **формат повідомлень і правила взаємодії** клієнта й сервера. Більшість з них — TCP або UDP, загорнуті в семантику обміну повідомленнями: HTTP до версії 2, SMTP і FTP працюють поверх TCP; HTTP/3 (через QUIC), VoIP, BitTorrent і DNS — поверх UDP.

У Java основний спосіб працювати з HTTP-сервісами — клас `java.net.http.HttpClient` (Java 11), розглянутий у розділі «Додатково».

## Адреси й порти

Для зв'язку пристроїв у мережі потрібні адреси. Існують два стандарти: 32-бітна **IPv4** (`192.168.8.1`) і 128-бітна **IPv6** (`2001:db8:85a3::8a2e:370:7334`). Обидва види представляє клас `java.net.InetAddress` з підкласами `Inet4Address` та `Inet6Address`.

```java
InetAddress ipv4 = InetAddress.ofLiteral("192.168.0.100");           // Java 22; без DNS-запиту
System.out.println(ipv4 + ", " + ipv4.getClass().getSimpleName());
InetAddress ipv6 = InetAddress.getByName("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
System.out.println(ipv6 + ", " + ipv6.getClass().getSimpleName());
// /192.168.0.100, Inet4Address
// /2001:db8:85a3:0:0:8a2e:370:7334, Inet6Address

InetAddress loopback = InetAddress.getLoopbackAddress();              // 127.0.0.1 (localhost)
InetAddress any = new InetSocketAddress(0).getAddress();              // 0.0.0.0 — «усі інтерфейси»
```

> [!NOTE]
> `InetAddress.getByName(текст)` для рядка з IP-адресою лише розбирає його, а для імені хоста — виконує DNS-запит (блокувальний). Похила риска на початку виведення `/192.168.0.100` — місце для імені хоста, яке тут невідоме.

TCP і UDP ділять кожну IP-адресу на **65 536 портів** (0–65535), тож один комп'ютер з однією адресою може мати багато мережевих застосунків, кожен на своєму порті. Порти 0–1023 — «добре відомі» (80 — HTTP, 443 — HTTPS, 22 — SSH) і в Unix потребують прав адміністратора. Адресу разом з портом (**кінцеву точку**, endpoint) представляє `InetSocketAddress`:

```java
InetSocketAddress endpoint = new InetSocketAddress(InetAddress.ofLiteral("192.168.0.100"), 5000);
System.out.println(endpoint);                                         // /192.168.0.100:5000

InetSocketAddress byName = new InetSocketAddress("example.com", 443);          // з DNS-запитом
InetSocketAddress later = InetSocketAddress.createUnresolved("example.com", 443);  // без запиту
```

## DNS

**DNS** (Domain Name System) перетворює зрозумілі людям доменні імена (`example.com`) на IP-адреси й навпаки.

```java
for (InetAddress address : InetAddress.getAllByName("pw.edu.pl")) {
    System.out.println(address.getHostAddress());
}
// 194.29.151.9

InetAddress address = InetAddress.ofLiteral("194.29.151.9");
System.out.println(address.getCanonicalHostName());                   // зворотний запит
// www-virt6.ci.pw.edu.pl
```

JVM кешує результати DNS-запитів (успішні — 30 с за замовчуванням, властивість безпеки `networkaddress.cache.ttl`), тож зміна DNS-запису не одразу помітна запущеній програмі.

## URI

Ресурс у мережі ідентифікує **URI** (`scheme://user@host:port/path?query#fragment`). Клас `java.net.URI` розбирає й будує такі рядки, а `URL` — застарілий клас з власною мережевою логікою (і, наприклад, з DNS-запитами в `equals`), тому в новому коді для ідентифікаторів використовують `URI`:

```java
URI uri = URI.create("https://example.com:8443/api/users?page=2#top");
System.out.println(uri.getScheme());    // https
System.out.println(uri.getHost());      // example.com
System.out.println(uri.getPort());      // 8443
System.out.println(uri.getPath());      // /api/users
System.out.println(uri.getQuery());     // page=2

URI resolved = uri.resolve("../health");                              // https://example.com:8443/health
String encoded = URLEncoder.encode("кава & чай", StandardCharsets.UTF_8);  // %D0%BA%D0%B0%D0%B2%D0%B0+%26+...
```

## Мережеві інтерфейси

```java
NetworkInterface.networkInterfaces()
        .filter(ni -> { try { return ni.isUp() && !ni.isLoopback(); } catch (SocketException e) { return false; } })
        .forEach(ni -> System.out.println(ni.getDisplayName() + ": "
                + ni.inetAddresses().map(InetAddress::getHostAddress).toList()));
// Wi-Fi: [192.168.1.23, fe80:0:0:0:1c2b:...]
```
