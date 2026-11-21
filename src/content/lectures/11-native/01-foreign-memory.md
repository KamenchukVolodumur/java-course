---
title: Нативна пам'ять
description: Безпека пам'яті в Java і навіщо виходити за її межі, ByteBuffer.allocateDirect і застарілий sun.misc.Unsafe, Foreign Memory API — MemorySegment, арени та їх види, ValueLayout, «арифметика вказівників» через зміщення й зрізи, розміри, макети структур і VarHandle, об'єднання, масиви структур, зв'язний список у нативній пам'яті, сегменти масивів купи, переосмислення бітів.
---

## Безпечна мова і нативна пам'ять

Java — **безпечна** щодо пам'яті мова: немає вказівників, кожен доступ до масиву перевіряється, а пам'яттю керує збирач сміття, який може переміщувати об'єкти. Але в деяких ситуаціях потрібна пам'ять **поза купою** (off-heap):

* обмін даними з нативними бібліотеками C/C++ (наступна сторінка), які очікують сирі адреси й структури з точним розташуванням полів;
* великі буфери, що не мають навантажувати збирач сміття (кеші на гігабайти, буфери введення-виведення);
* відображення файлів у пам'ять і спільна пам'ять між процесами.

Історично для цього були:

* **`ByteBuffer.allocateDirect(n)`** — буфер поза купою з індексом `int` (до 2 ГБ). Пам'ять звільняється, коли збирач сміття прибере сам об'єкт буфера, тобто в невизначений момент;
* **`sun.misc.Unsafe`** — внутрішній клас JDK з сирими адресами (`allocateMemory`, `putInt(address, value)`, `freeMemory`) без жодних перевірок. Помилка означала аварійне завершення JVM. Методи доступу до пам'яті в `Unsafe` оголошено застарілими до видалення (Java 23).

Сучасна заміна — **Foreign Function & Memory API** (FFM, пакет `java.lang.foreign`, фінальний у Java 22). Він дає продуктивність сирих вказівників, але зберігає безпеку:

* **просторову** — кожен доступ перевіряє межі сегмента;
* **часову** — доступ до вже звільненої пам'яті кидає виняток, а не читає сміття;
* **потокову** — сегмент можна обмежити одним потоком.

## MemorySegment і арени

**`MemorySegment`** — неперервна ділянка пам'яті з відомим розміром: нативна (поза купою), відображений файл або масив з купи. **`Arena`** керує **часом життя** нативних сегментів: усі сегменти, виділені в арені, звільняються разом з нею.

```java
try (Arena arena = Arena.ofConfined()) {
    MemorySegment segment = arena.allocate(100 * Integer.BYTES);         // 400 байтів, заповнені нулями

    for (int i = 0; i < 100; i++) {
        segment.setAtIndex(ValueLayout.JAVA_INT, i, i * i);
    }
    System.out.println(segment.getAtIndex(ValueLayout.JAVA_INT, 99));    // 9801

    segment.setAtIndex(ValueLayout.JAVA_INT, 100, 0);                     // IndexOutOfBoundsException
}   // пам'ять звільнено тут — детерміновано, як free() у C
```

| Арена | Закриття | Доступ з потоків |
| --- | --- | --- |
| `Arena.ofConfined()` | явне (`close`) | лише потік-власник |
| `Arena.ofShared()` | явне (`close`) | будь-які потоки |
| `Arena.ofAuto()` | збирачем сміття, коли арена недосяжна | будь-які потоки |
| `Arena.global()` | ніколи (до кінця програми) | будь-які потоки |

```java
MemorySegment leaked;
try (Arena arena = Arena.ofConfined()) {
    leaked = arena.allocate(16);
}
leaked.get(ValueLayout.JAVA_INT, 0);     // IllegalStateException: Already closed — замість читання сміття
```

## ValueLayout і зміщення

**Макет значення** (`ValueLayout`) описує, як інтерпретувати байти: розмір, вирівнювання й порядок байтів. Основні: `JAVA_BYTE`, `JAVA_SHORT`, `JAVA_CHAR`, `JAVA_INT`, `JAVA_LONG`, `JAVA_FLOAT`, `JAVA_DOUBLE` і `ADDRESS` (вказівник).

