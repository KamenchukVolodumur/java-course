---
title: Statements
description: Conditions and loops, labeled break/continue, the classic switch with fall-through, arrow branches and switch expressions, pattern matching in switch, the for-each loop.
---

## Conditions and Loops

The `if`, `for`, `while` and `do-while` statements look the same as in C and C++. The only difference: the condition **must have type `boolean`**. There is no implicit conversion of numbers or references to a boolean value, so `if (x)` for an `int x` or `while (ptr)` does not compile.

```java
if (score >= 90) {
    grade = 'A';
} else if (score >= 75) {
    grade = 'B';
} else {
    grade = 'C';
}

String status = age >= 18 ? "adult" : "minor";   // the ternary operator

for (int i = 0, j = 10; i < j; i++, j--) { }
while (queue.size() > 0) { queue.poll(); }
do {
    line = reader.readLine();
} while (line != null && line.isBlank());    // the body runs at least once
```

> [!WARNING]
> `if (x = 5)` does not compile in Java (the result has type `int`), which protects against the classic C mistake. But for `boolean` the trap remains: `if (done = true)` compiles and is always `true`.

## Labels, break and continue

`break` exits the nearest loop or `switch`, `continue` jumps to the next iteration. To control an **outer** loop from a nested one, the loop is marked with a **label**:

```java
outer:
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] < 0) continue outer;    // next row
        if (matrix[i][j] == target) {
            System.out.println("found at (" + i + ", " + j + ")");
            break outer;                         // leave both loops
        }
    }
}
```

Java has no `goto` statement (the word is reserved but unused).

## The switch Statement

`switch` selects a branch by the value of an expression of type `int` (and smaller integer types), `char`, `String`, an enum or the wrappers of these types. Since Java 21 — by the value of any reference type, using patterns.

### The Classic switch: Fall-Through

In the classic colon syntax, execution **"falls through"** into the next branch unless it is terminated with `break`. This is sometimes used deliberately so that several labels share code, but more often it is a source of bugs.

```java
switch (day) {
    case SATURDAY:
    case SUNDAY:
        System.out.println("weekend");
        break;
    case FRIDAY:
        System.out.println("almost the weekend");
        // forgot break — the next branch runs too!
    default:
        System.out.println("working day");
}
```

### Arrow Branches

The arrow syntax `->` (Java 14) has no fall-through: only one branch runs. Several values are listed separated by commas.

```java
switch (day) {
    case SATURDAY, SUNDAY -> System.out.println("weekend");
    case FRIDAY -> {
        System.out.println("almost the weekend");
        planWeekend();
    }
    default -> System.out.println("working day");
}
```

## The switch Expression

`switch` can be an **expression** that returns a value. Then all possible input values must be handled (**exhaustiveness**): for enums and sealed hierarchies the compiler checks that all variants are listed, and in other cases a `default` branch is required. If a branch is a block, its value is returned with the `yield` keyword.

```java
String cardName = switch (cardNumber) {
    case 13 -> "King";
    case 12 -> "Queen";
    case 11 -> "Jack";
    case 1 -> "Ace";
    default -> {
        if (cardNumber < 2 || cardNumber > 10)
            throw new IllegalArgumentException("Unknown card: " + cardNumber);
        yield "Pip card";
    }
};

int letters = switch (day) {          // no default needed: all enum values are listed
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> 9;
};
```

If a new constant is later added to the enum, a `switch` expression without `default` stops compiling. This way the compiler reminds you of the places that need updating.

> [!NOTE]
> A `switch` expression can also be written with classic `case X:` branches, but then values are returned with `yield` and fall-through remains. The arrow form is more convenient and safer.

## Pattern Matching in switch (Java 21)

Besides constants, `switch` can match **by type** and check an additional condition (a **guard**) after the `when` keyword:

```java
static String describe(Object obj) {
    return switch (obj) {
        case null -> "null";                                       // without this branch — NullPointerException
        case Integer i when i == 0 -> "It's zero";                 // type pattern + guard
        case Integer i -> "Integer " + i;
        case String s -> "String: " + s;
        case LocalDate d when d.getDayOfWeek() == DayOfWeek.MONDAY -> "Monday";
        case int[] arr -> "Array of length " + arr.length;
        default -> "No idea";
    };
}
```

Branches are checked **in order**, and the compiler reports unreachable branches (e.g. if `case Integer i` comes before `case Integer i when ...`). The full list of patterns, including record deconstruction, is on the "Pattern Matching" page.

## The for-each Loop

The for-each loop iterates over the elements of an array or of any object implementing the `Iterable` interface (all standard library collections). What makes an object "iterable" is covered on the "Iterators" page.

```java
int[] array = {0, 1, 2, 3, 4};
for (int i : array) {
    System.out.println(i);
}

for (var name : List.of("Ola", "Jan")) {
    System.out.println(name);
}

for (char c : "foreach".toCharArray()) {   // String itself is not Iterable
    System.out.println(c);
}
```

The loop variable is a **copy** of the element (for primitives) or a reference to the element. Assigning a new value to it does not change the array or collection:

```java
for (int x : array) x *= 2;                    // the array has not changed
for (int i = 0; i < array.length; i++) array[i] *= 2;   // this changes it
```
