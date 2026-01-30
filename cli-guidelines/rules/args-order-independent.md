---
title: Make Flags Order-Independent
impact: MEDIUM
impactDescription: Matches user expectations, reduces frustration
tags: arguments, flags, ux, parsing, usability
---

## Make Flags Order-Independent

Flags should work regardless of where they're placed. Don't require specific ordering.

**Incorrect (order matters):**

```typescript
// Only works before subcommand
program.option('--verbose').command('deploy')

// Works:   mycmd --verbose deploy
// Breaks:  mycmd deploy --verbose  ❌
```

**Correct (order doesn't matter):**

```typescript
import { Command } from 'commander'

const program = new Command()

program
  .option('--verbose', 'verbose output')
  .command('deploy')
  .option('--env <env>', 'environment')
  .action((options, command) => {
    // Both work equally well
  })

// Both work:
// mycmd --verbose deploy --env prod
// mycmd deploy --env prod --verbose
```

**Global vs local flags:**

```typescript
// Global flags (before or after subcommand)
program.option('-v, --verbose', 'verbose (global)')

program.command('deploy').option('--env <env>', 'environment (local)')

// All of these work:
// mycmd --verbose deploy --env prod
// mycmd deploy --verbose --env prod
// mycmd deploy --env prod --verbose
```

**Why users expect this:**

```bash
# Common pattern: add flag at end
$ mycmd deploy
Error: missing --env

# User hits up-arrow and adds flag
$ mycmd deploy --env prod  # Should work!
```

**Parser configuration:**

```typescript
// commander handles this by default
program.enablePositionalOptions() // Allow options before/after

// For manual parsing, use a library that supports this
import yargs from 'yargs'

yargs.parserConfiguration({
  'boolean-negation': true,
  'camel-case-expansion': true,
  'combine-arrays': false,
  'dot-notation': true,
  'duplicate-arguments-array': true,
  'flatten-duplicate-arrays': true,
  'greedy-arrays': true,
  'halt-at-non-option': false, // Don't stop at non-option
  'nargs-eats-options': false,
  'negation-prefix': 'no-',
  'parse-numbers': true,
  'parse-positional-numbers': true,
  'populate--': true,
  'set-placeholder-key': false,
  'short-option-groups': true,
  'sort-commands': false,
  'strip-aliased': false,
  'strip-dashed': false,
  'unknown-options-as-args': false,
})
```

**Test both orderings:**

```typescript
// In tests, verify both work
expect(parse(['deploy', '--env', 'prod'])).toEqual(parse(['--env', 'prod', 'deploy']))
```
