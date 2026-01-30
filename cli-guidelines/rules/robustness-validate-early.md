---
title: Validate Input Early, Fail Fast
impact: MEDIUM-HIGH
impactDescription: Catches errors before work is done
tags: robustness, validation, errors, inputs
---

## Validate Input Early, Fail Fast

Validate all inputs before doing any work. Don't wait until halfway through to discover bad input.

**Incorrect (validates too late):**

```typescript
async function deploy(app: string, env: string, region: string) {
  console.error('Starting deployment...')
  await uploadFiles() // 5 minutes
  await buildApplication() // 10 minutes

  // Validates after 15 minutes of work!
  if (!['staging', 'production'].includes(env)) {
    console.error('Error: Invalid environment')
    process.exit(1)
  }
}
```

**Correct (validates first):**

```typescript
import fs from 'fs'

async function deploy(app: string, env: string, region: string) {
  // Validate everything upfront
  if (!fs.existsSync(app)) {
    console.error(`Error: App not found: ${app}`)
    process.exit(1)
  }

  if (!['staging', 'production'].includes(env)) {
    console.error(`Error: Invalid environment: ${env}`)
    console.error('Valid: staging, production')
    process.exit(1)
  }

  if (!isValidRegion(region)) {
    console.error(`Error: Invalid region: ${region}`)
    process.exit(1)
  }

  // Now do the work
  console.error('Starting deployment...')
  await uploadFiles()
  await buildApplication()
}
```

**Validate all inputs:**

- File paths exist and are readable
- Values are in expected format
- Enum values are valid options
- Credentials are present
- Network connectivity (if required)

**Structured validation:**

```typescript
function validateArgs(args: any) {
  const errors: string[] = []

  if (!fs.existsSync(args.input)) {
    errors.push(`Input file not found: ${args.input}`)
  }

  if (!isValidEmail(args.email)) {
    errors.push(`Invalid email: ${args.email}`)
  }

  if (args.port < 1 || args.port > 65535) {
    errors.push(`Port must be 1-65535, got: ${args.port}`)
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(`Error: ${error}`))
    process.exit(2) // Exit code 2 for bad arguments
  }
}

validateArgs(options)
// Now safe to proceed
```

**Benefits:**

- Fails in <1 second instead of after minutes
- Clear, immediate feedback
- No wasted work
- Better user experience
