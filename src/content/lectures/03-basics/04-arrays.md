---
title: Масиви
description: Масиви як об'єкти фіксованого розміру, ініціалізація, перевірка меж, клас Arrays, копіювання і фрагменти, коваріантність і ArrayStoreException, багатовимірні масиви.
---

## Масиви

Масив — це **об'єкт** посилального типу, що зберігає фіксовану кількість елементів одного типу. Тип масиву записують як тип елемента з квадратними дужками: `int[]`, `String[]`. Елементи індексуються від 0.

Довжину масиву дає поле `length` (не метод!). Після створення розмір масиву **змінити неможливо**: щоб «збільшити» масив, створюють новий і копіюють елементи (`Arrays.copyOf`).

Елементи, яким не задано значень, отримують значення за замовчуванням: `0`, `0.0`, `false`, `'\u0000'`, а для посилальних типів — `null`.

Усі звертання до елементів перевіряються під час виконання: вихід за межі кидає `ArrayIndexOutOfBoundsException`, від'ємний розмір під час створення — `NegativeArraySizeException`.

```java
int[] primes = new int[] {2, 3, 5, 7, 11};
char[] vowels = {'a', 'e', 'i', 'o', 'u'};       // скорочена форма лише в оголошенні
float[] data = new float[10];                    // десять нулів
String[] names = new String[3];                  // [null, null, null]

System.out.println("Довжина: " + primes.length);
for (int i = 0; i < primes.length; i++) {
    System.out.println(primes[i]);
}
for (int p : primes) {                           // for-each
    System.out.println(p);
}

// primes[5] = 13;      // ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5
// int[] x = {1, 2};  x = {3, 4};    // ПОМИЛКА: {...} лише при оголошенні
int[] x = {1, 2};
x = new int[] {3, 4};                            // так можна будь-де, наприклад як аргумент
```

Синтаксис `int x[]` (дужки після імені, як у C) теж допустимий, але не рекомендується.

### Масиви примітивів і масиви посилань

* `int[]` — суцільний блок чисел у пам'яті. Доступ дуже швидкий, дані гарно лягають у кеш процесора.
* `String[]`, `Person[]` — суцільний блок **посилань**; самі об'єкти розкидані по купі. Кожне звертання — це ще й перехід за посиланням.

```text
int[] {2, 3, 5}              String[] {"a", "b"}
┌───┬───┬───┐                ┌─────┬─────┐
│ 2 │ 3 │ 5 │                │  ●  │  ●  │
└───┴───┴───┘                └──┼──┴──┼──┘
                                ▼     ▼
                              "a"   "b"     (окремі об'єкти в купі)
```

## Клас Arrays

Масиви не мають корисних методів (вони успадковують лише методи `Object`). Операції над масивами надає утилітний клас `java.util.Arrays`:

```java
int[] a = {5, 3, 1, 4};

Arrays.sort(a);                                  // [1, 3, 4, 5]
int pos = Arrays.binarySearch(a, 4);             // 2 (масив має бути відсортований!)
Arrays.fill(a, 7);                               // [7, 7, 7, 7]
int[] bigger = Arrays.copyOf(a, 6);              // [7, 7, 7, 7, 0, 0]
int[] part = Arrays.copyOfRange(a, 1, 3);        // [7, 7]: [від, до)
System.out.println(Arrays.toString(bigger));     // "[7, 7, 7, 7, 0, 0]"
Arrays.equals(a, part);                          // порівняння ВМІСТУ
Arrays.hashCode(a);                              // хеш за вмістом
int cmp = Arrays.compare(new int[]{1, 2}, new int[]{1, 3});   // < 0

String[] words = {"pear", "Fig", "apple"};
Arrays.sort(words);                                       // [Fig, apple, pear]: великі літери перші
Arrays.sort(words, String.CASE_INSENSITIVE_ORDER);        // [apple, Fig, pear]
Arrays.sort(words, Comparator.comparing(String::length)); // за довжиною

int sum = Arrays.stream(a).sum();                // потоки (розділ «Колекції»)
Arrays.setAll(a, i -> i * i);                    // [0, 1, 4, 9]

System.arraycopy(a, 0, bigger, 2, a.length);     // найшвидше копіювання, працює і з перекриттям
```

