// Self-check questions, keyed by page id (see ../index.js)
export default {
  "04-inheritance": [
    {
      "question": "Object x = \"hello\"; маємо перевантаження print(Object) і print(String). Яке буде викликано для print(x)?",
      "options": [
        "print(String), бо об'єкт насправді є рядком",
        "print(Object), бо перевантаження обирається за статичним типом під час компіляції",
        "Помилка компіляції через неоднозначність",
        "Обидва"
      ],
      "answer": 1,
      "explanation": "Перевантаження (overloading) обирається статично, а перевизначення (overriding) — динамічно. Статичний тип x — Object."
    }
  ],
  "04-nested-types": [
    {
      "question": "Чим inner class відрізняється від static nested class?",
      "options": [
        "Inner class має доступ до нестатичних членів екземпляра зовнішнього класу через Outer.this, а static nested — ні",
        "Static nested class наслідує зовнішній клас",
        "Inner class можна оголосити лише в інтерфейсі",
        "Нічим"
      ],
      "answer": 0,
      "explanation": "Inner class прив'язаний до екземпляра зовнішнього класу і тримає на нього приховане посилання. Static nested поводиться як звичайний клас верхнього рівня, лише вкладений в область імен зовнішнього."
    }
  ],
  "04-generics": [
    {
      "question": "Що таке стирання типів (type erasure)?",
      "options": [
        "Видалення невикористовуваних класів збирачем сміття",
        "Компілятор перевіряє generics, а в байт-коді параметри типів замінює на Object або на верхню межу",
        "Перетворення примітивів на обгортки",
        "Оптимізація JIT"
      ],
      "answer": 1,
      "explanation": "Під час виконання List<String> і List<Integer> — це той самий клас List. Тому не можна написати new T(), new T[] чи instanceof List<String>."
    },
    {
      "question": "Метод лише читає числа з колекції. Який тип параметра найгнучкіший?",
      "options": [
        "List<Number>",
        "Collection<? super Number>",
        "Collection<? extends Number>",
        "List<Object>"
      ],
      "answer": 2,
      "explanation": "PECS: колекція постачає (producer) значення, тому використовуємо extends. Тоді підійдуть List<Integer>, Set<Double> тощо."
    }
  ]
}
