---
title: Support --no-input Flag
impact: MEDIUM
impactDescription: Allows explicit disabling of all prompts
tags: interactivity, flags, automation, scripting
---

## Support --no-input Flag

Provide `--no-input` flag to explicitly disable all prompts. Essential for CI/CD and automation.

**Incorrect (no way to disable prompts):**

```typescript
import prompts from 'prompts'

// Always prompts - breaks CI
async function deploy() {
  const { env } = await prompts({
    type: 'select',
    name: 'env',
    message: 'Environment',
    choices: [{ title: 'staging' }, { title: 'production' }],
  })

  if (env === 'production') {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?',
    })
  }
}
```

**Correct (supports --no-input):**

```typescript
import prompts from 'prompts'

async function deploy(options: { noInput?: boolean; env?: string; force?: boolean }) {
  let env = options.env

  if (options.noInput) {
    // Non-interactive mode
    if (!env) {
      console.error('Error: --env required with --no-input')
      process.exit(1)
    }
  } else if (process.stdin.isTTY) {
    // Interactive mode - can prompt
    if (!env) {
      const response = await prompts({
        type: 'select',
        name: 'env',
        message: 'Environment',
        choices: [{ title: 'staging' }, { title: 'production' }],
      })
      env = response.env
    }

    if (env === 'production' && !options.force) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Deploy to production?',
      })
      if (!confirm) process.exit(1)
    }
  }

  await doDeploy(env)
}
```

**Usage:**

```bash
# Interactive (prompts user)
$ mycmd deploy

# Non-interactive (for scripts/CI)
$ mycmd deploy --no-input --env staging --force
```

**Implementation pattern:**

```typescript
program
  .option('--no-input', 'disable all prompts (for scripts/CI)')
  .option('--env <env>', 'environment')
  .action(async (options) => {
    if (options.noInput) {
      // Require all inputs via flags
      if (!options.env) {
        console.error('Error: --env required with --no-input')
        process.exit(1)
      }
    } else if (process.stdin.isTTY) {
      // Can prompt for missing values
      if (!options.env) {
        const { env } = await prompts({
          type: 'text',
          name: 'env',
          message: 'Environment',
        })
        options.env = env
      }
    }
  })
```

**CI/CD example:**

```yaml
# GitHub Actions
- name: Deploy
  run: mycmd deploy --no-input --env production --force
```

**Benefits:**

- Explicit opt-out from all prompts
- Scripts never hang
- Clear error when inputs missing
- Works even when stdin is TTY

**Combine with other checks:**

```typescript
function shouldPrompt(options: any): boolean {
  // Don't prompt if:
  return (
    process.stdin.isTTY && // stdin is interactive
    !options.noInput && // --no-input not passed
    !process.env.CI // not in CI
  )
}
```
