---
title: Annotation Processors
description: Compile-time metaprogramming, how javac runs annotation processors, processing rounds, the Processor API and the element model, a builder generator for annotated classes, registration and use in Maven and Gradle, error diagnostics, viewing generated files, applications — MapStruct, Dagger, Immutables, Lombok.
---

## Compile-Time Metaprogramming

**Annotation processors** are a mechanism of the `javac` compiler that makes it possible **at compile time** to analyze a program's code and generate new files from it: Java source code, resources, configuration. This is metaprogramming at the compilation stage.

Unlike reflection (the "Reflection" chapter), a processor works **before the program runs**:

| | Reflection | Annotation processor |
| --- | --- | --- |
| When | at run time | at compile time |
| Errors | exceptions in production | compilation errors |
| Cost | on every run (slower startup, more memory) | zero at run time |
| Generated code | invisible | ordinary `.java` files that can be read and debugged |
| Native compilation (GraalVM) | needs configuration | works unchanged |

The main limitation: a standard processor can **only add** new files. It cannot change existing classes. That is why generated code is usually placed in a **separate class** (`PersonBuilder` next to `Person`), and the user refers to it explicitly, or the user's class extends a generated base class.

## How It Works

1. `javac` parses the source files and builds a model of the program: packages, classes, methods, fields and their annotations.
2. It finds the processors on the **annotation processor path** via `ServiceLoader` and calls `process` on each, passing the annotated elements that the processor declared as supported.
3. A processor may generate new files through the `Filer`. If new source files have appeared, a **new round** begins: they are parsed too and passed to the processors (they may contain annotations).
4. When a round produces no new files, `javac` compiles everything together: both the user's code and the generated code.

## Example: a Builder Generator

The generator implements the **Builder** pattern for any class annotated with `@GenerateBuilder`. It analyzes the public non-static setters of the class and creates a `withXxx` method for each.

The annotation (a separate module or artifact on which both the processor and the user code depend). The `SOURCE` policy: the annotation is needed only by the compiler and does not end up in the `.class`:

```java
package org.example.builder;

@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.TYPE)
public @interface GenerateBuilder { }
```

The processor:

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
                        "@GenerateBuilder can only be applied to a class", element);
                continue;
            }
            TypeElement type = (TypeElement) element;
            try {
                generateBuilder(type);
            } catch (IOException e) {
                processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR,
                        "Could not generate the builder: " + e.getMessage(), element);
            }
        }
        return true;                                  // the annotation is "claimed": other processors will not get it
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
                packageName.isEmpty() ? builderName : packageName + "." + builderName, type);  // type is the "origin" for incremental compilation
        try (Writer writer = file.openWriter()) {
            writer.write(source.toString());
        }
    }
}
```

The element model (`javax.lang.model`) describes code **without loading classes**: a `TypeElement` is a class or interface, an `ExecutableElement` a method or constructor, a `VariableElement` a field or parameter, a `TypeMirror` a type. The user's classes are not compiled yet, so reflection is unavailable here.

### Registration

`javac` finds a processor via `ServiceLoader`: the processor's JAR must contain the file

```text
META-INF/services/javax.annotation.processing.Processor
```

with the fully qualified class name: `org.example.builder.BuilderProcessor`. This file is conveniently generated with the AutoService library (`@AutoService(Processor.class)`), which is itself an annotation processor.

### Usage

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
        .withFirstName("Ada")
        .withLastName("Lovelace")
        .withAge(36)
        .build();
System.out.println(person);                         // Ada Lovelace, 36
```

Setting it up in Maven: the processor is given in `annotationProcessorPaths`, so it does not end up on the application's classpath:

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

In Gradle — a separate dependency configuration:

```kotlin
dependencies {
    compileOnly("org.example:builder-annotations:1.0.0")
    annotationProcessor("org.example:builder-processor:1.0.0")
}
```

> [!NOTE]
> Since JDK 23, `javac` does **not run** processors found on the ordinary classpath without explicit permission: they must be given on the processor path (`-processorpath`, `annotationProcessorPaths`) or enabled with the `-proc:full` flag. This protects against unnoticed execution of code from random dependencies.

> [!TIP]
> The generated files are in `target/generated-sources/annotations` (Maven) or `build/generated/sources/annotationProcessor` (Gradle). IDEs show them as ordinary code: you can navigate to them and debug them. Messages through the `Messager` with `Kind.ERROR` stop compilation and point to a specific code element, like ordinary compiler errors.

## Applications in the Java Ecosystem

* **MapStruct** — generates mapping code between objects (DTO ↔ entity) from an interface annotated with `@Mapper`. No reflection, and a compilation error if a field cannot be mapped.
* **Dagger** — dependency injection fully generated at compile time (Android). **Micronaut** and **Quarkus** likewise move the work of the DI container from startup time to compile time.
* **Immutables**, **AutoValue** — immutable value classes with `equals`, `hashCode`, builders (partly replaced by records).
* **Hibernate JPA Metamodel Generator** — `Person_` metamodel classes for type-safe Criteria API queries.
* **Lombok** (`@Getter`, `@Builder`, `@Slf4j`) — a special case: it is not limited to the standard API, but **modifies** the syntax tree of the user's class through `javac`'s internal classes. That is why it can add methods to the class itself, but it depends on the compiler's internal details and breaks with new JDK versions earlier than standard processors do.

> [!NOTE]
> Alternatives to compile-time generation are generating **bytecode** at build or class-loading time (ByteBuddy, ASM, Java agents; Hibernate proxies and Mockito are built on this) and `java.lang.classfile` (the Class-File API, Java 24) for reading and creating class files.
