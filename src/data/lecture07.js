export const lecture07 = {
  id: "07",
  title: "Wykład 07: Zarządzanie Zasobami, Adnotacje, Refleksja i Moduły JPMS",
  description: "Szczegółowe omówienie mechanizmu try-with-resources, tworzenia i przetwarzania adnotacji, dynamicznej refleksji API (Reflection) oraz modułowości Java Platform Module System (JPMS).",
  sections: [
    {
      title: "1. AutoCloseable i try-with-resources",
      content: `
Zarządzanie zasobami zewnętrznymi (np. pliki, połączenia z bazą danych, gniazda sieciowe) wymaga ich bezwzględnego zamykania po zakończeniu pracy, aby uniknąć wycieków zasobów systemowych.

Tradycyjna metoda z blokiem \`finally\` była bardzo skomplikowana i podatna na błędy (ponieważ zamykanie zasobu w \`finally\` samo mogło rzucić wyjątek).

Java 7 wprowadziła konstrukcję **try-with-resources**, która automatycznie zamyka wszystkie otwarte w niej zasoby pod warunkiem, że implementują one interfejs **\`java.lang.AutoCloseable\`** (lub jego podinterfejs \`java.io.Closeable\`). Interfejs \`AutoCloseable\` definiuje metodę \`void close() throws Exception\`, natomiast \`Closeable\` ogranicza sygnaturę do \`throws IOException\`.

> [!NOTE]
> Jeśli zarówno blok \`try\`, jak i metoda \`close()\` rzucą wyjątek, wyjątek z \`close()\` zostanie dodany jako **suppressed exception** (dostępny przez \`Throwable.getSuppressed()\`).

Porównanie tradycyjnego zamykania i try-with-resources:
\`\`\`java
// Klasyczna wersja (skomplikowana)
FileInputStream fis = null;
try {
    fis = new FileInputStream("plik.txt");
    // praca z plikiem
} finally {
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// Nowoczesna wersja (try-with-resources)
try (FileInputStream fis2 = new FileInputStream("plik.txt")) {
    // praca z plikiem - zasób zamknie się automatycznie po wyjściu z bloku try
} // niejawne wywołanie fis2.close()
\`\`\`

> [!TIP]
> W konstrukcji try-with-resources można zainicjalizować wiele zasobów rozdzielając je średnikami: \`try (ResA a = new ResA(); ResB b = new ResB()) { ... }\`. Będą one zamykane w kolejności odwrotnej do ich deklaracji.
`
    },
    {
      title: "2. Adnotacje w Javie",
      content: `
Adnotacje w Javie to rodzaj metadanych, które dostarczają informacji o kodzie programu, nie wpływając bezpośrednio na jego działanie. Są używane przez kompilator (np. \`@Override\`, \`@Deprecated\`, \`@SuppressWarnings\`) oraz przez frameworki do konfiguracji i weryfikacji w czasie wykonania (np. Spring, Hibernate).

### Definiowanie własnych adnotacji:
Własną adnotację definiuje się za pomocą słowa kluczowego \`@interface\`. Kluczowe jest określenie dwóch adnotacji meta:
* **\`@Retention\`**: Określa, jak długo adnotacja ma być przechowywana:
  * \`RetentionPolicy.SOURCE\`: widoczna tylko w kodzie źródłowym, usuwana przez kompilator (np. Lombok).
  * \`RetentionPolicy.CLASS\`: zapisywana w pliku \`.class\`, ale niedostępna w czasie działania programu.
  * \`RetentionPolicy.RUNTIME\`: zapisywana w pliku \`.class\` i dostępna w runtime poprzez refleksję.
* **\`@Target\`**: Określa, do jakich elementów kodu można zastosować adnotację (np. \`ElementType.METHOD\`, \`ElementType.FIELD\`, \`ElementType.TYPE\` dla klas).

Przykład:
\`\`\`java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExecutionTime {
    String value() default "Standardowa diagnostyka";
}
\`\`\`
`
    },
    {
      title: "3. Refleksja (Reflection API)",
      content: `
**Refleksja** to mechanizm pozwalający programowi na badanie i modyfikację własnej struktury oraz zachowania w czasie działania programu (Runtime). Za pomocą pakietu \`java.lang.reflect\` możemy analizować klasy, pobierać ich pola, metody, konstruktory, a także wywoływać je dynamicznie, nawet jeśli są prywatne.

Zastosowanie refleksji:
\`\`\`java
// Pobranie obiektu klasy
Class<?> clazz = Class.forName("pl.edu.pw.mini.User");

// Stworzenie instancji klasy dynamicznie
Constructor<?> constructor = clazz.getConstructor(String.class);
Object user = constructor.newInstance("Jan Kowalski");

// Pobranie i wywołanie prywatnej metody
Method privateMethod = clazz.getDeclaredMethod("calculateSalary");
privateMethod.setAccessible(true); // Ominięcie kontroli modyfikatorów dostępu!
Object result = privateMethod.invoke(user);

// Modyfikacja prywatnego pola
Field privateField = clazz.getDeclaredField("id");
privateField.setAccessible(true);
privateField.set(user, 12345);
\`\`\`

> [!CAUTION]
> Choć refleksja jest potężna, wiąże się z dużymi kosztami wydajnościowymi — refleksja omija optymalizacje kompilatora JIT (np. inlining metod), co znacząco spowalnia wielokrotne wywołania refleksyjne w porównaniu z bezpośrednimi wywołaniami metod. Ponadto wyłącza weryfikację typów w czasie kompilacji (błędy pojawią się dopiero w runtime) oraz łamie zasady enkapsulacji (modyfikacja prywatnych pól). Powinna być stosowana z umiarem (głównie w bibliotekach i frameworkach).
`
    },
    {
      title: "4. System Modułów JPMS (Java Platform Module System)",
      content: `
Wprowadzony w Javie 9 **Java Platform Module System (JPMS)** (znany jako Project Jigsaw) zredefiniował architekturę aplikacji Java. Wprowadził on dodatkowy poziom abstrakcji powyżej pakietów – **Moduły**.

Moduł grupuje powiązane pakiety i zasoby. Konfiguracja modułu znajduje się w pliku **\`module-info.java\`** w katalogu głównym kodu źródłowego.

Kluczowe dyrektywy w \`module-info.java\`:
* **\`requires\`**: Deklaruje zależności modułu od innych modułów (np. \`requires java.sql;\`).
* **\`exports\`**: Deklaruje pakiety z tego modułu, które mają być publicznie widoczne dla innych modułów. Pakiety niewyeksportowane są traktowane jako całkowicie prywatne (nawet dla refleksji!).
* **\`opens\`**: Pozwala na dostęp do określonego pakietu poprzez refleksję innym modułom bez eksportowania go do normalnego importu.

Przykład pliku \`module-info.java\`:
\`\`\`java
module my.awesome.app {
    requires java.sql;
    requires com.google.gson;

    exports pl.edu.pw.mini.api;
    opens pl.edu.pw.mini.model to com.google.gson;
}
\`\`\`

JPMS eliminuje problem "Classpath Hell" (konfliktów wersji JAR-ów) poprzez silną enkapsulację i weryfikację zależności przy starcie aplikacji (JVM od razu zgłosi brak wymaganego modułu).
`
    }
  ],
  quiz: [
    {
      question: "Jaki interfejs musi implementować klasa, aby jej instancja mogła być użyta w konstrukcji try-with-resources?",
      options: [
        "java.io.Serializable",
        "java.lang.Runnable",
        "java.lang.AutoCloseable",
        "java.lang.Cloneable"
      ],
      answer: 2,
      explanation: "Try-with-resources wymaga, aby zasób implementował AutoCloseable (lub jego podinterfejs Closeable), co gwarantuje obecność metody close(), która jest wywoływana automatycznie."
    },
    {
      question: "Która polityka retencji (@Retention) sprawi, że adnotacja będzie dostępna w czasie działania programu za pomocą refleksji?",
      options: [
        "RetentionPolicy.SOURCE",
        "RetentionPolicy.CLASS",
        "RetentionPolicy.RUNTIME",
        "Brak adnotacji @Retention domyślnie zapewnia jej dostępność."
      ],
      answer: 2,
      explanation: "RetentionPolicy.RUNTIME instruuje kompilator i maszynę JVM, aby zachować adnotację w pliku klasy i załadować ją do pamięci, dzięki czemu jest dostępna w runtime przez refleksję."
    },
    {
      question: "Co robi dyrektywa 'exports' w konfiguracji module-info.java?",
      options: [
        "Deklaruje, że moduł wymaga biblioteki zewnętrznej.",
        "Udostępnia publicznie klasy z wybranego pakietu dla innych modułów.",
        "Eksportuje cały projekt do formatu ZIP.",
        "Zezwala na refleksyjny dostęp do prywatnych pól klasy."
      ],
      answer: 1,
      explanation: "Dyrektywa exports pozwala na udostępnienie określonego pakietu na zewnątrz modułu. Bez eksportu, pakiety są całkowicie ukryte przed innymi modułami."
    }
  ]
};