Доступ буває:

* за **зміщенням у байтах**: `get(layout, offset)`, `set(layout, offset, value)`;
* за **індексом елемента**: `getAtIndex(layout, index)` (зміщення = індекс × розмір).

```java
try (Arena arena = Arena.ofConfined()) {
    MemorySegment buffer = arena.allocate(16);

    buffer.set(ValueLayout.JAVA_INT, 0, 0xCAFEBABE);
    buffer.set(ValueLayout.JAVA_SHORT, 4, (short) 7);
    buffer.set(ValueLayout.JAVA_DOUBLE, 8, Math.PI);

    System.out.printf("%X%n", buffer.get(ValueLayout.JAVA_INT, 0));    // CAFEBABE
    System.out.println(buffer.get(ValueLayout.JAVA_BYTE, 0));           // -66 = 0xBE (little-endian на x86)

    buffer.set(ValueLayout.JAVA_INT, 1, 42);   // IllegalArgumentException: зміщення 1 не вирівняне на 4
    buffer.set(ValueLayout.JAVA_INT_UNALIGNED, 1, 42);                  // так можна
}
```

> [!NOTE]
> Макети `JAVA_*` використовують **нативний** порядок байтів платформи (на x86 і ARM — little-endian), на відміну від `ByteBuffer`, де за замовчуванням big-endian. Інший порядок задає `JAVA_INT.withOrder(ByteOrder.BIG_ENDIAN)`.

### «Арифметика вказівників»

Вказівника в Java немає, але його роль грають **зміщення** й **зрізи**. `asSlice(offset, size)` повертає сегмент, що вказує всередину іншого, без копіювання, як `ptr + offset` у C, але з власними межами:

```java
static void memCopy(MemorySegment src, MemorySegment dst, long bytes) {
    MemorySegment.copy(src, 0, dst, 0, bytes);                            // аналог memcpy з перевіркою меж
}

MemorySegment second = segment.asSlice(4 * Integer.BYTES, 10 * Integer.BYTES);  // елементи 4..13
second.fill((byte) 0);                                                   // аналог memset лише для зрізу
```

Перетворення сегмента в масив Java і назад:

```java
MemorySegment nativeInts = arena.allocateFrom(ValueLayout.JAVA_INT, 5, 3, 8, 1);  // виділити й заповнити
int[] copy = nativeInts.toArray(ValueLayout.JAVA_INT);                             // [5, 3, 8, 1]
```

## Структури

Розташування полів структури C описує **макет структури** (`StructLayout`). Розмір і зміщення полів, з урахуванням вирівнювання, обчислюються автоматично. Це аналог оператора `sizeof` і `offsetof` у C:

```c
struct Vector3 {
    float x;
    float y;
    float z;
};
```

```java
static final StructLayout VECTOR3 = MemoryLayout.structLayout(
        ValueLayout.JAVA_FLOAT.withName("x"),
        ValueLayout.JAVA_FLOAT.withName("y"),
        ValueLayout.JAVA_FLOAT.withName("z"));

static final VarHandle X = VECTOR3.varHandle(MemoryLayout.PathElement.groupElement("x"));
static final VarHandle Y = VECTOR3.varHandle(MemoryLayout.PathElement.groupElement("y"));
static final VarHandle Z = VECTOR3.varHandle(MemoryLayout.PathElement.groupElement("z"));

System.out.println(VECTOR3.byteSize());                                   // 12 = sizeof(Vector3)
System.out.println(VECTOR3.byteOffset(MemoryLayout.PathElement.groupElement("z")));   // 8 = offsetof(z)

try (Arena arena = Arena.ofConfined()) {
    MemorySegment v = arena.allocate(VECTOR3);
    X.set(v, 0L, 1f);                                                     // (сегмент, базове зміщення, значення)
    Y.set(v, 0L, 2f);
    Z.set(v, 0L, 2f);
    float x = (float) X.get(v, 0L), y = (float) Y.get(v, 0L), z = (float) Z.get(v, 0L);
    System.out.println(Math.sqrt(x * x + y * y + z * z));                 // 3.0
}
```

