// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "11-foreign-memory": [
    {
      "question": "What does buffer.flip() do?",
      "options": [
        "Changes the byte order",
        "Sets limit = position and position = 0, i.e. switches the buffer from writing to reading",
        "Clears the data",
        "Copies the buffer"
      ],
      "answer": 1,
      "explanation": "After writing, position points to the end of the data. flip() makes this data available for reading from the beginning."
    },
    {
      "question": "Why is the FFM API safer than sun.misc.Unsafe?",
      "options": [
        "It is slower",
        "It checks segment bounds and arena lifetimes: a mistake gives an exception, not a JVM crash",
        "It does not allow writing to memory",
        "It works only with the heap"
      ],
      "answer": 1,
      "explanation": "Going out of bounds gives an IndexOutOfBoundsException, and access after the arena is closed an IllegalStateException. With such mistakes Unsafe simply brings the process down."
    },
    {
      "question": "When is memory allocated in Arena.ofConfined() freed?",
      "options": [
        "When the GC runs",
        "When arena.close() is called (usually at the end of try-with-resources)",
        "Never",
        "After every access"
      ],
      "answer": 1,
      "explanation": "Confined and shared arenas are freed deterministically on close(). Arena.ofAuto() frees memory through the GC, and Arena.global() never does."
    },
    {
      "question": "What byte order does a ByteBuffer have by default?",
      "options": [
        "LITTLE_ENDIAN",
        "BIG_ENDIAN",
        "The processor's native order",
        "Random"
      ],
      "answer": 1,
      "explanation": "BIG_ENDIAN (the network order) is used by default, regardless of the processor. It can be changed with order(ByteOrder.LITTLE_ENDIAN)."
    }
  ],
  "11-foreign-functions": [
    {
      "question": "Why is the Linker API (FFM) better than JNI?",
      "options": [
        "It works only on Linux",
        "No C \"glue\" has to be written and compiled: the function is described by a Java descriptor",
        "It is slower, but safer",
        "It can call only Java code"
      ],
      "answer": 1,
      "explanation": "downcallHandle builds a MethodHandle to a native function right in Java. JNI requires a separate C library for each platform."
    }
  ]
}
