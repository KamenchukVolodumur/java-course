---
title: Бази даних і JDBC
description: Як влаштовані реляційні бази даних, основи SQL (DDL, CRUD, JOIN, агрегація), підключення до бази з Java через JDBC: PreparedStatement і захист від SQL-ін'єкцій, транзакції, пакетні операції, пул з'єднань, патерн Repository і огляд ORM (JPA/Hibernate).
---

## Реляційні бази даних
Коли дані мають пережити перезапуск програми, їх зберігають у базі даних. Найпоширеніші — **реляційні СУБД**: PostgreSQL, MySQL, Oracle, SQL Server, а також вбудована H2 (зручна для тестів).

| Поняття | Що це | Відповідник у Java |
| --- | --- | --- |
| **Таблиця** | набір записів одного типу (`users`, `orders`) | клас |
| **Рядок (запис)** | один об'єкт з даними | екземпляр класу |
| **Стовпець** | атрибут певного типу | поле |
| **Первинний ключ (PK)** | унікальний ідентифікатор рядка | `id` |
| **Зовнішній ключ (FK)** | посилання на PK іншої таблиці | посилання на інший об'єкт |
| **Індекс** | структура для швидкого пошуку (B-дерево) | щось на кшталт `TreeMap` |

### Створення схеми (DDL)

```sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,           -- автоінкремент (PostgreSQL)
    email      VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    age        INT CHECK (age >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total    NUMERIC(10, 2) NOT NULL,
    status   VARCHAR(20) NOT NULL
);

CREATE INDEX idx_orders_user ON orders(user_id);
```

> [!TIP]
> Гроші зберігайте в `NUMERIC/DECIMAL` і читайте в `BigDecimal`. Тип `FLOAT` для грошей не підходить.

## SQL: CRUD, JOIN, агрегація
### Читання — SELECT

```sql
SELECT * FROM users;
SELECT email, first_name FROM users WHERE age > 18 ORDER BY first_name LIMIT 10;
SELECT * FROM users WHERE email LIKE '%@pw.edu.pl' AND age BETWEEN 18 AND 26;
```

### Створення — INSERT

```sql
INSERT INTO users (email, first_name, age) VALUES ('jan@example.com', 'Jan', 25);
```

### Зміна і видалення — UPDATE і DELETE

```sql
UPDATE users SET email = 'new@example.com' WHERE id = 42;
DELETE FROM users WHERE id = 42;
```

> [!CAUTION]
> `UPDATE` чи `DELETE` **без WHERE** змінить або видалить **усі** рядки таблиці.

### JOIN — дані з кількох таблиць

```sql
-- INNER JOIN: лише користувачі, які мають замовлення
SELECT u.first_name, o.id, o.total
FROM orders o
JOIN users u ON o.user_id = u.id;

-- LEFT JOIN: усі користувачі, замовлення — якщо є (інакше NULL)
SELECT u.first_name, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

### Агрегація — GROUP BY

```sql
SELECT u.first_name, COUNT(o.id) AS orders_count, SUM(o.total) AS spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.first_name
HAVING SUM(o.total) > 100          -- фільтр ПІСЛЯ групування
ORDER BY spent DESC;
```

Порівняння зі Stream API: `GROUP BY` ↔ `Collectors.groupingBy`, `WHERE` ↔ `filter`, `HAVING` ↔ `filter` після групування, `JOIN` ↔ `Map` + `flatMap`.

## JDBC: з'єднання і запити
**JDBC** (Java Database Connectivity, пакет `java.sql`) — стандартний низькорівневий API доступу до баз даних.

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.4</version>
</dependency>
<!-- для тестів: in-memory база -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.3.232</version>
</dependency>
```

```java
String url = "jdbc:postgresql://localhost:5432/shop";   // H2: "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1"

try (Connection conn = DriverManager.getConnection(url, "shop", System.getenv("DB_PASSWORD"));
     PreparedStatement ps = conn.prepareStatement(
             "SELECT id, email, first_name, age FROM users WHERE age > ? ORDER BY id")) {

    ps.setInt(1, 18);                                   // параметри нумеруються з 1!

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {                             // курсор на наступний рядок
            long id = rs.getLong("id");
            String email = rs.getString("email");
            int age = rs.getInt("age");
            boolean ageWasNull = rs.wasNull();          // getInt повертає 0 для NULL!
            System.out.println(id + " " + email);
        }
    }
}
```

| Метод | Для чого | Повертає |
| --- | --- | --- |
| `executeQuery()` | SELECT | `ResultSet` |
| `executeUpdate()` | INSERT, UPDATE, DELETE, DDL | кількість змінених рядків |
| `execute()` | будь-що | `true`, якщо є ResultSet |

> [!IMPORTANT]
> `Connection`, `Statement` і `ResultSet` — це ресурси (мережеве з'єднання, курсор у БД). **Завжди** закривайте їх через try-with-resources.

### Отримання згенерованого id

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO users (email, first_name, age) VALUES (?, ?, ?)",
        Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, user.email());
    ps.setString(2, user.firstName());
    ps.setInt(3, user.age());
    ps.executeUpdate();
    try (ResultSet keys = ps.getGeneratedKeys()) {
        keys.next();
        long newId = keys.getLong(1);
    }
}
```

## SQL-ін'єкції
```java
// ❌ НІКОЛИ ТАК НЕ РОБІТЬ
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
stmt.executeQuery(sql);
```

Якщо користувач введе `' OR '1'='1`, запит перетвориться на

```sql
SELECT * FROM users WHERE email = '' OR '1'='1'      -- поверне ВСІХ користувачів
```

А `'; DROP TABLE users; --` видалить таблицю.

