---
title: Lab 01: Environment, Git and the First Program
description: Setting up JDK 21 and IntelliJ IDEA, working with Git (commits, branches, merges, conflicts, a remote repository) using the WordStats console utility, which counts the lines, words and most frequent words of a text.
---

## Before You Start

> [!NOTE]
> **Lectures:** 01.1 "Introduction", 02.1 "Git", 03.3 "Strings", 03.4 "Arrays" · **Time:** 3 h · **Points:** 10

This is an introductory lab: its goal is to set up the environment you will work with for the whole semester and to learn how to submit work through Git. In the following classes, especially graded ones, we assume that you are fluent with your environment.

### Rules

* Java **21** (or a newer LTS); the IDE is IntelliJ IDEA (Community is enough) or any other, but no online compilers.
* After **each stage** — a separate commit with a meaningful message.
* Only code **pushed** to your repository by the end of the class is graded.

> [!CAUTION]
> In this lab it is forbidden to use collections (`List`, `Map` etc.) and the Stream API. Only arrays, `String`, `StringBuilder` and loops: practice the basic syntax.

## A Quick Theory Recap

### Git: Three Areas

```text
working directory --git add--> staging (index) --git commit--> repository --git push--> remote
```

| Command | What it does |
| --- | --- |
| `git init` / `git clone URL` | a new / a copied repository |
| `git status` | what has changed |
| `git add file` / `git add -p` | add changes (`-p` — in hunks) |
| `git commit -m "..."` | record them |
| `git log --oneline --graph --all` | the history |
| `git diff` / `git diff --staged` | what has changed / what goes into the commit |
| `git switch -c name` | create a branch and switch to it |
| `git merge name` | merge a branch into the current one |
| `git restore file` | discard uncommitted changes |
| `git commit --amend` | fix the last (not yet pushed!) commit |

### A Good Commit Message

```text
Add counting of the most frequent words (--top N)

Words are compared case-insensitively,
punctuation is ignored.
```

The first line is up to ~50 characters, in the imperative mood. Bad examples: `fix`, `asdf`, `changes`.

### Command-Line Arguments and Standard Input

```java
public static void main(String[] args) throws IOException {
    for (int i = 0; i < args.length; i++) System.out.println(i + ": " + args[i]);

    var in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
    String line;
    while ((line = in.readLine()) != null) { /* process the line */ }
}
```

```bash
java WordStats.java --top 3 < text.txt      # stdin from a file
echo "a b a" | java WordStats.java          # stdin from another command
```

## Stage 1: Setting Up the Environment (1 pt)

1. Install **JDK 21** (e.g. Eclipse Temurin) and check in a terminal:
```bash
java -version
javac -version
git --version
```
2. Configure Git (once per computer):
```bash
git config --global user.name "First Last"
git config --global user.email "your@email"
git config --global init.defaultBranch main
git config --global core.autocrlf input     # on Windows: true
```
3. Create an **SSH key** and add its public part to your GitHub/GitLab account:
```bash
ssh-keygen -t ed25519 -C "your@email"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com            # a check
```
4. Clone the repository assigned to you for the labs (or create an empty one and clone it).
5. In IntelliJ: *File → Project Structure → SDK* — choose JDK 21.

> [!TIP]
> If SSH is blocked on the university network, use HTTPS with a Personal Access Token instead of a password.

## Stage 2: WordStats — Basic Counting (3 pts)

In the `lab01/` directory of your repository, create the file `WordStats.java` (without a package). The program reads text from **standard input** until the end of the stream and prints statistics.

* **Lines** — the number of input lines.
* **Words** — sequences of characters separated by whitespace (`String.split("\\s+")`; empty fragments are not counted).
* **Characters** — the sum of the lengths of all lines (without the line break characters).
* **The longest word** — the first of the longest ones; the punctuation marks `.,;:!?()"` at the edges of a word are dropped.

Output format (follow it strictly):

