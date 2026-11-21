// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "04-inheritance": [
    {
      "question": "Object x = \"hello\"; there are overloads print(Object) and print(String). Which one is called for print(x)?",
      "options": [
        "print(String), because the object really is a string",
        "print(Object), because an overload is chosen by the static type at compile time",
        "A compile-time error because of ambiguity",
        "Both"
      ],
      "answer": 1,
      "explanation": "Overloading is resolved statically, while overriding is resolved dynamically. The static type of x is Object."
    }
  ],
  "04-nested-types": [
    {
      "question": "How does an inner class differ from a static nested class?",
      "options": [
        "An inner class has access to the non-static members of the outer instance via Outer.this, while a static nested class does not",
        "A static nested class extends the outer class",
        "An inner class can only be declared in an interface",
        "There is no difference"
      ],
      "answer": 0,
      "explanation": "An inner class is bound to an instance of the outer class and holds a hidden reference to it. A static nested class behaves like an ordinary top-level class, only nested in the outer one's namespace."
    }
  ],
  "04-generics": [
    {
      "question": "What is type erasure?",
      "options": [
        "Removing unused classes by the garbage collector",
        "The compiler checks generics, and in bytecode replaces type parameters with Object or the upper bound",
        "Converting primitives into wrappers",
        "A JIT optimization"
      ],
      "answer": 1,
      "explanation": "At run time List<String> and List<Integer> are the same List class. That is why you cannot write new T(), new T[] or instanceof List<String>."
    },
    {
      "question": "A method only reads numbers from a collection. Which parameter type is the most flexible?",
      "options": [
        "List<Number>",
        "Collection<? super Number>",
        "Collection<? extends Number>",
        "List<Object>"
      ],
      "answer": 2,
      "explanation": "PECS: the collection supplies (produces) values, so we use extends. Then List<Integer>, Set<Double> and so on will fit."
    }
  ]
}
