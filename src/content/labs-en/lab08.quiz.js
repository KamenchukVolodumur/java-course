export default {
  "Lab08": [
    {
      "question": "Why does counter++ from eight threads give less than the expected value?",
      "options": [
        "Because of a slow processor",
        "++ consists of a read, an add and a write; threads overwrite each other's updates (lost update)",
        "Because of the garbage collector",
        "Because of a long overflow"
      ],
      "answer": 1,
      "explanation": "Without atomicity or locking two threads can read the same value and write the same result."
    },
    {
      "question": "At what price does a trade execute when a new BUY at 102 meets a SELL resting at 101?",
      "options": ["102", "101", "101.5", "At the price of the last trade"],
      "answer": 1,
      "explanation": "A trade executes at the price of the order that was already in the book: the buyer agreed to \"up to 102\", and the seller asked 101."
    },
    {
      "question": "Why must checkInvariants read all the counters under one read lock?",
      "options": [
        "It is faster",
        "To get a consistent snapshot: between separate calls another thread can change part of the state",
        "A read lock is not needed",
        "To avoid a deadlock"
      ],
      "answer": 1,
      "explanation": "Each call on its own is thread-safe, but their sequence is not (the same problem as with check-then-act)."
    },
    {
      "question": "Why does each trader have its own Random(seed + i) instead of a shared one?",
      "options": [
        "A Random cannot be created twice",
        "A shared Random synchronizes on every call (slow), and the order in which numbers are drawn depends on the scheduler, so the simulation is not reproducible",
        "ExecutorService requires it",
        "There is no difference"
      ],
      "answer": 1,
      "explanation": "Multithreaded code has ThreadLocalRandom, and when reproducibility is needed, each thread gets its own generator with its own seed."
    }
  ]
}
