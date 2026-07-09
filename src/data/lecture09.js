export const lecture09 = {
  id: "09",
  title: "Wykład 09: Współbieżność Asynchroniczna i Wirtualne Wątki (Project Loom)",
  description: "Omówienie puli wątków (ExecutorService), asynchronicznej kompozycji zadań (CompletableFuture), formatowania danych oraz przełomowej technologii Wirtualnych Wątków w Javie 21.",
  sections: [
    {
      title: "1. Zarządzanie Wątkami: ExecutorService",
      content: `
Ręczne tworzenie obiektów \`Thread\` dla każdego zadania jest nieefektywne (tworzenie wątku OS jest kosztowne i zużywa ok. 1MB pamięci RAM na stos). Do zarządzania pulami wątków służy interfejs **\`java.util.concurrent.ExecutorService\`**.

Klasa narzędziowa \`Executors\` pozwala na łatwe tworzenie pul:
* **\`newFixedThreadPool(int n)\`**: Pula ze stałą liczbą wątków. Idealna do zadań o ograniczonych zasobach procesora.
* **\`newCachedThreadPool()\`**: Tworzy nowe wątki w razie potrzeby, a nieużywane usuwa. Dobra do wielu krótkich, nieblokujących zadań.
* **\`newScheduledThreadPool(int n)\`**: Umożliwia cykliczne lub opóźnione wywoływanie zadań.

Przykład użycia:
\`\`\`java
ExecutorService executor = Executors.newFixedThreadPool(4);

// Przesłanie zadania typu Runnable (nic nie zwraca)
executor.submit(() -> System.out.println("Zadanie w puli"));

// Przesłanie zadania typu Callable (zwraca wartość w obiekcie Future)
Future<Integer> future = executor.submit(() -> {
    Thread.sleep(1000);
    return 42;
});

// Pobranie wyniku (metoda get() jest blokująca!)
Integer result = future.get(); // 42

// Zamykanie puli (zawsze konieczne!)
executor.shutdown();
\`\`\`
`
    },
    {
      title: "2. Programowanie Asynchroniczne: CompletableFuture",
      content: `
Klasa \`Future\` nie pozwala na łatwe łączenie zadań w łańcuchy ani asynchroniczną reakcję na błędy. Java 8 wprowadziła klasę **\`CompletableFuture<T>\`**, która implementuje interfejs \`CompletionStage\` i reprezentuje asynchroniczny etap obliczeń, który można komponować bez blokowania wątków.

Przykłady kompozycji asynchronicznej:
\`\`\`java
CompletableFuture.supplyAsync(() -> {
    // Zadanie 1: Odczyt danych z sieci (uruchamiane w domyślnej puli ForkJoinPool.commonPool)
    return "Dane użytkownika";
})
.thenApply(data -> {
    // Zadanie 2: Transformacja danych (wywoływane po zakończeniu Zadania 1)
    return data + " (zanalizowane)";
})
.thenAccept(result -> {
    // Zadanie 3: Konsumpcja wyniku
    System.out.println("Wynik końcowy: " + result);
})
.exceptionally(throwable -> {
    // Obsługa błędów na dowolnym etapie łańcucha
    System.err.println("Błąd: " + throwable.getMessage());
    return null;
});
\`\`\`
`
    },
    {
      title: "3. Wirtualne Wątki (Virtual Threads) - Project Loom (Java 21)",
      content: `
Przed wersją Java 21, jeden wątek Java (\`Thread\`) odpowiadał dokładnie jednemu wątkowi systemu operacyjnego (Platform Thread / Kernel Thread). Powodowało to ograniczenie liczby wątków do kilku tysięcy z powodu zużycia pamięci i narzutu na przełączanie kontekstu (context switching) w OS.

Java 21 wprowadza **Wirtualne Wątki (Virtual Threads)**, rozwijane w ramach projektu **Loom**. 
* Są to niezwykle tanie wątki (od kilkuset bajtów do kilku KB na wątek), zarządzane bezpośrednio przez JVM w pamięci sterty, a nie przez system operacyjny.
* Możemy uruchomić **miliony** wirtualnych wątków jednocześnie.
* Kiedy wirtualny wątek wykonuje blokującą operację I/O (np. zapytanie do bazy danych, czytanie pliku), JVM odmontowuje go z fizycznego wątku nośnego (Carrier Thread) i parkuje. Wątek fizyczny w tym czasie wykonuje inne wirtualne wątki. Po zakończeniu I/O, wirtualny wątek jest przywracany na wolny wątek fizyczny.

> [!WARNING]
> **Thread Pinning**: Gdy wirtualny wątek wykonuje kod wewnątrz bloku \`synchronized\` lub wywołuje kod natywny (JNI/FFM) i napotyka operację blokującą I/O, nie może zostać odmontowany od wątku nośnego (Carrier Thread). Powoduje to fizyczne zablokowanie wątku nośnego. Zaleca się używanie \`ReentrantLock\` zamiast \`synchronized\` w kodzie przeznaczonym dla wirtualnych wątków.

Dzięki temu pisanie kodu blokującego staje się wysoce wydajne, bez potrzeby stosowania skomplikowanych frameworków reaktywnych (jak WebFlux czy RxJava).

Od Javy 21 dostępna jest również (w wersji preview) funkcjonalność **Structured Concurrency** (JEP 462), umożliwiająca grupowanie powiązanych wirtualnych wątków za pomocą \`StructuredTaskScope\`, co zapewnia automatyczne anulowanie podzadań w przypadku awarii jednego z nich.

Tworzenie wirtualnych wątków:
\`\`\`java
// 1. Bezpośrednie uruchomienie wątku wirtualnego
Thread.startVirtualThread(() -> {
    System.out.println("Działam w wątku wirtualnym!");
});

// 2. Użycie dedykowanego Executora (tworzy nowy wątek wirtualny dla każdego zadania)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> {
        // Operacja blokująca I/O
        Thread.sleep(1000);
        return "Gotowe";
    });
} // Automatyczne zamknięcie puli (try-with-resources) czeka na zakończenie zadań
\`\`\`
`
    },
    {
      title: "4. Formatowanie Danych (Date, Time, String)",
      content: `
### String.format i System.out.printf:
Java oferuje klasyczny mechanizm formatowania w stylu C:
\`\`\`java
String info = String.format("Witaj %s! Masz %d powiadomień. Saldo: %.2f PLN", "Anna", 5, 120.538);
// "Witaj Anna! Masz 5 powiadomień. Saldo: 120.54 PLN"
\`\`\`

### Nowoczesny czas: Java Date/Time API (java.time):
Wprowadzony w Javie 8 pakiet zastępuje stare, wadliwe klasy \`Date\` i \`Calendar\`. Nowe klasy są **niemutowalne** i bezpieczne wielowątkowo:
* **\`LocalDate\`**: Sama data (rok, miesiąc, dzień) - np. \`LocalDate.now()\`.
* **\`LocalTime\`**: Sam czas (godzina, minuta, sekunda).
* **\`LocalDateTime\`**: Data i czas bez strefy czasowej.
* **\`ZonedDateTime\`**: Pełna data, czas i strefa czasowa.
* **\`DateTimeFormatter\`**: Służy do parsowania i formatowania dat:
\`\`\`java
LocalDateTime now = LocalDateTime.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String text = now.format(formatter); // "2026-07-07 22:55:00"
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Co dzieje się z fizycznym wątkiem procesora (Carrier Thread), gdy wirtualny wątek Java 21 wykonuje blokującą operację wejścia/wyjścia (np. Thread.sleep() lub I/O)?",
      options: [
        "Wątek fizyczny zostaje zablokowany i czeka, marnując zasoby procesora.",
        "JVM automatycznie odmontowuje zablokowany wątek wirtualny, zwalniając wątek fizyczny do wykonywania innych wątków wirtualnych.",
        "System operacyjny kończy proces aplikacji.",
        "Zostaje rzucony wyjątek VirtualThreadBlockedException."
      ],
      answer: 1,
      explanation: "Jest to kluczowa zaleta wirtualnych wątków. Kiedy następuje blokada I/O, wirtualny wątek jest parkowany w pamięci sterty, a Carrier Thread natychmiast przejmuje inne zadania."
    },
    {
      question: "Która metoda w klasie CompletableFuture pozwala na transformację wyniku asynchronicznego (analogicznie do map w strumieniach)?",
      options: [
        "thenAccept(Consumer)",
        "thenApply(Function)",
        "exceptionally(Function)",
        "allOf(CompletableFuture[])"
      ],
      answer: 1,
      explanation: "Metoda 'thenApply' przyjmuje interfejs funkcyjny Function, transformuje wynik asynchroniczny z typu T na U i zwraca nowy CompletableFuture<U>."
    },
    {
      question: "Co charakteryzuje klasy z pakietu java.time (wprowadzonego w Java 8, np. LocalDate, LocalDateTime)?",
      options: [
        "Są mutowalne i wymagają synchronizacji w aplikacjach wielowątkowych.",
        "Są całkowicie niemutowalne (thread-safe) - każda modyfikacja (np. plusDays(1)) zwraca nowy obiekt.",
        "Są przestarzałe i nie zaleca się ich używania.",
        "Służą wyłącznie do formatowania plików tekstowych."
      ],
      answer: 1,
      explanation: "Klasy z pakietu java.time są niemutowalne (immutable) i dzięki temu bezpieczne w środowiskach wielowątkowych (brak ryzyka wyścigu - race conditions)."
    }
  ]
};
