// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "01-java-platform": [
    {
      "question": "What turns a .java file into a .class file with bytecode?",
      "options": [
        "The JVM",
        "The garbage collector",
        "The javac compiler from the JDK",
        "The C2 JIT compiler"
      ],
      "answer": 2,
      "explanation": "javac compiles source code into bytecode. The JVM executes the bytecode, and the C1/C2 JIT compilers turn hot regions of the bytecode into machine code at run time."
    },
    {
      "question": "What is JIT compilation?",
      "options": [
        "Compiling the whole project before running it",
        "Compiling frequently executed bytecode fragments into machine code while the program runs",
        "Removing unnecessary objects from the heap",
        "Checking bytecode for safety"
      ],
      "answer": 1,
      "explanation": "The JVM collects execution statistics and compiles \"hot\" methods and loops into optimized machine code. That is why Java programs need a warm-up."
    }
  ]
}
