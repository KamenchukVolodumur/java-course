---
title: Модулі й завантажувачі класів
description: Що містить JAR, ресурси в classpath, локалізовані ресурси через ResourceBundle, завантажувачі класів і модель делегування, ідентичність класу, динамічне завантаження через URLClassLoader, система плагінів на ServiceLoader, вивантаження класів, модулі JPMS і шари модулів.
---

## Одиниця розповсюдження коду: JAR

Скомпільований код Java розповсюджується у файлах **`.class`**, зібраних в архіви **JAR** (Java ARchive, ZIP-формат). Окремого «виконуваного» файлу немає: застосунок запускають командою `java -jar app.jar` або `java -cp ... MainClass`.

Що містить JAR:

* **байт-код** — файли `.class`, по одному на кожен клас (зокрема вкладені: `Outer$Inner.class`, анонімні: `Outer$1.class`);
* **метадані** — кожен `.class` описує свій тип: поля, методи, сигнатури, анотації, generic-сигнатури, пул констант. Саме їх читає рефлексія;
* **маніфест** `META-INF/MANIFEST.MF` — головний клас, classpath залежностей, версія, назва модуля;
* **дескриптор модуля** `module-info.class` (для модульних JAR) — ім'я модуля, залежності, експортовані пакети;
* **ресурси** — будь-які інші файли: конфігурація, шаблони, зображення, переклади;
* **реєстрації сервісів** `META-INF/services/...` (див. нижче).

```text
Manifest-Version: 1.0
Main-Class: pl.mini.shop.App
Class-Path: libs/gson-2.11.0.jar
Implementation-Version: 1.2.0
Automatic-Module-Name: pl.mini.shop
```

## Ресурси

Будь-який файл з `src/main/resources` (Maven/Gradle) потрапляє в JAR поруч із класами. Читають його через **classpath**, а не через файлову систему: файл усередині JAR не має «звичайного» шляху на диску.

```java
// шлях з / — від кореня classpath
try (InputStream in = App.class.getResourceAsStream("/config/default.json")) {
    if (in == null) {
        System.out.println("Ресурс не знайдено!");
        return;
    }
    String json = new String(in.readAllBytes(), StandardCharsets.UTF_8);
}

// без / — відносно пакета класу App (pl/mini/shop/lorem.txt)
try (var reader = new BufferedReader(new InputStreamReader(
        Objects.requireNonNull(App.class.getResourceAsStream("lorem.txt")), StandardCharsets.UTF_8))) {
    reader.lines().forEach(System.out::println);
}

URL url = App.class.getResource("/config/default.json");   // jar:file:/.../app.jar!/config/default.json
```

> [!WARNING]
> Типова помилка — читати ресурс як файл: `Files.readString(Path.of("src/main/resources/config.json"))`. У середовищі розробки це працює, а із запакованого JAR — ні. Ресурси завжди читайте через `getResourceAsStream`.

## Локалізовані ресурси

Для перекладів інтерфейсу Java має **`ResourceBundle`**: набір файлів властивостей з однаковою базовою назвою і суфіксом локалі. `ResourceBundle` автоматично обирає файл для потрібної локалі, а відсутні ключі шукає в загальнішому файлі.

```text
src/main/resources/
├── messages.properties          # значення за замовчуванням
├── messages_pl.properties       # польська
└── messages_uk.properties       # українська
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

Порядок пошуку для `uk_UA`: `messages_uk_UA` → `messages_uk` → `messages_<локаль за замовчуванням>` → `messages`. Так можна створювати локалізовані застосунки, не змінюючи коду.

## Завантажувачі класів

Класи потрапляють у JVM через **завантажувачі класів** (`ClassLoader`). Клас завантажується **ліниво**, під час першого використання, а не під час старту програми. Стандартна ієрархія:

```text
Bootstrap ClassLoader        вбудований у JVM: модуль java.base і ядро JDK
        ▲
Platform ClassLoader         решта модулів JDK (java.sql, java.net.http ...)
        ▲
Application ClassLoader      класи застосунку з classpath / module path
        ▲
