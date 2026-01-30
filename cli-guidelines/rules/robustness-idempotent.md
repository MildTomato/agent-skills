---
title: Make Operations Idempotent
impact: MEDIUM
impactDescription: Safe to retry, arrow-up and enter works
tags: robustness, idempotency, reliability, recovery
---

## Make Operations Idempotent

Design operations to be safe to run multiple times. Running twice should have the same effect as running once.

**Incorrect (fails on retry):**

```typescript
async function deploy() {
  fs.mkdirSync('/var/app') // Fails if already exists
  await uploadFiles() // Re-uploads all files
  await startService() // Fails if already running
}
```

**Correct (idempotent):**

```typescript
import fs from 'fs'

async function deploy() {
  // Creates only if doesn't exist
  fs.mkdirSync('/var/app', { recursive: true })

  // Uploads only changed files
  await syncFiles({ onlyIfDifferent: true })

  // Starts or restarts service
  if (await isRunning()) {
    await restartService()
  } else {
    await startService()
  }
}
```

**Check existing state:**

```typescript
async function setupDatabase() {
  if (await databaseExists()) {
    console.error('Database already exists, skipping creation')
    return
  }

  await createDatabase()
  await runMigrations()
}
```

**Idempotent file operations:**

```typescript
// Creates only if missing
fs.mkdirSync(path, { recursive: true })

// Writes or overwrites (same result)
fs.writeFileSync(path, content)

// Appends only if not present
function appendIfMissing(file: string, line: string) {
  const content = fs.readFileSync(file, 'utf-8')
  if (content.includes(line)) {
    return // Already present
  }
  fs.appendFileSync(file, line + '\n')
}
```

**Benefits for users:**

```bash
# Network failed halfway through?
$ mycmd deploy
Error: Connection lost

# Just hit up-arrow and enter - picks up where it left off
$ mycmd deploy
Already deployed, checking for updates...
Done!
```

**Provide status commands:**

```bash
$ mycmd deploy
Deployment already complete (ran 2 hours ago)
Use --force to redeploy anyway
```

**Atomic operations prevent partial state:**

```typescript
import fs from 'fs'
import os from 'os'
import path from 'path'

// Atomic file write
function atomicWrite(filePath: string, content: string) {
  const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}`)
  fs.writeFileSync(tempPath, content)
  fs.renameSync(tempPath, filePath) // Atomic rename
}
```

Reference: https://lwn.net/Articles/191059/ (Crash-only software)
