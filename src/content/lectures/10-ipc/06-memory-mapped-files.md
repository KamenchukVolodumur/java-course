---
title: Файли, відображені в пам'ять
description: Відображення файлу в адресний простір процесу, FileChannel.map і MappedByteBuffer, MemorySegment для великих файлів, порядок байтів і force, спільна пам'ять між процесами, синхронізація через FileLock, продуктивність.
---

## Ідея

**Відображення файлу в пам'ять** (memory-mapped file) — механізм ОС, що проєктує вміст файлу безпосередньо в адресний простір процесу. Після цього файл можна читати й змінювати як масив у пам'яті, без викликів `read`/`write`.

Основні сценарії:

1. **Ефективний доступ до великих файлів.** Програма звертається до файлу так, ніби він повністю в пам'яті, навіть якщо він значно більший за оперативну пам'ять. ОС підвантажує й вивантажує потрібні сторінки (зазвичай по 4 КБ) за потребою. Так можна довільно читати й змінювати величезні файли, не завантажуючи їх повністю.
2. **Міжпроцесна взаємодія.** Кілька процесів відображають той самий файл у свої адресні простори і **бачать ту саму фізичну пам'ять**. Це одна з найшвидших форм IPC.

## MappedByteBuffer

Класичний API — `FileChannel.map(mode, position, size)`, що повертає `MappedByteBuffer` — різновид `ByteBuffer`, вміст якого і є файлом:

| Режим | Значення |
| --- | --- |
| `READ_ONLY` | лише читання |
| `READ_WRITE` | зміни записуються у файл і видимі іншим процесам, що відображають той самий файл |
| `PRIVATE` | копіювання під час запису: зміни бачить лише цей процес, файл не змінюється |

```java
Path path = Path.of("test.dat");
String message = "Привіт, світе!";
byte[] bytes = message.getBytes(StandardCharsets.UTF_8);

try (FileChannel channel = FileChannel.open(path,
        StandardOpenOption.CREATE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {

    MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 1024);  // файл розшириться до 1024 байтів
    buffer.putInt(0, bytes.length);              // абсолютний запис: довжина за зміщенням 0
    buffer.put(4, bytes);                        // Java 16: абсолютний запис масиву
    buffer.force();                              // гарантовано скинути зміни на диск

    int length = buffer.getInt(0);
    byte[] read = new byte[length];
    buffer.get(4, read);
    System.out.println(new String(read, StandardCharsets.UTF_8));   // Привіт, світе!
}
```

Особливості:

* `ByteBuffer` за замовчуванням використовує порядок байтів **big-endian**. Для обміну з нативними програмами задають `buffer.order(ByteOrder.LITTLE_ENDIAN)` або `ByteOrder.nativeOrder()`.
* Відображення **не закривається** разом з каналом: воно живе, доки буфер досяжний, і звільняється збирачем сміття в невизначений момент. У Windows поки відображення живе, файл не можна видалити.
* Індекс `ByteBuffer` — `int`, тож одне відображення обмежене **2 ГБ**. Більші файли доводилося відображати частинами.

## MemorySegment

Від Java 22 (Foreign Function & Memory API) файл можна відобразити в **`MemorySegment`**. Він має `long`-зміщення без обмеження в 2 ГБ, а його час життя визначає **арена**: з її закриттям відображення звільняється детерміновано.

```java
try (Arena arena = Arena.ofConfined();
     FileChannel channel = FileChannel.open(Path.of("huge.bin"), StandardOpenOption.READ)) {

    MemorySegment file = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size(), arena);

    long sum = 0;
    long count = file.byteSize() / Long.BYTES;
    for (long i = 0; i < count; i++) {
        sum += file.getAtIndex(ValueLayout.JAVA_LONG_UNALIGNED, i);   // будь-яке зміщення, навіть > 2 ГБ
    }
    System.out.println(sum);
}   // закриття арени звільняє відображення
```

Детальніше про `MemorySegment` і арени — у розділі «Взаємодія з нативним кодом».

> [!NOTE]
> Для **довільного** (random) доступу до великого файлу відображення в пам'ять у рази швидше за потоки: немає системного виклику й копіювання на кожну операцію. Для **послідовного** читання чи запису виграшу майже немає, а буферизовані потоки часто навіть швидші.

