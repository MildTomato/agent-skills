---
title: Don't Read Secrets from Flags
impact: CRITICAL
impactDescription: Prevents credential leaks via ps and shell history
tags: security, secrets, flags, credentials, passwords
---

## Don't Read Secrets from Flags

Never accept secrets via command-line flags. Flags leak into `ps` output and shell history.

**Incorrect (exposes secrets):**

```bash
# BAD - visible in ps output and shell history
mycmd deploy --password secretpass123
mycmd login --api-key sk_live_abc123xyz
```

**Correct (secure methods):**

```bash
# Method 1: Read from file
mycmd deploy --password-file ~/.mycmd/password

# Method 2: Read from stdin
echo "secretpass123" | mycmd deploy --password-stdin
cat ~/.mycmd/password | mycmd login --password-stdin

# Method 3: Prompt interactively (no echo)
mycmd login  # Prompts: "Password: " (input hidden)
```

**Why flags are insecure:**

```bash
# Anyone can see secrets in process list
$ mycmd deploy --password secret123 &
$ ps aux | grep mycmd
user  1234  mycmd deploy --password secret123  # EXPOSED!

# Secrets stay in shell history
$ history
  501  mycmd login --api-key sk_live_abc123  # EXPOSED!
```

**Implementation:**

```typescript
import fs from 'fs'
import readline from 'readline'

async function getPassword(passwordFile?: string): Promise<string> {
  if (passwordFile) {
    // Read from file
    return fs.readFileSync(passwordFile, 'utf-8').trim()
  } else if (!process.stdin.isTTY) {
    // Read from stdin
    const rl = readline.createInterface({ input: process.stdin })
    return new Promise((resolve) => {
      rl.on('line', (line) => {
        resolve(line.trim())
        rl.close()
      })
    })
  } else {
    // Prompt interactively (no echo)
    const { default: prompts } = await import('prompts')
    const { password } = await prompts({
      type: 'password',
      name: 'password',
      message: 'Password',
    })
    return password
  }
}

// Usage with commander
program.option('--password-file <file>', 'path to password file')
```

**Environment variables are also insecure:**

- Visible to child processes
- Leak into debug logs
- Visible via `docker inspect`, `systemctl show`

**Use instead:**

- Credential files with restricted permissions (`chmod 600`)
- Secret management services (Vault, AWS Secrets Manager)
- OS keychain/credential manager
- Stdin or interactive prompts
