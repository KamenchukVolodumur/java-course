export const lecture14 = {
  id: "14",
  title: "Wykład 14: Zaawansowana Synchronizacja, Sygnalizacja i Procesory Adnotacji",
  description: "Blokowanie współdzielone (ReadWriteLock, StampedLock), mechanizmy sygnalizacji wątków (CountDownLatch, CyclicBarrier, Semaphore), kolekcje współbieżne oraz procesory adnotacji (Annotation Processors) jako alternatywa generatorów kodu.",
  sections: [
    {
      title: "1. Blokowanie Współdzielone: ReadWriteLock & StampedLock",
      content: `
Zwykły \`lock\` (blokowanie wyłączne) drastycznie ogranicza skalowalność aplikacji w scenariuszach, gdzie dane są bardzo często czytane, a rzadko modyfikowane. Wiele wątków może bezpiecznie czytać te same dane jednocześnie, a blokować należy tylko wątki modyfikujące.

### 1. ReentrantReadWriteLock:
Dzieli blokadę na dwie części:
* **Read Lock (blokada odczytu)**: Może być uzyskana przez wiele wątków czytających jednocześnie, pod warunkiem, że żaden wątek nie modyfikuje danych.
* **Write Lock (blokada zapisu)**: Wyłączna blokada dla wątku modyfikującego. Blokuje zarówno innych piszących, jak i wszystkich czytających.

\`\`\`java
private final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
private final Lock readLock = rwl.readLock();
private final Lock writeLock = rwl.writeLock();
private int data = 0;

public int readData() {
    readLock.lock();
    try { return data; }
    finally { readLock.unlock(); }
}

public void writeData(int newValue) {
    writeLock.lock();
    try { data = newValue; }
    finally { writeLock.unlock(); }
}
\`\`\`

### 2. StampedLock (Java 8):
Nowocześniejszy mechanizm optymalizacyjny. Oferuje tzw. **odczyt optymistyczny (Optimistic Read)**. Wątek czytający pobiera pieczęć (stamp) i czyta dane bez zakładania blokady. Na koniec weryfikuje pieczęć (\`validate()\`). Jeśli żaden wątek nie zapisał danych w międzyczasie, odczyt kończy się powodzeniem bez jakiegokolwiek narzutu synchronizacyjnego. W przeciwnym wypadku wątek przechodzi w klasyczny odczyt blokujący.

\`\`\`java
StampedLock lock = new StampedLock();

// Optimistic Read
long stamp = lock.tryOptimisticRead();
double currentX = x, currentY = y; // odczyt pól
if (!lock.validate(stamp)) {
    // Wartość mogła się zmienić — fallback do pełnego odczytu
    stamp = lock.readLock();
    try {
        currentX = x;
        currentY = y;
    } finally {
        lock.unlockRead(stamp);
    }
}
\`\`\`
`
    },
    {
      title: "2. Narzędzia Sygnalizacji Wątków",
      content: `
Klasy z pakietu \`java.util.concurrent\` dostarczają wyspecjalizowane synchronizatory ułatwiające koordynację pracy wątków:

* **\`Semaphore\`**: Kontroluje dostęp do ograniczonej liczby zasobów za pomocą liczników zezwoleń (\`acquire()\` pobiera zezwolenie, \`release()\` je zwraca).
* **\`CountDownLatch\`**: Pozwala jednemu lub wielu wątkom na oczekiwanie (\`await()\`), aż grupa operacji wykonywanych w innych wątkach zostanie zakończona. Licznik jest zmniejszany za pomocą \`countDown()\` i jest **jednorazowy** (nie można go zresetować).
* **\`CyclicBarrier\`**: Pozwala grupie wątków na wzajemne czekanie na siebie w punkcie synchronizacji (barierze) za pomocą \`await()\`. Po osiągnięciu limitu bariera jest zwalniana i może być użyta ponownie (jest **cykliczna**).
* **\`Phaser\`**: Bardziej elastyczny synchronizator uogólniający zarówno \`CountDownLatch\`, jak i \`CyclicBarrier\`. Umożliwia dynamiczną rejestrację/wyrejestrowanie uczestników oraz obsługę wielu faz synchronizacji.

Przykład CountDownLatch:
\`\`\`java
CountDownLatch latch = new CountDownLatch(3); // Czekamy na 3 usługi pomocnicze

// Wątki pomocnicze wywołują latch.countDown() po zainicjalizowaniu
executor.submit(() -> {
    // inicjalizacja...
    latch.countDown();
});

// Wątek główny czeka na ukończenie wszystkich trzech inicjalizacji
latch.await(); 
System.out.println("Wszystkie usługi wystartowały. Uruchamianie aplikacji głównej...");
\`\`\`
`
    },
    {
      title: "3. Kolekcje Współbieżne (Concurrent Collections)",
      content: `
Standardowe kolekcje z JCF (np. \`ArrayList\`, \`HashMap\`) nie są bezpieczne wątkowo. Używanie dla nich wrapperów typu \`Collections.synchronizedMap()\` synchronizuje całą mapę na jednym monitorze lock, co drastycznie spowalnia aplikację w środowisku wielowątkowym.

Pakiet \`java.util.concurrent\` zawiera wysoce zoptymalizowane kolekcje współbieżne:

* **\`ConcurrentHashMap\`**: Zamiast blokowania całej mapy, używa blokowania na poziomie pojedynczych kubełków (\`synchronized\` na węźle głównym kubełka) oraz operacji atomowych CAS (Compare-And-Swap) dla pustych kubełków. Ta architektura (od Javy 8) zapewnia wysoką współbieżność bez globalnych blokad. Umożliwia jednoczesny odczyt wielu wątkom bez blokowania.
* **\`CopyOnWriteArrayList\`**: Każda modyfikacja (dodanie/usunięcie) tworzy nową kopię całej wewnętrznej tablicy pod spodem. Odczyt jest niezwykle szybki i nieblokujący, ale zapis jest bardzo kosztowny. Idealna do list typu *listenerzy/subskrybenci* (bardzo dużo odczytów, sporadyczne zapisy).
* **\`BlockingQueue\`** (\`LinkedBlockingQueue\`, \`ArrayBlockingQueue\`): Kolejki blokujące wątki przy próbie pobrania z pustej kolejki (\`take()\`) lub zapisu do pełnej kolejki (\`put()\`). Kluczowy element wzorca **Producent-Konsument**.
`
    },
    {
      title: "4. Procesory Adnotacji (Annotation Processors)",
      content: `
W przeciwieństwie do generatorów źródłowych (Source Generators) w C#, Java od wersji 6 posiada mechanizm **Annotation Processing Tool (APT)**, zintegrowany bezpośrednio z kompilatorem \`javac\`.

Procesory adnotacji skanują kod źródłowy w poszukiwaniu adnotacji w czasie kompilacji i mogą generować dodatkowe pliki źródłowe Java (\`.java\`), pliki zasobów lub klasy. Zapewnia to zerowy narzut wydajnościowy w runtime (brak refleksji).

Najważniejsze zastosowania APT w ekosystemie Java:
1. **Lombok**: Modyfikuje bezpośrednio drzewo AST kodu w pamięci kompilatora, wstrzykując metody takie jak gettery, settery, konstruktory, \`builder()\` i \`toString()\` na podstawie adnotacji:
   \`\`\`java
   @Getter @Setter @Builder
   public class User {
       private String name;
       private int age;
   } // Metody getName(), setName(), build() itp. są generowane przy kompilacji
   \`\`\`
2. **MapStruct**: Generuje w czasie kompilacji kod klas mapujących (mappery typu DTO-Entity), który wykonuje zwykłe, szybkie przypisania pól \`get/set\`, zastępując refleksję.
`
    }
  ],
  quiz: [
    {
      question: "Kiedy najlepiej zastosować ReentrantReadWriteLock zamiast zwykłego ReentrantLock?",
      options: [
        "W aplikacjach jednowątkowych.",
        "W scenariuszach, w których operacje odczytu danych są wykonywane znacznie częściej niż operacje zapisu/modyfikacji.",
        "Gdy zależy nam na szyfrowaniu zapisywanych obiektów.",
        "Tylko podczas pracy z bazami danych SQL."
      ],
      answer: 1,
      explanation: "ReadWriteLock pozwala wielu wątkom na jednoczesny odczyt (współdzielenie), a blokuje tylko przy zapisie. Sprawdza się to doskonale przy dużej przewadze odczytów."
    },
    {
      question: "Czym różni się CountDownLatch od CyclicBarrier?",
      options: [
        "CountDownLatch jest przeznaczony do pracy na stercie, a CyclicBarrier na stosie.",
        "CountDownLatch służy do zliczania wyjątków, a CyclicBarrier do ich generowania.",
        "CountDownLatch jest synchronizatorem jednorazowym (jego licznik po spadku do zera nie może być zresetowany), podczas gdy CyclicBarrier może być używany wielokrotnie po zresetowaniu.",
        "CyclicBarrier nie może współpracować z pulami wątków."
      ],
      answer: 2,
      explanation: "CountDownLatch po otwarciu bramy pozostaje otwarty na stałe (latch). CyclicBarrier pozwala grupie wątków na wielokrotne cykliczne czekanie na siebie w rundach."
    },
    {
      question: "W jaki sposób Annotation Processors (np. Lombok, MapStruct) wpływają na wydajność aplikacji w runtime?",
      options: [
        "Spowalniają aplikację, ponieważ stale analizują kod przez refleksję.",
        "Mają zerowy wpływ na wydajność w runtime, ponieważ generują lub modyfikują kod w czasie kompilacji (aplikacja uruchamia się z gotowym kodem Java).",
        "Wymagają instalacji agenta JVM.",
        "Zwiększają zużycie pamięci heap o 50%."
      ],
      answer: 1,
      explanation: "Annotation Processors działają wyłącznie na etapie kompilacji (build-time). Wygenerowany kod staje się częścią kodu bajtowego pliku class, przez co uruchomienie programu nie ponosi żadnego kosztu refleksji."
    }
  ]
};
