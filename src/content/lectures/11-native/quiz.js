// Self-check questions, keyed by page id (see ../index.js)
export default {
  "11-foreign-memory": [
    {
      "question": "Що робить buffer.flip()?",
      "options": [
        "Змінює порядок байтів",
        "Встановлює limit = position і position = 0, тобто перемикає буфер із запису на читання",
        "Очищає дані",
        "Копіює буфер"
      ],
      "answer": 1,
      "explanation": "Після запису position вказує на кінець даних. flip() робить ці дані доступними для читання від початку."
    },
    {
      "question": "Чому FFM API безпечніший за sun.misc.Unsafe?",
      "options": [
        "Він повільніший",
        "Перевіряє межі сегмента і час життя арени: помилка дає виняток, а не падіння JVM",
        "Він не дозволяє записувати в пам'ять",
        "Він працює лише з купою"
      ],
      "answer": 1,
      "explanation": "Вихід за межі дає IndexOutOfBoundsException, а доступ після закриття арени — IllegalStateException. Unsafe за таких помилок просто «кладе» процес."
    },
    {
      "question": "Коли звільняється пам'ять, виділена в Arena.ofConfined()?",
      "options": [
        "Коли спрацює GC",
        "Під час виклику arena.close() (зазвичай наприкінці try-with-resources)",
        "Ніколи",
        "Після кожного доступу"
      ],
      "answer": 1,
      "explanation": "Confined- і shared-арени звільняються детерміновано під час close(). Arena.ofAuto() звільняє пам'ять через GC, а Arena.global() — ніколи."
    },
    {
      "question": "Який порядок байтів має ByteBuffer за замовчуванням?",
      "options": [
        "LITTLE_ENDIAN",
        "BIG_ENDIAN",
        "Нативний порядок процесора",
        "Випадковий"
      ],
      "answer": 1,
      "explanation": "За замовчуванням використовується BIG_ENDIAN (мережевий порядок), незалежно від процесора. Змінити його можна через order(ByteOrder.LITTLE_ENDIAN)."
    }
  ],
  "11-foreign-functions": [
    {
      "question": "Чим Linker API (FFM) кращий за JNI?",
      "options": [
        "Він працює лише на Linux",
        "Не потребує написання та компіляції C-«клею»: функцію описує Java-дескриптор",
        "Він повільніший, зате безпечніший",
        "Він дозволяє викликати лише Java-код"
      ],
      "answer": 1,
      "explanation": "downcallHandle будує MethodHandle до нативної функції прямо в Java. JNI вимагає окремої C-бібліотеки під кожну платформу."
    }
  ]
}
