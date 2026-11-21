export default {
  "Lab11": [
    {
      "question": "Why is the price passed to Builder.item as a string (\"45.50\") and not as a double?",
      "options": [
        "It is shorter",
        "new BigDecimal(45.50) from a double carries the binary error over; from a string BigDecimal is exact",
        "BigDecimal has no constructor taking a double",
        "The Builder pattern requires it"
      ],
      "answer": 1,
      "explanation": "new BigDecimal(0.1) equals 0.1000000000000000055511151231257827... For money use a string or BigDecimal.valueOf."
    },
    {
      "question": "What is the advantage of a Map<String, DiscountPolicy> for promo codes over a switch?",
      "options": [
        "A map is faster",
        "A new promo code is a new entry, and the existing code does not change (OCP); the map can be loaded from configuration",
        "switch does not work with strings",
        "There is no advantage"
      ],
      "answer": 1,
      "explanation": "Data instead of code: the strategy registry can be extended without recompiling the selection logic."
    },
    {
      "question": "Why does the result differ between new Insurance(new GiftWrap(base)) and new GiftWrap(new Insurance(base))?",
      "options": [
        "It does not differ",
        "Each decorator computes from the price of the inner layer: in the first variant insurance is charged on the gift wrap too",
        "Because of BigDecimal rounding",
        "Because of the order of fields in the record"
      ],
      "answer": 1,
      "explanation": "Decorators form a pipeline, and the order of the layers is part of the business rules."
    },
    {
      "question": "The warehouse threw an exception in onPlaced. What should the event bus do in this lab?",
      "options": [
        "Stop the dispatch and cancel the order",
        "Record the error in errors() and continue dispatching to the other listeners",
        "Ignore the exception without a trace",
        "Restart the application"
      ],
      "answer": 1,
      "explanation": "One broken listener should not block the others. But the error must stay visible so that it can be handled."
    }
  ]
}
