export const lecture19 = {
  id: "19",
  title: "Лекція 19: Логування (SLF4J, Logback) і тестування з Mockito",
  description: "Чому System.out.println не годиться для бекенду, фасад SLF4J і реалізація Logback, рівні логування, плейсхолдери, конфігурація, MDC. Тестування в ізоляції з Mockito: mock, stub, verify, перехоплення аргументів, spy, а також коли мокати не варто.",
  sections: [
    {
      title: "1. Чому не System.out.println",
      content: `
Під час навчання значення зручно перевіряти через \`System.out.println()\`. У комерційному бекенді це вважається поганою практикою:

1. **Не налаштовується.** Не можна вимкнути вивід у production чи ввімкнути детальний режим налагодження без перекомпіляції.
2. **Немає контексту.** Не видно часу, потоку, класу, рівня важливості.
3. **Немає маршрутизації.** Не можна писати у файл з ротацією, надсилати в ELK/Loki чи фільтрувати за модулем.
4. **Продуктивність.** \`System.out\` синхронізований і пише в потік ОС; під навантаженням це вузьке місце.

Рішення — **бібліотеки логування**.
`
    },
    {
      title: "2. SLF4J і Logback",
      content: `
**SLF4J** (Simple Logging Facade for Java) — це **фасад** (лише інтерфейс). Ваш код залежить від SLF4J, а реалізацію можна підставити будь-яку: **Logback** (за замовчуванням у Spring Boot) або Log4j2. Аналог у .NET — \`ILogger\` з \`Microsoft.Extensions.Logging\` + Serilog/NLog.

\`\`\`xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.5.8</version>       <!-- транзитивно підтягне slf4j-api -->
</dependency>
\`\`\`

### Рівні логування

| Рівень | Коли |
| --- | --- |
| \`TRACE\` | найдетальніше: кожен крок алгоритму |
| \`DEBUG\` | інформація для розробника під час пошуку помилок |
| \`INFO\` | важливі події: «сервер стартував», «замовлення 42 оплачено» |
| \`WARN\` | щось не так, але робота триває: повторна спроба, застаріла конфігурація |
| \`ERROR\` | операція не вдалася, потрібна увага людини |

Якщо встановлено рівень \`INFO\`, виводяться \`INFO\`, \`WARN\` і \`ERROR\`.

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public void registerUser(String username) {
        log.info("Початок реєстрації користувача {}", username);
        try {
            // ...
            log.debug("Згенеровано токен для {}", username);
        } catch (Exception e) {
            // виняток — ОСТАННІМ аргументом, без {}: буде надруковано stack trace
            log.error("Не вдалося зареєструвати {}", username, e);
        }
    }
}
\`\`\`

> [!IMPORTANT]
> Використовуйте плейсхолдери \`{}\`, а не конкатенацію: \`log.debug("x=" + expensive())\` будує рядок завжди, навіть якщо DEBUG вимкнено. З \`{}\` рядок форматується лише тоді, коли рівень увімкнено. Для дорогих обчислень: \`log.atDebug().addArgument(() -> expensive()).log("x={}")\`.
`
    },
    {
      title: "3. Конфігурація Logback і MDC",
      content: `
Файл \`src/main/resources/logback.xml\`:

\`\`\`xml
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

    <logger name="pl.mini.shop" level="DEBUG"/>      <!-- детально для нашого коду -->
    <logger name="org.apache.http" level="WARN"/>    <!-- тихо для бібліотек -->

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
\`\`\`

\`\`\`text
10:15:30.123 INFO  [main] p.m.shop.UserService [a1b2c3] - Початок реєстрації користувача anna
\`\`\`

### MDC — контекст запиту

**Mapped Diagnostic Context** — мапа «ключ → значення», прив'язана до потоку (усередині \`ThreadLocal\`). Усі логи, записані під час обробки запиту, автоматично отримують, наприклад, \`requestId\`, тож у логах сервера можна знайти всі рядки, що стосуються одного запиту.

\`\`\`java
void handle(Request req) {
    MDC.put("requestId", UUID.randomUUID().toString().substring(0, 8));
    MDC.put("userId", req.userId());
    try {
        service.process(req);          // кожен log.info(...) усередині містить requestId
    } finally {
        MDC.clear();                   // обов'язково: потік повернеться в пул
    }
}
\`\`\`

> [!WARNING]
> MDC не переходить автоматично в інші потоки (\`CompletableFuture\`, executor). Контекст треба скопіювати вручну: \`var ctx = MDC.getCopyOfContextMap();\` і в задачі викликати \`MDC.setContextMap(ctx)\`.

### Що НЕ логувати

* Паролі, токени, номери карток, персональні дані (GDPR!).
* Той самий виняток на кожному рівні стеку («log and rethrow»): одна помилка дає п'ять stack trace. Логуйте там, де виняток **обробляєте**.
`
    },
    {
      title: "4. Mockito: тестування в ізоляції",
      content: `
Модульний тест має перевіряти **один клас**, без бази, мережі чи пошти. Але \`UserService\` залежить від \`UserRepository\` і \`EmailSender\`. Їх підмінюють **тестовими дублерами**:

| Дублер | Що це |
| --- | --- |
| **Dummy** | об'єкт-заглушка, який лише передають, але не використовують |
| **Stub** | повертає заздалегідь задані відповіді |
| **Fake** | спрощена робоча реалізація (репозиторій на \`HashMap\`, H2) |
| **Mock** | записує виклики, щоб потім перевірити, *як* його викликали |
| **Spy** | справжній об'єкт, у якого перехоплено окремі методи |

**Mockito** створює stub/mock-об'єкти автоматично. Аналоги в .NET — Moq і NSubstitute.

\`\`\`xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.14.1</version>
    <scope>test</scope>
</dependency>
\`\`\`

\`\`\`java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;      // підробки
    @Mock EmailSender emailSender;

    @InjectMocks UserService userService;     // справжній сервіс з підробками в конструкторі

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
\`\`\`

Неналаштований mock повертає «порожні» значення: \`null\`, \`0\`, \`false\`, порожні колекції й \`Optional.empty()\`.
`
    },
    {
      title: "5. Mockito: просунуті можливості",
      content: `
### Matchers і різні відповіді

\`\`\`java
when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
when(repo.findByEmail(eq("a@b.pl"))).thenReturn(Optional.of(user));   // конкретніше перекриває
when(repo.save(any(User.class))).thenAnswer(inv -> {
    User u = inv.getArgument(0);
    return new User(42L, u.name());                                    // "база" присвоїла id
});
when(gateway.charge(any())).thenThrow(new PaymentException("відмова"));
when(clock.instant()).thenReturn(t1, t2, t3);                          // послідовні виклики

doThrow(new IOException()).when(mailer).send(any());                   // для void-методів
\`\`\`

> [!WARNING]
> Якщо хоч один аргумент задано matcher-ом, matcher-ами мають бути **всі**: \`verify(x).m(eq(1), anyString())\`, а не \`verify(x).m(1, anyString())\`.

### Перевірка взаємодій

\`\`\`java
verify(emailSender).send("a@b.pl", "Вітаємо!");
verify(repo, times(2)).save(any());
verify(repo, never()).delete(any());
verify(audit, atLeastOnce()).record(any());

InOrder inOrder = inOrder(repo, emailSender);
inOrder.verify(repo).save(any());
inOrder.verify(emailSender).send(any(), any());       // лист — ПІСЛЯ збереження
\`\`\`

### ArgumentCaptor — що саме передали

\`\`\`java
@Captor ArgumentCaptor<Order> orderCaptor;

@Test
void savesOrderWithDiscount() {
    service.placeOrder(cart, "STUDENT10");

    verify(orderRepo).save(orderCaptor.capture());
    Order saved = orderCaptor.getValue();
    assertEquals(new BigDecimal("90.00"), saved.total());
    assertEquals(OrderStatus.NEW, saved.status());
}
\`\`\`

### Spy

\`\`\`java
List<String> list = spy(new ArrayList<>());
list.add("a");                               // справжній метод
doReturn(100).when(list).size();             // перехоплено (для spy — doReturn, а не when)
\`\`\`

### Коли НЕ мокати

* **Value-об'єкти** і records — створюйте справжні.
* **Типи, якими ви не володієте** (\`HttpClient\`, \`ResultSet\`) — обгорніть їх власним інтерфейсом і мокайте вже його. Або пишіть інтеграційний тест.
* Якщо тест складається переважно з \`when\`/\`verify\`, він перевіряє реалізацію, а не поведінку, і ламатиметься після кожного рефакторингу. Часто кращий вибір — **fake** (репозиторій на \`HashMap\`).

> [!TIP]
> Справжню базу в тестах дають **інтеграційні тести** з Testcontainers (лабораторна 12): Docker-контейнер з PostgreSQL піднімається на час тесту.
`
    }
  ],
  quiz: [
    {
      question: "Чому log.debug(\"Користувач {}\", user) кращий за log.debug(\"Користувач \" + user)?",
      options: [
        "Він коротший",
        "Рядок форматується лише тоді, коли рівень DEBUG увімкнено; конкатенація виконується завжди",
        "Конкатенація не компілюється",
        "Плейсхолдери шифрують дані"
      ],
      answer: 1,
      explanation: "За вимкненого рівня виклик з {} майже нічого не коштує: user.toString() навіть не викликається."
    },
    {
      question: "Що повертає неналаштований Mockito-mock для методу Optional<User> findById(long)?",
      options: ["null", "Optional.empty()", "Кидає виняток", "Випадкового користувача"],
      answer: 1,
      explanation: "Mockito повертає «порожні» значення: null для об'єктів, 0 для чисел, Optional.empty() і порожні колекції."
    },
    {
      question: "Як перевірити, що сервіс зберіг замовлення з правильною сумою, яку він обчислив сам?",
      options: [
        "verify(repo).save(any())",
        "Перехопити аргумент через ArgumentCaptor і перевірити його поля",
        "when(repo.save(...)).thenReturn(...)",
        "Ніяк"
      ],
      answer: 1,
      explanation: "ArgumentCaptor дає доступ до об'єкта, який сервіс передав у залежність, тож його поля можна перевірити."
    },
    {
      question: "Навіщо MDC.clear() у блоці finally?",
      options: [
        "Щоб пришвидшити логування",
        "MDC прив'язаний до потоку, а в пулі потік обслужить наступний запит; без очищення той успадкує чужий контекст",
        "Цього вимагає SLF4J",
        "Щоб видалити файли логів"
      ],
      answer: 1,
      explanation: "MDC реалізовано через ThreadLocal. Потоки в пулах живуть довго, тож контекст «перетікає» між запитами."
    },
    {
      question: "Що з наведеного НЕ слід логувати?",
      options: [
        "Ідентифікатор замовлення",
        "Пароль або токен доступу",
        "Час виконання операції",
        "Назву методу, що не вдався"
      ],
      answer: 1,
      explanation: "Логи читає багато людей і систем, і зберігаються вони довго. Секрети й персональні дані в них — інцидент безпеки."
    }
  ]
};
