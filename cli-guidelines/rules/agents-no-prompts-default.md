---
title: Avoid Interactive Prompts for Agent-Driven CLIs
impact: HIGH
impactDescription: Agents cannot respond to interactive prompts
tags: agents, prompts, automation, flags, non-interactive
---

## Avoid Interactive Prompts for Agent-Driven CLIs

AI agents cannot respond to interactive prompts. Make all operations possible via flags alone.

**Incorrect (requires interaction):**

```typescript
async function deploy() {
  const { env } = await prompts({
    type: 'select',
    name: 'env',
    message: 'Choose environment',
    choices: [{ title: 'staging' }, { title: 'production' }],
  })

  // Agent gets stuck here!
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure?',
  })
}
```

**Correct (flags for everything):**

```typescript
async function deploy(options: { env?: string; force?: boolean; noInput?: boolean }) {
  // Require --env flag (no prompting)
  if (!options.env) {
    console.error('Error: --env is required')
    console.error('Usage: mycmd deploy --env <staging|production>')
    process.exit(2)
  }

  // Use --force instead of confirmation prompt
  if (options.env === 'production' && !options.force) {
    console.error('Error: Use --force to deploy to production')
    process.exit(1)
  }

  await doDeploy(options.env)
}
```

**Always provide flag alternatives:**

| Instead of prompting | Provide flag              |
| -------------------- | ------------------------- |
| "Choose environment" | `--env <env>`             |
| "Are you sure?"      | `--force` or `--yes`      |
| "Enter API key"      | `--api-key-file <file>`   |
| "Select region"      | `--region <region>`       |
| "Continue?"          | `--yes` or `--no-confirm` |

**Use --yes or --force for confirmations:**

```typescript
program
  .command('delete')
  .argument('<resource>')
  .option('-y, --yes', 'skip confirmation')
  .option('--force', 'force deletion')
  .action(async (resource, options) => {
    if (!options.yes && !options.force) {
      console.error('Error: Use --yes or --force to confirm deletion')
      process.exit(1)
    }
    await deleteResource(resource)
  })
```

**Agent-friendly CLI design:**

```bash
# All operations work non-interactively
mycmd init --name myproject --template basic
mycmd deploy --env staging --region us-east
mycmd delete project-123 --yes
mycmd configure --key=value
```

**If you must prompt humans, always provide flag alternative:**

```typescript
async function getInput(key: string, options: any): Promise<string> {
  // Check flag first
  if (options[key]) {
    return options[key]
  }

  // Check env var
  const envKey = `MYCMD_${key.toUpperCase()}`
  if (process.env[envKey]) {
    return process.env[envKey]
  }

  // Only prompt if interactive AND not --no-input
  if (process.stdin.isTTY && !options.noInput) {
    const { value } = await prompts({
      type: 'text',
      name: 'value',
      message: `Enter ${key}`,
    })
    return value
  }

  // Agent path: require flag
  console.error(`Error: --${key} is required in non-interactive mode`)
  process.exit(2)
}
```
