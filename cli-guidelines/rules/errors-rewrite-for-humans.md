---
title: Catch Errors and Rewrite for Humans
impact: HIGH
impactDescription: Reduces user frustration and support requests
tags: errors, usability, messages, troubleshooting
---

## Catch Errors and Rewrite for Humans

Catch expected errors and rewrite them with helpful, actionable messages. Don't show raw system errors.

**Incorrect (exposes raw error):**

```typescript
// Raw error - unhelpful
const config = fs.readFileSync('/etc/config')
// EACCES: permission denied, open '/etc/config'
```

**Correct (helpful error message):**

```typescript
import fs from 'fs'

try {
  const config = fs.readFileSync('/etc/config', 'utf-8')
} catch (error) {
  if (error.code === 'EACCES') {
    console.error("Error: Can't read /etc/config")
    console.error('Try running with sudo, or check file permissions:')
    console.error('  sudo chmod 644 /etc/config')
    process.exit(1)
  } else if (error.code === 'ENOENT') {
    console.error('Error: Config file not found: /etc/config')
    console.error('Create one with: mycmd init')
    process.exit(1)
  }
  throw error
}
```

**Error message structure:**

1. **What happened** (brief)
2. **Why it happened** (if known)
3. **How to fix it** (actionable)

**Good error messages (terminal output):**

```
$ mycmd deploy

Error: Can't connect to database at localhost:5432

The database server may not be running.

Try one of these:
  docker start postgres
  pg_ctl start
```

```
$ mycmd start

Error: Invalid configuration in ~/.mycmdrc

Line 5: Expected format: key = value
Got:    invalid syntax here

Fix your config file or run: mycmd init
```

**Compare to raw errors:**

```
# Bad - raw system error (confusing)
$ mycmd deploy
ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1595:16)

# Good - helpful message (actionable)
$ mycmd deploy
Error: Can't connect to database at localhost:5432

Is the database running? 
Try: docker start postgres
```

**Catch common Node.js errors:**

```typescript
catch (error) {
  if (error.code === 'EACCES') { /* Permission denied */ }
  if (error.code === 'ENOENT') { /* File not found */ }
  if (error.code === 'ECONNREFUSED') { /* Connection refused */ }
  if (error.code === 'ETIMEDOUT') { /* Timeout */ }
}
```

**Don't expose:**

- Raw exception stack traces (unless in debug mode)
- Technical jargon users won't understand
- Internal implementation details