### Захист — PreparedStatement

```java
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);       // значення передається ОКРЕМО від тексту запиту
```

База отримує шаблон запиту і значення **окремо**, тож значення ніколи не стане частиною SQL-коду.

> [!WARNING]
> Параметри `?` працюють лише для **значень**. Назви таблиць, стовпців чи напрямок `ORDER BY` підставити через `?` не можна. Якщо вони залежать від введення, перевіряйте їх за білим списком (наприклад, `enum SortColumn`).

## Транзакції, пакетні операції, пул з'єднань
### Транзакції (ACID)

За замовчуванням JDBC працює в режимі **autocommit**: кожен запит — окрема транзакція. Щоб кілька операцій виконалися **або всі, або жодна**:

```java
public void transfer(long fromId, long toId, BigDecimal amount) throws SQLException {
    try (Connection conn = dataSource.getConnection()) {
        conn.setAutoCommit(false);
        try (var debit = conn.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?");
             var credit = conn.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {

            debit.setBigDecimal(1, amount); debit.setLong(2, fromId); debit.setBigDecimal(3, amount);
            if (debit.executeUpdate() != 1) throw new InsufficientFundsException(amount);

            credit.setBigDecimal(1, amount); credit.setLong(2, toId);
            credit.executeUpdate();

            conn.commit();                   // зафіксувати обидві зміни
        } catch (Exception e) {
            conn.rollback();                 // скасувати все
            throw e;
        }
    }
}
```

**ACID**: Atomicity (атомарність), Consistency (узгодженість), Isolation (ізоляція), Durability (довговічність).

### Пакетні операції

```java
try (var ps = conn.prepareStatement("INSERT INTO logs (level, message) VALUES (?, ?)")) {
    for (LogEntry e : entries) {
        ps.setString(1, e.level());
        ps.setString(2, e.message());
        ps.addBatch();
    }
    ps.executeBatch();          // один мережевий обмін замість тисяч
}
```

### Пул з'єднань

Відкрити з'єднання з БД дорого: TCP, автентифікація, десятки мілісекунд. **Пул** тримає готові з'єднання, а `close()` повертає з'єднання в пул, а не закриває його. Стандарт — **HikariCP**:

```java
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:postgresql://localhost:5432/shop");
cfg.setUsername("shop");
cfg.setPassword(System.getenv("DB_PASSWORD"));
cfg.setMaximumPoolSize(10);
DataSource dataSource = new HikariDataSource(cfg);   // DataSource замість DriverManager
```

> [!CAUTION]
> Ніколи не зберігайте паролі в коді чи репозиторії. Беріть їх зі змінних середовища або з менеджера секретів.

## Патерн Repository і огляд ORM
Код JDBC варто ізолювати в класах-**репозиторіях**, щоб бізнес-логіка не знала про SQL:

```java
public record User(Long id, String email, String firstName, int age) { }

public interface UserRepository {
    Optional<User> findById(long id);
    List<User> findAdults();
    User save(User user);
}

public class JdbcUserRepository implements UserRepository {
    private final DataSource ds;
    public JdbcUserRepository(DataSource ds) { this.ds = ds; }

    @Override
    public Optional<User> findById(long id) {
        String sql = "SELECT id, email, first_name, age FROM users WHERE id = ?";
        try (var conn = ds.getConnection(); var ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (var rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DataAccessException("findById " + id, e);   // власний unchecked
        }
    }

    private static User map(ResultSet rs) throws SQLException {
        return new User(rs.getLong("id"), rs.getString("email"),
                        rs.getString("first_name"), rs.getInt("age"));
    }
    // ...
}
```

Тепер `UserService` залежить від інтерфейсу `UserRepository`, а в модульних тестах його легко підмінити fake-реалізацією на `HashMap` або mock-об'єктом (сторінка «Логування і Mockito»).

### ORM: JPA / Hibernate

Чистий JDBC багатослівний. **ORM** (Object-Relational Mapping) генерує SQL сам. Стандарт — **JPA**, найпопулярніша реалізація — **Hibernate**.

```java
@Entity
@Table(name = "users")
public class UserEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @OneToMany(mappedBy = "user")
    private List<OrderEntity> orders;
}

// Spring Data JPA: реалізацію згенерує фреймворк з назви методу
public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {
    List<UserEntity> findByAgeGreaterThan(int age);
}
```

Легковаговий проміжний варіант між чистим JDBC і ORM — бібліотеки **jOOQ** (типобезпечний SQL) і **JDBI**.

> [!WARNING]
> ORM не звільняє від знання SQL. Класична пастка — **N+1 запитів**: один запит повертає 100 користувачів, а потім ще 100 запитів тягнуть замовлення кожного. Без розуміння JOIN та індексів цього не помітити.
