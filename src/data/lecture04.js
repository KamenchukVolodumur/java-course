export const lecture04 = {
  id: "04",
  title: "Wykład 04: Programowanie Funkcjonalne & Kolekcje",
  description: "Wprowadzenie do programowania funkcyjnego w Javie (wyrażenia lambda, interfejsy funkcyjne, referencje do metod) oraz przegląd struktur danych w Java Collections Framework.",
  sections: [
    {
      title: "1. Metody Domyślne w Interfejsach (Default Methods)",
      content: `
Przed wersją Java 8 dodanie nowej metody do interfejsu wymuszało modyfikację wszystkich klas, które go implementowały. W celu zapewnienia kompatybilności wstecznej (szczególnie przy wprowadzaniu biblioteki Stream API), Java 8 wprowadziła **metody domyślne (default methods)**.

Metoda domyślna posiada domyślną implementację wewnątrz interfejsu, oznaczoną słowem kluczowym \`default\`. Klasy implementujące interfejs mogą (ale nie muszą) ją nadpisać.

\`\`\`java
public interface Logger {
    void log(String message); // Metoda abstrakcyjna

    default void logWarning(String message) {
        log("[WARNING] " + message); // Metoda domyślna
    }
}
\`\`\`

### Problem wielokrotnego dziedziczenia metod domyślnych (Diament):
Jeśli klasa implementuje dwa interfejsy posiadające metody domyślne o tej samej sygnaturze, kompilator zgłosi błąd. Programista musi ręcznie rozstrzygnąć konflikt w klasie implementującej:

\`\`\`java
public class CustomLogger implements LoggerA, LoggerB {
    @Override
    public void logWarning(String message) {
        // Jawne wywołanie konkretnej implementacji
        LoggerA.super.logWarning(message); 
    }
}
\`\`\`
`
    },
    {
      title: "2. Interfejsy Funkcyjne i Wyrażenia Lambda",
      content: `
**Interfejs Funkcyjny (Functional Interface)** to interfejs posiadający **dokładnie jedną metodę abstrakcyjną** (może zawierać wiele metod domyślnych lub statycznych). Zazwyczaj oznacza się go adnotacją \`@FunctionalInterface\`.

Wyrażenie lambda to anonimowa implementacja interfejsu funkcyjnego, pozwalająca traktować kod jako dane (przekazywać funkcje jako parametry).

Pakiet \`java.util.function\` definiuje standardowe interfejsy funkcyjne:
1. **\`Predicate<T>\`**: Przyjmuje argument typu T, zwraca \`boolean\` (metoda \`test(T t)\`).
2. **\`Consumer<T>\`**: Przyjmuje argument typu T, nic nie zwraca (metoda \`accept(T t)\`).
3. **\`Supplier<T>\`**: Nie przyjmuje argumentów, zwraca wartość typu T (metoda \`get()\`).
4. **\`Function<T, R>\`**: Przyjmuje argument typu T, zwraca wartość typu R (metoda \`apply(T t)\`).
5. **\`BiFunction<T, U, R>\`**: Przyjmuje argumenty typów T i U, zwraca R.

Przykład użycia lambd:
\`\`\`java
// Predicate
Predicate<String> isNotEmpty = s -> !s.isEmpty();
boolean check = isNotEmpty.test("Java"); // true

// Consumer
Consumer<String> printer = text -> System.out.println(text);
printer.accept("Uruchamianie Consumer...");
\`\`\`
`
    },
    {
      title: "3. Referencje do Metod (Method References)",
      content: `
Referencja do metody to skrócony zapis wyrażenia lambda, który odwołuje się do istniejącej metody za pomocą operatora \`::\`.

Mamy cztery rodzaje referencji do metod:
1. **Do metody statycznej**: \`ClassName::staticMethodName\` (np. \`Integer::parseInt\` zamiast \`s -> Integer.parseInt(s)\`).
2. **Do metody instancji konkretnego obiektu**: \`containingObject::instanceMethodName\` (np. \`System.out::println\` zamiast \`x -> System.out.println(x)\`).
3. **Do metody instancji obiektu dowolnego typu, przekazanego jako parametr**: \`ClassName::instanceMethodName\` (np. \`String::toUpperCase\` zamiast \`s -> s.toUpperCase()\`).
4. **Do konstruktora**: \`ClassName::new\` (np. \`ArrayList::new\` zamiast \`() -> new ArrayList<>()\`).
`
    },
    {
      title: "4. Java Collections Framework (JCF)",
      content: `
Java Collections Framework (JCF) to ujednolicona architektura służąca do reprezentowania i manipulowania kolekcjami danych. Wszystkie główne kolekcje znajdują się w pakiecie \`java.util\` i dziedziczą po głównym interfejsie \`Collection<E>\` (z wyjątkiem map).

### Najważniejsze interfejsy i ich implementacje:

#### 1. List (Uporządkowana lista elementów, dopuszcza duplikaty):
* **\`ArrayList\`**: Oparta na dynamicznej tablicy. Zapewnia stały czas dostępu \`O(1)\` przy odczycie po indeksie, ale usuwanie/wstawianie w środku trwa \`O(n)\`. Jest to domyślna implementacja.
* **\`LinkedList\`**: Implementacja w postaci listy dwukierunkowej. Szybkie wstawianie/usuwanie na końcach \`O(1)\`, ale wolny dostęp po indeksie \`O(n)\`. Wstawianie/usuwanie w środku wymaga uprzedniego znalezienia węzła (\`O(n)\`), choć sama operacja modyfikacji wskaźników trwa \`O(1)\`.

#### 2. Set (Kolekcja unikalnych elementów, brak duplikatów):
* **\`HashSet\`**: Oparty na tablicy mieszającej (\`HashMap\`). Bardzo szybkie operacje wstawiania, usuwania i wyszukiwania \`O(1)\`. Brak gwarancji kolejności elementów.
* **\`TreeSet\`**: Oparty na drzewie czerwono-czarnym. Elementy są automatycznie sortowane naturalnie (lub przez zadany Comparator). Wolniejsze operacje wyszukiwania i zapisu \`O(log n)\`.

#### 3. Queue (Kolejka FIFO - First-In-First-Out):
* Używana do buforowania elementów, np. \`PriorityQueue\` (kolejka priorytetowa) lub \`ArrayDeque\` (dwukierunkowa kolejka stosu/kolejki).
`
    },
    {
      title: "5. Comparable i Comparator — Porównywanie Obiektów",
      content: `
Aby sortować kolekcje obiektów lub umieszczać je w \`TreeSet\`/\`TreeMap\`, obiekty muszą być porównywalne. Java oferuje dwa mechanizmy:

### Comparable\<T\> — porządek naturalny:
Interfejs implementowany przez klasę, definiujący jej domyślny sposób porównywania:
\`\`\`java
public class Student implements Comparable<Student> {
    private String name;
    private double gpa;

    @Override
    public int compareTo(Student other) {
        return Double.compare(this.gpa, other.gpa); // Sortowanie po GPA rosnąco
    }
}

// Użycie:
Collections.sort(students); // Użyje compareTo()
\`\`\`

### Comparator\<T\> — porządek zewnętrzny:
Interfejs funkcyjny definiujący alternatywny sposób porównywania, niezależny od klasy:
\`\`\`java
// Sortowanie po nazwisku (Comparator jako lambda)
students.sort(Comparator.comparing(Student::getName));

// Sortowanie po GPA malejąco, a przy remisie — po nazwisku rosnąco
students.sort(
    Comparator.comparingDouble(Student::getGpa).reversed()
              .thenComparing(Student::getName)
);
\`\`\`

> [!TIP]
> Zasada: \`Comparable\` definiujesz raz w klasie (porządek naturalny). \`Comparator\` tworzysz na zewnątrz, kiedy potrzebujesz wielu różnych sortowań.
`
    },
    {
      title: "6. Text Blocks — Wieloliniowe Napisy (Java 15+)",
      content: `
Od Javy 15 dostępne są **Text Blocks** — wieloliniowe literały tekstowe otoczone potrójnymi cudzysłowami. Automatycznie obsługują wcięcia, znaki nowej linii i nie wymagają escapeowania cudzysłowów wewnątrz tekstu.

Porównanie tradycyjnego podejścia i Text Blocks:
\`\`\`java
// Bez Text Blocks (przed Java 15) — nieczytelne!
String json = "{" +
    "  name: Jan," +
    "  age: 25" +
    "}";

// Z Text Blocks (Java 15+) — czytelne i naturalne
// Składnia: trzy cudzysłowy otwierające, treść, trzy cudzysłowy zamykające
String json = """
        {
            "name": "Jan",
            "age": 25
        }
        """;
\`\`\`

Text Blocks idealnie nadają się do osadzania w kodzie:
* Zapytań SQL: \`SELECT * FROM users WHERE age > 18\`
* Fragmentów HTML/XML
* Szablonów JSON/YAML
* Komunikatów wieloliniowych

> [!NOTE]
> Wcięcie wspólne dla wszystkich linii jest automatycznie usuwane (incidental whitespace). Pozycja zamykających trzech cudzysłowów definiuje poziom bazowy wcięcia.
`
    },
    {
      title: "7. Czego Java nie posiada: Extension Methods i Tuples",
      content: `
Kilka konstrukcji obecnych w C# nie istnieje w Javie. Warto znać ich alternatywy:

### Brak Extension Methods:
W C# można "doczepić" nową metodę do istniejącej klasy bez jej modyfikacji. Java tego **nie wspiera**. Alternatywy:
* **Klasy narzędziowe (Utility Classes)**: Statyczne metody w klasach typu \`Collections\`, \`Arrays\`, \`Files\`, \`Objects\`:
  \`\`\`java
  // Zamiast "myList.isEmpty()" jako extension:
  Collections.unmodifiableList(myList);
  Objects.requireNonNull(value, "Wartość nie może być null");
  \`\`\`
* **Metody domyślne w interfejsach (default methods)**: Dodają nowe metody do interfejsu bez łamania istniejących implementacji — ale wymagają dziedziczenia po interfejsie.

### Brak natywnych Tuple:
Java nie posiada wbudowanych krotek (tuple). Alternatywy:
* **Record (Java 16+)** — funkcjonalnie odpowiada nazwanej krotce:
  \`\`\`java
  record Pair<A, B>(A first, B second) {}
  var result = new Pair<>("Anna", 25);
  System.out.println(result.first()); // "Anna"
  \`\`\`
* **Map.Entry\<K,V\>** — para klucz-wartość do tymczasowego użytku.
* Biblioteki: \`Pair\` z Apache Commons Lang lub JavaFX.
`
    }
  ],
  quiz: [
    {
      question: "Jaki jest główny cel wprowadzania metod domyślnych (default methods) w interfejsach Javy 8?",
      options: [
        "Umożliwienie symulacji wielokrotnego dziedziczenia stanu klasy.",
        "Ułatwienie ewolucji interfejsów bez łamania kompatybilności wstecznej z istniejącymi implementacjami.",
        "Zastąpienie klas abstrakcyjnych we wszystkich scenariuszach.",
        "Zwiększenie bezpieczeństwa poprzez ukrywanie kodu przed refleksją."
      ],
      answer: 1,
      explanation: "Metody domyślne pozwoliły na rozbudowę bibliotek standardowych (np. dodanie metody stream() do interfejsu Collection) bez konieczności modyfikowania wszystkich klas zewnętrznych implementujących te interfejsy."
    },
    {
      question: "Zapis 'System.out::println' jest przykładem czego?",
      options: [
        "Referencji do metody instancyjnej konkretnego obiektu",
        "Referencji do metody statycznej",
        "Referencji do konstruktora",
        "Przeciążania operatora wywołania metody"
      ],
      answer: 0,
      explanation: "System.out zwraca obiekt typu PrintStream. Operator :: odwołuje się do jego metody instancyjnej println. Jest to referencja do metody instancyjnej konkretnego obiektu."
    },
    {
      question: "Która kolekcja będzie najbardziej wydajna, jeśli zależy nam na błyskawicznym sprawdzaniu obecności elementu bez dbania o ich kolejność?",
      options: [
        "ArrayList",
        "LinkedList",
        "HashSet",
        "TreeSet"
      ],
      answer: 2,
      explanation: "HashSet opiera się na strukturze tablicy mieszającej i oferuje średni czas wyszukiwania O(1) (stały), co jest najszybszym rozwiązaniem."
    }
  ]
};
