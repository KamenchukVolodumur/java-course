export default {
  "Lab12": [
    {
      "question": "Why does AppConfig.fromEnv take a Map instead of calling System.getenv() inside?",
      "options": [
        "System.getenv() is slow",
        "So that the method can be tested with an arbitrary set of variables without changing the process environment",
        "Docker requires it",
        "There is no difference"
      ],
      "answer": 1,
      "explanation": "The dependency on global state (environment variables) is moved into a parameter. It is the same DI principle, only for configuration."
    },
    {
      "question": "Which status code should be returned when the account has insufficient funds for a transfer?",
      "options": ["400 Bad Request", "404 Not Found", "422 Unprocessable Content", "500 Internal Server Error"],
      "answer": 2,
      "explanation": "The request is syntactically correct, but it cannot be performed because of a business rule. It is not a server error (500)."
    },
    {
      "question": "Why test the repository on PostgreSQL in Testcontainers if the tests already pass on H2?",
      "options": [
        "They are faster",
        "H2 emulates PostgreSQL only partially: the dialect, types and error codes differ, and tests must check what will work in production",
        "H2 does not support transactions",
        "Maven requires it"
      ],
      "answer": 1,
      "explanation": "A test on a \"similar\" database gives a false sense of safety. A container with the same PostgreSQL version as production closes this gap."
    },
    {
      "question": "Why does the application in a container connect to the database at db:5432 and not localhost:5432?",
      "options": [
        "localhost is forbidden in Docker",
        "Each container has its own network namespace: localhost is the container itself, and Compose provides DNS names for the services",
        "Port 5432 is taken",
        "PostgreSQL requires it"
      ],
      "answer": 1,
      "explanation": "Compose creates a shared network in which the services find each other by name."
    }
  ]
}