**`VarHandle`** — типізований «дескриптор змінної»: знає зміщення поля в структурі й тип значення. JIT-компілятор перетворює такі звернення на звичайні машинні інструкції завантаження й запису.

Вирівнювання полів, як і в C, іноді потребує явних «дірок»:

```c
struct Packet { char kind; int length; double value; };   // sizeof = 16
```

```java
StructLayout PACKET = MemoryLayout.structLayout(
        ValueLayout.JAVA_BYTE.withName("kind"),
        MemoryLayout.paddingLayout(3),                      // вирівняти int на 4
        ValueLayout.JAVA_INT.withName("length"),
        ValueLayout.JAVA_DOUBLE.withName("value"));         // зміщення 8; разом 16 байтів
```

Без `paddingLayout` створення макета кине `IllegalArgumentException`: `int` за зміщенням 1 не вирівняний.

### Об'єднання

Об'єднання (`union`) C — кілька полів за тим самим зміщенням — описує `MemoryLayout.unionLayout`:

```c
struct Color {
    union {
        struct { uint8_t r, g, b, a; };
        uint32_t rgba;
    };
};
```

```java
static final GroupLayout COLOR = MemoryLayout.unionLayout(
        MemoryLayout.structLayout(
                ValueLayout.JAVA_BYTE.withName("r"),
                ValueLayout.JAVA_BYTE.withName("g"),
                ValueLayout.JAVA_BYTE.withName("b"),
                ValueLayout.JAVA_BYTE.withName("a")).withName("channels"),
        ValueLayout.JAVA_INT.withName("rgba"));

static final VarHandle R = COLOR.varHandle(
        MemoryLayout.PathElement.groupElement("channels"), MemoryLayout.PathElement.groupElement("r"));
static final VarHandle RGBA = COLOR.varHandle(MemoryLayout.PathElement.groupElement("rgba"));

MemorySegment color = arena.allocate(COLOR);
RGBA.set(color, 0L, 0xFF336699);
System.out.printf("%X%n", (byte) R.get(color, 0L));        // 99 — молодший байт на little-endian
```

### Масиви структур

`MemoryLayout.sequenceLayout(n, element)` описує масив. Шлях `sequenceElement()` дає `VarHandle` з додатковою координатою — індексом:

```java
SequenceLayout POINTS = MemoryLayout.sequenceLayout(1000, VECTOR3);
VarHandle POINT_X = POINTS.varHandle(MemoryLayout.PathElement.sequenceElement(),
                                     MemoryLayout.PathElement.groupElement("x"));

MemorySegment points = arena.allocate(POINTS);                   // 12 000 байтів
for (long i = 0; i < 1000; i++) {
    POINT_X.set(points, 0L, i, (float) i);                       // points[i].x = i
}

points.elements(VECTOR3)                                          // Stream<MemorySegment> — по зрізу на елемент
      .limit(3)
      .forEach(p -> System.out.println(X.get(p, 0L)));            // 0.0, 1.0, 2.0
```

## Вказівники між структурами

Вказівник на нативну пам'ять — це макет `ADDRESS`. Прочитаний вказівник повертається як сегмент **нульового розміру** (адреса без відомих меж). Щоб працювати з ним, сегмент «переосмислюють» до потрібного розміру методом `reinterpret`, або одразу задають цільовий макет `ADDRESS.withTargetLayout(...)`.

Однозв'язний список у нативній пам'яті, аналог `struct Node { Node* next; int value; }`:

