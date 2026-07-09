export const lecture17 = {
  id: "17",
  title: "Wykład 17: Komunikacja Sieciowa — HTTP, REST API oraz format JSON",
  description: "Przygotowanie do tworzenia usług sieciowych: podstawy protokołu HTTP, architektura REST, struktura danych JSON oraz wykorzystanie wbudowanego w Javę HttpClienta do integracji z zewnętrznymi API.",
  sections: [
    {
      title: "1. Protokół HTTP — Podstawy",
      content: `
Zanim zaczniesz pisać własne aplikacje sieciowe (np. w Spring Boot), musisz zrozumieć, jak komputery rozmawiają ze sobą w internecie. Językiem tej komunikacji jest najczęściej **HTTP** (HyperText Transfer Protocol).

Komunikacja HTTP zawsze odbywa się w modelu **Klient-Serwer**:
1. **Klient** (np. przeglądarka internetowa, aplikacja mobilna, inna aplikacja Java) wysyła **Żądanie (Request)**.
2. **Serwer** (np. Twoja aplikacja w Spring Boot) analizuje żądanie, przetwarza je i zwraca **Odpowiedź (Response)**.

Każde Żądanie (Request) składa się z:
* **Metody (Verb):** określa, *co* chcemy zrobić.
* **URL (Endpoint):** określa, *na jakim zasobie* chcemy operować (np. \`/api/users/1\`).
* **Nagłówków (Headers):** dodatkowe metadane (np. \`Content-Type: application/json\`, tokeny autoryzacyjne).
* **Ciała (Body):** opcjonalne dane wysyłane do serwera (np. dane z formularza lub obiekt JSON).

Każda Odpowiedź (Response) składa się z:
* **Kodu statusu (Status Code):** 3-cyfrowa liczba informująca o wyniku operacji.
* **Nagłówków (Headers):** np. rozmiar odpowiedzi, data.
* **Ciała (Body):** zwrócone dane (np. kod HTML lub JSON z informacjami o użytkowniku).
`
    },
    {
      title: "2. Metody HTTP i Kody Statusów",
      content: `
### Najważniejsze Metody HTTP (Verbs)

W nowoczesnym podejściu każda metoda reprezentuje konkretną operację (tzw. operacje CRUD — Create, Read, Update, Delete):

| Metoda | Kiedy używamy? | Przykład |
|--------|----------------|----------|
| **GET** | Pobieranie danych z serwera. Nigdy nie modyfikuje stanu na serwerze! (Tzw. operacja bezpieczna i idempotentna). | \`GET /users\` — pobiera listę użytkowników |
| **POST** | Wysłanie danych do serwera w celu utworzenia NOWEGO zasobu. | \`POST /users\` — tworzy nowego użytkownika na bazie danych w ciele zapytania |
| **PUT** | Całkowite zaktualizowanie lub podmiana ISTNIEJĄCEGO zasobu. | \`PUT /users/123\` — podmienia dane usera 123 |
| **PATCH** | Częściowa aktualizacja zasobu. | \`PATCH /users/123\` — zmienia tylko np. hasło |
| **DELETE** | Usunięcie zasobu. | \`DELETE /users/123\` — usuwa użytkownika 123 |

### Najważniejsze Kody Statusów (Status Codes)

Są pogrupowane w pięć kategorii (tzw. setek):
* **2xx (Sukces):**
  * \`200 OK\` — udało się.
  * \`201 Created\` — udało się, nowy zasób został pomyślnie utworzony (zwykle po POST).
  * \`204 No Content\` — operacja powiodła się, ale serwer nie zwraca żadnych danych (często po DELETE).
* **3xx (Przekierowania):**
  * \`301 Moved Permanently\`, \`302 Found\` — klient ma wyszukać zasób pod innym adresem URL.
* **4xx (Błąd Klienta):** (To TWOJA wina)
  * \`400 Bad Request\` — wysłałeś niepoprawne dane (np. zły JSON).
  * \`401 Unauthorized\` — brak logowania, brak poprawnego hasła/tokenu.
  * \`403 Forbidden\` — jesteś zalogowany, ale nie masz uprawnień (np. nie jesteś adminem).
  * \`404 Not Found\` — próbujesz pobrać zasób, którego nie ma (zły URL lub brak encji w bazie).
* **5xx (Błąd Serwera):** (To wina SERWERA)
  * \`500 Internal Server Error\` — wystąpił nieobsłużony wyjątek (np. \`NullPointerException\`) w kodzie backendu.
  * \`502 Bad Gateway\`, \`503 Service Unavailable\` — serwer leży, baza danych nie odpowiada itp.
`
    },
    {
      title: "3. Czym jest REST API?",
      content: `
REST (Representational State Transfer) to styl architektury dla tworzenia API (Application Programming Interface), oparty na standardach HTTP. Spring Boot pozwala na błyskawiczne tworzenie REST-owych endpointów za pomocą adnotacji \`@RestController\`.

Główne zasady architektury REST:
1. **Bezstanowość (Statelessness):** Serwer nie zapamiętuje żadnych sesji między żądaniami. Każdy request musi zawierać wszystkie informacje (np. token w nagłówku), aby serwer wiedział, kim jest nadawca.
2. **Architektura Klient-Serwer:** Rozdzielenie frontendu (np. React, Angular, aplikacja na Androida) od backendu (np. Java Spring Boot). Komunikują się one jedynie wysyłając żądania i odpowiedzi HTTP.
3. **Zasoby jako URI:** Każdy obiekt, na którym można operować (użytkownik, produkt, zamówienie), ma swój unikalny identyfikator URL.

### Przykład dobrych endpointów REST:
Zauważ, że używamy rzeczowników w liczbie mnogiej. Akcję określa metoda HTTP, a nie sam adres URL!

* ✅ \`GET /api/products\` (Pobierz listę)
* ✅ \`POST /api/products\` (Utwórz produkt)
* ✅ \`GET /api/products/42\` (Pobierz jeden produkt o ID 42)
* ✅ \`DELETE /api/products/42\` (Usuń produkt 42)

* ❌ \`GET /api/getProducts\` (Złe, akcja w nazwie URL)
* ❌ \`POST /api/products/42/delete\` (Złe, do usuwania służy metoda DELETE, a nie POST i dziwny URL)
`
    },
    {
      title: "4. Format Danych JSON",
      content: `
Frontend i Backend mogą być napisane w różnych językach (np. JavaScript i Java). Aby mogły przesyłać sobie obiekty, muszą je przetłumaczyć na uniwersalny format tekstowy (tzw. serializacja). Dziś absolutnym standardem w API jest **JSON** (JavaScript Object Notation).

### Struktura JSON
JSON składa się z:
1. Obiektów (wąsy \`{ }\`)
2. Tablic (nawiasy kwadratowe \`[ ]\`)
3. Par klucz-wartość (klucz **zawsze** w podwójnych cudzysłowach)
4. Wartości podstawowych: stringi (w \`" "\`), liczby (bez cudzysłowów), \`true\`, \`false\`, \`null\`.

### Przykładowy dokument JSON:
\`\`\`json
{
  "id": 101,
  "name": "Jan Kowalski",
  "isActive": true,
  "balance": 1500.50,
  "roles": ["USER", "ADMIN"],
  "address": {
    "city": "Warszawa",
    "street": "Wiejska 1"
  },
  "department": null
}
\`\`\`

> [!NOTE]
> W Javie popularne biblioteki (jak **Jackson** czy **Gson**) potrafią automatycznie mapować taki JSON bezpośrednio na obiekt klasy Java za pomocą refleksji (i odwrotnie). Spring Boot wbudowuje w siebie bibliotekę Jackson i robi to całkowicie pod maską!
`
    },
    {
      title: "5. Integracja z API z poziomu Javy (HttpClient)",
      content: `
Od Javy 11 w bibliotece standardowej dostępny jest świetny, nowoczesny klient HTTP, który obsługuje zarówno operacje synchroniczne, jak i asynchroniczne (np. przy użyciu \`CompletableFuture\`).

Aby pobrać dane z zewnętrznego REST API (np. kursy walut, dane pogodowe), musisz:
1. Zbudować klienta: \`HttpClient.newHttpClient()\`
2. Zbudować żądanie (HttpRequest): określić URL i metodę
3. Wysłać żądanie i odebrać odpowiedź (HttpResponse)

### Przykład: Pobieranie losowego faktu o kotach (metoda GET)
\`\`\`java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CatFactClient {
    public static void main(String[] args) throws Exception {
        // 1. Tworzymy klienta
        HttpClient client = HttpClient.newHttpClient();

        // 2. Budujemy żądanie GET
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://catfact.ninja/fact"))
            .GET()
            .build();

        System.out.println("Wysyłam zapytanie...");

        // 3. Wysyłamy żądanie i oczekujemy odpowiedzi w postaci Stringa (BodyHandlers.ofString)
        HttpResponse<String> response = client.send(
            request, 
            HttpResponse.BodyHandlers.ofString()
        );

        // 4. Analizujemy odpowiedź
        System.out.println("Status Code: " + response.statusCode()); // np. 200
        System.out.println("Body (JSON): " + response.body()); 
        // Wypisze np: {"fact":"Cats sleep 12-16 hours a day.","length":29}
    }
}
\`\`\`
`
    },
    {
      title: "6. Deserializacja JSON za pomocą biblioteki zewnętrznej",
      content: `
Kiedy pobierzemy Stringa (jak w przykładzie powyżej), praca z nim w Javie jest trudna. Chcielibyśmy go zamienić na nasz własny obiekt (Record). Aby to zrobić, używamy biblioteki **Jackson**.

### Krok 1: Dodanie zależności do pom.xml (Maven)
\`\`\`xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.16.1</version>
</dependency>
\`\`\`

### Krok 2: Przygotowanie klasy (Rekordu) w Javie
Od Javy 14, Rekordy są do tego idealne. Nazwy pól muszą się pokrywać z kluczami z JSON-a!
\`\`\`java
public record CatFact(String fact, int length) {}
\`\`\`

### Krok 3: Deserializacja za pomocą ObjectMapper
\`\`\`java
import com.fasterxml.jackson.databind.ObjectMapper;

// Zamiast ręcznie wypisywać Stringa (z poprzedniego punktu):
String jsonString = response.body();

// Używamy ObjectMapper z biblioteki Jackson
ObjectMapper mapper = new ObjectMapper();

// Konwertujemy String JSON na instancję rekordu CatFact!
CatFact catFactObj = mapper.readValue(jsonString, CatFact.class);

System.out.println("Czy wiesz, że: " + catFactObj.fact());
System.out.println("Długość tekstu to: " + catFactObj.length());
\`\`\`

Gdy poznasz Spring Boot, przekonasz się, że on wszystko to robi za Ciebie — zarówno tworzenie JSON-ów na wyjściu (serializacja), jak i odbieranie ich na wejściu (deserializacja). Jednak zrozumienie mechanizmów, które za tym stoją, jest bezcenne przy poszukiwaniu błędów i debugowaniu złożonych systemów!
`
    }
  ],
  quiz: [
    {
      question: "Która metoda HTTP powinna być użyta do aktualizacji istniejącego zasobu użytkownika (np. edycja profilu)?",
      options: [
        "POST",
        "PUT lub PATCH",
        "GET",
        "UPDATE"
      ],
      answer: 1,
      explanation: "PUT służy do wymiany (nadpisania) całego zasobu nowymi danymi, natomiast PATCH służy do częściowej aktualizacji (np. zmiana tylko nazwiska). POST tworzy nowy zasób, a metody UPDATE w HTTP po prostu nie ma."
    },
    {
      question: "Jaki kod statusu HTTP jest poprawny, gdy klient spróbuje wejść na URL, który nie istnieje?",
      options: [
        "200 OK",
        "400 Bad Request",
        "404 Not Found",
        "500 Internal Server Error"
      ],
      answer: 2,
      explanation: "404 Not Found jednoznacznie oznacza 'szukany zasób nie został odnaleziony'. Z kolei 400 Bad Request to zła zawartość zapytania, a 500 to błąd w kodzie samej aplikacji."
    },
    {
      question: "Co charakteryzuje architekturę REST w kontekście stanu klienta (Statelessness)?",
      options: [
        "Każde zapytanie do serwera tworzy tzw. 'sesję', do której mają dostęp kolejne zapytania.",
        "Serwer nie przechowuje stanu klienta pomiędzy kolejnymi zapytaniami. Każde żądanie HTTP musi zawierać wszystkie niezbędne informacje (np. token).",
        "Stan użytkownika zapisywany jest wyłącznie w plikach cookies na serwerze.",
        "REST wymusza, by stan przetrzymywać na osobnym serwerze pamięci (np. Redis)."
      ],
      answer: 1,
      explanation: "Zasada bezstanowości (statelessness) nakazuje, by serwer przetwarzał każde zapytanie HTTP niezależnie, nie opierając się na żadnych historycznych sesjach pamiętanych w jego pamięci RAM."
    },
    {
      question: "Jaka biblioteka w Javie jest standardowo używana (m.in. wbudowana w Spring Boot) do konwersji pomiędzy formatem JSON a obiektami Java?",
      options: [
        "Hibernate",
        "JUnit",
        "Jackson",
        "Maven"
      ],
      answer: 2,
      explanation: "Jackson (a dokładniej moduł jackson-databind) to najpopularniejsza biblioteka realizująca konwersje Obiekt <-> JSON (czyli mapowanie obiektowo-rekordowe do formatu testowego)."
    }
  ]
};
