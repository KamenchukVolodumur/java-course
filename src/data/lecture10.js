export const lecture10 = {
  id: "10",
  title: "Wykład 10: Sieci TCP, Protokół HTTP i Serializacja Danych",
  description: "Zagadnienia komunikacji sieciowej w Javie (gniazda Socket/ServerSocket, nowoczesny HttpClient), asynchroniczne strumienie reactive flow, oraz metody serializacji (Java, JSON, Protobuf).",
  sections: [
    {
      title: "1. Sieć TCP: Gniazda (Socket i ServerSocket)",
      content: `
Java umożliwia bezpośrednią komunikację sieciową na poziomie warstwy transportowej (TCP) przy użyciu pakietu \`java.net\`. Do obsługi połączeń klient-serwer służą dwie klasy:

1. **\`ServerSocket\`**: Klasa używana przez aplikację serwera do nasłuchiwania na określonym porcie. Metoda \`accept()\` blokuje wątek do momentu nawiązania połączenia przez klienta i zwraca obiekt \`Socket\`.
2. **\`Socket\`**: Klasa reprezentująca połączenie dwukierunkowe. Pozwala na pobranie strumieni wejściowych (\`getInputStream()\`) i wyjściowych (\`getOutputStream()\`) do wymiany danych.

Przykład prostego serwera echo:
\`\`\`java
public class EchoServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket serverSocket = new ServerSocket(8080)) {
            System.out.println("Serwer nasłuchuje na porcie 8080...");
            while (true) {
                // accept() blokuje wątek do nadejścia połączenia
                try (Socket clientSocket = serverSocket.accept();
                     BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                     PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {
                    
                    String line = in.readLine();
                    out.println("Echo: " + line);
                }
            }
        }
    }
}
\`\`\`
`
    },
    {
      title: "2. Nowoczesny Klient HTTP: HttpClient (Java 11)",
      content: `
Od Javy 11 standardowy klient HTTP (\`java.net.http.HttpClient\`) zastąpił stare, mało wydajne API \`HttpURLConnection\`. Nowy klient wspiera protokoły **HTTP/1.1** oraz **HTTP/2**, zapytania synchroniczne, asynchroniczne (zwracające \`CompletableFuture\`) oraz technologię WebSocket.

Przykład zapytania asynchronicznego GET:
\`\`\`java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.github.com/users/octocat"))
        .header("Accept", "application/json")
        .GET()
        .build();

// Asynchroniczne wywołanie (nie blokuje wątku głównego)
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body)
        .thenAccept(json -> System.out.println("Otrzymany JSON: " + json))
        .join(); // blokuje wątek główny na końcu tylko do zakończenia programu
\`\`\`
`
    },
    {
      title: "3. Serializacja Danych: Klasyczna Java, JSON i Protobuf",
      content: `
Serializacja to proces zapisu stanu obiektu (pamięci RAM) do formatu binarnego lub tekstowego w celu przesłania go przez sieć lub zapisu na dysku. Deserializacja to proces odwrotny.

### 1. Serializacja Natywna Java (\`java.io.Serializable\`):
* Wymaga zaimplementowania interfejsu-znacznika \`Serializable\`.
* Należy zadeklarować pole \`private static final long serialVersionUID\` w celu weryfikacji zgodności klas w procesie deserializacji.
* Pola oznaczone modyfikatorem \`transient\` nie podlegają serializacji.
* **Uwaga na bezpieczeństwo**: Natywna serializacja Javy jest uznawana za przestarzałą i wysoce niebezpieczną (podatność na ataki typu *deserialization gadgets*, które pozwalają na zdalne wykonanie kodu - RCE). Nie zaleca się jej w nowych projektach.

### 2. Serializacja do JSON (np. biblioteka Jackson):
Najpopularniejszy format tekstowy. Używamy bibliotek takich jak **Jackson** lub **Gson**. Jackson automatycznie mapuje obiekty Java (w tym Rekordy!) na format JSON i odwrotnie przy użyciu klasy \`ObjectMapper\`:
\`\`\`java
ObjectMapper mapper = new ObjectMapper();
User user = new User("Jan", 30);

// Serializacja do Stringa JSON
String json = mapper.writeValueAsString(user); // {"name":"Jan","age":30}

// Deserializacja z JSON
User userCopy = mapper.readValue(json, User.class);
\`\`\`

### 3. Protocol Buffers (Protobuf - od Google):
Format binarny o wysokiej wydajności. Wymaga zdefiniowania schematu danych w pliku \`.proto\`, na podstawie którego generowany jest kod Java. Jest znacznie szybszy i generuje mniejszy narzut sieciowy niż JSON/XML. Szeroko stosowany w komunikacji gRPC.
`
    }
  ],
  quiz: [
    {
      question: "Co robi metoda ServerSocket.accept()?",
      options: [
        "Wysyła zapytanie HTTP do klienta.",
        "Zamyka połączenie serwera.",
        "Blokuje wątek i nasłuchuje na porcie, zwracając obiekt Socket w momencie nawiązania połączenia przez klienta.",
        "Deserializuje strumień danych."
      ],
      answer: 2,
      explanation: "Metoda accept() jest operacją blokującą. Czeka na połączenie od klienta TCP i po jego nawiązaniu zwraca obiekt Socket reprezentujący to połączenie."
    },
    {
      question: "Dlaczego standardowa, natywna serializacja Java (Serializable) jest obecnie odradzana?",
      options: [
        "Jest niekompatybilna z nowymi systemami operacyjnymi.",
        "Stwarza duże zagrożenie bezpieczeństwa, umożliwiając ataki typu Remote Code Execution (RCE) podczas deserializacji niezweryfikowanych danych.",
        "Działa tylko w aplikacjach jednowątkowych.",
        "Wycofano ją w Javie 21."
      ],
      answer: 1,
      explanation: "Deserializacja w natywnej Javie tworzy obiekty bez wywoływania konstruktorów i pozwala na manipulację grafem obiektów, co napastnicy mogą wykorzystać do uruchomienia złośliwego kodu."
    },
    {
      question: "Co oznacza modyfikator 'transient' przy deklaracji pola klasy implementującej Serializable?",
      options: [
        "Pole to jest przesyłane jako pierwsze.",
        "Pole to zostanie pominięte podczas procesu serializacji obiektu.",
        "Pole to jest zapisywane w formacie JSON, a pozostałe w XML.",
        "Wymusza szyfrowanie zawartości tego pola."
      ],
      answer: 1,
      explanation: "Słowo kluczowe transient informuje mechanizm serializacji, że stan tego pola nie powinien być zapisywany (np. hasła, połączenia sieciowe, pola obliczalne)."
    }
  ]
};
