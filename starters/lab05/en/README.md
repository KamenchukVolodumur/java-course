# Lab 05: Lambdas, Functional Interfaces and the Stream API

The task text is on the course site. This project contains everything you would otherwise copy from it.

## What is inside

| File | Status |
| --- | --- |
| `MainA.java`, `wrapped/MainB.java` | given: uncomment the `STAGE` blocks one by one |
| `NodeVisitor.java`, `wrapped/Track.java`, `Play.java`, `Data.java` | given, do not change |
| `BinaryTree`, `MapUtils`, `FunctionalUtils`, `Factories`, `Numerics`, `wrapped/Wrapped` | **yours**: replace every `throw new UnsupportedOperationException("TODO")` |
| `src/test/java/...` | tests for every stage |

## Opening the project

IntelliJ IDEA: **File → Open** → select this folder (the one with `pom.xml`). JDK 17 or newer.

## Running

```bash
./mvnw compile exec:java -Dexec.mainClass=pl.mini.functional.MainA
./mvnw compile exec:java -Dexec.mainClass=pl.mini.functional.wrapped.MainB
```

On Windows use `mvnw.cmd` instead of `./mvnw`. You do not need to install Maven: the wrapper downloads it on the first run. In IntelliJ you can simply press ▶ next to `main`.

## Tests

```bash
./mvnw test                 # all stages
./mvnw test -Dgroups=A1     # only stage A1 (A1…A5, B1…B5)
./mvnw test -Dgroups=A1,A2  # several stages
```

Stages you have not started yet fail with `UnsupportedOperationException: TODO` — that is expected. A stage is done when its tests are green **and** `MainA`/`MainB` print exactly the expected output from the task.

> The tests do not check the rules "no Stream API in part A" and "no loops in `Wrapped`". The instructor checks them during grading.
