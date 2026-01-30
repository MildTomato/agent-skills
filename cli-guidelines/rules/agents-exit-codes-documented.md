---
title: Document All Exit Codes
impact: MEDIUM-HIGH
impactDescription: Agents use exit codes for flow control
tags: agents, exit-codes, errors, documentation, automation
---

## Document All Exit Codes

AI agents use exit codes to determine next actions. Document all possible exit codes and what they mean.

**Incorrect (undocumented codes):**

```typescript
// Agent doesn't know what exit code 5 means
if (error.type === 'permission') {
  process.exit(5)
}
```

**Correct (documented codes):**

```typescript
/**
 * Exit codes:
 * 0 - Success
 * 1 - General error
 * 2 - Invalid arguments
 * 3 - Configuration error
 * 4 - Network error (retryable)
 * 5 - Permission denied
 * 6 - Resource not found
 */
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  InvalidArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
  PermissionDenied = 5,
  NotFound = 6,
}

if (error.type === 'permission') {
  process.exit(ExitCode.PermissionDenied)
}
```

**Show exit codes in help text:**

```
$ mycmd --help
...

EXIT CODES
  0  Success
  1  General error
  2  Invalid arguments or flags
  3  Configuration error (check config file)
  4  Network error (retryable)
  5  Permission denied (try with sudo)
  6  Resource not found
  130  Interrupted by Ctrl-C
```

**Provide exit code reference command:**

```typescript
program
  .command('exit-codes')
  .description('list all exit codes')
  .option('--json', 'output as JSON')
  .action((options) => {
    const codes = [
      { code: 0, name: 'Success', retryable: false },
      { code: 1, name: 'GeneralError', retryable: false },
      { code: 2, name: 'InvalidArguments', retryable: false },
      { code: 3, name: 'ConfigError', retryable: false },
      { code: 4, name: 'NetworkError', retryable: true },
      { code: 5, name: 'PermissionDenied', retryable: false },
      { code: 6, name: 'NotFound', retryable: false },
    ]

    if (options.json) {
      console.log(JSON.stringify({ exitCodes: codes }, null, 2))
    } else {
      console.log('EXIT CODES')
      codes.forEach((c) => {
        console.log(`  ${c.code.toString().padStart(3)}  ${c.name}`)
      })
    }
  })
```

**Include retryability:**

```json
{
  "success": false,
  "error": {
    "code": "NETWORK_TIMEOUT",
    "exitCode": 4,
    "retryable": true,
    "retryAfter": 5000
  }
}
```

**Agent can decide:**

```typescript
const result = await exec('mycmd deploy')
if (result.exitCode === 4) {
  // Network error - retry
  await sleep(5000)
  await exec('mycmd deploy')
} else if (result.exitCode === 2) {
  // Invalid args - don't retry, fix arguments
  throw new Error('Invalid arguments')
}
```
