---
title: Процесори анотацій
description: Метапрограмування під час компіляції, як javac запускає процесори анотацій, раунди обробки, API Processor і моделі елементів, генератор будівника для класів з анотацією, реєстрація й підключення в Maven і Gradle, діагностика помилок, перегляд згенерованих файлів, застосування — MapStruct, Dagger, Immutables, Lombok.
---

## Метапрограмування під час компіляції

**Процесори анотацій** (annotation processors) — механізм компілятора `javac`, що дозволяє **під час компіляції** аналізувати код програми й генерувати на його основі нові файли: вихідний код Java, ресурси, конфігурацію. Це метапрограмування на етапі компіляції.

На відміну від рефлексії (розділ «Рефлексія»), процесор працює **до запуску** програми:

| | Рефлексія | Процесор анотацій |
| --- | --- | --- |
| Коли | під час виконання | під час компіляції |
| Помилки | винятки в продакшені | помилки компіляції |
| Вартість | на кожному запуску (повільніший старт, більше пам'яті) | нуль під час виконання |
| Згенерований код | невидимий | звичайні файли `.java`, які можна прочитати й налагодити |
| Нативна компіляція (GraalVM) | потребує конфігурації | працює без змін |

Головне обмеження: стандартний процесор може **лише додавати** нові файли. Змінювати існуючі класи він не може. Тому згенерований код зазвичай розміщують в **окремому класі** (`PersonBuilder` поруч з `Person`), а користувач звертається до нього явно, або клас користувача наслідує згенерований базовий клас.

## Як це працює

1. `javac` розбирає вихідні файли й будує модель програми: пакети, класи, методи, поля та їхні анотації.
2. Знаходить процесори в **шляху процесорів** (annotation processor path) через `ServiceLoader` і для кожного викликає `process`, передаючи елементи з анотаціями, які процесор оголосив підтримуваними.
3. Процесор може згенерувати нові файли через `Filer`. Якщо з'явилися нові вихідні файли, починається **новий раунд**: вони теж розбираються й передаються процесорам (у них можуть бути анотації).
4. Коли раунд не дав нових файлів, `javac` компілює все разом: і код користувача, і згенерований.

## Приклад: генератор будівника

Генератор реалізує патерн **Builder** для будь-якого класу з анотацією `@GenerateBuilder`. Він аналізує публічні нестатичні сетери класу й створює для кожного метод `withXxx`.

Анотація (окремий модуль або артефакт, від якого залежать і процесор, і код користувача). Політика `SOURCE`: анотація потрібна лише компілятору й не потрапляє в `.class`:

```java
package org.example.builder;

@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.TYPE)
public @interface GenerateBuilder { }
```

Процесор:

```java
package org.example.builder;

@SupportedAnnotationTypes("org.example.builder.GenerateBuilder")
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class BuilderProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment round) {
        for (Element element : round.getElementsAnnotatedWith(GenerateBuilder.class)) {
            if (element.getKind() != ElementKind.CLASS) {
                processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR,
                        "@GenerateBuilder можна застосувати лише до класу", element);
                continue;
            }
            TypeElement type = (TypeElement) element;
            try {
                generateBuilder(type);
            } catch (IOException e) {
                processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR,
                        "Не вдалося згенерувати будівник: " + e.getMessage(), element);
            }
        }
        return true;                                  // анотацію «поглинуто»: інші процесори її не отримають
    }

    private void generateBuilder(TypeElement type) throws IOException {
        String packageName = processingEnv.getElementUtils().getPackageOf(type).getQualifiedName().toString();
        String className = type.getSimpleName().toString();
        String builderName = className + "Builder";

        List<ExecutableElement> setters = ElementFilter.methodsIn(type.getEnclosedElements()).stream()
                .filter(m -> m.getSimpleName().toString().startsWith("set"))
                .filter(m -> m.getParameters().size() == 1)
                .filter(m -> m.getModifiers().contains(Modifier.PUBLIC))
                .filter(m -> !m.getModifiers().contains(Modifier.STATIC))
                .toList();

        StringBuilder source = new StringBuilder();
        if (!packageName.isEmpty()) source.append("package ").append(packageName).append(";\n\n");
        source.append("public final class ").append(builderName).append(" {\n");
        source.append("    private final ").append(className).append(" target = new ")
              .append(className).append("();\n\n");

        for (ExecutableElement setter : setters) {
            String property = setter.getSimpleName().toString().substring(3);     // setName -> Name
            String paramType = setter.getParameters().getFirst().asType().toString();
            source.append("    public ").append(builderName).append(" with").append(property)
                  .append("(").append(paramType).append(" value) {\n")
                  .append("        target.").append(setter.getSimpleName()).append("(value);\n")
                  .append("        return this;\n    }\n\n");
        }

        source.append("    public ").append(className).append(" build() {\n")
              .append("        return target;\n    }\n}\n");

        JavaFileObject file = processingEnv.getFiler().createSourceFile(
                packageName.isEmpty() ? builderName : packageName + "." + builderName, type);  // type — «джерело» для інкрементальної компіляції
        try (Writer writer = file.openWriter()) {
            writer.write(source.toString());
        }
    }
}
```

Модель елементів (`javax.lang.model`) описує код **без завантаження класів**: `TypeElement` — клас чи інтерфейс, `ExecutableElement` — метод чи конструктор, `VariableElement` — поле чи параметр, `TypeMirror` — тип. Класи користувача ще не скомпільовані, тож рефлексія тут недоступна.

### Реєстрація

`javac` знаходить процесор через `ServiceLoader`: у JAR процесора має бути файл

```text
META-INF/services/javax.annotation.processing.Processor
```

з повним іменем класу: `org.example.builder.BuilderProcessor`. Цей файл зручно генерувати бібліотекою AutoService (`@AutoService(Processor.class)`), яка сама є процесором анотацій.

### Використання

```java
@GenerateBuilder
public class Person {
    private String firstName;
    private String lastName;
    private int age;

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setAge(int age) { this.age = age; }

    @Override
    public String toString() { return firstName + " " + lastName + ", " + age; }
}

Person person = new PersonBuilder()
        .withFirstName("Ада")
        .withLastName("Лавлейс")
        .withAge(36)
        .build();
System.out.println(person);                         // Ада Лавлейс, 36
```

Підключення в Maven: процесор указують у `annotationProcessorPaths`, тож у classpath застосунку він не потрапляє:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.example</groupId>
                <artifactId>builder-processor</artifactId>
                <version>1.0.0</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

У Gradle — окрема конфігурація залежностей:

```kotlin
dependencies {
    compileOnly("org.example:builder-annotations:1.0.0")
    annotationProcessor("org.example:builder-processor:1.0.0")
}
```

> [!NOTE]
> Від JDK 23 `javac` **не запускає** процесори, знайдені у звичайному classpath, без явного дозволу: їх треба вказувати в шляху процесорів (`-processorpath`, `annotationProcessorPaths`) або увімкнути прапорцем `-proc:full`. Це захищає від непомітного виконання коду з випадкових залежностей.

> [!TIP]
> Згенеровані файли лежать у `target/generated-sources/annotations` (Maven) або `build/generated/sources/annotationProcessor` (Gradle). IDE показують їх як звичайний код: до них можна перейти й налагоджувати їх. Повідомлення через `Messager` з `Kind.ERROR` зупиняють компіляцію і вказують на конкретний елемент коду, як звичайні помилки компілятора.

## Застосування в екосистемі Java

* **MapStruct** — генерує код перетворення між об'єктами (DTO ↔ сутність) за інтерфейсом з анотацією `@Mapper`. Без рефлексії й з помилкою компіляції, якщо поле неможливо відобразити.
* **Dagger** — впровадження залежностей, повністю згенероване під час компіляції (Android). **Micronaut** і **Quarkus** так само переносять роботу DI-контейнера з часу запуску на час компіляції.
* **Immutables**, **AutoValue** — незмінні класи-значення з `equals`, `hashCode`, будівниками (частково замінені записами).
* **Hibernate JPA Metamodel Generator** — класи метамоделі `Person_` для типобезпечних запитів Criteria API.
* **Lombok** (`@Getter`, `@Builder`, `@Slf4j`) — особливий випадок: він не обмежується стандартним API, а через внутрішні класи `javac` **змінює** синтаксичне дерево класу користувача. Тому він може додати методи в сам клас, але залежить від внутрішніх деталей компілятора й ламається з новими версіями JDK раніше, ніж стандартні процесори.

> [!NOTE]
> Альтернативи генерації під час компіляції — генерація **байт-коду** під час збирання чи завантаження класів (ByteBuddy, ASM, Java agents; на цьому побудовані Hibernate-проксі й Mockito) і `java.lang.classfile` (Class-File API, Java 24) для читання й створення файлів класів.
