---
title: Git
description: How Git stores history: blob, tree and commit objects, branches and HEAD, the index, reset, three-way merge and working with remote repositories.
---

## Git

Git is a distributed version control system. It provides tools for managing a **repository**. A repository is simply a set of saved states of a **working directory**. Such a saved state is called a **commit**.

A repository is usually the `.git` directory inside the working directory. It contains files describing the commits together with the saved contents of the working directory.

```bash
mkdir repo
cd repo
git init
ls -l .git
```

This command creates an empty repository in an empty working directory: it does not contain any saved version yet.

```text
-rw-rw-r-- 1 user user   92 Mar 22 10:11 config        # local repository configuration
-rw-rw-r-- 1 user user   73 Mar 22 10:11 description   # a human-readable repository description
-rw-rw-r-- 1 user user   23 Mar 22 10:11 HEAD          # a pointer to the "current" commit
drwxrwxr-x 4 user user 4096 Mar 22 10:11 objects       # stored objects: commits, file and directory states
drwxrwxr-x 4 user user 4096 Mar 22 10:11 refs          # references, i.e. names of commits
```

The working directory together with `.git` can be freely moved and copied: `.git` contains no absolute paths. Deleting the `.git` directory destroys the repository with all version information, but of course does not touch the working directory itself.

### Objects

A repository consists of objects stored in the `.git/objects` directory. Git defines 4 object types (blob, tree, commit, annotated tag), of which the first three are the most important:

* **blob** — the saved contents of some file from the working directory;
* **tree** — the saved contents of a directory (a "name → object" dictionary);
* **commit** — a saved state of the working directory with additional version information.

A created object is **immutable**: its contents cannot be changed. Thanks to that, the contents can be used to identify the object! Git recognizes objects by the **SHA-1 hash of their contents**. The hash depends only on the contents: different contents — a different identifier — a different object.

The hash of a file can be computed manually with the `hash-object` command. You do not even need a repository for that:

```bash
echo Hi! > hi.txt
git hash-object hi.txt   # 663adb09143767984f7be83a91effa47e128c735
```

The computed hash will be the same on every computer, because the file contents are the same. Changing the contents changes the hash.

A file added to the repository (e.g. as part of a commit) ends up in the `objects` directory as a blob object whose identifier equals its hash.

```bash
cd repo
echo Hi! > hi.txt
git add hi.txt
git commit -m "Initial commit"
git cat-file blob 663ad
```

The `.git/objects` directory is divided into subdirectories by the first two characters of the hash. As the example shows, a few leading characters of the SHA-1 are enough to identify an object — as many as needed to avoid ambiguity.

Saving the state of a single file is not enough to version a project: the state of whole directories has to be saved. That is what the tree object is for. The `git commit` command created several objects:

```bash
find .git/objects -type f
git cat-file -t 8da9      # tree
git ls-tree 8da9
```

One of them is a tree. Its contents are a listing of the directory whose state it describes:

```text
100644 blob 663adb09143767984f7be83a91effa47e128c735    hi.txt
```

Our object contains just one entry, because at the moment of `git commit` there was a single file in the working directory. For each directory entry a tree stores:

* the permissions (`100644` = `rw-r--r--`);
* the type (blob or tree);
* the object identifier (SHA-1);
* the name in the directory (`hi.txt`).

A tree object may contain other tree objects. This is how arbitrarily nested directory structures are described:

```text
Commit da14b73
└── Tree 8dab03            (project root)
    ├── Blob fe493f7       pom.xml
    ├── Blob 28c7351       README.md
    └── Tree 9c75956       src/
        ├── Blob ab2ea75   Main.java
        └── Blob db09143   Util.java
```

If a directory contains several files with the same contents, the tree will refer to the same object several times:

```bash
cp hi.txt hey.txt
git add hey.txt
git commit -m "Copied hi.txt"
git ls-tree a5250
```

```text
100644 blob 663adb09143767984f7be83a91effa47e128c735    hey.txt
100644 blob 663adb09143767984f7be83a91effa47e128c735    hi.txt
```

