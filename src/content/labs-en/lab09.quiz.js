export default {
  "Lab09": [
    {
      "question": "Why does the protocol need the rule \"one JSON object per line\"?",
      "options": [
        "JSON is faster that way",
        "TCP does not preserve message boundaries; the line break is the frame delimiter, and JSON guarantees there is no raw \\n inside a message",
        "ServerSocket requires it",
        "To save traffic"
      ],
      "answer": 1,
      "explanation": "The receiver calls readLine() and gets exactly one message each time, regardless of how TCP split the bytes into packets."
    },
    {
      "question": "Why must the server set the user field of a broadcast Say itself?",
      "options": [
        "To save memory",
        "So that a client cannot forge the sender: only the name verified during Join can be trusted",
        "Jackson requires it",
        "It does not have to"
      ],
      "answer": 1,
      "explanation": "Data from a client is untrusted. The server determines the sender's identity from the connection state."
    },
    {
      "question": "Why must name registration use putIfAbsent and not containsKey + put?",
      "options": [
        "putIfAbsent is shorter",
        "containsKey + put is check-then-act: two clients can pass the check at the same time and both register",
        "containsKey does not work with ConcurrentHashMap",
        "There is no difference"
      ],
      "answer": 1,
      "explanation": "Each method on its own is thread-safe, but their sequence is not. putIfAbsent does the check and the insertion atomically."
    },
    {
      "question": "Why do the two HTTP requests of OpenMeteoProvider (geocoding, then the forecast) use thenCompose?",
      "options": [
        "thenApply does not work with HTTP",
        "The second request itself returns a CompletableFuture; thenCompose \"flattens\" the result instead of producing a CompletableFuture<CompletableFuture<Double>>",
        "thenCompose runs the requests in parallel",
        "HttpClient requires it"
      ],
      "answer": 1,
      "explanation": "thenCompose is flatMap for asynchronous computations: the next step starts when the previous future completes."
    }
  ]
}
