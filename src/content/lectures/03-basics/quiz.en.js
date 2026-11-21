// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "03-primitive-types": [
    {
      "question": "What does this code print: Integer a = 1000, b = 1000; System.out.println(a == b);",
      "options": [
        "true",
        "false",
        "A compile-time error",
        "NullPointerException"
      ],
      "answer": 1,
      "explanation": "== compares references. Integer.valueOf caches only values from -128 to 127, so two different objects are created for 1000. Compare with equals()."
    },
    {
      "question": "What does this print: System.out.println(Integer.MAX_VALUE + 1);",
      "options": [
        "2147483648",
        "ArithmeticException",
        "-2147483648",
        "A compile-time error"
      ],
      "answer": 2,
      "explanation": "Integer arithmetic in Java silently overflows (wraps around). To get an exception, use Math.addExact."
    }
  ],
  "03-parameters": [
    {
      "question": "A method receives List<String> list and calls list.add(\"x\"). Why is the change visible at the call site, although Java passes parameters by value?",
      "options": [
        "Because objects in Java are passed by reference",
        "Because the copied value is the address of the same object on the heap",
        "Because collections have a special synchronization mechanism",
        "The change will not be visible"
      ],
      "answer": 1,
      "explanation": "The reference is copied, so both variables point to the same object. But assigning list = new ArrayList<>() inside the method no longer affects the variable at the call site."
    }
  ],
  "03-strings": [
    {
      "question": "What does this print: String a = \"hi\"; String b = new String(\"hi\"); System.out.println(a == b);",
      "options": [
        "true",
        "false",
        "A compile-time error",
        "It depends on the JVM"
      ],
      "answer": 1,
      "explanation": "new String creates a separate object outside the pool. The == operator compares references, so the result is false. String contents are compared with equals()."
    }
  ],
  "03-object": [
    {
      "question": "What happens if you override equals() but not hashCode()?",
      "options": [
        "Nothing, hashCode is unrelated to equals",
        "A compile-time error",
        "HashSet and HashMap will work incorrectly: equal objects end up in different buckets",
        "toString() stops working"
      ],
      "answer": 2,
      "explanation": "Hash collections first look up the bucket by hashCode and only then compare with equals. Equal objects with different hashes simply never get that far."
    }
  ],
  "03-statements": [
    {
      "question": "What is the advantage of a switch expression (case X ->) over the classic switch?",
      "options": [
        "It is faster",
        "There is no fall-through, it returns a value and checks exhaustiveness",
        "It works only with strings",
        "It needs a break in every branch"
      ],
      "answer": 1,
      "explanation": "Arrow branches do not \"fall through\", the switch can be used as an expression, and for enums and sealed types the compiler checks that all variants are handled."
    }
  ]
}
