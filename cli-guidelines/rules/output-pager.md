---
title: Use a Pager for Long Output
impact: LOW-MEDIUM
impactDescription: Improves readability of long output
tags: output, pager, less, usability
---

## Use a Pager for Long Output

Automatically page long output (like `git diff` does). Don't dump 1000 lines to the terminal.

**Incorrect (dumps everything):**

```typescript
// Dumps 1000 lines, scrolls off screen
const logs = await getLogs()
logs.forEach((log) => console.log(log))
```

**Correct (uses pager for long output):**

```typescript
import { spawn } from 'child_process'

function page(content: string) {
  // Only page if stdout is TTY
  if (!process.stdout.isTTY) {
    console.log(content)
    return
  }

  const lines = content.split('\n')

  // Don't page if fits on screen
  const termHeight = process.stdout.rows || 24
  if (lines.length <= termHeight) {
    console.log(content)
    return
  }

  // Use pager
  const pager = process.env.PAGER || 'less'
  const less = spawn(pager, ['-FIRX'], {
    stdio: ['pipe', 'inherit', 'inherit'],
  })

  less.stdin.write(content)
  less.stdin.end()
}

// Usage
const logs = await getLogs()
page(logs.join('\n'))
```

**Good options for less:**

- `-F`: Don't page if fits on one screen
- `-I`: Case-insensitive search
- `-R`: Allow colors/escape codes
- `-X`: Don't clear screen on exit

**Provide --no-pager flag:**

```typescript
program.option('--no-pager', 'disable paging').action((options) => {
  if (options.noPager) {
    console.log(content)
  } else {
    page(content)
  }
})
```

**Libraries that handle this:**

```typescript
// Use a library for better cross-platform support
import terminalKit from 'terminal-kit'

const term = terminalKit.terminal
term.pager(content)
```

**When to page:**

- Help text with many commands
- Log output
- Diff output
- Large data listings
- Any output >100 lines

**When NOT to page:**

- Output is piped: `mycmd logs | grep error`
- `--json` or `--plain` output
- Non-TTY output
- User passed `--no-pager`

**Check if output is piped:**

```typescript
if (!process.stdout.isTTY || options.json || options.noPager) {
  // Don't page
  console.log(content)
} else {
  // Use pager
  page(content)
}
```
