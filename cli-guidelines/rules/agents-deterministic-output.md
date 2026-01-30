---
title: Ensure Deterministic, Versioned Output
impact: HIGH
impactDescription: Agents rely on stable output formats
tags: agents, json, versioning, schema, stability
---

## Ensure Deterministic, Versioned Output

AI agents depend on stable output formats. Version your --json schema and document breaking changes.

**Incorrect (unstable schema):**

```typescript
// Version 1.0
console.log(JSON.stringify({ users: [...] }))

// Version 1.1 - BREAKS agents!
console.log(JSON.stringify({ data: { users: [...] } }))
// Field moved, agents break
```

**Correct (versioned schema):**

```typescript
interface Output {
  version: string
  data: any
}

function output(data: any, options: { json?: boolean }) {
  if (options.json) {
    console.log(JSON.stringify({
      version: '1.0',
      success: true,
      data
    }, null, 2))
  }
}

// Later versions can add fields, but not remove/move
// Version 1.1 (additive change - safe)
{
  version: '1.1',
  success: true,
  data: { ... },
  metadata: { ... }  // NEW field
}
```

**Provide --api-version flag for breaking changes:**

```typescript
program.option('--api-version <version>', 'output schema version', '2').action((options) => {
  if (options.apiVersion === '1') {
    // Legacy format for old agents
    console.log(JSON.stringify({ users: data }))
  } else {
    // Current format
    console.log(JSON.stringify({ version: '2', data }))
  }
})
```

**Document schema in --help:**

```
OUTPUT FORMAT (--json)
  {
    "version": "1.0",
    "success": true,
    "data": { ... },
    "error": { ... }  // If success: false
  }

See full schema: mycmd schema --json
```

**Provide schema command:**

```typescript
program
  .command('schema')
  .option('--json', 'output as JSON schema')
  .action((options) => {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              version: { type: 'string' },
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
            required: ['version', 'success'],
          },
          null,
          2
        )
      )
    }
  })
```

**Consistent field naming:**

```typescript
// Good - consistent camelCase
{
  userId: "123",
  createdAt: "2026-01-30T12:00:00Z",
  isActive: true
}

// Bad - mixed conventions
{
  user_id: "123",      // snake_case
  CreatedAt: "...",    // PascalCase
  is-active: true      // kebab-case
}
```

**Include operation status:**

```json
{
  "success": true,
  "operation": "deploy",
  "duration_ms": 1234,
  "result": {
    "url": "https://app.example.com",
    "version": "v1.2.3"
  }
}
```

**For errors:**

```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Connection timeout",
    "retryable": true,
    "suggestion": "Check network connection"
  }
}
```
