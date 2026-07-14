export const lab09 = {
  id: "Lab09",
  title: "Лабораторна 9: Production-Ready Backend (Рефакторинг)",
  description: "Модернізація існуючого коду до індустріальних стандартів: використання Testcontainers для тестів, MDC для розподіленого логування та елементів Clean Architecture.",
  sections: [
    {
      title: "Опис завдання",
      content: `
Код, який ви написали у **Лабораторній 8**, працює. Він використовує базу даних, має тести з Mockito і безпечні SQL-запити. 
Проте, якщо ви покажете цей код на рев'ю досвідченому інженеру, він вкаже на кілька проблем, які вилізуть під час розгортання на реальних серверах (Production).

У цій лабораторній роботі ми не будемо писати новий проект. Ми будемо **рефакторити** (покращувати) код з Lab 08, впроваджуючи три індустріальні стандарти:
1. **MDC (Mapped Diagnostic Context):** Зробимо логи придатними для мікросервісів.
2. **Testcontainers:** Викинемо "фейкову" in-memory базу H2 з тестів і замінимо її на запуск реального Docker-контейнера з PostgreSQL.
3. **Inversion of Control (Clean Architecture):** Зробимо так, щоб бізнес-логіка взагалі не знала, з якою базою даних вона працює.
`
    },
    {
      title: "Task 1: Observability та MDC (1 бал)",
      content: `
У великій системі один HTTP-запит від клієнта може проходити через 5 різних сервісів. Якщо сталася помилка, знайти потрібний \`log.info\` у терабайтах логів неможливо.
Рішення — **MDC**. Це механізм, який дозволяє "приклеїти" до потоку (Thread) унікальний ідентифікатор (\`Trace ID\`). Тоді КОЖЕН лог, написаний у цьому потоці, автоматично матиме цей ID.

### Ваше завдання:
1. Знайдіть ваш \`ClientService\` з Lab 08.
2. Створіть новий метод (або обгортку), який генерує унікальний ID за допомогою \`java.util.UUID.randomUUID().toString()\`.
3. Додайте цей ID в MDC перед початком реєстрації клієнта і обов'язково видаліть його в блоці \`finally\`.

\`\`\`java
import org.slf4j.MDC;
import java.util.UUID;

public class ClientService {
    // ... poprzedni kod ...

    public void registerNewClientWithTrace(String pesel, String fullName) {
        // 1. Generujemy unikalny ID dla tej konkretnej operacji
        String traceId = UUID.randomUUID().toString();
        
        // 2. Wrzucamy do "kontekstu" pod kluczem "traceId"
        MDC.put("traceId", traceId);
        
        try {
            // Teraz WSZYSTKIE logi w metodzie registerNewClient (i wewnątrz Repository!) 
            // będą miały dostęp do tego traceId.
            registerNewClient(pesel, fullName);
            
        } finally {
            // 3. ZAWSZE czyścimy MDC w finally, ponieważ wątki w serwerach są reużywane (Thread Pool).
            // Jeśli tego nie zrobisz, logi kogoś innego dostaną Twój traceId!
            MDC.remove("traceId");
        }
    }
}
\`\`\`

**Зміна конфігурації:** 
Щоб ID з'явився в консолі, треба змінити шаблон виводу у файлі \`src/main/resources/logback.xml\`. 
Додайте \`[%X{traceId}]\` до патерну:
\`\`\`xml
<pattern>%d{HH:mm:ss.SSS} [%thread] [%X{traceId}] %-5level %logger{36} - %msg%n</pattern>
\`\`\`
*Запустіть код і переконайтеся, що тепер ваші логи виглядають так: \`15:42:11 [main] [a1b2c3d4...] INFO ClientService - Sukces\`.*
`
    },
    {
      title: "Task 2: Інтеграційні Тести з Testcontainers (2 бали)",
      content: `
У Lab 08 ми тестували логіку за допомогою **Mockito** (Unit тестування). Це ідеально для бізнес-логіки. Але як протестувати сам SQL-запит у \`ClientRepository\`? 
Тестувати на H2 — небезпечно, бо синтаксис H2 та реального PostgreSQL може відрізнятися.

Індустріальний стандарт — **Testcontainers**. Це бібліотека, яка перед запуском тесту автоматично качає Docker-образ PostgreSQL, запускає його, проганяє ваші тести на реальній базі, а після тесту — видаляє контейнер.

### Ваше завдання:
1. Додайте залежність у \`pom.xml\`:
\`\`\`xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.19.3</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>
\`\`\`

2. Створіть інтеграційний тест \`ClientRepositoryIT\`:
\`\`\`java
import org.junit.jupiter.api.*;
import org.testcontainers.containers.PostgreSQLContainer;
import java.sql.Connection;
import java.sql.DriverManager;

public class ClientRepositoryIT {

    // 1. Definiujemy kontener z prawdziwym PostgreSQL
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
        "postgres:15-alpine"
    );

    @BeforeAll
    static void beforeAll() {
        // 2. Startujemy kontener z Dockerem przed wszystkimi testami
        postgres.start();
        
        // 3. (Opcjonalnie) Tutaj musisz wykonać skrypt CREATE TABLE 
        // używając połączenia: postgres.getJdbcUrl(), postgres.getUsername()
    }

    @AfterAll
    static void afterAll() {
        // 4. Zatrzymujemy kontener
        postgres.stop();
    }

    @Test
    void shouldSaveAndFindClientInRealDb() {
        // TODO: Zainicjuj swój ClientRepository, ale przekaż mu dane dostępowe z kontenera:
        // String url = postgres.getJdbcUrl();
        // String user = postgres.getUsername();
        // String pass = postgres.getPassword();
        
        // Następnie wykonaj repository.save("123", "Test") i sprawdź czy findByPesel("123") go znajdzie.
        // Upewnisz się tym samym, że Twój kod SQL działa w 100% na prawdziwym Postgresie!
    }
}
\`\`\`
`
    },
    {
      title: "Task 3: Clean Architecture (Inversion of Control) (1 бал)",
      content: `
Зараз ваш \`ClientService\` міцно прив'язаний до \`ClientRepository\`. Хоч ми і використали Dependency Injection (передали через конструктор), \`ClientService\` знає, що \`ClientRepository\` — це конкретний клас, який працює з SQL.

Що, якщо завтра ми захочемо зберігати клієнтів не в SQL базі, а в MongoDB або просто у файлі? Доведеться переписувати весь сервіс!

**Рішення:** \`ClientService\` має залежати лише від **Інтерфейсу** (Port), а не від конкретної реалізації (Adapter).

### Ваше завдання:
1. Виділіть інтерфейс (Port) \`ClientStorage\`:
\`\`\`java
public interface ClientStorage {
    Optional<Client> findByPesel(String pesel);
    boolean save(String pesel, String fullName);
}
\`\`\`
2. Змініть ваш існуючий клас \`ClientRepository\`, щоб він імплементував цей інтерфейс, і перейменуйте його на \`JdbcClientRepository\` (Adapter).
3. Змініть \`ClientService\` так, щоб він приймав у конструкторі **лише інтерфейс** \`ClientStorage\`.

\`\`\`java
public class ClientService {
    private final ClientStorage storage;

    // Service nie ma pojęcia, czy dane idą do SQL, NoSQL, czy w eter.
    // Zależy tylko od kontraktu (interfejsu).
    public ClientService(ClientStorage storage) {
        this.storage = storage;
    }
    // ... reszta pozostaje bez zmian ...
}
\`\`\`

> [!TIP]
> Це ключовий принцип **SOLID (Dependency Inversion Principle)**. Бізнес-логіка (високий рівень) не повинна залежати від деталей інфраструктури (низький рівень). Обидві повинні залежати від абстракцій.
`
    }
  ],
  quiz: [
    {
      question: "Dlaczego używamy MDC (Mapped Diagnostic Context) w aplikacjach wielowątkowych/sieciowych, zamiast dodawać UUID jako zwykły parametr String do każdej wywoływanej metody (np. save(traceId, pesel, name))?",
      options: [
        "Ponieważ MDC kompresuje logi oszczędzając miejsce na dysku.",
        "MDC automatycznie podmienia hasła i dane wrażliwe (PESEL) na gwiazdki (***) w logach.",
        "Przekazywanie 'traceId' przez każdą metodę w systemie zanieczyściłoby kod i sygnatury metod logiką infrastrukturalną. MDC trzyma te dane w tle (ThreadLocal) tylko dla aktualnego wątku, dzięki czemu logika biznesowa pozostaje czysta.",
        "String w Javie jest niezmienny (immutable), więc przekazywanie go do wielu metod wywołałoby Memory Leak (wyciek pamięci)."
      ],
      answer: 2,
      explanation: "MDC bazuje na mechanizmie ThreadLocal. Dane wrzucone do MDC są widoczne wszędzie w danym wątku, bez konieczności przekazywania ich jako argumentów do tysięcy metod."
    },
    {
      question: "Jaka jest główna zaleta używania 'Testcontainers' w porównaniu do testowania na in-memory bazie danych (np. H2)?",
      options: [
        "Testcontainers wykonuje testy 100 razy szybciej niż baza in-memory.",
        "Bazy in-memory często obsługują tylko uproszczony dialekt SQL. Testcontainers podnosi prawdziwy, pełnoprawny obraz Dockerowy (np. PostgreSQL 15), co daje 100% pewność, że kod zadziała identycznie na środowisku produkcyjnym.",
        "Testcontainers automatycznie pisze asercje (sprawdzenia) za programistę.",
        "Testcontainers omija mechanizm transakcji, co ułatwia mockowanie wyjątków."
      ],
      answer: 1,
      explanation: "Chociaż H2 potrafi symulować składnię Postgresa, ma wiele ograniczeń (np. nie obsługuje specyficznych funkcji dat, typów JSONB czy specyficznych indexów). Testcontainers rozwiązuje problem różnic środowiskowych."
    },
    {
      question: "Co nam daje uzależnienie ClientService od interfejsu (ClientStorage), zamiast od konkretnej klasy (JdbcClientRepository)? (Zasada Inwersji Zależności)",
      options: [
        "Możliwość całkowitej wymiany technologii bazodanowej (np. z SQL na NoSQL) bez zmiany nawet jednej linijki kodu w klasie ClientService, która zawiera najcenniejszą logikę biznesową.",
        "Interfejsy wykonują kod szybciej niż klasy ze względu na optymalizację kompilatora JIT.",
        "Pozwala to na wielokrotne dziedziczenie (extends) klasy ClientService przez inne serwisy w systemie.",
        "Zabezpiecza to bazę danych przed atakami typu SQL Injection z poziomu warstwy Service."
      ],
      answer: 0,
      explanation: "To fundament Architektury Heksagonalnej (Ports and Adapters) oraz zasady 'D' z SOLID. Warstwa domeny (biznesowa) jest całkowicie odcięta od technologii infrastrukturalnych."
    },
    {
      question: "O czym musisz bezwzględnie pamiętać pracując z MDC na serwerach webowych (np. Tomcat, na których stoi Spring Boot)?",
      options: [
        "MDC usuwa się samo po 3 sekundach, więc zapytania bazodanowe muszą być szybsze.",
        "Zawsze musisz czyścić MDC w bloku 'finally' (MDC.remove). Serwery używają puli wątków (Thread Pool), więc zrecyklingowany wątek użyty do obsługi nowego użytkownika może mieć w MDC śmieci (traceId) po starym użytkowniku.",
        "MDC wspiera tylko liczby całkowite (int), więc nie można tam wrzucać UUID w formie tekstu.",
        "MDC musi zostać zainicjalizowany blokiem 'synchronized', aby uniknąć kolizji."
      ],
      answer: 1,
      explanation: "Pule wątków reużywają obiekty Thread. Ponieważ MDC przechowuje dane przypięte do wątku (ThreadLocal), jeśli nie posprzątasz, kolejny HTTP Request, który dostanie ten wątek do obsłużenia, odziedziczy traceId po poprzednim zapytaniu."
    }
  ]
};
