export default {
  "Lab02": [
    {
      "question": "What is the dependencyManagement section in a parent POM for?",
      "options": [
        "It automatically adds the dependencies to all modules",
        "It sets the versions in one place; the modules declare a dependency without a version",
        "It turns off transitive dependencies",
        "It is needed only for plugins"
      ],
      "answer": 1,
      "explanation": "dependencyManagement only pins versions. For a dependency to appear in a module, it must be declared in that module's <dependencies>."
    },
    {
      "question": "What does <scope>test</scope> mean in the JUnit dependency?",
      "options": [
        "JUnit will be in the final JAR",
        "The dependency is available only for compiling and running tests and does not end up on the main classpath",
        "Tests run only in the IDE",
        "JUnit is downloaded from the internet on every run"
      ],
      "answer": 1,
      "explanation": "The code in src/main/java does not see test dependencies, and they do not end up in the artifact."
    },
    {
      "question": "Why should Statistics.median sort a copy of the array rather than the array itself?",
      "options": [
        "Sorting a copy is faster",
        "A method should not have unexpected side effects: the caller does not expect its data to change",
        "Arrays.sort does not work with parameters",
        "JUnit requires it"
      ],
      "answer": 1,
      "explanation": "The array is passed by reference (a copy of the reference), so sorting in place would change the data of whoever called the method."
    }
  ]
}
