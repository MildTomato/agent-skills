---
title: Map Exit Codes to Failure Modes
impact: MEDIUM-HIGH
impactDescription: Enables scripts to handle different error types
tags: errors, exit-codes, automation, error-handling
---

## Map Exit Codes to Failure Modes

Use different exit codes for different error types. Enables scripts to handle errors appropriately.

**Incorrect (always exits with 1):**

```typescript
if (configError) process.exit(1)
if (networkError) process.exit(1)
if (permissionError) process.exit(1)
// Can't distinguish error types!
```

**Correct (distinct codes):**

```typescript
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  InvalidArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
  PermissionDenied = 5,
  NotFound = 6,
  Timeout = 7,
}

if (configError) {
  console.error('Error: Invalid configuration')
  process.exit(ExitCode.ConfigError)
}

if (networkError) {
  console.error('Error: Network request failed')
  process.exit(ExitCode.NetworkError)
}
```

**Scripts can handle specific errors:**

```bash
#!/bin/bash

mycmd deploy

case $? in
  0)
    echo "✓ Deployed successfully"
    ;;
  3)
    echo "Config error - fix your config file"
    mycmd init
    ;;
  4)
    echo "Network error - retrying in 10s..."
    sleep 10
    mycmd deploy
    ;;
  5)
    echo "Permission denied - try with sudo"
    sudo mycmd deploy
    ;;
  *)
    echo "Unknown error"
    exit 1
    ;;
esac
```

**Include in JSON errors:**

```typescript
function errorOutput(error: CLIError, options: { json?: boolean }) {
  if (options.json) {
    console.log(
      JSON.stringify({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          exitCode: error.exitCode,
          retryable: error.retryable,
        },
      })
    )
  } else {
    console.error(`Error: ${error.message}`)
  }

  process.exit(error.exitCode)
}
```

**Document in help:**

```
EXIT CODES
  0    Success
  1    General error
  2    Invalid arguments (fix command and retry)
  3    Configuration error (check config file)
  4    Network error (retryable)
  5    Permission denied (try with sudo)
  6    Resource not found
  7    Operation timeout
  130  Interrupted by Ctrl-C
```

**Standard codes (follow conventions):**

| Code  | Meaning            | Use case            |
| ----- | ------------------ | ------------------- |
| 0     | Success            | Operation completed |
| 1     | General error      | Catch-all           |
| 2     | Usage error        | Wrong arguments     |
| 126   | Cannot execute     | Permission issue    |
| 127   | Command not found  | Not installed       |
| 128+N | Killed by signal N | 130 = Ctrl-C        |

**Agents can handle retryable errors:**

```typescript
const result = await exec('mycmd deploy')

// Retry network errors
if (result.exitCode === 4) {
  await sleep(5000)
  await exec('mycmd deploy')
}

// Don't retry usage errors
if (result.exitCode === 2) {
  throw new Error('Invalid arguments')
}
```
