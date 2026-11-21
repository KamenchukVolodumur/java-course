// Self-check questions, keyed by page id (see ../index.js)
export default {
  "06-iterators": [
    {
      "question": "Що станеться, якщо в циклі for-each по ArrayList викликати list.remove(x)?",
      "options": [
        "Елемент тихо видалиться",
        "ConcurrentModificationException на наступному кроці ітерації",
        "Помилка компіляції",
        "Цикл почнеться спочатку"
      ],
      "answer": 1,
      "explanation": "Ітератори стандартних колекцій fail-fast. Видаляйте через iterator.remove() або removeIf()."
    }
  ],
  "06-collections": [
    {
      "question": "Який компаратор сортує студентів за роком, а за однакового року — за ім'ям?",
      "options": [
        "Comparator.comparing(Student::name).thenComparing(Student::year)",
        "Comparator.comparingInt(Student::year).thenComparing(Student::name)",
        "Comparator.comparingInt(Student::year).reversed()",
        "(a, b) -> a.year() - b.name()"
      ],
      "answer": 1,
      "explanation": "Перший критерій задає comparing, а thenComparing використовується лише за рівності першого критерію."
    },
    {
      "question": "Яка колекція — найкращий вибір для частих перевірок contains() серед мільйона рядків?",
      "options": [
        "ArrayList",
        "LinkedList",
        "HashSet",
        "ArrayDeque"
      ],
      "answer": 2,
      "explanation": "HashSet.contains у середньому працює за O(1). У списках це O(n), бо доводиться переглядати елементи підряд."
    },
    {
      "question": "Що робить counts.merge(word, 1, Integer::sum)?",
      "options": [
        "Завжди встановлює 1",
        "Якщо ключа немає — кладе 1, якщо є — кладе стару_значення + 1",
        "Кидає виняток для нового ключа",
        "Об'єднує дві мапи"
      ],
      "answer": 1,
      "explanation": "merge — найкоротший спосіб порахувати частоти. Для нового ключа він кладе передане значення, а для наявного застосовує функцію злиття."
    }
  ],
  "06-streams": [
    {
      "question": "Що станеться після двох викликів термінальної операції на тому самому Stream?",
      "options": [
        "Обчислення виконається двічі",
        "Другий виклик поверне порожній результат",
        "IllegalStateException: stream has already been operated upon or closed",
        "Помилка компіляції"
      ],
      "answer": 2,
      "explanation": "Stream у Java одноразовий. Для повторного обходу треба створити новий потік з джерела, наприклад ще раз викликати list.stream()."
    },
    {
      "question": "Який виклик згрупує замовлення за клієнтом і порахує кількість замовлень?",
      "options": [
        "collect(toMap(Order::customer, 1))",
        "collect(groupingBy(Order::customer, counting()))",
        "collect(partitioningBy(Order::customer))",
        "map(Order::customer).count()"
      ],
      "answer": 1,
      "explanation": "groupingBy з downstream-колектором counting() дає Map<String, Long>."
    }
  ]
}
