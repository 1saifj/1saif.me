---
title: "Cherry-Pick: A Useful GitHub Tool for Managing Commits"
description: "How to copy a single commit to another branch with cherry-pick in GitHub Desktop, and when a merge or a rebase is the better choice."
createdAt: "2024-07-13"
updatedAt: 2024-07-13
featuredImage: "/articles/git_cherry_pick_feat.jpg"
tags:
  - github
  - version-control
  - git
  - development
---

Sometimes you need one commit from another branch, not the whole branch. A hotfix that landed on `develop` and has to go to `main` today, or a small fix someone made on their feature branch that you need now. That's what cherry-pick is for. GitHub Desktop makes it a few clicks. Here's how it works and when to use it.

## What is Cherry-Picking?

Cherry-picking in Git copies selected commits from one branch and applies them to another. Use it when you want some changes from a branch without merging the whole branch. You control exactly which changes reach your codebase.

### Benefits of Cherry-Picking

1. **Selective Integration**: You take only the commits you need, and leave out the rest.
2. **Flexibility**: It helps when you work on several features or hotfixes at once.
3. **Fewer Conflicts**: Fewer changes come in, so there is less to conflict with than in a full branch merge.

## How to Cherry-Pick a Commit in GitHub Desktop

Follow these steps to cherry-pick a commit in GitHub Desktop:

### Step 1: Open GitHub Desktop

Open GitHub Desktop and select the repository where you want to cherry-pick.

### Step 2: Select the Branch

Select the branch that contains the commit you want from the repository's branch menu.

### Step 3: View Commit History

Click "History" to view the commit history of the selected branch. Find the commit you want.

### Step 4: Cherry-Pick the Commit

Right-click the commit and select "Cherry-pick commit" from the context menu.

### Step 5: Select Target Branch

After you select "Cherry-pick commit," GitHub Desktop asks you to choose the target branch, where you want to apply the commit. Select the branch from the dropdown menu.

### Step 6: Complete Cherry-Pick

Click "Continue". GitHub Desktop applies the commit to the target branch. If there are conflicts, you must resolve them.

## Practical Use Cases

### Hotfixes

Cherry-picking is useful for hotfixes. Suppose you have a critical fix in the development branch that must reach the production branch right away. Instead of merging the entire development branch, you cherry-pick the commit that contains the fix.

### Feature Backporting

If a new feature developed in a feature branch is also needed in an older release branch, cherry-pick the commits for that feature. You do not merge any unrelated changes.

## When Not to Cherry-Pick

Cherry-pick copies a commit. It doesn't move it. The new commit has a different hash, so if you later merge the original branch, Git sees the same change twice. Usually it merges cleanly, but not always. For a hotfix or a backport, that's a fair price. If you find yourself cherry-picking most of a branch, merge or rebase it instead.

For more detailed information, refer to the [official GitHub documentation](https://docs.github.com/en/desktop/managing-commits/cherry-picking-a-commit-in-github-desktop).
