---
title: Support --json for Machine-Readable Output
impact: HIGH
impactDescription: Enables script integration and programmatic usage
tags: output, json, automation, scripting, api
---

## Support --json for Machine-Readable Output

Provide `--json` flag for structured, machine-readable output. This enables integration with other tools and scripts.

**Incorrect (only human-readable output):**

```bash
$ mycmd list
Projects:
  - myapp (active)
  - oldapp (archived)

# Hard to parse in scripts
```

**Correct (supports --json):**

```bash
$ mycmd list --json
{"projects":[{"name":"myapp","status":"active"},{"name":"oldapp","status":"archived"}]}
```

**Implementation:**

```typescript
import { Command } from 'commander'

function listProjects(options: { json?: boolean }) {
  const projects = getProjects()

  if (options.json) {
    console.log(JSON.stringify({ projects }, null, 2))
  } else {
    console.log('Projects:')
    projects.forEach((p) => {
      console.log(`  - ${p.name} (${p.status})`)
    })
  }
}

const program = new Command()
program.command('list').option('--json', 'output as JSON').action(listProjects)
```

**Benefits:**

- Pipes to `jq` for querying: `mycmd list --json | jq '.projects[0].name'`
- Integrates with web services via `curl`
- Enables programmatic usage
- Stable output format for scripts

**JSON output should:**

- Be valid, parsable JSON
- Use consistent schema
- Be formatted (pretty-printed) by default
- Go to `stdout` (not `stderr`)

```bash
# Pipe to jq for processing
mycmd list --json | jq '.projects[] | select(.status == "active")'

# Save to file
mycmd export --json > data.json

# Send to API
mycmd get user --json | curl -X POST https://api.example.com/users -d @-
```

Reference: https://stedolan.github.io/jq/
