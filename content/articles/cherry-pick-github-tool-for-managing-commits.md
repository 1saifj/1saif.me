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

Sometimes you need one commit from another branch, not the whole branch. A hotfix that landed on `develop` and has to go to `main` today, or a small fix someone made on their feature branch that you need now. That's what cherry-pick is for, and GitHub Desktop makes it a drag and drop. Here's how it works and when to use it.

# What is Cherry-Picking?

Cherry-picking in Git refers to the process of selecting specific commits from one branch and applying them to another. This is particularly useful when you want to incorporate changes from one branch without merging the entire branch, allowing for more granular control over the changes integrated into your codebase.

## Benefits of Cherry-Picking

1. **Selective Integration**: Cherry-picking enables developers to integrate only the desired changes, avoiding unnecessary modifications.
2. **Improved Workflow**: It supports a more flexible and efficient workflow, especially when working on multiple features or hotfixes concurrently.
3. **Conflict Minimization**: By choosing specific commits, you can reduce the risk of merge conflicts that often arise during full branch merges.

# How to Cherry-Pick a Commit in GitHub Desktop

Follow these steps to cherry-pick a commit in GitHub Desktop:

## Step 1: Open GitHub Desktop

Launch GitHub Desktop and ensure you are connected to the repository where you want to cherry-pick commits.

## Step 2: Select the Branch

Select the branch that contains the commit(s) you want to cherry-pick from the repository's branch menu.

## Step 3: View Commit History

Click on "History" to view the commit history of the selected branch. Locate the commit you wish to cherry-pick.

## Step 4: Cherry-Pick the Commit

Right-click on the desired commit and select "Cherry-pick commit" from the context menu.

## Step 5: Select Target Branch

After selecting "Cherry-pick commit," GitHub Desktop will prompt you to choose the target branch where you want to apply the commit. Select the appropriate branch from the dropdown menu.

## Step 6: Complete Cherry-Pick

Click "Continue" to proceed. GitHub Desktop will apply the selected commit to the target branch. If there are any conflicts, you will be prompted to resolve them.

# Practical Use Cases

## Hotfixes

Cherry-picking is particularly useful for applying hotfixes. Suppose you have a critical fix in the development branch that needs to be applied to the production branch immediately. Instead of merging the entire development branch, you can cherry-pick the specific commit containing the fix.

## Feature Backporting

If a new feature developed in a feature branch is also needed in an older release branch, you can cherry-pick the commit(s) related to the feature without merging other unrelated changes.

# When not to cherry-pick

Cherry-pick copies a commit. It doesn't move it. The new commit has a different hash, so if you later merge the original branch, Git sees the same change twice. Usually it merges cleanly, but not always. For a hotfix or a backport, that's a fair price. If you find yourself cherry-picking most of a branch, merge or rebase it instead.

For more detailed information, refer to the [official GitHub documentation](https://docs.github.com/en/desktop/managing-commits/cherry-picking-a-commit-in-github-desktop).
