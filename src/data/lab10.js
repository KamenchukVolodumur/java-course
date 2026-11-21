export const lab10 = {
  id: "Lab10",
  title: "Лабораторна 10: Шарова архітектура, JDBC, транзакції та Mockito",
  description: "Модуль обслуговування клієнтів банку: доменна модель і валідація PESEL, репозиторій на чистому JDBC (PreparedStatement, згенеровані ключі, Optional), атомарний переказ коштів у транзакції, сервіс із логуванням SLF4J без персональних даних, модульні тести з Mockito та інтеграційні тести на H2.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 14.1 «Тестування з JUnit 5», 14.5 «Бази даних і JDBC», 14.6 «Логування і Mockito» · **Час:** 3 год · **Бали:** 10

Досі весь код жив у \`main\`. Тут ви побудуєте модуль так, як це роблять у комерційних проєктах:

\`\`\`text
pl.mini.bank
├── domain/       Client, Pesel, InsufficientFundsException      (без залежностей)
├── repository/   ClientRepository (інтерфейс), JdbcClientRepository, DataAccessException
├── service/      ClientService                                   (бізнес-логіка, логування)
└── db/           Database (DataSource + ініціалізація схеми)

src/main/resources/schema.sql, logback.xml
src/test/java/... ClientServiceTest (Mockito), JdbcClientRepositoryIT (H2)
\`\`\`

\`\`\`text
ClientService ──► ClientRepository (інтерфейс) ◄── JdbcClientRepository ──► H2 / PostgreSQL
      │                    ▲
      └── у тестах: mock ──┘
\`\`\`

### Залежності

\`\`\`xml
<dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><version>2.3.232</version></dependency>
<dependency><groupId>ch.qos.logback</groupId><artifactId>logback-classic</artifactId><version>1.5.8</version></dependency>
<dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.11.0</version><scope>test</scope></dependency>
<dependency><groupId>org.mockito</groupId><artifactId>mockito-junit-jupiter</artifactId><version>5.14.1</version><scope>test</scope></dependency>
<dependency><groupId>org.assertj</groupId><artifactId>assertj-core</artifactId><version>3.26.3</version><scope>test</scope></dependency>
\`\`\`

### Правила

* Критерій приймання — \`mvn verify\` проходить, і **надані тести** (нижче) зелені. Додайте власні тести на граничні випадки.
* Гроші — лише \`BigDecimal\` у Java і \`NUMERIC(15,2)\` у базі.

> [!CAUTION]
> Заборонено: склеювання SQL з даними (\`"... WHERE pesel = '" + pesel + "'"\`), \`System.out.println\` у коді \`main\` (лише логер), повні номери PESEL у логах.
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### JDBC: шаблон запиту

\`\`\`java
String sql = "SELECT id, pesel, full_name, balance FROM clients WHERE pesel = ?";
try (Connection c = dataSource.getConnection();
     PreparedStatement ps = c.prepareStatement(sql)) {
    ps.setString(1, pesel);
    try (ResultSet rs = ps.executeQuery()) {
        return rs.next() ? Optional.of(map(rs)) : Optional.empty();
    }
} catch (SQLException e) {
    throw new DataAccessException("findByPesel", e);
}
\`\`\`

### Транзакція

\`\`\`java
try (Connection c = ds.getConnection()) {
    c.setAutoCommit(false);
    try {
        // ... кілька UPDATE на ТОМУ САМОМУ з'єднанні c ...
        c.commit();
    } catch (Exception e) {
        c.rollback();
        throw e;
    }
}
\`\`\`

### Mockito

\`\`\`java
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    @Mock ClientRepository repo;
    @InjectMocks ClientService service;

    @Test void example() {
        when(repo.findByPesel("44051401359")).thenReturn(Optional.empty());
        service.register("44051401359", "Jan Kowalski");
        verify(repo).save(argThat(c -> c.fullName().equals("Jan Kowalski")));
    }
}
\`\`\`

### SLF4J

\`\`\`java
private static final Logger log = LoggerFactory.getLogger(ClientService.class);
log.info("Зареєстровано клієнта {}", Pesel.mask(pesel));   // плейсхолдер, а не "+"
log.error("Переказ не вдався", e);                          // виняток останнім аргументом
\`\`\`
`
    },
    {
      title: "Етап 1: Модель і схема бази (1 б.)",
      content: `
\`src/main/resources/schema.sql\`:

\`\`\`sql
CREATE TABLE IF NOT EXISTS clients (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    pesel      CHAR(11)      NOT NULL UNIQUE,
    full_name  VARCHAR(200)  NOT NULL,
    balance    NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

\`\`\`java
public record Client(Long id, String pesel, String fullName, BigDecimal balance) {
    public Client {               // компактний конструктор: інваріанти
        if (!Pesel.isValid(pesel)) throw new IllegalArgumentException("некоректний PESEL");
        if (fullName == null || fullName.isBlank()) throw new IllegalArgumentException("порожнє ім'я");
        if (balance == null || balance.signum() < 0) throw new IllegalArgumentException("баланс < 0");
    }
}

public final class Database {
    public static DataSource h2InMemory(String name);   // jdbc:h2:mem:<name>;DB_CLOSE_DELAY=-1, + виконання schema.sql
}
\`\`\`

### Pesel

\`\`\`java
public final class Pesel {
    public static boolean isValid(String pesel);
    public static String mask(String pesel);    // "44051401359" -> "*******1359"
}
\`\`\`

Правило контрольної цифри: ваги \`1 3 7 9 1 3 7 9 1 3\` для перших 10 цифр, \`S = Σ dᵢ·wᵢ\`, контрольна цифра = \`(10 − S mod 10) mod 10\` і має дорівнювати 11-й цифрі. Коректні приклади: \`44051401359\`, \`02070803628\`.

* \`schema.sql\` читайте з classpath (\`Database.class.getResourceAsStream("/schema.sql")\`) і виконуйте через \`Statement.execute\`.
`
    },
    {
      title: "Етап 2: Репозиторій на JDBC (3 б.)",
      content: `
\`\`\`java
public interface ClientRepository {
    Client save(Client c);                      // INSERT; повертає копію з id з бази
    Optional<Client> findByPesel(String pesel);
    List<Client> findAll();                     // за id зростаючи
    boolean updateBalance(String pesel, BigDecimal newBalance);   // false, якщо клієнта немає
    void transfer(String fromPesel, String toPesel, BigDecimal amount);   // етап 3
}

public class DataAccessException extends RuntimeException { ... }   // unchecked обгортка SQLException
\`\`\`

* \`save\`: \`prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)\` і \`getGeneratedKeys()\`.
* Порушення \`UNIQUE\` (дублікат PESEL) → \`DuplicateClientException\` (підклас \`DataAccessException\`). Розпізнавайте за \`SQLIntegrityConstraintViolationException\` або SQLState \`23505\`/\`23xxx\`.
* Відображення рядка на об'єкт — в одному приватному методі \`map(ResultSet)\`.
* Кожен метод бере **нове** з'єднання з \`DataSource\` і закриває його.

> [!TIP]
> \`DataAccessException\` — unchecked: сервісний шар не повинен знати про \`SQLException\`. Так працює й Spring (\`org.springframework.dao.DataAccessException\`).
`
    },
    {
      title: "Етап 3: Транзакційний переказ (2 б.)",
      content: `
Реалізуйте \`transfer(from, to, amount)\` в \`JdbcClientRepository\` **в одній транзакції**:

1. \`amount <= 0\` або \`from.equals(to)\` → \`IllegalArgumentException\` (ще до звернення до бази).
2. Списати з \`from\`: \`UPDATE clients SET balance = balance - ? WHERE pesel = ? AND balance >= ?\`. Якщо змінено 0 рядків → \`InsufficientFundsException\` (або \`NoSuchClientException\`, якщо клієнта немає взагалі).
3. Зарахувати на \`to\`. 0 рядків → \`NoSuchClientException\`.
4. \`commit\`; за будь-якої помилки — \`rollback\` і повторне кидання.

> [!IMPORTANT]
> Умова \`balance >= ?\` в самому \`UPDATE\` робить перевірку і списання **атомарними** на рівні бази. Варіант «спочатку SELECT балансу, потім UPDATE» має гонку: два паралельні перекази можуть обидва побачити достатній баланс.

### Наданий інтеграційний тест (фрагмент)

\`\`\`java
class JdbcClientRepositoryIT {
    private ClientRepository repo;

    @BeforeEach
    void setUp() {
        repo = new JdbcClientRepository(Database.h2InMemory("test-" + UUID.randomUUID()));   // свіжа база
        repo.save(new Client(null, "44051401359", "Jan Kowalski", new BigDecimal("100.00")));
        repo.save(new Client(null, "02070803628", "Anna Nowak", new BigDecimal("20.00")));
    }

    @Test
    void transferMovesMoney() {
        repo.transfer("44051401359", "02070803628", new BigDecimal("30.00"));
        assertThat(repo.findByPesel("44051401359")).get().extracting(Client::balance).isEqualTo(new BigDecimal("70.00"));
        assertThat(repo.findByPesel("02070803628")).get().extracting(Client::balance).isEqualTo(new BigDecimal("50.00"));
    }

    @Test
    void failedTransferChangesNothing() {
        assertThatThrownBy(() -> repo.transfer("44051401359", "99999999999", new BigDecimal("30.00")))
                .isInstanceOf(NoSuchClientException.class);
        assertThat(repo.findByPesel("44051401359")).get()
                .extracting(Client::balance).isEqualTo(new BigDecimal("100.00"));   // rollback!
    }

    @Test
    void duplicatePeselIsRejected() {
        assertThatThrownBy(() -> repo.save(new Client(null, "44051401359", "Хтось", BigDecimal.ZERO)))
                .isInstanceOf(DuplicateClientException.class);
    }
}
\`\`\`

> [!WARNING]
> \`BigDecimal.equals\` враховує масштаб: \`70.0\` ≠ \`70.00\`. Значення з бази \`NUMERIC(15,2)\` має масштаб 2, тож порівнюйте з \`new BigDecimal("70.00")\` або через \`isEqualByComparingTo\`.
`
    },
    {
      title: "Етап 4: Сервіс і логування (2 б.)",
      content: `
\`\`\`java
public class ClientService {
    public ClientService(ClientRepository repository);

    public Client register(String pesel, String fullName);   // дублікат -> DuplicateClientException
    public Client deposit(String pesel, BigDecimal amount);   // amount > 0
    public void transfer(String from, String to, BigDecimal amount);
    public BigDecimal totalBalance();                         // сума по всіх клієнтах
}
\`\`\`

* \`register\` спочатку перевіряє \`findByPesel\` (зрозуміле повідомлення для користувача), а \`UNIQUE\` у базі — остання лінія захисту від гонки.
* \`fullName\` нормалізується: \`strip()\` і стискання кількох пробілів в один.
* Логування (\`src/main/resources/logback.xml\` з патерном \`%d{HH:mm:ss} %-5level %logger{20} - %msg%n\`):
  * \`INFO\` — успішна реєстрація/переказ (PESEL лише через \`Pesel.mask\`);
  * \`WARN\` — бізнес-відмова (бракує коштів, дублікат);
  * \`ERROR\` з винятком — неочікувана \`DataAccessException\`;
  * \`DEBUG\` — деталі (суми, тривалість операції).

> [!NOTE]
> Чому \`WARN\`, а не \`ERROR\` для «бракує коштів»? Це очікувана бізнес-ситуація, і система спрацювала правильно. \`ERROR\` означає, що комусь треба втрутитися. Якщо позначати як \`ERROR\` кожну відмову, справжні аварії загубляться серед них.
`
    },
    {
      title: "Етап 5: Модульні тести з Mockito (2 б.)",
      content: `
Напишіть \`ClientServiceTest\` **без бази даних**: \`ClientRepository\` — mock. Мінімум:

\`\`\`java
@ExtendWith(MockitoExtension.class)
class ClientServiceTest {
    @Mock ClientRepository repo;
    @InjectMocks ClientService service;
    @Captor ArgumentCaptor<Client> clientCaptor;

    @Test
    void registerSavesNormalizedName() {
        when(repo.findByPesel("44051401359")).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(inv -> {
            Client c = inv.getArgument(0);
            return new Client(1L, c.pesel(), c.fullName(), c.balance());
        });

        Client saved = service.register("44051401359", "  Jan   Kowalski ");

        verify(repo).save(clientCaptor.capture());
        assertThat(clientCaptor.getValue().fullName()).isEqualTo("Jan Kowalski");
        assertThat(saved.id()).isEqualTo(1L);
    }

    @Test
    void registerRejectsDuplicateWithoutSaving() { /* findByPesel -> Optional.of(...) ; verify(repo, never()).save(any()) */ }

    @Test
    void transferRejectsNonPositiveAmountWithoutTouchingRepository() { /* verifyNoInteractions(repo) */ }

    @Test
    void totalBalanceSumsAllClients() { /* when(repo.findAll()).thenReturn(List.of(...)) */ }

    @Test
    void depositPropagatesUnexpectedDataAccessError() { /* thenThrow(new DataAccessException(...)) */ }
}
\`\`\`

* Кожен тест перевіряє **одну поведінку** і має назву, що її описує.
* Тести модуля сервісу мають виконуватися за мілісекунди: жодного H2 у цьому класі.

> [!TIP]
> Якщо для тесту потрібно 10 рядків \`when(...)\`, це сигнал, що сервіс робить забагато або тест перевіряє реалізацію, а не поведінку. Альтернатива моку — простий **fake**: \`InMemoryClientRepository\` на \`HashMap\`.

Закомітьте, позначте тегом \`lab10\` і запуште. Код цієї лабораторної знадобиться в лабораторній 12.
`
    }
  ],
  quiz: [
    {
      question: "Чому списання робиться одним UPDATE ... WHERE balance >= ?, а не SELECT + перевірка в Java + UPDATE?",
      options: [
        "Так коротше",
        "Перевірка й зміна стають атомарними в базі; між SELECT і UPDATE паралельний переказ міг би змінити баланс",
        "SELECT не працює в транзакціях",
        "Так вимагає H2"
      ],
      answer: 1,
      explanation: "Це check-then-act на рівні бази. Умова в UPDATE і перевірка кількості змінених рядків усувають гонку."
    },
    {
      question: "Чому репозиторій кидає unchecked DataAccessException замість SQLException?",
      options: [
        "SQLException застарів",
        "Щоб сервісний шар не залежав від деталей JDBC: він працює з інтерфейсом ClientRepository, і реалізація може бути будь-якою",
        "Unchecked-винятки швидші",
        "Mockito не підтримує checked-винятки"
      ],
      answer: 1,
      explanation: "Абстракція не повинна «протікати»: SQLException у сигнатурі інтерфейсу прив'язав би його до JDBC."
    },
    {
      question: "Що перевіряє verify(repo, never()).save(any())?",
      options: [
        "Що save повертає null",
        "Що метод save жодного разу не викликали",
        "Що save кинув виняток",
        "Що save викликали з null"
      ],
      answer: 1,
      explanation: "Так перевіряють, що, наприклад, дублікат не збережено. Варто перевіряти і результат, і відсутність побічних ефектів."
    },
    {
      question: "Чому в логах PESEL маскується?",
      options: [
        "Щоб логи були коротшими",
        "PESEL — персональні дані; логи читає багато людей і систем, і зберігаються вони довго (GDPR)",
        "Logback не підтримує цифр",
        "Так швидше"
      ],
      answer: 1,
      explanation: "Для діагностики досить кількох останніх цифр. Повний ідентифікатор у логах був би витоком персональних даних."
    }
  ]
};
