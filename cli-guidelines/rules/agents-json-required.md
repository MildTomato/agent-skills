---
title: Always Support --json for Agent Consumption
impact: CRITICAL
impactDescription: Essential for AI agents to parse and understand output
tags: agents, json, automation, api, machine-readable
---

## Always Support --json for Agent Consumption

AI agents need structured, parseable output. Always provide `--json` flag with consistent schema.

**Incorrect (only human-readable):**

```typescript
function listUsers() {
  const users = getUsers()
  console.log('Active users:')
  users.forEach((u) => console.log(`  - ${u.name} (${u.email})`))
}
```

**Correct (supports --json):**

```typescript
function listUsers(options: { json?: boolean }) {
  const users = getUsers()

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          users: users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            status: u.status,
            createdAt: u.createdAt.toISOString(),
          })),
        },
        null,
        2
      )
    )
  } else {
    console.log('Active users:')
    users.forEach((u) => console.log(`  - ${u.name} (${u.email})`))
  }
}
```

**JSON output should:**

- Be valid, parseable JSON
- Use consistent field names (camelCase or snake_case)
- Include all relevant data
- Use ISO 8601 for dates
- Include type information when helpful
- Be pretty-printed (2 space indent)

**Provide schema/types when possible:**

```typescript
// Export types for documentation
export interface UserOutput {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string // ISO 8601
}

export interface ListUsersOutput {
  users: UserOutput[]
  total: number
  page?: number
}
```

**Benefits for AI agents:**

- Parse output reliably
- Extract specific fields programmatically
- Chain commands together
- No regex/parsing of human text needed

**Example agent usage:**

```typescript
// Agent can parse this reliably
const result = await exec('mycmd list --json')
const data = JSON.parse(result.stdout)
const activeUsers = data.users.filter((u) => u.status === 'active')
```

**All commands should support --json:**

```bash
mycmd list --json
mycmd get user-123 --json
mycmd status --json
mycmd config get --json
```
