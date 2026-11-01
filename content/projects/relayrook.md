---
order: 2
name: RelayRook
description: An Agent Skill and CLI that lets one coding agent hand work to Claude Code, Codex, Kiro, OpenCode or Devin, hold their permission prompts, and get typed results back.
url: https://github.com/1saifj/relayrook
language: javascript
wip: false
isPrivate: false
sourceType: open-source
role: Author
impact: Activity-based watchdogs, one permission vocabulary across five CLIs, end-to-end tested
stack:
  - Node.js
---

RelayRook is an open-source Agent Skill and CLI. One coding agent uses it to hand implementation, code review or security review to the other coding CLIs on the same machine.

## What it does

- Starts and keeps sessions with Claude Code, Codex, Kiro, OpenCode and Devin.
- Holds each permission prompt so that the parent agent decides, and maps one permission vocabulary onto the permission system of each CLI.
- Decides whether a turn is still working by watching what the worker does, so slow work keeps running and stuck work gets stopped.
- Returns typed results to the parent agent.

## The workflow

1. Discover: `doctor --compact` reports the installed CLIs and whether they are ready.
2. Select: `route --role <role>` picks the backend, model and effort, and gives the reason.
3. Delegate: `start` and `prompt` open a persistent session and send one turn at a time.
4. Verify: `wait` and `status --cursor` return the turn state, new events and the parsed result.
5. Continue: `prompt`, `steer`, `review`, `cancel` and `permission` act on the same session.

## Quality

Written in Node.js, with end-to-end tests that run each worker against a simulated CLI. Workers also run on Windows.

The source is on [GitHub](https://github.com/1saifj/relayrook).
