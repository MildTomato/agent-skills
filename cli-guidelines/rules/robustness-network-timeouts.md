---
title: Set Timeouts on Network Operations
impact: HIGH
impactDescription: Prevents hanging forever on network issues
tags: robustness, network, timeouts, http, reliability
---

## Set Timeouts on Network Operations

Always set timeouts on network operations. Don't let your CLI hang forever.

**Incorrect (no timeout - hangs forever):**

```typescript
// Hangs forever if server doesn't respond
const response = await fetch(url)
```

**Correct (with timeout):**

```typescript
// Times out after 30 seconds
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 30000)

try {
  const response = await fetch(url, {
    signal: controller.signal,
  })
  clearTimeout(timeout)
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Error: Request timed out after 30s')
    console.error('Check your network connection')
    process.exit(4) // Network error exit code
  }
  throw error
}
```

**Using axios (simpler):**

```typescript
import axios from 'axios'

const response = await axios.get(url, {
  timeout: 30000, // 30 second timeout
})
```

**Make timeouts configurable:**

```typescript
program.option('--timeout <seconds>', 'network timeout', '30').action(async (options) => {
  const timeoutMs = parseInt(options.timeout) * 1000

  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  })
})
```

**Different timeouts for different operations:**

```typescript
const TIMEOUTS = {
  connect: 5000, // 5s to establish connection
  read: 30000, // 30s to read response
  upload: 300000, // 5 minutes for large uploads
}

await fetch(url, {
  signal: AbortSignal.timeout(TIMEOUTS.read),
})
```

**Show timeout in error:**

```typescript
catch (error) {
  if (error.name === 'AbortError') {
    console.error(`Error: Request timed out after ${timeout/1000}s`)
    console.error('Try:')
    console.error(`  - Increase timeout: mycmd --timeout 60`)
    console.error(`  - Check network connection`)
    process.exit(4)
  }
}
```

**Retry with backoff for transient failures:**

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, {
        signal: AbortSignal.timeout(30000),
      })
    } catch (error) {
      if (attempt === maxRetries - 1) throw error

      const backoff = Math.pow(2, attempt) * 1000
      console.error(`Retry in ${backoff / 1000}s...`)
      await sleep(backoff)
    }
  }
}
```

**Default timeouts:**

- Connection: 5-10 seconds
- Read: 30-60 seconds
- Large uploads: 5-10 minutes
