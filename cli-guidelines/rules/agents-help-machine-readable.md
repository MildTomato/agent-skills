---
title: Make Help Text Machine-Readable
impact: MEDIUM
impactDescription: Enables agents to discover capabilities programmatically
tags: agents, help, documentation, discovery, automation
---

## Make Help Text Machine-Readable

AI agents should be able to parse your help text to understand capabilities. Provide structured help via --json.

**Incorrect (only human-readable help):**

```bash
$ mycmd --help
mycmd - My CLI tool

Usage: mycmd <command> [options]
...
```

**Correct (supports --help --json):**

```typescript
program
  .option('--help', 'show help')
  .option('--json', 'output as JSON')
  .action((options) => {
    if (options.help && options.json) {
      // Machine-readable help
      console.log(
        JSON.stringify(
          {
            name: 'mycmd',
            version: '1.0.0',
            description: 'My CLI tool',
            commands: [
              {
                name: 'deploy',
                description: 'Deploy application',
                arguments: [{ name: 'app', required: true, description: 'App name' }],
                options: [
                  { short: 'e', long: 'env', required: true, description: 'Environment' },
                  { short: 'f', long: 'force', required: false, description: 'Skip confirmation' },
                ],
              },
            ],
            exitCodes: [
              { code: 0, description: 'Success' },
              { code: 1, description: 'General error' },
            ],
          },
          null,
          2
        )
      )
    } else if (options.help) {
      // Human-readable help
      console.log('mycmd - My CLI tool')
      console.log('\nUsage: mycmd <command> [options]')
    }
  })
```

**Agents can discover capabilities:**

```typescript
// Agent queries available commands
const help = await exec('mycmd --help --json')
const commands = JSON.parse(help.stdout).commands

// Agent knows: deploy command exists, requires --env flag
const deployCmd = commands.find((c) => c.name === 'deploy')
if (deployCmd.options.find((o) => o.long === 'env' && o.required)) {
  // Must provide --env flag
}
```

**Provide command-specific help:**

```bash
mycmd deploy --help --json
```

```json
{
  "command": "deploy",
  "description": "Deploy application to environment",
  "usage": "mycmd deploy <app> --env <env>",
  "arguments": [{ "name": "app", "required": true }],
  "options": [
    { "flag": "--env", "required": true, "type": "string", "choices": ["staging", "production"] },
    { "flag": "--force", "required": false, "type": "boolean" }
  ],
  "examples": ["mycmd deploy myapp --env staging", "mycmd deploy myapp --env production --force"]
}
```

**List available commands as JSON:**

```typescript
program
  .command('commands')
  .option('--json', 'output as JSON')
  .action((options) => {
    const commands = program.commands.map((cmd) => ({
      name: cmd.name(),
      description: cmd.description(),
      aliases: cmd.aliases(),
    }))

    if (options.json) {
      console.log(JSON.stringify({ commands }, null, 2))
    }
  })
```
