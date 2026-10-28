---
title: The VPN Gateway That Was Running on Luck
description: Twelve IPsec tunnels were up, traffic was flowing, and systemd said strongSwan wasn't running at all. How I found out, and the one-time script I used to fix it on production in about three seconds of downtime.
createdAt: "2026-10-29"
updatedAt: "2026-10-29"
tags:
  - linux
  - devops
  - networking
  - ipsec
  - systemd
---

We have a small VM that does one thing. It keeps twelve IPsec tunnels up to a partner's network. If it stops, traffic to that partner stops with it. It's the kind of server you set up once and then forget about, because it never complains.

I wasn't even looking for a problem. I was checking something else on that box and ran this out of habit:

```bash
systemctl status strongswan-starter
```

It said `inactive (dead)`.

I read it twice. The tunnels were up. Traffic was going through. Nobody had reported anything. So I checked the tunnels directly:

```bash
ipsec status
```

One IKE session, twelve child SAs, all `INSTALLED`. Everything was fine.

So strongSwan was running, and systemd was sure it wasn't.

## How that happens

It took me a few minutes to understand. At some point, someone had started strongSwan by hand, with `ipsec start`, instead of through systemd. Maybe during an old debugging session, maybe after a restart that didn't go as planned. I don't know, and it doesn't matter much now.

`starter` and `charon` were running happily, but they were orphans. systemd didn't know about them. That means:

- If `charon` crashes, nothing brings it back.
- After a reboot, it's a coin flip what comes up.
- Our watchdog watches the systemd unit. It was watching a unit that had been dead for who knows how long, and it never said a word, because it was checking the wrong thing.

The server had been running on luck. And it had been lucky for a while.

## The fix is easy. Doing it on production isn't.

On paper, this is two commands:

```bash
ipsec stop
systemctl start strongswan-starter
```

In practice, every tunnel goes down between those two lines. The partner side has to accept the reconnect. And I'm typing over SSH, late at night, through a tunnel of its own. If my connection drops right after `ipsec stop`, the gateway stays down until I get back in, and I have no idea how long that would take.

So I didn't type it. I wrote one script, read it a few times, and ran it once. It had three rules:

1. Check everything before stopping anything.
2. Once the restart begins, it must not depend on my SSH session.
3. It must refuse to run a second time.

## Check first, touch later

The first part of the script only reads. It counts what's up and compares it with what should be up:

```bash
ike=$(ipsec status | grep -c 'ESTABLISHED')
child=$(ipsec status | grep -c 'INSTALLED')

if [ "$ike" -lt 1 ] || [ "$child" -ne 12 ]; then
  echo "PREFLIGHT_FAILED IKE=$ike CHILD=$child"
  exit 1
fi
```

If the tunnels aren't all healthy before the restart, I want to stop and look. Restarting something that's already half broken just makes it harder to tell what the restart broke.

It also checks the VM's public IP. The partner only accepts that one address. If it had changed for any reason, nothing would reconnect, so the script stops there.

Then it waits for a quiet moment. It reads the byte counters on the tunnels twice, a few seconds apart:

```bash
sample() { ipsec statusall | grep -E 'bytes_i|bytes_o'; }

a=$(sample); sleep 5; b=$(sample)
[ "$a" = "$b" ] || { echo "BUSY: traffic on the tunnels, try later"; exit 1; }
```

It's not perfect. A request can always start a second later. But at least I don't cut a transfer that's already in the middle.

## Don't let SSH hold the knife

This is the part I care about most. The restart doesn't run in my shell. The script copies itself to the gateway and runs as a short-lived systemd unit:

```bash
systemd-run --unit=strongswan-cutover --wait --collect \
  /usr/bin/bash /run/strongswan-cutover.sh --run
```

`--wait` keeps my terminal attached, so I see the result as it happens. But the unit belongs to systemd, not to me. If my laptop goes to sleep or the connection drops, the restart still finishes.

## "Running" is not the same as "supervised"

After the restart, `systemctl start` returning 0 only tells you systemd tried. I wanted proof. So the script checks who actually owns the processes:

```bash
fail() { echo "FAILED: $1"; exit 1; }

main=$(systemctl show -p MainPID --value strongswan-starter)
[ "$main" -gt 0 ] || fail "no MainPID"

# charon has to live inside the unit's cgroup, not be left over from before
grep -q strongswan-starter.service /proc/"$(pgrep -x charon)"/cgroup \
  || fail "charon not supervised"

for i in $(seq 1 30); do
  [ "$(ipsec status | grep -c INSTALLED)" -eq 12 ] && break
  sleep 1
done
[ "$(ipsec status | grep -c INSTALLED)" -eq 12 ] || fail "tunnels missing"
```

The cgroup line is the one that matters. It's easy to end up with a fresh `starter` under systemd sitting next to an old `charon` that never stopped. Both look like they're running. Only one of them is watched. That's the exact situation I was trying to get out of.

If a check fails, the script tries one recovery: start the unit again, but only if no `charon` is running. Two `charon` processes fighting over the same ports is worse than none.

## A script that only works once

```bash
marker=/var/lib/strongswan-cutover.done
[ -e "$marker" ] && { echo "already done, not running again"; exit 1; }
# ...
date -u +%FT%TZ > "$marker"
```

A cutover script is most dangerous the second time. You run it again "just to be sure", and you cause the outage you just avoided. My rule for myself: if the result isn't `SUCCESS`, don't run it again. Read the status first.

## How it went

I ran it, and watched:

```
22:12:30Z PREFLIGHT_OK IKE=1 CHILD=12 names=12
22:12:37Z QUIET_WINDOW_OK child SA counters unchanged over two samples
22:12:37Z CUTOVER_STARTED
22:12:37Z OLD_DAEMONS_STOPPED
22:12:37Z SYSTEMD_START_RETURNED
22:12:40Z SUCCESS SUPERVISED IKE=1 CHILD=12
```

Ten seconds in total, and most of that was the quiet-window check. The tunnels were down for about three seconds. All twelve came back on their own. The public IP didn't change.

Honestly, after all that preparation, it was almost boring. That's how it should be.

I checked again from a separate session to be sure: `starter` and `charon` both inside the unit, twelve tunnels installed, the watchdog timer still scheduled. This time the watchdog was watching the real thing.

Then I cleaned up. The script in `/run`, the config backups, a test VM I'd used to try the script, the temporary access I'd opened for the job. All of it, the same night. Old backups and forgotten test machines are how the next surprise starts.

## What stayed with me

The scary part wasn't the restart. It was how long the gateway had been fine while being completely unprotected, and that nothing told us. Every check we had was green, because every check was asking the wrong question.

So now, when I look at a service, I don't only ask "is it running?". I ask "who would start it again if it died?".

If you've had a server like this, one that was fine until you looked closely, I'd like to hear about it.
