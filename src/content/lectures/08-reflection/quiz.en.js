// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "08-annotations": [
    {
      "question": "Which Retention policy must be set for an annotation that will be read through reflection?",
      "options": [
        "SOURCE",
        "CLASS",
        "RUNTIME",
        "Any"
      ],
      "answer": 2,
      "explanation": "Only RUNTIME annotations are available at run time through getAnnotation(). CLASS is the default policy: such an annotation is in the bytecode, but reflection does not see it."
    }
  ],
  "08-reflection": [
    {
      "question": "A test method called through Method.invoke threw an IllegalStateException. What does the caller get?",
      "options": [
        "IllegalStateException",
        "An InvocationTargetException whose getCause() is the IllegalStateException",
        "A ReflectiveOperationException without a cause",
        "Nothing: exceptions are swallowed"
      ],
      "answer": 1,
      "explanation": "Reflection wraps the exceptions of the invoked method in an InvocationTargetException. The real cause is obtained with getCause()."
    },
    {
      "question": "How does getDeclaredMethods() differ from getMethods()?",
      "options": [
        "There is no difference",
        "getDeclaredMethods — all methods of this class (including private ones), getMethods — only public ones, including inherited ones",
        "getMethods returns only static methods",
        "getDeclaredMethods returns only abstract methods"
      ],
      "answer": 1,
      "explanation": "Declared means \"declared in this very class\": with all modifiers, but without inherited ones."
    },
    {
      "question": "Which types can a JDK proxy (Proxy.newProxyInstance) wrap?",
      "options": [
        "Any classes",
        "Only interfaces",
        "Only final classes",
        "Only records"
      ],
      "answer": 1,
      "explanation": "A JDK proxy generates a class implementing the given interfaces. For ordinary classes, libraries that generate bytecode (ByteBuddy, cglib) are needed."
    }
  ]
}
