---
title: Getting Your Work Back After git reset --hard
description: Git keeps more than you think. How to use the reflog to undo a reset, what it can't bring back, and a few habits that make these moments boring.
createdAt: "2025-10-07"
updatedAt: "2025-10-07"
featuredImage: "/articles/git_reflog_feat.jpg"
tags:
  - git
  - version-control
  - developer-tools
---

This has happened to me more than once. A `git reset --hard` by mistake, and commits disappear from `git log`. The fix is simple, and most people don't know it: `git reflog`.

## What the reflog is

Every time `HEAD` moves in your repository, Git writes a line in a log. A commit, a checkout, a rebase, a reset, a merge, a pull. That log is the reflog. It remembers where HEAD was, even after the commits are gone from every branch.

```
$ git reflog
4e1a9c3 (HEAD -> main) HEAD@{0}: reset: moving to HEAD~3
b71e004 HEAD@{1}: commit: retry webhook delivery with backoff
9d02f6a HEAD@{2}: commit: store delivery attempts
c35e8b1 HEAD@{3}: commit: add webhook sender
4e1a9c3 HEAD@{4}: checkout: moving from feature/login to main
```

Read it from the top. `HEAD@{0}` is where you are now: the reset that threw away three commits. `HEAD@{1}` is where you were just before it, with all three commits still there.

## Undo the reset

Go back to the state before the reset:

```bash
git reset --hard HEAD@{1}
```

That's it. The three commits are back on `main`.

If you're nervous, and after one bad reset it's fair to be, put a branch on the old state first and look at it before you move anything:

```bash
git branch rescue HEAD@{1}
git log --oneline rescue
```

A branch costs nothing, and once the commits are on a branch they're safe from cleanup.

Each branch also has its own reflog, which helps when you don't remember what `HEAD` did but you know which branch you lost:

```bash
git reflog show feature/payments
```

## How long Git keeps it

Not forever. Reflog entries for commits that are still reachable from a branch are kept for 90 days by default. Entries for commits that are no longer reachable, which is exactly your situation after a bad reset, are kept for 30 days. After that, `git gc` can delete those commits for real.

So commits lost to a reset stay in the reflog for about 30 days. If you lose something, get it back soon.

The reflog is also local. It lives in your `.git` folder and never gets pushed. A fresh clone starts with a short reflog, and your teammate's reflog won't help you with your commits.

## What the reflog can't bring back

This is the part people find out the hard way. The reflog tracks commits. `git reset --hard` also throws away changes in your working directory that you never committed, and those were never in any commit.

If you had run `git add` on them, there is still a chance. Staged files are stored as objects even without a commit, and `git fsck` can find them:

```bash
git fsck --lost-found
```

It writes dangling blobs to `.git/lost-found/other/` and dangling commits to `.git/lost-found/commit/`. Blobs have no file names, just content, so you'll be opening files and searching for something you recognize. Not fun, but much better than writing the code again.

If you never staged them, Git can't help. Your editor might. VS Code has a Local History view (Timeline), and IntelliJ-based editors have Local History. Both keep copies of files you saved, and they help in more cases than you'd expect.

A dropped stash is a different case, and it can be found. A stash is a commit, so after `git stash drop` you can look for it among dangling commits:

```bash
git fsck --no-reflog | grep "dangling commit"
git show <hash>
```

## Habits that make this boring

- **Commit or stash before anything risky.** `git stash` takes a second. A work-in-progress commit also works, and you can squash it later. Either way, the reflog can bring it back.
- **Make a backup branch before a big change.** Before a rebase, a reset, or a history cleanup, run `git branch backup/before-rebase`. I always do this. If it goes wrong, the old state is one `reset` away, no reflog reading required.
- **Use `git reset --keep` to move a branch back.** It refuses to reset if that would throw away local changes, which is usually what you want. For a single file, `git restore` is the right tool.
- **Never use `--hard` on a shared branch and push the result.** On a branch other people use, rewriting history breaks their clones. If you really need to force push, tell your team first, and use `git push --force-with-lease`. It refuses to push if someone else pushed in the meantime, so you can't silently delete their work.

Most committed work that looks deleted is still in the reflog for a while, and you can bring it back.

Have you been through this? I'd like to hear other tricks people use to get work back.
