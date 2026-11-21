---
title: Lab 10: Layered Architecture, JDBC, Transactions and Mockito
description: A bank customer service module: a domain model and PESEL validation, a repository on plain JDBC (PreparedStatement, generated keys, Optional), an atomic money transfer in a transaction, a service with SLF4J logging that keeps personal data out of logs, unit tests with Mockito and integration tests on H2.
---

## Before You Start

> [!NOTE]
> **Lectures:** 14.1 "Testing with JUnit 5", 14.5 "Databases and JDBC", 14.6 "Logging and Mockito" · **Time:** 3 h · **Points:** 10

So far all the code lived in `main`. Here you will build a module the way commercial projects do it:

```text
pl.mini.bank
├── domain/       Client, Pesel, InsufficientFundsException      (no dependencies)
├── repository/   ClientRepository (an interface), JdbcClientRepository, DataAccessException
├── service/      ClientService                                   (business logic, logging)
└── db/           Database (a DataSource + schema initialization)

src/main/resources/schema.sql, logback.xml
src/test/java/... ClientServiceTest (Mockito), JdbcClientRepositoryIT (H2)
```

```text
ClientService ──► ClientRepository (interface) ◄── JdbcClientRepository ──► H2 / PostgreSQL
      │                    ▲
      └── in tests: mock ──┘
```

### Dependencies

```xml
<dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><version>2.3.232</version></dependency>
<dependency><groupId>ch.qos.logback</groupId><artifactId>logback-classic</artifactId><version>1.5.8</version></dependency>
<dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.11.0</version><scope>test</scope></dependency>
<dependency><groupId>org.mockito</groupId><artifactId>mockito-junit-jupiter</artifactId><version>5.14.1</version><scope>test</scope></dependency>
<dependency><groupId>org.assertj</groupId><artifactId>assertj-core</artifactId><version>3.26.3</version><scope>test</scope></dependency>
```

### Rules

* The acceptance criterion: `mvn verify` passes, and the **given tests** (below) are green. Add your own tests for edge cases.
* Money is only `BigDecimal` in Java and `NUMERIC(15,2)` in the database.

> [!CAUTION]
> Forbidden: concatenating SQL with data (`"... WHERE pesel = '" + pesel + "'"`), `System.out.println` in `main` code (only the logger), full PESEL numbers in logs.

## A Quick Theory Recap

### JDBC: the Query Template

```java
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
```

### A Transaction

```java
try (Connection c = ds.getConnection()) {
    c.setAutoCommit(false);
    try {
        // ... several UPDATEs on THE SAME connection c ...
        c.commit();
    } catch (Exception e) {
        c.rollback();
        throw e;
    }
}
```

### Mockito

```java
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
```

### SLF4J

```java
private static final Logger log = LoggerFactory.getLogger(ClientService.class);
log.info("Registered client {}", Pesel.mask(pesel));   // a placeholder, not "+"
log.error("Transfer failed", e);                         // the exception as the last argument
```

## Stage 1: The Model and the Database Schema (1 pt)

`src/main/resources/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS clients (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    pesel      CHAR(11)      NOT NULL UNIQUE,
    full_name  VARCHAR(200)  NOT NULL,
    balance    NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

```java
public record Client(Long id, String pesel, String fullName, BigDecimal balance) {
    public Client {               // a compact constructor: invariants
        if (!Pesel.isValid(pesel)) throw new IllegalArgumentException("invalid PESEL");
        if (fullName == null || fullName.isBlank()) throw new IllegalArgumentException("empty name");
        if (balance == null || balance.signum() < 0) throw new IllegalArgumentException("balance < 0");
    }
}

public final class Database {
    public static DataSource h2InMemory(String name);   // jdbc:h2:mem:<name>;DB_CLOSE_DELAY=-1, + running schema.sql
}
```

### Pesel

```java
public final class Pesel {
    public static boolean isValid(String pesel);
    public static String mask(String pesel);    // "44051401359" -> "*******1359"
}
```

The check digit rule: the weights `1 3 7 9 1 3 7 9 1 3` for the first 10 digits, `S = Σ dᵢ·wᵢ`, the check digit = `(10 − S mod 10) mod 10`, and it must equal the 11th digit. Valid examples: `44051401359`, `02070803628`.

* Read `schema.sql` from the classpath (`Database.class.getResourceAsStream("/schema.sql")`) and run it with `Statement.execute`.

## Stage 2: A JDBC Repository (3 pts)

```java
public interface ClientRepository {
    Client save(Client c);                      // INSERT; returns a copy with the id from the database
    Optional<Client> findByPesel(String pesel);
    List<Client> findAll();                     // by id ascending
    boolean updateBalance(String pesel, BigDecimal newBalance);   // false if there is no such client
    void transfer(String fromPesel, String toPesel, BigDecimal amount);   // stage 3
}

