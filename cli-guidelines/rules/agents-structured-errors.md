---
title: Provide Structured Error Information
impact: HIGH
impactDescription: Enables agents to programmatically handle errors
tags: agents, errors, json, exit-codes, automation
---

## Provide Structured Error Information

AI agents need to understand what went wrong. Provide structured error information via exit codes and JSON.

**Incorrect (unstructured error):**

```typescript
console.error('Something went wrong!')
process.exit(1)
```

**Correct (structured error with --json):**

```typescript
function handleError(error: Error, options: { json?: boolean }) {
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          success: false,
          error: {
            code: error.code || 'UNKNOWN_ERROR',
            message: error.message,
            type: error.name,
            details: error.details,
          },
        },
        null,
        2
      )
    )
  } else {
    console.error(`Error: ${error.message}`)
    if (error.suggestion) {
      console.error(`Try: ${error.suggestion}`)
    }
  }

  // Exit code maps to error type
  process.exit(error.exitCode || 1)
}
```

**Map exit codes to error types:**

```typescript
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  InvalidArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
  PermissionError = 5,
  NotFound = 6,
}

class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public exitCode: number,
    public suggestion?: string
  ) {
    super(message)
  }
}

// Usage
throw new CLIError(
  'Config file not found',
  'CONFIG_NOT_FOUND',
  ExitCode.ConfigError,
  'Run: mycmd init'
)
```

**JSON error format:**

```json
{
  "success": false,
  "error": {
    "code": "CONFIG_NOT_FOUND",
    "message": "Config file not found: /path/to/config",
    "type": "ConfigError",
    "exitCode": 3,
    "suggestion": "Run: mycmd init",
    "details": {
      "path": "/path/to/config",
      "searchedPaths": ["/etc/mycmd", "~/.mycmd"]
    }
  }
}
```

**Document error codes in --help:**

```
EXIT CODES
  0  - Success
  1  - General error
  2  - Invalid arguments
  3  - Configuration error
  4  - Network error
  5  - Permission denied
  6  - Resource not found
```

**Benefits for agents:**

- Understand error type programmatically
- Make decisions based on error code
- Retry on transient errors (network timeout)
- Show appropriate error to user
