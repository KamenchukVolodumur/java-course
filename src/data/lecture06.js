export const lecture06 = {
  id: "06",
  title: "Wykład 06: Strumienie Wejścia/Wyjścia, System Plików i Programowanie Reaktywne",
  description: "Omówienie klasycznego I/O (strumienie bajtowe i znakowe), nowoczesnego NIO.2 (Files, Path), obsługi archiwów ZIP oraz podstaw programowania reaktywnego w oparciu o Java Flow API.",
  sections: [
    {
      title: "1. Klasyczne Strumienie I/O (java.io)",
      content: `
Klasyczne wejście/wyjście w Javie opiera się na koncepcji strumieni danych (Streams), które reprezentują jednokierunkowy przepływ danych. Dzielimy je na dwie główne rodziny:

### 1. Strumienie bajtowe (Byte Streams):
Służą do pracy z surowymi danymi binarnymi (np. pliki graficzne, dźwiękowe, binarne). Ich klasy bazowe to:
* **\`InputStream\`**: Klasa abstrakcyjna dla strumieni wejściowych (np. \`FileInputStream\`).
* **\`OutputStream\`**: Klasa abstrakcyjna dla strumieni wyjściowych (np. \`FileOutputStream\`).

### 2. Strumienie znakowe (Character Streams):
Służą do pracy z plikami tekstowymi. Automatycznie obsługują kodowanie znaków (np. UTF-8). Ich klasy bazowe to:
* **\`Reader\`**: Klasa abstrakcyjna do odczytu znaków (np. \`FileReader\`, \`BufferedReader\`).
* **\`Writer\`**: Klasa abstrakcyjna do zapisu znaków (np. \`FileWriter\`, \`BufferedWriter\`).

### Strumienie buforowane (Buffered Streams):
Domyślne operacje I/O na dysku są bardzo kosztowne. Aby zwiększyć wydajność, należy owijać standardowe strumienie w ich wersje buforowane, które czytają dane dużymi blokami do pamięci podręcznej (RAM):
\`\`\`java
try (BufferedReader reader = new BufferedReader(new FileReader("plik.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} // automatyczne zamknięcie strumienia
\`\`\`
`
    },
    {
      title: "2. Nowoczesny System Plików: NIO.2 (java.nio.file)",
      content: `
Pakiet NIO.2 (Non-blocking I/O) wprowadzony w Javie 7 zastępuje starą klasę \`java.io.File\` nowym, bardziej elastycznym i bezpiecznym API opartym na trzech głównych elementach:

1. **\`java.nio.file.Path\`**: Reprezentuje ścieżkę do pliku lub katalogu w systemie operacyjnym (niezależną od platformy). Ścieżki tworzymy za pomocą metody statycznej \`Path.of()\` lub \`Paths.get()\`.
2. **\`java.nio.file.Files\`**: Klasa narzędziowa zawierająca statyczne metody do operacji na plikach i katalogach (tworzenie, usuwanie, kopiowanie, sprawdzanie atrybutów, czytanie zawartości).
3. **\`java.nio.file.FileSystem\`**: Reprezentuje system plików.

Przykłady użycia NIO.2:
\`\`\`java
Path path = Path.of("dokumenty/dane.txt");

// Sprawdzenie istnienia pliku
boolean exists = Files.exists(path);

// Odczytanie wszystkich linii jako lista stringów
List<String> lines = Files.readAllLines(path);

// Zapisanie tekstu do pliku
Files.writeString(path, "Nowa zawartość", StandardOpenOption.CREATE, StandardOpenOption.WRITE);

// Szybkie kopiowanie pliku
Path destination = Path.of("kopia/dane_kopia.txt");
Files.copy(path, destination, StandardCopyOption.REPLACE_EXISTING);
\`\`\`
`
    },
    {
      title: "3. Obsługa Archiwów (ZIP)",
      content: `
Java umożliwia łatwe tworzenie i rozpakowywanie archiwów zip przy użyciu strumieni \`ZipOutputStream\` i \`ZipInputStream\` znajdujących się w pakiecie \`java.util.zip\`. Każdy plik w archiwum ZIP reprezentowany jest przez obiekt \`ZipEntry\`.

Przykład tworzenia archiwum ZIP:
\`\`\`java
Path zipFile = Path.of("archiwum.zip");
Path sourceFile = Path.of("dane.txt");

try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipFile))) {
    ZipEntry entry = new ZipEntry(sourceFile.getFileName().toString());
    zos.putNextEntry(entry);
    
    // Skopiowanie zawartości pliku do archiwum ZIP
    Files.copy(sourceFile, zos);
    zos.closeEntry();
}
\`\`\`
`
    },
    {
      title: "4. Programowanie Reaktywne: Java Flow API",
      content: `
Wprowadzone w Javie 9 **Flow API** w pakiecie \`java.util.concurrent.Flow\` implementuje standard **Reactive Streams**. Jest to wzorzec służący do asynchronicznego przetwarzania strumieni danych bez blokowania wątków i z wbudowaną kontrolą tempa producenta przez konsumenta (tzw. **Backpressure**).

Flow API definiuje 4 powiązane interfejsy:
1. **\`Flow.Publisher<T>\`**: Produkuje strumień danych i rejestruje subskrybentów. Posiada metodę \`subscribe(Subscriber<? super T> subscriber)\`.
2. **\`Flow.Subscriber<T>\`**: Konsumuje dane. Implementuje metody:
   * \`onSubscribe(Flow.Subscription subscription)\`: wywoływana na początku subskrypcji.
   * \`onNext(T item)\`: odbiera kolejny element danych.
   * \`onError(Throwable throwable)\`: odbiera powiadomienie o błędzie (zamyka subskrypcję).
   * \`onComplete()\`: odbiera powiadomienie o zakończeniu strumienia.
3. **\`Flow.Subscription\`**: Reprezentuje powiązanie subskrybenta z wydawcą. Subskrybent używa jej do żądania kolejnych elementów (\`request(long n)\`) lub rezygnacji (\`cancel()\`). Zapobiega to przepełnieniu pamięci subskrybenta (Backpressure).
4. **\`Flow.Processor<T, R>\`**: Działa jednocześnie jako \`Subscriber\` oraz \`Publisher\`. Służy do transformacji strumienia danych z typu T na typ R.
`
    }
  ],
  quiz: [
    {
      question: "Jaka jest podstawowa różnica między strumieniami znakowymi (Reader/Writer) a bajtowymi (InputStream/OutputStream)?",
      options: [
        "Strumienie znakowe pracują na plikach na dysku, a bajtowe tylko w sieci.",
        "Strumienie znakowe odczytują/zapisują tekst z uwzględnieniem kodowania znaków (np. UTF-8), podczas gdy bajtowe operują na surowych bajtach (binarnie).",
        "Strumienie bajtowe są automatycznie buforowane, a znakowe nie.",
        "Strumienie znakowe zostały wycofane z użycia w Javie 8."
      ],
      answer: 1,
      explanation: "Reader i Writer zostały wprowadzone w celu poprawnej obsługi internacjonalizacji i kodowania znaków tekstowych. Strumienie bajtowe operują na surowych bajtach (dane binarne)."
    },
    {
      question: "Która klasa w pakiecie NIO.2 zawiera statyczne metody operacji na plikach (np. Files.exists(), Files.copy())?",
      options: [
        "Path",
        "Files",
        "FileSystem",
        "File"
      ],
      answer: 1,
      explanation: "java.nio.file.Files to klasa narzędziowa zawierająca kilkadziesiąt statycznych metod służących do operowania na plikach i katalogach."
    },
    {
      question: "Co to jest Backpressure w kontekście Flow API?",
      options: [
        "Zjawisko cofania się danych w strumieniu wejściowym.",
        "Mechanizm kontroli przepływu, pozwalający Subskrybentowi na zgłaszanie liczby elementów, które jest w stanie przetworzyć (poprzez metodę Subscription.request(n)), zapobiegając przepełnieniu pamięci konsumenta przez zbyt szybki Publisher.",
        "Błąd sieciowy występujący w aplikacjach TCP.",
        "Metoda automatycznego zamykania zasobów w bloku try."
      ],
      answer: 1,
      explanation: "Backpressure to kluczowy element Reactive Streams. Subskrybent kontroluje tempo nadawania, prosząc o kolejne porcje danych (request(n)), dzięki czemu wydawca nie zasypie go danymi."
    }
  ]
};
