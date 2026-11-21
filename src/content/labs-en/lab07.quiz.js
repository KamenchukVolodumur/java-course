export default {
  "Lab07": [
    {
      "question": "Why will TestRunner not see a @Test annotation declared without @Retention?",
      "options": [
        "Because the default Retention is SOURCE",
        "Because the default Retention is CLASS: the annotation is in the bytecode, but not available to reflection at run time",
        "Because annotations on methods are invisible altogether",
        "It will see it"
      ],
      "answer": 1,
      "explanation": "Reading through getAnnotation requires RetentionPolicy.RUNTIME."
    },
    {
      "question": "What does getCause() return for an InvocationTargetException from Method.invoke?",
      "options": ["null", "The real exception thrown by the invoked method", "IllegalAccessException", "The same InvocationTargetException"],
      "answer": 1,
      "explanation": "Reflection wraps the method's exception to distinguish it from errors of reflection itself (wrong arguments, no access)."
    },
    {
      "question": "Why does cached(logging(real)) not log the repeated call price(\"tea\")?",
      "options": [
        "The log is full",
        "The outer caching proxy returns the stored result and does not call the inner logging proxy at all",
        "Logging is turned off for double",
        "Because of a bug in Proxy"
      ],
      "answer": 1,
      "explanation": "Proxies are layered like decorators: the wrapping order determines the behavior."
    },
    {
      "question": "How do you check that a class c implements the Plugin interface?",
      "options": ["c instanceof Plugin", "Plugin.class.isAssignableFrom(c)", "c.getName().contains(\"Plugin\")", "c.isInterface()"],
      "answer": 1,
      "explanation": "instanceof works with objects, not with a Class. isAssignableFrom answers whether an instance of c can be assigned to a variable of type Plugin."
    }
  ]
}
