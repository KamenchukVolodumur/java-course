// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "05-null-optional": [
    {
      "question": "Which of these is an anti-pattern of using Optional?",
      "options": [
        "Optional as the return type of a find... method",
        "optional.map(...).orElse(...)",
        "Optional as a class field or a method parameter",
        "optional.orElseThrow()"
      ],
      "answer": 2,
      "explanation": "Optional is meant for method results. As a field or a parameter it only complicates the code and adds yet another possible null."
    }
  ],
  "05-functional-interfaces": [
    {
      "question": "Why does this code not compile: int c = 0; list.forEach(x -> c++);",
      "options": [
        "forEach does not accept lambdas",
        "A lambda can capture only effectively final local variables",
        "c++ cannot be used with an int",
        "You have to write x => c++"
      ],
      "answer": 1,
      "explanation": "Java copies the values of captured local variables into the lambda, so it forbids changing them. Use count(), an AtomicInteger or a class field."
    },
    {
      "question": "What does plus2.andThen(times3).apply(1) return, where plus2 = x -> x + 2 and times3 = x -> x * 3?",
      "options": [
        "5",
        "9",
        "6",
        "7"
      ],
      "answer": 1,
      "explanation": "andThen applies plus2 first (1 + 2 = 3), and then times3 (3 * 3 = 9). compose runs the functions in the reverse order."
    }
  ],
  "05-exceptions": [
    {
      "question": "How do checked exceptions differ from unchecked ones?",
      "options": [
        "The compiler requires checked exceptions to be handled or declared in throws; unchecked ones (RuntimeException) are not",
        "Unchecked exceptions cannot be caught",
        "Checked exceptions are thrown only by the JVM",
        "There is no difference"
      ],
      "answer": 0,
      "explanation": "Subclasses of Exception other than RuntimeException are checked: the compiler verifies that they are handled or declared in throws. RuntimeException and Error are unchecked."
    }
  ],
  "05-resource-management": [
    {
      "question": "In which order are the resources closed: try (var a = ...; var b = ...) { }?",
      "options": [
        "a, then b",
        "b, then a",
        "At the same time",
        "The order is undefined"
      ],
      "answer": 1,
      "explanation": "Resources are closed in the reverse order of creation. b may depend on a, so it is closed first."
    }
  ],
  "05-pattern-matching": [
    {
      "question": "What does a switch with case Integer i when i > 0 -> \"A\"; case Integer i -> \"B\"; return for the value -5?",
      "options": [
        "A",
        "B",
        "A compile-time error",
        "MatchException"
      ],
      "answer": 1,
      "explanation": "Branches are checked in order. The guard of the first branch is false, so the second one matches."
    },
    {
      "question": "What does the combination of a sealed interface + records + switch give?",
      "options": [
        "Faster GC",
        "An exhaustiveness check: the compiler requires all subtypes to be handled, and default becomes unnecessary",
        "The ability to change the fields of records",
        "Multiple inheritance of classes"
      ],
      "answer": 1,
      "explanation": "The compiler knows the full list of permitted subtypes of a sealed type, so it can check that the switch covers all variants."
    }
  ]
}
