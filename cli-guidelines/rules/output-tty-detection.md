---
title: Check if TTY Before Using Colors/Animations
impact: HIGH
impactDescription: Prevents broken output in pipes and CI/CD
tags: output, tty, colors, animations, piping
---

## Check if TTY Before Using Colors/Animations

Only use colors, animations, and formatting when outputting to an interactive terminal (TTY). Otherwise output will break in pipes and scripts.

**Incorrect (always uses colors):**

```typescript
// Breaks when piped
console.log('\x1b[32mSuccess!\x1b[0m') // Always outputs escape codes
```

**Correct (checks for TTY):**

```typescript
function printSuccess(message: string) {
  if (process.stdout.isTTY) {
    // Interactive terminal - use colors
    console.log(`\x1b[32m${message}\x1b[0m`)
  } else {
    // Piped or redirected - plain text
    console.log(message)
  }
}

printSuccess('Success!')
```

**Using chalk library (recommended):**

```typescript
import chalk from 'chalk'

// chalk automatically detects TTY
console.log(chalk.green('Success!'))
// Outputs colors in terminal, plain text when piped
```

**Other languages:**

```go
import "github.com/mattn/go-isatty"

if isatty.IsTerminal(os.Stdout.Fd()) {
    fmt.Println("\033[32mSuccess!\033[0m")
} else {
    fmt.Println("Success!")
}
```

```python
import sys
if sys.stdout.isatty():
    print("\033[32mSuccess!\033[0m")
else:
    print("Success!")
```

**Also disable colors when:**

- `NO_COLOR` environment variable is set (non-empty)
- `TERM=dumb`
- `--no-color` flag is passed
- Outputting to a file or pipe

**Animations must also check TTY:**

```typescript
if (process.stderr.isTTY) {
  showProgressBar()
} else {
  console.error('Processing...')
}
```

Reference: https://no-color.org/