```text
Lines: <number>
Words: <number>
Characters: <number>
Longest word: <word>
```

For empty input: all numbers are 0, and the longest word is `-`.

### Example

The file `sample.txt`:

```text
Java is a programming language.
Java runs on the JVM,
and the JVM runs everywhere!
```

```bash
java WordStats.java < sample.txt
```

```text
Lines: 3
Words: 15
Characters: 80
Longest word: programming
```

> [!WARNING]
> Count the length of a line with `length()`, i.e. in UTF-16 code units. For Latin and Cyrillic letters this matches the number of letters. When running on Windows, make sure the console works in UTF-8 (`chcp 65001`) or read the input from a file.

Commit: `git add WordStats.java sample.txt && git commit -m "WordStats: count lines, words, characters"`.

## Stage 3: A Branch with a New Feature --top N (2 pts)

Create a `feature/top-words` branch and implement the `--top N` option in it: after the main statistics the program prints **the N most frequent words**.

* Words are compared **case-insensitively** (`toLowerCase()`), punctuation at the edges is dropped.
* Sorting: by descending frequency; for equal frequencies — alphabetical order.
* No collections: use two parallel arrays `String[] words` and `int[] counts`, grow them when needed with `Arrays.copyOf` (e.g. doubling them), and a simple sort (insertion or bubble sort).

```bash
git switch -c feature/top-words
# ... the implementation ...
git commit -am "Add --top N: the most frequent words"
```

```bash
java WordStats.java --top 2 < sample.txt
```

```text
Lines: 3
Words: 15
Characters: 80
Longest word: programming
Top-2:
  java     2
  jvm      2
```

Format the top lines like this: `String.format("  %-8s %d", word, count)`.

An unknown argument or an invalid number after `--top` — a message to `System.err` and exit code 1 (`System.exit(1)`).

## Stage 4: A Merge Conflict (2 pts)

Deliberately create and resolve a conflict.

1. Go back to `main` and change the format of the first output line there to `Line count: 3`. Commit.
2. Switch to `feature/top-words` and change **the same line** of code to `Number of lines: 3`. Commit.
3. Go back to `main` and run `git merge feature/top-words`.

Git reports a conflict and marks the fragment in the file:

```text
<<<<<<< HEAD
        System.out.println("Line count: " + lines);
=======
        System.out.println("Number of lines: " + lines);
>>>>>>> feature/top-words
```

4. Edit the file, keeping **the final format from stage 2** (`Lines: 3`), remove the markers, and check that the program compiles and gives the expected output.
5. `git add WordStats.java && git commit` (Git itself suggests the merge commit message).

Check the history: `git log --oneline --graph --all` should show the branching and the merge.

> [!TIP]
> IntelliJ has a convenient three-way merge tool: *Git → Resolve Conflicts*.

## Stage 5: .gitignore, Push and a Tag (2 pts)

1. Compile the program with `javac WordStats.java`: a `WordStats.class` appears. Make sure `git status` shows it.
2. Create a `.gitignore` at the root of the repository:
```text
*.class
out/
target/
build/
.idea/
*.iml
.DS_Store
```
3. Commit `.gitignore` and make sure the `.class` file disappeared from `git status`.
4. Delete the local branch `feature/top-words` (`git branch -d`), tag the current state and push everything to the server:
```bash
git tag lab01
git push origin main --tags
```
5. Open the repository in a browser and make sure the code, `.gitignore` and the tag are there.

> [!CAUTION]
> Never run `git commit --amend` or `git push --force` for commits already pushed to a shared branch: you would rewrite the history others are working on.

## Extras (No Points)

* Support reading from files: `java WordStats.java a.txt b.txt` — statistics for each file separately and a total.
* Add a `--chars` option: a histogram of the 10 most frequent letters with `#` "bars".
* Look at what is in `.git/objects` after a few commits (`git cat-file -p HEAD`, `git cat-file -p HEAD^{tree}`) and how Git stores snapshots.
