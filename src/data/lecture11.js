export const lecture11 = {
  id: "11",
  title: "Wykład 11: Warsztaty - Struktura Aplikacji, Testy i Dobre Praktyki",
  description: "Praktyczny poradnik konfiguracji profesjonalnego projektu w Javie: struktura pakietów (Architecture Layers), testowanie z JUnit 5, logowanie zdarzeń (SLF4J/Logback) oraz budowanie dystrybucyjne (Uber-JAR).",
  sections: [
    {
      title: "1. Profesjonalna Struktura Projektu (Package Structure)",
      content: `
Dla aplikacji biznesowych w środowisku Java standardem jest architektura warstwowa (Layered Architecture). Pozwala ona na odseparowanie odpowiedzialności (Separation of Concerns). Pakiety w projekcie (np. \`pl.edu.pw.mini.app\`) powinny odzwierciedlać te warstwy:

* **\`model\` (lub \`domain\` / \`entity\` )**: Zawiera czyste encje biznesowe, dane i rekordy (np. \`User\`, \`Order\`).
* **\`repository\` (lub \`dao\` - Data Access Object)**: Warstwa odpowiedzialna za bezpośrednią komunikację z bazą danych lub systemem plików.
* **\`service\`**: Warstwa logiki biznesowej. Tu znajdują się algorytmy, kalkulacje oraz wywołania repozytoriów.
* **\`controller\` (lub \`api\` / \`ui\` )**: Punkt wejścia do aplikacji. Obsługuje interfejs użytkownika (np. REST API, konsola, GUI).
* **\`config\`**: Klasy konfiguracyjne aplikacji.

Przykład struktury katalogów na dysku:
\`\`\`text
src/
├── main/
│   ├── java/
│   │   └── pl/edu/pw/mini/app/
│   │       ├── model/
│   │       ├── repository/
│   │       ├── service/
│   │       └── App.java (punkt wejścia)
│   └── resources/
│       ├── application.properties (pliki konfiguracyjne)
│       └── logback.xml (konfiguracja loggera)
└── test/
    └── java/
        └── pl/edu/pw/mini/app/
            └── service/ (testy jednostkowe warstwy biznesowej)
\`\`\`
`
    },
    {
      title: "2. Testowanie Jednostkowe: JUnit 5 i AssertJ",
      content: `
Testy jednostkowe (Unit Tests) weryfikują poprawność pojedynczych metod w oderwaniu od reszty systemu. Standardem w Javie jest biblioteka **JUnit 5 (Jupiter)**. Do tworzenia czytelnych asercji często stosuje się bibliotekę **AssertJ**.

Przykład testu jednostkowego:
\`\`\`java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CalculatorTest {
    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator(); // Inicjalizacja przed każdym testem
    }

    @Test
    void shouldAddTwoNumbersCorrectly() {
        // given & when
        int result = calculator.add(2, 3);

        // then (Asercja JUnit 5)
        // assertEquals(5, result);
        
        // then (Asercja AssertJ - bardzo czytelna)
        assertThat(result)
            .isEqualTo(5)
            .isPositive();
    }

    @Test
    void shouldThrowExceptionWhenDividingByZero() {
        // then
        assertThatThrownBy(() -> calculator.divide(10, 0))
            .isInstanceOf(ArithmeticException.class)
            .hasMessageContaining("Dzielenie przez zero");
    }
}
\`\`\`
`
    },
    {
      title: "3. Logowanie Zdarzeń: SLF4J i Logback",
      content: `
Używanie \`System.out.println()\` do wypisywania informacji diagnostycznych w aplikacjach produkcyjnych jest antywzorcem (brak kontroli nad poziomami logowania, brak formatowania, trudne przekierowanie do plików).

Standardem w Javie jest fasada **SLF4J (Simple Logging Facade for Java)** w połączeniu z biblioteką implementującą, np. **Logback** lub **Log4j2**.

### Poziomy logowania (od najniższego):
1. **\`TRACE\`**: Bardzo szczegółowe logi diagnostyczne.
2. **\`DEBUG\`**: Logi przydatne podczas programowania i lokalnego uruchamiania.
3. **\`INFO\`**: Ogólne informacje o pracy aplikacji (np. start serwera, zarejestrowanie użytkownika).
4. **\`WARN\`**: Ostrzeżenia o niespodziewanych sytuacjach, które nie przerywają pracy (np. wolne zapytanie).
5. **\`ERROR\`**: Błędy krytyczne, zazwyczaj z zrzutem stosu (stacktrace).

Użycie loggera w klasie:
\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public void registerUser(String username) {
        log.info("Próba rejestracji użytkownika: {}", username); // dynamiczny parametr {}
        try {
            // logika
        } catch (Exception e) {
            log.error("Nieudana rejestracja użytkownika {}: ", username, e); // zrzut stosu
        }
    }
}
\`\`\`
`
    },
    {
      title: "4. Budowanie i Wdrażanie Aplikacji (Uber-JAR)",
      content: `
Aby uruchomić aplikację Java na innym komputerze bez konieczności instalowania zależności, należy spakować projekt do pliku **Uber-JAR** (znanego też jako Fat-JAR). Zawiera on zarówno nasze skompilowane pliki \`.class\`, jak i wszystkie zależne biblioteki ZIP-owane w jednym pliku \`.jar\`.

W Mavenie do tworzenia Uber-JAR służy wtyczka \`maven-shade-plugin\`:
\`\`\`xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.5.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>pl.edu.pw.mini.app.App</mainClass>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
\`\`\`

Budowanie i uruchamianie z konsoli:
\`\`\`bash
# Zbudowanie projektu (stworzenie pliku JAR w katalogu target)
mvn clean package

# Uruchomienie aplikacji z pliku JAR
java -jar target/java-app-1.0.0.jar
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Który pakiet zawiera adnotacje testowe (np. @Test, @BeforeEach) biblioteki JUnit 5?",
      options: [
        "org.junit.jupiter.api",
        "junit.framework",
        "org.junit.test",
        "java.util.test"
      ],
      answer: 0,
      explanation: "JUnit 5 (Jupiter) korzysta z pakietu org.junit.jupiter.api dla swoich adnotacji i mechanizmów asercji."
    },
    {
      question: "Dlaczego antywzorcem jest wypisywanie logów przez System.out.println()?",
      options: [
        "System.out.println() nie działa w systemie Linux.",
        "System.out.println() jest synchronizowany na konsoli i drastycznie spowalnia aplikację w środowisku wielowątkowym, dodatkowo nie pozwala na filtrowanie poziomów logowania (np. INFO vs ERROR) ani łatwy zapis do pliku.",
        "Metoda ta rzuca wyjątek IOException.",
        "JVM usuwa te wywołania podczas optymalizacji JIT."
      ],
      answer: 1,
      explanation: "Standardowe wyjście konsoli jest blokujące i mało wydajne, dodatkowo brak w nim elastyczności (brak poziomów logów, metadanych czasu i nazwy wątku)."
    },
    {
      question: "Co to jest Fat-JAR (lub Uber-JAR)?",
      options: [
        "Plik JAR przechowujący duże pliki graficzne i bazy danych.",
        "Skompilowany plik archiwum .jar, który zawiera wszystkie klasy naszej aplikacji oraz dodatkowo wszystkie biblioteki zależne wewnątrz jednego pliku, co umożliwia uruchomienie aplikacji za pomocą komendy java -jar.",
        "Zintegrowane środowisko uruchomieniowe Java.",
        "Narzędzie do optymalizacji pamięci heap."
      ],
      answer: 1,
      explanation: "Fat-JAR łączy cały kod projektu i zależności w jeden plik wykonywalny, co ułatwia dystrybucję i deployment aplikacji."
    }
  ]
};
