---
title: Send Progress to stderr, Data to stdout
impact: HIGH
impactDescription: Enables agents to capture output without progress noise
tags: agents, stdout, stderr, progress, output, piping
---

## Send Progress to stderr, Data to stdout

AI agents capture stdout for data. Send all progress, logs, and status to stderr.

**Incorrect (mixes progress with data):**

```typescript
async function export() {
  console.log("Exporting users...")      // Goes to stdout!
  const users = await getUsers()
  console.log("Processing...")            // Goes to stdout!
  console.log(JSON.stringify(users))      // Mixed with progress!
}
```

**Correct (progress to stderr, data to stdout):**

```typescript
async function export() {
  console.error("Exporting users...")     // stderr
  const users = await getUsers()
  console.error("Processing...")          // stderr
  console.log(JSON.stringify(users))      // stdout - clean data
}
```

**Why this matters for agents:**

```typescript
// Agent captures stdout
const { stdout } = await exec('mycmd export --json')
const data = JSON.parse(stdout) // Clean JSON, no progress messages

// Progress visible to user (stderr)
// Exporting users...
// Processing...
```

**Use logging libraries that respect streams:**

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      stream: process.stderr, // All logs to stderr
    }),
  ],
})

logger.info('Processing...') // stderr
console.log(JSON.stringify(result)) // stdout
```

**Progress bars should go to stderr:**

```typescript
import ora from 'ora'

const spinner = ora({ stream: process.stderr })
spinner.start('Loading...')

const data = await fetchData()

spinner.stop()
console.log(JSON.stringify(data)) // Clean stdout
```

**Rule of thumb:**

| Stream     | Content                                  |
| ---------- | ---------------------------------------- |
| **stdout** | Primary output, --json data, piped data  |
| **stderr** | Progress, logs, warnings, errors, status |

**Verify with piping:**

```bash
# Should work cleanly
mycmd export --json | jq '.users[]'

# Bad: if progress goes to stdout
mycmd export --json | jq '.users[]'
# parse error: Invalid JSON (progress messages mixed in)
```

**Even --verbose output goes to stderr:**

```typescript
if (options.verbose) {
  console.error('[DEBUG] Fetching from API...') // stderr
  console.error('[DEBUG] Got 100 items') // stderr
}
console.log(JSON.stringify(items)) // stdout
```
