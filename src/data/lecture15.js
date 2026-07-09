export const lecture15 = {
  id: "15",
  title: "Wykład 15: Architektura JVM, Odśmiecanie Pamięci (GC) & GraalVM AOT",
  description: "Zaawansowany przegląd wnętrza Wirtualnej Maszyny Javy: organizacja pamięci heap/non-heap, typy i tuning Garbage Collectorów, Ahead-of-Time compilation (GraalVM Native Image) oraz detale techniczne Virtual Threads.",
  sections: [
    {
      title: "1. Struktura Pamięci JVM (Memory Layout)",
      content: `
Pamięć alokowana przez maszynę JVM dzieli się na dwa główne obszary: **Heap (Sterta)** oraz **Non-Heap (Obszary poza stertą)**.

### 1. Pamięć Heap (Sterta):
Przechowuje wszystkie obiekty i tablice stworzone przez aplikację. Podlega automatycznemu odśmiecaniu przez Garbage Collector. Od czasów Javy 8 sterta dzieli się tradycyjnie na generacje (Generational Heap):
* **Young Generation (Młoda Generacja)**: Tu trafiają nowo utworzone obiekty. Składa się z:
  * **Eden Space**: Miejsce pierwszej alokacji.
  * **Survivor Spaces (S0 / S1)**: Obszary przejściowe, w których obiekty są kopiowane i "starzeją się" (aging) podczas szybkich cykli odśmiecania (Minor GC).
* **Old Generation (Tenured Generation)**: Przechowuje długożyjące obiekty przeniesione z generacji młodej po przeżyciu określonej liczby cykli odśmiecania. Odśmiecana rzadziej (Major / Full GC).

### 2. Pamięć Non-Heap:
Obszary pamięci nieregulowane przez standardowy stertowy GC:
* **Metaspace (od Java 8)**: Przechowuje metadane klas, metody i tabele symboli (zastąpił stary obszar *PermGen*, alokowany bezpośrednio z pamięci natywnej RAM).
* **Thread Stacks (Stosy Wątków)**: Każdy wątek fizyczny otrzymuje własny stos przeznaczony na ramki metod i zmienne lokalne (typy proste i referencje).
* **Code Cache**: Miejsce, w którym kompilator JIT przechowuje skompilowany kod natywny maszynowy.
`
    },
    {
      title: "2. Przegląd i Tuning Garbage Collectorów",
      content: `
Wybór odpowiedniego odśmiecania (Garbage Collector - GC) zależy od wymagań aplikacji co do przepustowości (throughput) oraz czasu opóźnień (latency):

* **Serial GC (\`-XX:+UseSerialGC\` )**: Używa jednego wątku do odśmiecania. Zatrzymuje całą aplikację (Stop-The-World). Dobry do bardzo małych mikroserwisów o minimalnym zużyciu pamięci RAM.
* **Parallel GC (\`-XX:+UseParallelGC\` )**: Używa wielu wątków w celu zmaksymalizowania przepustowości procesora. Powoduje pauzy Stop-The-World, ale jest idealny do zadań wsadowych (batch processing).
* **G1 GC (\`-XX:+UseG1GC\` )**: Domyślny odśmiecacz od Javy 9. Dzieli stertę na małe regiony i odśmieca te o największej liczbie śmieci w pierwszej kolejności. Dąży do zachowania określonego, niskiego czasu pauz (np. max 200ms).
* **ZGC (\`-XX:+UseZGC\` )**: Nowoczesny odśmiecacz o ultra niskich opóźnieniach (Zero-Pause / Sub-millisecond latency). Wykonuje niemal całą pracę współbieżnie z działaniem aplikacji, nawet na stertach o rozmiarach wielu terabajtów. Od Javy 21 wspiera podział na generacje (z flagą \`-XX:+ZGenerational\`; od Javy 23 tryb generacyjny jest domyślny).
* **Shenandoah GC (\`-XX:+UseShenandoahGC\` )**: Alternatywa o podobnych celach, rozwijana przez Red Hat i dostępna w OpenJDK od Javy 12, również oferująca niskie pauzy niezależnie od rozmiaru sterty.

### Podstawowe parametry tuningu:
* \`-Xms<rozmiar>\`: Początkowa wielkość sterty (np. \`-Xms2g\`).
* \`-Xmx<rozmiar>\`: Maksymalna wielkość sterty (np. \`-Xmx4g\`).
* \`-XX:MaxGCPauseMillis=<ms>\`: Wskazówka dla G1 GC dotycząca maksymalnego dopuszczalnego czasu pauzy.
`
    },
    {
      title: "3. GraalVM i Kompilacja AOT (Ahead-of-Time)",
      content: `
Tradycyjnie kod Javy uruchamia się w trybie JIT (Just-In-Time) - proces kompilacji do kodu maszynowego następuje przy każdym uruchomieniu aplikacji po jej \"rozgrzaniu\". Powoduje to powolny start aplikacji (cold start) i wysokie początkowe zużycie pamięci.

**GraalVM** to alternatywne środowisko uruchomieniowe JDK, które oferuje kompilator **Ahead-of-Time (AOT)**. Umożliwia on skompilowanie aplikacji Java bezpośrednio do samodzielnego pliku wykonywalnego (**Native Image**) dla danego systemu operacyjnego (np. plik \`.exe\` na Windowsie lub binarka Linuxa).

Porównanie JIT vs AOT (GraalVM):

| Cecha | JIT (Standard JVM) | AOT (GraalVM Native Image) |
| :--- | :--- | :--- |
| **Czas startu** | Sekundy (rozgrzewanie kompilatora) | Milisekundy (natychmiastowy start) |
| **Zużycie RAM** | Wysokie (metadane JVM, JIT, kompilator) | Niskie (brak JIT kompilatora i standardowego classloadera — aplikacja zawiera lekki runtime SubstrateVM z własnym GC) |
| **Rozmiar dystrybucyjny** | Wymaga instalacji JDK/JRE | Samodzielny, mały plik binarny |
| **Maksymalna wydajność** | Bardzo wysoka (dzięki optymalizacjom profilowanym w runtime) | Nieco niższa w długim horyzoncie czasowym |
| **Ograniczenia** | Brak | Ograniczenia refleksji (wymaga deklaracji w plikach JSON), dynamicznego ładowania klas |

GraalVM Native Image jest kluczowym elementem nowoczesnych frameworków chmurowych (np. Quarkus, Spring Boot 3 Native, Micronaut) uruchamianych w architekturze Serverless / Kubernetes, gdzie liczy się błyskawiczny start i minimalne zużycie RAM.
`
    },
    {
      title: "4. Wirtualne Wątki: Szczegóły Implementacji i Blokowanie (Pinning)",
      content: `
Choć wirtualne wątki (Virtual Threads) drastycznie upraszczają współbieżność I/O, programista musi rozumieć ich fizyczną implementację w celu uniknięcia pułapek wydajnościowych:

### Scheduler i Carrier Threads:
Wirtualne wątki są mapowane na wątki platformowe (Carrier Threads) przez wewnętrzny scheduler JVM oparty na **\`ForkJoinPool\`**. Kiedy wątek wirtualny wykonuje operację blokującą na poziomie standardowej biblioteki Java (np. \`Socket.read()\`, \`Lock.lock()\`), JVM automatycznie zdejmuje go (yield/unmount) ze stosu wątku Carrier i zapisuje jego ramki stosu na stercie (Heap).

### Problem Przyszpilenia (Thread Pinning):
Zdarzają się sytuacje, w których wirtualny wątek **nie może** zostać odmontowany od wątku nośnego (Carrier Thread). Zjawisko to nazywa się **Thread Pinning (przyszpilenie)**. Kiedy wątek wirtualny jest przyszpilony, jego blokada blokuje fizyczny wątek platformy, niwecząc korzyści wydajnościowe.

Przyszpilenie występuje w dwóch przypadkach:
1. Gdy wątek wirtualny wykonuje kod wewnątrz bloku lub metody **\`synchronized\`**:
   \`\`\`java
   // ANTYWZORZEC dla Wątków Wirtualnych:
   public synchronized void doSomething() {
       // Operacja blokująca I/O przyszpili wątek wirtualny do wątku Carrier!
       Thread.sleep(1000); 
   }
   // ROZWIĄZANIE: Zamiana synchronized na ReentrantLock!
   \`\`\`
2. Gdy wątek wirtualny wywołuje funkcję natywną poprzez **JNI** lub **FFM API**.

> [!IMPORTANT]
> W aplikacjach przeznaczonych do uruchamiania na wątkach wirtualnych (Java 21+), należy bezwzględnie zastąpić synchronizację blokami \`synchronized\` na rzecz klas \`ReentrantLock\`, które nie powodują przyszpilania wątków wirtualnych.
`
    }
  ],
  quiz: [
    {
      question: "Gdzie w strukturze pamięci JVM (od Java 8) przechowywane są metadane klas?",
      options: [
        "Eden Space",
        "Survivor Space",
        "Metaspace (część pamięci Non-Heap alokowana z pamięci fizycznej RAM)",
        "Old Generation"
      ],
      answer: 2,
      explanation: "W Javie 8 usunięto obszar PermGen ze sterty i zastąpiono go obszarem Metaspace, który jest alokowany z natywnej pamięci RAM i rośnie dynamicznie."
    },
    {
      question: "Który Garbage Collector oferuje ultra niskie opóźnienia (poniżej milisekundy), działając współbieżnie z wątkami aplikacji?",
      options: [
        "Serial GC",
        "Parallel GC",
        "ZGC (Z Garbage Collector)",
        "G1 GC"
      ],
      answer: 2,
      explanation: "ZGC to nowoczesny odśmiecacz o niskich opóźnieniach. Został zaprojektowany w celu minimalizacji pauz Stop-The-World do wartości poniżej 1ms, bez względu na rozmiar sterty."
    },
    {
      question: "Na czym polega zjawisko przyszpilenia (Thread Pinning) wątku wirtualnego w Javie 21?",
      options: [
        "Na zablokowaniu Garbage Collectora przez wątek wirtualny.",
        "Na trwałym przypisaniu wątku wirtualnego do pamięci Metaspace.",
        "Sytuacja, w której wirtualny wątek wykonuje kod wewnątrz bloku synchronized (lub kodu natywnego) i blokada I/O powoduje fizyczne zablokowanie wątku nośnego (Carrier Thread), co uniemożliwia schedulerowi przełączenie kontekstu.",
        "Na automatycznym zamknięciu wątku przez system operacyjny."
      ],
      answer: 3,
      explanation: "Przyszpilenie uniemożliwia JVM odmontowanie wątku wirtualnego. Występuje głównie w blokach 'synchronized' wykonujących I/O. Rozwiązaniem jest migracja na ReentrantLock."
    }
  ]
};
