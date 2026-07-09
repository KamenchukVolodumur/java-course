export const lecture12 = {
  id: "12",
  title: "Wykład 12: Pamięć Poza-Stertowa (Off-Heap), Mapowanie Pamięci i Klasa Unsafe",
  description: "Zarządzanie pamięcią na poziomie zaawansowanym: mapowanie plików (MappedByteBuffer), bezpośrednie operacje na pamięci za pomocą sun.misc.Unsafe oraz nowoczesne API pamięci obcej (Project Panama).",
  sections: [
    {
      title: "1. Pliki Mapowane w Pamięci (MappedByteBuffer)",
      content: `
Domyślne czytanie plików przez tradycyjne I/O wymaga kopiowania danych z bufora jądra systemu operacyjnego (Kernel Space) do bufora przestrzeni użytkownika JVM (User Space). 

Do pracy z ogromnymi plikami o najwyższej wydajności służy **Mapowanie Pamięci (Memory-Mapped Files)** dostępne w NIO.2 poprzez klasę **\`MappedByteBuffer\`**.

Mechanizm ten mapuje fizyczny plik bezpośrednio do wirtualnej pamięci adresowej procesu. Z punktu widzenia aplikacji, plik wygląda jak gigantyczna tablica w pamięci RAM, a system operacyjny zajmuje się automatycznym doczytywaniem stron pliku z dysku (page fault) w tle i synchronizacją zmian.

Przykład użycia:
\`\`\`java
Path path = Path.of("ogromny_plik.dat");

try (FileChannel channel = FileChannel.open(path, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
    // Mapowanie 10 megabajtów pliku do pamięci
    MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 10 * 1024 * 1024);
    
    // Zapis pod konkretną pozycję (niezwykle szybki)
    buffer.put(100, (byte) 42);
    
    // Odczyt z pozycji
    byte val = buffer.get(100); // 42
    
    // Wymuszenie zapisu zmian na dysk
    buffer.force();
}
\`\`\`

Zalety:
* Błyskawiczny dostęp do losowych fragmentów pliku.
* Dane nie podlegają Garbage Collectorowi (ponieważ leżą w pamięci poza stertą JVM - **Off-Heap**).
* Możliwość współdzielenia pamięci między procesami.
`
    },
    {
      title: "2. Klasa sun.misc.Unsafe",
      content: `
Klasa \`sun.misc.Unsafe\` to wewnętrzne, nieoficjalne API maszyny JVM, które daje programiście Java niskopoziomowe możliwości zbliżone do języków C/C++:
* Alokacja i zwalnianie pamięci poza stertą (\`allocateMemory()\`, \`freeMemory()\`).
* Bezpośrednie czytanie/zapisywanie wartości pod adresem pamięci (pointer-like access).
* Pobieranie fizycznych przesunięć pól (offsets) w strukturze klasy.
* Operacje atomowe Compare-And-Swap (CAS) używane do budowania struktur lock-free.

Instancję \`Unsafe\` można pobrać tylko za pomocą refleksji, gdyż bezpośrednie pobranie jest blokowane:
\`\`\`java
Field theUnsafeField = Unsafe.class.getDeclaredField("theUnsafe");
theUnsafeField.setAccessible(true);
Unsafe unsafe = (Unsafe) theUnsafeField.get(null);

// Ręczna alokacja 4 bajtów pamięci off-heap
long memoryAddress = unsafe.allocateMemory(4);

// Zapis wartości int bezpośrednio pod adresem
unsafe.putInt(memoryAddress, 9999);

// Odczyt wartości
int value = unsafe.getInt(memoryAddress); // 9999

// Ręczne zwolnienie pamięci (brak zwolnienia skutkuje leakem pamięci systemowej!)
unsafe.freeMemory(memoryAddress);
\`\`\`

> [!CAUTION]
> Użycie \`Unsafe\` wyłącza wszelkie zabezpieczenia JVM. Błędy takie jak wyjście poza zaalokowaną pamięć (segmentation fault) powodują natychmiastowe zawieszenie całej wirtualnej maszyny (JVM crash), a brak ręcznego zwalniania alokacji prowadzi do wycieków pamięci systemowej.

> [!WARNING]
> **Deprecation**: Od JDK 23 metody dostępu do pamięci w \`sun.misc.Unsafe\` są oznaczone jako terminally deprecated. Od JDK 24 generowane są ostrzeżenia w runtime, a od JDK 26 metody te domyślnie wyrzucają wyjątek (wymagana flaga \`--sun-misc-unsafe-memory-access=allow\`). Oficjalnymi zamiennikami są \`VarHandle\` (od JDK 9, dla pamięci na stercie) oraz FFM API (od JDK 22, dla pamięci poza stertą). Na JDK 17+ wymagana jest również flaga \`--add-opens java.base/sun.misc=ALL-UNNAMED\` aby uzyskać refleksyjny dostęp do pola \`theUnsafe\`.
`
    },
    {
      title: "3. Nowoczesny Standard: Foreign Function & Memory API (Project Panama)",
      content: `
W celu zastąpienia niebezpiecznej klasy \`Unsafe\` oraz powolnego interfejsu JNI, w nowszych wersjach Javy (ostatecznie stabilne w Java 22+) w ramach projektu **Panama** wprowadzono **Foreign Function & Memory (FFM) API**.

FFM API umożliwia bezpieczną, wydajną alokację pamięci off-heap oraz wywoływanie funkcji w bibliotekach natywnych (C/C++).

Główne abstrakcje FFM:
* **\`MemorySegment\`**: Reprezentuje ciągły obszar pamięci (on-heap lub off-heap).
* **\`Arena\`**: Kontroluje cykl życia i zwalniania segmentów pamięci (np. blokowe zwalnianie przy zamknięciu areny).

Przykład bezpiecznej alokacji off-heap:
\`\`\`java
// Użycie areny w bloku try-with-resources automatycznie zwalnia całą pamięć off-heap na końcu!
try (Arena arena = Arena.ofConfined()) {
    // Alokacja miejsca na 10 liczb całkowitych int (10 * 4 bajty = 40 bajtów)
    MemorySegment segment = arena.allocate(40);
    
    // Zapisanie wartości
    for (int i = 0; i < 10; i++) {
        segment.setAtIndex(ValueLayout.JAVA_INT, i, i * 10);
    }
    
    // Odczytanie wartości
    int val = segment.getAtIndex(ValueLayout.JAVA_INT, 5); // 50
} // Pamięć off-heap jest bezpiecznie i automatycznie zwalniana w tym miejscu!
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Co dzieje się z danymi zapisanymi w pamięci Off-Heap (poza stertą JVM), np. w MappedByteBuffer?",
      options: [
        "Są automatycznie czyszczone przez Garbage Collector w krótkich odstępach czasu.",
        "Nie są widoczne dla Garbage Collectora, co zapobiega pauzom Stop-The-World, ale programista musi dbać o ich poprawne zwalnianie.",
        "Są szyfrowane przez system operacyjny.",
        "Zostają usunięte natychmiast po wywołaniu dowolnej metody na obiekcie String."
      ],
      answer: 1,
      explanation: "Pamięć Off-Heap leży poza stertą zarządzaną przez JVM. Dzięki temu nie obciąża ona Garbage Collectora (brak GC pauses), ale wymaga odpowiedzialnego zarządzania alokacjami."
    },
    {
      question: "Dlaczego bezpośrednie korzystanie z klasy sun.misc.Unsafe jest odradzane?",
      options: [
        "Unsafe działa bardzo wolno.",
        "Wyłącza ono wszystkie zabezpieczenia JVM (np. brak weryfikacji granic pamięci), co przy najmniejszym błędzie może spowodować awarię i zamknięcie całej maszyny JVM (crash).",
        "Wycofano ją całkowicie z biblioteki standardowej bez zamiennika w Java 11.",
        "Wymaga posiadania licencji Oracle."
      ],
      answer: 1,
      explanation: "Klasa Unsafe pozwala na pisanie kodu w stylu C (operacje na wskaźnikach, alokacja malloc/free). Dowolny błąd (np. zapis pod niewłaściwy adres) powoduje awarię procesu (JVM crash) zamiast kontrolowanego wyjątku."
    },
    {
      question: "Jaki element z FFM API (Project Panama) kontroluje cykl życia i automatyczne zwalnianie obszarów pamięci off-heap?",
      options: [
        "MemorySegment",
        "Arena",
        "Garbage Collector",
        "Unsafe"
      ],
      answer: 1,
      explanation: "Arena zarządza alokacjami pamięci i implementuje interfejs AutoCloseable. Zamknięcie areny automatycznie zwalnia wszystkie powiązane z nią segmenty pamięci off-heap."
    }
  ]
};
