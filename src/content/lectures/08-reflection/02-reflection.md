---
title: Рефлексія
description: Reflection API — отримання Class, огляд полів, методів і конструкторів, модифікатори, виклик методів і конструкторів, доступ до приватних полів і обмеження модулів, MethodHandle і VarHandle для швидкого виклику, рефлексія generics, власні анотації під час виконання, динамічні проксі, рефлексія і AOT-компіляція.
---

## Рефлексія

**Рефлексія** — механізм, що дозволяє програмі аналізувати власну структуру під час виконання: дізнаватися, які типи існують і які члени вони мають, створювати об'єкти класів, назви яких стають відомими лише під час роботи, викликати методи й читати поля. Анотації з попередньої сторінки марні, доки їх ніхто не прочитає: рефлексія дозволяє прочитати їх і діяти на їхній основі.

> [!NOTE]
> Рефлексія — форма **метапрограмування під час виконання**. Java має й метапрограмування **під час компіляції**: процесори анотацій аналізують код і генерують нові вихідні файли (розділ «Інше»).

Операції через рефлексію значно повільніші за прямі виклики, обходять перевірки компілятора (назви членів — це рядки, що ламаються під час рефакторингу) і ускладнюють налагодження. Але деякі задачі без неї розв'язати набагато складніше:

* **тестові фреймворки** — знайти всі методи з анотацією `@Test` і викликати їх;
* **серіалізація** — пройти поля об'єкта й перетворити його, наприклад, на JSON;
* **впровадження залежностей** (Spring, CDI) — знайти конструктор і передати йому потрібні об'єкти;
* **ORM** (Hibernate) — відобразити поля класу на стовпці таблиці;
* **системи плагінів** — завантажити зовнішній JAR і знайти класи, що реалізують інтерфейс `Plugin`.

## Пакети API

Рефлексія доступна через класи пакетів `java.lang`, `java.lang.reflect` і `java.lang.invoke`:

```text
Module                                java.lang.Module
└── Package                           java.lang.Package
    └── Class<T>                      java.lang.Class: тип (клас, інтерфейс, enum, record, масив, примітив)
        ├── Field                     поле
        ├── Constructor<T>            конструктор ─┐
        ├── Method                    метод ───────┴── Executable ── Parameter
        ├── RecordComponent           компонент record
        └── Class<?>[]                вкладені типи, інтерфейси
AnnotatedElement                      спільний інтерфейс усього, що може мати анотації
Type ── ParameterizedType, TypeVariable, WildcardType, GenericArrayType   (інформація про generics)
MethodHandle, VarHandle               java.lang.invoke: швидкий доступ, що оптимізує JIT
Proxy, InvocationHandler              динамічні реалізації інтерфейсів
```

