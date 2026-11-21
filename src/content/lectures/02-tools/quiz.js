// Self-check questions, keyed by page id (see ../index.js)
export default {
  "02-build-tools": [
    {
      "question": "Де за конвенцією Maven лежать тести?",
      "options": [
        "src/main/java",
        "src/test/java",
        "test/",
        "target/test"
      ],
      "answer": 1,
      "explanation": "Стандартна структура: src/main/java для коду, src/main/resources для ресурсів, src/test/java для тестів. target/ — результат збирання, його не комітять."
    }
  ]
}
