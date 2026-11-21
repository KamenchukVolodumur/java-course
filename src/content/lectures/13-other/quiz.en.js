// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "13-annotation-processors": [
    {
      "question": "What can annotation processors from the standard API do?",
      "options": [
        "Modify the bytecode of existing classes",
        "Generate new source files and report compilation errors",
        "Work while the program runs",
        "Change method bodies"
      ],
      "answer": 1,
      "explanation": "Through the Filer a processor creates new files, and through the Messager it prints warnings and errors. The standard API does not allow changing existing code."
    }
  ],
  "13-jvm-gc": [
    {
      "question": "Which of these is NOT a GC root?",
      "options": [
        "A local variable on the stack of an active thread",
        "A static field of a loaded class",
        "An object referenced only by another unreachable object",
        "A monitor held by a thread"
      ],
      "answer": 2,
      "explanation": "Unreachable objects, even those linked by circular references, are garbage. The GC looks for reachability from the roots rather than counting references."
    },
    {
      "question": "What is the division of the heap into Young and Old based on?",
      "options": [
        "On the size of objects",
        "On the generational hypothesis: most objects die young, so Young is collected often and cheaply",
        "On the type of objects",
        "On the number of threads"
      ],
      "answer": 1,
      "explanation": "A Minor GC copies only the live objects from Eden. If almost all objects are dead, the collection is very fast."
    },
    {
      "question": "Which collector should you choose for a 64 GB heap if pauses must stay under 1 ms?",
      "options": [
        "Serial",
        "Parallel",
        "ZGC",
        "Epsilon"
      ],
      "answer": 2,
      "explanation": "ZGC does almost all of its work concurrently with the program, and its pauses do not depend on the heap size."
    },
    {
      "question": "Which error does infinite recursion cause?",
      "options": [
        "OutOfMemoryError: Java heap space",
        "StackOverflowError",
        "OutOfMemoryError: Metaspace",
        "NullPointerException"
      ],
      "answer": 1,
      "explanation": "Each call adds a frame to the thread's stack, and the stack size is limited (-Xss)."
    },
    {
      "question": "What is the main limitation of GraalVM Native Image?",
      "options": [
        "It does not support generics",
        "The closed-world assumption: reflection, proxies and dynamic class loading must be described at build time",
        "It works only on Windows",
        "It has no garbage collector"
      ],
      "answer": 1,
      "explanation": "The AOT compiler must know all the code that may run. Code accessed dynamically is thrown away without configuration."
    },
    {
      "question": "How does WeakHashMap differ from HashMap?",
      "options": [
        "It is thread-safe",
        "The keys are held by weak references: an entry disappears when no strong references to the key remain",
        "It is sorted",
        "It does not allow null"
      ],
      "answer": 1,
      "explanation": "This is convenient for metadata attached to other people's objects: the map does not prevent the GC from collecting them."
    }
  ]
}
