---
title: My Coding Agent Was Slow, and It Was grep
description: I blamed the model, the context window and the API. The real problem was the search tool the agent used for code search. What I changed, why aliasing grep needs care, and why the harness matters more than the model.
createdAt: "2026-02-07"
updatedAt: "2026-06-29"
featuredImage: "/articles/agent_ripgrep_feat.jpg"
tags:
  - ai
  - developer-tools
  - productivity
  - macos
---

My AI coding agent kept lagging on code search.

I blamed the model. Then the context window. Then the API.

It was grep.

## Why grep was the bottleneck

A coding agent spends a large part of every task looking around. Where is this function defined? Who calls it? Which files import this package? Each of those is a search, and in a single task the agent can run dozens of them.

On macOS, the `grep` you get is the BSD version that ships with the system. It does what you ask, and for a recursive search, what you ask is to read everything: `node_modules`, `.git`, build output, vendored dependencies, minified bundles. In a typical web project, most of those bytes are not your code.

ripgrep (`rg`) was built for exactly this. It skips files listed in `.gitignore` and hidden folders by default, so it skips `node_modules` and `dist` when `.gitignore` lists them, which it almost always does. It searches with several threads, and it's fast at the matching itself. In the same project, the difference is easy to feel.

## What I changed

Install it:

```bash
brew install ripgrep
```

Then add an alias for `grep` to the shell config the agent uses. For me, that one alias made the agent's searches about ten times faster.

That alias needs some care, though, because `rg` is not a drop-in replacement for `grep`. The flags differ:

```bash
grep -rn "TODO" --include="*.go" .   # works with grep
rg -n "TODO" --include="*.go" .      # error: rg has no --include
rg -n "TODO" -g "*.go"               # the rg way
```

`rg` is recursive by default, and its regex syntax is Rust's, which differs from grep's basic syntax in places. Most simple searches work the same, but a script that uses grep-specific flags will break. Two things to watch:

- **Aliases only apply to interactive shells.** Scripts and Makefiles don't load your aliases, so they keep using the real `grep`, which is what you want. Some agents run commands in a shell that does load your config, and some don't, so check what yours does.
- **Writing the rule in the agent's instructions file is often simpler.** Many agents read an instructions file in the repository (`AGENTS.md`, `CLAUDE.md` or similar). One line there, "use `rg` for searching code, not `grep`", tells the agent which tool to use, and `grep` keeps its meaning on your machine.

## The bigger lesson

I've used Codex, GLM and Claude, and I'm sure of this much: the results depend less on the model than on how you steer it and what harness you give it.

This grep story is a small example. The model was fine. The tool was slow, so the agent looked slow.

Prompting still matters. If you can't say what you want, what "done" means and what not to touch, you burn time and tokens. Tooling matters too. An agent can only work as well as the tools it can run: a fast search, a test command that works, and a way to start the app. It also needs room to pick the right tool for each step. Skills matter just as much: the written-down knowledge about your project that the agent reads every time.

When an agent feels slow or dumb, it's worth checking the boring parts first. In my case, the fix was one alias.
