---
title: Don't Allow Arbitrary Abbreviations
impact: MEDIUM
impactDescription: Prevents breaking changes when adding commands
tags: subcommands, abbreviations, future-proofing, aliases
---

## Don't Allow Arbitrary Abbreviations

Don't auto-expand subcommand abbreviations. It prevents adding new commands later.

**Incorrect (auto-expands prefixes):**

```typescript
// Dangerous - auto-expands any unique prefix
const commands = ['install', 'init', 'info']
const input = 'i' // Could mean install, init, or info

// Finds first match
const match = commands.find((c) => c.startsWith(input))
runCommand(match) // Runs 'install'
```

**Problem:** If user runs `mycmd i` expecting `install`, you can never add a command starting with `i` (like `inspect`) without breaking scripts.

**Correct (explicit aliases only):**

```typescript
import { Command } from 'commander'

const program = new Command()

// Full command name required
program
  .command('install')
  .alias('i') // Explicit, documented alias
  .action(install)

// Now 'mycmd install' and 'mycmd i' both work
// But 'mycmd ins' does NOT work
```

**Bad example from real tools:**

```bash
# Some tools allow:
git comm      # Expands to 'commit'
git chec      # Expands to 'checkout'

# Now can't add 'git check' or 'git comment' without breaking scripts!
```

**Explicit aliases are fine:**

```typescript
program.command('install').alias('i').alias('add') // Multiple aliases OK if documented

// Documented: 'install', 'i', and 'add' all work
// Undocumented: 'ins', 'inst', etc. do NOT work
```

**kubectl pattern (explicit short forms):**

```bash
kubectl get pods     # Full command
kubectl get po       # Documented short form
kubectl get p        # Does NOT work (no arbitrary abbrev)
```

**Implementation:**

```typescript
const COMMAND_ALIASES = {
  install: ['i', 'add'],
  remove: ['rm', 'delete'],
  list: ['ls'],
}

function resolveCommand(input: string): string | null {
  // Check exact match first
  if (COMMANDS.includes(input)) {
    return input
  }

  // Check aliases
  for (const [cmd, aliases] of Object.entries(COMMAND_ALIASES)) {
    if (aliases.includes(input)) {
      return cmd
    }
  }

  // No arbitrary expansion
  return null
}
```

**Benefits:**

- Can add new commands freely
- Aliases are stable and documented
- No surprising behavior
- Scripts won't break on updates
