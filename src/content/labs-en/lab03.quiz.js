export default {
  "Lab03": [
    {
      "question": "Why must SparseMatrix.set(r, c, 0.0) remove the entry from the map?",
      "options": [
        "A HashMap cannot store 0.0",
        "So that only non-zero elements are stored: then the memory and the running time of norm/transpose are proportional to K, and equals/hashCode are consistent",
        "Java requires it",
        "To speed up get"
      ],
      "answer": 1,
      "explanation": "Explicitly stored zeros would break the invariant \"the map holds only non-zero elements\" and spoil both nonZeroCount and the O(K) complexity."
    },
    {
      "question": "What is the getInstance method in the base class for?",
      "options": [
        "To implement a Singleton",
        "So that the shared operations in Matrix create a result of the same type as this, without knowing the concrete subclasses",
        "To copy the matrix",
        "It is not needed"
      ],
      "answer": 1,
      "explanation": "This is Template Method / Factory Method: the base class defines the algorithm and delegates creating the concrete object to the subclass."
    },
    {
      "question": "Why is equals for matrices implemented in Matrix through get, rather than with getClass() and comparing fields?",
      "options": [
        "It is faster",
        "So that a dense and a sparse matrix with the same values are considered equal: equality is determined by the values, not by the storage method",
        "getClass() does not work with abstract classes",
        "The compiler requires it"
      ],
      "answer": 1,
      "explanation": "Then hashCode must also depend only on the values, otherwise equal objects end up in different HashSet buckets."
    }
  ]
}
