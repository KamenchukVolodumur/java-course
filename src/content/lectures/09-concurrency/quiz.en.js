// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "09-parallel": [
    {
      "question": "Why is stream.parallel().forEach(list::add) with an ArrayList a mistake?",
      "options": [
        "Parallel streams have no forEach",
        "ArrayList is not thread-safe: a data race occurs and elements may be lost",
        "list::add is invalid syntax",
        "It works correctly"
      ],
      "answer": 1,
      "explanation": "Parallel streams must not modify shared state. Collect the result with a collector: collect(toList()) or toList()."
    }
  ],
  "09-threads": [
    {
      "question": "What does calling thread.run() instead of thread.start() do?",
      "options": [
        "Starts a new thread",
        "Runs run() synchronously in the current thread; no new thread is created",
        "Throws an exception",
        "Starts the thread in the background"
      ],
      "answer": 1,
      "explanation": "Only start() creates and starts a new OS thread. run() is an ordinary method."
    },
    {
      "question": "How should an InterruptedException be handled correctly if the method cannot declare throws?",
      "options": [
        "An empty catch",
        "Restore the flag: Thread.currentThread().interrupt() and finish the work",
        "Call Thread.stop()",
        "Restart the thread"
      ],
      "answer": 1,
      "explanation": "Blocking methods clear the flag when they throw the exception. It must be restored so that the code higher up the stack learns about the interruption request."
    }
  ],
  "09-executors-futures": [
    {
      "question": "A task submitted with executor.submit() threw an exception. What happens?",
      "options": [
        "The exception is printed to the console and stops the program",
        "The exception is stored in the Future and thrown from get() as an ExecutionException",
        "The thread pool stops",
        "The exception is ignored forever"
      ],
      "answer": 1,
      "explanation": "submit wraps the task in a FutureTask. If nobody reads the result, the error vanishes without a trace."
    }
  ],
  "09-async-programming": [
    {
      "question": "How does thenCompose differ from thenApply?",
      "options": [
        "There is no difference",
        "thenCompose takes a function that returns a CompletableFuture and \"flattens\" the result; thenApply is an ordinary value transformation",
        "thenCompose runs synchronously",
        "thenApply handles exceptions"
      ],
      "answer": 1,
      "explanation": "The analogy with streams: thenApply is map, and thenCompose is flatMap. Without thenCompose you get a CompletableFuture<CompletableFuture<T>>."
    }
  ],
  "09-virtual-threads": [
    {
      "question": "When do virtual threads give the biggest gain?",
      "options": [
        "For CPU-heavy computations",
        "For a large number of tasks that mostly wait for I/O",
        "For a GUI",
        "Always equally"
      ],
      "answer": 1,
      "explanation": "When blocking, a virtual thread frees its carrier thread, so millions of parallel I/O operations can be kept. For CPU-bound tasks the number of cores does not change."
    }
  ],
  "09-async-sequences": [
    {
      "question": "What is backpressure in the Flow API?",
      "options": [
        "Pressure on the GC",
        "A mechanism by which the subscriber tells the publisher how many elements it is ready to accept (request(n))",
        "Resending after an error",
        "Thread priority"
      ],
      "answer": 1,
      "explanation": "A Publisher is not allowed to send more elements than the subscriber requested with request(n). This way a slow consumer does not drown in data."
    }
  ],
  "09-execution-context": [
    {
      "question": "Why is it worth passing your own executor to supplyAsync for I/O tasks?",
      "options": [
        "Otherwise the task will not run",
        "By default ForkJoinPool.commonPool is used, and blocking in it slows down the parallel streams of the whole program",
        "Your own executor retries requests automatically",
        "The compiler requires it"
      ],
      "answer": 1,
      "explanation": "The commonPool has as many threads as there are cores minus one and is designed for CPU tasks. Blocking I/O quickly exhausts it."
    }
  ]
}