public class DataAccessException extends RuntimeException { ... }   // an unchecked wrapper of SQLException
```

* `save`: `prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)` and `getGeneratedKeys()`.
* A `UNIQUE` violation (a duplicate PESEL) → `DuplicateClientException` (a subclass of `DataAccessException`). Recognize it by `SQLIntegrityConstraintViolationException` or the SQLState `23505`/`23xxx`.
* Mapping a row to an object lives in one private method `map(ResultSet)`.
* Each method takes a **new** connection from the `DataSource` and closes it.

> [!TIP]
> `DataAccessException` is unchecked: the service layer should not know about `SQLException`. Spring works the same way (`org.springframework.dao.DataAccessException`).

## Stage 3: A Transactional Transfer (2 pts)

Implement `transfer(from, to, amount)` in `JdbcClientRepository` **in one transaction**:

1. `amount <= 0` or `from.equals(to)` → `IllegalArgumentException` (before touching the database).
2. Debit `from`: `UPDATE clients SET balance = balance - ? WHERE pesel = ? AND balance >= ?`. If 0 rows changed → `InsufficientFundsException` (or `NoSuchClientException` if the client does not exist at all).
3. Credit `to`. 0 rows → `NoSuchClientException`.
4. `commit`; on any error — `rollback` and rethrow.

> [!IMPORTANT]
> The `balance >= ?` condition inside the `UPDATE` itself makes the check and the debit **atomic** at the database level. The "first SELECT the balance, then UPDATE" variant has a race: two parallel transfers can both see a sufficient balance.

### The Given Integration Test (a Fragment)

```java
class JdbcClientRepositoryIT {
    private ClientRepository repo;

    @BeforeEach
    void setUp() {
        repo = new JdbcClientRepository(Database.h2InMemory("test-" + UUID.randomUUID()));   // a fresh database
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
        assertThatThrownBy(() -> repo.save(new Client(null, "44051401359", "Someone", BigDecimal.ZERO)))
                .isInstanceOf(DuplicateClientException.class);
    }
}
```

> [!WARNING]
> `BigDecimal.equals` takes the scale into account: `70.0` ≠ `70.00`. A value from a `NUMERIC(15,2)` column has scale 2, so compare with `new BigDecimal("70.00")` or with `isEqualByComparingTo`.

## Stage 4: The Service and Logging (2 pts)

```java
public class ClientService {
    public ClientService(ClientRepository repository);

    public Client register(String pesel, String fullName);   // a duplicate -> DuplicateClientException
    public Client deposit(String pesel, BigDecimal amount);   // amount > 0
    public void transfer(String from, String to, BigDecimal amount);
    public BigDecimal totalBalance();                         // the sum over all clients
}
```

* `register` first checks `findByPesel` (a clear message for the user), and the `UNIQUE` constraint in the database is the last line of defense against a race.
* `fullName` is normalized: `strip()` and collapsing several spaces into one.
* Logging (`src/main/resources/logback.xml` with the pattern `%d{HH:mm:ss} %-5level %logger{20} - %msg%n`):
  * `INFO` — a successful registration/transfer (the PESEL only through `Pesel.mask`);
  * `WARN` — a business rejection (insufficient funds, a duplicate);
  * `ERROR` with the exception — an unexpected `DataAccessException`;
  * `DEBUG` — details (amounts, the duration of the operation).

> [!NOTE]
> Why `WARN` and not `ERROR` for "insufficient funds"? It is an expected business situation, and the system behaved correctly. `ERROR` means someone needs to step in. If every rejection is marked as `ERROR`, real failures get lost among them.

## Stage 5: Unit Tests with Mockito (2 pts)

Write `ClientServiceTest` **without a database**: `ClientRepository` is a mock. At a minimum:

```java
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
```

* Each test checks **one behavior** and has a name that describes it.
* The service unit tests must run in milliseconds: no H2 in this class.

> [!TIP]
> If a test needs 10 lines of `when(...)`, it is a sign that the service does too much or that the test checks the implementation rather than the behavior. An alternative to a mock is a simple **fake**: an `InMemoryClientRepository` on a `HashMap`.

Commit, tag it `lab10` and push. The code of this lab will be needed in lab 12.
