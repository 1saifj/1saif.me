---
title: How to Make Claude Code Limits Last Longer
description: Claude Code spends tokens on a status line for each background agent. A preload hook took those requests from 3 to 0 in a 2-minute run. The desktop app needs a separate step.
createdAt: "2026-10-30"
updatedAt: "2026-10-30"
tags:
  - ai
  - developer-tools
  - macos
  - bun
---

A [public gist](https://gist.github.com/flamerix-ai/c3905705cc4205e5de3011fa2e74efce) has a hard claim. Claude Code sends the transcript of each background agent to a model. The model writes a status line of 3 to 5 words. The gist puts these requests at 16.4% of its authors' Claude Code spend. Their main conversation was 15.7%. On a subscription, this spend uses your limits.

The discovery is not mine. I only tested it on my Mac.

I do not accept a number like that from a gist. I also do not reject it. The binary is on my disk, so I read the binary.

## The code is there

Claude Code is a compiled Bun binary, and the JavaScript text is inside it. A byte search on version 2.1.311 found the timer and the prompt:

```text
[AgentSummary] Timer fired for agent
most recent action in 3-5 words using present tense (-ing)
```

It also found the defaults:

```js
var un=30,Qd=240,yi=2000;function Ko(){return{mode:"full",refreshSeconds:[un],maxInputTokens:yi,writer:{}}}
```

The interval is 30 seconds, and the mode is `full`. A server value can change the interval, but the code clamps that value to 30–240 seconds. No value in that range stops the timer.

The gist is correct about all of this.

## The 30-second claim is too simple

The gist says that the full transcript goes out every 30 seconds. The code is more careful. A timer that fires does not always send a request.

The same function skips the request when the agent has fewer than three messages. It skips the request when the transcript did not change. It holds the request when an agent request has no response and the prompt cache is probably cold. The gist's test table notes the second skip, but the headline does not.

So do not read 16.4% as your number. It came from their work on their machines. These requests occur only when background agents run. If you seldom start background agents, your share is small.

I do not have my own share. The gist says that only the OpenTelemetry export shows these requests, and I did not set up that export. A percentage from another team is a reason to measure. It is not your measurement.

## The test passed

The hook in the gist is a Bun preload. It wraps `setTimeout` and `setInterval`, and it reads the source text of each callback. If the text has the summary log line, the timer does not start.

I made two changes. I set the option with `=`, because a commenter on the gist reports that a space breaks `bun install`. I also made the hook run only inside Claude Code binaries, because `BUN_OPTIONS` goes to every Bun process. My changed copy is in [this gist](https://gist.github.com/1saifj/0619aae51cd479c09af8d0dc6d2b8c5e).

```bash
export BUN_OPTIONS="--preload=$HOME/.local/share/no-agent-summary.js"
```

Then I ran one background subagent on Haiku with five `sleep 20` calls. Each run took approximately 2 minutes. These are the counts from the debug log:

| Run | Timer fires | Summary requests |
| --- | --- | --- |
| 2.1.311, no hook | 3 | 3 |
| 2.1.311, hook in `pass` mode | 3 | 3 |
| 2.1.311, hook in `off` mode | 0 | 0 |
| App binary 2.1.309, hook in `off` mode | 0 | 0 |

In `pass` mode, the hook loads but stops nothing. So the hook alone changes nothing, and `off` removes the requests. The hook log for the `off` run shows the match:

```text
summary timer #1 suppressed (setTimeout, delay=30000)
exit: 1 summary timer(s) suppressed, 1 matched
```

Each row is one run. This proves that the hook stops the requests. It does not give my share of usage.

The hook also adds a new way to fail. I pointed `--preload` at a file that did not exist:

```text
error: preload not found "/tmp/does-not-exist-nas.js"
```

Claude Code did not start. So put a file test around the export:

```bash
if [ -f "$HOME/.local/share/no-agent-summary.js" ]; then
  export BUN_OPTIONS="--preload=$HOME/.local/share/no-agent-summary.js"
fi
```

## Then it missed the app

I put that block in `~/.zshenv`. A new shell had the variable, and `claude --version` loaded the hook.

But I do most of my work in the Claude desktop app. The app does not run the `claude` on my `PATH`. It has its own copy under `~/Library/Application Support/Claude/claude-code/`. That copy was version 2.1.308, and my terminal had 2.1.311. After a restart, new app sessions ran 2.1.309, and my terminal stayed at 2.1.311.

Then I read the environment of an app session:

```bash
ps -wwE -p <pid> -o command= | tr ' ' '\n' | cut -d= -f1
```

The session had the `PATH` from my `.zshrc`. It did not have `BUN_INSTALL` from the same file. So the app does not copy my whole shell environment. A shell file is not a safe way to reach the app.

The same test passed on the app's binary when I set the variable by hand. So the hook was correct. The fault was in how the variable reached the process.

The next step on macOS is `launchctl setenv`:

```bash
launchctl setenv BUN_OPTIONS "--preload=$HOME/.local/share/no-agent-summary.js"
```

This step has limits. The value goes only to GUI apps that start after the change, so you must quit the app. The file test from `~/.zshenv` does not apply here, so a deleted hook file can stop app sessions.

The value also does not survive a reboot. I set it, and then my Mac rebooted. After that, `launchctl print gui/$(id -u)` did not show `BUN_OPTIONS`, and the new app sessions did not have it.

I set the value again. I do not have an app result yet, so I make no claim about this step.

## Test the process that does the work

A cost hook has two separate questions. Did it stop the request? Did it load in the process that does your work? My first test answered only the first question.

The second question comes back after each update. The hook matches text, so a small rename can make it match nothing, and no error shows. The gist warns about this. The app updates its own copy, so a pass in the terminal proves nothing about the app.

You also lose the per-agent status text in the agents panel. The gist warns that a change to client behavior can conflict with your service terms. Read those terms first.

If you run many background agents, measure first. If you do not run them, leave your setup alone.
