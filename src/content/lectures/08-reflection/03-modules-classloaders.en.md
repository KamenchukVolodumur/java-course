---
title: Modules and Class Loaders
description: What a JAR contains, classpath resources, localized resources with ResourceBundle, class loaders and the delegation model, class identity, dynamic loading with URLClassLoader, a plugin system on ServiceLoader, class unloading, JPMS modules and module layers.
---

## The Unit of Code Distribution: the JAR

Compiled Java code is distributed in **`.class`** files collected into **JAR** archives (Java ARchive, the ZIP format). There is no separate "executable" file: an application is started with `java -jar app.jar` or `java -cp ... MainClass`.

What a JAR contains:

* **bytecode** — the `.class` files, one per class (including nested ones: `Outer$Inner.class`, anonymous ones: `Outer$1.class`);
* **metadata** — each `.class` describes its type: fields, methods, signatures, annotations, generic signatures, the constant pool. This is exactly what reflection reads;
* **the manifest** `META-INF/MANIFEST.MF` — the main class, the classpath of the dependencies, the version, the module name;
* **the module descriptor** `module-info.class` (for modular JARs) — the module name, dependencies, exported packages;
* **resources** — any other files: configuration, templates, images, translations;
* **service registrations** `META-INF/services/...` (see below).

```text
Manifest-Version: 1.0
Main-Class: pl.mini.shop.App
Class-Path: libs/gson-2.11.0.jar
Implementation-Version: 1.2.0
Automatic-Module-Name: pl.mini.shop
```

## Resources

Any file from `src/main/resources` (Maven/Gradle) ends up in the JAR next to the classes. It is read through the **classpath**, not through the file system: a file inside a JAR has no "ordinary" path on disk.

```java
// a path with / — from the root of the classpath
try (InputStream in = App.class.getResourceAsStream("/config/default.json")) {
    if (in == null) {
        System.out.println("Resource not found!");
        return;
    }
    String json = new String(in.readAllBytes(), StandardCharsets.UTF_8);
}

// without / — relative to the package of the App class (pl/mini/shop/lorem.txt)
try (var reader = new BufferedReader(new InputStreamReader(
        Objects.requireNonNull(App.class.getResourceAsStream("lorem.txt")), StandardCharsets.UTF_8))) {
    reader.lines().forEach(System.out::println);
}

URL url = App.class.getResource("/config/default.json");   // jar:file:/.../app.jar!/config/default.json
```

> [!WARNING]
> A typical mistake is reading a resource as a file: `Files.readString(Path.of("src/main/resources/config.json"))`. In the development environment this works, but from a packaged JAR it does not. Always read resources with `getResourceAsStream`.

## Localized Resources

For translating the user interface, Java has **`ResourceBundle`**: a set of properties files with the same base name and a locale suffix. `ResourceBundle` automatically chooses the file for the required locale and looks up missing keys in a more general file.

```text
src/main/resources/
├── messages.properties          # default values
├── messages_pl.properties       # Polish
└── messages_uk.properties       # Ukrainian
```

```properties
# messages_uk.properties (Java 9+: UTF-8)
greeting=Привіт!
welcome-message=Ласкаво просимо, {0}! У вас {1} нових повідомлень.
```

```java
ResourceBundle bundle = ResourceBundle.getBundle("messages", Locale.forLanguageTag("uk"));
System.out.println(bundle.getString("greeting"));                       // Привіт!
String welcome = MessageFormat.format(bundle.getString("welcome-message"), "Оля", 3);
System.out.println(welcome);                                            // Ласкаво просимо, Оля! У вас 3 нових повідомлень.
```

The lookup order for `uk_UA`: `messages_uk_UA` → `messages_uk` → `messages_<default locale>` → `messages`. This makes it possible to build localized applications without changing the code.

## Class Loaders

Classes get into the JVM through **class loaders** (`ClassLoader`). A class is loaded **lazily**, on first use, not at program startup. The standard hierarchy:

