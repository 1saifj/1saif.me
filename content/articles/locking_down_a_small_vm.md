---
title: Locking Down a Small VM Without Spending Money
description: The baseline I use for production VMs. SSH keys, no root login, a private WireGuard path for admin access, fail2ban, a firewall, and a way back in if I lock myself out.
createdAt: "2026-03-14"
updatedAt: "2026-03-14"
featuredImage: "/articles/locking_down_vm_feat.jpg"
tags:
  - security
  - linux
  - devops
  - wireguard
  - ssh
---

I was setting up one of my production servers when I asked myself a simple question: how secure is a basic VM if you don't spend a single extra dollar on it?

A lot of people treat security as something for later, once the project is bigger or the budget is better. I understand why. But this question stayed with me since last year, after seeing how quickly an exposed server becomes an easy target when SSH and access are left too open. Give a new VM a public IP and look at `/var/log/auth.log` the next day. It is full of login attempts for `root`, `admin`, `ubuntu` and every other default user name.

None of what follows costs money. Every tool here is free and already in the package manager. The hard part is doing it before something goes wrong, while the server is still empty and you can break things without consequences.

This is the checklist I go through now, in this order.

## 1. Create your own user and use SSH keys

First, a normal user with sudo, so you never need to log in as root:

```bash
adduser saif
usermod -aG sudo saif
```

On your laptop, create a key if you don't have one, and copy it to the server:

```bash
ssh-keygen -t ed25519 -C "saif@laptop"
ssh-copy-id saif@your-server-ip
```

Open a second terminal and check that `ssh saif@your-server-ip` works without a password. Keep the first session open until you have tested everything below.

## 2. Turn off passwords and root login

Edit `/etc/ssh/sshd_config`, or better, add a drop-in file so package updates don't overwrite your changes:

```bash
sudo nano /etc/ssh/sshd_config.d/10-hardening.conf
```

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers saif
```

Name it `10-` so it's read before the `50-` file. sshd keeps the first value it reads for each option, and some cloud images ship a `50-cloud-init.conf` that turns password login back on. A lower number wins.

Check the config before you reload, because a typo here can lock you out:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

Now try to log in from the second terminal again. If it works, you are fine. If it doesn't, you still have the first session open to fix it.

## 3. A firewall that only opens what you use

`ufw` is enough for a single VM:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

Port 22 stays open for now. The next step moves admin access to a private network, and then we close it.

Something that catches a lot of people: if you run Docker, published ports skip `ufw` completely, because Docker writes its own iptables rules. A container started with `-p 5432:5432` is open to the internet even when `ufw status` says it isn't. Bind internal services to localhost instead:

```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "127.0.0.1:5432:5432"
```

## 4. Move admin access behind WireGuard

This is the step that changes the most. SSH stops being visible to the internet at all. Only devices on your private WireGuard network can reach it.

Install WireGuard on the server and create a key pair. The `umask` makes sure the private key is never readable by other users, not even for a second:

```bash
sudo apt install wireguard
umask 077
wg genkey | sudo tee /etc/wireguard/server.key | wg pubkey | sudo tee /etc/wireguard/server.pub
```

`/etc/wireguard/wg0.conf` on the server:

```ini
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <contents of server.key>

[Peer]
# my laptop
PublicKey = <laptop public key>
AllowedIPs = 10.8.0.2/32
```

And on the laptop:

```ini
[Interface]
Address = 10.8.0.2/24
PrivateKey = <laptop private key>

[Peer]
PublicKey = <contents of server.pub>
Endpoint = your-server-ip:51820
AllowedIPs = 10.8.0.1/32
PersistentKeepalive = 25
```

Start it on both sides with `sudo wg-quick up wg0`, then on the server enable it at boot with `sudo systemctl enable wg-quick@wg0`.

Now open the WireGuard port, allow SSH only from the tunnel, and remove the public SSH rule:

```bash
sudo ufw allow 51820/udp
sudo ufw allow from 10.8.0.0/24 to any port 22 proto tcp
sudo ufw delete allow 22/tcp
```

Test `ssh saif@10.8.0.1` before you close your old session. From now on that is the only way in.

## 5. fail2ban for whatever is still public

With SSH behind WireGuard, fail2ban has less to do, but it still helps for the web server and anything else you expose. A minimal `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
```

Add jails for nginx when you have endpoints that get brute-forced, like a login form.

## 6. A second factor for sudo

Even with keys, I like a second factor on `sudo`, so a stolen key alone isn't enough to become root. `libpam-google-authenticator` works with any TOTP app:

```bash
sudo apt install libpam-google-authenticator
google-authenticator
```

Then add this line at the top of `/etc/pam.d/sudo`:

```
auth required pam_google_authenticator.so
```

Test `sudo -k && sudo true` in a new session before you trust it.

## 7. Keep a way back in

Every step above makes it harder to get in, including for you. Before you finish:

- Know where your cloud provider's web console is. Most providers give you a serial console that works even when SSH and the network are broken.
- Save the TOTP recovery codes somewhere that isn't the server.
- Write down the WireGuard keys and config in your password manager.

## 8. Write down who has access

This one isn't a tool. Keep a short file, in your team's docs and not on the server, that lists every person and every key that can reach production. When someone leaves, you remove their key and their WireGuard peer, and you update the file. On small teams this often slips, because everyone assumes they know who has access.

## Updates

Last thing. Turn on unattended security updates, so the kernel and OpenSSL don't wait for you to remember:

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

That's the whole baseline. Test every step from a second session before you trust it, and keep the list somewhere you'll find it for the next server.

Good security doesn't always need a big budget.

If you do something different on your servers, or you think I missed a step, I'd like to hear it.
