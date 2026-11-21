---
title: Databases and JDBC
description: How relational databases work, SQL basics (DDL, CRUD, JOIN, aggregation), connecting to a database from Java with JDBC: PreparedStatement and protection against SQL injection, transactions, batch operations, connection pools, the Repository pattern and an overview of ORM (JPA/Hibernate).
---

## Relational Databases

When data must survive a program restart, it is stored in a database. The most common are **relational DBMSs**: PostgreSQL, MySQL, Oracle, SQL Server, as well as the embedded H2 (handy for tests).

| Concept | What it is | Java counterpart |
| --- | --- | --- |
| **Table** | a set of records of one type (`users`, `orders`) | a class |
| **Row (record)** | one object with data | a class instance |
| **Column** | an attribute of a certain type | a field |
| **Primary key (PK)** | a unique row identifier | `id` |
| **Foreign key (FK)** | a reference to the PK of another table | a reference to another object |
| **Index** | a structure for fast lookups (a B-tree) | something like a `TreeMap` |

### Creating the Schema (DDL)

```sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,           -- auto-increment (PostgreSQL)
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
> Store money in `NUMERIC/DECIMAL` and read it into a `BigDecimal`. The `FLOAT` type is not suitable for money.

## SQL: CRUD, JOIN, Aggregation

### Reading — SELECT

```sql
SELECT * FROM users;
SELECT email, first_name FROM users WHERE age > 18 ORDER BY first_name LIMIT 10;
SELECT * FROM users WHERE email LIKE '%@pw.edu.pl' AND age BETWEEN 18 AND 26;
```

### Creating — INSERT

```sql
INSERT INTO users (email, first_name, age) VALUES ('jan@example.com', 'Jan', 25);
```

### Updating and Deleting — UPDATE and DELETE

```sql
UPDATE users SET email = 'new@example.com' WHERE id = 42;
DELETE FROM users WHERE id = 42;
```

> [!CAUTION]
> An `UPDATE` or `DELETE` **without WHERE** changes or deletes **all** rows of the table.

### JOIN — Data from Several Tables

```sql
-- INNER JOIN: only users who have orders
SELECT u.first_name, o.id, o.total
FROM orders o
JOIN users u ON o.user_id = u.id;

-- LEFT JOIN: all users, orders if present (otherwise NULL)
SELECT u.first_name, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

### Aggregation — GROUP BY

```sql
SELECT u.first_name, COUNT(o.id) AS orders_count, SUM(o.total) AS spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.first_name
HAVING SUM(o.total) > 100          -- a filter AFTER grouping
ORDER BY spent DESC;
```

A comparison with the Stream API: `GROUP BY` ↔ `Collectors.groupingBy`, `WHERE` ↔ `filter`, `HAVING` ↔ `filter` after grouping, `JOIN` ↔ a `Map` + `flatMap`.

## JDBC: Connections and Queries

**JDBC** (Java Database Connectivity, the `java.sql` package) is the standard low-level API for database access.

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.4</version>
</dependency>
<!-- for tests: an in-memory database -->
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

    ps.setInt(1, 18);                                   // parameters are numbered from 1!

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {                             // move the cursor to the next row
            long id = rs.getLong("id");
            String email = rs.getString("email");
            int age = rs.getInt("age");
            boolean ageWasNull = rs.wasNull();          // getInt returns 0 for NULL!
            System.out.println(id + " " + email);
        }
    }
}
```

| Method | What for | Returns |
| --- | --- | --- |
| `executeQuery()` | SELECT | a `ResultSet` |
| `executeUpdate()` | INSERT, UPDATE, DELETE, DDL | the number of affected rows |
| `execute()` | anything | `true` if there is a ResultSet |

> [!IMPORTANT]
> `Connection`, `Statement` and `ResultSet` are resources (a network connection, a database cursor). **Always** close them with try-with-resources.

### Getting the Generated id

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

## SQL Injection

```java
// ❌ NEVER DO THIS
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
stmt.executeQuery(sql);
```

If a user enters `' OR '1'='1`, the query turns into

```sql
SELECT * FROM users WHERE email = '' OR '1'='1'      -- returns ALL users
```

And `'; DROP TABLE users; --` deletes the table.

### The Protection — PreparedStatement

```java
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);       // the value is passed SEPARATELY from the query text
```

The database receives the query template and the values **separately**, so a value never becomes part of the SQL code.

> [!WARNING]
> `?` parameters work only for **values**. Table names, column names or the `ORDER BY` direction cannot be substituted with `?`. If they depend on input, check them against an allow-list (e.g. an `enum SortColumn`).

## Transactions, Batch Operations, Connection Pools

### Transactions (ACID)

By default JDBC works in **autocommit** mode: every statement is a separate transaction. To make several operations execute **all or none**:

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

            conn.commit();                   // commit both changes
        } catch (Exception e) {
            conn.rollback();                 // undo everything
            throw e;
        }
    }
}
```

**ACID**: Atomicity, Consistency, Isolation, Durability.

### Batch Operations

```java
try (var ps = conn.prepareStatement("INSERT INTO logs (level, message) VALUES (?, ?)")) {
    for (LogEntry e : entries) {
        ps.setString(1, e.level());
        ps.setString(2, e.message());
        ps.addBatch();
    }
    ps.executeBatch();          // one network round trip instead of thousands
}
```

### Connection Pools

Opening a database connection is expensive: TCP, authentication, tens of milliseconds. A **pool** keeps ready connections, and `close()` returns a connection to the pool instead of closing it. The standard is **HikariCP**:

```java
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:postgresql://localhost:5432/shop");
cfg.setUsername("shop");
cfg.setPassword(System.getenv("DB_PASSWORD"));
cfg.setMaximumPoolSize(10);
DataSource dataSource = new HikariDataSource(cfg);   // a DataSource instead of DriverManager
```

> [!CAUTION]
> Never keep passwords in code or in the repository. Take them from environment variables or a secrets manager.

## The Repository Pattern and an Overview of ORM

JDBC code should be isolated in **repository** classes, so that the business logic knows nothing about SQL:

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
            throw new DataAccessException("findById " + id, e);   // a custom unchecked exception
        }
    }

    private static User map(ResultSet rs) throws SQLException {
        return new User(rs.getLong("id"), rs.getString("email"),
                        rs.getString("first_name"), rs.getInt("age"));
    }
    // ...
}
```

Now `UserService` depends on the `UserRepository` interface, and in unit tests it is easy to substitute with a fake implementation on a `HashMap` or with a mock object (the "Logging and Mockito" page).

### ORM: JPA / Hibernate

Plain JDBC is verbose. An **ORM** (Object-Relational Mapping) generates the SQL itself. The standard is **JPA**, and the most popular implementation is **Hibernate**.

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

// Spring Data JPA: the framework generates the implementation from the method name
public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {
    List<UserEntity> findByAgeGreaterThan(int age);
}
```

A lightweight middle ground between plain JDBC and an ORM is the **jOOQ** (type-safe SQL) and **JDBI** libraries.

> [!WARNING]
> An ORM does not free you from knowing SQL. The classic trap is **N+1 queries**: one query returns 100 users, and then 100 more queries fetch each one's orders. Without understanding JOINs and indexes you will not notice it.
