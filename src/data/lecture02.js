export const lecture02 = {
  id: "02",
  title: "Wykład 02: Fundamenty Javy, Pamięć JVM i Obiektowość (Poziom Strong Junior)",
  description: "Kompleksowy przewodnik od podstawowych typów i instrukcji sterujących, przez zarządzanie pamięcią (Stos vs Sterta, String Pool), po zaawansowane koncepcje programowania obiektowego i wewnętrzne mechanizmy JVM.",
  sections: [
    {
      title: "1. Typy Danych i Architektura Pamięci (Stack vs Heap)",
      content: `
Zrozumienie, jak Java zarządza pamięcią, to granica między początkującym a "Strong Juniorem". JVM dzieli pamięć na dwa główne obszary operacyjne:

1. **Stack (Stos Pamięci):**
   * Bardzo szybka pamięć przydzielana dla każdego wątku.
   * Działa w oparciu o tzw. *Stack Frames* (ramki stosu). Każde wywołanie metody tworzy nową ramkę, która jest niszczona, gdy metoda się kończy.
   * Przechowuje **typy proste** (\`int\`, \`double\`, \`boolean\`) zmiennych lokalnych oraz **Referencje** (adresy) do obiektów.

2. **Heap (Sterta):**
   * Duży obszar pamięci współdzielony przez wszystkie wątki.
   * To tutaj fizycznie alokowane są **wszystkie obiekty** (tworzone słowem kluczowym \`new\`) oraz tablice.
   * Zarządzany przez *Garbage Collector*, który automatycznie usuwa obiekty, do których nie prowadzi już żadna referencja ze stosu.

### Pass-by-Value (Przekazywanie przez wartość)
Częste pytanie rekrutacyjne: *Czy Java przekazuje parametry przez wartość, czy przez referencję?* 
Odpowiedź brzmi: **Zawsze przez wartość**. 

Jednakże, wartością dla obiektów jest ich **adres w pamięci (referencja)**. Kiedy przekazujesz obiekt do metody, kopiujesz jego adres.
* ✅ Możesz zmienić **stan** obiektu na stercie, używając skopiowanego adresu.
* ❌ Nie możesz zmienić **referencji** przypisanej do oryginalnej zmiennej.

\`\`\`java
public class MemoryExample {
    public static void main(String[] args) {
        int primitiveAge = 25;
        List<String> objectList = new ArrayList<>();
        objectList.add("Junior");

        modifyData(primitiveAge, objectList);

        // primitiveAge nadal wynosi 25! (Zmieniliśmy tylko kopię na Stosie)
        System.out.println("Wiek: " + primitiveAge); 
        
        // objectList to teraz ["Junior", "Mid"]! (Zmieniliśmy obiekt na Stercie)
        System.out.println("Lista: " + objectList); 
    }

    static void modifyData(int ageCopy, List<String> listCopy) {
        // Zmienia tylko wartość w ramce stosu metody modifyData
        ageCopy = 99; 
        
        // Używa adresu, by wejść na Stertę i zmodyfikować istniejący obiekt
        listCopy.add("Mid"); 
        
        // Przypisanie nowego obiektu zmienia TYLKO lokalny wskaźnik 'listCopy'. 
        // Oryginalny 'objectList' w metodzie main() o tym nie wie!
        listCopy = new ArrayList<>(); 
        listCopy.add("Senior"); 
    }
}
\`\`\`
`
    },
    {
      title: "2. Klasa String: Niezmienność i String Pool",
      content: `
Klasa \`java.lang.String\` reprezentuje ciąg znaków. Od Javy 9 wewnętrznie przechowuje dane w postaci tablicy bajtów: \`private final byte[] value;\` (wcześniej była to tablica \`char[]\`).

### Immutability (Niezmienność)
Raz utworzony String **nigdy** się nie zmienia. Każda operacja (np. \`.replace()\`, \`.concat()\`) tworzy nowy obiekt na stercie.
Dlaczego twórcy Javy podjęli taką decyzję?
1. **Wielowątkowość (Thread-safety):** Niemutowalne obiekty można bezpiecznie udostępniać między wątkami bez ryzyka wyścigu (Race Condition).
2. **Klucze w HashMap:** Jeśli String użyty jako klucz w mapie zmieniłby się, jego hash uległby zmianie i stracilibyśmy do niego dostęp.
3. **Bezpieczeństwo:** Klasy systemowe używają Stringów do przekazywania haseł i URL-i. Niezmienność gwarantuje, że haker nie zmieni wartości po tym, jak przeszła ona walidację bezpieczeństwa.

### String Pool (Pula Stringów)
Dzięki niezmienności, JVM optymalizuje pamięć poprzez współdzielenie takich samych napisów w tzw. **String Pool** (wydzielonym fragmencie Sterty).

\`\`\`java
// 1. Literały trafiają automatycznie do String Pool
String s1 = "Java"; 
String s2 = "Java"; 

// 2. Słowo 'new' ZMUSZA JVM do utworzenia zupełnie nowego obiektu na stercie (poza pulą)!
String s3 = new String("Java"); 

System.out.println(s1 == s2); // true (ten sam adres w String Pool)
System.out.println(s1 == s3); // false (różne adresy - jeden w puli, drugi obok na stercie)

// 3. Metoda intern() każe JVM sprawdzić, czy wartość jest już w puli
String s4 = s3.intern(); 
System.out.println(s1 == s4); // true (intern zwrócił adres z puli)
\`\`\`

> [!WARNING]
> Z powodu niezmienności, tworzenie napisów w dużej pętli (\`str += "a"\`) jest zabójcze dla wydajności — alokuje tysiące porzuconych obiektów. 

### StringBuilder vs StringBuffer
Do dynamicznego budowania tekstu używamy klas mutowalnych. Posiadają one wewnętrzną tablicę, która rozszerza swój rozmiar w miarę potrzeby.
* **\`StringBuilder\`**: Niesynchronizowany, bardzo szybki. To standardowy wybór w 99% przypadków.
* **\`StringBuffer\`**: Synchronizowany (thread-safe), przez co wolniejszy. Używany tylko w aplikacjach wielowątkowych typu "legacy".
`
    },
    {
      title: "3. Tablice (Arrays) i Memory Layout",
      content: `
Tablice to najbardziej podstawowa struktura danych. Mają **stały rozmiar**, zdefiniowany w momencie tworzenia.

### Deklaracja i inicjalizacja
\`\`\`java
int[] numbers = new int[5]; // Wypełniona zerami
int[] initialNumbers = {10, 20, 30, 40, 50}; // Szybka inicjalizacja
System.out.println("Rozmiar: " + numbers.length); // length to pole finalne, nie metoda!

// Tablice wielowymiarowe (tablice tablic)
int[][] matrix = new int[3][3];
int[][] jaggedArray = { {1, 2}, {3, 4, 5}, {6} }; // Nieregularna (poszarpana)
\`\`\`

### Co się dzieje w pamięci?
Różnica między tablicą typów prostych a referencyjnych jest kluczowa dla wydajności:
1. **Tablica typów prostych (np. \`int[]\`):** JVM alokuje jeden ciągły blok pamięci. Liczby leżą "jedna obok drugiej". Dostęp jest błyskawiczny dzięki ładowaniu ich do pamięci podręcznej procesora (CPU Cache).
2. **Tablica obiektów (np. \`String[]\`):** JVM alokuje tablicę wskaźników (adresów). Faktyczne obiekty leżą w losowych miejscach na stercie. Odczyt wymaga najpierw pobrania adresu, a potem skoku w inne miejsce pamięci (tzw. zjawisko *Cache Miss*).

### Kopiowanie tablic
Używanie pętli \`for\` do kopiowania to anty-wzorzec. Należy używać metod natywnych:
\`\`\`java
int[] src = {1, 2, 3};
int[] dest = new int[3];

// Wywołuje wysoce zoptymalizowany kod napisany w C/C++ wewnątrz maszyny wirtualnej:
System.arraycopy(src, 0, dest, 0, src.length);

// Lub w sposób bardziej nowoczesny:
int[] clone = Arrays.copyOf(src, src.length);
\`\`\`
`
    },
    {
      title: "4. Instrukcje Sterowania (Control Flow)",
      content: `
Java oferuje klasyczny zestaw instrukcji sterujących, rozbudowany o nowoczesne elementy.

### Warunki i Pętle
\`\`\`java
// if / else
if (score > 90) { /* A */ } 
else if (score > 80) { /* B */ } 
else { /* C */ }

// Operator trójargumentowy (Ternary Operator)
String status = (age >= 18) ? "Adult" : "Minor";

// Pętla for klasyczna
for (int i = 0; i < array.length; i++) { ... }

// Pętla for-each (Enhanced for) - preferowana dla kolekcji i tablic
for (String name : namesList) { ... }

// Pętla while / do-while
while (condition) { ... }
do { ... } while (condition); // Wykona się co najmniej RAZ
\`\`\`

### Etykiety (Labels) i Break/Continue
\`\`\`java
// 'break' przerywa aktualną pętlę, 'continue' przeskakuje do następnej iteracji.
// Ale co jeśli chcemy przerwać ZEWNĘTRZNĄ pętlę z wewnątrz wewnętrznej?
outerLoop: 
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (i * j > 10) {
            break outerLoop; // Przerywa obie pętle natychmiast!
        }
    }
}
\`\`\`

### Klasyczny Switch vs Nowoczesny Switch Expression (Java 14+)
Klasyczny \`switch\` (Statement) był problematyczny przez zjawisko **fall-through** (spadanie do kolejnego case'a po zapomnieniu \`break\`). Nowoczesny \`switch\` jest **wyrażeniem** — zwraca wartość i rozwiązuje ten problem.

\`\`\`java
// NOWY SWITCH: Czysty, bez break, używa operatora strzałki (->)
int numLetters = switch (dayOfWeek) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> 9;
    default -> {
        // Jeśli blok wymaga wielu linii kodu, zwracamy wartość słowem 'yield'
        System.out.println("Nieznany dzień");
        yield 0; 
    }
};
\`\`\`
Nowy switch jest wyczerpujący (exhaustive). Jeśli robisz switcha po klasie \`Enum\` i nie pokryjesz wszystkich opcji, kod się nie skompiluje!
`
    },
    {
      title: "5. Kontrakt java.lang.Object: equals() i hashCode()",
      content: `
Klasa \`Object\` to korzeń całego drzewa dziedziczenia w Javie. Jeśli nie napiszemy \`extends\`, kompilator dopisze \`extends Object\` automatycznie.

### Domyślna implementacja equals()
Domyślnie \`equals(Object o)\` wykonuje po prostu \`this == o\`, porównując referencje. Dla klas domenowych (DTO) musimy to nadpisać.
Zasady (kontrakt) nadpisanego \`equals\`:
1. **Zwrotność:** \`a.equals(a) == true\`
2. **Symetryczność:** Jeśli \`a.equals(b) == true\`, to \`b.equals(a) == true\`
3. **Przechodniość:** Jeśli \`a.equals(b)\` i \`b.equals(c)\`, to \`a.equals(c)\`
4. **Spójność:** Wielokrotne wywołanie daje ten sam wynik.

### Magia hashCode()
Współpracuje w parze z \`HashMap\` oraz \`HashSet\`. Zwraca wartość numeryczną określającą "kubełek" (bucket), do którego trafi obiekt.

> [!CAUTION]
> **Złota reguła Javy:** Jeśli zdefiniujesz, że dwa obiekty są równe według \`equals()\`, to ich \`hashCode()\` **MUSI** zwrócić dokładnie taką samą wartość! Złamanie tej zasady sprawi, że wrzucisz obiekt do \`HashSet\`, a następnie program stwierdzi, że go tam nie ma.

\`\`\`java
public class User {
    private String email;
    private int age;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true; // Szybka ścieżka: to ten sam obiekt
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return age == user.age && Objects.equals(email, user.email);
    }

    @Override
    public int hashCode() {
        // Pod maską: wynik mnożony jest przez liczbę pierwszą 31, by unikać kolizji hashów
        return Objects.hash(email, age); 
    }
}
\`\`\`
`
    },
    {
      title: "6. Programowanie Obiektowe (OOP) i V-Table",
      content: `
Java to w 99% język obiektowy, oparty na klasach, implementujący trzy filary OOP: Hermetyzację, Dziedziczenie i Polimorfizm.

### Hermetyzacja (Encapsulation)
Stan obiektu (pola) powinien być ukryty, a dostęp do niego kontrolowany przez metody publiczne (gettery/settery). Realizuje się to modyfikatorami:
* \`private\` — widoczne tylko w danej klasie.
* \`default\` (brak modyfikatora) — widoczne w całym pakiecie (Package-private).
* \`protected\` — widoczne w pakiecie + w klasach dziedziczących.
* \`public\` — widoczne wszędzie.

### Dziedziczenie (Inheritance)
Klasa może dziedziczyć tylko po **JEDNEJ** innej klasie (brak wielokrotnego dziedziczenia klas — rozwiązuje to tzw. Problem Diamentu).
\`\`\`java
public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public void makeSound() { System.out.println("..."); }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name); // super() wywołuje konstruktor klasy bazowej
    }

    @Override // Adnotacja gwarantująca, że faktycznie nadpisujemy metodę
    public void makeSound() {
        System.out.println("Hau!");
    }
}
\`\`\`

### Polimorfizm i V-Table (Virtual Method Table)
Możemy przypisać obiekt typu \`Dog\` do zmiennej typu \`Animal\`. Kiedy wywołamy \`animal.makeSound()\`, JVM w czasie działania programu (Runtime) sprawdzi faktyczny typ obiektu i wywoła metodę z klasy \`Dog\`.

Jak to działa pod maską? JVM używa **V-Table**. Kiedy klasa jest ładowana do pamięci, tworzona jest dla niej tablica wskaźników do metod. Jeśli \`Dog\` nadpisze metodę \`makeSound\`, wskaźnik w V-Table \`Doga\` zostaje podmieniony z implementacji \`Animal\` na implementację \`Dog\`. Mechanizm ten nazywa się **Dynamic Dispatch**.
`
    },
    {
      title: "7. Klasy Abstrakcyjne vs Interfejsy",
      content: `
Kiedy chcemy zdefiniować "szablon" dla klas dziedziczących, stajemy przed wyborem:

### Klasa Abstrakcyjna
Może posiadać pełnoprawny stan (pola niestatyczne) oraz konstruktory, ale nie da się stworzyć jej instancji przez \`new\`.
\`\`\`java
public abstract class GameEntity {
    private int health = 100; // Ma swój własny stan!
    public GameEntity() { ... } // Ma konstruktor
    
    public void takeDamage(int dmg) { health -= dmg; } // Zaimplementowana
    public abstract void render(); // Abstrakcyjna (wymaga implementacji)
}
\`\`\`

### Interfejs
Czysty kontrakt. Od Javy 8 interfejsy mogą posiadać metody z domyślną implementacją (słowo kluczowe \`default\`). Wprowadzono to, by dodać m.in. metodę \`.stream()\` do kolekcji bez niszczenia kompatybilności wstecznej.
\`\`\`java
public interface Playable {
    // Każde pole jest domyślnie: public static final (stała)
    int MAX_PLAYERS = 4; 

    // Metoda abstrakcyjna (domyślnie public abstract)
    void play(); 

    // Metoda domyślna z implementacją
    default void stop() {
        System.out.println("Zatrzymano odtwarzanie.");
    }
}
\`\`\`

| Cecha | Klasa Abstrakcyjna | Interfejs |
| :--- | :--- | :--- |
| **Stan (Pola)** | Dowolne (private, protected, int, List) | Tylko stałe (\`public static final\`) |
| **Konstruktor** | Tak | Nie |
| **Dziedziczenie** | Klasa może rozszerzyć tylko 1 klasę | Klasa może implementować wiele interfejsów |
| **Przeznaczenie** | Współdzielenie cech i kodu pomiędzy spokrewnionymi obiektami ("JEST") | Definiowanie możliwości/roli obiektu ("POTRAFI") |
`
    },
    {
      title: "8. Parametry Metod: Varargs i Przeciążanie",
      content: `
### Przeciążanie metod (Method Overloading)
W jednej klasie może istnieć wiele metod o tej samej nazwie, o ile mają **inną listę parametrów** (typ, liczba lub kolejność). Typ zwracany NIE bierze udziału w rozróżnianiu przeciążeń!

\`\`\`java
public int calculate(int a, int b) { return a + b; }
public double calculate(double a, double b) { return a + b; }
// BŁĄD KOMPILACJI: public long calculate(int a, int b) { return a + b; }
\`\`\`

### Varargs (Zmienna liczba argumentów)
Służy do tworzenia metod przyjmujących dowolną liczbę parametrów danego typu. Używa się trzykropka \`...\`.
Pod maską, kompilator po prostu zbiera przekazane parametry w **zwykłą tablicę** danego typu.

\`\`\`java
// varargs MUST be the last parameter in the signature!
public static int sum(String message, int... numbers) {
    int total = 0;
    // 'numbers' to wewnętrznie int[]
    for (int num : numbers) { 
        total += num;
    }
    System.out.println(message + ": " + total);
    return total;
}

// Użycie:
sum("Wynik", 10, 20);      // Dwa argumenty
sum("Wynik", 1, 2, 3, 4);  // Cztery argumenty
sum("Wynik");              // Brak argumentów (tablica pusty int[])
\`\`\`
`
    },
    {
      title: "9. Nowoczesne Rekordy (Records) — Java 16",
      content: `
Historycznie kod w Javie cierpiał na nadmiarowość (tzw. boilerplate). Aby stworzyć prosty obiekt DTO (Data Transfer Object) do przesyłania danych, trzeba było napisać kilkadziesiąt linii kodu dla prywatnych pól, getterów, hashCode, equals i toString.

Java 16 wprowadziła **Rekordy**, które są idealnym, niemutowalnym nośnikiem danych.

\`\`\`java
public record UserResponse(UUID id, String email, boolean isActive) {}
\`\`\`

### Co kompilator robi z tym jednym rzędem kodu?
1. Tworzy klasę \`final\` rozszerzającą ukrytą klasę bazową \`java.lang.Record\`.
2. Pola \`id\`, \`email\` oraz \`isActive\` stają się \`private final\`.
3. Automatycznie dostarcza akcesory. Uwaga: nie \`getId()\`, a po prostu \`id()\`!
4. Automatycznie generuje ultra-wydajne \`equals()\`, \`hashCode()\` oraz \`toString()\` przy pomocy instrukcji bytecode'u \`invokedynamic\`.

### Compact Constructor (Kompaktowy Konstruktor)
Rekordy pozwalają na dodanie konstruktora służącego tylko do szybkiej walidacji bez pisania przepisywania zmiennych:

\`\`\`java
public record ProductDto(String name, BigDecimal price) {
    // Nie musisz pisać this.name = name!
    public ProductDto {
        Objects.requireNonNull(name, "Nazwa jest wymagana");
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Cena nie może być ujemna");
        }
    }
    
    // Rekordy mogą też mieć swoje własne metody
    public String getFormattedPrice() {
        return price + " PLN";
    }
}
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Gdy wywołujemy doSomething(List<String> list), i wewnątrz zmienimy metodą list.add(\"test\"), to dlaczego oryginalna lista również ulegnie zmianie pomimo przekazywania przez wartość?",
      options: [
        "Ponieważ Java przekazuje obiekty zawsze przez referencję, a nie przez wartość.",
        "Ponieważ skopiowaną wartością był adres w pamięci prowadzący do jedynej kopii obiektu Listy na Stercie (Heap).",
        "Ponieważ kolekcje (List, Set) posiadają wbudowany mechanizm mutacji między-ramkowej.",
        "Tylko jeśli przypiszemy list = new ArrayList<>() zmiany odzwierciedlą się wyżej."
      ],
      answer: 1,
      explanation: "W Javie przesyłana wartość to skopiowany adres prowadzący do obiektu. Posiadając ten adres, modyfikacja obiektu zmieni go globalnie na stercie."
    },
    {
      question: "Z jakiego powodu klasa String w Javie została zaprogramowana jako immutable (niezmienna)?",
      options: [
        "Umożliwia to zjawisko buforowania napisów (String Pool) w pamięci operacyjnej.",
        "Zapewnia to absolutne bezpieczeństwo przy komunikacji między wieloma wątkami (Thread-safety).",
        "Chroni to stan krytycznych kluczy wprowadzonych do kolekcji np. HashMap przed ich zewnętrzną zmianą.",
        "Wszystkie powyższe powody są kluczowe w architekturze klasy String."
      ],
      answer: 3,
      explanation: "Niezmienność zapewnia buforowanie pamięci, bezpieczeństwo dla wielowątkowości i stabilność logiki używającej Stringów jako identyfikatorów lub kluczy map."
    },
    {
      question: "Co decyduje, czy w Javie zastosować Klasę Abstrakcyjną czy Interfejs?",
      options: [
        "Tylko interfejsy potrafią implementować abstrakcyjne metody.",
        "Jeśli obiekt współdzieli z klasą wspólną logikę (pola prywatne, konstruktor, zmienny stan) -> Klasa Abstrakcyjna. Jeśli opisuje tylko role do spełnienia (kontrakt) -> Interfejs.",
        "Klasy abstrakcyjnej używa się tylko, by stworzyć rekord, a interfejsu gdy chcemy zainicjować zmienne przez operator new.",
        "Nie ma różnicy z technicznego punktu widzenia, używa się ich naprzemiennie."
      ],
      answer: 1,
      explanation: "Klasa abstrakcyjna niesie ze sobą 'stan' (zmienne, konstruktory), podczas gdy interfejs (nawet posiadający default method) dotyczy zdefiniowania API / możliwości i jest obdarzony wyłącznie publicznymi stałymi finalnymi."
    },
    {
      question: "W jaki sposób najnowszy (wprowadzony w Java 14) Switch operuje jako tzw. Expression?",
      options: [
        "Pozwala pisać switch z wykorzystaniem lambd i wymaga zwracania Stringa.",
        "Przed każdym case wymaga napisania słowa 'break' aby uniknąć pomyłki tzw. fall-through.",
        "Pozwala na zwrot obliczonej na jego podstawie wartości poprzez zapis przypisania (np. int result = switch...) eliminując po drodze wymóg umieszczania instrukcji break za pomocą zapisu '->'.",
        "Wcale nie obsługuje wartości zwrotnych, różnica polega wyłącznie w składni wizualnej polegającej na użyciu przecinków."
      ],
      answer: 2,
      explanation: "Nowoczesny switch jest traktowany przez Jave jako pełnoprawne 'wyrażenie' zwracające wynik po operatorze ->. Ponadto jest wyczerpujący (exhaustive) co podnosi bezpieczeństwo."
    }
  ]
};
