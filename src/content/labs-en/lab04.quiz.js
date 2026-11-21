export default {
  "Lab04": [
    {
      "question": "Why is the array in RingBuffer created as (T[]) new Object[capacity]?",
      "options": [
        "It is faster",
        "Because of type erasure new T[n] is impossible: the type T is unknown at run time",
        "An Object[] takes less memory",
        "It is a mistake"
      ],
      "answer": 1,
      "explanation": "At run time T is erased to Object. The cast is safe as long as the array does not \"escape\" outward as a T[]."
    },
    {
      "question": "Which signature allows copying a List<Integer> into both a List<Number> and a List<Object>?",
      "options": [
        "<T> void copy(List<T> src, List<T> dst)",
        "<T> void copy(Iterable<? extends T> src, Collection<? super T> dst)",
        "void copy(List<?> src, List<?> dst)",
        "<T> void copy(Collection<? super T> src, Iterable<? extends T> dst)"
      ],
      "answer": 1,
      "explanation": "PECS: the source is a producer (extends), the destination is a consumer (super)."
    },
    {
      "question": "What does accessOrder = true in the LinkedHashMap constructor do?",
      "options": [
        "Sorts the keys",
        "Every access (get/put) moves the entry to the end, so the least recently used one stays first",
        "Makes the map thread-safe",
        "Forbids null"
      ],
      "answer": 1,
      "explanation": "Together with removeEldestEntry this is a ready-made LRU cache implementation."
    }
  ]
}