власні завантажувачі         плагіни, сервери застосунків, гаряче перезавантаження
```

Модель **делегування до батька**: отримавши запит на клас, завантажувач спершу передає його **батькові**; і лише якщо батько клас не знайшов, шукає сам. Так класи JDK (`java.lang.String`) завжди завантажує bootstrap-завантажувач, і підмінити їх власними неможливо.

```java
ClassLoader appLoader = App.class.getClassLoader();
System.out.println(appLoader);                         // jdk.internal.loader.ClassLoaders$AppClassLoader@...
System.out.println(appLoader.getParent());             // ...$PlatformClassLoader@...
System.out.println(String.class.getClassLoader());     // null — bootstrap
```

### Ідентичність класу

Клас у JVM ідентифікується **парою (повна назва, завантажувач)**. Той самий файл `.class`, завантажений двома різними завантажувачами, дає **два різні класи**: об'єкт одного не можна привести до іншого (`ClassCastException: Plugin cannot be cast to Plugin`).

Саме це дозволяє ізолювати залежності: застосунок використовує бібліотеку `A` версії 13.0, а плагін, завантажений власним завантажувачем, — `A` версії 10.2, і вони не конфліктують. Але **спільні** типи (інтерфейс плагіна) мусять завантажуватися одним, спільним завантажувачем, інакше застосунок і плагін бачитимуть «різні» інтерфейси.

## Динамічне завантаження класів

`URLClassLoader` завантажує класи з переліку JAR-файлів чи каталогів, заданих під час виконання:

```java
Path pluginJar = Path.of("plugins/plugin-reverse.jar");
try (URLClassLoader loader = new URLClassLoader(
        new URL[]{pluginJar.toUri().toURL()},
        App.class.getClassLoader())) {                 // батько: бачить інтерфейс TextPlugin застосунку

    Class<?> type = loader.loadClass("pl.mini.plugins.ReversePlugin");
    TextPlugin plugin = (TextPlugin) type.getDeclaredConstructor().newInstance();
    System.out.println(plugin.apply("Hello, World!"));
}
```

Власний завантажувач пишуть, перевизначаючи `findClass`: він знаходить байти класу (у базі даних, мережі, зашифрованому архіві) і перетворює їх на клас методом `defineClass`.

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

## Система плагінів на ServiceLoader

Найзручніший стандартний механізм пошуку реалізацій — **`ServiceLoader`**. Застосунок визначає **інтерфейс сервісу**, а реалізації реєструються декларативно, без рефлексії за назвами класів.

Приклад складається з модулів:

* **plugin-api** — спільний контракт;
* **plugin-host** — завантажує плагіни;
* **plugin-reverse**, **plugin-rot13**, **plugin-upper** — реалізації контракту.

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

Реєстрація реалізації — файл у JAR плагіна, назва якого — повне ім'я інтерфейсу, а вміст — повні імена класів-реалізацій:

```text
plugin-reverse.jar
└── META-INF/services/pl.mini.plugins.api.TextPlugin
        pl.mini.plugins.ReversePlugin
```

Застосунок знаходить усі JAR у каталозі плагінів і завантажує реалізації. Кожен плагін отримує **власний** завантажувач (ізоляція залежностей), а батьківським для всіх є завантажувач застосунку, через який вони бачать спільний `TextPlugin`:

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

`ServiceLoader` використовують і самі бібліотеки JDK та фреймворки: драйвери JDBC реєструють себе так, що `DriverManager` знаходить їх автоматично; так само підключаються провайдери логування (SLF4J), JSON (Jakarta JSON-P) і файлових систем.

### Вивантаження класів

Явно вивантажити клас у Java неможливо. Клас (разом з його кодом і статичними полями) вивантажується збирачем сміття, коли стає недосяжним **його завантажувач** і **всі** класи та об'єкти, що ним завантажені. Тому для плагінів, які треба оновлювати без перезапуску, кожен плагін завантажують окремим завантажувачем, а після закриття (`URLClassLoader.close()`) прибирають усі посилання на нього та його об'єкти. Будь-яке «забуте» посилання (статичне поле, зареєстрований слухач, `ThreadLocal`, запущений потік) утримає весь завантажувач у пам'яті: це типовий витік пам'яті в серверах застосунків.

## Модулі JPMS

**Java Platform Module System** (Java 9) додає над пакетами ще один рівень: **модуль** — набір пакетів з явно оголошеними залежностями й інтерфейсом. Модуль описує файл `module-info.java` у корені джерел:

```java
module pl.mini.plugins.host {
    requires pl.mini.plugins.api;          // залежність від модуля
    requires java.net.http;
    requires transitive org.slf4j;         // хто залежить від нас, теж бачить SLF4J

    exports pl.mini.plugins.host.api;      // публічний API модуля
    exports pl.mini.plugins.host.spi to pl.mini.plugins.extra;   // лише конкретному модулю

    opens pl.mini.plugins.host.dto to com.fasterxml.jackson.databind;   // дозвіл на глибоку рефлексію

    uses pl.mini.plugins.api.TextPlugin;   // модуль споживає сервіс
}

module pl.mini.plugins.reverse {
    requires pl.mini.plugins.api;
    provides pl.mini.plugins.api.TextPlugin with pl.mini.plugins.ReversePlugin;   // замість META-INF/services
}
```

Що дають модулі:

* **сильна інкапсуляція**: `public`-класи неекспортованих пакетів недоступні іншим модулям, навіть через рефлексію;
* **надійна конфігурація**: відсутній модуль чи пакет, присутній у двох модулях одночасно (split package), — помилка під час старту, а не таємничий `NoClassDefFoundError` посеред роботи;
* **мінімальні середовища виконання**: `jlink` збирає JRE лише з потрібних модулів JDK.

| Директива | Значення |
| --- | --- |
| `requires M` | залежність від модуля M |
| `requires transitive M` | залежність, яку «бачать» і споживачі нашого модуля |
| `requires static M` | залежність лише під час компіляції |
| `exports P [to M]` | пакет P доступний іншим модулям (на етапі компіляції й виконання) |
| `opens P [to M]` | пакет P відкритий для рефлексії (`setAccessible`) |
| `uses S` | модуль використовує сервіс S через `ServiceLoader` |
| `provides S with C` | модуль надає реалізацію C сервісу S |

Класи на **classpath** (без `module-info.java`) потрапляють у **безіменний модуль**: він бачить усі експортовані пакети й працює «по-старому». JAR без дескриптора, покладений на **module path**, стає **автоматичним** модулем з іменем з маніфесту (`Automatic-Module-Name`) або з назви файлу. Тому перехід на модулі може бути поступовим.

> [!NOTE]
> Для динамічного завантаження **модульних** плагінів з власною ізоляцією використовують `ModuleLayer`: застосунок створює новий шар модулів поверх завантажувача, і модулі плагіна резолвляться в ньому разом з їхніми залежностями. Сервери застосунків і IDE на кшталт IntelliJ IDEA мають власні, ще складніші системи плагінів.