The identifier of a tree is the SHA-1 of this listing, which contains the hashes of the nested entries. Changing the contents of `hi.txt` changes its hash, so the contents of the root tree change, and with them its hash.

**Commits** are the main objects of a repository, created when a version of the project is saved:

```bash
git cat-file commit a7f3
```

```text
tree a5250f7c6ad5260e28003ba5a0b1841b752918e3
parent 23d9585ca2a2fe493f79c75956ab4d815da14b73
author Jan Kowalski <jan@example.com> 1742665566 +0100
committer Jan Kowalski <jan@example.com> 1742665566 +0100

Copied hi.txt
```

From it we can read:

* the identifier of the saved working directory state (`tree`);
* the identifiers of the previous commits (`parent`);
* the author (`author`) and the time the changes were created;
* who applied the commit (`committer`) and when;
* the message describing the version (`Copied hi.txt`).

> [!IMPORTANT]
> A commit contains **the state of the whole project**, not the changes made! Git computes the difference (diff) each time by comparing two snapshots.

The SHA-1 of a commit is computed from the fields above. Changing any of them, even just the message, requires creating a new commit with a different SHA-1. That is why "modifying" a commit (`git commit --amend`, `rebase`) actually means creating a new one and moving the branch to it.

### Branches

SHA-1 hashes are inconvenient for humans. Instead of "look at version `23d9585ca2a2fe493f79c75956ab4d815da14b73`" it is easier to have a meaningful revision name. Such references are called **branches**.

```bash
git branch -v
# * master a7f3d48 Copied hi.txt
```

Technically, branches are files in the `.git/refs/heads/` directory that store the SHA-1 of the commit they name (Git may also pack them into a single `.git/packed-refs` file):

```bash
cat .git/refs/heads/master
# a7f3d48e135b4f4deb9a985ed7058b70491d7c71
```

The list of branches is essentially a listing of this directory. Creating a branch pointing to a commit means creating such a file:

```bash
git branch feature a7f3d48
git branch -v
#   feature a7f3d48 Copied hi.txt
# * master  a7f3d48 Copied hi.txt
ls .git/refs/heads
# feature master
```

Hence an important fact:

> [!IMPORTANT]
> A branch is just **a name of a commit**!

Branches are mutable: when a new commit is created, the active branch **moves** to it. Git also supports immutable commit names — **tags** (`git tag v1.0`).

### HEAD

And what is the *active branch*? A repository has a special reference `HEAD` (the `.git/HEAD` file) pointing to the current commit we are working with. `HEAD` may point to a commit indirectly, through a branch, or directly. The typical situation is the indirect one:

```bash
cat .git/HEAD
# ref: refs/heads/master
```

This is the situation in which we say we are *on a branch*. `HEAD` points to `master`, and `master` to a specific commit. Both names denote the same commit:

```text
HEAD ──► master ──► Commit a7f3 ──parent──► Commit 23d9 ──parent──► (none)
                        │                       │
                      tree                    tree
                        ▼                       ▼
                    Tree a525               Tree 8da9
                     │    │                     │
                     ▼    ▼                     ▼
                     Blob 663a (hi.txt, hey.txt — the same contents)
```

`HEAD` is moved with `git checkout` (or the more modern `git switch` for branches and `git restore` for files). Changing `HEAD` changes the contents of the working directory to the state saved in the target commit:

```bash
git checkout 23d9
cat .git/HEAD
# 23d9585ca2a2fe493f79c75956ab4d815da14b73
```

Now `HEAD` points to a commit directly. This is the **detached HEAD** state: it is normal when browsing old revisions.

```text
master ──► Commit a7f3 ──parent──► Commit 23d9 ◄── HEAD
```

The commit `HEAD` points to automatically becomes the parent of new revisions:

