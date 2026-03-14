# ClawHome - Install OpenClaw on Windows (Complete Guide)

**The easiest way to run [OpenClaw](https://github.com/openclaw/openclaw) on Windows 10 / 11.** Pre-configured installer + step-by-step manual guide + WSL2 setup + common Windows fixes.

[![GitHub stars](https://img.shields.io/github/stars/keugenek/clawhome?style=social)](https://github.com/keugenek/clawhome/stargazers)
[![OpenClaw](https://img.shields.io/badge/powered%20by-OpenClaw-orange)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Download](https://img.shields.io/badge/download-chatterpc.com-brightgreen)](https://chatterpc.com/downloads)

OpenClaw is a self-hosted personal AI assistant that runs on your own machine — no subscriptions, no cloud, your data stays local. **This repo is a Windows-focused installation guide and pre-packaged installer**, because OpenClaw's official docs are Linux-first and Windows users hit a lot of friction.

What you get after installing OpenClaw on Windows:

- **AI in Telegram, Discord & WhatsApp** - chat with your AI in apps you already use
- **Runs 24/7 as a Windows service** - starts automatically with your PC
- **Connects to any model** - Claude, GPT-4o, local Llama, Mistral
- **100+ skills / integrations** - GitHub, Notion, weather, Home Assistant, eBay...
- **100% local** - your conversations never leave your machine

> **Searching for:** OpenClaw Windows install | OpenClaw Windows 10 | OpenClaw Windows 11 | how to install OpenClaw on Windows | OpenClaw WSL2 | OpenClaw not working Windows | openclaw gateway Windows

---

## Choose your install path

### Option 1 - ChatterPC Installer (Recommended)

**One-click setup. Free to use. No registration required.**

**[>> Download from chatterpc.com <<](https://chatterpc.com/downloads)**

- Download the `.msi` and run it - the wizard does everything
- Handles Node.js, PATH, and Windows service registration automatically
- No terminal, no dependencies, no configuration headaches
- Works on Windows 10 and 11

The wizard will ask for your Telegram bot token and AI API key, then you're done.

> **Not sure which to pick?** Use Option 1. Option 2 is for developers who want to tinker.

---

### Option 2 - Manual Install on Windows (Advanced)

**For developers who want full control over a native Windows install.**

Requires: Node.js 22+, Git, PowerShell, comfort with the terminal.

See the [step-by-step guide](#manual-install-guide) below.

---

### Option 3 - WSL2 (OpenClaw's Official Recommendation)

**The path OpenClaw's own docs recommend - but with a major trade-off.**

OpenClaw officially recommends installing inside WSL2 (Windows Subsystem for Linux) because the runtime is more stable and Linux tooling works without friction. If you're comfortable with Linux and don't need your AI to actually control your Windows machine, this is the most reliable path.

**But read this first:**

> **WSL2 runs a real Linux VM inside Windows. OpenClaw inside WSL2 cannot directly access your Windows files, apps, clipboard, or desktop.** It lives in a sandboxed Linux environment, not on your Windows machine. When the AI tries to open a file, run a command, or access a folder - it's doing that inside Linux, not Windows.

What this means in practice:

| Feature | Native Windows install | WSL2 install |
|---|---|---|
| Access Windows files (`C:\Users\...`) | Yes, directly | Partial - via `/mnt/c/` path, slow |
| Run Windows apps (Notepad, Explorer...) | Yes | No |
| Control Windows clipboard | Yes | No |
| Run PowerShell commands | Yes | No (bash only) |
| Browser automation on your desktop | Yes | Limited |
| Home Assistant / local network tools | Yes | Requires port forwarding |
| Works offline / local AI | Yes | Yes |
| Gateway reliability | Good (some known bugs) | Excellent |
| Skill compatibility | Good | Excellent |

**Bottom line:** WSL2 gives you a smoother OpenClaw experience, but it's a Linux AI assistant running in a box - not a Windows AI assistant. If you want your AI to actually help you with Windows tasks, use Option 1 or Option 2.

See the [WSL2 guide](#wsl2-install-guide) below if you still want to go this route.

---

## Manual Install Guide

> This is the guide the official docs don't give you - written from real issues and user reports.

### Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Windows | 10 / 11 | `winver` |
| Node.js | **22 or higher** | `node --version` |
| Git | Any | `git --version` |
| PowerShell | 5.1+ | `$PSVersionTable` |

> **Node.js version matters.** Node 18 and 20 cause silent failures. Install Node 22 from [nodejs.org](https://nodejs.org) or via `winget install OpenJS.NodeJS.LTS`.

---

### Step 1 - Install

Open PowerShell **as Administrator**:

```powershell
# 1. Allow scripts to run (if not already set)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Install OpenClaw
npm install -g openclaw

# 3. Verify
openclaw --version
```

---

### Step 2 - Run onboarding

```powershell
openclaw onboard
```

The wizard asks for:
- **AI model API key** (Anthropic Claude / OpenAI / etc.)
- **Telegram bot token** (from [@BotFather](https://t.me/BotFather) - takes 30 seconds)
- **Gateway service install** - say yes, this makes OpenClaw start with Windows

> If onboarding hangs at the gateway health check, use `openclaw onboard --skip-health` and start the gateway manually after.

---

### Step 3 - Start the gateway

```powershell
# Install as a Windows service (runs on startup)
openclaw gateway install

# Check status
openclaw gateway status
```

---

### Step 4 - Connect Telegram

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` - give it a name - copy the token
3. Run: `openclaw configure` - select **Telegram** - paste your token

Then message your new bot on Telegram. Done.

---

### Step 5 - Verify

```powershell
openclaw doctor
openclaw status
```

`doctor` checks every component and tells you what's broken.

---

## WSL2 Install Guide

> **Remember:** OpenClaw in WSL2 runs inside a Linux VM. It cannot control your Windows desktop, run PowerShell, or access Windows apps. If that's fine for your use case (chat assistant, web tasks, automation that doesn't touch Windows), read on.

### Prerequisites

- Windows 10 version 2004+ or Windows 11
- Virtualization enabled in BIOS (usually already on)
- ~5 GB free disk space for WSL2 + Ubuntu

### Step 1 - Install WSL2 and Ubuntu

Open PowerShell **as Administrator**:

```powershell
wsl --install
# Or pick Ubuntu explicitly:
wsl --install -d Ubuntu-24.04
```

Reboot when prompted.

> If `wsl --install` fails, enable virtualization in BIOS first, then retry.

---

### Step 2 - Enable systemd (required for gateway)

Open your Ubuntu terminal (search "Ubuntu" in Start menu), then run:

```bash
sudo tee /etc/wsl.conf > /dev/null << 'EOF'
[boot]
systemd=true
EOF
```

Then from PowerShell, shut down WSL:

```powershell
wsl --shutdown
```

Re-open Ubuntu and verify systemd is running:

```bash
systemctl --user status
# Should say "active" - if it says "Failed to connect", systemd is not running
```

---

### Step 3 - Install OpenClaw (inside Ubuntu)

```bash
# Install Node.js 22 via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node --version  # should say v22.x.x

# Install OpenClaw
npm install -g openclaw
openclaw --version
```

---

### Step 4 - Run onboarding

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag installs the gateway as a systemd user service - it will start automatically when Ubuntu starts.

The wizard asks for:
- **AI API key** (Anthropic / OpenAI / etc.)
- **Telegram bot token** (from [@BotFather](https://t.me/BotFather))

> If onboarding hangs at the health check: `openclaw onboard --skip-health`, then start the gateway manually.

---

### Step 5 - Connect Telegram

```bash
openclaw configure
# Select Telegram -> paste bot token
```

Message your bot on Telegram to test. Done.

---

### Step 6 - Make gateway auto-start with Windows

By default, WSL2 only runs when you have an Ubuntu terminal open. To keep the gateway running in the background:

**Keep WSL alive without a terminal open:**

```bash
# Inside Ubuntu - enable lingering (gateway survives logout)
sudo loginctl enable-linger "$(whoami)"
```

**Auto-start WSL at Windows boot (run in PowerShell as Admin):**

```powershell
schtasks /create /tn "WSL Boot" /tr "wsl.exe -d Ubuntu-24.04 --exec /bin/true" /sc onstart /ru SYSTEM
```

Replace `Ubuntu-24.04` with your distro name if different (`wsl --list --verbose` to check).

After the next reboot, WSL will start automatically and the gateway will be running before you even log in.

---

### Step 7 - Verify

```bash
openclaw doctor
openclaw gateway status
systemctl --user status openclaw-gateway
```

---

### WSL2 - Accessing Windows files from Linux

If you need OpenClaw to read/write Windows files from WSL2, your Windows drives are mounted at `/mnt/`:

```bash
ls /mnt/c/Users/YourName/Documents
# Windows: C:\Users\YourName\Documents
```

> **Performance warning:** File operations across the WSL/Windows boundary (`/mnt/c/...`) are significantly slower than native paths. Keep your workspace inside WSL (`~/`) for speed.

---

### WSL2 - Exposing the gateway to other devices on your network

WSL2 has its own internal IP that changes on every restart. If you want to access the gateway from another device (phone, tablet, other PC):

```powershell
# Run in PowerShell as Administrator after each WSL restart:
$wslIp = (wsl -d Ubuntu-24.04 -- hostname -I).Trim().Split(" ")[0]
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=18789 connectaddress=$wslIp connectport=18789

# Allow through Windows Firewall (one-time):
New-NetFirewallRule -DisplayName "OpenClaw Gateway" -Direction Inbound -Protocol TCP -LocalPort 18789 -Action Allow
```

To automate this at login, save it as a `.ps1` script and add it to Task Scheduler.

---

### WSL2 - Common Issues

**Gateway stops when Ubuntu terminal is closed**

Enable lingering and the systemd service (Step 6 above).

**`openclaw doctor` shows "systemd not running"**

You skipped Step 2. Run it now, then `wsl --shutdown` from PowerShell, reopen Ubuntu.

**Can't reach gateway from Windows browser (`localhost:18789`)**

WSL2 networking changed in recent Windows versions. Try:

```powershell
# From PowerShell:
$wslIp = (wsl -- hostname -I).Trim().Split(" ")[0]
# Then open http://<wslIp>:18789 in your browser
```

Or enable mirrored networking (Windows 11 only):

```powershell
# Add to C:\Users\YourName\.wslconfig:
[wsl2]
networkingMode=mirrored
```

Then `wsl --shutdown` and restart.

**`nvm: command not found` after install**

```bash
source ~/.bashrc
# or
source ~/.nvm/nvm.sh
```

---

## Common Windows Problems (& Fixes)

Compiled from 90+ real GitHub issues and Reddit threads.

---

### Install script closes PowerShell immediately

**Symptom:** `install.ps1` opens and immediately closes.
**Cause:** PowerShell Execution Policy blocks unsigned scripts.

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then retry the install
```

On **Windows LTSC** (no winget), use npm directly:

```powershell
npm install -g openclaw
```

---

### "Node.js not found" or npm errors after install

**Symptom:** `openclaw: command not found` or npm errors.
**Cause:** npm global bin not in PATH, or wrong Node version.

```powershell
# Check Node version - must be 22+
node --version

# Fix PATH manually if needed
$npmBin = "$(npm config get prefix)\bin"
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$npmBin", "User")
# Restart PowerShell after this
```

---

### Dashboard returns "Not Found" / 404

**Symptom:** `http://localhost:18789` shows "Not Found".
**Cause:** Control UI files missing after upgrade.

```powershell
openclaw doctor
# If that doesn't help:
openclaw gateway stop
npm install -g openclaw@latest
openclaw gateway start
```

---

### Gateway stops when you close PowerShell

**Symptom:** AI stops responding when terminal is closed.
**Cause:** Gateway running in foreground, not as a service.

```powershell
openclaw gateway install
openclaw gateway status --json
```

---

### "Gateway unreachable" but it's actually running

**Symptom:** `openclaw status` reports unreachable, but the gateway works fine.
**Cause:** Known probe bug on some Windows setups ([#45940](https://github.com/openclaw/openclaw/issues/45940)).

```powershell
# Check if gateway is actually listening:
netstat -an | findstr 18789
# LISTENING = gateway is running fine, ignore the probe error

Invoke-WebRequest http://localhost:18789/healthz -UseBasicParsing
```

---

### Black console windows flashing every 30 seconds

**Symptom:** CMD/PowerShell window briefly appears repeatedly on screen.
**Cause:** Background processes missing `windowsHide` flag - known issue ([#22851](https://github.com/openclaw/openclaw/issues/22851), [#25856](https://github.com/openclaw/openclaw/issues/25856)).

```powershell
# Run as a Scheduled Task (not foreground terminal) to minimize this:
openclaw gateway install
openclaw gateway start
# Close the terminal - runs silently
```

---

### `openclaw update` fails with EBUSY

**Symptom:** `Error: EBUSY: resource busy or locked`
**Cause:** Gateway holds file locks during update.

```powershell
openclaw gateway stop
npm install -g openclaw@latest
openclaw gateway start
```

---

### Telegram voice messages not transcribed

**Cause:** Audio transcription needs explicit config on Windows.

Add to `~/.openclaw/openclaw.json`:

```json
{
  "tools": {
    "media": {
      "audio": {
        "enabled": true
      }
    }
  }
}
```

```powershell
openclaw gateway restart
```

---

### Gateway fails - username has spaces or special characters

**Cause:** Path handling bug ([#43943](https://github.com/openclaw/openclaw/issues/43943)).

```powershell
npm config set prefix "C:\openclaw"
npm install -g openclaw
# Add C:\openclaw\bin to your user PATH
```

---

### write tool creates files, edit tool says "Could not find exact text"

**Cause:** Windows writes UTF-8 with BOM; known bug ([#45432](https://github.com/openclaw/openclaw/issues/45432)).

```powershell
# Use explicit UTF-8 without BOM:
[System.IO.File]::WriteAllText("file.txt", $content, [System.Text.Encoding]::UTF8)
```

---

### OOM crash after updating to v2026.3.12+

**Cause:** Memory regression ([#45962](https://github.com/openclaw/openclaw/issues/45962)).

```powershell
# Pin to last known-good version:
npm install -g openclaw@2026.3.11
openclaw gateway restart
```

---

### exec tool - PowerShell `$` variables get mangled

**Cause:** Dollar-sign interpolation in command strings ([#16821](https://github.com/openclaw/openclaw/issues/16821)).

```powershell
# Use single quotes for literal strings:
echo '$HOME'   # correct
echo "$HOME"   # wrong - gets interpolated
```

---

### Agent tools (exec, web_fetch) disabled after install

**Cause:** Tool permissions default to restricted in some versions.

Add to `~/.openclaw/openclaw.json`:

```json
{
  "tools": {
    "exec": { "enabled": true, "security": "allowlist" },
    "web_fetch": { "enabled": true }
  }
}
```

```powershell
openclaw gateway restart
```

---

### `/restart` command does nothing

**Cause:** schtasks restart not fully implemented on all setups ([#29949](https://github.com/openclaw/openclaw/issues/29949)).

```powershell
openclaw gateway restart
```

---

## Useful Commands

```powershell
openclaw doctor            # run this when anything breaks
openclaw gateway status    # check gateway health
openclaw logs --follow     # live logs
openclaw gateway restart   # restart gateway
openclaw configure         # change API keys / channels
```

---

## Where to Get Help

- **Download (easiest way):** [chatterpc.com/downloads](https://chatterpc.com/downloads)
- **Docs:** [docs.openclaw.ai](https://docs.openclaw.ai)
- **GitHub Issues:** [openclaw/openclaw](https://github.com/openclaw/openclaw/issues)

---

## Contributing

Got a Windows fix or workaround? PRs and issues welcome. This repo is a living document of what actually works on Windows.

## License

MIT - [openclaw/openclaw](https://github.com/openclaw/openclaw)
