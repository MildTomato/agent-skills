---
title: Don't Phone Home Without Consent
impact: MEDIUM
impactDescription: Violates user trust and privacy expectations
tags: analytics, telemetry, privacy, consent, ethics
---

## Don't Phone Home Without Consent

Never send usage data or crash reports without explicit user consent. CLI users expect control.

**Incorrect (phones home silently):**

```typescript
// NO! Tracks without consent
async function trackUsage(command: string) {
  await fetch('https://analytics.example.com/track', {
    method: 'POST',
    body: JSON.stringify({ command, user: os.userInfo().username }),
  })
}

// Called automatically
trackUsage('deploy')
```

**Correct (opt-in telemetry):**

```typescript
import fs from 'fs'
import path from 'path'

async function trackUsage(command: string) {
  // Check if user has consented
  if (!getTelemetryEnabled()) {
    return
  }

  // Never block main operation
  try {
    // Fire and forget, with timeout
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)

    fetch('https://analytics.example.com/track', {
      method: 'POST',
      body: JSON.stringify({
        command,
        version: VERSION,
        // NO personal data
      }),
      signal: controller.signal,
    }).catch(() => {}) // Never fail the main operation
  } catch {
    // Telemetry failure should never break the CLI
  }
}

function getTelemetryEnabled(): boolean {
  // Check multiple disable methods
  if (process.env.DO_NOT_TRACK === '1') return false
  if (process.env.MYCMD_TELEMETRY === 'off') return false

  const configPath = path.join(os.homedir(), '.mycmd', 'config.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return config.telemetry === true // Default OFF
  }

  return false // Default to OFF, not on
}
```

**First-run consent prompt:**

```typescript
async function checkTelemetryConsent() {
  const configPath = path.join(os.homedir(), '.mycmd', 'config.json')

  if (!fs.existsSync(configPath)) {
    // First run - ask for consent
    if (process.stdin.isTTY) {
      const { consent } = await prompts({
        type: 'confirm',
        name: 'consent',
        message: 'Help improve mycmd by sending anonymous usage data?',
        initial: false,
      })

      fs.mkdirSync(path.dirname(configPath), { recursive: true })
      fs.writeFileSync(
        configPath,
        JSON.stringify({
          telemetry: consent,
        })
      )
    }
  }
}
```

**Provide easy disable:**

```bash
# Environment variable
export MYCMD_TELEMETRY=off

# Config command
mycmd config set telemetry false

# Flag for one-off runs
mycmd deploy --no-telemetry

# Respect DO_NOT_TRACK standard
export DO_NOT_TRACK=1
```

**Be transparent about what you collect:**

```bash
$ mycmd telemetry status
Telemetry: enabled

We collect:
  - Command names (e.g., 'deploy', 'build')
  - CLI version
  - OS type (e.g., 'darwin', 'linux')
  - Anonymized session ID

We do NOT collect:
  - File paths or names
  - Environment variables
  - Personal information
  - Command arguments

Disable: mycmd config set telemetry false
```

**Rules:**

- Default to OFF (opt-in, not opt-out)
- Never block main operation
- Never fail if telemetry fails
- Respect DO_NOT_TRACK env var
- Provide multiple ways to disable
- Be transparent about data collected
