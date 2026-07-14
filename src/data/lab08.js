export const lab08 = {
  id: "Lab08",
  title: "Лабораторна 8: Комерційна Архітектура, JDBC та Mockito",
  description: "Побудова тришарової архітектури (Controller-Service-Repository), безпечна робота з базою даних через JDBC, логування SLF4J та ізольоване тестування бізнес-логіки за допомогою Mockito.",
  sections: [
    {
      title: "Опис завдання",
      content: `
> [!NOTE]
> **Рекомендовані лекції для цієї лаби:** Лекція 18 (JDBC), Лекція 19 (SLF4J, Mockito).

У цій лабораторній роботі ми відійдемо від "студентського" коду, де все пишеться в одному методі \`main\`. Ви побудуєте мікро-модуль системи банку для управління клієнтами.

Ви дізнаєтесь, як пишуть код у реальних комерційних проектах:
1. **Тришарова архітектура:** Розділимо код на DTO, Repository (доступ до даних) та Service (бізнес-логіка).
2. **Логування:** Замість \`System.out.println()\` використаємо професійний фреймворк SLF4J.
3. **Безпека бази даних:** Використаємо \`PreparedStatement\` для захисту від SQL Injection та \`try-with-resources\` проти витоків пам'яті (Memory Leaks).
4. **Тестування:** Напишемо тести для Service, "відрізавши" реальну базу даних за допомогою \`Mockito\`.
`
    },
    {
      title: "Task 1: Налаштування проекту та Бази Даних (1 бал)",
      content: `
Ми використаємо базу даних **H2**. Це база "in-memory" — вона живе в оперативній пам'яті, поки працює програма. Вона ідеальна для навчання, бо не вимагає встановлення серверів (як PostgreSQL).

Додайте в \`pom.xml\` залежності для H2, SLF4J (з імплементацією Logback) та Mockito:
\`\`\`xml
<dependencies>
    <!-- H2 Database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <version>2.2.224</version>
    </dependency>
    <!-- SLF4J + Logback dla logowania -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.4.11</version>
    </dependency>
    <!-- Mockito do testow -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-junit-jupiter</artifactId>
        <version>5.7.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
\`\`\`

### Ініціалізація бази
Створіть клас \`DatabaseConfig\`. Його завдання — створити таблицю в базі при старті програми.
\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DatabaseConfig {
    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);
    public static final String JDBC_URL = "jdbc:h2:mem:bankdb;DB_CLOSE_DELAY=-1";

    public static void initializeDatabase() {
        log.info("Inicjalizacja bazy danych H2...");
        
        String sql = """
            CREATE TABLE IF NOT EXISTS clients (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                pesel VARCHAR(11) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                balance DECIMAL(15, 2) DEFAULT 0.00
            );
        """;

        try (Connection conn = DriverManager.getConnection(JDBC_URL, "sa", "");
             Statement stmt = conn.createStatement()) {
             
            stmt.execute(sql);
            log.info("Tabela 'clients' zostala pomyslnie utworzona.");
            
        } catch (Exception e) {
            // W komercyjnym kodzie błąd bazy zatrzymuje start aplikacji!
            log.error("Krytyczny blad inicjalizacji bazy danych!", e);
            throw new RuntimeException("Nie mozna uruchomic aplikacji bez bazy", e);
        }
    }
}
\`\`\`
`
    },
    {
      title: "Task 2: Шар Repository (Data Access Object) (2 бали)",
      content: `
Створіть запис \`Client\` (DTO):
\`\`\`java
public record Client(Long id, String pesel, String fullName, java.math.BigDecimal balance) {}
\`\`\`

Створіть клас \`ClientRepository\`. Це єдине місце в програмі, де дозволено писати SQL-запити.

> [!CAUTION]
> **Безпека:** Усі параметри до SQL-запитів потрібно передавати **тільки** через методи \`setInt\`, \`setString\` об'єкта \`PreparedStatement\`. Якщо ви склеїте запит через \`"SELECT * FROM " + name\`, вашу базу зламають атакою **SQL Injection**.

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.sql.*;
import java.util.Optional;

public class ClientRepository {
    private static final Logger log = LoggerFactory.getLogger(ClientRepository.class);

    // TODO 1: Napisz metodę findByPesel. Musi zwracać Optional<Client>.
    public Optional<Client> findByPesel(String pesel) {
        String sql = "SELECT id, pesel, full_name, balance FROM clients WHERE pesel = ?";
        
        // ZAWSZE zamykaj Connection, PreparedStatement i ResultSet w bloku try-with-resources!
        try (Connection conn = DriverManager.getConnection(DatabaseConfig.JDBC_URL, "sa", "");
             PreparedStatement stmt = conn.prepareStatement(sql)) {
             
            stmt.setString(1, pesel); // Bezpieczne bindowanie parametru
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Client client = new Client(
                        rs.getLong("id"),
                        rs.getString("pesel"),
                        rs.getString("full_name"),
                        rs.getBigDecimal("balance")
                    );
                    return Optional.of(client);
                }
            }
        } catch (SQLException e) {
            log.error("Blad bazy podczas szukania klienta z PESEL: {}", pesel, e);
        }
        return Optional.empty();
    }

    // TODO 2: Napisz metodę save(Client client).
    public boolean save(String pesel, String fullName) {
        String sql = "INSERT INTO clients (pesel, full_name, balance) VALUES (?, ?, ?)";
        
        try (Connection conn = DriverManager.getConnection(DatabaseConfig.JDBC_URL, "sa", "");
             PreparedStatement stmt = conn.prepareStatement(sql)) {
             
            // Ustaw parametry 1, 2, 3...
            stmt.setString(1, pesel);
            stmt.setString(2, fullName);
            stmt.setBigDecimal(3, BigDecimal.ZERO);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            log.error("Nie udalo sie zapisac klienta {}", pesel, e);
            return false;
        }
    }
}
\`\`\`
`
    },
    {
      title: "Task 3: Бізнес-логіка та Шар Service (1 бал)",
      content: `
Репозиторій тупо виконує команди. Логіка бізнесу (валідації, перевірки дублікатів) живе в класі \`Service\`.

Створіть \`ClientService\`. Зауважте, що Service не створює Repository через \`new\`, а отримує його через конструктор (це називається **Dependency Injection** — Ін'єкція залежностей). Це ключовий концепт для того, щоб код можна було протестувати!

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ClientService {
    private static final Logger log = LoggerFactory.getLogger(ClientService.class);
    
    // Zależność wstrzykiwana przez konstruktor
    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public void registerNewClient(String pesel, String fullName) {
        log.info("Proba rejestracji klienta: {}", pesel);
        
        // 1. Walidacja PESELU (bardzo prosta)
        if (pesel == null || pesel.length() != 11) {
            log.warn("Rejestracja odrzucona. Niepoprawny format PESEL: {}", pesel);
            throw new IllegalArgumentException("PESEL musi miec 11 znakow");
        }

        // 2. Regula biznesowa: PESEL musi byc unikalny
        if (clientRepository.findByPesel(pesel).isPresent()) {
            log.warn("Rejestracja odrzucona. Klient z PESEL {} juz istnieje w bazie!", pesel);
            throw new IllegalStateException("Klient o podanym numerze PESEL juz istnieje");
        }

        // 3. Zapis
        boolean isSaved = clientRepository.save(pesel, fullName);
        if (isSaved) {
            log.info("Sukces. Klient {} ({}) zarejestrowany.", fullName, pesel);
        } else {
            // W profesjonalnym systemie tutaj rzucamy Customowy Wyjatek (np. DatabaseException)
            log.error("Krytyczny blad. Nie udalo sie zapisac klienta {}", pesel);
            throw new RuntimeException("Blad zapisu do bazy");
        }
    }
}
\`\`\`
`
    },
    {
      title: "Task 4: Ізольоване Тестування з Mockito (2 бали)",
      content: `
Зараз ми хочемо протестувати наш \`ClientService\`. Але ми **не хочемо**, щоб під час тесту створювалася база даних H2 і туди реально записувалися дані. 

Чому? Бо тести мають бути:
* **Швидкими:** База стартує довго, а тести мають бігати за мілісекунди.
* **Ізольованими:** Якщо база даних впаде, тест \`ClientService\` провалиться, хоча логіка в ньому правильна!

Тут на сцену виходить **Mockito**.

Створіть клас \`ClientServiceTest\` у папці \`src/test/java\`.
\`\`\`java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// Mówimy JUnitowi, że używamy Mockito
@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    // 1. Tworzymy "Fałszywke" (Mock) repozytorium. Ten obiekt nie ma połaczenia z bazą!
    @Mock
    private ClientRepository clientRepository;

    // 2. Tworzymy prawdziwy Serwis, ale Mockito automatycznie wepchnie do jego konstruktora naszego Mocka.
    @InjectMocks
    private ClientService clientService;

    @Test
    void shouldThrowExceptionWhenPeselAlreadyExists() {
        // GIVEN: Konfigurujemy naszego Mocka. 
        // Mówimy mu: "Jeśli ktoś cie zapyta o PESEL 12345678901, to powiedz, że masz takiego w bazie".
        String pesel = "12345678901";
        Client existingClient = new Client(1L, pesel, "Jan Kowalski", BigDecimal.ZERO);
        
        when(clientRepository.findByPesel(pesel)).thenReturn(Optional.of(existingClient));

        // WHEN & THEN: Wywołujemy serwis i sprawdzamy czy rzucił odpowiedni wyjątek
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            clientService.registerNewClient(pesel, "Anna Nowak");
        });

        assertEquals("Klient o podanym numerze PESEL juz istnieje", exception.getMessage());
        
        // Weryfikacja: Upewniamy się, że serwis absolutnie NIE wywołał metody save() (bo była duplikacja)!
        verify(clientRepository, never()).save(anyString(), anyString());
    }

    @Test
    void shouldRegisterNewClientSuccessfully() {
        // TODO: Napisz test dla "Happy Path".
        // 1. Zrób tak, by findByPesel zwracało Optional.empty()
        // 2. Zrób tak, by save() zwracało true
        // 3. Wywołaj registerNewClient (nie powinno wyrzucić wyjątku, użyj assertDoesNotThrow)
        // 4. Zweryfikuj (verify), że metoda save() została wywołana dokładnie 1 raz (times(1)).
    }
}
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Dlaczego używamy PreparedStatement (z metodami setString, setInt) zamiast bezpośredniego sklejania zapytań SQL przez 'SELECT * FROM users WHERE name = ' + variable?",
      options: [
        "Ponieważ PreparedStatement potrafi kompresować dane wysyłane po sieci.",
        "Ponieważ to jedyny sposób na rzutowanie typów obiektowych Javy na SQL-owe.",
        "Aby zabezpieczyć się przed atakiem SQL Injection, w którym złośliwy użytkownik mógłby przesłać w zmiennej ciąg znaków modyfikujący zapytanie (np. ' OR 1=1; DROP TABLE users; --').",
        "Zwykłe sklejanie stringów używa klasycznego '+' co drastycznie obciąża String Pool Javy."
      ],
      answer: 2,
      explanation: "SQL Injection to najgroźniejsza luka bezpieczeństwa baz danych. PreparedStatement zawsze traktuje wprowadzone parametry stricte jako dane, a nie jako fragmenty kodu SQL do wykonania, skutecznie neutralizując atak."
    },
    {
      question: "Co dokładnie oznacza 'Wstrzykiwanie Zależności' (Dependency Injection) realizowane przez konstruktor, np. w naszym Service?",
      options: [
        "Oznacza to, że Service samodzielnie łączy się z zewnętrznym plikiem konfiguracyjnym wstrzykującym bazę.",
        "Oznacza to, że Service nie tworzy samemu swojego narzędzia (np. Repository = new Repository()), tylko wymaga, aby ktoś z zewnątrz (Main lub Framework np. Spring) przekazał mu gotowy obiekt jako argument w konstruktorze.",
        "Wstrzykiwanie zależności to inna nazwa na ładowanie klas przez Java Classloader.",
        "Zjawisko w którym klasy mogą wstrzykiwać zmienne prywatne do innych klas za pomocą Refleksji."
      ],
      answer: 1,
      explanation: "DI pozwala na 'podmianę' zależności. W środowisku produkcyjnym przekazujemy prawdziwe połączenie z bazą, a w klasie testowej podajemy w to samo miejsce fałszywkę (Mock), testując klasę w totalnej izolacji."
    },
    {
      question: "Czym różni się wywołanie testowe używające @Mock od rzeczywistego Repository?",
      options: [
        "Mock łączy się z bazą danych H2 (In-memory) zamiast bazy produkcyjnej PostgreSQL.",
        "Mock to wygenerowany przez Mockito fałszywy obiekt ('wydmuszka'), który pod maską nie ma żadnej logiki i nie wykonuje żadnego SQL-a. Zwraca tylko to, co ręcznie każemy mu zwrócić instrukcją 'when().thenReturn()'.",
        "Z mockiem musimy używać wielowątkowości w teście.",
        "Mock zapisuje wyniki wywołań w lokalnym pliku CSV."
      ],
      answer: 1,
      explanation: "Mock całkowicie 'odcina' kod poboczny. Dzięki temu testujemy tylko IF-y i pętle w konkretnej metodzie serwisu, upewniając się, że nie spadnie on z winy zewnętrznych problemów sieciowych czy bazodanowych."
    },
    {
      question: "Dlaczego obiekty takie jak Connection, PreparedStatement i ResultSet TRZEBA zamykać (lub używać try-with-resources)?",
      options: [
        "W przeciwnym razie serwer bazy danych (np. Postgres) będzie utrzymywał to połączenie otwarte jako zablokowany 'Socket'. Serwer posiada limit takich gniazd; gdy go wyczerpiemy (Connection Leak), nikt inny nie połączy się z bazą, a cała aplikacja przestanie odpowiadać.",
        "Aby uchronić się przed próbami włamania z innej klasy.",
        "Zamykanie zapobiega rzucaniu SQLException podczas wstawiania rekordów.",
        "Nie trzeba ich zamykać — mechanizm Garbage Collector Javy radzi sobie z tym automatycznie szybciej niż jakikolwiek kod użytkownika."
      ],
      answer: 0,
      explanation: "Wyciek połączeń (Connection Leak) to błąd numer 1 początkujących backendowców. Garbage Collector działa na pamięć RAM, ale pojęcia nie ma o zasobach sieciowych, portach czy socketach w systemie operacyjnym serwera."
    }
  ]
};
