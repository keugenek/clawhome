# 🧠 ClawHome — Your AI Brain. At Home.

> Personal AI assistant that runs on your Windows PC. Connects to Telegram, Discord & WhatsApp. No subscriptions. No cloud. Yours forever.

<!-- GIF placeholder — replace with actual demo recording -->
<!-- ![ClawHome demo](demo.gif) -->

[![GitHub stars](https://img.shields.io/github/stars/keugenek/clawhome?style=social)](https://github.com/keugenek/clawhome/stargazers)
[![OpenClaw](https://img.shields.io/badge/powered%20by-OpenClaw-orange)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Download](https://img.shields.io/badge/download-chatterpc.com-brightgreen)](https://chatterpc.com/downloads)

---

## What is this?

ClawHome is a pre-configured [OpenClaw](https://github.com/openclaw/openclaw) setup for Windows, packaged as a one-click installer via [ChatterPC](https://chatterpc.com).

You install it, link your Telegram bot, and your AI is live — right inside the apps you already use.

- **Ask questions**, set reminders, search files
- **Runs 24/7** in the background as a Windows service
- **Connects to any AI model** — Claude, GPT-4o, local Llama
- **100+ integrations** via skills (GitHub, Notion, weather, home assistant…)
- **Your data stays on your machine** — no cloud middleman

---

## Quick Install (Windows)

**Option A — ChatterPC installer (recommended)**

Download from [chatterpc.com/downloads](https://chatterpc.com/downloads), run the `.msi`, done.

**Option B — npm (advanced)**

```powershell
# Requires Node.js 22+
npm install -g openclaw
openclaw onboard
```

---

## Windows Setup Guide

This is the guide the official docs don't give you — written from real issues and user reports.

### Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Windows | 10 / 11 | `winver` |
| Node.js | **22 or higher** | `node --version` |
| Git | Any | `git --version` |
| PowerShell | 5.1+ | `$PSVersionTable` |

> ⚠️ **Node.js version matters.** Node 18 and 20 cause silent failures. Install Node 22 from [nodejs.org](https://nodejs.org) or via `winget install OpenJS.NodeJS.LTS`.

---

### Step 1 — Install

**Via ChatterPC (easiest):**

Download and run the installer from [chatterpc.com/downloads](https://chatterpc.com/downloads).

The installer handles Node.js detection, path setup, and service registration automatically.

**Via PowerShell (manual):**

Open PowerShell **as Administrator**:

```powershell
# 1. Allow scripts to run (if not already set)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Install OpenClaw
npm install -g openclaw

# 3. Verify install
openclaw --version
```

---

### Step 2 — Run onboarding

```powershell
openclaw onboard
```

This wizard asks for:
- **AI model API key** (Anthropic Claude / OpenAI / etc.)
- **Telegram bot token** (from [@BotFather](https://t.me/BotFather) — create a new bot, takes 30 seconds)
- **Gateway service install** — say yes, this makes OpenClaw start with Windows

> 💡 If onboarding hangs at the gateway health check, use `openclaw onboard --skip-health` and start the gateway manually after.

---

### Step 3 — Start the gateway

```powershell
# Install as a Windows service (runs on startup)
openclaw gateway install

# Or just run it now (foreground)
openclaw gateway run

# Check status
openclaw gateway status
```

---

### Step 4 — Connect Telegram

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` → give it a name → copy the token
3. Configure it:

```powershell
openclaw configure
```

Select **Telegram** → paste your token.

Then open your new bot on Telegram and say hi. ✅

---

### Step 5 — Verify everything works

```powershell
openclaw doctor
openclaw status
```

`doctor` is your best friend — it checks every component and tells you what's broken.

---

## Common Windows Problems (& Fixes)

This section is compiled from 90+ real GitHub issues and Reddit threads.

---

### ❌ Install script closes PowerShell immediately

**Symptom:** `install.ps1` opens and immediately closes.  
**Cause:** PowerShell Execution Policy blocks unsigned scripts.

```powershell
# Run this first, then retry the install
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

If you're on **Windows LTSC** (no winget), the installer will fail silently. Use the npm method instead:

```powershell
npm install -g openclaw
```

---

### ❌ "Node.js not found" or npm errors after install

**Symptom:** `openclaw: command not found` or npm errors immediately after install.  
**Cause:** npm global bin directory not in PATH, or wrong Node version.

```powershell
# Check Node version — must be 22+
node --version

# Check npm global path
npm config get prefix

# Add npm global bin to PATH manually if needed
$npmBin = "$(npm config get prefix)\bin"
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$npmBin", "User")
# Restart PowerShell after this
```

---

### ❌ Dashboard returns "Not Found" / 404

**Symptom:** Opening `http://localhost:18789` shows "Not Found".  
**Cause:** Control UI files missing (common after `pnpm global install` or upgrade).

```powershell
openclaw doctor
# Doctor will detect and repair missing UI files

# If that doesn't work:
openclaw gateway stop
npm install -g openclaw@latest
openclaw gateway start
```

---

### ❌ Gateway closes when you close PowerShell

**Symptom:** AI stops responding after you close the terminal.  
**Cause:** Gateway running in foreground mode, not as a service.

```powershell
# Install as a proper Windows service
openclaw gateway install

# Verify it's set up as Scheduled Task
openclaw gateway status --json
```

---

### ❌ "Gateway unreachable" / probe false negative

**Symptom:** `openclaw status` or `openclaw gateway probe` reports gateway as unreachable, but it's actually running fine.  
**Cause:** Known bug — probe lacks `operator.read` scope on some Windows setups.

```powershell
# Verify gateway is actually running:
netstat -an | findstr 18789
# If port 18789 shows LISTENING, your gateway is fine — ignore the probe error.

# Or check directly:
Invoke-WebRequest http://localhost:18789/healthz -UseBasicParsing
```

---

### ❌ Console windows flashing every 30 seconds

**Symptom:** A black CMD/PowerShell window flashes briefly on screen repeatedly.  
**Cause:** OpenClaw's background processes (exec tool, ARP scanning, ACP spawns) lack `windowsHide: true` — known issue tracked in [#22851](https://github.com/openclaw/openclaw/issues/22851) and [#25856](https://github.com/openclaw/openclaw/issues/25856).

**Workaround:** Run OpenClaw gateway as a background Scheduled Task (not foreground terminal):
```powershell
openclaw gateway install
openclaw gateway start
# Then close the terminal — it runs silently
```

---

### ❌ `openclaw update` fails with EBUSY error

**Symptom:** `Error: EBUSY: resource busy or locked` during update.  
**Cause:** Gateway is running and holding file locks during the update.

```powershell
# Stop gateway first, then update, then restart
openclaw gateway stop
npm install -g openclaw@latest
openclaw gateway start
```

---

### ❌ Telegram voice messages not transcribed

**Symptom:** You send a voice message to the bot, it either ignores it or sends back the raw file.  
**Cause:** Audio transcription requires explicit config on Windows.

Add to your `openclaw.json` (`~/.openclaw/openclaw.json`):

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

Then restart the gateway:
```powershell
openclaw gateway restart
```

---

### ❌ Gateway fails to start — path with spaces or special characters

**Symptom:** Gateway crashes on start if your Windows username contains spaces, Chinese characters, or special chars.  
**Cause:** Path handling bug ([#43943](https://github.com/openclaw/openclaw/issues/43943), [#37563](https://github.com/openclaw/openclaw/issues/37563)).

**Workaround:** Install to a path without spaces:

```powershell
# Set npm prefix to a simple path
npm config set prefix "C:\openclaw"
npm install -g openclaw
```

Then add `C:\openclaw\bin` to your user PATH.

---

### ❌ Write tool creates files with BOM, edit tool then fails

**Symptom:** `write` tool creates a file, then `edit` tool says "Could not find exact text".  
**Cause:** Windows writes UTF-8 with BOM by default; known bug [#45432](https://github.com/openclaw/openclaw/issues/45432).

**Fix:** In your workspace AGENTS.md, add a note to always use `UTF-8 without BOM`. Alternatively use the `exec` tool with explicit encoding:

```powershell
[System.IO.File]::WriteAllText("file.txt", $content, [System.Text.Encoding]::UTF8)
```

---

### ❌ Out of memory crash (OOM) since v2026.3.12+

**Symptom:** Gateway crashes with OOM error after update.  
**Cause:** Memory regression introduced in 2026.3.12 ([#45962](https://github.com/openclaw/openclaw/issues/45962)).

**Fix:** Pin to last known-good version:

```powershell
npm install -g openclaw@2026.3.11
openclaw gateway restart
```

Or increase Node.js memory limit:

```powershell
# Add to gateway startup (in openclaw.json):
{
  "env": {
    "NODE_OPTIONS": "--max-old-space-size=4096"
  }
}
```

---

### ❌ exec tool — PowerShell `$` variables get mangled

**Symptom:** Commands with `$variables` don't work correctly.  
**Cause:** PowerShell dollar-sign interpolation in command strings ([#16821](https://github.com/openclaw/openclaw/issues/16821)).

**Workaround:** Use single quotes for literal strings, or escape with backtick:

```powershell
# Instead of: echo "$HOME"
# Use:
echo '$HOME'
# Or:
echo "`$HOME"
```

---

### ❌ Agent tools (exec, web_fetch) are disabled / not working

**Symptom:** AI chats fine but can't run commands or search the web after installing.  
**Cause:** Tool permissions default to restricted in some versions.

Check and enable in `~/.openclaw/openclaw.json`:

```json
{
  "tools": {
    "exec": {
      "enabled": true,
      "security": "allowlist"
    },
    "web_fetch": {
      "enabled": true
    }
  }
}
```

Then: `openclaw gateway restart`

---

### ❌ `/restart` command doesn't work

**Symptom:** Sending `/restart` to the bot does nothing or errors.  
**Cause:** Restart via `schtasks` not fully implemented on all Windows setups ([#29949](https://github.com/openclaw/openclaw/issues/29949)).

**Fix:**
```powershell
openclaw gateway restart
```
Run this from PowerShell directly.

---

## Useful Commands

```powershell
# Health check — run this when anything breaks
openclaw doctor

# Check gateway status
openclaw gateway status

# View live logs
openclaw logs --follow

# Restart gateway
openclaw gateway restart

# Update to latest
openclaw gateway stop
npm install -g openclaw@latest
openclaw gateway start

# Full config
openclaw configure
```

---

## Where to Get Help

- 💬 **Discord:** [discord.com/invite/clawd](https://discord.com/invite/clawd)
- 🐛 **GitHub Issues:** [github.com/openclaw/openclaw/issues](https://github.com/openclaw/openclaw/issues)
- 📖 **Docs:** [docs.openclaw.ai](https://docs.openclaw.ai)
- 📥 **ChatterPC Download:** [chatterpc.com/downloads](https://chatterpc.com/downloads)

---

## Contributing

Got a Windows fix or workaround? PRs welcome. This repo is a living document of what actually works on Windows.

## License

MIT — [openclaw/openclaw](https://github.com/openclaw/openclaw)
