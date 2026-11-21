// Self-check questions, keyed by page id (see ../index.js)
export default {
  "05-null-optional": [
    {
      "question": "Що з наведеного є антипатерном використання Optional?",
      "options": [
        "Optional як тип результату методу find...",
        "optional.map(...).orElse(...)",
        "Optional як поле класу або параметр методу",
        "optional.orElseThrow()"
      ],
      "answer": 2,
      "explanation": "Optional призначений для результатів методів. Як поле чи параметр він лише ускладнює код і додає ще один можливий null."
    }
  ],
  "05-functional-interfaces": [
    {
      "question": "Чому цей код не скомпілюється: int c = 0; list.forEach(x -> c++);",
      "options": [
        "forEach не приймає лямбд",
        "Лямбда може захоплювати лише effectively final локальні змінні",
        "c++ не можна використовувати з int",
        "Потрібно написати x => c++"
      ],
      "answer": 1,
      "explanation": "Java копіює значення захоплених локальних змінних у лямбду, тому забороняє їх змінювати. Використайте count(), AtomicInteger або поле класу."
    },
    {
      "question": "Що поверне plus2.andThen(times3).apply(1), де plus2 = x -> x + 2, times3 = x -> x * 3?",
      "options": [
        "5",
        "9",
        "6",
        "7"
      ],
      "answer": 1,
      "explanation": "andThen спочатку застосовує plus2 (1 + 2 = 3), а потім times3 (3 * 3 = 9). compose виконує функції у зворотному порядку."
    }
  ],
  "05-exceptions": [
    {
      "question": "Чим checked-винятки відрізняються від unchecked?",
      "options": [
        "Checked-винятки компілятор вимагає обробити або оголосити в throws; unchecked (RuntimeException) — ні",
        "Unchecked-винятки не можна перехопити",
        "Checked-винятки кидає лише JVM",
        "Різниці немає"
      ],
      "answer": 0,
      "explanation": "Підкласи Exception, крім RuntimeException, є checked: компілятор перевіряє, що їх оброблено або оголошено в throws. RuntimeException і Error — unchecked."
    }
  ],
  "05-resource-management": [
    {
      "question": "У якому порядку закриються ресурси: try (var a = ...; var b = ...) { }?",
      "options": [
        "a, потім b",
        "b, потім a",
        "Одночасно",
        "Порядок не визначено"
      ],
      "answer": 1,
      "explanation": "Ресурси закриваються у зворотному порядку створення. b може залежати від a, тому закривається першим."
    }
  ],
  "05-pattern-matching": [
    {
      "question": "Що виведе switch з case Integer i when i > 0 -> \"A\"; case Integer i -> \"B\"; для значення -5?",
      "options": [
        "A",
        "B",
        "Помилка компіляції",
        "MatchException"
      ],
      "answer": 1,
      "explanation": "Гілки перевіряються по черзі. Guard-умова першої гілки хибна, тож спрацьовує друга."
    },
    {
      "question": "Що дає поєднання sealed interface + records + switch?",
      "options": [
        "Швидшу роботу GC",
        "Перевірку вичерпності: компілятор вимагає обробити всі підтипи, і default стає непотрібним",
        "Можливість змінювати поля records",
        "Множинне наслідування класів"
      ],
      "answer": 1,
      "explanation": "Компілятор знає повний список дозволених підтипів sealed-типу, тому може перевірити, що switch охоплює всі варіанти."
    }
  ]
}