> [!WARNING]
> Метод `equals` масивів успадковано від `Object`, тож він порівнює **посилання**, а `toString` повертає щось на кшталт `[I@1b6d3586`. Для масивів використовуйте `Arrays.equals`, `Arrays.toString` і `Arrays.deepToString` (для вкладених масивів).

### Фрагменти масиву

Синтаксису зрізів (`a[1:3]`) у Java немає. Фрагмент можна:

* **скопіювати** в новий масив: `Arrays.copyOfRange(a, 1, 3)`;
* отримати як **представлення** (view) без копіювання: `Arrays.asList(boxed).subList(1, 3)` для масиву посилань;
* обробити потоком: `Arrays.stream(a, 1, 3)`.

```java
Integer[] boxed = {2, 3, 5, 7};
List<Integer> view = Arrays.asList(boxed);   // список фіксованого розміру поверх масиву
view.set(0, 100);
System.out.println(boxed[0]);                // 100: зміни видно в масиві
List<Integer> lastTwo = view.subList(view.size() - 2, view.size());   // [5, 7]
// view.add(11);                             // UnsupportedOperationException: розмір фіксований
```

## Коваріантність масивів

Масиви в Java **коваріантні**: якщо `String` є підтипом `Object`, то `String[]` є підтипом `Object[]`. Це дозволяє писати методи на кшталт `Arrays.sort(Object[])`, але порушує безпеку типів, яку доводиться перевіряти під час виконання:

```java
String[] strings = {"a", "b"};
Object[] objects = strings;          // OK: коваріантність
objects[0] = 42;                     // ArrayStoreException: масив пам'ятає, що він String[]
```

Кожен запис у масив посилань перевіряє фактичний тип елемента. Узагальнені колекції (`List<String>`) **інваріантні** і такі помилки ловлять ще під час компіляції (розділ «Generics»).

## Багатовимірні масиви

У Java немає окремого типу прямокутних масивів. `int[][]` — це **масив масивів** (jagged array): кожен рядок — окремий об'єкт, і рядки можуть мати різну довжину.

```java
float[][] identity = {
        {1, 0, 0},
        {0, 1, 0},
        {0, 0, 1}
};

float[][] m3x4 = new float[3][4];            // 3 рядки по 4 елементи
int[][] triangle = new int[4][];             // рядки ще не створено: [null, null, null, null]
for (int i = 0; i < triangle.length; i++) {
    triangle[i] = new int[i + 1];            // довжини 1, 2, 3, 4
}

for (int i = 0; i < identity.length; i++) {
    for (int j = 0; j < identity[i].length; j++) {
        System.out.printf("m[%d][%d] = %.1f%n", i, j, identity[i][j]);
    }
}
System.out.println(Arrays.deepToString(identity));
```

```text
identity ──► ┌───┐
             │ ● ┼──► [1, 0, 0]
             │ ● ┼──► [0, 1, 0]
             │ ● ┼──► [0, 0, 1]
             └───┘
```

Для великих числових матриць, де важлива швидкість, часто використовують **одновимірний** масив і обчислюють індекс вручну: `data[i * cols + j]`. Так усі дані лежать суцільним блоком і краще використовують кеш процесора.

## Змінна кількість аргументів (varargs)

Метод може приймати змінну кількість аргументів одного типу. Усередині методу такий параметр — звичайний масив:

```java
static int sum(int... numbers) {          // numbers має тип int[]
    int total = 0;
    for (int n : numbers) total += n;
    return total;
}

sum();                    // 0: порожній масив
sum(1, 2, 3);             // 6
sum(new int[] {4, 5});    // 9: можна передати масив напряму
```

Параметр varargs має бути **останнім** у списку параметрів. Детальніше — на сторінці «Параметри методів».
