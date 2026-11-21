---
title: Docker
description: What Docker is and how a container differs from a virtual machine, a Dockerfile for a Java application, multi-stage builds, layer caching, the JVM in a container, Docker Compose with a database, environment variables and healthchecks.
---

## What Docker Is and Why

Deployment used to look like this: a developer built a `.jar` and handed it to an administrator, who manually installed the required Java version, configured the paths and started the application on the server. It often ended with the phrase *"But it worked on my machine!"*.

**Docker** packages an application together with its whole environment (libraries, OS files, the required JRE version) into a portable **image**. A running image is a **container**.

| Concept | What it is |
| --- | --- |
| **Dockerfile** | a recipe: step-by-step instructions for building an image |
| **Image** | an immutable template made of layers, e.g. "Alpine Linux + JRE 21 + app.jar" |
| **Container** | a running, isolated instance of an image |
| **Registry** | image storage: Docker Hub, GitHub Container Registry |
| **Volume** | data that survives the deletion of a container |

### Container vs Virtual Machine

A virtual machine emulates all the hardware and runs **its own OS kernel** (gigabytes, minutes to start). A container is an ordinary process on the host's **shared kernel**, isolated by Linux mechanisms (namespaces — what the process sees; cgroups — how many resources it may use). It starts in fractions of a second and takes megabytes.

```bash
docker run --rm -it eclipse-temurin:21-jdk jshell     # Java 21 without installing it
docker ps                                              # running containers
docker logs -f <id>                                    # logs
docker exec -it <id> sh                                # a shell inside the container
docker stop <id>
```

## A Dockerfile for a Java Application

The simplest variant: the JAR has already been built locally (`mvn package`).

```dockerfile
# a base image with JRE 21 (without the compiler — smaller and safer)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# copy the built JAR into the image
COPY target/my-app-1.0.0.jar app.jar

# document the port the application listens on
EXPOSE 8080

# do not run as root
RUN addgroup -S app && adduser -S app -G app
USER app

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
docker build -t my-java-app:1.0 .
docker run -d --name app -p 8080:8080 -e DB_URL=jdbc:postgresql://db:5432/shop my-java-app:1.0
```

`-p 8080:8080` means "host port : container port". Without it the application cannot be reached from outside.

> [!TIP]
> Add a `.dockerignore` file (`target/`, `.git/`, `.idea/`) so as not to send unnecessary files into the build context.

## Multi-Stage Builds and Layer Caching

In a CI environment the image should be built from the source code, and the server may not have Maven. A **multi-stage build**: the first stage, with a full JDK and Maven, builds the JAR, and the second, lightweight one only runs it.

```dockerfile
# ---------- stage 1: build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src

# first only pom.xml: the dependency layer is cached
# until pom.xml changes
COPY pom.xml .
RUN mvn -q dependency:go-offline

# now the code (changes often)
COPY src ./src
RUN mvn -q package -DskipTests

# ---------- stage 2: run ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
USER 1000
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
```

Every instruction creates a **layer**. If a layer's inputs have not changed, Docker takes it from the cache. That is why instructions that rarely change (dependencies) are placed **higher**, and those that change often (code) **lower**. The final image contains only the JRE and the JAR, without the source code and Maven.

### The JVM in a Container

* A modern JVM sees the cgroups limits (`--memory=512m`, `--cpus=2`). Set the heap size **as a percentage**: `-XX:MaxRAMPercentage=75`, not with a fixed `-Xmx`.
* The process's memory is not only the heap: there are also the metaspace, thread stacks and direct buffers. That is why the container limit must be noticeably larger than the heap.
* With one CPU the JVM chooses the Serial GC (the "JVM and Garbage Collection" page).

## Docker Compose: an Application + a Database

For development a database is usually needed too. Installing PostgreSQL directly on Windows/macOS is inconvenient. **Docker Compose** starts several related containers with one command. The configuration is described in a `compose.yaml` file:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: ${DB_PASSWORD}        # from the .env file (do not commit it!)
      POSTGRES_DB: shop
    ports:
      - "5432:5432"                           # so that IntelliJ / a local application can see the database
    volumes:
      - pgdata:/var/lib/postgresql/data       # the data survives restarts
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro   # the schema on the first start
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shop"]
      interval: 5s
      retries: 10

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://db:5432/shop  # "db" — the service name as the hostname
      DB_USER: shop
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      db:
        condition: service_healthy            # wait until the database is really ready

volumes:
  pgdata:
```

```bash
docker compose up -d          # start everything in the background
docker compose logs -f app
docker compose down           # stop (the pgdata volume remains)
docker compose down -v        # stop and delete the data
```

> [!IMPORTANT]
> Inside a Compose network, containers reach each other **by service name** (`db:5432`), not through `localhost`. `localhost` inside a container is the container itself.

### Configuration through Environment Variables

```java
String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/shop");
String password = Objects.requireNonNull(System.getenv("DB_PASSWORD"), "DB_PASSWORD is not set");
```

The same image works in dev, test and prod: only the environment variables change (the 12-factor app principle).
