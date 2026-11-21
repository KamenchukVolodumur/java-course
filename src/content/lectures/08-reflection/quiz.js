// Self-check questions, keyed by page id (see ../index.js)
export default {
  "08-annotations": [
    {
      "question": "Яку політику Retention треба вказати для анотації, яку читатимемо через рефлексію?",
      "options": [
        "SOURCE",
        "CLASS",
        "RUNTIME",
        "Будь-яку"
      ],
      "answer": 2,
      "explanation": "Лише RUNTIME-анотації доступні під час виконання через getAnnotation(). CLASS є політикою за замовчуванням: така анотація є в байт-коді, але рефлексія її не бачить."
    }
  ],
  "08-reflection": [
    {
      "question": "Тестовий метод, викликаний через Method.invoke, кинув IllegalStateException. Що отримає викликач?",
      "options": [
        "IllegalStateException",
        "InvocationTargetException, у якого getCause() — це IllegalStateException",
        "ReflectiveOperationException без причини",
        "Нічого: винятки поглинаються"
      ],
      "answer": 1,
      "explanation": "Рефлексія загортає винятки викликаного методу в InvocationTargetException. Справжню причину дістають через getCause()."
    },
    {
      "question": "Чим getDeclaredMethods() відрізняється від getMethods()?",
      "options": [
        "Нічим",
        "getDeclaredMethods — усі методи цього класу (включно з private), getMethods — лише public, включно з успадкованими",
        "getMethods повертає лише статичні методи",
        "getDeclaredMethods повертає лише абстрактні методи"
      ],
      "answer": 1,
      "explanation": "Declared означає «оголошені саме в цьому класі»: з усіма модифікаторами, але без успадкованих."
    },
    {
      "question": "Які типи можна обгорнути JDK-проксі (Proxy.newProxyInstance)?",
      "options": [
        "Будь-які класи",
        "Лише інтерфейси",
        "Лише final-класи",
        "Лише records"
      ],
      "answer": 1,
      "explanation": "JDK-проксі генерує клас, який реалізує вказані інтерфейси. Для звичайних класів потрібні бібліотеки, що генерують байт-код (ByteBuddy, cglib)."
    }
  ]
}
