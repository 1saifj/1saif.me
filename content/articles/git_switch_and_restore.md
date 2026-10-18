---
title: git checkout, switch, or restore?
description: git checkout does two unrelated jobs, and that's why it surprises people. What git switch and git restore split out, the commands you'll actually use, and the one checkout habit worth dropping.
createdAt: "2025-04-15"
updatedAt: "2025-04-15"
featuredImage: "/articles/git_switch_restore_feat.jpg"
tags:
  - git
  - version-control
  - developer-tools
---

If you learned Git a while ago, you probably use `git checkout` for everything. Switch to a branch, create a branch, throw away changes in a file, look at an old commit. It does all of it.

That's exactly the problem. Two very different jobs share one command: moving `HEAD` to another branch, and overwriting files in your working directory. Switching only moves `HEAD`. Overwriting files can discard your uncommitted work without asking. Since Git 2.23, there are two commands that split them apart.

## git switch: branches

`git switch` only deals with branches.

```bash
git switch main                 # go to an existing branch
git switch -c feature/invoices  # create a branch and switch to it
git switch -                    # go back to the previous branch
git switch --detach v1.4.0      # look at a tag or commit without a branch
```

If uncommitted changes would be overwritten, it refuses, just as `checkout` does. Nothing new there. The difference is that `switch` only touches files as part of changing branch.

## git restore: files

`git restore` only deals with files.

```bash
git restore src/api.go              # throw away unstaged changes in a file
git restore --staged src/api.go     # unstage it, keep the changes
git restore --source=HEAD~3 go.mod  # bring back go.mod as it was 3 commits ago
git restore .                       # throw away all unstaged changes
```

`git restore --staged` replaces `git reset HEAD <file>`, a command many people never understood as "unstage". `--source` also shows where the file content comes from.

## Why it matters

With `checkout`, the same word does both, and Git guesses which one you meant from the arguments.

`git checkout main` switches branches. But if you also have a file or folder called `main`, Git silently picks the branch. Add `--` and a path, and the same command overwrites files instead. And `git checkout -- .` looks innocent but throws away every unstaged change in the current directory, with no confirmation and no reflog entry to save you. Those changes were never committed, so Git has no copy of them.

The new commands make the risk clear: `switch` moves you between branches, and `restore` overwrites files. Pause before you run `restore`.

## Command map

| You want to | Old way | New way |
| --- | --- | --- |
| Switch branch | `git checkout main` | `git switch main` |
| Create a branch | `git checkout -b x` | `git switch -c x` |
| Discard file changes | `git checkout -- file` | `git restore file` |
| Unstage a file | `git reset HEAD file` | `git restore --staged file` |
| Old version of a file | `git checkout abc123 -- file` | `git restore --source=abc123 file` |

`git checkout` still works, so old scripts keep running. For daily work, use `switch` for branches and `restore` for files.

What do you use day to day?
