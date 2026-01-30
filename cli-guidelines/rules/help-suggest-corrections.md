---
title: Suggest Corrections for Typos
impact: MEDIUM
impactDescription: Helps users fix mistakes quickly
tags: help, typos, suggestions, usability, ux
---

## Suggest Corrections for Typos

When the user makes a typo, suggest what they might have meant.

**Incorrect (unhelpful error):**

```bash
$ heroku pss
Error: Unknown command: pss
```

**Correct (suggests fix):**

```bash
$ heroku pss
Warning: pss is not a heroku command.
Did you mean ps? [y/n]:
```

**Implementation with fuzzy matching:**

```typescript
import { distance } from 'fastest-levenshtein'
import prompts from 'prompts'

async function handleUnknownCommand(cmd: string, validCommands: string[]) {
  // Find closest match
  const matches = validCommands
    .map((c) => ({ cmd: c, dist: distance(cmd, c) }))
    .filter((m) => m.dist <= 2)
    .sort((a, b) => a.dist - b.dist)

  if (matches.length > 0) {
    const suggestion = matches[0].cmd
    console.error(`Error: Unknown command '${cmd}'`)

    if (process.stdin.isTTY) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Did you mean '${suggestion}'?`,
      })
      if (confirm) {
        runCommand(suggestion)
        return
      }
    }

    console.error(`Run: mycmd ${suggestion}`)
  } else {
    console.error(`Error: Unknown command '${cmd}'`)
    console.error("Run 'mycmd --help' for available commands")
  }
}
```

**Example from Homebrew:**

```bash
$ brew update jq
Error: This command updates brew itself.
Did you mean 'upgrade'?
```

**Don't auto-run corrections:**

- Typo might indicate logical mistake
- Auto-correction means you support that syntax forever
- User won't learn the correct command

**When to suggest:**

- Close matches (1-2 character difference)
- Common abbreviations
- Case differences

**When NOT to suggest:**

- No close matches (avoid confusing suggestions)
- Dangerous operations (don't suggest `delete` when user typed `delate`)

**Suggest flags too:**

```bash
$ mycmd deploy --quite
Error: Unknown flag '--quite'
Did you mean '--quiet'?
```
