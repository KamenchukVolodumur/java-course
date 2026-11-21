export const lab04 = {
  id: "Lab04",
  title: "Лабораторна 04: Generics, ітератори та колекції",
  description: "Власний узагальнений кільцевий буфер з fail-fast ітератором, узагальнені методи з обмеженнями і wildcards (PECS), MultiMap на основі Map<K, List<V>>, LRU-кеш на LinkedHashMap і частотний індекс слів.",
  sections: [
    {
      title: "Перед початком",
      content: `
> [!NOTE]
> **Лекції:** 04.8 «Generics», 06.1 «Ітератори», 06.2 «Колекції» · **Час:** 3 год · **Бали:** 10

\`\`\`text
src/main/java/pl/mini/collections/
├── RingBuffer.java
├── CollectionUtils.java
├── MultiMap.java
├── LruCache.java
├── WordIndex.java
└── Main.java      (наданий)
\`\`\`

### Правила

* Розкоментовуйте блоки \`STAGE N\` у \`Main.java\` по черзі. Вивід має збігатися з очікуваним.
* Код компілюється **без попереджень** про unchecked/raw types, крім одного місця, позначеного \`@SuppressWarnings("unchecked")\` (створення масиву в \`RingBuffer\`).

> [!CAUTION]
> Заборонено: сирі типи (\`List\` без параметра), Stream API (його черга — лабораторна 05), класи \`Collections.max\`/\`Collections.addAll\` у відповідних методах \`CollectionUtils\` (реалізуйте самі).
`
    },
    {
      title: "Швидке повторення теорії",
      content: `
### Узагальнений клас і масив T[]

\`\`\`java
public class Stack<T> {
    private T[] items;

    @SuppressWarnings("unchecked")
    public Stack(int capacity) {
        items = (T[]) new Object[capacity];     // new T[n] неможливо через стирання типів
    }
}
\`\`\`

### Власний ітератор (у Java немає yield return)

\`\`\`java
@Override
public Iterator<T> iterator() {
    return new Iterator<>() {
        private int cursor = 0;
        @Override public boolean hasNext() { return cursor < size; }
        @Override public T next() {
            if (!hasNext()) throw new NoSuchElementException();
            return items[cursor++];
        }
    };
}
\`\`\`

### Fail-fast: лічильник модифікацій

\`\`\`java
private int modCount;                   // збільшуємо при кожній структурній зміні

// в ітераторі:
private final int expectedModCount = modCount;
private void checkForComodification() {
    if (modCount != expectedModCount) throw new ConcurrentModificationException();
}
\`\`\`

Саме так працюють \`ArrayList\` і \`HashMap\`.

### PECS

\`\`\`java
static <T> void copy(Iterable<? extends T> src, Collection<? super T> dst)   // з src читаємо, у dst пишемо
static <T extends Comparable<? super T>> T max(Iterable<? extends T> items)  // Comparable може бути оголошено в надкласі
\`\`\`

### Map: computeIfAbsent і merge

\`\`\`java
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
counts.merge(word, 1, Integer::sum);
\`\`\`

### LinkedHashMap як LRU-кеш

\`\`\`java
new LinkedHashMap<K, V>(16, 0.75f, true) {          // accessOrder = true: get переносить у кінець
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;                    // після put видалити найстаріший
    }
};
\`\`\`
`
    },
    {
      title: "Очікуваний вивід",
      content: `
Так має виглядати вивід \`Main\` зі стартового проєкту, коли розкоментовано всі етапи:

\`\`\`text
2 false
3 true b
b c d
OK: null
[b, c, d]
OK: CME
[c, d, e]
OK: remove
9
banana
[3, 9, 2, c, d, e]
[3, 9]
6.5
OK: empty
[1, 3] [] 3
[a] 1
OK: read-only
[x, z]
[be=2, to=2]
[1, 2] []
\`\`\`
`
    },
    {
      title: "Етап 1: RingBuffer<T> (2 б.)",
      content: `
Кільцевий буфер фіксованої місткості: коли він заповнений, новий елемент **перезаписує найстаріший**. Застосування: останні N подій, ковзне вікно вимірювань.

\`\`\`java
public class RingBuffer<T> implements Iterable<T> {
    public RingBuffer(int capacity);   // capacity <= 0 -> IllegalArgumentException
    public void add(T item);           // null -> NullPointerException
    public T get(int index);           // 0 — найстаріший; поза [0, size) -> IndexOutOfBoundsException
    public int size();
    public int capacity();
    public boolean isFull();
    public Iterator<T> iterator();     // від найстарішого до найновішого
}
\`\`\`

* Зберігання: масив \`T[]\`, індекс голови \`head\` (найстаріший) і \`size\`. Фізичний індекс i-го елемента: \`(head + i) % capacity\`.
* \`add\` працює за **O(1)**: жодних зсувів масиву.

> [!TIP]
> Намалюйте на папері масив з 3 комірок і пройдіть \`add("a")\` … \`add("d")\`, записуючи \`head\` і \`size\` після кожного кроку.
`
    },
    {
      title: "Етап 2: Fail-fast ітератор і toString (2 б.)",
      content: `
1. Додайте поле \`modCount\` і збільшуйте його в кожному \`add\`.
2. Ітератор запам'ятовує \`modCount\` під час створення. Якщо в \`next()\` значення відрізняється → \`ConcurrentModificationException\`.
3. \`iterator().remove()\` не підтримується (поведінка за замовчуванням — \`UnsupportedOperationException\`).
4. \`next()\` після кінця → \`NoSuchElementException\`.
5. \`toString()\` у форматі \`[b, c, d]\` (порожній буфер — \`[]\`). Використайте \`StringJoiner(", ", "[", "]")\`.

> [!NOTE]
> Чому \`ConcurrentModificationException\`, хоча потік один? Назва історична: виняток означає «колекцію змінили під час обходу», а не «гонка потоків». У нашому прикладі \`add("e")\` зсуває \`head\`, і ітератор інакше тихо повернув би неправильні елементи.
`
    },
    {
      title: "Етап 3: Узагальнені методи і PECS (2 б.)",
      content: `
Клас \`CollectionUtils\` (final, приватний конструктор):

\`\`\`java
public static <T extends Comparable<? super T>> T max(Iterable<? extends T> items);
public static <T> T max(Iterable<? extends T> items, Comparator<? super T> cmp);
public static <T> void copyInto(Iterable<? extends T> src, Collection<? super T> dst);
public static <T> List<T> filter(Iterable<? extends T> src, Predicate<? super T> p);
public static double sum(Iterable<? extends Number> numbers);
\`\`\`

* \`max\` для порожньої колекції → \`NoSuchElementException\`. За рівних значень повертається **перше**.
* \`filter\` повертає **новий** \`ArrayList\`, вхід не змінюється.
* \`sum\` використовує \`Number.doubleValue()\`.

Спробуйте пояснити собі (або викладачу), чому:

* \`copyInto(List<Integer>, List<Object>)\` компілюється, а з сигнатурою \`copyInto(Iterable<T>, Collection<T>)\` — ні;
* у \`max\` стоїть \`Comparable<? super T>\`: з \`Comparable<T>\` не вийде знайти максимум у \`List<java.sql.Timestamp>\`, бо \`Timestamp\` реалізує \`Comparable<Date>\`.
`
    },
    {
      title: "Етап 4: MultiMap<K, V> (2 б.)",
      content: `
Мапа, у якій одному ключу відповідає **список** значень (як \`Multimap\` у Guava).

\`\`\`java
public class MultiMap<K, V> {
    public void put(K key, V value);
    public List<V> get(K key);            // незмінне ПРЕДСТАВЛЕННЯ; для відсутнього ключа — порожній список
    public boolean remove(K key, V value);// видаляє одне входження; останнє значення -> ключ теж зникає
    public Set<K> keys();                 // у порядку першої вставки
    public int size();                    // загальна кількість значень
}
\`\`\`

* Усередині — \`Map<K, List<V>> map = new LinkedHashMap<>()\`.
* \`put\` — одним рядком через \`computeIfAbsent\`.
* \`get\` повертає \`Collections.unmodifiableList(...)\` або \`List.of()\`, і **ніколи** \`null\`.
* \`size()\` має працювати за **O(1)**: підтримуйте окремий лічильник.

> [!WARNING]
> Якщо \`remove\` не прибиратиме порожні списки, \`keys()\` повертатиме «мертві» ключі, а мапа поступово розростатиметься. Інваріант: **у мапі немає порожніх списків**.
`
    },
    {
      title: "Етап 5: LRU-кеш і частотний індекс (2 б.)",
      content: `
### LruCache<K, V>

\`\`\`java
public class LruCache<K, V> extends LinkedHashMap<K, V> {
    public LruCache(int capacity);   // capacity <= 0 -> IllegalArgumentException
}
\`\`\`

Використайте конструктор \`LinkedHashMap(int, float, boolean accessOrder)\` і перевизначте \`removeEldestEntry\`.

### WordIndex

\`\`\`java
public class WordIndex {
    public WordIndex(String text);
    public List<Map.Entry<String, Integer>> top(int n);   // n найчастіших слів
    public List<Integer> linesOf(String word);              // номери рядків (з 1), за зростанням, без повторів
}
\`\`\`

* Слова — послідовності літер (\`text.split("[^\\\\p{L}]+")\`), регістр не враховується.
* Частоти: \`Map<String, Integer>\` + \`merge\`.
* Рядки: \`Map<String, TreeSet<Integer>>\` (або ваш \`MultiMap\` з перевіркою на повтори).
* \`top\`: сортування за спаданням частоти, при рівності — за алфавітом. Сортуйте \`new ArrayList<>(counts.entrySet())\` компаратором, складеним з \`Map.Entry.comparingByValue(...)\` і \`thenComparing(Map.Entry.comparingByKey())\`.

Закомітьте, позначте тегом \`lab04\` і запуште.
`
    }
  ],
  quiz: [
    {
      question: "Чому в RingBuffer масив створюють як (T[]) new Object[capacity]?",
      options: [
        "Так швидше",
        "Через стирання типів new T[n] неможливий: тип T невідомий під час виконання",
        "Object[] займає менше пам'яті",
        "Це помилка"
      ],
      answer: 1,
      explanation: "Під час виконання T стерто до Object. Приведення безпечне, доки масив не «втікає» назовні як T[]."
    },
    {
      question: "Яка сигнатура дозволяє скопіювати List<Integer> у List<Number> і в List<Object>?",
      options: [
        "<T> void copy(List<T> src, List<T> dst)",
        "<T> void copy(Iterable<? extends T> src, Collection<? super T> dst)",
        "void copy(List<?> src, List<?> dst)",
        "<T> void copy(Collection<? super T> src, Iterable<? extends T> dst)"
      ],
      answer: 1,
      explanation: "PECS: джерело — producer (extends), приймач — consumer (super)."
    },
    {
      question: "Що робить accessOrder = true у конструкторі LinkedHashMap?",
      options: [
        "Сортує ключі",
        "Кожне звертання (get/put) переносить запис у кінець, тож першим лишається найдавніше використаний",
        "Робить мапу потокобезпечною",
        "Забороняє null"
      ],
      answer: 1,
      explanation: "Разом з removeEldestEntry це готова реалізація LRU-кешу."
    }
  ]
};
