// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "14-testing": [
    {
      "question": "How many instances of a test class does JUnit 5 create (by default) for a class with five @Test methods?",
      "options": ["1", "5", "0: the methods are static", "It depends on the IDE"],
      "answer": 1,
      "explanation": "By default (PER_METHOD) each test gets a new instance. This way fields do not carry state between tests."
    },
    {
      "question": "How do you check that a method throws an IllegalArgumentException?",
      "options": [
        "try/catch and System.out.println",
        "assertThrows(IllegalArgumentException.class, () -> method())",
        "@Test(expected = ...) in JUnit 5",
        "assertEquals(exception, method())"
      ],
      "answer": 1,
      "explanation": "assertThrows returns the caught exception, so its message can be checked as well. The expected attribute existed in JUnit 4."
    },
    {
      "question": "Why should a service receive an OrderRepository through its constructor instead of creating it inside?",
      "options": [
        "It is faster",
        "So that tests can substitute a fake implementation and the service does not depend on a specific storage",
        "Java requires it",
        "To write less code"
      ],
      "answer": 1,
      "explanation": "Dependency injection makes dependencies explicit and allows replacing them in tests (fakes, mocks) or in production (another database)."
    },
    {
      "question": "What does the R in the FIRST principles stand for?",
      "options": ["Readable", "Repeatable: the same result on every run", "Refactored", "Remote"],
      "answer": 1,
      "explanation": "A test must not depend on the current time, random numbers without a seed, the network or the order of other tests."
    },
    {
      "question": "Test coverage is 100%. What follows from this?",
      "options": [
        "The code has no bugs",
        "Every line has been executed at least once; it says nothing about the quality of the checks",
        "Tests are not needed",
        "The code is optimal"
      ],
      "answer": 1,
      "explanation": "A test without an assert gives coverage, but checks nothing. Coverage is a useful but insufficient metric."
    }
  ],
  "14-solid-patterns": [
    {
      "question": "Which SOLID principle says that a class should have only one reason to change?",
      "options": ["Open/Closed Principle", "Single Responsibility Principle", "Liskov Substitution Principle", "Dependency Inversion Principle"],
      "answer": 1,
      "explanation": "SRP: a class is responsible for one clearly defined thing. If there are several reasons to change, the class should be split."
    },
    {
      "question": "What is Dependency Injection?",
      "options": [
        "Creating dependencies inside a class with new",
        "A technique in which an object does not create its dependencies itself, but receives them from outside (e.g. through the constructor)",
        "Automatically removing objects from memory",
        "Hiding the implementation behind an interface"
      ],
      "answer": 1,
      "explanation": "DI implements the DIP principle: a class declares what it needs, and the implementation is supplied by assembling code or a container (Spring)."
    },
    {
      "question": "Which pattern underlies @Transactional in Spring?",
      "options": ["Observer", "Singleton", "Proxy", "Factory Method"],
      "answer": 2,
      "explanation": "Spring wraps the bean in a proxy that opens a transaction before the method call and finishes it afterwards."
    },
    {
      "question": "How does a Decorator differ from a Proxy?",
      "options": [
        "They are synonyms",
        "A Decorator adds new behavior, while a Proxy controls access to an existing object (lazy initialization, permissions, caching)",
        "A Proxy can have several layers, a Decorator cannot",
        "A Decorator works only with abstract classes"
      ],
      "answer": 1,
      "explanation": "Structurally they are identical: both wrap an object with the same interface. But their intent differs."
    },
    {
      "question": "What in standard Java best illustrates the Strategy pattern?",
      "options": ["System.out.println()", "A Comparator<T> passed to sort()", "StringBuilder", "HashMap"],
      "answer": 1,
      "explanation": "sort() does not know how to compare elements: this algorithm (the strategy) is passed in from outside and can be replaced."
    },
    {
      "question": "Square extends Rectangle and also changes the height in setWidth. Which principle is violated?",
      "options": ["SRP", "OCP", "LSP", "ISP"],
      "answer": 2,
      "explanation": "Code designed for Rectangle breaks when it receives a Square. That is, the subclass is not substitutable for the base class."
    }
  ],
  "14-http-rest": [
    {
      "question": "Which HTTP method should be used to partially update a user profile (only the phone number)?",
      "options": ["POST", "PATCH", "GET", "UPDATE"],
      "answer": 1,
      "explanation": "PATCH modifies part of a resource, while PUT replaces the resource entirely. HTTP has no UPDATE method."
    },
    {
      "question": "A client requested /api/users/999, and no such user exists. Which status code is correct?",
      "options": ["200 OK", "400 Bad Request", "404 Not Found", "500 Internal Server Error"],
      "answer": 2,
      "explanation": "404 means the resource was not found. 400 is an invalid request, 500 an error in the server's code."
    },
    {
      "question": "What does the stateless principle in REST mean?",
      "options": [
        "The server keeps a session for each client",
        "Each request contains all the needed information (e.g. a token), and the server does not rely on a stored session",
        "State is stored only in a cookie on the server",
        "The server has no database"
      ],
      "answer": 1,
      "explanation": "Any server instance can handle any request, so the service is easy to scale horizontally."
    },
    {
      "question": "Which HTTP methods are idempotent?",
      "options": ["Only GET", "GET, PUT, DELETE", "POST and PATCH", "All of them"],
      "answer": 1,
      "explanation": "Repeating a PUT or DELETE leaves the server in the same state. Repeating a POST usually creates another resource."
    },
    {
      "question": "HttpClient.send received a 503 response. What happens?",
      "options": [
        "An IOException is thrown",
        "The method returns an HttpResponse with statusCode() == 503; the status has to be checked by yourself",
        "The request is retried automatically",
        "The program exits"
      ],
      "answer": 1,
      "explanation": "Exceptions are thrown only for network errors and timeouts. An HTTP error status is an ordinary response."
    },
    {
      "question": "Why is @JsonIgnoreProperties(ignoreUnknown = true) used on Forecast?",
      "options": [
        "To speed up parsing",
        "So that deserialization does not fail when the JSON has fields that the record does not have",
        "To ignore null",
        "A record does not work without it"
      ],
      "answer": 1,
      "explanation": "By default Jackson throws an UnrecognizedPropertyException for unknown fields. External APIs often return more data than we need."
    }
  ],
  "14-jdbc": [
    {
      "question": "How do you protect against SQL injection in JDBC?",
      "options": [
        "Escape quotes manually",
        "Use a PreparedStatement with ? parameters, and pass the values with setXxx()",
        "Use a Statement instead of a PreparedStatement",
        "Write SQL in uppercase"
      ],
      "answer": 1,
      "explanation": "The query template and the values are sent to the database separately, so a value is never executed as SQL."
    },
    {
      "question": "What does rs.getInt(\"age\") return if the database holds NULL there?",
      "options": ["null", "0, and rs.wasNull() returns true", "An exception", "-1"],
      "answer": 1,
      "explanation": "A primitive int cannot be null. Check rs.wasNull() or read the value as rs.getObject(\"age\", Integer.class)."
    },
    {
      "question": "Why call conn.setAutoCommit(false) when transferring money?",
      "options": [
        "For performance",
        "So that the debit and the credit execute atomically: either both (commit) or neither (rollback)",
        "To avoid SQL injection",
        "So as not to close the connection"
      ],
      "answer": 1,
      "explanation": "In autocommit mode each UPDATE is a separate transaction. A failure between them would leave the money debited but not credited."
    },
    {
      "question": "How do INNER JOIN and LEFT JOIN differ?",
      "options": [
        "There is no difference",
        "INNER returns only rows with a match in both tables; LEFT returns all rows of the left table and fills the missing data of the right one with NULL",
        "LEFT JOIN is faster",
        "INNER JOIN needs no ON condition"
      ],
      "answer": 1,
      "explanation": "A LEFT JOIN is needed, for example, to also show users without orders."
    },
    {
      "question": "What does a connection pool (HikariCP) do?",
      "options": [
        "Caches query results",
        "Keeps a set of open connections and hands them out repeatedly; close() returns a connection to the pool",
        "Encrypts connections",
        "Generates SQL"
      ],
      "answer": 1,
      "explanation": "Opening a database connection is expensive, so the pool reuses ready connections."
    }
  ],
  "14-logging-mockito": [
    {
      "question": "Why is log.debug(\"User {}\", user) better than log.debug(\"User \" + user)?",
      "options": [
        "It is shorter",
        "The string is formatted only when the DEBUG level is enabled; concatenation always runs",
        "Concatenation does not compile",
        "Placeholders encrypt the data"
      ],
      "answer": 1,
      "explanation": "With the level disabled, a call with {} costs almost nothing: user.toString() is not even called."
    },
    {
      "question": "What does an unconfigured Mockito mock return for the method Optional<User> findById(long)?",
      "options": ["null", "Optional.empty()", "It throws an exception", "A random user"],
      "answer": 1,
      "explanation": "Mockito returns \"empty\" values: null for objects, 0 for numbers, Optional.empty() and empty collections."
    },
    {
      "question": "How do you check that a service saved an order with the correct total that it computed itself?",
      "options": [
        "verify(repo).save(any())",
        "Capture the argument with an ArgumentCaptor and check its fields",
        "when(repo.save(...)).thenReturn(...)",
        "You cannot"
      ],
      "answer": 1,
      "explanation": "An ArgumentCaptor gives access to the object the service passed to the dependency, so its fields can be checked."
    },
    {
      "question": "Why call MDC.clear() in a finally block?",
      "options": [
        "To speed up logging",
        "MDC is tied to a thread, and in a pool the thread will serve the next request; without clearing it, that request inherits someone else's context",
        "SLF4J requires it",
        "To delete the log files"
      ],
      "answer": 1,
      "explanation": "MDC is implemented with a ThreadLocal. Threads in pools live long, so the context \"leaks\" between requests."
    },
    {
      "question": "Which of these should NOT be logged?",
      "options": ["An order id", "A password or an access token", "The execution time of an operation", "The name of a method that failed"],
      "answer": 1,
      "explanation": "Logs are read by many people and systems and are kept for a long time. Secrets and personal data in them are a security incident."
    }
  ],
  "14-docker": [
    {
      "question": "How does an image differ from a container?",
      "options": [
        "They are synonyms",
        "An image is an immutable template, a container is a running instance of an image",
        "A container is a Dockerfile",
        "An image is a running process"
      ],
      "answer": 1,
      "explanation": "Many independent containers can be started from one image, just as many objects can be created from one class."
    },
    {
      "question": "Why, in a multi-stage build, copy pom.xml and download the dependencies BEFORE copying src?",
      "options": [
        "Maven requires it",
        "So that the dependency layer comes from the cache until pom.xml changes; code changes then do not force the libraries to be downloaded again",
        "To make the image larger",
        "So that the tests run faster"
      ],
      "answer": 1,
      "explanation": "Docker caches layers by their contents. Rarely changing steps go higher, frequently changing ones lower."
    },
    {
      "question": "How should the application in the app container reach the database from the db service in Docker Compose?",
      "options": ["localhost:5432", "db:5432 — by the service name", "127.0.0.1:5432", "host.docker.internal"],
      "answer": 1,
      "explanation": "Compose creates a shared network with DNS by service names. localhost in a container points to the container itself."
    },
    {
      "question": "What is the best way to set the JVM heap size in a container?",
      "options": [
        "Always -Xmx8g",
        "As a percentage of the container limit: -XX:MaxRAMPercentage=75",
        "Do not set it and use --memory=unlimited",
        "Through System.gc()"
      ],
      "answer": 1,
      "explanation": "The JVM sees the cgroups limit. A percentage leaves room for the metaspace, stacks and direct memory and adapts to different limits."
    },
    {
      "question": "Why does the database service need a volume?",
      "options": [
        "For performance",
        "So that the data persists after the container is stopped or deleted",
        "For network access",
        "It is not needed"
      ],
      "answer": 1,
      "explanation": "A container's file system is temporary. Without a volume, the database would be empty after docker compose down."
    }
  ],
  "14-patterns-practice": [
    {
      "question": "A class constructor has 12 optional parameters. Which pattern fits best?",
      "options": [
        "Singleton",
        "Factory Method",
        "Builder: only the needed parameters are set, by name, and the rest take default values",
        "Observer"
      ],
      "answer": 2,
      "explanation": "A Builder solves the telescoping constructor problem: instead of a pile of overloads — a chain of calls with parameter names."
    },
    {
      "question": "What is over-engineering and how do you avoid it?",
      "options": [
        "Solutions that are too simple; avoid it by adding abstractions",
        "Abstractions and patterns \"just in case\" without a real need; avoid it with the rule of three: abstract when real repetition has appeared",
        "A lack of tests",
        "Using new Java versions"
      ],
      "answer": 1,
      "explanation": "Six classes and three interfaces to send one e-mail only waste the team's time. A simple solution is better until there is a real need for an abstraction."
    },
    {
      "question": "Which combination of patterns is most common in Spring Boot?",
      "options": [
        "Builder + Template Method",
        "Singleton (beans) + Proxy (@Transactional) + Observer (@EventListener) + Strategy (injecting interfaces)",
        "Only Factory Method",
        "Adapter + Decorator"
      ],
      "answer": 1,
      "explanation": "Whoever understands these patterns understands how Spring works \"under the hood\"."
    },
    {
      "question": "Why is a singleton with mutable state an anti-pattern?",
      "options": [
        "A singleton cannot have instance fields",
        "It is too slow",
        "Global mutable state makes tests depend on their run order, and in multithreaded code it causes data races",
        "The GC cannot remove it"
      ],
      "answer": 2,
      "explanation": "A safe singleton is stateless or immutable."
    },
    {
      "question": "What is the price of using an Observer/EventBus?",
      "options": [
        "The code becomes 10 times slower",
        "The control flow becomes implicit: the code publishing an event does not show who will do what with it",
        "Lambdas cannot be used",
        "There is no price"
      ],
      "answer": 1,
      "explanation": "Loose coupling makes the logic harder to trace. That is why you should not move into events what must execute together with the main operation."
    }
  ]
}
