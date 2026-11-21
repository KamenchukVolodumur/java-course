export const lecture12 = {
  id: "12",
  title: "Лекція 12: Пам'ять поза купою, відображення файлів і Foreign Memory API",
  description: "ByteBuffer: купа і пряма пам'ять, порядок байтів; відображення файлів у пам'ять (MappedByteBuffer) і спільна пам'ять між процесами; історичний sun.misc.Unsafe; сучасний Foreign Function & Memory API (Arena, MemorySegment, MemoryLayout) — аналог unsafe-контексту і Span<T> у C#.",
  sections: [
    {
      title: "1. Навіщо пам'ять поза купою",
      content: `
Усі звичайні об'єкти Java живуть у купі під керуванням GC. Іноді цього недостатньо:

* **Великі буфери** (гігабайти даних, кеші). GC доводиться їх сканувати й переміщувати, а пам'ять поза купою (off-heap) GC не чіпає.
* **Взаємодія з ОС і нативним кодом**. Системні виклики та бібліотеки C очікують пам'ять, яка не переміщується.
* **I/O без зайвого копіювання**. Дані з мережі чи диска потрапляють прямо у буфер.
* **Спільна пам'ять між процесами** через файли, відображені в пам'ять.

В C# для цього є \`unsafe\`, \`fixed\`, \`stackalloc\`, \`Span<T>\` і \`Marshal.AllocHGlobal\`. У Java вказівників у мові немає, тому все робиться через API: \`ByteBuffer\` (Java 1.4) і **Foreign Function & Memory API** (фінальний у Java 22).
`
    },
    {
      title: "2. ByteBuffer: heap і direct",
      content: `
\`\`\`java
ByteBuffer heap = ByteBuffer.allocate(1024);          // byte[] у купі
ByteBuffer direct = ByteBuffer.allocateDirect(1024);  // нативна пам'ять поза купою

direct.putInt(42).putDouble(3.14).put((byte) 7);      // відносний запис, position зсувається
direct.flip();                                        // limit = position, position = 0: режим читання
int i = direct.getInt();
double d = direct.getDouble();
direct.getInt(0);                                     // абсолютне читання, position не змінюється
direct.clear();                                       // повернутися до запису (дані не стираються)
\`\`\`

Стан буфера описують три індекси: \`0 <= position <= limit <= capacity\`.

\`\`\`text
після put(4 байти):   [x x x x . . . .]   position=4, limit=8
після flip():          [x x x x . . . .]   position=0, limit=4
\`\`\`

### Порядок байтів

\`\`\`java
ByteBuffer b = ByteBuffer.allocate(4);
b.putInt(0x01020304);
System.out.println(Arrays.toString(b.array()));   // [1, 2, 3, 4]: BIG_ENDIAN за замовчуванням
b.clear().order(ByteOrder.LITTLE_ENDIAN).putInt(0x01020304);
System.out.println(Arrays.toString(b.array()));   // [4, 3, 2, 1]: як на x86
ByteOrder.nativeOrder();
\`\`\`

> [!WARNING]
> Пряма пам'ять звільняється, лише коли GC збере сам об'єкт \`ByteBuffer\`, тобто з невизначеною затримкою. Її загальний обсяг обмежує \`-XX:MaxDirectMemorySize\`. Створювати прямий буфер дорого, тому їх перевикористовують.
`
    },
    {
      title: "3. Файли, відображені в пам'ять (MappedByteBuffer)",
      content: `
ОС відображає файл безпосередньо в адресний простір процесу. Читання й запис стають звичайним доступом до пам'яті, а сторінки підвантажує й скидає на диск сама ОС. Аналог \`MemoryMappedFile\` у C#.

\`\`\`java
Path file = Path.of("data.bin");
try (FileChannel ch = FileChannel.open(file,
        StandardOpenOption.CREATE, StandardOpenOption.READ, StandardOpenOption.WRITE)) {

    MappedByteBuffer mm = ch.map(FileChannel.MapMode.READ_WRITE, 0, 1024 * 1024);  // 1 МБ
    for (int i = 0; i < 1000; i++) {
        mm.putInt(i * 4, i * i);           // запис "у пам'ять" = запис у файл
    }
    mm.force();                            // гарантовано скинути на диск (як fsync)
}
\`\`\`

### Спільна пам'ять між процесами

Якщо два процеси відобразять той самий файл у режимі \`READ_WRITE\`, вони бачитимуть зміни одне одного **без системних викликів**. Це найшвидший механізм IPC.

\`\`\`java
// процес-записувач
mm.putLong(8, payload);
mm.putInt(0, 1);          // прапорець "дані готові" записується ОСТАННІМ

// процес-читач
while (mm.getInt(0) == 0) Thread.onSpinWait();
long payload = mm.getLong(8);
\`\`\`

> [!CAUTION]
> Звичайний \`ByteBuffer\` не дає гарантій видимості та впорядкування між процесами чи потоками. Для справжньої синхронізації використовують \`VarHandle\` з режимами \`setRelease\`/\`getAcquire\` або FFM API (розділ 5), чи блокування фрагмента файлу \`FileChannel.lock()\`.

Обмеження: один \`MappedByteBuffer\` — до 2 ГБ (індекс типу \`int\`). Для більших файлів створюють кілька відображень або використовують \`MemorySegment\` з FFM API, де індекси мають тип \`long\`.
`
    },
    {
      title: "4. sun.misc.Unsafe — історія",
      content: `
\`Unsafe\` — внутрішній клас JDK із прямим доступом до пам'яті: \`allocateMemory\`, \`putLong(address, v)\`, \`compareAndSwapInt\` тощо. Роками його використовували бібліотеки, яким була потрібна швидкість: Netty, Kafka, Cassandra.

\`\`\`java
Field f = Unsafe.class.getDeclaredField("theUnsafe");
f.setAccessible(true);
Unsafe U = (Unsafe) f.get(null);

long addr = U.allocateMemory(16);
U.putLong(addr, 123L);
long v = U.getLong(addr);
U.freeMemory(addr);              // забули — витік; викликали двічі — падіння JVM
\`\`\`

> [!CAUTION]
> Помилка з \`Unsafe\` — це не виняток, а **падіння всієї JVM** (SIGSEGV). Методи доступу до пам'яті в \`Unsafe\` позначені deprecated for removal (JEP 471, Java 23). Їх заміна — \`VarHandle\` (атомарні операції) і FFM API (пам'ять).
`
    },
    {
      title: "5. Foreign Function & Memory API: робота з пам'яттю",
      content: `
Пакет \`java.lang.foreign\` (фінальний у Java 22) дає **безпечний** доступ до нативної пам'яті: перевірку меж і перевірку часу життя.

### Arena — час життя пам'яті

| Арена | Звільнення | Потоки |
| --- | --- | --- |
| \`Arena.ofConfined()\` | \`close()\` (try-with-resources) | лише потік-власник |
| \`Arena.ofShared()\` | \`close()\` | будь-які потоки |
| \`Arena.ofAuto()\` | GC | будь-які |
| \`Arena.global()\` | ніколи | будь-які |

\`\`\`java
try (Arena arena = Arena.ofConfined()) {
    MemorySegment seg = arena.allocate(ValueLayout.JAVA_INT, 10);   // int[10] поза купою
    for (int i = 0; i < 10; i++) {
        seg.setAtIndex(ValueLayout.JAVA_INT, i, i * i);
    }
    int sum = 0;
    for (int i = 0; i < 10; i++) sum += seg.getAtIndex(ValueLayout.JAVA_INT, i);
    System.out.println(sum);    // 285

    // seg.getAtIndex(ValueLayout.JAVA_INT, 10);   // IndexOutOfBoundsException, а не segfault
}   // уся пам'ять арени звільняється тут
// доступ до seg після close() -> IllegalStateException
\`\`\`

### Структури: MemoryLayout

\`\`\`java
// struct Point { int x; int y; };
StructLayout POINT = MemoryLayout.structLayout(
        ValueLayout.JAVA_INT.withName("x"),
        ValueLayout.JAVA_INT.withName("y"));
VarHandle X = POINT.varHandle(MemoryLayout.PathElement.groupElement("x"));
VarHandle Y = POINT.varHandle(MemoryLayout.PathElement.groupElement("y"));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment points = arena.allocate(POINT, 100);       // масив із 100 структур
    for (long i = 0; i < 100; i++) {
        MemorySegment p = points.asSlice(i * POINT.byteSize(), POINT);
        X.set(p, 0L, (int) i);
        Y.set(p, 0L, (int) (i * 2));
    }
}
\`\`\`

### Відображення великих файлів

\`\`\`java
try (Arena arena = Arena.ofShared();
     FileChannel ch = FileChannel.open(path, StandardOpenOption.READ)) {
    MemorySegment all = ch.map(FileChannel.MapMode.READ_ONLY, 0, ch.size(), arena);  // > 2 ГБ теж
    long count = 0;
    for (long off = 0; off < all.byteSize(); off++) {
        if (all.get(ValueLayout.JAVA_BYTE, off) == '\\n') count++;
    }
}
\`\`\`

Виклики нативних функцій через той самий API (\`Linker\`, аналог P/Invoke) розглянемо в лекції 13.
`
    }
  ],
  quiz: [
    {
      question: "Що робить buffer.flip()?",
      options: [
        "Змінює порядок байтів",
        "Встановлює limit = position і position = 0, тобто перемикає буфер із запису на читання",
        "Очищає дані",
        "Копіює буфер"
      ],
      answer: 1,
      explanation: "Після запису position вказує на кінець даних. flip() робить ці дані доступними для читання від початку."
    },
    {
      question: "Яка головна перевага MappedByteBuffer для IPC?",
      options: [
        "Він шифрує дані",
        "Два процеси, які відобразили той самий файл, бачать зміни одне одного без системних викликів на кожну операцію",
        "Він працює лише в одному процесі",
        "Він не потребує файлу"
      ],
      answer: 1,
      explanation: "Сторінки файлу спільні для процесів, тож запис одного процесу одразу видно іншому. Синхронізацію при цьому все одно треба забезпечити окремо."
    },
    {
      question: "Чому FFM API безпечніший за sun.misc.Unsafe?",
      options: [
        "Він повільніший",
        "Перевіряє межі сегмента і час життя арени: помилка дає виняток, а не падіння JVM",
        "Він не дозволяє записувати в пам'ять",
        "Він працює лише з купою"
      ],
      answer: 1,
      explanation: "Вихід за межі дає IndexOutOfBoundsException, а доступ після закриття арени — IllegalStateException. Unsafe за таких помилок просто «кладе» процес."
    },
    {
      question: "Коли звільняється пам'ять, виділена в Arena.ofConfined()?",
      options: [
        "Коли спрацює GC",
        "Під час виклику arena.close() (зазвичай наприкінці try-with-resources)",
        "Ніколи",
        "Після кожного доступу"
      ],
      answer: 1,
      explanation: "Confined- і shared-арени звільняються детерміновано під час close(). Arena.ofAuto() звільняє пам'ять через GC, а Arena.global() — ніколи."
    },
    {
      question: "Який порядок байтів має ByteBuffer за замовчуванням?",
      options: ["LITTLE_ENDIAN", "BIG_ENDIAN", "Нативний порядок процесора", "Випадковий"],
      answer: 1,
      explanation: "За замовчуванням використовується BIG_ENDIAN (мережевий порядок), незалежно від процесора. Змінити його можна через order(ByteOrder.LITTLE_ENDIAN)."
    }
  ]
};
