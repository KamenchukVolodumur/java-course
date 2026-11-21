export default {
  "Lab01": [
    {
      "question": "Which command shows exactly what will go into the next commit?",
      "options": ["git diff", "git diff --staged", "git log", "git status -s"],
      "answer": 1,
      "explanation": "git diff shows uncommitted changes that are not yet staged. git diff --staged shows the changes already added with git add."
    },
    {
      "question": "Why are .class files not committed to the repository?",
      "options": [
        "Git cannot store binary files",
        "They are a build output: they can be reproduced from the code, they clutter the history and cause conflicts",
        "They contain passwords",
        "They must be committed"
      ],
      "answer": 1,
      "explanation": "A repository holds sources. Build artifacts (.class, target/, build/) are added to .gitignore."
    },
    {
      "question": "What do the <<<<<<<, ======= and >>>>>>> markers in a file mean after git merge?",
      "options": [
        "Java syntax",
        "A conflict: both branches changed the same fragment, and it has to be merged manually",
        "A corrupted file",
        "Git comments"
      ],
      "answer": 1,
      "explanation": "Between <<<<<<< and ======= is the current branch's version, and between ======= and >>>>>>> the version of the branch being merged. After editing, the markers are removed and a commit is created."
    }
  ]
}
