// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "06-iterators": [
    {
      "question": "What happens if you call list.remove(x) inside a for-each loop over an ArrayList?",
      "options": [
        "The element is silently removed",
        "A ConcurrentModificationException on the next iteration step",
        "A compile-time error",
        "The loop starts over"
      ],
      "answer": 1,
      "explanation": "The iterators of standard collections are fail-fast. Remove elements with iterator.remove() or removeIf()."
    }
  ],
  "06-collections": [
    {
      "question": "Which comparator sorts students by year, and by name when the year is the same?",
      "options": [
        "Comparator.comparing(Student::name).thenComparing(Student::year)",
        "Comparator.comparingInt(Student::year).thenComparing(Student::name)",
        "Comparator.comparingInt(Student::year).reversed()",
        "(a, b) -> a.year() - b.name()"
      ],
      "answer": 1,
      "explanation": "comparing sets the first criterion, and thenComparing is used only when the first criterion is equal."
    },
    {
      "question": "Which collection is the best choice for frequent contains() checks among a million strings?",
      "options": [
        "ArrayList",
        "LinkedList",
        "HashSet",
        "ArrayDeque"
      ],
      "answer": 2,
      "explanation": "HashSet.contains works in O(1) on average. In lists it is O(n), because the elements have to be scanned one by one."
    },
    {
      "question": "What does counts.merge(word, 1, Integer::sum) do?",
      "options": [
        "Always sets 1",
        "If the key is absent it puts 1, if it is present it puts old_value + 1",
        "Throws an exception for a new key",
        "Merges two maps"
      ],
      "answer": 1,
      "explanation": "merge is the shortest way to count frequencies. For a new key it puts the given value, and for an existing one it applies the merge function."
    }
  ],
  "06-streams": [
    {
      "question": "What happens after two calls of a terminal operation on the same Stream?",
      "options": [
        "The computation runs twice",
        "The second call returns an empty result",
        "IllegalStateException: stream has already been operated upon or closed",
        "A compile-time error"
      ],
      "answer": 2,
      "explanation": "A Java Stream is single-use. To traverse again, create a new stream from the source, e.g. call list.stream() once more."
    },
    {
      "question": "Which call groups orders by customer and counts the number of orders?",
      "options": [
        "collect(toMap(Order::customer, 1))",
        "collect(groupingBy(Order::customer, counting()))",
        "collect(partitioningBy(Order::customer))",
        "map(Order::customer).count()"
      ],
      "answer": 1,
      "explanation": "groupingBy with the counting() downstream collector gives a Map<String, Long>."
    }
  ]
}
