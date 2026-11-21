# Лабораторна 05: Лямбди, функціональні інтерфейси та Stream API

Текст завдання — на сайті курсу. У цьому проєкті є все, що інакше довелося б копіювати звідти.

## Що всередині

| Файл | Статус |
| --- | --- |
| `MainA.java`, `wrapped/MainB.java` | надані: розкоментовуйте блоки `STAGE` по черзі |
| `NodeVisitor.java`, `wrapped/Track.java`, `Play.java`, `Data.java` | надані, не змінюйте |
| `BinaryTree`, `MapUtils`, `FunctionalUtils`, `Factories`, `Numerics`, `wrapped/Wrapped` | **ваші**: замініть кожен `throw new UnsupportedOperationException("TODO")` |
| `src/test/java/...` | тести для кожного етапу |

## Як відкрити

IntelliJ IDEA: **File → Open** → оберіть цю папку (ту, де лежить `pom.xml`). JDK 17 або новіший.

## Запуск

```bash
./mvnw compile exec:java -Dexec.mainClass=pl.mini.functional.MainA
./mvnw compile exec:java -Dexec.mainClass=pl.mini.functional.wrapped.MainB
```

На Windows замість `./mvnw` — `mvnw.cmd`. Встановлювати Maven не потрібно: wrapper завантажить його під час першого запуску. В IntelliJ можна просто натиснути ▶ біля `main`.

## Тести

```bash
./mvnw test                 # усі етапи
./mvnw test -Dgroups=A1     # лише етап A1 (A1…A5, B1…B5)
./mvnw test -Dgroups=A1,A2  # кілька етапів
```

Етапи, які ви ще не почали, падають з `UnsupportedOperationException: TODO` — так і має бути. Етап готовий, коли його тести зелені **і** `MainA`/`MainB` друкують рівно очікуваний вивід із завдання.

> Тести не перевіряють правил «без Stream API в частині A» і «без циклів у `Wrapped`». Їх перевіряє викладач під час оцінювання.
