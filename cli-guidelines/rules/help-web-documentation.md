---
title: Provide Web-Based Documentation
impact: MEDIUM
impactDescription: Users need searchable, linkable documentation
tags: documentation, help, web, discoverability
---

## Provide Web-Based Documentation

Provide web documentation that users can search, link to, and share.

**Provide in --help output:**

```bash
$ mycmd --help
mycmd - My CLI tool

Usage: mycmd <command> [options]

...

DOCUMENTATION
  https://mycmd.dev/docs

  Report issues: https://github.com/org/mycmd/issues
```

**Link to specific pages from subcommands:**

```typescript
program
  .command('deploy')
  .description('Deploy application')
  .addHelpText('after', '\nLearn more: https://mycmd.dev/docs/deploy')
  .action(deploy)
```

**Provide 'docs' command:**

```typescript
import open from 'open'

program
  .command('docs [topic]')
  .description('open documentation in browser')
  .action(async (topic) => {
    const baseUrl = 'https://mycmd.dev/docs'
    const url = topic ? `${baseUrl}/${topic}` : baseUrl

    console.error(`Opening ${url}...`)
    await open(url)
  })
```

**Usage:**

```bash
$ mycmd docs           # Opens https://mycmd.dev/docs
$ mycmd docs deploy    # Opens https://mycmd.dev/docs/deploy
```

**Web docs should include:**

- Getting started guide
- Installation instructions
- Complete command reference
- Common use cases with examples
- Troubleshooting guide
- FAQ
- API reference (for --json output schemas)

**Make docs discoverable in errors:**

```typescript
console.error('Error: Invalid configuration')
console.error('Learn more: https://mycmd.dev/docs/configuration')
```

**Version your docs:**

```
https://mycmd.dev/docs/v1.0/deploy
https://mycmd.dev/docs/v2.0/deploy
https://mycmd.dev/docs/latest/deploy
```

**Include search:**

```bash
# Some CLIs provide search command
mycmd docs search "how to deploy"
# Opens: https://mycmd.dev/docs?q=how+to+deploy
```

**Web docs complement, don't replace CLI help:**

- CLI help: Quick reference, always available
- Web docs: Complete guide, examples, tutorials, searchable
