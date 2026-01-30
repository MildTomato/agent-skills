---
title: Don't Have Catch-All Subcommands
impact: MEDIUM
impactDescription: Prevents breaking changes when adding commands
tags: subcommands, future-proofing, api-design, parsing
---

## Don't Have Catch-All Subcommands

Don't make the most common subcommand implicit. It prevents adding new subcommands later.

**Incorrect (implicit 'run' subcommand):**

```typescript
// If first arg isn't a known subcommand, assume it's 'run'
const knownCommands = ['deploy', 'build', 'test']
const firstArg = process.argv[2]

if (!knownCommands.includes(firstArg)) {
  // Treat as 'run' command
  runCommand(firstArg, ...process.argv.slice(3))
}
```

**Problem:**

```bash
# Version 1.0: 'echo' is treated as 'run echo'
$ mycmd echo "hello world"
# Runs: mycmd run echo "hello world"

# Version 2.0: You add an 'echo' subcommand
$ mycmd echo "hello world"
# Now runs the NEW 'echo' subcommand - BREAKS existing scripts!
```

**Correct (explicit subcommands only):**

```typescript
import { Command } from 'commander'

const program = new Command()

program.command('run <cmd...>').description('run a command').action(runCommand)

program.command('deploy').description('deploy application').action(deploy)

// User must explicitly type 'run'
// mycmd run echo "hello"
```

**If brevity is important, use explicit alias:**

```typescript
program
  .command('run <cmd...>')
  .alias('r') // Explicit, documented
  .action(runCommand)

// Both work:
// mycmd run echo "hello"
// mycmd r echo "hello"

// But NOT:
// mycmd echo "hello"  // Error: unknown command
```

**Real-world example:**

```bash
# npm requires explicit 'run'
npm run build       # Correct
npm build           # Error (unless 'build' is built-in command)

# This lets npm add new built-in commands without breaking
```

**Provide helpful error:**

```typescript
program.on('command:*', () => {
  const unknown = program.args[0]
  console.error(`Error: Unknown command '${unknown}'`)
  console.error(`Did you mean: mycmd run ${unknown} ...?`)
  process.exit(1)
})
```

**Benefits:**

- Can add new subcommands safely
- No ambiguity about what runs
- Explicit is better than implicit
- Scripts won't break on updates