Генерування **нових класів** під час виконання стандартна бібліотека підтримує обмежено (динамічні проксі, `Lookup.defineHiddenClass`, а з Java 24 — ClassFile API для побудови байт-коду). Зазвичай для цього використовують бібліотеки ByteBuddy чи ASM: так працюють Mockito (mock-об'єкти), Hibernate (ліниві проксі) і Spring (проксі класів).

## Отримання інформації про тип

Вхідна точка рефлексії — об'єкт **`Class<T>`**, що представляє тип. Розглядатимемо клас:

```java
package pl.mini.reflection;

public class Person {
    private String id;
    private String firstName;
    private String lastName;
    private LocalDate birthday;

    public Person(String firstName, String lastName, LocalDate birthday) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthday = birthday != null ? birthday : LocalDate.now();
        this.id = makeId(this.birthday);
    }

    public Person(String firstName, String lastName) { this(firstName, lastName, null); }

    public String getFirstName() { return firstName; }
    public String getFullName() { return firstName + " " + lastName; }
    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public boolean isAdult() {
        return birthday.plusYears(18).isBefore(LocalDate.now());
    }

    public static String makeId(LocalDate birthday) {
        return String.format("%04d%02d%02d%05d", birthday.getYear(), birthday.getMonthValue(),
                birthday.getDayOfMonth(), ThreadLocalRandom.current().nextInt(100_000));
    }
}
```

Об'єкт `Class` можна отримати трьома способами:

1. **Літералом класу** — тип відомий під час компіляції:

```java
Class<Person> personType = Person.class;
Class<int[]> arrayType = int[].class;
Class<Integer> primitive = int.class;           // для примітивів теж є об'єкти Class
```

2. **Методом `getClass()`** — фактичний тип об'єкта під час виконання:

```java
Person person = new Person("Alice", "Smith");
Class<? extends Person> type = person.getClass();
```

3. **За повною назвою** через `Class.forName` — тип стає відомим лише під час виконання (наприклад, з файлу конфігурації):

```java
Class<?> type = Class.forName("pl.mini.reflection.Person");   // ClassNotFoundException, якщо немає
Class<?> nested = Class.forName("java.util.Map$Entry");       // вкладені класи — через $
```

`Class.forName` завантажує й **ініціалізує** клас (виконує статичні блоки). Метод шукає клас завантажувачем того класу, з якого його викликано; інший завантажувач можна передати явно: `Class.forName(name, false, loader)`.

### Інформація про клас

```java
Class<?> c = Person.class;
c.getName();               // pl.mini.reflection.Person
c.getSimpleName();         // Person
c.getPackageName();        // pl.mini.reflection
c.getSuperclass();         // class java.lang.Object
c.getInterfaces();         // реалізовані інтерфейси
Modifier.toString(c.getModifiers());   // "public"
c.isInterface(); c.isEnum(); c.isRecord(); c.isArray(); c.isPrimitive(); c.isSealed();
c.getPermittedSubclasses();            // для sealed-класів
c.getModule();
Person.class.isAssignableFrom(Student.class);   // true: Student можна присвоїти Person
Person.class.isInstance(obj);                   // аналог obj instanceof Person
```

### Члени класу

Для кожного виду членів є дві пари методів:

| Метод | Що повертає |
| --- | --- |
| `getFields()`, `getMethods()`, `getConstructors()` | лише **публічні** члени, **включно з успадкованими** (конструктори не успадковуються) |
| `getDeclaredFields()`, `getDeclaredMethods()`, `getDeclaredConstructors()` | **усі** члени, оголошені **в цьому класі** (будь-яка видимість, зокрема статичні), **без** успадкованих |
| `getField(name)`, `getMethod(name, paramTypes...)`, `getConstructor(paramTypes...)` | один публічний член за ім'ям і типами параметрів |
| `getDeclaredField(name)`, `getDeclaredMethod(...)`, `getDeclaredConstructor(...)` | один оголошений член будь-якої видимості |

```java
for (Field f : Person.class.getDeclaredFields()) {
    System.out.printf("%-10s %-12s %s%n",
            Modifier.toString(f.getModifiers()), f.getType().getSimpleName(), f.getName());
}
// private    String       id
// private    String       firstName
// ...

for (Method m : Person.class.getDeclaredMethods()) {
    System.out.println(m);    // public boolean pl.mini.reflection.Person.isAdult() ...
}

Constructor<Person> ctor = Person.class.getConstructor(String.class, String.class, LocalDate.class);
for (Parameter p : ctor.getParameters()) {
    System.out.println(p.getType().getSimpleName() + " " + p.getName());   // arg0, arg1... без -parameters
}
```

> [!NOTE]
> Порядок елементів, які повертають `getDeclaredMethods()` і `getDeclaredFields()`, специфікація **не гарантує**. Імена параметрів доступні лише тоді, коли код скомпільовано з прапорцем `javac -parameters` (Spring Boot і багато фреймворків вмикають його в збиранні); інакше вони виглядають як `arg0`, `arg1`.

Властивостей як окремого виду членів у Java немає: їх розпізнають за конвенцією JavaBeans (`getX`/`isX`/`setX`). Цим займається, наприклад, `java.beans.Introspector`.

## Виклик членів

### Методи

```java
Person person = new Person("Alice", "Smith", LocalDate.now().minusYears(21));

Method isAdult = Person.class.getMethod("isAdult");          // NoSuchMethodException, якщо немає
Object result = isAdult.invoke(person);                      // аргументи — varargs Object...
System.out.println("Повнолітня: " + result);                 // true (упаковано в Boolean)

Method makeId = Person.class.getMethod("makeId", LocalDate.class);
String id = (String) makeId.invoke(null, LocalDate.of(2000, 1, 1));   // null — для статичного методу
```

Якщо викликаний метод кидає виняток, `invoke` загортає його в **`InvocationTargetException`**; справжня причина — у `getCause()`. Неправильні аргументи дають `IllegalArgumentException`, відсутність доступу — `IllegalAccessException`.

### Конструктори

```java
Constructor<Person> ctor = Person.class.getConstructor(String.class, String.class, LocalDate.class);
Person john = ctor.newInstance("John", "Doe", LocalDate.now().minusYears(42));
System.out.println(john.getFullName());

Object fromName = Class.forName("java.util.ArrayList").getDeclaredConstructor().newInstance();
```

Застарілий `Class.newInstance()` не використовують: він «протягує» checked-винятки конструктора без оголошення.

### Поля і приватні члени

Рефлексія дозволяє **порушити інкапсуляцію**: прочитати чи змінити приватне поле, викликати приватний метод. Для цього доступ треба явно відкрити через `setAccessible(true)`:

```java
Person person = new Person("Alice", "Smith", LocalDate.now().minusYears(21));

Field idField = Person.class.getDeclaredField("id");
idField.setAccessible(true);                       // вимикає перевірку private
String id = (String) idField.get(person);
System.out.println("id до: " + id);
idField.set(person, id.substring(0, 8));
System.out.println("id після: " + idField.get(person));

Field birthday = Person.class.getDeclaredField("birthday");
birthday.setAccessible(true);
birthday.set(person, ((LocalDate) birthday.get(person)).minusYears(2));
System.out.println("Вік: " + (LocalDate.now().getYear() - person.getBirthday().getYear()));   // 23
```

> [!WARNING]
> `setAccessible(true)` працює лише тоді, коли модуль, що містить клас, **відкриває** пакет модулю, який звертається (директива `opens` у `module-info.java`). Для класів самого JDK (`java.base`) це за замовчуванням заборонено: спроба відкрити, наприклад, приватне поле `String.value` кидає `InaccessibleObjectException`. Код на classpath (без модулів) може відкривати власні класи вільно.

`final`-поля через рефлексію змінювати можна лише для звичайних класів (і навіть тоді JIT може не побачити зміни); поля records і `static final` змінити не можна.

## Швидкий доступ: MethodHandle і VarHandle

`Method.invoke` повільний: на кожен виклик перевіряються права й типи аргументів, примітиви упаковуються в масив `Object[]`. Для частих викликів використовують **`MethodHandle`** з `java.lang.invoke`: права перевіряються **один раз** під час пошуку, а JIT здатен вбудувати такий виклик майже як прямий.

```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle isAdult = lookup.findVirtual(Person.class, "isAdult", MethodType.methodType(boolean.class));

Person person = new Person("Alice", "Smith", LocalDate.now().minusYears(21));
for (int i = 0; i < 1_000_000; i++) {
    boolean adult = (boolean) isAdult.invokeExact(person);   // типи мають точно збігатися із сигнатурою
}

// прив'язати до об'єкта і перетворити на функціональний інтерфейс
BooleanSupplier supplier = MethodHandleProxies.asInterfaceInstance(BooleanSupplier.class, isAdult.bindTo(person));
System.out.println(supplier.getAsBoolean());
```

**`VarHandle`** дає швидкий доступ до полів, зокрема приватних, через «привілейований» lookup, а також атомарні операції (розділ «Синхронізація»):

```java
VarHandle idHandle = MethodHandles.privateLookupIn(Person.class, MethodHandles.lookup())
        .findVarHandle(Person.class, "id", String.class);
String id = (String) idHandle.get(person);
idHandle.set(person, "00000000");
```

## Рефлексія на рівні модуля і пакета

На відміну від деяких платформ, Java **не має** методу «перелічити всі класи пакета чи JAR»: класи завантажуються ліниво, і JVM не знає наперед, які існують. Щоб знайти класи, переглядають ресурси завантажувача (файли `.class` у каталогах і JAR) або використовують бібліотеки сканування (ClassGraph, Reflections), або — найкраще — **явну реєстрацію** через `ServiceLoader` (сторінка «Модулі й завантажувачі класів»).

```java
Module module = Person.class.getModule();
System.out.println(module.getName());          // null для класів на classpath (безіменний модуль)
System.out.println(module.getPackages());      // пакети іменованого модуля
Package pkg = Person.class.getPackage();
System.out.println(pkg.getImplementationVersion());   // з MANIFEST.MF, якщо задано
```

## Generics і рефлексія

Через стирання типів під час виконання `List<String>` і `List<Integer>` — той самий `Class`. Але оголошення **зберігають** повну інформацію про generic-типи, і рефлексія може її прочитати через інтерфейс `Type`:

```java
class Repository {
    private Map<String, List<Integer>> index;
    public List<Person> findAll() { return List.of(); }
}

Field f = Repository.class.getDeclaredField("index");
System.out.println(f.getType());               // interface java.util.Map — стерто
System.out.println(f.getGenericType());        // java.util.Map<java.lang.String, java.util.List<java.lang.Integer>>

if (f.getGenericType() instanceof ParameterizedType pt) {
    for (Type arg : pt.getActualTypeArguments()) {
        System.out.println("  аргумент: " + arg.getTypeName());
    }
}

Type ret = Repository.class.getMethod("findAll").getGenericReturnType();   // java.util.List<pl...Person>
TypeVariable<?>[] params = Map.class.getTypeParameters();                  // [K, V]
```

Масиви довільного типу створюють через `java.lang.reflect.Array`:

```java
Object arr = Array.newInstance(String.class, 3);   // new String[3]
Array.set(arr, 0, "a");
System.out.println(Array.getLength(arr));          // 3
```

## Власні анотації під час виконання

Анотації з `RetentionPolicy.RUNTIME` читають методами інтерфейсу `AnnotatedElement`, який реалізують `Class`, `Method`, `Field`, `Constructor`, `Parameter` тощо:

| Метод | Що повертає |
| --- | --- |
| `getAnnotation(A.class)` | анотацію або `null` |
| `isAnnotationPresent(A.class)` | чи є анотація |
| `getAnnotations()` | усі анотації (для класу — включно з `@Inherited`) |
| `getDeclaredAnnotations()` | анотації, поставлені безпосередньо на елемент |
| `getAnnotationsByType(A.class)` | масив, з урахуванням `@Repeatable` |

Приклад — мінімальний інструмент для вимірювання часу виконання методів, позначених анотацією `@Benchmark`:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Benchmark {
    int repetitions() default 100;
}

public class Main {
    public static void main(String[] args) throws Exception {
        for (Method method : Main.class.getDeclaredMethods()) {
            Benchmark benchmark = method.getAnnotation(Benchmark.class);
            if (benchmark == null) continue;

            if (method.getParameterCount() != 0 || !Modifier.isStatic(method.getModifiers())) {
                System.out.println("Метод " + method.getName() + " має бути статичним і без параметрів");
                continue;
            }

            int rep = benchmark.repetitions();
            System.out.println("Знайдено бенчмарк: " + method.getName() + ", повторень: " + rep);
            MethodHandle handle = MethodHandles.lookup().unreflect(method);   // швидший за invoke
            long start = System.nanoTime();
            for (int i = 0; i < rep; i++) {
                handle.invoke();
            }
            long micros = (System.nanoTime() - start) / rep / 1000;
            System.out.println(method.getName() + ": " + micros + " мкс на виклик");
        }
    }

    @Benchmark
    public static void stringConcat() {
        String s = "";
        for (int i = 0; i < 10_000; i++) s += 'a';
    }

    @Benchmark(repetitions = 10_000)
    public static void stringBuilder() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10_000; i++) sb.append('a');
        String s = sb.toString();
    }

    @Benchmark
    public static void stringRepeat() {
        String s = "a".repeat(10_000);
    }
}
```

> [!NOTE]
> Такий «бенчмарк» дає лише орієнтовні числа: JIT ще не розігрітий, а результат обчислень не використовується, тож оптимізатор може викинути частину роботи. Для справжніх вимірювань використовують **JMH** (Java Microbenchmark Harness), який розв'язує ці проблеми.

## Динамічні проксі

`java.lang.reflect.Proxy` створює **під час виконання** об'єкт, що реалізує задані інтерфейси й передає кожен виклик в `InvocationHandler`. Так працюють Spring AOP (`@Transactional`), mock-об'єкти та HTTP-клієнти на кшталт Retrofit, де інтерфейс описує API, а реалізацію генерує бібліотека.

```java
interface Calculator {
    int add(int a, int b);
    int divide(int a, int b);
}

