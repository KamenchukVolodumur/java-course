export default {
  "Lab05": [
    {
      "question": "Why can the DoubleSupplier returned from randomInRange use the from parameter after the method has finished?",
      "options": [
        "Because from is a static field",
        "Because the lambda captures (copies) the values of effectively final variables: this is a closure",
        "Because Java keeps the method's stack",
        "It cannot, it is a mistake"
      ],
      "answer": 1,
      "explanation": "The values of captured local variables are copied into the lambda object. That is why they must be effectively final."
    },
    {
      "question": "How do you set a \"default parameter\" samples = 1024 for monteCarloPi in Java?",
      "options": [
        "int samples = 1024 in the signature",
        "Overload the method: the version without samples calls the version with 1024",
        "With an @Default(1024) annotation",
        "Through Optional<Integer>"
      ],
      "answer": 1,
      "explanation": "Java has no default parameters and no named arguments. They are replaced by overloads or the Builder pattern."
    },
    {
      "question": "Which collector splits the plays into two groups: completed and skipped?",
      "options": ["groupingBy(Play::date)", "partitioningBy(predicate, counting())", "toMap(...)", "joining()"],
      "answer": 1,
      "explanation": "partitioningBy always returns a map with two keys (true and false), even if one of the groups is empty."
    },
    {
      "question": "Why is date.toEpochDay() − index the same for the days of one streak of consecutive days?",
      "options": [
        "It is a coincidence",
        "In a streak both the date and the index in the sorted list grow by exactly 1, so the difference is constant; after a gap the date \"jumps\" more than the index",
        "toEpochDay always returns 0",
        "Because of time zones"
      ],
      "answer": 1,
      "explanation": "This classic \"gaps and islands\" technique turns finding streaks into ordinary grouping."
    }
  ]
}
