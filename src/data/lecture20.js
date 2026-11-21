export const lecture20 = {
  id: "20",
  title: "Лекція 20: Контейнеризація (Docker) для Java-розробника",
  description: "Що таке Docker і чим контейнер відрізняється від віртуальної машини, Dockerfile для Java-застосунку, багатоетапне збирання, кешування шарів, JVM у контейнері, Docker Compose з базою даних, змінні середовища і healthcheck.",
  sections: [
    {
      title: "1. Що таке Docker і навіщо він",
      content: `
Раніше розгортання виглядало так: розробник збирав \`.jar\`, передавав його адміністратору, а той вручну встановлював потрібну версію Java, налаштовував шляхи і запускав застосунок на сервері. Часто все закінчувалося фразою *«А в мене на комп'ютері працювало!»*.

**Docker** пакує застосунок разом з усім оточенням (бібліотеки, файли ОС, потрібна версія JRE) у переносний **образ**. Запущений образ — це **контейнер**.

| Поняття | Що це |
| --- | --- |
| **Dockerfile** | рецепт: покрокова інструкція побудови образу |
| **Образ (image)** | незмінний шаблон з шарів, наприклад «Alpine Linux + JRE 21 + app.jar» |
| **Контейнер** | запущений ізольований екземпляр образу |
| **Реєстр (registry)** | сховище образів: Docker Hub, GitHub Container Registry |
| **Том (volume)** | дані, що переживають видалення контейнера |

### Контейнер vs віртуальна машина

Віртуальна машина емулює все залізо і запускає **власне ядро ОС** (гігабайти, хвилини на старт). Контейнер — це звичайний процес на **спільному ядрі** хоста, ізольований механізмами Linux (namespaces — що процес бачить; cgroups — скільки ресурсів може використати). Він стартує за долі секунди й займає мегабайти.

\`\`\`bash
docker run --rm -it eclipse-temurin:21-jdk jshell     # Java 21 без встановлення
docker ps                                              # запущені контейнери
docker logs -f <id>                                    # логи
docker exec -it <id> sh                                # оболонка всередині контейнера
docker stop <id>
\`\`\`
`
    },
    {
      title: "2. Dockerfile для Java-застосунку",
      content: `
Найпростіший варіант: JAR уже зібрано локально (\`mvn package\`).

\`\`\`dockerfile
# базовий образ з JRE 21 (без компілятора — менший і безпечніший)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# скопіювати зібраний JAR усередину образу
COPY target/my-app-1.0.0.jar app.jar

# документуємо порт, який слухає застосунок
EXPOSE 8080

# не запускаємо від root
RUN addgroup -S app && adduser -S app -G app
USER app

ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

\`\`\`bash
docker build -t my-java-app:1.0 .
docker run -d --name app -p 8080:8080 -e DB_URL=jdbc:postgresql://db:5432/shop my-java-app:1.0
\`\`\`

\`-p 8080:8080\` означає «порт хоста : порт контейнера». Без цього до застосунку ззовні не достукатися.

> [!TIP]
> Додайте файл \`.dockerignore\` (\`target/\`, \`.git/\`, \`.idea/\`), щоб не надсилати зайве в контекст збирання.
`
    },
    {
      title: "3. Багатоетапне збирання і кешування шарів",
      content: `
У CI-середовищі образ має збиратися з вихідного коду, і Maven на сервері може бути відсутній. **Multi-stage build**: перший етап з повним JDK і Maven збирає JAR, а другий, легкий, лише запускає його.

\`\`\`dockerfile
# ---------- етап 1: збирання ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src

# спочатку лише pom.xml: шар із залежностями закешується,
# доки pom.xml не зміниться
COPY pom.xml .
RUN mvn -q dependency:go-offline

# тепер код (змінюється часто)
COPY src ./src
RUN mvn -q package -DskipTests

# ---------- етап 2: запуск ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
USER 1000
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
\`\`\`

Кожна інструкція створює **шар**. Якщо вхідні дані шару не змінилися, Docker бере його з кешу. Тому інструкції, що рідко змінюються (залежності), ставлять **вище**, а ті, що часто (код), — **нижче**. Підсумковий образ містить лише JRE і JAR, без вихідного коду та Maven.

### JVM у контейнері

* Сучасна JVM бачить ліміти cgroups (\`--memory=512m\`, \`--cpus=2\`). Розмір купи задавайте **відсотком**: \`-XX:MaxRAMPercentage=75\`, а не фіксованим \`-Xmx\`.
* Пам'ять процесу — це не лише купа: є ще metaspace, стеки потоків і direct-буфери. Тому ліміт контейнера має бути помітно більшим за купу.
* З одним CPU JVM обирає Serial GC (лекція 15).
`
    },
    {
      title: "4. Docker Compose: застосунок + база даних",
      content: `
Для розробки зазвичай потрібна ще й база даних. Встановлювати PostgreSQL безпосередньо в Windows/macOS незручно. **Docker Compose** запускає кілька пов'язаних контейнерів однією командою. Конфігурацію описує файл \`compose.yaml\`:

\`\`\`yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: \${DB_PASSWORD}        # з файлу .env (не комітимо!)
      POSTGRES_DB: shop
    ports:
      - "5432:5432"                           # щоб IntelliJ / локальний застосунок бачили базу
    volumes:
      - pgdata:/var/lib/postgresql/data       # дані переживуть перезапуск
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro   # схема під час першого старту
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shop"]
      interval: 5s
      retries: 10

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://db:5432/shop  # "db" — ім'я сервісу як hostname
      DB_USER: shop
      DB_PASSWORD: \${DB_PASSWORD}
    depends_on:
      db:
        condition: service_healthy            # чекати, доки база справді готова

volumes:
  pgdata:
\`\`\`

\`\`\`bash
docker compose up -d          # запустити все у фоні
docker compose logs -f app
docker compose down           # зупинити (том pgdata лишиться)
docker compose down -v        # зупинити і видалити дані
\`\`\`

> [!IMPORTANT]
> Усередині мережі Compose контейнери звертаються один до одного **за ім'ям сервісу** (\`db:5432\`), а не через \`localhost\`. \`localhost\` усередині контейнера — це сам контейнер.

### Конфігурація через змінні середовища

\`\`\`java
String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/shop");
String password = Objects.requireNonNull(System.getenv("DB_PASSWORD"), "DB_PASSWORD не задано");
\`\`\`

Той самий образ працює в dev, test і prod: змінюються лише змінні середовища (принцип 12-factor app).
`
    }
  ],
  quiz: [
    {
      question: "Чим образ відрізняється від контейнера?",
      options: [
        "Це синоніми",
        "Образ — незмінний шаблон, контейнер — запущений екземпляр образу",
        "Контейнер — файл Dockerfile",
        "Образ — запущений процес"
      ],
      answer: 1,
      explanation: "З одного образу можна запустити багато незалежних контейнерів, як із класу — багато об'єктів."
    },
    {
      question: "Навіщо в multi-stage build копіювати pom.xml і завантажувати залежності ДО копіювання src?",
      options: [
        "Так вимагає Maven",
        "Щоб шар із залежностями брався з кешу, доки не зміниться pom.xml; зміни коду тоді не змушують завантажувати бібліотеки заново",
        "Щоб образ був більшим",
        "Щоб тести виконалися швидше"
      ],
      answer: 1,
      explanation: "Docker кешує шари за вмістом. Рідко змінювані кроки ставлять вище, часто змінювані — нижче."
    },
    {
      question: "Як застосунок у контейнері app має звертатися до бази з сервісу db у Docker Compose?",
      options: [
        "localhost:5432",
        "db:5432 — за іменем сервісу",
        "127.0.0.1:5432",
        "host.docker.internal"
      ],
      answer: 1,
      explanation: "Compose створює спільну мережу з DNS за іменами сервісів. localhost у контейнері вказує на сам контейнер."
    },
    {
      question: "Як краще задати розмір купи JVM у контейнері?",
      options: [
        "Завжди -Xmx8g",
        "Відсотком від ліміту контейнера: -XX:MaxRAMPercentage=75",
        "Не задавати і встановити --memory=unlimited",
        "Через System.gc()"
      ],
      answer: 1,
      explanation: "JVM бачить ліміт cgroups. Відсоток залишає місце для metaspace, стеків і direct-пам'яті й підлаштовується під різні ліміти."
    },
    {
      question: "Навіщо том (volume) у сервісі бази даних?",
      options: [
        "Для швидкодії",
        "Щоб дані зберігалися після зупинки або видалення контейнера",
        "Для мережевого доступу",
        "Він не потрібен"
      ],
      answer: 1,
      explanation: "Файлова система контейнера тимчасова. Без тому база після docker compose down буде порожньою."
    }
  ]
};
