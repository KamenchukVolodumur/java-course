export const lecture03 = {
  id: "03",
  title: "Wykład 03: Modyfikatory Dostępu, Typy Wyliczeniowe, Generyki i Iteratory",
  description: "Omówienie modyfikatorów dostępu w Javie, bogatych typów Enum, różnic między typami zagnieżdżonymi a wewnętrznymi, działania generyków (Type Erasure, Wildcards, PECS) i interfejsów Iterator/Iterable.",
  sections: [
    {
      title: "1. Modyfikatory Dostępu (Access Modifiers)",
      content: `
Modyfikatory dostępu w Javie określają widoczność klas, interfejsów, konstruktorów, pól i metod. Java posiada cztery poziomy widoczności (z trzema słowami kluczowymi):

1. **\`public\`**: Element jest widoczny ze wszystkich klas w aplikacji, niezależnie od pakietu.
2. **\`protected\`**: Element jest widoczny w obrębie tego samego pakietu oraz w klasach dziedziczących (nawet w innych pakietach).
3. **domyślny (brak modyfikatora - *package-private*)**: Element jest widoczny wyłącznie dla klas znajdujących się w tym samym pakiecie.
4. **\`private\`**: Element jest widoczny wyłącznie w obrębie klasy, w której został zadeklarowany.

Tabela widoczności:

| Modyfikator | Klasa | Pakiet | Podklasa (inny pakiet) | Świat |
| :--- | :---: | :---: | :---: | :---: |
| \`public\` | TAK | TAK | TAK | TAK |
| \`protected\` | TAK | TAK | TAK | NIE |
| *package-private* | TAK | TAK | NIE | NIE |
| \`private\` | TAK | NIE | NIE | NIE |
`
    },
    {
      title: "2. Klasy Enum (Typy Wyliczeniowe)",
      content: `
W Javie \`enum\` jest pełnoprawną klasą dziedziczącą niejawnie po klasie \`java.lang.Enum\`. Oznacza to, że enumy w Javie mogą mieć pola, metody, konstruktory, a nawet implementować interfejsy.

Przykład rozbudowanego typu Enum:
\`\`\`java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);

    private final double mass;   // w kilogramach
    private final double radius; // w metrach

    // Konstruktor (zawsze prywatny!)
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    public double mass() { return mass; }
    public double radius() { return radius; }

    public double surfaceGravity() {
        final double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }
}
\`\`\`
`
    },
    {
      title: "3. Klasy Zagnieżdżone vs Wewnętrzne",
      content: `
Klasy zadeklarowane wewnątrz innych klas dzielimy na dwie kategorie:
1. **Statyczne klasy zagnieżdżone (Static Nested Classes)**: Deklarowane z modyfikatorem \`static\`. Zachowują się jak zwykłe klasy najwyższego poziomu, nie mają dostępu do niestatycznych pól i metod klasy otaczającej. Ich istnienie służy jedynie logicznemu zgrupowaniu kodu.
2. **Klasy wewnętrzne (Inner Classes)**: Deklarowane bez słowa \`static\`. Każda instancja klasy wewnętrznej jest ściśle powiązana z konkretną instancją klasy zewnętrznej i ma bezpośredni dostęp do wszystkich jej pól i metod (nawet tych oznaczonych jako \`private\`).

\`\`\`java
public class Outer {
    private String outerField = "Zewnętrzne pole";

    public static class StaticNested {
        void print() {
            // System.out.println(outerField); // BŁĄD! Brak dostępu do instancji zewnętrznej
        }
    }

    public class Inner {
        void print() {
            System.out.println(outerField); // OK! Dostęp do pola Outer.this.outerField
        }
    }
}
\`\`\`
`
    },
    {
      title: "4. Typy Generyczne (Generics) i Type Erasure",
      content: `
Generyki pozwalają na parametryzowanie typów klas i metod. Kluczową cechą generyków w Javie jest **Type Erasure (Wymazywanie Typów)**.
* Kompilator Javy sprawdza poprawność typów generycznych w czasie kompilacji, a następnie **usuwa** informacje o parametrach typów (zastępując je typem \`Object\` lub ich górną granicą - bound).
* W efekcie, skompilowany kod bajtowy nie zawiera informacji o typach generycznych. Na przykład \`List<String>\` i \`List<Integer>\` w czasie działania programu (Runtime) stają się tą samą surową klasą \`List\`.

Powoduje to pewne ograniczenia:
* Nie można wywołać \`new T()\` ani utworzyć tablicy typów generycznych (\`new T[10]\`).
* Nie można sprawdzić typu instancji za pomocą \`instanceof List<String>\` (można jedynie \`instanceof List<?> \`).
* Metody przeciążone nie mogą różnić się tylko parametrem typu generycznego.

### Wildcard Generics i zasada PECS:
Java wspiera trzy rodzaje symboli wieloznacznych (wildcards) w typach generycznych:
* **\`? extends T\`** (Upper Bounded Wildcard) — akceptuje \`T\` lub dowolny jego podtyp. Używany gdy chcemy **odczytywać** elementy z kolekcji (Producer).
* **\`? super T\`** (Lower Bounded Wildcard) — akceptuje \`T\` lub dowolny jego nadtyp. Używany gdy chcemy **dodawać** elementy do kolekcji (Consumer).
* **\`?\`** (Unbounded Wildcard) — akceptuje dowolny typ. Używany gdy nie potrzebujemy żadnych informacji o typie elementów.

Zasada **PECS (Producer Extends, Consumer Super)** pomaga wybrać właściwy wildcard:
\`\`\`java
// Producer (odczyt) — ? extends
public static double sum(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) total += n.doubleValue();
    return total;
}

// Consumer (zapis) — ? super
public static void addIntegers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}

// Metoda generyczna z ograniczeniem (bounded type)
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}
\`\`\`
`
    },
    {
      title: "5. Nullowalność (Nullability) i Optional",
      content: `
Domyślnie każda referencja w Javie może wskazywać na \`null\`. Aby uniknąć plag \`NullPointerException\` (NPE), Java oferuje klasę \`java.util.Optional<T>\`, która reprezentuje kontener mogący zawierać wartość lub być pusty.

Użycie \`Optional\`:
\`\`\`java
Optional<String> name = Optional.ofNullable(getNameFromDatabase());

// Bezpieczne pobranie wartości z wartością domyślną
String result = name.orElse("Domyślna wartość");

// Rzucenie wyjątku w przypadku braku wartości
String forcedResult = name.orElseThrow(() -> new IllegalArgumentException("Brak imienia!"));

// Wykonanie logiki, jeśli wartość istnieje
name.ifPresent(n -> System.out.println("Witaj, " + n));
\`\`\`

Dodatkowo, nowoczesne biblioteki i narzędzia statycznej analizy kodu wykorzystują adnotacje takie jak \`@NonNull\` i \`@Nullable\` do sprawdzania bezpieczeństwa referencji w czasie kompilacji.
`
    },
    {
      title: "6. Interfejsy Iterator i Iterable",
      content: `
* **\`Iterable<T>\`**: Interfejs posiadający tylko jedną abstrakcyjną metodę: \`Iterator<T> iterator()\`. Klasa implementująca \`Iterable\` deklaruje, że można po niej iterować za pomocą pętli typu foreach: \`for (T item : collection) { ... }\`.
* **\`Iterator<T>\`**: Interfejs definiujący sam obiekt nawigacyjny o metodach:
  * \`boolean hasNext()\`: zwraca prawdę, jeśli są kolejne elementy.
  * \`T next()\`: zwraca kolejny element.
  * \`void remove()\`: usuwa ostatnio zwrócony element ze struktury danych.
`
    }
  ],
  quiz: [
    {
      question: "Czym różni się klasa wewnętrzna (Inner Class) od statycznej klasy zagnieżdżonej (Static Nested Class)?",
      options: [
        "Klasa wewnętrzna ma dostęp do niestatycznych pól klasy otaczającej, natomiast statyczna klasa zagnieżdżona tego dostępu nie posiada.",
        "Statyczna klasa zagnieżdżona dziedziczy po klasie bazowej Outer, a klasa wewnętrzna nie.",
        "Klasy wewnętrzne mogą być deklarowane tylko w interfejsach.",
        "Nie ma między nimi żadnej różnicy."
      ],
      answer: 0,
      explanation: "Inner Class posiada niejawne powiązanie z instancją klasy Outer (Outer.this) i ma dostęp do jej pól niestatycznych. Static Nested Class zachowuje się jak zwykła klasa i takiego dostępu nie posiada."
    },
    {
      question: "Co to jest Wymazywanie Typów (Type Erasure) w generykach Javy?",
      options: [
        "Proces usuwania nieużywanych klas przez Garbage Collector.",
        "Usuwanie informacji o typach generycznych przez kompilator w czasie kompilacji, przez co w czasie wykonania (runtime) wszystkie generyki działają na typie Object lub granicach typów.",
        "Konwersja typów prostych na ich klasy osłonowe.",
        "Błąd kompilatora polegający na gubieniu referencji."
      ],
      answer: 1,
      explanation: "Type Erasure polega na usunięciu parametrów typów generycznych (np. zamiana List<String> na surową listę List w kodzie bajtowym). Zapewnia to kompatybilność wsteczną ze starszymi wersjami Javy."
    },
    {
      question: "Jak najlepiej radzić sobie z ryzykiem wystąpienia NullPointerException?",
      options: [
        "Ignorować i pozwalać aplikacji na restart.",
        "Pisać bloki try-catch wokół każdej linijki kodu.",
        "Używać klasy Optional<T> do reprezentowania wartości opcjonalnych oraz adnotacji @NonNull/@Nullable do statycznej weryfikacji kodu.",
        "Unikać używania typów referencyjnych i pisać kod tylko na typach prostych."
      ],
      answer: 2,
      explanation: "Użycie Optional<T> jasno dokumentuje intencję metody, a adnotacje wspierane przez IDE pozwalają wykryć potencjalne błędy NullPointerException jeszcze przed uruchomieniem kodu."
    }
  ]
};