```bash
git checkout master          # HEAD -> master -> a7f3
touch empty.txt
git add empty.txt
git commit -m "Add empty file"
# [master eef04fe] Add empty file
#  1 file changed, 0 insertions(+), 0 deletions(-)
git cat-file commit eef0
# tree 580e44691fcd53fb04aebbd71fe23b5c626afec8
# parent a7f3d48e135b4f4deb9a985ed7058b70491d7c71
# ...
```

During this operation the active branch moves to the new commit. In the detached HEAD state there is no active branch, so creating new commits there is unnatural: as soon as you switch to another branch, no name will lead to them.

### The Index

Before creating a commit you usually run `git add`. Why? Three independent states of the working directory take part in creating a commit:

* the **working directory** itself with the current state of the files;
* **`HEAD`** — changes are prepared relative to it (it will become the parent);
* the **index** (staging area) — an intermediate state into which changes are selectively added before the commit.

This lets you selectively build the contents of the next commit. For example, some files may contain private "dirty" changes that should not end up in the new revision, but which you do not want to throw away either.

Technically, the index is stored in the `.git/index` file. It can be displayed with the `ls-files` command:

```bash
git ls-files --stage
# 100644 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0       empty.txt
# 100644 663adb09143767984f7be83a91effa47e128c735 0       hey.txt
# 100644 663adb09143767984f7be83a91effa47e128c735 0       hi.txt
```

This looks very much like a tree object, because it almost is one! During `git commit` it is the state of the index that is saved as a new tree object, around which a commit object is created.

`git checkout` restores not only the working directory to the state from the commit, but also synchronizes the index with it. In a *clean* repository state `HEAD == index == workdir`:

```bash
git status
# On branch master
# nothing to commit, working tree clean
```

After changing files in the working directory we get `HEAD == index != workdir`:

```bash
echo "not really" > empty.txt
git status
# Changes not staged for commit:
#         modified:       empty.txt
git diff
# diff --git a/empty.txt b/empty.txt
# @@ -0,0 +1 @@
# +not really
```

`git diff` compares the working directory with the index. After adding the change to the index we get `HEAD != index == workdir`:

```bash
git add empty.txt
git status
# Changes to be committed:
#         modified:       empty.txt
git diff              # empty: working directory == index
git diff --staged     # index vs HEAD (a synonym of --cached)
# +not really
```

When a file is added to the index, a new blob object with its contents is created. Tree objects are created only by `git commit`.

Now we can change the working directory again and get `HEAD != index != workdir`:

```bash
echo "hey!" > empty.txt
git status
# Changes to be committed:
#         modified:       empty.txt
# Changes not staged for commit:
#         modified:       empty.txt
git diff
# -not really
# +hey!
```

If we now run `git commit`:

* the index will be saved as a new tree object;
* a new commit object will be created that points to this tree, with the current `HEAD` in its `parent` field;
* the branch `HEAD` points to will be moved to the new commit.

We get `HEAD == index != workdir`: the last change stays in the working directory, because `git commit` does not touch it.

```bash
git commit -m "Filled empty file"
# [master 401c27f] Filled empty file
git status
# Changes not staged for commit:
#         modified:       empty.txt
```

> [!TIP]
> `git add -p` lets you add to the index not whole files but individual hunks of changes: handy when two independent edits got mixed up in one file.

### Reset

One of the basic operations, `git reset`, often causes difficulties because of its many functions. Despite its "destructive" name, `reset` actually **moves a branch** to the given commit. Additionally, it can at the same time change the state of the index and the working directory to the state of that revision.

`git reset` has 3 modes.

`git reset --soft` moves the reference stored in `HEAD` to the given commit. The state of the working directory and the index does not change:

```bash
git reset --soft HEAD^       # HEAD^ — the first parent of HEAD
git status
# Changes to be committed:
#         modified:       empty.txt
# Changes not staged for commit:
#         modified:       empty.txt
```

We are back to the `HEAD != index != workdir` state, as if we had undone `git commit`. The commit itself, although now nameless, still exists, and we can return to it:

```bash
git reset --soft 401c
```

