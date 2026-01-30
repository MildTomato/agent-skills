---
title: Exit Immediately on Ctrl-C
impact: HIGH
impactDescription: Users expect Ctrl-C to always work
tags: signals, ctrl-c, sigint, responsiveness, ux
---

## Exit Immediately on Ctrl-C

When a user hits Ctrl-C (SIGINT), respond immediately and exit as soon as possible.

**Incorrect (ignores or delays Ctrl-C):**

```typescript
// Ctrl-C doesn't work during this
try {
  const result = await longRunningOperation()
} catch (error) {
  // Swallows interrupt!
}
```

**Correct (responds to Ctrl-C immediately):**

```typescript
process.on('SIGINT', () => {
  console.error('\nCancelled.')
  // Quick cleanup with timeout
  cleanupWithTimeout(5000)
  process.exit(130) // 128 + SIGINT(2)
})

// Let errors propagate
const result = await longRunningOperation()
```

**For long cleanup, allow second Ctrl-C:**

```typescript
let forceQuit = false

process.on('SIGINT', () => {
  if (forceQuit) {
    console.error('\nForce quitting!')
    process.exit(130)
  }

  forceQuit = true
  console.error('\nStopping... (press Ctrl+C again to force)')
  gracefulShutdown().then(() => process.exit(0))
})
```

**Example from Docker Compose:**

```bash
$ docker-compose up
...
^CGracefully stopping... (press Ctrl+C again to force)
```

**Rules:**

- Say something immediately before cleanup
- Add timeout to cleanup (max 5 seconds)
- Exit with code 130 (128 + SIGINT signal 2)
- Allow second Ctrl-C to force quit

**Other languages:**

```go
c := make(chan os.Signal, 1)
signal.Notify(c, os.Interrupt)

go func() {
    <-c
    fmt.Fprintln(os.Stderr, "\nCancelled.")
    cleanup()
    os.Exit(130)
}()
```

```python
import signal
signal.signal(signal.SIGINT, lambda s, f: sys.exit(130))
```