```java
static final StructLayout NODE = MemoryLayout.structLayout(
        ValueLayout.ADDRESS.withName("next"),
        ValueLayout.JAVA_INT.withName("value"),
        MemoryLayout.paddingLayout(4));                               // вирівнювання до 16 байтів
static final long NEXT = NODE.byteOffset(MemoryLayout.PathElement.groupElement("next"));
static final long VALUE = NODE.byteOffset(MemoryLayout.PathElement.groupElement("value"));

static MemorySegment push(Arena arena, MemorySegment head, int value) {
    MemorySegment node = arena.allocate(NODE);
    node.set(ValueLayout.ADDRESS, NEXT, head);                        // node->next = head
    node.set(ValueLayout.JAVA_INT, VALUE, value);                     // node->value = value
    return node;
}

static MemorySegment find(MemorySegment head, int value) {
    while (!head.equals(MemorySegment.NULL)) {
        MemorySegment node = head.reinterpret(NODE.byteSize());       // «розіменування»: тепер відомий розмір
        if (node.get(ValueLayout.JAVA_INT, VALUE) == value) return node;
        head = node.get(ValueLayout.ADDRESS, NEXT);                   // head = head->next
    }
    return MemorySegment.NULL;
}

try (Arena arena = Arena.ofConfined()) {
    MemorySegment head = MemorySegment.NULL;
    for (int i = 1; i <= 5; i++) head = push(arena, head, i * 10);
    System.out.println(find(head, 30).get(ValueLayout.JAVA_INT, VALUE));   // 30
}
```

> [!WARNING]
> `reinterpret` — **обмежений** (restricted) метод: він дозволяє оголосити будь-яку адресу сегментом будь-якого розміру, тож неправильний розмір означає читання чужої пам'яті й можливе аварійне завершення JVM. Тому під час його виклику JVM виводить попередження, якщо запуск не дозволено явно: `java --enable-native-access=ALL-UNNAMED` (або ім'я модуля).

## Сегменти масивів купи

Сегмент може обгортати і звичайний масив Java: `MemorySegment.ofArray(array)`. Так ті самі методи працюють з будь-якою пам'яттю, подібно до того, як один метод приймає і нативний, і купний буфер:

```java
static long sum(MemorySegment ints) {
    long sum = 0;
    for (long i = 0; i < ints.byteSize() / Integer.BYTES; i++) {
        sum += ints.getAtIndex(ValueLayout.JAVA_INT, i);
    }
    return sum;
}

int[] array = {1, 2, 3, 4};
System.out.println(sum(MemorySegment.ofArray(array)));                          // 10 — купа
System.out.println(sum(arena.allocateFrom(ValueLayout.JAVA_INT, 1, 2, 3, 4)));  // 10 — нативна пам'ять
```

Збирач сміття може переміщувати масиви купи, тож передати сегмент масиву в нативну функцію за замовчуванням не можна: дані копіюють у нативну пам'ять. Виняток — короткі виклики з опцією `Linker.Option.critical(true)`, під час яких JVM гарантує, що масив не переміститься (наступна сторінка).

Звичайний масив Java обробляють ще й так, ніби це «зображення в пам'яті». Приклад — перетворення пікселів ARGB на відтінки сірого через доступ до окремих байтів:

```java
static void toGrayscale(int[] argbPixels) {
    MemorySegment bytes = MemorySegment.ofArray(argbPixels);
    for (long offset = 0; offset < bytes.byteSize(); offset += 4) {
        int b = Byte.toUnsignedInt(bytes.get(ValueLayout.JAVA_BYTE, offset));       // little-endian: B, G, R, A
        int g = Byte.toUnsignedInt(bytes.get(ValueLayout.JAVA_BYTE, offset + 1));
        int r = Byte.toUnsignedInt(bytes.get(ValueLayout.JAVA_BYTE, offset + 2));
        byte gray = (byte) (0.299 * r + 0.587 * g + 0.114 * b);
        bytes.set(ValueLayout.JAVA_BYTE, offset, gray);
        bytes.set(ValueLayout.JAVA_BYTE, offset + 1, gray);
        bytes.set(ValueLayout.JAVA_BYTE, offset + 2, gray);
    }
}
```

## Переосмислення бітів

У C для читання бітів `int` як `float` використовують приведення вказівників. Java для цього має готові методи, без жодної пам'яті:

```java
float f = Float.intBitsToFloat(0x40490FDB);                  // 3.1415927
int bits = Float.floatToRawIntBits(3.1415927f);              // 0x40490FDB
double d = Double.longBitsToDouble(0x400921FB54442D18L);     // 3.141592653589793
```

> [!TIP]
> Нативна пам'ять — інструмент для специфічних задач. Для звичайного коду масиви й колекції Java простіші, безпечніші й завдяки JIT-компілятору майже так само швидкі.
