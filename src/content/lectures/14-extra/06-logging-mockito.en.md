---
title: Logging and Mockito
description: Why System.out.println is not suitable for a backend, the SLF4J facade and the Logback implementation, log levels, placeholders, configuration, MDC. Testing in isolation with Mockito: mock, stub, verify, capturing arguments, spy, and when not to mock.
---

## Why Not System.out.println

While learning, it is convenient to check values with `System.out.println()`. In a commercial backend this is considered bad practice:

1. **It cannot be configured.** You cannot turn the output off in production or turn on a detailed debug mode without recompiling.
2. **There is no context.** The time, thread, class and severity level are not visible.
3. **There is no routing.** You cannot write to a file with rotation, send to ELK/Loki or filter by module.
4. **Performance.** `System.out` is synchronized and writes to an OS stream; under load it is a bottleneck.

The solution is **logging libraries**.

## SLF4J and Logback

**SLF4J** (Simple Logging Facade for Java) is a **facade** (only an interface). Your code depends on SLF4J, and any implementation can be plugged in: **Logback** (the default in Spring Boot) or Log4j2.

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.5.8</version>       <!-- pulls in slf4j-api transitively -->
</dependency>
```

### Log Levels

| Level | When |
| --- | --- |
| `TRACE` | the most detailed: every step of an algorithm |
| `DEBUG` | information for a developer hunting bugs |
| `INFO` | important events: "the server started", "order 42 has been paid" |
| `WARN` | something is wrong, but work continues: a retry, an outdated configuration |
| `ERROR` | an operation failed, human attention is needed |

If the level is set to `INFO`, `INFO`, `WARN` and `ERROR` are printed.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public void registerUser(String username) {
        log.info("Starting registration of user {}", username);
        try {
            // ...
            log.debug("Generated a token for {}", username);
        } catch (Exception e) {
            // the exception goes LAST, without {}: the stack trace will be printed
            log.error("Could not register {}", username, e);
        }
    }
}
```

> [!IMPORTANT]
> Use `{}` placeholders, not concatenation: `log.debug("x=" + expensive())` always builds the string, even if DEBUG is off. With `{}` the string is formatted only when the level is enabled. For expensive computations: `log.atDebug().addArgument(() -> expensive()).log("x={}")`.

## Logback Configuration and MDC

The `src/main/resources/logback.xml` file:

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} %-5level [%thread] %logger{36} [%X{requestId}] - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/app.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>14</maxHistory>
        </rollingPolicy>
        <encoder><pattern>%d %-5level %logger - %msg%n</pattern></encoder>
    </appender>

    <logger name="pl.mini.shop" level="DEBUG"/>      <!-- detailed for our code -->
    <logger name="org.apache.http" level="WARN"/>    <!-- quiet for libraries -->

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

```text
10:15:30.123 INFO  [main] p.m.shop.UserService [a1b2c3] - Starting registration of user anna
```

### MDC — the Request Context

The **Mapped Diagnostic Context** is a "key → value" map tied to a thread (a `ThreadLocal` inside). All logs written while handling a request automatically get, for example, a `requestId`, so all lines related to one request can be found in the server logs.

```java
void handle(Request req) {
    MDC.put("requestId", UUID.randomUUID().toString().substring(0, 8));
    MDC.put("userId", req.userId());
    try {
        service.process(req);          // every log.info(...) inside contains the requestId
    } finally {
        MDC.clear();                   // mandatory: the thread will return to the pool
    }
}
```

> [!WARNING]
> MDC does not automatically carry over to other threads (`CompletableFuture`, an executor). The context must be copied manually: `var ctx = MDC.getCopyOfContextMap();`, and `MDC.setContextMap(ctx)` called in the task.

### What NOT to Log

* Passwords, tokens, card numbers, personal data (GDPR!).
* The same exception at every level of the stack ("log and rethrow"): one error produces five stack traces. Log where the exception is **handled**.

## Mockito: Testing in Isolation

A unit test should check **one class**, without a database, the network or e-mail. But `UserService` depends on `UserRepository` and `EmailSender`. They are substituted with **test doubles**:

| Double | What it is |
| --- | --- |
| **Dummy** | a placeholder object that is only passed around, never used |
| **Stub** | returns predefined answers |
| **Fake** | a simplified working implementation (a repository on a `HashMap`, H2) |
| **Mock** | records calls so you can later check *how* it was called |
| **Spy** | a real object with some methods intercepted |

**Mockito** creates stub/mock objects automatically.

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.14.1</version>
    <scope>test</scope>
</dependency>
```

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;      // fakes
    @Mock EmailSender emailSender;

    @InjectMocks UserService userService;     // the real service with the fakes in its constructor

    @Test
    void returnsUserWhenExists() {
        // given — stubbing
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User(1L, "admin")));

        // when
        User result = userService.getUserById(1L);

        // then
        assertEquals("admin", result.name());
        verify(userRepository).findById(1L);          // = times(1)
        verifyNoInteractions(emailSender);
    }

    @Test
    void throwsWhenUserMissing() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));
    }
}
```

An unconfigured mock returns "empty" values: `null`, `0`, `false`, empty collections and `Optional.empty()`.

## Mockito: Advanced Features

### Matchers and Different Answers

```java
when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
when(repo.findByEmail(eq("a@b.pl"))).thenReturn(Optional.of(user));   // the more specific one overrides
when(repo.save(any(User.class))).thenAnswer(inv -> {
    User u = inv.getArgument(0);
    return new User(42L, u.name());                                    // the "database" assigned an id
});
when(gateway.charge(any())).thenThrow(new PaymentException("declined"));
when(clock.instant()).thenReturn(t1, t2, t3);                          // consecutive calls

doThrow(new IOException()).when(mailer).send(any());                   // for void methods
```

> [!WARNING]
> If even one argument is given with a matcher, **all** must be matchers: `verify(x).m(eq(1), anyString())`, not `verify(x).m(1, anyString())`.

### Verifying Interactions

```java
verify(emailSender).send("a@b.pl", "Welcome!");
verify(repo, times(2)).save(any());
verify(repo, never()).delete(any());
verify(audit, atLeastOnce()).record(any());

InOrder inOrder = inOrder(repo, emailSender);
inOrder.verify(repo).save(any());
inOrder.verify(emailSender).send(any(), any());       // the e-mail — AFTER saving
```

### ArgumentCaptor — What Exactly Was Passed

```java
@Captor ArgumentCaptor<Order> orderCaptor;

@Test
void savesOrderWithDiscount() {
    service.placeOrder(cart, "STUDENT10");

    verify(orderRepo).save(orderCaptor.capture());
    Order saved = orderCaptor.getValue();
    assertEquals(new BigDecimal("90.00"), saved.total());
    assertEquals(OrderStatus.NEW, saved.status());
}
```

### Spy

```java
List<String> list = spy(new ArrayList<>());
list.add("a");                               // the real method
doReturn(100).when(list).size();             // intercepted (for a spy — doReturn, not when)
```

### When NOT to Mock

* **Value objects** and records — create real ones.
* **Types you do not own** (`HttpClient`, `ResultSet`) — wrap them in your own interface and mock that. Or write an integration test.
* If a test consists mostly of `when`/`verify`, it checks the implementation rather than the behavior, and it will break after every refactoring. A **fake** (a repository on a `HashMap`) is often the better choice.

> [!TIP]
> A real database in tests is provided by **integration tests** with Testcontainers (lab 12): a Docker container with PostgreSQL is started for the duration of the test.
