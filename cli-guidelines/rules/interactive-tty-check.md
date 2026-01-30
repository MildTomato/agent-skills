---
title: Only Prompt if stdin is a TTY
impact: HIGH
impactDescription: Prevents scripts from hanging on prompts
tags: interactivity, tty, prompts, scripting, automation
---

## Only Prompt if stdin is a TTY

Only use prompts or interactive elements if stdin is an interactive terminal. In scripts and pipes, fail with clear error message.

**Incorrect (always prompts - breaks scripts):**

```typescript
import prompts from 'prompts'

// Hangs in scripts!
const { confirm } = await prompts({
  type: 'confirm',
  name: 'confirm',
  message: 'Continue?',
})
if (!confirm) process.exit(1)
```

**Correct (checks for TTY):**

```typescript
import prompts from 'prompts'

if (process.stdin.isTTY) {
  // Interactive terminal - can prompt
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Continue?',
  })
  if (!confirm) process.exit(1)
} else {
  // Script/pipe - require flag
  if (!options.force) {
    console.error('Error: Use --force in non-interactive mode')
    process.exit(1)
  }
}
```

**Why this matters:**

```bash
# Without TTY check, script hangs forever
$ mycmd deploy
# Waiting for input that never comes...

# With TTY check, fails fast with clear message
$ mycmd deploy
Error: Use --force in non-interactive mode
```

**Always provide non-interactive alternative:**

```bash
# Interactive mode
$ mycmd delete-project
Type project name to confirm: myproject
Deleted.

# Non-interactive mode (required for scripts)
$ mycmd delete-project --confirm=myproject
Deleted.
```

**Other languages:**

```go
import "github.com/mattn/go-isatty"

if isatty.IsTerminal(os.Stdin.Fd()) {
    // Can prompt
} else {
    // Must use flags
}
```

```python
import sys
if sys.stdin.isatty():
    # Interactive
else:
    # Script mode
```

**Also provide `--no-input` flag:**

```bash
mycmd deploy --no-input  # Never prompt, fail if input needed
```