`git reset --mixed` (the default mode) does the same as `--soft` and additionally restores the index to the state of the given commit:

```bash
git reset --mixed HEAD^
git diff
# +hey!
```

Now `HEAD == index != workdir`, and the working directory has not changed.

`git reset --hard` changes everything: it puts the `HEAD` branch, the index and the working directory into the state of the given revision. **Uncommitted changes in the working directory are lost irreversibly!**

```bash
git reset --hard 401c
git status
# nothing to commit, working tree clean
```

> [!TIP]
> "Lost" commits (no longer pointed to by any branch) can be found with `git reflog`: Git remembers all previous positions of `HEAD` for several weeks.

### Merge

A repository is a set of commits, each containing a list of references to its parents (from 0 to n). Hence any repository is a **directed acyclic graph**: the vertices are commits, the edges are pointers to parents. The graph can be displayed with `git log`:

```bash
git log --oneline --graph --all
# * 401c27f (HEAD -> master) Filled empty file
# * eef04fe Add empty file
# * a7f3d48 (feature) Copied hi.txt
# * 23d9585 Initial commit
```

So far the graph is a list: the project has developed linearly. But a commit can be the parent of several revisions. This usually happens when several authors start working from the same revision at the same time:

```bash
git checkout feature
echo "Feature Hi!" > hi.txt
git add hi.txt
git commit -m "Featurized hi.txt"
git log --oneline --graph --all
# * 5e11eea (HEAD -> feature) Featurized hi.txt
# | * 401c27f (master) Filled empty file
# | * eef04fe Add empty file
# |/
# * a7f3d48 Copied hi.txt
# * 23d9585 Initial commit
```

At commit `a7f3d48` the history has branched. Sooner or later independently developed branches must be combined into one consistent revision. That is what `git merge` is for; it creates commits with several parents:

```bash
git merge --no-edit master
git log --oneline --graph --all
# *   1296142 (HEAD -> feature) Merge branch 'master' into feature
# |\
# | * 401c27f (master) Filled empty file
# | * eef04fe Add empty file
# * | 5e11eea Featurized hi.txt
# |/
# * a7f3d48 Copied hi.txt
# * 23d9585 Initial commit
git cat-file -p HEAD
# tree 8c1f710ff54a3848913a130fbd58b1247827b1ed
# parent 5e11eea4a4f3199d1a097e0716c4afa1c0724317
# parent 401c27fd94595bc9565d76e389fa5923febf2302
# ...
```

The new merge commit combines the working directory states of both parents. One parent is always `HEAD`, the other is what was passed as the argument. The merge happened automatically, because the changes did not conflict.

To merge, Git uses the **three-way merge** algorithm. It considers three states: the two from the commits being merged (`5e11eea` and `401c27f`) and their nearest common ancestor — the branching point `a7f3d48`.

```text
              5e11eea 'Feature Hi!'  ◄── feature
             /                    \
a7f3d48 'Hi!'                      1296142 'Feature Hi!'  (new merge commit)
             \                    /
              401c27f 'Hi!'      ◄── master
```

In the example above the contents of `hi.txt` in one of the versions are the same as in the common ancestor. So the merge is trivial: the version that differs is chosen. The algorithm assumes that when the state did not change in one branch but changed in the other, the desired result is the change.

If all three versions are the same, everything is obvious. But what if all three differ? Then a **conflict** arises:

```bash
git reset --hard HEAD^
git checkout master
echo "Master Hi!" > hi.txt
git add hi.txt && git commit -m "Masterized hi.txt"
git merge feature
# Auto-merging hi.txt
# CONFLICT (content): Merge conflict in hi.txt
# Automatic merge failed; fix conflicts and then commit the result.
```

The `git merge` operation has been performed partially and stopped before creating the merge commit. The working directory and the index contain a partially merged state. Files the algorithm could not handle automatically contain markers at the conflict locations:

```bash
cat hi.txt
# <<<<<<< HEAD
# Master Hi!
# =======
# Feature Hi!
# >>>>>>> feature
```

