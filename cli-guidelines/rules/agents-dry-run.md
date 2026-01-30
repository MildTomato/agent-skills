---
title: Provide --dry-run for Agent Safety
impact: MEDIUM-HIGH
impactDescription: Enables agents to preview actions before executing
tags: agents, dry-run, safety, simulation, preview
---

## Provide --dry-run for Agent Safety

AI agents should be able to preview what would happen before making changes. Provide `--dry-run` for all destructive operations.

**Incorrect (no preview capability):**

```typescript
async function deploy(env: string) {
  await uploadFiles()
  await runMigrations()
  await restartServices()
}
```

**Correct (supports --dry-run):**

```typescript
async function deploy(env: string, options: { dryRun?: boolean; json?: boolean }) {
  const actions = [
    { type: 'upload', files: await getFilesToUpload() },
    { type: 'migrate', migrations: await getPendingMigrations() },
    { type: 'restart', services: ['api', 'worker'] },
  ]

  if (options.dryRun) {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            dryRun: true,
            actions,
            summary: `Would perform ${actions.length} actions`,
          },
          null,
          2
        )
      )
    } else {
      console.log('Would perform the following actions:')
      actions.forEach((a) => {
        console.log(`  - ${a.type}: ${JSON.stringify(a)}`)
      })
      console.log('\nRun without --dry-run to execute.')
    }
    return
  }

  // Actually execute
  await uploadFiles()
  await runMigrations()
  await restartServices()
}
```

**Dry-run output should:**

- List all actions that would be taken
- Show what would change
- Indicate side effects
- Support --json format

**Example dry-run output:**

```bash
$ mycmd deploy staging --dry-run
Would perform the following actions:
  1. Upload 15 files to staging
  2. Run 3 database migrations
  3. Restart services: api, worker
  4. Update DNS to point to new version

Run without --dry-run to execute.
```

**JSON dry-run output:**

```json
{
  "dryRun": true,
  "actions": [
    {
      "type": "upload",
      "fileCount": 15,
      "destination": "staging"
    },
    {
      "type": "migrate",
      "migrations": ["001_add_users", "002_add_posts", "003_add_indexes"]
    },
    {
      "type": "restart",
      "services": ["api", "worker"]
    }
  ],
  "estimatedDuration": "2-3 minutes",
  "reversible": false
}
```

**Agent workflow:**

```typescript
// 1. Preview with --dry-run
const preview = await exec('mycmd deploy staging --dry-run --json')
const plan = JSON.parse(preview.stdout)

// 2. Confirm with user or check safety
if (plan.reversible === false) {
  await confirmWithUser(plan)
}

// 3. Execute
await exec('mycmd deploy staging --yes')
```

**Standard flag names:**

- `--dry-run`, `-n` - Simulation mode
- `--preview` - Alternative name
- `--what-if` - Alternative name
