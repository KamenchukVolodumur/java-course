export default {
  "Lab10": [
    {
      "question": "Why is the debit done with one UPDATE ... WHERE balance >= ? and not with SELECT + a check in Java + UPDATE?",
      "options": [
        "It is shorter",
        "The check and the change become atomic in the database; between the SELECT and the UPDATE a parallel transfer could change the balance",
        "SELECT does not work in transactions",
        "H2 requires it"
      ],
      "answer": 1,
      "explanation": "This is check-then-act at the database level. The condition in the UPDATE plus checking the number of changed rows removes the race."
    },
    {
      "question": "Why does the repository throw an unchecked DataAccessException instead of SQLException?",
      "options": [
        "SQLException is deprecated",
        "So that the service layer does not depend on JDBC details: it works with the ClientRepository interface, and the implementation can be anything",
        "Unchecked exceptions are faster",
        "Mockito does not support checked exceptions"
      ],
      "answer": 1,
      "explanation": "An abstraction should not \"leak\": SQLException in the interface signature would tie it to JDBC."
    },
    {
      "question": "What does verify(repo, never()).save(any()) check?",
      "options": [
        "That save returns null",
        "That the save method was never called",
        "That save threw an exception",
        "That save was called with null"
      ],
      "answer": 1,
      "explanation": "This is how you check that, for example, a duplicate was not saved. It is worth checking both the result and the absence of side effects."
    },
    {
      "question": "Why is the PESEL masked in the logs?",
      "options": [
        "To make the logs shorter",
        "A PESEL is personal data; logs are read by many people and systems, and they are kept for a long time (GDPR)",
        "Logback does not support digits",
        "It is faster"
      ],
      "answer": 1,
      "explanation": "A few last digits are enough for diagnostics. A full identifier in the logs would be a leak of personal data."
    }
  ]
}
