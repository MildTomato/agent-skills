---
title: Provide --yes Flag to Skip All Confirmations
impact: MEDIUM-HIGH
impactDescription: Enables agents to run destructive operations
tags: agents, confirmations, automation, flags, force
---

## Provide --yes Flag to Skip All Confirmations

AI agents cannot respond to confirmation prompts. Provide `--yes` or `--force` to skip all confirmations.

**Incorrect (requires confirmation):**

```typescript
async function deleteProject(name: string) {
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Delete project '${name}'? This cannot be undone.`,
  })

  if (!confirm) {
    process.exit(1)
  }

  await doDelete(name)
}
```

**Correct (supports --yes):**

```typescript
async function deleteProject(name: string, options: { yes?: boolean; force?: boolean }) {
  // Skip confirmation if --yes or --force
  if (!options.yes && !options.force) {
    if (process.stdin.isTTY) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Delete project '${name}'? This cannot be undone.`,
      })
      if (!confirm) process.exit(1)
    } else {
      console.error('Error: Use --yes or --force to confirm deletion')
      process.exit(1)
    }
  }

  await doDelete(name)
}

program
  .command('delete <name>')
  .option('-y, --yes', 'skip confirmation')
  .option('--force', 'force deletion')
  .action(deleteProject)
```

**Common confirmation flag patterns:**

| Flag                | Purpose                    | Danger level |
| ------------------- | -------------------------- | ------------ |
| `-y, --yes`         | Skip all confirmations     | Moderate     |
| `-f, --force`       | Force dangerous operations | High         |
| `--confirm=<value>` | Type value to confirm      | Severe       |
| `--no-confirm`      | Disable all confirmations  | Moderate     |

**Usage examples:**

```bash
# Interactive (prompts user)
mycmd delete myproject

# Non-interactive (for agents/scripts)
mycmd delete myproject --yes
mycmd deploy production --force
mycmd reset-database --confirm=production-db
```

**For severe operations, require explicit value:**

```typescript
async function deleteServer(name: string, options: { confirm?: string }) {
  if (options.confirm !== name) {
    console.error(`Error: Type server name to confirm: --confirm=${name}`)
    process.exit(1)
  }

  await doDelete(name)
}

// Agent must know and pass the exact name
// mycmd delete-server prod-db --confirm=prod-db
```

**Combine with --no-input:**

```typescript
if (options.noInput && !options.yes) {
  console.error('Error: --yes required with --no-input')
  process.exit(1)
}
```

**Document in help:**

```
OPTIONS
  -y, --yes       Skip all confirmation prompts
  -f, --force     Force operation without confirmation
  --no-input      Disable all interactive prompts

For automation/agents, always use --yes or --force.
```
