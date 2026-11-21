// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "12-introduction": [
    {
      "question": "What does volatile guarantee?",
      "options": [
        "Atomicity of count++",
        "Visibility of writes to other threads and no reordering around the variable",
        "Mutual exclusion",
        "That the variable lives on the stack"
      ],
      "answer": 1,
      "explanation": "volatile does not make compound operations atomic. count++ needs an AtomicInteger or a lock."
    },
    {
      "question": "Why does value++ in two threads give a smaller result than expected?",
      "options": [
        "Because of the garbage collector",
        "++ consists of three steps (read, add, write), and the threads overwrite each other's updates",
        "An int cannot hold large numbers",
        "The threads run sequentially"
      ],
      "answer": 1,
      "explanation": "This is a classic data race. Protect the operation with synchronized or use an AtomicInteger."
    }
  ],
  "12-exclusive-locking": [
    {
      "question": "Why is unlock() called in finally?",
      "options": [
        "It is faster",
        "So that the lock is released even if an exception occurs in the critical section",
        "The compiler requires it",
        "To avoid the GC"
      ],
      "answer": 1,
      "explanation": "Unlike synchronized, a ReentrantLock does not release itself. If an exception escapes before unlock(), other threads will wait forever."
    },
    {
      "question": "Two threads transfer money A→B and B→A, each locking from first, then to. What can happen and how do you fix it?",
      "options": [
        "Nothing bad",
        "A deadlock; the fix is to lock accounts in a global order (e.g. by id)",
        "Money is lost; the fix is volatile",
        "A stack overflow"
      ],
      "answer": 1,
      "explanation": "Circular waiting is one of the four conditions of a deadlock. A single lock acquisition order breaks the cycle."
    }
  ],
  "12-signaling": [
    {
      "question": "Why are await()/wait() called in a while loop rather than an if?",
      "options": [
        "It is a matter of style",
        "Spurious wakeups are possible, and another thread may already have changed the condition",
        "if does not compile",
        "while is faster"
      ],
      "answer": 1,
      "explanation": "After waking up, the condition must be checked again: other threads may have \"taken\" it, or the wakeup may have been spurious."
    },
    {
      "question": "Which primitive should you choose so that the main thread waits for three services to finish initializing?",
      "options": [
        "Semaphore(3)",
        "CountDownLatch(3)",
        "ReentrantLock",
        "Exchanger"
      ],
      "answer": 1,
      "explanation": "Each service calls countDown(), and the main thread waits in await() until the counter reaches zero."
    }
  ],
  "12-concurrent-collections": [
    {
      "question": "Why is if (!map.containsKey(k)) map.put(k, v) incorrect for a ConcurrentHashMap?",
      "options": [
        "ConcurrentHashMap has no containsKey",
        "Between the check and the insertion another thread may insert the same key; an atomic putIfAbsent or computeIfAbsent is needed",
        "put throws an exception",
        "This code is correct"
      ],
      "answer": 1,
      "explanation": "Each method on its own is thread-safe, but a sequence of them is not. Use atomic compound operations."
    },
    {
      "question": "What does BlockingQueue.take() do on an empty queue?",
      "options": [
        "Returns null",
        "Throws NoSuchElementException",
        "Blocks the thread until an element appears",
        "Returns Optional.empty()"
      ],
      "answer": 2,
      "explanation": "take/put block, while poll/offer return null/false or wait until a timeout. This makes the producer–consumer pattern easy to implement."
    }
  ],
  "12-shared-locking": [
    {
      "question": "What happens if a thread holding the read lock of a ReentrantReadWriteLock calls writeLock().lock()?",
      "options": [
        "The lock is upgraded to a write lock",
        "The thread blocks itself: the writer waits until all readers release, including itself",
        "An IllegalMonitorStateException",
        "The read lock is released automatically"
      ],
      "answer": 1,
      "explanation": "Upgrading is not supported. First release the read lock, then acquire the write lock and recheck the condition."
    }
  ]
}
