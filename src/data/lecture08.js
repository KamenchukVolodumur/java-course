export const lecture08 = {
  id: "08",
  title: "Wykład 08: Javadoc, Wzorce Dopasowania (Pattern Matching) i Wątki",
  description: "Omówienie braku przeciążania operatorów w Javie, tworzenia dokumentacji Javadoc, alternatyw dla dyrektyw preprocesora, nowoczesnego Pattern Matchingu oraz podstaw wielowątkowości (Threads).",
  sections: [
    {
      title: "1. Brak Przeciążania Operatorów & Javadoc",
      content: `
### Przeciążanie Operatorów (Operator Overloading) w Javie:
Java **nie wspiera** przeciążania operatorów (z wyjątkiem operatora \`+\` dla obiektów \`String\`). James Gosling podjął tę decyzję w celu uproszczenia składni i uniknięcia błędów, które często pojawiały się w języku C++ z powodu nieczytelnych przeciążeń.

W Javie operacje na obiektach matematycznych (np. \`BigDecimal\`, \`BigInteger\`) wykonujemy za pomocą jawnych metod:
\`\`\`java
BigDecimal a = new BigDecimal("10.50");
BigDecimal b = new BigDecimal("2.30");

// Zamiast a + b:
BigDecimal sum = a.add(b);

// Zamiast a * b:
BigDecimal product = a.multiply(b);
\`\`\`

### Dokumentacja Javadoc:
Javadoc to oficjalny system generowania dokumentacji HTML z komentarzy w kodzie źródłowym. Komentarze Javadoc zaczynają się od \`/**\` i kończą na \`*/\`. Stosuje się w nich specjalne tagi:

\`\`\`java
/**
 * Oblicza pole powierzchni koła.
 *
 * @param radius promień koła, musi być większy od zera
 * @return pole powierzchni koła jako double
 * @throws IllegalArgumentException jeśli promień jest mniejszy lub równy zero
 * @see <a href="https://pl.wikipedia.org/wiki/Ko%C5%82o">Koło w Wikipedii</a>
 */
public double calculateArea(double radius) {
    if (radius <= 0) {
        throw new IllegalArgumentException("Promień musi być dodatni!");
    }
    return Math.PI * radius * radius;
}
\`\`\`
`
    },
    {
      title: "2. Dyrektywy Preprocesora w Javie",
      content: `
Java **nie posiada preprocesora** (nie ma dyrektyw takich jak \`#define\`, \`#ifdef\`, \`#if\` znanych z C/C++ czy C#). Wynika to z chęci uniknięcia uzależnienia kodu źródłowego od środowiska kompilacji oraz ułatwienia analizy kodu przez edytory (IDE).

W Javie funkcjonalności te realizuje się poprzez:
1. **Flagi kompilatora i stałe logiczne**: Kompilator Javy automatycznie usuwa martwy kod (Dead Code Elimination) w przypadku stałych warunków w czasie kompilacji:
   \`\`\`java
   public static final boolean DEBUG = false;
   
   if (DEBUG) {
       System.out.println("To wypisze się tylko w debugu"); // Kod ten zostanie usunięty z pliku .class!
   }
   \`\`\`
2. **Profile Maven/Gradle**: Filtrowanie zasobów na etapie budowania (zastępowanie zmiennych w plikach \`.properties\` lub \`.xml\`).
3. **Zmienne środowiskowe**: Sprawdzanie parametrów systemu operacyjnego w runtime (\`System.getProperty("os.name")\`).
`
    },
    {
      title: "3. Nowoczesny Pattern Matching (Dopasowanie do Wzorców)",
      content: `
W nowszych wersjach Javy (Java 16 do 21) wprowadzono mechanizmy **Pattern Matchingu**, które drastycznie zmniejszają boilerplate i zwiększają bezpieczeństwo kodu:

### 1. Pattern Matching dla instanceof (Java 16):
Tradycyjne rzutowanie typu:
\`\`\`java
if (obj instanceof String) {
    String s = (String) obj; // Ręczne rzutowanie
    System.out.println(s.toUpperCase());
}
\`\`\`
Nowoczesne dopasowanie:
\`\`\`java
if (obj instanceof String s) { // Zmienna 's' jest automatycznie zrzutowana i dostępna w tym bloku
    System.out.println(s.toUpperCase());
}
\`\`\`

### 2. Pattern Matching w instrukcjach switch (Java 21):
Pozwala na sprawdzenie typu w switchu:
\`\`\`java
String result = switch (obj) {
    case Integer i -> "Liczba całkowita: " + i;
    case String s  -> "Napis o długości: " + s.length();
    case null      -> "Wartość null!";
    default        -> "Inny typ";
};
\`\`\`

### 3. Klasy Blokowane (Sealed Classes — Java 17, JEP 409) i wyczerpalność switcha:
Klasy sealed (\`sealed class\`) ograniczają listę podklas, które mogą po nich dziedziczyć. Słowo kluczowe \`permits\` jawnie wymienia dozwolone podklasy. Jeśli wszystkie podklasy są zdefiniowane w tym samym pliku źródłowym, klauzula \`permits\` może zostać pominięta.

Każda dozwolona podklasa musi być oznaczona jako \`final\`, \`sealed\` lub \`non-sealed\`.

W połączeniu ze switchem, kompilator może sprawdzić wyczerpalność (czy obsłużono wszystkie przypadki), eliminując potrzebę pisania bloku \`default\`:
\`\`\`java
public sealed interface Shape permits Circle, Square {}
public final class Circle implements Shape { public double radius; }
public final class Square implements Shape { public double side; }

// Wyczerpujący switch (brak default)
double area = switch (shape) {
    case Circle c -> Math.PI * c.radius * c.radius;
    case Square s -> s.side * s.side;
};
\`\`\`
`
    },
    {
      title: "4. Podstawy Wielowątkowości: Wątki (Threads)",
      content: `
Wielowątkowość w Javie pozwala na jednoczesne wykonywanie wielu zadań w ramach tego samego procesu. Każdy program w Javie uruchamia przynajmniej jeden wątek główny (Main Thread).

Wątek reprezentowany jest przez klasę \`java.lang.Thread\`. Wątki można tworzyć na dwa sposoby:

### 1. Dziedziczenie po klasie Thread:
\`\`\`java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Wątek uruchomiony: " + Thread.currentThread().getName());
    }
}
// Uruchomienie:
MyThread t = new MyThread();
t.start(); // Uwaga: wywołujemy start(), a nie run()!
\`\`\`

### 2. Implementacja interfejsu Runnable (Zalecane):
Umożliwia oddzielenie definicji zadania od mechanizmu wątku (lepsze praktyki obiektowe).
\`\`\`java
Runnable task = () -> System.out.println("Zadanie w wątku: " + Thread.currentThread().getName());
Thread t = new Thread(task);
t.start();
\`\`\`

### Różnica między start() a run():
* **\`start()\`**: Tworzy nowy wątek na poziomie systemu operacyjnego i uruchamia w nim asynchronicznie metodę \`run()\`.
* **\`run()\`**: Zwykłe wywołanie metody w wątku bieżącym (wykonanie synchroniczne).
`
    }
  ],
  quiz: [
    {
      question: "W jaki sposób w Javie realizuje się operacje arytmetyczne na precyzyjnych liczbach dziesiętnych klasy BigDecimal?",
      options: [
        "Używając standardowych operatorów, np. c = a + b;",
        "Wywołując metody takie jak a.add(b) i a.multiply(b), ponieważ Java nie wspiera przeciążania operatorów.",
        "Java automatycznie zamienia BigDecimal na typ int.",
        "Poprzez refleksję i wywołanie ukrytych operatorów."
      ],
      answer: 1,
      explanation: "Java nie wspiera przeciążania operatorów, dlatego operacje na klasach takich jak BigDecimal muszą być wywoływane za pomocą jawnych metod (add, multiply, divide)."
    },
    {
      question: "Co daje zastosowanie Pattern Matching dla operatora instanceof (od Java 16)?",
      options: [
        "Pozwala na szybsze działanie programu na starszych systemach.",
        "Automatycznie rzutuje sprawdzany obiekt na deklarowaną zmienną typu, eliminując konieczność pisania dodatkowej linijki kodu z rzutowaniem.",
        "Uniemożliwia rzutowanie obiektów na typy niekompatybilne.",
        "Zamienia instancje na typy prymitywne."
      ],
      answer: 1,
      explanation: "Zapis 'if (obj instanceof String s)' sprawdza typ obj, a jeśli warunek jest spełniony, automatycznie tworzy zmienną referencyjną 's' typu String, gotową do użycia."
    },
    {
      question: "Co się stanie, gdy zamiast metody start() wywołamy bezpośrednio metodę run() na obiekcie Thread?",
      options: [
        "Wątek zostanie uruchomiony w tle, ale bez nazwy.",
        "Kod z metody run() wykona się synchronicznie w bieżącym wątku (nie zostanie utworzony nowy wątek systemowy).",
        "Zostanie rzucony wyjątek IllegalThreadStateException.",
        "Maszyna JVM zakończy działanie programu."
      ],
      answer: 1,
      explanation: "Tylko metoda start() żąda od systemu operacyjnego utworzenia nowego wątku. Bezpośrednie wywołanie run() działa jak zwykłe wywołanie metody na obiekcie w bieżącym wątku."
    }
  ]
};
