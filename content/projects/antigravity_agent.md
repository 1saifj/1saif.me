---
order: 2
name: Antigravity Agent
description: A cross-platform desktop application and VS Code extension for managing multiple AI accounts and model quotas seamlessly.
url: https://github.com/1saifj/antigravity-agent
language: typescript
wip: false
isPrivate: false
sourceType: open-source
---

# Antigravity Agent

A tool to help manage multiple AI accounts and monitor model usage from a single interface.

## Features

- **Account Switching**: Allows moving between different AI platform accounts without needing to log in repeatedly.
- **VS Code Extension**: Access account controls and quota status directly within the editor.
- **Cross-Platform**: Developed with Tauri to support Windows, macOS, and Linux with a small footprint.
- **Local Storage**: Keeps account data stored locally and encrypted.

## Technical Stack

- **Frontend**: React and Tailwind CSS.
- **Desktop Layer**: Rust (Tauri framework).
- **Integration**: Supports the Model Context Protocol (MCP) for better interaction with AI agents.