@SuppressWarnings("unchecked")
static <T> T logging(T target, Class<T> iface) {
    return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class<?>[]{iface},
            (proxy, method, args) -> {
                System.out.println("-> " + method.getName() + Arrays.toString(args));
                try {
                    Object result = method.invoke(target, args);
                    System.out.println("<- " + result);
                    return result;
                } catch (InvocationTargetException e) {
                    throw e.getCause();                     // прокинути справжній виняток
                }
            });
}

Calculator calc = logging(new Calculator() {
    public int add(int a, int b) { return a + b; }
    public int divide(int a, int b) { return a / b; }
}, Calculator.class);

calc.add(2, 3);        // -> add[2, 3]   <- 5
```

JDK-проксі реалізують лише **інтерфейси**. Для класів бібліотеки генерують підкласи (ByteBuddy, cglib).

## Рефлексія та AOT-компіляція

Під час компіляції в нативний виконуваний файл (**GraalVM Native Image**, розділ «Інше») компілятор аналізує код і викидає все, до чого, на його думку, немає звернень. Класи й члени, які використовуються **лише через рефлексію** (наприклад, клас, назву якого прочитано з конфігурації), під час виконання можуть бути відсутні. Тому їх треба описати у файлах конфігурації (`reflect-config.json`, у новіших версіях `reachability-metadata.json`). Згенерувати ці файли допомагає агент, який записує всі звернення рефлексії під час тестового запуску:

```bash
java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image -jar app.jar
```

Тому сучасні фреймворки (Micronaut, Quarkus, Spring AOT) і бібліотеки дедалі частіше замінюють рефлексію **генеруванням коду під час компіляції** процесорами анотацій: результат швидший, перевіряється компілятором і сумісний з AOT.
