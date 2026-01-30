---
title: Design for Crash-Only Operation
impact: MEDIUM-HIGH
impactDescription: Program can be killed at any time without corruption
tags: signals, robustness, crash-only, recovery, cleanup
---

## Design for Crash-Only Operation

Design your CLI to be safely killed at any time. Don't rely on cleanup code running.

**Incorrect (relies on cleanup):**

```typescript
let tempFiles: string[] = []

async function process() {
  tempFiles.push('/tmp/data1', '/tmp/data2')
  await doWork()
  // Relies on cleanup - breaks if killed
  cleanupTempFiles()
}

process.on('exit', cleanupTempFiles) // Not guaranteed to run
```

**Correct (crash-safe design):**

```typescript
import fs from 'fs'
import path from 'path'
import os from 'os'

async function process() {
  // Clean up stale temp files on startup
  cleanupOldTempFiles()

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mycmd-'))

  try {
    await doWork()
  } finally {
    // Try to cleanup, but don't rely on it
    try {
      fs.rmSync(tempDir, { recursive: true })
    } catch {
      // If cleanup fails, startup cleanup will handle it next time
    }
  }
}

function cleanupOldTempFiles() {
  // Remove any temp files from previous crashed runs
  const tmpDir = os.tmpdir()
  const files = fs.readdirSync(tmpDir)
  files.forEach((file) => {
    if (file.startsWith('mycmd-') && isOldEnough(file)) {
      fs.rmSync(path.join(tmpDir, file), { recursive: true })
    }
  })
}
```

**Use atomic operations:**

```typescript
// Atomic file write - never leaves partial file
function atomicWrite(filePath: string, content: string) {
  const tempPath = `${filePath}.tmp.${Date.now()}`
  fs.writeFileSync(tempPath, content)
  fs.renameSync(tempPath, filePath) // Atomic on same filesystem
}

// If killed during write, next run sees:
// - Old file (if rename didn't happen)
// - New file (if rename succeeded)
// Never a partial/corrupt file
```

**Check for stale state on startup:**

```typescript
async function start() {
  // Check for lock file from crashed run
  if (fs.existsSync('.mycmd.lock')) {
    const pid = fs.readFileSync('.mycmd.lock', 'utf-8')
    if (!isProcessRunning(pid)) {
      console.error('Cleaning up from previous crashed run...')
      fs.unlinkSync('.mycmd.lock')
    }
  }

  // Create lock file
  fs.writeFileSync('.mycmd.lock', process.pid.toString())
}
```

**Principles:**

- Don't require cleanup to complete
- Use atomic file operations
- Check for stale state on startup
- Clean up in next run, not during shutdown

Reference: https://lwn.net/Articles/191059/
