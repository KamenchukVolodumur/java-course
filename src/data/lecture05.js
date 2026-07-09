export const lecture05 = {
  id: "05",
  title: "Wykład 05: Mapy, Stream API, Wyjątki Kontrolowane i Niekontrolowane",
  description: "Zaawansowane omówienie struktury Map, przetwarzania strumieniowego (Stream API) oraz systemu wyjątków (checked i unchecked exceptions).",
  sections: [
    {
      title: "1. Struktura Mapy (Map) i jej Implementacje",
      content: `
Interfejs \`java.util.Map<K, V>\` reprezentuje strukturę słownikową przechowującą asocjacje klucz-wartość. Klucze w mapie muszą być unikalne. Trzy najczęściej stosowane implementacje to:

1. **\`HashMap\`**: Oparta na tablicy mieszającej. Operacje zapisu, odczytu i usuwania trwają średnio \`O(1)\` (od Javy 8, w najgorszym przypadku \`O(log n)\` dzięki konwersji kubełków na drzewa czerwono-czarne). Kolejność elementów nie jest gwarantowana. Wymaga poprawnej implementacji metod \`equals()\` i \`hashCode()\` dla obiektów będących kluczami.
2. **\`LinkedHashMap\`**: Dziedziczy po \`HashMap\`, ale dodatkowo utrzymuje listę dwukierunkową przechodzącą przez wszystkie wpisy. Zachowuje kolejność wstawiania elementów (insertion order).
3. **\`TreeMap\`**: Oparta na drzewie czerwono-czarnym (SortedMap). Elementy są automatycznie sortowane według kluczy. Operacje trwają \`O(log n)\`.

Przykładowe operacje:
\`\`\`java
Map<String, Integer> ages = new HashMap<>();
ages.put("Anna", 28);
ages.put("Jan", 35);

// Pobranie z wartością domyślną
int age = ages.getOrDefault("Maria", 18); // 18

// Iteracja po mapie
ages.forEach((name, a) -> System.out.println(name + " ma " + a + " lat."));
\`\`\`
`
    },
    {
      title: "2. Java Stream API",
      content: `
Wprowadzone w Javie 8 **Stream API** to potężne narzędzie do deklaratywnego przetwarzania strumieni danych (kolekcji, tablic, I/O) przy użyciu paradygmatu funkcyjnego. Strumień nie przechowuje danych, lecz przesyła je przez rurociąg operacji.

Operacje na strumieniach dzielą się na dwie grupy:
1. **Operacje pośrednie (Intermediate Operations)**: Są leniwe (lazy) - nie wykonują się, dopóki nie zostanie wywołana operacja terminalna. Zwracają nowy strumień, co pozwala na ich łączenie w łańcuchy.
   * \`filter(Predicate<T>)\`: Filtruje elementy.
   * \`map(Function<T, R>)\`: Transformuje elementy z typu T na typ R.
   * \`flatMap(Function<T, Stream<R>>)\`: Spłaszcza strukturę (np. zamienia strumień list na strumień elementów).
   * \`sorted()\`, \`distinct()\`, \`limit(long)\`, \`skip(long)\`.
2. **Operacje terminalne (Terminal Operations)**: Uruchamiają przetwarzanie danych i zamykają strumień. Zwracają konkretny wynik (kolekcję, liczbę, boolean) lub nie zwracają nic.
   * \`collect(Collector)\`: Zbiera elementy do kolekcji (np. \`Collectors.toList()\`).
   * \`forEach(Consumer<T>)\`: Wykonuje akcję dla każdego elementu.
   * \`reduce(BinaryOperator<T>)\`: Agreguje elementy do jednej wartości (np. suma, iloczyn).
   * \`count()\`, \`findFirst()\`, \`anyMatch(Predicate)\`.

Przykład rurociągu Stream API:
\`\`\`java
List<String> names = List.of("Jan", "Anna", "Marek", "Aleksandra");

List<String> result = names.stream()
    .filter(name -> name.startsWith("A"))
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList()); // [ALEKSANDRA, ANNA]
\`\`\`
`
    },
    {
      title: "3. Wyjątki: Kontrolowane (Checked) vs Niekontrolowane (Unchecked)",
      content: `
Obsługa błędów w Javie opiera się na obiektach dziedziczących po klasie \`java.lang.Throwable\`. Hierarchia ta dzieli się na dwie główne gałęzie: \`Error\` (poważne błędy systemowe JVM, np. \`OutOfMemoryError\`, których program nie powinien próbować łapać) oraz \`Exception\` (błędy aplikacji).

Klasa \`Exception\` i jej podklasy dzielą się na:

### 1. Wyjątki Kontrolowane (Checked Exceptions):
Są to wszystkie klasy dziedziczące po \`Exception\` z wyłączeniem gałęzi \`RuntimeException\`.
* Kompilator **wymaga** od programisty jawnej obsługi tych wyjątków.
* Metoda, która może rzucić taki wyjątek, musi zadeklarować go w swojej sygnaturze za pomocą słowa kluczowego \`throws\` lub obsłużyć go lokalnie w bloku \`try-catch\`.
* Przykłady: \`IOException\`, \`SQLException\`, \`ClassNotFoundException\`.

### 2. Wyjątki Niekontrolowane (Unchecked / Runtime Exceptions):
Są to wszystkie klasy dziedziczące po \`RuntimeException\`.
* Kompilator **nie wymaga** ich deklarowania ani obsługi. Są to zazwyczaj błędy logiczne programisty, których można uniknąć poprzez poprawną logikę.
* Przykłady: \`NullPointerException\`, \`IllegalArgumentException\`, \`IndexOutOfBoundsException\`, \`ArithmeticException\`.

Przykład obsługi wyjątków:
\`\`\`java
public void readFile(String path) throws IOException { // Checked exception zadeklarowany
    if (path == null) {
        throw new IllegalArgumentException("Ścieżka nie może być null"); // Unchecked exception
    }
    // Logika I/O mogąca rzucić IOException
}

public void run() {
    try {
        readFile("dane.txt");
    } catch (IOException e) {
        System.err.println("Błąd odczytu pliku: " + e.getMessage());
    } finally {
        System.out.println("Blok finally wykonuje się zawsze.");
    }
}
\`\`\`
`
    },
    {
      title: "4. Tworzenie Własnych Wyjątków (Custom Exceptions)",
      content: `
W profesjonalnym kodzie Java często tworzymy własne klasy wyjątków, aby precyzyjnie opisać błędy specyficzne dla naszej domeny biznesowej.

### Własny wyjątek kontrolowany (Checked):
\`\`\`java
public class InsufficientFundsException extends Exception {
    private final double deficit;

    public InsufficientFundsException(String message, double deficit) {
        super(message);
        this.deficit = deficit;
    }

    public double getDeficit() { return deficit; }
}

// Użycie:
public void withdraw(double amount) throws InsufficientFundsException {
    if (amount > balance) {
        throw new InsufficientFundsException(
            "Brakuje środków: " + (amount - balance) + " PLN",
            amount - balance
        );
    }
    balance -= amount;
}
\`\`\`

### Własny wyjątek niekontrolowany (Unchecked):
\`\`\`java
public class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String message) {
        super(message);
    }
}
\`\`\`

> [!TIP]
> Zasada: twórz wyjątki **checked** gdy wywołujący MUSI zareagować (np. brak pliku, timeout sieci). Twórz **unchecked** gdy to błąd programisty (np. niepoprawne argumenty, zły stan obiektu).
`
    },
    {
      title: "5. Zaawansowane Collectors w Stream API",
      content: `
Oprócz \`Collectors.toList()\`, klasa \`Collectors\` oferuje potężne kolektory do agregacji i grupowania danych:

\`\`\`java
List<Student> students = List.of(
    new Student("Anna", "Informatyka", 4.8),
    new Student("Jan", "Matematyka", 3.5),
    new Student("Maria", "Informatyka", 4.2),
    new Student("Piotr", "Matematyka", 4.9)
);

// groupingBy — grupowanie po wydziale
Map<String, List<Student>> byDept = students.stream()
    .collect(Collectors.groupingBy(Student::department));
// {"Informatyka": [Anna, Maria], "Matematyka": [Jan, Piotr]}

// partitioningBy — podział na dwie grupy (true/false)
Map<Boolean, List<Student>> partition = students.stream()
    .collect(Collectors.partitioningBy(s -> s.gpa() > 4.0));
// {true: [Anna, Maria, Piotr], false: [Jan]}

// toMap — konwersja na mapę klucz-wartość
Map<String, Double> nameToGpa = students.stream()
    .collect(Collectors.toMap(Student::name, Student::gpa));

// joining — łączenie napisów z separatorem
String names = students.stream()
    .map(Student::name)
    .collect(Collectors.joining(", ", "[", "]"));
// "[Anna, Jan, Maria, Piotr]"

// Grupowanie z zagnieżdżonym kolektorem — średnia GPA per wydział
Map<String, Double> avgGpa = students.stream()
    .collect(Collectors.groupingBy(
        Student::department,
        Collectors.averagingDouble(Student::gpa)
    ));
// {"Informatyka": 4.5, "Matematyka": 4.2}
\`\`\`
`
    },
    {
      title: "6. Parallel Streams i ForkJoinPool",
      content: `
Java umożliwia równoległe przetwarzanie strumieni przez zastąpienie \`stream()\` wywołaniem \`parallelStream()\` lub dodaniem \`.parallel()\` do istniejącego strumienia:

\`\`\`java
// Sekwencyjne przetwarzanie (1 wątek)
long count = list.stream()
    .filter(s -> s.length() > 5)
    .count();

// Równoległe przetwarzanie (wiele wątków)
long count = list.parallelStream()
    .filter(s -> s.length() > 5)
    .count();
\`\`\`

Strumienie równoległe domyślnie korzystają z **Common ForkJoinPool** — puli wątków opartej na algorytmie **work-stealing** (nieaktywne wątki "kradną" zadania od zajętych).

> [!WARNING]
> **Kiedy NIE używać Parallel Streams:**
> * Dla **małych kolekcji** (< 10 000 elementów) — narzut na podział i łączenie przewyższa korzyści.
> * Gdy operacje mają **efekty uboczne** (np. modyfikacja wspólnego stanu) — ryzyko wyścigów (race conditions).
> * Gdy źródło danych ma **kiepską podzielność** (np. \`LinkedList\`, \`Stream.iterate\`) — nie da się efektywnie podzielić na fragmenty.
> * Gdy operacje są **blokujące I/O** — zablokuje wątki Common ForkJoinPool, co spowolni całą aplikację.

### ForkJoinPool — własna pula:
Jeśli nie chcemy blokować Common ForkJoinPool (np. w web serverze), możemy stworzyć dedykowaną pulę:
\`\`\`java
ForkJoinPool customPool = new ForkJoinPool(4); // 4 wątki
long result = customPool.submit(() ->
    hugeList.parallelStream()
        .filter(item -> expensiveCheck(item))
        .count()
).join();
\`\`\`

### Inne operacje równoległe:
\`\`\`java
// Równoległe sortowanie tablicy (szybsze niż Arrays.sort dla dużych tablic)
int[] data = new int[10_000_000];
Arrays.parallelSort(data);

// Równoległe ustawianie wartości
Arrays.parallelSetAll(data, i -> i * 2);
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Jaki jest czas dostępu przy odczycie wartości z HashMap, jeśli znamy jej klucz (w optymalnym przypadku)?",
      options: [
        "O(n)",
        "O(log n)",
        "O(1)",
        "O(n^2)"
      ],
      answer: 2,
      explanation: "HashMap korzysta z tablicy mieszającej (bucket array) i przelicza hashcode klucza, co pozwala na pobranie wartości w stałym czasie O(1)."
    },
    {
      question: "Co charakteryzuje operacje pośrednie (Intermediate Operations) w Stream API?",
      options: [
        "Natychmiast przetwarzają dane i zamykają strumień.",
        "Są leniwe (lazy) - nie wykonują się do czasu wywołania operacji terminalnej i zwracają nowy strumień.",
        "Można wywołać tylko jedną taką operację na strumieniu.",
        "Zawsze modyfikują oryginalną kolekcję danych."
      ],
      answer: 1,
      explanation: "Operacje pośrednie (np. filter, map) są łączone w rurociąg i nie wykonują żadnych obliczeń, dopóki nie zostanie wywołana operacja terminalna (np. collect)."
    },
    {
      question: "Czym różnią się Checked Exceptions od Unchecked Exceptions (Runtime Exceptions) pod względem kompilacji?",
      options: [
        "Checked exceptions są sprawdzane w czasie działania programu, a Unchecked w czasie kompilacji.",
        "Kompilator wymaga od programisty jawnego zadeklarowania lub obsłużenia wyjątków Checked (np. IOException), natomiast w przypadku wyjątków Unchecked (np. NullPointerException) nie ma takiego wymogu.",
        "Unchecked exceptions powodują zawieszenie JVM, a Checked nie.",
        "Nie ma żadnych różnic syntaktycznych."
      ],
      answer: 1,
      explanation: "Checked Exceptions muszą być jawnie obsłużone (try-catch) lub zadeklarowane (throws) w sygnaturze metody pod groźbą błędu kompilacji. Unchecked Exceptions nie podlegają tej restrykcji."
    }
  ]
};