```text
Bootstrap ClassLoader        built into the JVM: the java.base module and the JDK core
        ▲
Platform ClassLoader         the rest of the JDK modules (java.sql, java.net.http ...)
        ▲
Application ClassLoader      application classes from the classpath / module path
        ▲
custom loaders               plugins, application servers, hot reloading
```

The **parent delegation** model: on receiving a request for a class, a loader first passes it to its **parent**; only if the parent did not find the class does it search itself. This way the JDK classes (`java.lang.String`) are always loaded by the bootstrap loader and cannot be replaced with your own.

```java
ClassLoader appLoader = App.class.getClassLoader();
System.out.println(appLoader);                         // jdk.internal.loader.ClassLoaders$AppClassLoader@...
System.out.println(appLoader.getParent());             // ...$PlatformClassLoader@...
System.out.println(String.class.getClassLoader());     // null — bootstrap
```

### Class Identity

A class in the JVM is identified by the **pair (fully qualified name, loader)**. The same `.class` file loaded by two different loaders gives **two different classes**: an object of one cannot be cast to the other (`ClassCastException: Plugin cannot be cast to Plugin`).

This is exactly what allows dependencies to be isolated: the application uses library `A` version 13.0, while a plugin loaded by its own loader uses `A` version 10.2, and they do not conflict. But **shared** types (the plugin interface) must be loaded by one, shared loader, otherwise the application and the plugin will see "different" interfaces.

## Dynamic Class Loading

`URLClassLoader` loads classes from a list of JAR files or directories given at run time:

```java
Path pluginJar = Path.of("plugins/plugin-reverse.jar");
try (URLClassLoader loader = new URLClassLoader(
        new URL[]{pluginJar.toUri().toURL()},
        App.class.getClassLoader())) {                 // the parent: sees the application's TextPlugin interface

    Class<?> type = loader.loadClass("pl.mini.plugins.ReversePlugin");
    TextPlugin plugin = (TextPlugin) type.getDeclaredConstructor().newInstance();
    System.out.println(plugin.apply("Hello, World!"));
}
```

A custom loader is written by overriding `findClass`: it finds the class's bytes (in a database, on the network, in an encrypted archive) and turns them into a class with the `defineClass` method.

```java
class BytesClassLoader extends ClassLoader {
    private final Map<String, byte[]> classes;

    BytesClassLoader(Map<String, byte[]> classes, ClassLoader parent) {
        super(parent);
        this.classes = classes;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] bytes = classes.get(name);
        if (bytes == null) throw new ClassNotFoundException(name);
        return defineClass(name, bytes, 0, bytes.length);
    }
}
```

## A Plugin System on ServiceLoader

The most convenient standard mechanism for finding implementations is **`ServiceLoader`**. The application defines a **service interface**, and implementations are registered declaratively, without reflection by class names.

The example consists of modules:

* **plugin-api** — the shared contract;
* **plugin-host** — loads the plugins;
* **plugin-reverse**, **plugin-rot13**, **plugin-upper** — implementations of the contract.

```java
// plugin-api
public interface TextPlugin {
    String name();
    String apply(String input);
}
```

```java
// plugin-reverse
public class ReversePlugin implements TextPlugin {
    public String name() { return "reverse"; }
    public String apply(String input) { return new StringBuilder(input).reverse().toString(); }
}
```

An implementation is registered with a file in the plugin's JAR whose name is the fully qualified name of the interface and whose contents are the fully qualified names of the implementing classes:

```text
plugin-reverse.jar
└── META-INF/services/pl.mini.plugins.api.TextPlugin
        pl.mini.plugins.ReversePlugin
```

The application finds all JARs in the plugins directory and loads the implementations. Each plugin gets **its own** loader (dependency isolation), and the parent of all of them is the application's loader, through which they see the shared `TextPlugin`:

```java
public class PluginHost {
    public static void main(String[] args) throws IOException {
        String hello = "Hello, World!";
        try (Stream<Path> jars = Files.list(Path.of("plugins"))) {
            for (Path jar : (Iterable<Path>) jars.filter(p -> p.toString().endsWith(".jar"))::iterator) {
                try (URLClassLoader loader = new URLClassLoader(
                        new URL[]{jar.toUri().toURL()}, PluginHost.class.getClassLoader())) {
                    for (TextPlugin plugin : ServiceLoader.load(TextPlugin.class, loader)) {
                        System.out.println(plugin.name() + ": " + plugin.apply(hello));
                    }
                }
            }
        }
    }
}
// reverse: !dlroW ,olleH
// rot13: Uryyb, Jbeyq!
// upper: HELLO, WORLD!
```

`ServiceLoader` is used by the JDK libraries themselves and by frameworks: JDBC drivers register themselves this way so that `DriverManager` finds them automatically; logging providers (SLF4J), JSON providers (Jakarta JSON-P) and file system providers are plugged in the same way.

### Class Unloading

A class cannot be unloaded explicitly in Java. A class (together with its code and static fields) is unloaded by the garbage collector when **its loader** and **all** classes and objects loaded by it become unreachable. That is why plugins that must be updated without a restart are each loaded with a separate loader, and after closing (`URLClassLoader.close()`) all references to it and its objects are removed. Any "forgotten" reference (a static field, a registered listener, a `ThreadLocal`, a running thread) keeps the whole loader in memory: a typical memory leak in application servers.

## JPMS Modules

The **Java Platform Module System** (Java 9) adds one more level above packages: a **module** — a set of packages with explicitly declared dependencies and an interface. A module is described by a `module-info.java` file at the root of the sources:

```java
module pl.mini.plugins.host {
    requires pl.mini.plugins.api;          // a dependency on a module
    requires java.net.http;
    requires transitive org.slf4j;         // whoever depends on us also sees SLF4J

    exports pl.mini.plugins.host.api;      // the module's public API
    exports pl.mini.plugins.host.spi to pl.mini.plugins.extra;   // only to a specific module

    opens pl.mini.plugins.host.dto to com.fasterxml.jackson.databind;   // permission for deep reflection

    uses pl.mini.plugins.api.TextPlugin;   // the module consumes a service
}

module pl.mini.plugins.reverse {
    requires pl.mini.plugins.api;
    provides pl.mini.plugins.api.TextPlugin with pl.mini.plugins.ReversePlugin;   // instead of META-INF/services
}
```

What modules give:

* **strong encapsulation**: `public` classes of non-exported packages are inaccessible to other modules, even through reflection;
* **reliable configuration**: a missing module or a package present in two modules at once (a split package) is an error at startup, not a mysterious `NoClassDefFoundError` in the middle of work;
* **minimal runtime images**: `jlink` builds a JRE from only the required JDK modules.

| Directive | Meaning |
| --- | --- |
| `requires M` | a dependency on module M |
| `requires transitive M` | a dependency that the consumers of our module also "see" |
| `requires static M` | a compile-time-only dependency |
| `exports P [to M]` | package P is accessible to other modules (at compile time and at run time) |
| `opens P [to M]` | package P is open to reflection (`setAccessible`) |
| `uses S` | the module uses service S through `ServiceLoader` |
| `provides S with C` | the module provides implementation C of service S |

Classes on the **classpath** (without `module-info.java`) end up in the **unnamed module**: it sees all exported packages and works "the old way". A JAR without a descriptor placed on the **module path** becomes an **automatic** module with a name taken from the manifest (`Automatic-Module-Name`) or from the file name. That is why the migration to modules can be gradual.

> [!NOTE]
> For dynamically loading **modular** plugins with their own isolation, a `ModuleLayer` is used: the application creates a new layer of modules on top of a loader, and the plugin's modules are resolved in it together with their dependencies. Application servers and IDEs like IntelliJ IDEA have their own, even more complex plugin systems.
