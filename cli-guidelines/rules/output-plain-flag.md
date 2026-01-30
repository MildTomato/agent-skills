---
title: Support --plain for Script-Friendly Output
impact: MEDIUM
impactDescription: Enables reliable parsing in scripts
tags: output, scripting, automation, parsing
---

## Support --plain for Script-Friendly Output

Provide `--plain` flag for stable, parseable output. Human-friendly output may break scripts.

**Incorrect (only human-friendly output):**

```bash
$ mycmd list
NAME        STATUS      DETAILS
myapp       Running     Started 2 hours ago
                        Memory: 512MB
                        CPU: 2.3%
# Multi-line cells break line-based parsing
```

**Correct (supports --plain):**

```bash
$ mycmd list --plain
myapp	running	2h	512MB	2.3%
# One record per line, tab-separated

# Easy to parse
$ mycmd list --plain | awk '{print $1, $2}'
myapp running
```

**Implementation:**

```typescript
function listApps(options: { plain?: boolean }) {
  const apps = getApps()

  if (options.plain) {
    // One line per record, tab-separated
    apps.forEach((app) => {
      console.log(`${app.name}\t${app.status}\t${app.uptime}\t${app.memory}`)
    })
  } else {
    // Pretty table for humans
    console.log('NAME        STATUS      DETAILS')
    apps.forEach((app) => {
      console.log(`${app.name.padEnd(12)}${app.status.padEnd(10)}Started ${app.uptime}`)
      console.log(`${''.padEnd(23)}Memory: ${app.memory}`)
    })
  }
}

program.command('list').option('--plain', 'plain output for scripts').action(listApps)
```

**Why both --plain and --json:**

- `--json`: Structured data, complex objects
- `--plain`: Simple tabular data, easy grep/awk

```bash
# --json for complex processing
mycmd list --json | jq '.[] | select(.status == "running")'

# --plain for simple text processing
mycmd list --plain | grep running | cut -f1
```

**--plain should:**

- Output one record per line
- Use consistent delimiters (tabs or spaces)
- Not wrap or truncate
- Be stable across versions
- Work well with `grep`, `awk`, `cut`

```bash
# Pipeline friendly
mycmd list --plain | grep "prod" | awk '{print $1}' | xargs mycmd restart
```