## Спільна пам'ять

**Спільна пам'ять** — окремий випадок відображення, де мета не робота з файлом на диску, а **прямий обмін даними між процесами**. Дані не копіюються між процесами: обидва працюють з тим самим блоком фізичної пам'яті (сторінковим кешем ОС).

У Java немає API іменованої спільної пам'яті без файлу, тож процеси відображають **спільний файл**:

* у Linux його розміщують у `/dev/shm` — файловій системі `tmpfs` в оперативній пам'яті, тож на диск нічого не пишеться;
* в інших ОС підходить звичайний тимчасовий файл: активно використовувані сторінки все одно живуть у пам'яті, а ОС лише час від часу записує їх на диск.

> [!WARNING]
> Коли до тієї самої пам'яті мають доступ кілька процесів (або потоків), потрібна **синхронізація**. Без неї виникає гонка даних: один процес читає дані, які інший саме змінює. Між процесами синхронізуються через **блокування файлу** `FileChannel.lock()`: системний замок, видимий усім процесам. (Усередині однієї JVM два перекривні `lock()` на тому самому файлі кидають `OverlappingFileLockException`: замок належить процесу, а не потоку.)

### Приклад: записувач і читач

Записувач заповнює спільну пам'ять квадратами чисел і наприкінці встановлює прапорець готовності. Читач, захопивши замок, перевіряє прапорець і читає дані. Та сама програма грає обидві ролі залежно від аргументу.

```java
public class SharedMemory {
    static final Path SHM_FILE = Files.isDirectory(Path.of("/dev/shm"))
            ? Path.of("/dev/shm/shared_memory.shm")
            : Path.of(System.getProperty("java.io.tmpdir"), "shared_memory.shm");
    static final int COUNT = 500;
    static final int SIZE = Integer.BYTES * (COUNT + 1);           // прапорець + дані

    public static void main(String[] args) throws Exception {
        switch (args.length == 1 ? args[0] : "") {
            case "writer" -> writer();
            case "reader" -> reader();
            default -> System.out.println("java SharedMemory [reader|writer]");
        }
    }

    static void writer() throws IOException {
        try (FileChannel channel = FileChannel.open(SHM_FILE,
                StandardOpenOption.CREATE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
            MappedByteBuffer shm = channel.map(FileChannel.MapMode.READ_WRITE, 0, SIZE);
            try (FileLock lock = channel.lock()) {                     // ексклюзивний замок на весь файл
                for (int i = 0; i < COUNT; i++) {
                    shm.putInt(Integer.BYTES * (i + 1), i * i);
                }
                shm.putInt(0, 1);                                      // дані готові
            }
            System.out.println("Дані записано. Enter — завершити");
            new Scanner(System.in).nextLine();
        }
    }

    static void reader() throws IOException {
        try (FileChannel channel = FileChannel.open(SHM_FILE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
            MappedByteBuffer shm = channel.map(FileChannel.MapMode.READ_WRITE, 0, SIZE);
            try (FileLock lock = channel.lock()) {                     // чекає, доки записувач відпустить замок
                if (shm.getInt(0) != 1) {
                    System.out.println("Записувач ще не підготував дані");
                    return;
                }
                for (int i = 0; i < COUNT; i++) {
                    System.out.println(shm.getInt(Integer.BYTES * (i + 1)));
                }
            }
        }
    }
}
```

Запуск у двох терміналах: спочатку `java SharedMemory writer`, потім `java SharedMemory reader`. Читач надрукує `0, 1, 4, 9, ...`, хоча жоден байт не передавався ні каналом, ні мережею: обидва процеси читають і пишуть ту саму пам'ять.

> [!NOTE]
> У Unix блокування файлів **рекомендаційні** (advisory): вони захищають лише від процесів, які теж викликають `lock()`. Процес, що пише у файл без замка, нічого не помітить. Для частої дрібної синхронізації (лічильники, черги в спільній пам'яті) замість замків файлу використовують атомарні операції над спільною пам'яттю через `VarHandle` для `MemorySegment`. Їх розглянуто в розділі «Синхронізація».
