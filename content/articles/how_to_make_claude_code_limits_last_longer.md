---
title: Your Claude Code Limits Are Paying for a 3-Word Status Line
description: Claude Code sends agent transcripts to a model for a 3-5 word status line. A Bun hook took those requests from 3 to 0, then missed my desktop app.
createdAt: "2026-10-30"
updatedAt: "2026-10-30"
tags:
  - ai
  - developer-tools
  - claude-code
  - background-agents
  - macos
  - bun
---

Claude Code can send a background agent's transcript to a model just to write a status line of 3 to 5 words. On a subscription, those requests use your limits.

The discovery is not mine. I found it in a [public gist](https://gist.github.com/flamerix-ai/c3905705cc4205e5de3011fa2e74efce), and I only tested it on my Mac.

The gist puts these requests at 16.4% of its authors' Claude Code spend. Their main conversation was 15.7%. That made me want to check what Claude Code was doing. I had the binary on disk, so I read it.

## I found the prompt inside the binary

Claude Code is a compiled Bun binary, and the JavaScript text is inside it. A byte search on version 2.1.311 found the timer and the prompt:

```text
[AgentSummary] Timer fired for agent
most recent action in 3-5 words using present tense (-ing)
```

It also found the defaults:

```js
var un=30,Qd=240,yi=2000;function Ko(){return{mode:"full",refreshSeconds:[un],maxInputTokens:yi,writer:{}}}
```

The default interval is 30 seconds. The mode is `full`. A server value can change the interval, but the code keeps that value between 30 and 240 seconds. No value in that range stops the timer.

Those parts matched the gist.

## The timer does not send a request every time

The gist says the full transcript goes out every 30 seconds. But a timer firing does not mean a request went out.

The function skips the request if the agent has fewer than three messages. It also skips it if the transcript did not change. If an agent request has no response and the prompt cache is probably cold, it holds the summary request. The gist's test table notes the unchanged-transcript case. Its headline does not.

The 16.4% came from their work on their machines. These requests occur only when background agents run. If you seldom run them, the gain from stopping these requests is small.

I do not have a usage share of my own. The gist says only the OpenTelemetry export shows these requests. I did not set that up, so I cannot put a percentage on my own usage.

## Three requests became zero in my test

The hook in the gist is a Bun preload. It wraps `setTimeout` and `setInterval`, and it reads the source text of each callback. If the text has the summary log line, the timer does not start.

I changed the option to use `=`. A commenter on the gist reports that a space breaks `bun install`. I also limited the hook to Claude Code binaries, because `BUN_OPTIONS` goes to every Bun process. I put [my copy here](https://gist.github.com/1saifj/0619aae51cd479c09af8d0dc6d2b8c5e).

```bash
export BUN_OPTIONS="--preload=$HOME/.local/share/no-agent-summary.js"
```

For each run, I started one background subagent on Haiku with five `sleep 20` calls. Each row below is one run of approximately 2 minutes. I counted timer fires and summary requests in the debug log:

| Run | Timer fires | Summary requests |
| --- | --- | --- |
| 2.1.311, no hook | 3 | 3 |
| 2.1.311, hook in `pass` mode | 3 | 3 |
| 2.1.311, hook in `off` mode | 0 | 0 |
| App binary 2.1.309, hook in `off` mode | 0 | 0 |

In `pass` mode, the hook loads but stops nothing. The requests stayed at three. In `off` mode, they fell to zero. The hook log showed what it matched:

```text
summary timer #1 suppressed (setTimeout, delay=30000)
exit: 1 summary timer(s) suppressed, 1 matched
```

The hook stopped the requests in these runs. These counts do not give my share of usage.

Then I pointed `--preload` at a file that did not exist:

```text
error: preload not found "/tmp/does-not-exist-nas.js"
```

Claude Code did not start. A missing preload file can keep you out entirely. I put a file test around the export:

```bash
if [ -f "$HOME/.local/share/no-agent-summary.js" ]; then
  export BUN_OPTIONS="--preload=$HOME/.local/share/no-agent-summary.js"
fi
```

## My shell loaded it. My app used another binary.

I put that block in `~/.zshenv`. A new shell had the variable, and `claude --version` loaded the hook.

I do most of my work in the Claude desktop app. It runs its own binary under `~/Library/Application Support/Claude/claude-code/`. It does not run the `claude` on my `PATH`.

The app's copy was version 2.1.308. My terminal had 2.1.311. After a restart, new app sessions ran 2.1.309. My terminal stayed at 2.1.311.

Then I read the environment of an app session:

```bash
ps -wwE -p <pid> -o command= | tr ' ' '\n' | cut -d= -f1
```

The session had the `PATH` from my `.zshrc`. It did not have `BUN_INSTALL` from the same file. The app had only part of my shell environment. Putting the export in a shell file did not mean the app session would get it.

I set the variable by hand and ran the same test on the app's 2.1.309 binary. That is the last row in the table. It passed. The hook worked when I supplied the variable. I still had to get that variable into an app session.

## A reboot removed the next attempt

I tried `launchctl setenv` next:

```bash
launchctl setenv BUN_OPTIONS "--preload=$HOME/.local/share/no-agent-summary.js"
```

The value goes only to GUI apps that start after the change. You have to quit the app first. The file test from `~/.zshenv` does not apply here. If you delete the hook file, the preload path can stop app sessions from starting.

Then my Mac rebooted. After that, `launchctl print gui/$(id -u)` did not show `BUN_OPTIONS`. New app sessions did not have it either. The value did not survive the reboot.

I set the value again. I have no confirmed result that app sessions load the hook through `launchctl`. The test with the variable set by hand does not confirm that path.

## An update can stop the hook without an error

My terminal test showed that the hook stopped requests on 2.1.311. It did not show that the hook loaded in the app where I do most of my work.

The gist also warns about updates. The hook matches text, so a rename can make it stop matching without an error. The app updates its own copy. I would have to check that binary again after an update.

With the requests stopped, the per-agent status text in the agents panel stops updating. The gist warns that a change to client behavior can conflict with your service terms. Read those terms first.

If you seldom run background agents, this hook has little to save. If you use the desktop app, check whether its own process loaded the hook before you count on it to make your limits last longer.
