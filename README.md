# ClawHome - Your AI Brain. At Home.

> Personal AI assistant that runs on your Windows PC. Connects to Telegram, Discord & WhatsApp. No subscriptions. No cloud. Yours forever.

[![GitHub stars](https://img.shields.io/github/stars/keugenek/clawhome?style=social)](https://github.com/keugenek/clawhome/stargazers)
[![OpenClaw](https://img.shields.io/badge/powered%20by-OpenClaw-orange)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Download](https://img.shields.io/badge/download-chatterpc.com-brightgreen)](https://chatterpc.com/downloads)

A pre-configured [OpenClaw](https://github.com/openclaw/openclaw) setup for Windows. Install it, link your Telegram bot, and your AI is live in under 3 minutes.

- **Ask questions**, set reminders, search files
- **Runs 24/7** in the background as a Windows service
- **Connects to any AI model** - Claude, GPT-4o, local Llama
- **100+ integrations** via skills (GitHub, Notion, weather, Home Assistant...)
- **Your data stays on your machine** - no cloud middleman

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

### Option 2 - Manual Install (Advanced)

**For developers who want full control.**

Requires: Node.js 22+, Git, PowerShell, comfort with the terminal.

See the [step-by-step guide](#manual-install-guide) below.

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
