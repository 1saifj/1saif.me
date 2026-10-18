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
impact: Activity-based watchdogs, one permission vocabulary across five CLIs, 226 tests
---

# RelayRook
RelayRook is an open-source Agent Skill and CLI. One coding agent uses it to hand implementation, code review or security review to the other coding CLIs on the same machine.

## What it does

- Starts and keeps sessions with Claude Code, Codex, Kiro, OpenCode and Devin.
- Holds each permission prompt so that the parent agent decides, and maps one permission vocabulary onto the system of each CLI.
- Decides whether a turn is still working by watching what the backend does, so slow work keeps running and stuck work gets stopped.
- Returns typed results to the parent agent.

## Quality

About 8,600 lines of Node.js with 226 tests, including end-to-end tests against a fake CLI. Workers also run on Windows.

The source is on GitHub.
