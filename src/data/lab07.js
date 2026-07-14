export const lab07 = {
  id: "Lab07",
  title: "Лабораторна 7: Асинхронний Погодний Клієнт",
  description: "Створення HTTP-клієнта, що паралельно завантажує дані з REST API з використанням CompletableFuture, парсингом JSON та обробкою мережевих збоїв.",
  sections: [
    {
      title: "Опис завдання",
      content: `
> [!NOTE]
> **Рекомендовані лекції для цієї лаби:** Лекція 09 (CompletableFuture), Лекція 10 (HttpClient), Лекція 17 (REST API & JSON).

У цій лабораторній роботі ми напишемо програму, яка дізнається погоду в кількох містах світу одночасно. 

Ми використаємо публічне API **Open-Meteo** (яке не вимагає реєстрації та ключів).
Щоб програма працювала швидко, ми відійдемо від "послідовного" виконання коду (де кожне місто чекає своєї черги) і реалізуємо **асинхронні HTTP-запити**, об'єднавши їхні результати за допомогою \`CompletableFuture\`.

Ця лабораторна навчить вас мислити "паралельно" і вирішувати типові для Backend-розробника задачі:
* Як відправити GET запит.
* Як "відмапити" (десеріалізувати) JSON у Java об'єкт (Record).
* Як не заблокувати головний потік під час очікування відповіді від сервера.
* Як безпечно впоратися з відвалом мережі (Timeouts & Fallbacks).
`
    },
    {
      title: "Task 1: Модель даних (Record) та Jackson (1 бал)",
      content: `
Спочатку налаштуємо проект. Вам знадобиться бібліотека **Jackson** для парсингу JSON. Додайте її у ваш \`pom.xml\`:
\`\`\`xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.2</version>
</dependency>
\`\`\`

API Open-Meteo повертає величезний JSON. Наприклад, запит погоди для Києва:
\`https://api.open-meteo.com/v1/forecast?latitude=50.45&longitude=30.52&current_weather=true\`

Поверне такий JSON:
\`\`\`json
{
  "latitude": 50.45,
  "longitude": 30.52,
  "current_weather": {
    "temperature": 15.3,
    "windspeed": 10.2,
    "weathercode": 3
  }
}
\`\`\`

Ми не хочемо писати складні класи. Створіть DTO (Data Transfer Object) використовуючи **Records**. Jackson вміє автоматично "вкладати" Records один в один, якщо їхні назви полів збігаються з ключами в JSON.

\`\`\`java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// Ignorujemy wszystkie inne pola z JSONa, których nie zdefiniowaliśmy w Recordzie
@JsonIgnoreProperties(ignoreUnknown = true)
public record WeatherResponse(CurrentWeather current_weather) {}

@JsonIgnoreProperties(ignoreUnknown = true)
// TODO: Stwórz record CurrentWeather, który będzie miał dwa pola: 
// 1. double temperature
// 2. double windspeed
\`\`\`
`
    },
    {
      title: "Task 2: Клієнт для API (Синхронно) (1 бал)",
      content: `
Створіть клас \`WeatherClient\`. Почнемо з простого, "поганого" підходу — синхронного запиту, щоб потім відчути різницю в швидкості.

\`\`\`java
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class WeatherClient {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public WeatherClient() {
        // TODO 1: Zainicjalizuj httpClient używając HttpClient.newHttpClient()
        // TODO 2: Zainicjalizuj objectMapper (new ObjectMapper())
    }

    public double fetchTemperatureSync(double lat, double lon) {
        String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current_weather=true", lat, lon);

        // TODO 3: Zbuduj zapytanie HttpRequest (GET) dla podanego URL
        /*
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();
        */

        // TODO 4: Wyślij zapytanie synchronicznie używając httpClient.send(...)
        // Podpowiedź: użyj HttpResponse.BodyHandlers.ofString()
        
        // TODO 5: Z użyciem objectMapper.readValue(response.body(), WeatherResponse.class)
        // przekonwertuj JSON na obiekt i zwróć samą temperaturę.
        
        return 0.0; // Zmień to!
    }
}
\`\`\`
`
    },
    {
      title: "Task 3: Асинхронна магія CompletableFuture (2 бали)",
      content: `
Якщо у нас 10 міст, і сервер відповідає за 0.5 секунди, синхронний метод буде працювати 5 секунд. Це неприпустимо для бекенду.

Додайте метод \`fetchTemperatureAsync\` до вашого \`WeatherClient\`.

\`\`\`java
import java.util.concurrent.CompletableFuture;

public class WeatherClient {
    // ... poprzedni kod ...

    public CompletableFuture<Double> fetchTemperatureAsync(double lat, double lon) {
        String url = String.format(Locale.US, "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current_weather=true", lat, lon);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        // TODO 1: Użyj httpClient.sendAsync() zamiast send().
        // Pamiętaj, że to zwraca CompletableFuture<HttpResponse<String>>
        
        // TODO 2: Użyj metody .thenApply() aby przetransformować otrzymany HttpResponse 
        // na obiekt WeatherResponse (używając objectMapper wewnątrz lambdy).
        // Uwaga: objectMapper rzuca Checked Exception (JsonProcessingException).
        // Wewnątrz lambdy musisz użyć try-catch i w razie błędu rzucić np. RuntimeException.
        
        // TODO 3: Użyj kolejnego .thenApply() aby wyciągnąć samą temperaturę z WeatherResponse.
        
        return null; // Zwróć utworzony łańcuch CompletableFuture!
    }
}
\`\`\`
`
    },
    {
      title: "Task 4: Стійкість до збоїв (Resilience) (1 бал)",
      content: `
Що, якщо API Open-Meteo "зависне" і не буде відповідати 30 секунд? Наш \`CompletableFuture\` буде чекати вічно, блокуючи ресурси.

Додайте до вашого ланцюжка (\`chain\`) у методе \`fetchTemperatureAsync\` дві речі (доступні від Javy 9+):

1. **Timeout:** Обмежте час очікування до 2 секунд. Якщо сервер не відповість, Future має завершитися з помилкою.
   *Підказка: \`.orTimeout(2, TimeUnit.SECONDS)\`*
2. **Fallback (План Б):** Якщо сталася будь-яка помилка (timeout, відсутність інтернету, поганий JSON), ми не хочемо, щоб уся програма впала. Замість помилки, нехай повертає "магічне" число \`-999.0\`, що символізуватиме відсутність даних.
   *Підказка: \`.exceptionally(ex -> { System.out.println("Blad: " + ex.getMessage()); return -999.0; })\`*
`
    },
    {
      title: "Task 5: Оркестрація в Main (1 бал)",
      content: `
Тепер перевіримо різницю у продуктивності! 
У класі \`Main\` ми маємо список координат для 5 міст.

\`\`\`java
record City(String name, double lat, double lon) {}

public class Main {
    public static void main(String[] args) {
        List<City> cities = List.of(
            new City("Kijow", 50.45, 30.52),
            new City("Londyn", 51.50, -0.12),
            new City("Nowy Jork", 40.71, -74.00),
            new City("Tokio", 35.68, 139.69),
            new City("Sydney", -33.86, 151.20)
        );
        
        WeatherClient client = new WeatherClient();
        
        System.out.println("--- SYNCHRONICZNIE ---");
        long startSync = System.currentTimeMillis();
        // TODO: W zwykłej pętli wywołaj client.fetchTemperatureSync dla każdego miasta i wypisz wynik.
        long endSync = System.currentTimeMillis();
        System.out.println("Czas synchroniczny: " + (endSync - startSync) + " ms\\n");
        
        
        System.out.println("--- ASYNCHRONICZNIE ---");
        long startAsync = System.currentTimeMillis();
        
        // TODO 1: Stwórz listę CompletableFuture. 
        // Przeiteruj przez miasta i dla każdego wywołaj client.fetchTemperatureAsync, 
        // dodając wynikowy obiekt Future do listy.
        
        // TODO 2: Użyj CompletableFuture.allOf(), przekazując tablicę twoich futures.
        // Wywołaj na nim .join(), co sprawi, że główny wątek (Main) poczeka, 
        // aż WSZYSTKIE 5 asynchronicznych zapytań się zakończy.
        
        // TODO 3: Przeiteruj ponownie, wyciągając wyniki używając future.get() lub future.join() 
        // i wypisz je na ekran.
        
        long endAsync = System.currentTimeMillis();
        System.out.println("Czas asynchroniczny: " + (endAsync - startAsync) + " ms");
    }
}
\`\`\`

> [!IMPORTANT]
> Порівняйте час! Синхронний код виконується $T_1 + T_2 + T_3...$
> Асинхронний код виконується за час найповільнішого з 5 запитів: $max(T_1, T_2, T_3...)$.
> Різниця має бути колосальною. Це і є основа швидких мікросервісів!
`
    }
  ],
  quiz: [
    {
      question: "Z jakiego powodu w asynchronicznym łańcuchu (Pipeline) używamy metody .thenApply() zamiast zwykłego przypisania wartości w kodzie liniowym?",
      options: [
        "Ponieważ .thenApply() wykonuje operację natychmiastowo na wątku głównym, oszczędzając czas procesora.",
        "Metoda .thenApply() instruuje CompletableFuture, aby po pomyślnym otrzymaniu wyniku z poprzedniego kroku (np. odebraniu HTTP), automatycznie odpalić przekazaną funkcję (np. transformację JSON) na wyniku, nie blokując wątku w międzyczasie.",
        "Ponieważ jest to wymóg biblioteki Jackson do poprawnego parsowania.",
        "Nie ma różnicy. Można użyć int wynik = future.get() od razu po zapytaniu i osiągnąć ten sam asynchroniczny efekt."
      ],
      answer: 1,
      explanation: "Użycie future.get() natychmiastowo zablokowałoby aktualny wątek w oczekiwaniu na wynik. .thenApply() to 'callback' (oddzwonienie) – rejestrujemy tylko instrukcję: 'gdy dane w końcu przyjdą, zrób z nimi to i to'."
    },
    {
      question: "Co daje wywołanie CompletableFuture.allOf(future1, future2).join() w metodzie main()?",
      options: [
        "Skleja wyniki wszystkich future'ów w jeden wielki String.",
        "Uruchamia wszystkie zapytania jednocześnie (bez tego metody by się nie wykonały).",
        "Sprawia, że główny wątek (main) zostaje zablokowany (wstrzymany) do momentu, w którym wszystkie przekazane jako argumenty zadania (future) ostatecznie się zakończą (sukcesem lub błędem).",
        "Anuluje wszystkie trwające zapytania, zwalniając pamięć RAM."
      ],
      answer: 2,
      explanation: "Metody asynchroniczne odpalają się w tle (w domyślnej puli ForkJoinPool). Gdybyśmy nie użyli allOf().join() na końcu metody main(), program po prostu by się zakończył ułamek sekundy po starcie, zabijając wszystkie niedokończone zapytania w tle."
    },
    {
      question: "Co stanie się, jeśli w bloku .thenApply() zostanie rzucony nieobsłużony wyjątek (np. NullPointerException), a na końcu łańcucha dopięta jest metoda .exceptionally(ex -> -1.0)?",
      options: [
        "Program natychmiast zakończy działanie z błędem w konsoli (Crash).",
        "Metoda exceptionally() 'przechwyci' ten błąd, naprawi go ukrywając przed użytkownikiem i sprawi, że Future zakończy się poprawnie, zwracając wartość -1.0.",
        "Kompilator Java nie pozwoli na kompilację kodu z potencjalnym NullPointerException w asynchronicznym ciele.",
        "Future zawiśnie w nieskończoność czekając na rozwiązanie problemu."
      ],
      answer: 1,
      explanation: ".exceptionally() działa dokładnie tak samo jak blok 'catch' w standardowym kodzie. Pozwala to na elegancką obsługę błędów w łańcuchach wywołań i dostarczenie wartości domyślnej (Fallback)."
    },
    {
      question: "Dlaczego wykorzystanie java.net.http.HttpClient do strzelania do REST API jest dzisiaj preferowane w Core Javie, w porównaniu do starego HttpURLConnection?",
      options: [
        "Nowy HttpClient natywnie wspiera protokół HTTP/2 oraz wbudowaną, nowoczesną obsługę asynchroniczności (CompletableFuture), czego stare API w ogóle nie potrafiło.",
        "HttpURLConnection zostało całkowicie usunięte z języka Java i rzuca ClassNotFoundException.",
        "Nowy HttpClient nie wymaga w ogóle używania try-catch przy operacjach wejścia/wyjścia.",
        "Stare API pozwalało na wysyłanie tylko metody GET, a nowe wspiera POST i PUT."
      ],
      answer: 0,
      explanation: "Wprowadzony w Javie 11 HttpClient został zaprojektowany całkowicie od nowa. Jego główną przewagą jest obsługa protokołu HTTP/2 i zintegrowanie z modelem asynchronicznym, co idealnie sprawdza się w wysoce obciążonych serwerach."
    }
  ]
};