Now the user must resolve the conflict manually, replacing the marked fragments with the correct contents, and finish the merge:

```bash
echo "Feature master Hi!" > hi.txt
git add hi.txt
git commit
```

Merging is only one of Git's tools for combining changes. It is also worth knowing `rebase` (moving commits onto a new base, linear history), `rebase -i` (editing, squashing and reordering commits) and `cherry-pick` (applying a single commit on another branch).

### Remote Repositories

Git is a **distributed** version control system designed for working on one project from many computers. Usually each author has their own repository on their machine and synchronizes it with remote repositories over a network protocol (HTTPS or SSH). Object identifiers, computed from their contents, are global: they are the same in all repositories.

The addresses of remote repositories are stored in `.git/config` and configured with the `git remote` command. For learning purposes, the "remote" can be another directory on the same computer. The examples below continue from the repository state at the end of the reset section (before the merges).

```bash
mkdir origin && cd origin
# a different initial branch: Git does not allow pushing to the branch currently checked out in a non-bare repository
git init --initial-branch=main
cd ../repo
git remote add origin ../origin
```

When cloning, Git automatically adds a remote named `origin` pointing to the source.

The main commands that communicate with a remote repository are:

* `git clone`
* `git fetch`
* `git pull`
* `git push`

None of the other commands discussed touch the remote copy in any way.

`git push` updates remote references: the branch in the remote repository corresponding to the local one starts pointing to the same commit. Along the way, the objects (commit, tree, blob) missing in the remote repository are sent.

```bash
git push --set-upstream origin master
# Enumerating objects: 11, done.
# Writing objects: 100% (11/11), 976 bytes | 976.00 KiB/s, done.
# To ../origin
#  * [new branch]      master -> master
# branch 'master' set up to track 'origin/master'.
```

By default Git does not know which remote branch corresponds to the local `master`. This link is configured once with `--set-upstream` (`-u`).

The remote repository was empty. `git push` created the `master` branch there and set it to commit `401c`. To do so, it had to send this commit and all its dependencies, following the `parent` pointers back to the very *beginning* of history.

```bash
git branch -va
#   feature               a7f3d48 Copied hi.txt
# * master                401c27f Filled empty file
#   remotes/origin/master 401c27f Filled empty file
```

Operations on remote repositories change not only the references there, but also their local counterparts. `git push` created the local reference `origin/master`, pointing where `master` points in the `origin` repository. Such references are not branches: they cannot be moved other than by exchanging data with the remote repository.

Meanwhile, new commits and branches may appear in the remote repository:

```bash
cd ../origin
git checkout -b development master
echo 'public class Main { public static void main(String[] a) { } }' > Main.java
git add Main.java && git commit -m "Added Main.java"
```

`git fetch` updates all local counterparts of remote branches and downloads the required objects:

```bash
cd ../repo
git fetch
# From ../origin
#  * [new branch]      development -> origin/development
git branch -va
#   feature                    a7f3d48 Copied hi.txt
# * master                     401c27f Filled empty file
#   remotes/origin/development e0e64f5 Added Main.java
#   remotes/origin/master      401c27f Filled empty file
```

The local repository now has an `origin/development` reference to the new commit. You can create a local branch from it and continue working:

```bash
git switch development       # creates a local branch tracking origin/development
```

`git pull` combines two operations: `git fetch` + `git merge <remote reference>`. That is, it does the same as fetch and then merges the local branch with its remote counterpart, possibly creating a merge commit (with `--rebase`, a rebase is performed instead of a merge).

### .gitignore

Not everything in the working directory should end up in the repository. Build outputs, IDE settings and secrets are listed in the `.gitignore` file:

```text
# Maven / Gradle build outputs
target/
build/
*.class
*.jar

# IDE
.idea/
*.iml
.vscode/

# secrets and local settings
.env
```

The patterns apply to files that are **not tracked yet**. A file that has already been committed must first be removed from the index: `git rm --cached file`.
