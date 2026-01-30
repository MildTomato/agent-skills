# CLI Design Guidelines

**Version 1.0.0**  
CLI Guidelines  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring cli design guidelines. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive guide to designing and building well-crafted command-line interfaces following modern best practices. Designed for AI agents and LLMs to follow when creating, reviewing, or refactoring CLI tools. Contains guidelines across 15 categories covering philosophy, basics, help text, output formatting, error handling, arguments/flags, interactivity, subcommands, configuration, robustness, signals, future-proofing, naming, distribution, and analytics.

---

## Table of Contents

1. [Agents Deterministic Output](#agents-deterministic-output)
2. [Agents Dry Run](#agents-dry-run)
3. [Agents Exit Codes Documented](#agents-exit-codes-documented)
4. [Agents Help Machine Readable](#agents-help-machine-readable)
5. [Agents Json Required](#agents-json-required)
6. [Agents No Prompts Default](#agents-no-prompts-default)
7. [Agents Progress To Stderr](#agents-progress-to-stderr)
8. [Agents Streaming Output](#agents-streaming-output)
9. [Agents Structured Errors](#agents-structured-errors)
10. [Agents Yes Flag](#agents-yes-flag)
11. [Analytics No Phone Home](#analytics-no-phone-home)
12. [Args No Secrets Flags](#args-no-secrets-flags)
13. [Args Order Independent](#args-order-independent)
14. [Args Prefer Flags](#args-prefer-flags)
15. [Args Standard Names](#args-standard-names)
16. [Args Stdin Stdout](#args-stdin-stdout)
17. [Basics Exit Codes](#basics-exit-codes)
18. [Basics Full Flags](#basics-full-flags)
19. [Basics Help Flags](#basics-help-flags)
20. [Basics Stdout Stderr](#basics-stdout-stderr)
21. [Basics Use Parsing Library](#basics-use-parsing-library)
22. [Config Precedence](#config-precedence)
23. [Config Xdg Spec](#config-xdg-spec)
24. [Errors Exit Code Mapping](#errors-exit-code-mapping)
25. [Errors Important Info End](#errors-important-info-end)
26. [Errors Rewrite For Humans](#errors-rewrite-for-humans)
27. [Errors Signal To Noise](#errors-signal-to-noise)
28. [Future Additive Changes](#future-additive-changes)
29. [Help Concise Default](#help-concise-default)
30. [Help Lead Examples](#help-lead-examples)
31. [Help Suggest Corrections](#help-suggest-corrections)
32. [Help Web Documentation](#help-web-documentation)
33. [Interactive No Input Flag](#interactive-no-input-flag)
34. [Interactive Password No Echo](#interactive-password-no-echo)
35. [Interactive Tty Check](#interactive-tty-check)
36. [Naming Distribute Single Binary](#naming-distribute-single-binary)
37. [Naming Simple Memorable](#naming-simple-memorable)
38. [Output Json Flag](#output-json-flag)
39. [Output Pager](#output-pager)
40. [Output Plain Flag](#output-plain-flag)
41. [Output State Changes](#output-state-changes)
42. [Output Tty Detection](#output-tty-detection)
43. [Robustness 100ms Response](#robustness-100ms-response)
44. [Robustness Idempotent](#robustness-idempotent)
45. [Robustness Network Timeouts](#robustness-network-timeouts)
46. [Robustness Progress Indicators](#robustness-progress-indicators)
47. [Robustness Validate Early](#robustness-validate-early)
48. [Signals Crash Only Design](#signals-crash-only-design)
49. [Signals Exit On Ctrl C](#signals-exit-on-ctrl-c)
50. [Subcommands Consistency](#subcommands-consistency)
51. [Subcommands Consistent Verbs](#subcommands-consistent-verbs)
52. [Subcommands No Abbreviations](#subcommands-no-abbreviations)
53. [Subcommands No Catch All](#subcommands-no-catch-all)

---

## 1. Agents Deterministic Output

---
title: Ensure Deterministic, Versioned Output
impact: HIGH
impactDescription: Agents rely on stable output formats
tags: agents, json, versioning, schema, stability
---

## Ensure Deterministic, Versioned Output

AI agents depend on stable output formats. Version your --json schema and document breaking changes.

**Incorrect (unstable schema):**

```typescript
// Version 1.0
console.log(JSON.stringify({ users: [...] }))

// Version 1.1 - BREAKS agents!
console.log(JSON.stringify({ data: { users: [...] } }))
// Field moved, agents break
```

**Correct (versioned schema):**

```typescript
interface Output {
  version: string
  data: any
}

function output(data: any, options: { json?: boolean }) {
  if (options.json) {
    console.log(JSON.stringify({
      version: '1.0',
      success: true,
      data
    }, null, 2))
  }
}

// Later versions can add fields, but not remove/move
// Version 1.1 (additive change - safe)
{
  version: '1.1',
  success: true,
  data: { ... },
  metadata: { ... }  // NEW field
}
```

**Provide --api-version flag for breaking changes:**

```typescript
program
  .option("--api-version <version>", "output schema version", "2")
  .action((options) => {
    if (options.apiVersion === "1") {
      // Legacy format for old agents
      console.log(JSON.stringify({ users: data }));
    } else {
      // Current format
      console.log(JSON.stringify({ version: "2", data }));
    }
  });
```

**Document schema in --help:**

```
OUTPUT FORMAT (--json)
  {
    "version": "1.0",
    "success": true,
    "data": { ... },
    "error": { ... }  // If success: false
  }

See full schema: mycmd schema --json
```

**Provide schema command:**

```typescript
program
  .command("schema")
  .option("--json", "output as JSON schema")
  .action((options) => {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: {
              version: { type: "string" },
              success: { type: "boolean" },
              data: { type: "object" },
            },
            required: ["version", "success"],
          },
          null,
          2,
        ),
      );
    }
  });
```

**Consistent field naming:**

```typescript
// Good - consistent camelCase
{
  userId: "123",
  createdAt: "2026-01-30T12:00:00Z",
  isActive: true
}

// Bad - mixed conventions
{
  user_id: "123",      // snake_case
  CreatedAt: "...",    // PascalCase
  is-active: true      // kebab-case
}
```

**Include operation status:**

```json
{
  "success": true,
  "operation": "deploy",
  "duration_ms": 1234,
  "result": {
    "url": "https://app.example.com",
    "version": "v1.2.3"
  }
}
```

**For errors:**

```json
{
  "success": false,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Connection timeout",
    "retryable": true,
    "suggestion": "Check network connection"
  }
}
```

---

## 2. Agents Dry Run

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
async function deploy(env: string, options: { dryRun?: boolean, json?: boolean }) {
  const actions = [
    { type: 'upload', files: await getFilesToUpload() },
    { type: 'migrate', migrations: await getPendingMigrations() },
    { type: 'restart', services: ['api', 'worker'] }
  ]
  
  if (options.dryRun) {
    if (options.json) {
      console.log(JSON.stringify({
        dryRun: true,
        actions,
        summary: `Would perform ${actions.length} actions`
      }, null, 2))
    } else {
      console.log('Would perform the following actions:')
      actions.forEach(a => {
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

---

## 3. Agents Exit Codes Documented

---
title: Document All Exit Codes
impact: MEDIUM-HIGH
impactDescription: Agents use exit codes for flow control
tags: agents, exit-codes, errors, documentation, automation
---

## Document All Exit Codes

AI agents use exit codes to determine next actions. Document all possible exit codes and what they mean.

**Incorrect (undocumented codes):**

```typescript
// Agent doesn't know what exit code 5 means
if (error.type === 'permission') {
  process.exit(5)
}
```

**Correct (documented codes):**

```typescript
/**
 * Exit codes:
 * 0 - Success
 * 1 - General error
 * 2 - Invalid arguments
 * 3 - Configuration error
 * 4 - Network error (retryable)
 * 5 - Permission denied
 * 6 - Resource not found
 */
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  InvalidArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
  PermissionDenied = 5,
  NotFound = 6,
}

if (error.type === 'permission') {
  process.exit(ExitCode.PermissionDenied)
}
```

**Show exit codes in help text:**

```
$ mycmd --help
...

EXIT CODES
  0  Success
  1  General error
  2  Invalid arguments or flags
  3  Configuration error (check config file)
  4  Network error (retryable)
  5  Permission denied (try with sudo)
  6  Resource not found
  130  Interrupted by Ctrl-C
```

**Provide exit code reference command:**

```typescript
program
  .command('exit-codes')
  .description('list all exit codes')
  .option('--json', 'output as JSON')
  .action((options) => {
    const codes = [
      { code: 0, name: 'Success', retryable: false },
      { code: 1, name: 'GeneralError', retryable: false },
      { code: 2, name: 'InvalidArguments', retryable: false },
      { code: 3, name: 'ConfigError', retryable: false },
      { code: 4, name: 'NetworkError', retryable: true },
      { code: 5, name: 'PermissionDenied', retryable: false },
      { code: 6, name: 'NotFound', retryable: false },
    ]
    
    if (options.json) {
      console.log(JSON.stringify({ exitCodes: codes }, null, 2))
    } else {
      console.log('EXIT CODES')
      codes.forEach(c => {
        console.log(`  ${c.code.toString().padStart(3)}  ${c.name}`)
      })
    }
  })
```

**Include retryability:**

```json
{
  "success": false,
  "error": {
    "code": "NETWORK_TIMEOUT",
    "exitCode": 4,
    "retryable": true,
    "retryAfter": 5000
  }
}
```

**Agent can decide:**

```typescript
const result = await exec('mycmd deploy')
if (result.exitCode === 4) {
  // Network error - retry
  await sleep(5000)
  await exec('mycmd deploy')
} else if (result.exitCode === 2) {
  // Invalid args - don't retry, fix arguments
  throw new Error('Invalid arguments')
}
```

---

## 4. Agents Help Machine Readable

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
      console.log(JSON.stringify({
        name: 'mycmd',
        version: '1.0.0',
        description: 'My CLI tool',
        commands: [
          {
            name: 'deploy',
            description: 'Deploy application',
            arguments: [
              { name: 'app', required: true, description: 'App name' }
            ],
            options: [
              { short: 'e', long: 'env', required: true, description: 'Environment' },
              { short: 'f', long: 'force', required: false, description: 'Skip confirmation' }
            ]
          }
        ],
        exitCodes: [
          { code: 0, description: 'Success' },
          { code: 1, description: 'General error' }
        ]
      }, null, 2))
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
const deployCmd = commands.find(c => c.name === 'deploy')
if (deployCmd.options.find(o => o.long === 'env' && o.required)) {
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
  "arguments": [
    { "name": "app", "required": true }
  ],
  "options": [
    { "flag": "--env", "required": true, "type": "string", "choices": ["staging", "production"] },
    { "flag": "--force", "required": false, "type": "boolean" }
  ],
  "examples": [
    "mycmd deploy myapp --env staging",
    "mycmd deploy myapp --env production --force"
  ]
}
```

**List available commands as JSON:**

```typescript
program
  .command('commands')
  .option('--json', 'output as JSON')
  .action((options) => {
    const commands = program.commands.map(cmd => ({
      name: cmd.name(),
      description: cmd.description(),
      aliases: cmd.aliases()
    }))
    
    if (options.json) {
      console.log(JSON.stringify({ commands }, null, 2))
    }
  })
```

---

## 5. Agents Json Required

---
title: Always Support --json for Agent Consumption
impact: CRITICAL
impactDescription: Essential for AI agents to parse and understand output
tags: agents, json, automation, api, machine-readable
---

## Always Support --json for Agent Consumption

AI agents need structured, parseable output. Always provide `--json` flag with consistent schema.

**Incorrect (only human-readable):**

```typescript
function listUsers() {
  const users = getUsers()
  console.log('Active users:')
  users.forEach(u => console.log(`  - ${u.name} (${u.email})`))
}
```

**Correct (supports --json):**

```typescript
function listUsers(options: { json?: boolean }) {
  const users = getUsers()
  
  if (options.json) {
    console.log(JSON.stringify({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        createdAt: u.createdAt.toISOString()
      }))
    }, null, 2))
  } else {
    console.log('Active users:')
    users.forEach(u => console.log(`  - ${u.name} (${u.email})`))
  }
}
```

**JSON output should:**
- Be valid, parseable JSON
- Use consistent field names (camelCase or snake_case)
- Include all relevant data
- Use ISO 8601 for dates
- Include type information when helpful
- Be pretty-printed (2 space indent)

**Provide schema/types when possible:**

```typescript
// Export types for documentation
export interface UserOutput {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string  // ISO 8601
}

export interface ListUsersOutput {
  users: UserOutput[]
  total: number
  page?: number
}
```

**Benefits for AI agents:**
- Parse output reliably
- Extract specific fields programmatically
- Chain commands together
- No regex/parsing of human text needed

**Example agent usage:**

```typescript
// Agent can parse this reliably
const result = await exec('mycmd list --json')
const data = JSON.parse(result.stdout)
const activeUsers = data.users.filter(u => u.status === 'active')
```

**All commands should support --json:**

```bash
mycmd list --json
mycmd get user-123 --json
mycmd status --json
mycmd config get --json
```

---

## 6. Agents No Prompts Default

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
    choices: [{ title: 'staging' }, { title: 'production' }]
  })
  
  // Agent gets stuck here!
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure?'
  })
}
```

**Correct (flags for everything):**

```typescript
async function deploy(options: {
  env?: string,
  force?: boolean,
  noInput?: boolean
}) {
  // Require --env flag (no prompting)
  if (!options.env) {
    console.error("Error: --env is required")
    console.error("Usage: mycmd deploy --env <staging|production>")
    process.exit(2)
  }
  
  // Use --force instead of confirmation prompt
  if (options.env === 'production' && !options.force) {
    console.error("Error: Use --force to deploy to production")
    process.exit(1)
  }
  
  await doDeploy(options.env)
}
```

**Always provide flag alternatives:**

| Instead of prompting | Provide flag |
|---------------------|--------------|
| "Choose environment" | `--env <env>` |
| "Are you sure?" | `--force` or `--yes` |
| "Enter API key" | `--api-key-file <file>` |
| "Select region" | `--region <region>` |
| "Continue?" | `--yes` or `--no-confirm` |

**Use --yes or --force for confirmations:**

```typescript
program
  .command('delete')
  .argument('<resource>')
  .option('-y, --yes', 'skip confirmation')
  .option('--force', 'force deletion')
  .action(async (resource, options) => {
    if (!options.yes && !options.force) {
      console.error("Error: Use --yes or --force to confirm deletion")
      process.exit(1)
    }
    await deleteResource(resource)
  })
```

**Agent-friendly CLI design:**

```bash

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
      message: `Enter ${key}`
    })
    return value
  }
  
  // Agent path: require flag
  console.error(`Error: --${key} is required in non-interactive mode`)
  process.exit(2)
}
```

---

## 7. Agents Progress To Stderr

---
title: Send Progress to stderr, Data to stdout
impact: HIGH
impactDescription: Enables agents to capture output without progress noise
tags: agents, stdout, stderr, progress, output, piping
---

## Send Progress to stderr, Data to stdout

AI agents capture stdout for data. Send all progress, logs, and status to stderr.

**Incorrect (mixes progress with data):**

```typescript
async function export() {
  console.log("Exporting users...")      // Goes to stdout!
  const users = await getUsers()
  console.log("Processing...")            // Goes to stdout!
  console.log(JSON.stringify(users))      // Mixed with progress!
}
```

**Correct (progress to stderr, data to stdout):**

```typescript
async function export() {
  console.error("Exporting users...")     // stderr
  const users = await getUsers()
  console.error("Processing...")          // stderr
  console.log(JSON.stringify(users))      // stdout - clean data
}
```

**Why this matters for agents:**

```typescript
// Agent captures stdout
const { stdout } = await exec('mycmd export --json')
const data = JSON.parse(stdout)  // Clean JSON, no progress messages

// Progress visible to user (stderr)
// Exporting users...
// Processing...
```

**Use logging libraries that respect streams:**

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      stream: process.stderr  // All logs to stderr
    })
  ]
})

logger.info("Processing...")  // stderr
console.log(JSON.stringify(result))  // stdout
```

**Progress bars should go to stderr:**

```typescript
import ora from 'ora'

const spinner = ora({ stream: process.stderr })
spinner.start('Loading...')

const data = await fetchData()

spinner.stop()
console.log(JSON.stringify(data))  // Clean stdout
```

**Rule of thumb:**

| Stream | Content |
|--------|---------|
| **stdout** | Primary output, --json data, piped data |
| **stderr** | Progress, logs, warnings, errors, status |

**Verify with piping:**

```bash

mycmd export --json | jq '.users[]'

# Bad: if progress goes to stdout
mycmd export --json | jq '.users[]'
# parse error: Invalid JSON (progress messages mixed in)
```

**Even --verbose output goes to stderr:**

```typescript
if (options.verbose) {
  console.error('[DEBUG] Fetching from API...')  // stderr
  console.error('[DEBUG] Got 100 items')         // stderr
}
console.log(JSON.stringify(items))  // stdout
```

---

## 8. Agents Streaming Output

---
title: Support Streaming Output for Long Operations
impact: MEDIUM
impactDescription: Enables agents to show real-time progress
tags: agents, streaming, output, progress, real-time
---

## Support Streaming Output for Long Operations

For long operations, stream output line-by-line so agents can show progress in real-time.

**Incorrect (buffers all output):**

```typescript
async function process() {
  const results = []
  for (const item of items) {
    const result = await processItem(item)
    results.push(result)
  }
  // All output at once after 10 minutes
  console.log(JSON.stringify(results))
}
```

**Correct (streams output):**

```typescript
async function process(options: { json?: boolean }) {
  if (options.json) {
    // Stream JSON lines (one per item)
    for (const item of items) {
      const result = await processItem(item)
      console.log(JSON.stringify(result))  // Immediate output
    }
  } else {
    // Stream human-readable output
    for (const item of items) {
      console.error(`Processing ${item.name}...`)
      const result = await processItem(item)
      console.error(`✓ ${item.name} completed`)
    }
  }
}
```

**JSONL (JSON Lines) format:**

```typescript
// Each line is valid JSON
{"id": "1", "status": "completed", "time": 1.2}
{"id": "2", "status": "completed", "time": 0.8}
{"id": "3", "status": "failed", "error": "timeout"}
```

**Agent can parse as it streams:**

```typescript
// Agent reads line by line
const proc = spawn('mycmd', ['process', '--json'])
proc.stdout.on('data', (chunk) => {
  const lines = chunk.toString().split('\n')
  lines.forEach(line => {
    if (line.trim()) {
      const result = JSON.parse(line)
      updateProgress(result)
    }
  })
})
```

**Provide --stream flag:**

```typescript
program
  .command('process')
  .option('--json', 'output as JSON')
  .option('--stream', 'stream results as available (JSONL format)')
  .action(async (options) => {
    if (options.stream) {
      // One JSON object per line
      for await (const result of processItems()) {
        console.log(JSON.stringify(result))
      }
    } else {
      // Single JSON array at end
      const results = await processAllItems()
      console.log(JSON.stringify({ results }))
    }
  })
```

**Include progress metadata:**

```json
{"type": "progress", "current": 1, "total": 100, "percent": 1}
{"type": "result", "id": "item-1", "status": "completed"}
{"type": "progress", "current": 2, "total": 100, "percent": 2}
{"type": "result", "id": "item-2", "status": "completed"}
```

**Benefits:**
- Agent sees results immediately
- Can show real-time progress to user
- No need to wait for full completion
- Can handle partial results if interrupted

---

## 9. Agents Structured Errors

---
title: Provide Structured Error Information
impact: HIGH
impactDescription: Enables agents to programmatically handle errors
tags: agents, errors, json, exit-codes, automation
---

## Provide Structured Error Information

AI agents need to understand what went wrong. Provide structured error information via exit codes and JSON.

**Incorrect (unstructured error):**

```typescript
console.error("Something went wrong!")
process.exit(1)
```

**Correct (structured error with --json):**

```typescript
function handleError(error: Error, options: { json?: boolean }) {
  if (options.json) {
    console.log(JSON.stringify({
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        type: error.name,
        details: error.details
      }
    }, null, 2))
  } else {
    console.error(`Error: ${error.message}`)
    if (error.suggestion) {
      console.error(`Try: ${error.suggestion}`)
    }
  }
  
  // Exit code maps to error type
  process.exit(error.exitCode || 1)
}
```

**Map exit codes to error types:**

```typescript
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  InvalidArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
  PermissionError = 5,
  NotFound = 6,
}

class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public exitCode: number,
    public suggestion?: string
  ) {
    super(message)
  }
}

// Usage
throw new CLIError(
  "Config file not found",
  "CONFIG_NOT_FOUND",
  ExitCode.ConfigError,
  "Run: mycmd init"
)
```

**JSON error format:**

```json
{
  "success": false,
  "error": {
    "code": "CONFIG_NOT_FOUND",
    "message": "Config file not found: /path/to/config",
    "type": "ConfigError",
    "exitCode": 3,
    "suggestion": "Run: mycmd init",
    "details": {
      "path": "/path/to/config",
      "searchedPaths": ["/etc/mycmd", "~/.mycmd"]
    }
  }
}
```

**Document error codes in --help:**

```
EXIT CODES
  0  - Success
  1  - General error
  2  - Invalid arguments
  3  - Configuration error
  4  - Network error
  5  - Permission denied
  6  - Resource not found
```

**Benefits for agents:**
- Understand error type programmatically
- Make decisions based on error code
- Retry on transient errors (network timeout)
- Show appropriate error to user

---

## 10. Agents Yes Flag

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
    message: `Delete project '${name}'? This cannot be undone.`
  })
  
  if (!confirm) {
    process.exit(1)
  }
  
  await doDelete(name)
}
```

**Correct (supports --yes):**

```typescript
async function deleteProject(
  name: string,
  options: { yes?: boolean, force?: boolean }
) {
  // Skip confirmation if --yes or --force
  if (!options.yes && !options.force) {
    if (process.stdin.isTTY) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Delete project '${name}'? This cannot be undone.`
      })
      if (!confirm) process.exit(1)
    } else {
      console.error("Error: Use --yes or --force to confirm deletion")
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

| Flag | Purpose | Danger level |
|------|---------|--------------|
| `-y, --yes` | Skip all confirmations | Moderate |
| `-f, --force` | Force dangerous operations | High |
| `--confirm=<value>` | Type value to confirm | Severe |
| `--no-confirm` | Disable all confirmations | Moderate |

**Usage examples:**

```bash

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
  console.error("Error: --yes required with --no-input")
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

---

## 11. Analytics No Phone Home

---
title: Don't Phone Home Without Consent
impact: MEDIUM
impactDescription: Violates user trust and privacy expectations
tags: analytics, telemetry, privacy, consent, ethics
---

## Don't Phone Home Without Consent

Never send usage data or crash reports without explicit user consent. CLI users expect control.

**Incorrect (phones home silently):**

```typescript
// NO! Tracks without consent
async function trackUsage(command: string) {
  await fetch('https://analytics.example.com/track', {
    method: 'POST',
    body: JSON.stringify({ command, user: os.userInfo().username })
  })
}

// Called automatically
trackUsage('deploy')
```

**Correct (opt-in telemetry):**

```typescript
import fs from 'fs'
import path from 'path'

async function trackUsage(command: string) {
  // Check if user has consented
  if (!getTelemetryEnabled()) {
    return
  }
  
  // Never block main operation
  try {
    // Fire and forget, with timeout
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)
    
    fetch('https://analytics.example.com/track', {
      method: 'POST',
      body: JSON.stringify({ 
        command,
        version: VERSION,
        // NO personal data
      }),
      signal: controller.signal
    }).catch(() => {}) // Never fail the main operation
  } catch {
    // Telemetry failure should never break the CLI
  }
}

function getTelemetryEnabled(): boolean {
  // Check multiple disable methods
  if (process.env.DO_NOT_TRACK === '1') return false
  if (process.env.MYCMD_TELEMETRY === 'off') return false
  
  const configPath = path.join(os.homedir(), '.mycmd', 'config.json')
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return config.telemetry === true  // Default OFF
  }
  
  return false  // Default to OFF, not on
}
```

**First-run consent prompt:**

```typescript
async function checkTelemetryConsent() {
  const configPath = path.join(os.homedir(), '.mycmd', 'config.json')
  
  if (!fs.existsSync(configPath)) {
    // First run - ask for consent
    if (process.stdin.isTTY) {
      const { consent } = await prompts({
        type: 'confirm',
        name: 'consent',
        message: 'Help improve mycmd by sending anonymous usage data?',
        initial: false
      })
      
      fs.mkdirSync(path.dirname(configPath), { recursive: true })
      fs.writeFileSync(configPath, JSON.stringify({
        telemetry: consent
      }))
    }
  }
}
```

**Provide easy disable:**

```bash

export MYCMD_TELEMETRY=off

# Config command
mycmd config set telemetry false

# Flag for one-off runs
mycmd deploy --no-telemetry

# Respect DO_NOT_TRACK standard
export DO_NOT_TRACK=1
```

**Be transparent about what you collect:**

```bash
$ mycmd telemetry status
Telemetry: enabled

We collect:
  - Command names (e.g., 'deploy', 'build')
  - CLI version
  - OS type (e.g., 'darwin', 'linux')
  - Anonymized session ID

We do NOT collect:
  - File paths or names
  - Environment variables
  - Personal information
  - Command arguments

Disable: mycmd config set telemetry false
```

**Rules:**
- Default to OFF (opt-in, not opt-out)
- Never block main operation
- Never fail if telemetry fails
- Respect DO_NOT_TRACK env var
- Provide multiple ways to disable
- Be transparent about data collected

---

## 12. Args No Secrets Flags

---
title: Don't Read Secrets from Flags
impact: CRITICAL
impactDescription: Prevents credential leaks via ps and shell history
tags: security, secrets, flags, credentials, passwords
---

## Don't Read Secrets from Flags

Never accept secrets via command-line flags. Flags leak into `ps` output and shell history.

**Incorrect (exposes secrets):**

```bash

mycmd deploy --password secretpass123
mycmd login --api-key sk_live_abc123xyz
```

**Correct (secure methods):**

```bash
# Method 1: Read from file
mycmd deploy --password-file ~/.mycmd/password

# Method 2: Read from stdin
echo "secretpass123" | mycmd deploy --password-stdin
cat ~/.mycmd/password | mycmd login --password-stdin

# Method 3: Prompt interactively (no echo)
mycmd login  # Prompts: "Password: " (input hidden)
```

**Why flags are insecure:**

```bash
# Anyone can see secrets in process list
$ mycmd deploy --password secret123 &
$ ps aux | grep mycmd
user  1234  mycmd deploy --password secret123  # EXPOSED!

# Secrets stay in shell history
$ history
  501  mycmd login --api-key sk_live_abc123  # EXPOSED!
```

**Implementation:**

```typescript
import fs from 'fs'
import readline from 'readline'

async function getPassword(passwordFile?: string): Promise<string> {
  if (passwordFile) {
    // Read from file
    return fs.readFileSync(passwordFile, 'utf-8').trim()
  } else if (!process.stdin.isTTY) {
    // Read from stdin
    const rl = readline.createInterface({ input: process.stdin })
    return new Promise(resolve => {
      rl.on('line', line => { resolve(line.trim()); rl.close() })
    })
  } else {
    // Prompt interactively (no echo)
    const { default: prompts } = await import('prompts')
    const { password } = await prompts({
      type: 'password',
      name: 'password',
      message: 'Password'
    })
    return password
  }
}

// Usage with commander
program
  .option('--password-file <file>', 'path to password file')
```

**Environment variables are also insecure:**
- Visible to child processes
- Leak into debug logs
- Visible via `docker inspect`, `systemctl show`

**Use instead:**
- Credential files with restricted permissions (`chmod 600`)
- Secret management services (Vault, AWS Secrets Manager)
- OS keychain/credential manager
- Stdin or interactive prompts

---

## 13. Args Order Independent

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
program
  .option('--verbose')
  .command('deploy')
  
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

program
  .command('deploy')
  .option('--env <env>', 'environment (local)')
  
// All of these work:
// mycmd --verbose deploy --env prod
// mycmd deploy --verbose --env prod
// mycmd deploy --env prod --verbose
```

**Why users expect this:**

```bash

$ mycmd deploy
Error: missing --env

# User hits up-arrow and adds flag
$ mycmd deploy --env prod  # Should work!
```

**Parser configuration:**

```typescript
// commander handles this by default
program.enablePositionalOptions()  // Allow options before/after

// For manual parsing, use a library that supports this
import yargs from 'yargs'

yargs
  .parserConfiguration({
    'boolean-negation': true,
    'camel-case-expansion': true,
    'combine-arrays': false,
    'dot-notation': true,
    'duplicate-arguments-array': true,
    'flatten-duplicate-arrays': true,
    'greedy-arrays': true,
    'halt-at-non-option': false,  // Don't stop at non-option
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
    'unknown-options-as-args': false
  })
```

**Test both orderings:**

```typescript
// In tests, verify both work
expect(parse(['deploy', '--env', 'prod'])).toEqual(
  parse(['--env', 'prod', 'deploy'])
)
```

---

## 14. Args Prefer Flags

---
title: Prefer Flags Over Positional Arguments
impact: HIGH
impactDescription: Makes CLIs more maintainable and easier to extend
tags: arguments, flags, api-design, extensibility
---

## Prefer Flags Over Positional Arguments

Use flags instead of positional arguments. Flags are explicit, self-documenting, and easier to extend without breaking changes.

**Incorrect (positional args - hard to read):**

```bash

mycmd deploy myapp production us-east-1 true

# Adding new params breaks everything
mycmd deploy myapp production us-east-1 true verbose
```

**Correct (flags - explicit and clear):**

```bash
# Self-documenting
mycmd deploy --app myapp --env production --region us-east-1 --force

# Easy to add new flags without breaking existing usage
mycmd deploy --app myapp --env production --verbose
```

**Exceptions where positional args are OK:**

1. **Simple file operations:**
   ```bash
   rm file1.txt file2.txt file3.txt
   cp source.txt dest.txt
   ```

2. **Primary action on multiple items:**
   ```bash
   mycmd process *.csv  # Works with globbing
   ```

**Benefits of flags:**
- Order doesn't matter: `mycmd --app foo --env prod` = `mycmd --env prod --app foo`
- Can add new flags without breaking scripts
- Self-documenting: clear what each value represents
- Optional parameters are obvious

**Two or more positional args for different things is wrong:**

```bash
# Bad - what's what?
mycmd source-file dest-file format template

# Good - explicit
mycmd convert --input source-file --output dest-file --format json
```

Reference: https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46

---

## 15. Args Standard Names

---
title: Use Standard Flag Names
impact: MEDIUM
impactDescription: Reduces learning curve, flags are guessable
tags: flags, conventions, standards, usability
---

## Use Standard Flag Names

Use conventional flag names that users already know from other tools.

**Standard flags:**

| Flag | Long form | Purpose | Example tools |
|------|-----------|---------|---------------|
| `-a` | `--all` | All items | ps, fetchmail |
| `-d` | `--debug` | Debug output | Most tools |
| `-f` | `--force` | Force operation | rm, git |
| `-h` | `--help` | Show help | Universal |
| `-n` | `--dry-run` | Simulate, no changes | rsync, git |
| `-o` | `--output` | Output file | gcc, sort |
| `-p` | `--port` | Port number | ssh, psql |
| `-q` | `--quiet` | Suppress output | wget, curl |
| `-u` | `--user` | User name | ssh, psql |
| `-v` | `--verbose` | Verbose output | Most tools |
| | `--version` | Show version | Universal |
| | `--json` | JSON output | Modern CLIs |
| | `--no-input` | Disable prompts | Modern CLIs |

**Incorrect (non-standard names):**

```bash

mycmd process --silent      # Should be --quiet
mycmd deploy --show-detail  # Should be --verbose
mycmd build --simulate      # Should be --dry-run
```

**Correct (standard names):**

```bash
mycmd process --quiet
mycmd deploy --verbose
mycmd build --dry-run
```

**Benefits:**
- Users can guess flags without reading docs
- Consistent muscle memory across tools
- Reduced learning curve

**Avoid conflicts:**
- `-v` can mean verbose OR version (prefer `-v` for verbose, `--version` only for version)
- `-h` should ONLY mean help, never hostname

**Example implementation:**

```python
parser.add_argument('-q', '--quiet', action='store_true')
parser.add_argument('-v', '--verbose', action='store_true')
parser.add_argument('-f', '--force', action='store_true')
parser.add_argument('-n', '--dry-run', action='store_true')
parser.add_argument('--version', action='version')
```

When introducing non-standard flags, use descriptive long forms:
```bash
mycmd deploy --rollback-on-error  # Clear and specific
```

---

## 16. Args Stdin Stdout

---
title: Accept - for stdin/stdout
impact: MEDIUM-HIGH
impactDescription: Enables pipe composition and unix-style workflows
tags: arguments, stdin, stdout, piping, composability
---

## Accept - for stdin/stdout

Support `-` as a filename to read from stdin or write to stdout. This enables pipe-based workflows without temporary files.

**Incorrect (requires actual files):**

```bash

$ curl https://example.com/data.tar.gz > temp.tar.gz
$ mycmd extract temp.tar.gz
$ rm temp.tar.gz
```

**Correct (supports - for stdin):**

```bash
# No temp file needed
$ curl https://example.com/data.tar.gz | mycmd extract -
```

**Implementation:**

```typescript
import fs from 'fs'

function readInput(filename: string): string {
  if (filename === '-') {
    return fs.readFileSync(process.stdin.fd, 'utf-8')
  } else {
    return fs.readFileSync(filename, 'utf-8')
  }
}

function writeOutput(filename: string, content: string) {
  if (filename === '-') {
    process.stdout.write(content)
  } else {
    fs.writeFileSync(filename, content)
  }
}

// Usage with commander
program
  .argument('<input>', 'input file (use - for stdin)')
  .option('-o, --output <file>', 'output file (use - for stdout)')
```

**Real-world example (tar):**

```bash
# Extract from stdin
$ curl https://example.com/file.tar.gz | tar xvf -

# Create to stdout
$ tar czf - mydir/ | ssh remote 'tar xzf -'
```

**Benefits:**
- No temporary files
- Memory efficient for streams
- Composes with other tools
- Standard Unix pattern

```bash
# Chaining commands without temp files
$ mycmd export --json | jq '.items[]' | mycmd import -
```

**Handle both input and output:**

```bash
mycmd transform - -o -  # Read stdin, write stdout
cat input.txt | mycmd process - > output.txt
```

---

## 17. Basics Exit Codes

---
title: Return Correct Exit Codes
impact: CRITICAL
impactDescription: Required for script composition and automation
tags: basics, exit-codes, errors, scripting
---

## Return Correct Exit Codes

Return 0 on success, non-zero on failure. Exit codes are how scripts determine whether a program succeeded, so report this correctly.

**Incorrect (always returns 0):**

```typescript
async function main() {
  try {
    const result = await doWork()
    console.log("Done")
  } catch (error) {
    console.log(`Error: ${error.message}`)
  }
  // Exits with 0 even on error!
}
```

**Correct (returns appropriate exit code):**

```typescript
async function main() {
  try {
    const result = await doWork()
    console.log("Done")
    process.exit(0)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}
```

**Standard exit codes:**

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse of command (bad arguments) |
| 126 | Command found but not executable |
| 127 | Command not found |
| 130 | Terminated by Ctrl-C (128 + SIGINT) |

**Map codes to failure modes:**

```typescript
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  BadArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
}

process.exit(ExitCode.NetworkError)
```

This enables scripts to handle different error types:

```bash
if mycmd deploy; then
    echo "Deployed successfully"
else
    case $? in
        3) echo "Config error - check your settings" ;;
        4) echo "Network error - check your connection" ;;
        *) echo "Unknown error" ;;
    esac
fi
```

---

## 18. Basics Full Flags

---
title: Provide Full-Length Flag Versions
impact: CRITICAL
impactDescription: Improves script readability and self-documentation
tags: basics, flags, arguments, readability
---

## Provide Full-Length Flag Versions

Every flag should have both short (`-v`) and long (`--verbose`) versions. Long versions make scripts self-documenting.

**Incorrect (short flag only):**

```bash

mycmd deploy -v

# Unclear in scripts
#!/bin/bash
mycmd process -v -q -f
```

**Correct (both short and long):**

```typescript
import { Command } from 'commander'

const program = new Command()
program
  .option('-v, --verbose', 'verbose output')
  .option('-q, --quiet', 'suppress output')
  .option('-f, --force', 'force operation')
  .parse(process.argv)
```

Now scripts are readable:

```bash
#!/bin/bash
mycmd process --verbose --quiet --force
# Clear what each flag does
```

**Benefits:**
- Scripts are self-documenting
- No need to look up flag meanings
- Easier to review and maintain
- Both forms work identically

```bash
# These are equivalent
mycmd deploy -v -f
mycmd deploy --verbose --force
mycmd deploy --verbose -f  # Can mix
```

**Other languages:**

```go
// Go with Cobra
cmd.Flags().BoolP("verbose", "v", false, "Verbose output")
```

```python
# Python with Click
@click.option('-v', '--verbose', is_flag=True)
```

---

## 19. Basics Help Flags

---
title: Support -h and --help Flags
impact: CRITICAL
impactDescription: Essential for discoverability and usability
tags: basics, help, flags, documentation
---

## Support -h and --help Flags

Display help when passed `-h` or `--help` flags. This applies to the main command and all subcommands.

**Incorrect (no help flag support):**

```typescript
function main() {
  if (process.argv.length < 3) {
    console.log("Usage: mycmd <command>")
    return
  }
  // No help flag handling
  const command = process.argv[2]
  runCommand(command)
}
```

**Correct (help flags work):**

```typescript
import { Command } from 'commander'

const program = new Command()
program
  .description('My CLI tool')
  .argument('<command>', 'Command to run')
  // commander automatically handles -h and --help
  .parse(process.argv)
```

**All these should show help:**

```bash
$ myapp -h
$ myapp --help
$ myapp subcommand -h
$ myapp subcommand --help
$ myapp help              # For git-like CLIs
$ myapp help subcommand   # For git-like CLIs
```

**Rules:**
- Ignore any other flags when `-h` is passed
- Don't overload `-h` for anything else
- Show help even with invalid arguments: `mycmd --foo -h` shows help
- Support both short (`-h`) and long (`--help`) forms

```bash

$ mycmd deploy --environment prod -h
# Shows help instead of trying to deploy
```

---

## 20. Basics Stdout Stderr

---
title: Use stdout and stderr Correctly
impact: CRITICAL
impactDescription: Required for composability and script integration
tags: basics, stdout, stderr, output, piping
---

## Use stdout and stderr Correctly

Send primary output to `stdout` and messages/errors to `stderr`. This enables piping and script composition.

**Incorrect (everything to stdout):**

```typescript
console.log("Processing file...")
console.log("Warning: file is large")
console.log(JSON.stringify(result))  // Mixed with messages!
```

**Correct (stdout for data, stderr for messages):**

```typescript
console.error("Processing file...")
console.error("Warning: file is large")
console.log(JSON.stringify(result))  // Clean output to stdout

// Or more explicit
process.stderr.write("Processing file...\n")
process.stdout.write(JSON.stringify(result) + "\n")
```

**Why this matters:**

```bash

$ mycmd process file.txt > output.json
Processing file...     # User sees this (stderr)
Warning: file is large # User sees this (stderr)
# JSON output is in output.json (stdout)

# If everything went to stdout:
$ mycmd process file.txt > output.json
# User sees nothing, and output.json contains mixed data/messages
```

**Rules:**
- **stdout**: Primary output, machine-readable data, pipe-able content
- **stderr**: Log messages, progress indicators, warnings, errors, human messaging

**Node.js note:** `console.log()` writes to stdout, `console.error()` writes to stderr.

```bash
# Piping works correctly
mycmd list | grep "pattern" | wc -l
```

---

## 21. Basics Use Parsing Library

---
title: Use an Argument Parsing Library
impact: CRITICAL
impactDescription: Prevents broken CLI behavior and edge case bugs
tags: basics, arguments, parsing, flags
---

## Use an Argument Parsing Library

Use a command-line argument parsing library (built-in or third-party). Don't roll your own—it's harder than it looks and you'll miss edge cases.

**Incorrect (manual parsing, prone to bugs):**

```typescript
// Manual parsing - misses many edge cases
const args = process.argv.slice(2)
const verbose = args.includes('--verbose') || args.includes('-v')
let output = null
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && i + 1 < args.length) {
    output = args[i + 1]
  }
}
```

**Correct (using commander):**

```typescript
import { Command } from 'commander'

const program = new Command()
program
  .option('-v, --verbose', 'verbose output')
  .option('-o, --output <file>', 'output file')
  .parse(process.argv)

const options = program.opts()
```

Libraries handle:
- Flag parsing (short and long forms)
- Help text generation
- Type validation
- Spelling suggestions
- Error messages

**Recommended libraries:**
- **Node/TypeScript**: commander, oclif, yargs
- **Go**: Cobra, urfave/cli
- **Python**: Click, Typer, argparse
- **Rust**: clap
- **Ruby**: TTY

---

## 22. Config Precedence

---
title: Follow Configuration Precedence
impact: MEDIUM
impactDescription: Predictable config behavior expected by users
tags: config, precedence, environment, flags
---

## Follow Configuration Precedence

Apply configuration in order of precedence from highest to lowest. Flags override everything.

**Precedence order (highest to lowest):**

1. **Flags** - `--config-value=X`
2. **Environment variables** - `MYAPP_CONFIG_VALUE=X`
3. **Project config** - `./.myapprc`, `./.env`
4. **User config** - `~/.config/myapp/config.json`
5. **System config** - `/etc/myapp/config`

**Incorrect (random precedence):**

```typescript
// Confusing - env var overrides flag!
let configValue = process.env.MYAPP_VALUE
if (options.value) {
  configValue = options.value  // Wrong order
}
```

**Correct (proper precedence):**

```typescript
function getConfigValue(key: string, options: any): string {
  // 1. Flag (highest priority)
  if (options[key] !== undefined) {
    return options[key]
  }
  
  // 2. Environment variable
  const envKey = `MYAPP_${key.toUpperCase()}`
  if (process.env[envKey]) {
    return process.env[envKey]
  }
  
  // 3. Project config file
  const projectConfig = loadConfig('./.myapprc')
  if (projectConfig[key]) {
    return projectConfig[key]
  }
  
  // 4. User config file
  const userConfig = loadConfig('~/.config/myapp/config.json')
  if (userConfig[key]) {
    return userConfig[key]
  }
  
  // 5. System config (lowest priority)
  const systemConfig = loadConfig('/etc/myapp/config')
  return systemConfig[key]
}
```

**Example behavior:**

```bash

# User config: port = 3000
# Env var: MYAPP_PORT=4000
# Flag: --port=5000

$ mycmd start
# Uses 3000 (user config)

$ MYAPP_PORT=4000 mycmd start
# Uses 4000 (env var overrides user config)

$ mycmd start --port=5000
# Uses 5000 (flag overrides everything)
```

**This order makes sense because:**
- Flags are most explicit and immediate
- Env vars are session-specific
- Project config is shared with team
- User config is personal preference
- System config is global default

---

## 23. Config Xdg Spec

---
title: Follow XDG Base Directory Spec
impact: LOW-MEDIUM
impactDescription: Keeps user's home directory clean and organized
tags: config, xdg, directories, standards
---

## Follow XDG Base Directory Spec

Use XDG Base Directory specification for config file locations. Don't clutter the home directory with dotfiles.

**Incorrect (creates dotfiles in home):**

```typescript
import os from 'os'
import path from 'path'

// Creates ~/.mycmd, ~/.mycmdrc, ~/.mycmd_cache
const configDir = path.join(os.homedir(), '.mycmd')
const cacheDir = path.join(os.homedir(), '.mycmd_cache')
```

**Correct (follows XDG spec):**

```typescript
import os from 'os'
import path from 'path'

// XDG Base Directory locations
const configHome = process.env.XDG_CONFIG_HOME || 
                   path.join(os.homedir(), '.config')
const dataHome = process.env.XDG_DATA_HOME ||
                 path.join(os.homedir(), '.local', 'share')
const cacheHome = process.env.XDG_CACHE_HOME ||
                  path.join(os.homedir(), '.cache')

// Your app's directories
const configDir = path.join(configHome, 'mycmd')
const dataDir = path.join(dataHome, 'mycmd')
const cacheDir = path.join(cacheHome, 'mycmd')
```

**Standard locations:**

```
~/.config/mycmd/           # Config files (XDG_CONFIG_HOME)
~/.local/share/mycmd/      # Application data (XDG_DATA_HOME)
~/.cache/mycmd/            # Cache files (XDG_CACHE_HOME)
```

**What goes where:**

| Type | Location | Example |
|------|----------|---------|
| Config | `~/.config/mycmd/` | `config.json`, settings |
| Data | `~/.local/share/mycmd/` | Databases, logs |
| Cache | `~/.cache/mycmd/` | Temp files, downloads |

**Benefits:**
- Users can backup just `~/.config` for all app settings
- Keeps home directory clean
- Respects user's XDG preferences
- Used by: yarn, fish, neovim, tmux, many modern tools

**Or use env-paths library:**

```typescript
import envPaths from 'env-paths'

const paths = envPaths('mycmd')
// paths.config  => ~/.config/mycmd
// paths.data    => ~/.local/share/mycmd  
// paths.cache   => ~/.cache/mycmd
```

**Note:** Windows and macOS have their own conventions, XDG is mainly for Linux/Unix.

Reference: https://specifications.freedesktop.org/basedir-spec/latest/

---

## 24. Errors Exit Code Mapping

---
title: Map Exit Codes to Failure Modes
impact: MEDIUM-HIGH
impactDescription: Enables scripts to handle different error types
tags: errors, exit-codes, automation, error-handling
---

## Map Exit Codes to Failure Modes

Use different exit codes for different error types. Enables scripts to handle errors appropriately.

**Incorrect (always exits with 1):**

```typescript
if (configError) process.exit(1)
if (networkError) process.exit(1)
if (permissionError) process.exit(1)
// Can't distinguish error types!
```

**Correct (distinct codes):**

```typescript
enum ExitCode {
  Success = 0,
  GeneralError = 1,
  InvalidArguments = 2,
  ConfigError = 3,
  NetworkError = 4,
  PermissionDenied = 5,
  NotFound = 6,
  Timeout = 7,
}

if (configError) {
  console.error('Error: Invalid configuration')
  process.exit(ExitCode.ConfigError)
}

if (networkError) {
  console.error('Error: Network request failed')
  process.exit(ExitCode.NetworkError)
}
```

**Scripts can handle specific errors:**

```bash
#!/bin/bash

mycmd deploy

case $? in
  0)
    echo "✓ Deployed successfully"
    ;;
  3)
    echo "Config error - fix your config file"
    mycmd init
    ;;
  4)
    echo "Network error - retrying in 10s..."
    sleep 10
    mycmd deploy
    ;;
  5)
    echo "Permission denied - try with sudo"
    sudo mycmd deploy
    ;;
  *)
    echo "Unknown error"
    exit 1
    ;;
esac
```

**Include in JSON errors:**

```typescript
function errorOutput(error: CLIError, options: { json?: boolean }) {
  if (options.json) {
    console.log(JSON.stringify({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        exitCode: error.exitCode,
        retryable: error.retryable
      }
    }))
  } else {
    console.error(`Error: ${error.message}`)
  }
  
  process.exit(error.exitCode)
}
```

**Document in help:**

```
EXIT CODES
  0    Success
  1    General error
  2    Invalid arguments (fix command and retry)
  3    Configuration error (check config file)
  4    Network error (retryable)
  5    Permission denied (try with sudo)
  6    Resource not found
  7    Operation timeout
  130  Interrupted by Ctrl-C
```

**Standard codes (follow conventions):**

| Code | Meaning | Use case |
|------|---------|----------|
| 0 | Success | Operation completed |
| 1 | General error | Catch-all |
| 2 | Usage error | Wrong arguments |
| 126 | Cannot execute | Permission issue |
| 127 | Command not found | Not installed |
| 128+N | Killed by signal N | 130 = Ctrl-C |

**Agents can handle retryable errors:**

```typescript
const result = await exec('mycmd deploy')

// Retry network errors
if (result.exitCode === 4) {
  await sleep(5000)
  await exec('mycmd deploy')
}

// Don't retry usage errors
if (result.exitCode === 2) {
  throw new Error('Invalid arguments')
}
```

---

## 25. Errors Important Info End

---
title: Put Important Info at End of Output
impact: MEDIUM
impactDescription: Users naturally look at the last line first
tags: errors, output, ux, attention
---

## Put Important Info at End of Output

Place the most important information at the end of error output. Users' eyes go to the last line first.

**Incorrect (solution buried at top):**

```
$ mycmd deploy
Fix: Run 'mycmd login' first
... (20 lines of context)
Error: Not authenticated
Debug info: ...
Stack trace: ...
```

**Correct (solution at the end):**

```
$ mycmd deploy
Error: Not authenticated
Unable to deploy without credentials.

Fix: Run 'mycmd login' first
```

**Use red text sparingly—it draws attention:**

```python
import sys

def error(message, solution=None):
    print(f"Error: {message}", file=sys.stderr)
    if solution:
        # Solution at the end, optionally in red/bold
        print(f"\n{solution}", file=sys.stderr)
```

**Visual hierarchy:**

```
$ mycmd build
Building application...
Error: Missing dependency 'libfoo'

Install it with: apt install libfoo

```

**Stack traces should be hidden by default:**

```
$ mycmd deploy
Error: Failed to connect to database
Connection refused at localhost:5432

Try: docker start postgres
(Use --verbose for stack trace)
```

**Multi-error output:**

```
# Put summary and fix at end
Found 3 errors in config.json:
  - Line 5: invalid syntax
  - Line 12: missing required field
  - Line 18: unknown property

Fix these errors and run again.
```

**Color usage:**
- Red for errors - use sparingly (only actual errors)
- Don't rely on color alone (still readable without it)
- Keep important info visible in plain text

---

## 26. Errors Rewrite For Humans

---
title: Catch Errors and Rewrite for Humans
impact: HIGH
impactDescription: Reduces user frustration and support requests
tags: errors, usability, messages, troubleshooting
---

## Catch Errors and Rewrite for Humans

Catch expected errors and rewrite them with helpful, actionable messages. Don't show raw system errors.

**Incorrect (exposes raw error):**

```typescript
// Raw error - unhelpful
const config = fs.readFileSync('/etc/config')
// EACCES: permission denied, open '/etc/config'
```

**Correct (helpful error message):**

```typescript
import fs from 'fs'

try {
  const config = fs.readFileSync('/etc/config', 'utf-8')
} catch (error) {
  if (error.code === 'EACCES') {
    console.error("Error: Can't read /etc/config")
    console.error("Try running with sudo, or check file permissions:")
    console.error("  sudo chmod 644 /etc/config")
    process.exit(1)
  } else if (error.code === 'ENOENT') {
    console.error("Error: Config file not found: /etc/config")
    console.error("Create one with: mycmd init")
    process.exit(1)
  }
  throw error
}
```

**Error message structure:**

1. **What happened** (brief)
2. **Why it happened** (if known)
3. **How to fix it** (actionable)

**Good examples:**

```
Error: Can't connect to database at localhost:5432
The database server may not be running.
Try: docker start postgres
```

```
Error: Invalid configuration in ~/.mycmdrc line 5
Expected format: key = value
Got: invalid syntax here
```

**Compare to raw errors:**

```

ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432

# Good - helpful message
Error: Can't connect to database at localhost:5432
Is the database running? Try: pg_ctl start
```

**Catch common Node.js errors:**

```typescript
catch (error) {
  if (error.code === 'EACCES') { /* Permission denied */ }
  if (error.code === 'ENOENT') { /* File not found */ }
  if (error.code === 'ECONNREFUSED') { /* Connection refused */ }
  if (error.code === 'ETIMEDOUT') { /* Timeout */ }
}
```

**Don't expose:**
- Raw exception stack traces (unless in debug mode)
- Technical jargon users won't understand
- Internal implementation details

---

## 27. Errors Signal To Noise

---
title: Maintain Signal-to-Noise Ratio
impact: MEDIUM-HIGH
impactDescription: Users can quickly identify actual problems
tags: errors, output, debugging, usability
---

## Maintain Signal-to-Noise Ratio

Keep error output focused. Too much irrelevant information makes it hard to find the actual problem.

**Incorrect (noise drowns signal):**

```
$ mycmd deploy
[DEBUG] Loading config from ~/.mycmdrc
[DEBUG] Config loaded successfully
[DEBUG] Connecting to api.example.com
[DEBUG] Connection established
[DEBUG] Sending request...
ERROR: Invalid API key
[DEBUG] Closing connection
[DEBUG] Connection closed
[DEBUG] Cleaning up temp files
[DEBUG] Done cleaning
```

**Correct (clear, focused):**

```
$ mycmd deploy
Error: Invalid API key
Check your credentials at: ~/.mycmd/credentials
Or set MYCMD_API_KEY environment variable
```

**Group similar errors:**

```

Error: Failed to process line 1: invalid format
Error: Failed to process line 5: invalid format
Error: Failed to process line 8: invalid format
... (97 more lines)

# Good - grouped summary
Error: Failed to process 100 lines with invalid format
First error at line 1: expected "key=value", got "invalid"
Run with --verbose to see all errors
```

**Put important info at the end:**

```
# Bad - user might miss the solution
Try: mycmd reset-config
Error: Configuration file is corrupt
Additional context: ...
(50 more lines of debug info)

# Good - solution is where eyes go
Error: Configuration file is corrupt
... details ...

Fix this by running: mycmd reset-config
```

**Debug info should be opt-in:**

```bash
# Normal - clean and focused
$ mycmd deploy
Error: Connection failed

# Verbose - includes debug info
$ mycmd deploy --verbose
[DEBUG] Loading config...
[DEBUG] Connecting to api.example.com...
Error: Connection failed: timeout after 30s
[DEBUG] Stack trace: ...
```

**Save full logs to file, not terminal:**

```typescript
import fs from 'fs'

// Quiet terminal output
console.error("Error: Deployment failed")
console.error("Full logs written to: /tmp/mycmd-deploy.log")

// Verbose file logs
const logStream = fs.createWriteStream('/tmp/mycmd-deploy.log')
logStream.write(`[DEBUG] ${debugInfo}\n`)
```

---

## 28. Future Additive Changes

---
title: Keep Changes Additive
impact: MEDIUM
impactDescription: Avoids breaking user scripts and workflows
tags: future-proofing, api-design, compatibility, versioning
---

## Keep Changes Additive

Add new flags and features instead of changing existing behavior. This keeps existing scripts working.

**Incorrect (breaks existing usage):**

```bash

mycmd process --output results.txt

# Version 2.0: --output now means format (BREAKS v1 scripts!)
mycmd process --output json  
# Tries to write to file named "json"
```

**Correct (additive change):**

```bash
# Version 1.0
mycmd process --output results.txt

# Version 2.0: Add new flag, keep old one
mycmd process --output results.txt --format json
# Both flags coexist
```

**Adding, not changing:**

```bash
# Good: Adding new flag
v1.0: mycmd deploy app
v2.0: mycmd deploy app --region us-east  # New flag

# Bad: Changing behavior
v1.0: mycmd deploy app  # Deploys to production
v2.0: mycmd deploy app  # Now deploys to staging (BREAKING!)
```

**If you must make breaking changes:**

1. **Add new flag first** (both old and new work)
2. **Deprecation warning** when old flag is used
3. **Wait several versions** before removing

```typescript
if (options.oldFlag) {
  console.error("Warning: --old-flag is deprecated")
  console.error("Use --new-flag instead")
  console.error("--old-flag will be removed in v3.0")
  // Still works for now
  handleOldFlag()
}
```

**Detect and silence warnings:**

```typescript
// Once user switches to new flag, no warning
if (options.newFlag && !options.oldFlag) {
  // User updated - no warning needed
  handleNewFlag()
}
```

**What's safe to change:**
- Adding new flags/subcommands
- Adding new output fields to --json
- Improving human-readable output (if users use --json in scripts)
- Improving error messages

**What breaks users:**
- Removing flags
- Changing flag behavior
- Changing --json schema (removing fields)
- Changing --plain output format
- Changing exit codes

**Use semantic versioning:**
- Patch (1.0.1): Bug fixes only
- Minor (1.1.0): Additive changes
- Major (2.0.0): Breaking changes (use sparingly!)

---

## 29. Help Concise Default

---
title: Display Concise Help by Default
impact: CRITICAL
impactDescription: Prevents users from getting stuck with unclear error messages
tags: help, usability, documentation, ux
---

## Display Concise Help by Default

When your command requires arguments but is run with none, display concise help text. Don't just error out or hang.

**Incorrect (unclear error):**

```bash
$ mycmd
Error: missing required argument
```

**Correct (helpful default):**

```bash
$ mycmd
mycmd - Process and transform data files

Usage: mycmd <file> [options]

Examples:
  mycmd input.csv
  mycmd data.json --format yaml

Options:
  -h, --help     Show detailed help
  -v, --version  Show version

See 'mycmd --help' for more information.
```

**Concise help should include:**
1. Brief description of what the tool does
2. One or two example invocations
3. Most common flags
4. Instruction to pass `--help` for full help

**Example from jq:**

```
$ jq
jq - commandline JSON processor [version 1.6]

Usage: jq [options] <jq filter> [file...]

jq is a tool for processing JSON inputs, applying the given filter to
its JSON text inputs and producing the filter's results as JSON on
standard output.

Example:
  $ echo '{"foo": 0}' | jq .

For a listing of options, use jq --help.
```

**Exception:** Interactive programs like `npm init` can skip this.

---

## 30. Help Lead Examples

---
title: Lead with Examples in Help Text
impact: HIGH
impactDescription: Users learn from examples faster than reading descriptions
tags: help, examples, documentation, usability
---

## Lead with Examples in Help Text

Put examples first in help text. Users gravitate toward examples and skip dense text.

**Incorrect (examples buried at the end):**

```
$ mycmd --help
mycmd - Data processing tool

OPTIONS:
  -i, --input <file>     Input file path
  -o, --output <file>    Output file path
  -f, --format <fmt>     Output format (json, yaml, csv)
  
(50 more lines of options...)

EXAMPLES:
  mycmd -i data.csv -o output.json -f json
```

**Correct (examples up front):**

```
$ mycmd --help
mycmd - Data processing tool

EXAMPLES:
  # Process CSV to JSON
  mycmd input.csv --format json > output.json
  
  # Process multiple files
  mycmd *.csv --format yaml --output results/
  
  # With filtering
  mycmd data.csv --filter "age > 18" --format json

USAGE:
  mycmd <input> [options]

OPTIONS:
  -f, --format <fmt>    Output format (json, yaml, csv)
  -o, --output <file>   Output file
  --filter <expr>       Filter expression
```

**Build toward complex usage:**
- Start with simplest example
- Add complexity gradually
- Show actual output when helpful
- Include common use cases

**If you have many examples, separate them:**
```bash
mycmd examples        # Show example gallery
mycmd --help          # Concise help with 2-3 examples
```

Reference: See `git --help` for good example structure

---

## 31. Help Suggest Corrections

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
    .map(c => ({ cmd: c, dist: distance(cmd, c) }))
    .filter(m => m.dist <= 2)
    .sort((a, b) => a.dist - b.dist)
  
  if (matches.length > 0) {
    const suggestion = matches[0].cmd
    console.error(`Error: Unknown command '${cmd}'`)
    
    if (process.stdin.isTTY) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Did you mean '${suggestion}'?`
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

---

## 32. Help Web Documentation

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

mycmd docs search "how to deploy"
# Opens: https://mycmd.dev/docs?q=how+to+deploy
```

**Web docs complement, don't replace CLI help:**
- CLI help: Quick reference, always available
- Web docs: Complete guide, examples, tutorials, searchable

---

## 33. Interactive No Input Flag

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
    choices: [{ title: 'staging' }, { title: 'production' }]
  })
  
  if (env === 'production') {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?'
    })
  }
}
```

**Correct (supports --no-input):**

```typescript
import prompts from 'prompts'

async function deploy(options: { noInput?: boolean, env?: string, force?: boolean }) {
  let env = options.env
  
  if (options.noInput) {
    // Non-interactive mode
    if (!env) {
      console.error("Error: --env required with --no-input")
      process.exit(1)
    }
  } else if (process.stdin.isTTY) {
    // Interactive mode - can prompt
    if (!env) {
      const response = await prompts({
        type: 'select',
        name: 'env',
        message: 'Environment',
        choices: [{ title: 'staging' }, { title: 'production' }]
      })
      env = response.env
    }
    
    if (env === 'production' && !options.force) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Deploy to production?'
      })
      if (!confirm) process.exit(1)
    }
  }
  
  await doDeploy(env)
}
```

**Usage:**

```bash

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
        console.error("Error: --env required with --no-input")
        process.exit(1)
      }
    } else if (process.stdin.isTTY) {
      // Can prompt for missing values
      if (!options.env) {
        const { env } = await prompts({
          type: 'text',
          name: 'env',
          message: 'Environment'
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
    process.stdin.isTTY &&           // stdin is interactive
    !options.noInput &&              // --no-input not passed
    !process.env.CI                  // not in CI
  )
}
```

---

## 34. Interactive Password No Echo

---
title: Don't Echo Passwords as User Types
impact: HIGH
impactDescription: Prevents shoulder-surfing and accidental exposure
tags: security, passwords, interactivity, privacy
---

## Don't Echo Passwords as User Types

Never display passwords as the user types them. Use password input mode.

**Incorrect (echoes password):**

```typescript
import prompts from 'prompts'

// Shows password as user types!
const { password } = await prompts({
  type: 'text',  // Wrong type
  name: 'password',
  message: 'Password'
})
```

**Correct (hides password):**

```typescript
import prompts from 'prompts'

const { password } = await prompts({
  type: 'password',  // Correct - input is hidden
  name: 'password',
  message: 'Password'
})
```

**Using different libraries:**

```typescript
// With inquirer
import inquirer from 'inquirer'

const { password } = await inquirer.prompt([{
  type: 'password',
  name: 'password',
  message: 'Enter password',
  mask: '*'  // Optional: show asterisks
}])

// With read (simpler)
import read from 'read'

const password = await read({
  prompt: 'Password: ',
  silent: true,  // Don't echo
  replace: '*'   // Optional: show asterisks instead
})
```

**For confirmation:**

```typescript
const { password } = await prompts({
  type: 'password',
  name: 'password',
  message: 'Password'
})

const { confirm } = await prompts({
  type: 'password',
  name: 'confirm',
  message: 'Confirm password'
})

if (password !== confirm) {
  console.error('Error: Passwords do not match')
  process.exit(1)
}
```

**Other secret inputs:**

```typescript
// API keys, tokens, etc. should also be hidden
const { apiKey } = await prompts({
  type: 'password',
  name: 'apiKey',
  message: 'API Key'
})
```

**Always provide non-interactive alternative:**

```bash

$ mycmd login
Password: ********

# Non-interactive (from file)
$ mycmd login --password-file ~/.mycmd/password

# Non-interactive (from stdin)
$ cat ~/.mycmd/password | mycmd login --password-stdin
```

**Security note:** Even with hidden input, prefer reading from files or environment for automation:

```typescript
if (options.passwordFile) {
  password = fs.readFileSync(options.passwordFile, 'utf-8').trim()
} else if (!process.stdin.isTTY) {
  // Read from stdin
  password = fs.readFileSync(0, 'utf-8').trim()
} else {
  // Interactive prompt
  const result = await prompts({
    type: 'password',
    name: 'password',
    message: 'Password'
  })
  password = result.password
}
```

---

## 35. Interactive Tty Check

---
title: Only Prompt if stdin is a TTY
impact: HIGH
impactDescription: Prevents scripts from hanging on prompts
tags: interactivity, tty, prompts, scripting, automation
---

## Only Prompt if stdin is a TTY

Only use prompts or interactive elements if stdin is an interactive terminal. In scripts and pipes, fail with clear error message.

**Incorrect (always prompts - breaks scripts):**

```typescript
import prompts from 'prompts'

// Hangs in scripts!
const { confirm } = await prompts({
  type: 'confirm',
  name: 'confirm',
  message: 'Continue?'
})
if (!confirm) process.exit(1)
```

**Correct (checks for TTY):**

```typescript
import prompts from 'prompts'

if (process.stdin.isTTY) {
  // Interactive terminal - can prompt
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Continue?'
  })
  if (!confirm) process.exit(1)
} else {
  // Script/pipe - require flag
  if (!options.force) {
    console.error("Error: Use --force in non-interactive mode")
    process.exit(1)
  }
}
```

**Why this matters:**

```bash

$ mycmd deploy
# Waiting for input that never comes...

# With TTY check, fails fast with clear message
$ mycmd deploy
Error: Use --force in non-interactive mode
```

**Always provide non-interactive alternative:**

```bash
# Interactive mode
$ mycmd delete-project
Type project name to confirm: myproject
Deleted.

# Non-interactive mode (required for scripts)
$ mycmd delete-project --confirm=myproject
Deleted.
```

**Other languages:**

```go
import "github.com/mattn/go-isatty"

if isatty.IsTerminal(os.Stdin.Fd()) {
    // Can prompt
} else {
    // Must use flags
}
```

```python
import sys
if sys.stdin.isatty():
    # Interactive
else:
    # Script mode
```

**Also provide `--no-input` flag:**

```bash
mycmd deploy --no-input  # Never prompt, fail if input needed
```

---

## 36. Naming Distribute Single Binary

---
title: Distribute as Single Binary When Possible
impact: LOW-MEDIUM
impactDescription: Simplifies installation and reduces dependency issues
tags: distribution, packaging, installation, deployment
---

## Distribute as Single Binary When Possible

Distribute your CLI as a single executable file when possible. Simplifies installation.

**Good (single file):**

```bash

curl -L https://mycmd.dev/install.sh | bash
# Installs single binary to /usr/local/bin/mycmd
```

**For Node.js CLIs, use pkg or esbuild:**

```typescript
// package.json
{
  "scripts": {
    "build": "esbuild src/cli.ts --bundle --platform=node --outfile=dist/mycmd.js",
    "package": "pkg dist/mycmd.js --output dist/mycmd"
  },
  "bin": {
    "mycmd": "./dist/mycmd"
  }
}
```

**Using pkg for standalone binary:**

```bash
# Compile to standalone binaries
pkg package.json

# Outputs:
# mycmd-macos
# mycmd-linux  
# mycmd-win.exe
```

**Using esbuild (keeps Node dependency):**

```bash
# Bundle all dependencies into one JS file
esbuild src/cli.ts --bundle --platform=node --outfile=mycmd.js

# Still needs Node runtime, but no node_modules
chmod +x mycmd.js
./mycmd.js
```

**Installation script:**

```bash
#!/bin/bash
# install.sh

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Download appropriate binary
curl -L "https://mycmd.dev/releases/latest/mycmd-${OS}-${ARCH}" \
  -o /usr/local/bin/mycmd

chmod +x /usr/local/bin/mycmd

echo "✓ mycmd installed to /usr/local/bin/mycmd"
```

**Alternative: npm global install**

```bash
npm install -g mycmd
```

**Benefits of single binary:**
- No dependency hell
- Fast installation
- Works offline after download
- Easy to verify checksums
- Simple to uninstall

**If you can't make a single binary:**
- Use npm/pip/cargo for language-specific tools
- Use system package managers (apt, brew, etc.)
- Document all dependencies clearly

**Make uninstall easy:**

```bash
# Self-uninstall command
mycmd uninstall
# Removes /usr/local/bin/mycmd and ~/.config/mycmd

# Or document manual removal
rm /usr/local/bin/mycmd
rm -rf ~/.config/mycmd
```

**Package for multiple platforms:**

```json
{
  "pkg": {
    "targets": [
      "node18-macos-x64",
      "node18-macos-arm64",
      "node18-linux-x64",
      "node18-win-x64"
    ],
    "outputPath": "dist"
  }
}
```

---

## 37. Naming Simple Memorable

---
title: Use Simple, Memorable Command Names
impact: LOW-MEDIUM
impactDescription: Users type the command name constantly
tags: naming, usability, ux, ergonomics
---

## Use Simple, Memorable Command Names

Choose a command name that is simple, memorable, and easy to type.

**Good command names:**
- `curl` - memorable, easy to type
- `git` - short, unique
- `docker` - recognizable, distinct
- `jq` - very short for frequent use
- `npm` - memorable acronym

**Bad command names:**
- `myApplicationCLI` - too long, mixed case
- `convert` - conflicts with ImageMagick and Windows
- `run` - too generic
- `plum` - awkward to type one-handed (original Docker Compose name, changed to `fig`)

**Formatting rules:**
- **Lowercase only**: `mycmd`, not `MyCMD` or `MyCmd`
- **Use dashes if needed**: `my-app`, not `my_app`
- **Keep it short**: Users type it constantly
- **Make it unique**: Don't conflict with common commands

**Test ergonomics:**

```bash

git status
npm install
docker ps

# Hard to type (awkward)
kubectl get pods  # People alias to k8s
```

**Consider these factors:**
- Can you type it with one hand comfortably?
- Is it easy to spell?
- Will users remember it?
- Does it conflict with existing commands?
- Can you say it out loud clearly?

**Subcommand naming:**

```bash
# Consistent, memorable verbs
mycmd create
mycmd list
mycmd update
mycmd delete

# Avoid confusing pairs
mycmd update vs mycmd upgrade  # Too similar!
```

**If your name is taken, consider:**
- Adding a prefix/suffix: `myapp-cli`
- Using the project name: `acme-deploy`
- Finding a unique alternative: `fig` instead of `plum`

**Document alternatives:**
```bash
# Common pattern for long names
kubectl → alias k=kubectl
kubernetes-cli → k8s
```

---

## 38. Output Json Flag

---
title: Support --json for Machine-Readable Output
impact: HIGH
impactDescription: Enables script integration and programmatic usage
tags: output, json, automation, scripting, api
---

## Support --json for Machine-Readable Output

Provide `--json` flag for structured, machine-readable output. This enables integration with other tools and scripts.

**Incorrect (only human-readable output):**

```bash
$ mycmd list
Projects:
  - myapp (active)
  - oldapp (archived)
  

```

**Correct (supports --json):**

```bash
$ mycmd list --json
{"projects":[{"name":"myapp","status":"active"},{"name":"oldapp","status":"archived"}]}
```

**Implementation:**

```typescript
import { Command } from 'commander'

function listProjects(options: { json?: boolean }) {
  const projects = getProjects()
  
  if (options.json) {
    console.log(JSON.stringify({ projects }, null, 2))
  } else {
    console.log("Projects:")
    projects.forEach(p => {
      console.log(`  - ${p.name} (${p.status})`)
    })
  }
}

const program = new Command()
program
  .command('list')
  .option('--json', 'output as JSON')
  .action(listProjects)
```

**Benefits:**
- Pipes to `jq` for querying: `mycmd list --json | jq '.projects[0].name'`
- Integrates with web services via `curl`
- Enables programmatic usage
- Stable output format for scripts

**JSON output should:**
- Be valid, parsable JSON
- Use consistent schema
- Be formatted (pretty-printed) by default
- Go to `stdout` (not `stderr`)

```bash
# Pipe to jq for processing
mycmd list --json | jq '.projects[] | select(.status == "active")'

# Save to file
mycmd export --json > data.json

# Send to API
mycmd get user --json | curl -X POST https://api.example.com/users -d @-
```

Reference: https://stedolan.github.io/jq/

---

## 39. Output Pager

---
title: Use a Pager for Long Output
impact: LOW-MEDIUM
impactDescription: Improves readability of long output
tags: output, pager, less, usability
---

## Use a Pager for Long Output

Automatically page long output (like `git diff` does). Don't dump 1000 lines to the terminal.

**Incorrect (dumps everything):**

```typescript
// Dumps 1000 lines, scrolls off screen
const logs = await getLogs()
logs.forEach(log => console.log(log))
```

**Correct (uses pager for long output):**

```typescript
import { spawn } from 'child_process'

function page(content: string) {
  // Only page if stdout is TTY
  if (!process.stdout.isTTY) {
    console.log(content)
    return
  }
  
  const lines = content.split('\n')
  
  // Don't page if fits on screen
  const termHeight = process.stdout.rows || 24
  if (lines.length <= termHeight) {
    console.log(content)
    return
  }
  
  // Use pager
  const pager = process.env.PAGER || 'less'
  const less = spawn(pager, ['-FIRX'], {
    stdio: ['pipe', 'inherit', 'inherit']
  })
  
  less.stdin.write(content)
  less.stdin.end()
}

// Usage
const logs = await getLogs()
page(logs.join('\n'))
```

**Good options for less:**
- `-F`: Don't page if fits on one screen
- `-I`: Case-insensitive search
- `-R`: Allow colors/escape codes
- `-X`: Don't clear screen on exit

**Provide --no-pager flag:**

```typescript
program
  .option('--no-pager', 'disable paging')
  .action((options) => {
    if (options.noPager) {
      console.log(content)
    } else {
      page(content)
    }
  })
```

**Libraries that handle this:**

```typescript
// Use a library for better cross-platform support
import terminalKit from 'terminal-kit'

const term = terminalKit.terminal
term.pager(content)
```

**When to page:**
- Help text with many commands
- Log output
- Diff output
- Large data listings
- Any output >100 lines

**When NOT to page:**
- Output is piped: `mycmd logs | grep error`
- `--json` or `--plain` output
- Non-TTY output
- User passed `--no-pager`

**Check if output is piped:**

```typescript
if (!process.stdout.isTTY || options.json || options.noPager) {
  // Don't page
  console.log(content)
} else {
  // Use pager
  page(content)
}
```

---

## 40. Output Plain Flag

---
title: Support --plain for Script-Friendly Output
impact: MEDIUM
impactDescription: Enables reliable parsing in scripts
tags: output, scripting, automation, parsing
---

## Support --plain for Script-Friendly Output

Provide `--plain` flag for stable, parseable output. Human-friendly output may break scripts.

**Incorrect (only human-friendly output):**

```bash
$ mycmd list
NAME        STATUS      DETAILS
myapp       Running     Started 2 hours ago
                        Memory: 512MB
                        CPU: 2.3%

```

**Correct (supports --plain):**

```bash
$ mycmd list --plain
myapp	running	2h	512MB	2.3%
# One record per line, tab-separated

# Easy to parse
$ mycmd list --plain | awk '{print $1, $2}'
myapp running
```

**Implementation:**

```typescript
function listApps(options: { plain?: boolean }) {
  const apps = getApps()
  
  if (options.plain) {
    // One line per record, tab-separated
    apps.forEach(app => {
      console.log(`${app.name}\t${app.status}\t${app.uptime}\t${app.memory}`)
    })
  } else {
    // Pretty table for humans
    console.log('NAME        STATUS      DETAILS')
    apps.forEach(app => {
      console.log(`${app.name.padEnd(12)}${app.status.padEnd(10)}Started ${app.uptime}`)
      console.log(`${''.padEnd(23)}Memory: ${app.memory}`)
    })
  }
}

program
  .command('list')
  .option('--plain', 'plain output for scripts')
  .action(listApps)
```

**Why both --plain and --json:**
- `--json`: Structured data, complex objects
- `--plain`: Simple tabular data, easy grep/awk

```bash
# --json for complex processing
mycmd list --json | jq '.[] | select(.status == "running")'

# --plain for simple text processing
mycmd list --plain | grep running | cut -f1
```

**--plain should:**
- Output one record per line
- Use consistent delimiters (tabs or spaces)
- Not wrap or truncate
- Be stable across versions
- Work well with `grep`, `awk`, `cut`

```bash
# Pipeline friendly
mycmd list --plain | grep "prod" | awk '{print $1}' | xargs mycmd restart
```

---

## 41. Output State Changes

---
title: Tell the User When You Change State
impact: MEDIUM
impactDescription: Users need to understand what happened
tags: output, state, feedback, transparency
---

## Tell the User When You Change State

When a command changes system state, explain what happened. Help users build a mental model.

**Incorrect (silent state change):**

```bash
$ mycmd deploy

```

**Correct (explains what happened):**

```bash
$ mycmd deploy
Uploading 15 files...
Building application...
Deploying to production...
✓ Deployed successfully to https://myapp.com
```

**Example from git push:**

```bash
$ git push
Enumerating objects: 18, done.
Counting objects: 100% (18/18), done.
Compressing objects: 100% (10/10), done.
Writing objects: 100% (10/10), 2.09 KiB | 2.09 MiB/s, done.
To github.com:user/repo.git
   6c22c90..a2a5217  main -> main
```

**Show current state:**

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  modified:   src/index.js

no changes added to commit
```

**For each state change, show:**
1. What's happening (during operation)
2. What happened (result)
3. What to do next (optional)

**Implementation:**

```typescript
async function deploy(app: string) {
  console.error(`Deploying ${app}...`)
  
  const url = await doDeploy(app)
  
  console.error(`✓ Deployed successfully`)
  console.error(`  URL: ${url}`)
  console.error(`  View logs: mycmd logs ${app}`)
}
```

**State inspection commands:**

```bash
mycmd status       # Show current state
mycmd list        # Show all resources
mycmd describe app # Show detailed state
```

**Suggest next steps:**

```bash
$ mycmd init myproject
Created project 'myproject'
  Config: myproject/.mycmdrc
  Docs: https://mycmd.dev/docs

Next steps:
  cd myproject
  mycmd start
```

---

## 42. Output Tty Detection

---
title: Check if TTY Before Using Colors/Animations
impact: HIGH
impactDescription: Prevents broken output in pipes and CI/CD
tags: output, tty, colors, animations, piping
---

## Check if TTY Before Using Colors/Animations

Only use colors, animations, and formatting when outputting to an interactive terminal (TTY). Otherwise output will break in pipes and scripts.

**Incorrect (always uses colors):**

```typescript
// Breaks when piped
console.log("\x1b[32mSuccess!\x1b[0m")  // Always outputs escape codes
```

**Correct (checks for TTY):**

```typescript
function printSuccess(message: string) {
  if (process.stdout.isTTY) {
    // Interactive terminal - use colors
    console.log(`\x1b[32m${message}\x1b[0m`)
  } else {
    // Piped or redirected - plain text
    console.log(message)
  }
}

printSuccess("Success!")
```

**Using chalk library (recommended):**

```typescript
import chalk from 'chalk'

// chalk automatically detects TTY
console.log(chalk.green("Success!"))  
// Outputs colors in terminal, plain text when piped
```

**Other languages:**

```go
import "github.com/mattn/go-isatty"

if isatty.IsTerminal(os.Stdout.Fd()) {
    fmt.Println("\033[32mSuccess!\033[0m")
} else {
    fmt.Println("Success!")
}
```

```python
import sys
if sys.stdout.isatty():
    print("\033[32mSuccess!\033[0m")
else:
    print("Success!")
```

**Also disable colors when:**
- `NO_COLOR` environment variable is set (non-empty)
- `TERM=dumb`
- `--no-color` flag is passed
- Outputting to a file or pipe

**Animations must also check TTY:**

```typescript
if (process.stderr.isTTY) {
  showProgressBar()
} else {
  console.error("Processing...")
}
```

Reference: https://no-color.org/

---

## 43. Robustness 100ms Response

---
title: Print Something Within 100ms
impact: MEDIUM-HIGH
impactDescription: Prevents users thinking the program is frozen
tags: robustness, responsiveness, ux, feedback
---

## Print Something Within 100ms

Display output within 100ms of starting. If you're about to do something slow, tell the user first.

**Incorrect (silent, appears frozen):**

```typescript
async function deploy() {
  // 30 seconds of silence - looks broken
  const result = await slowNetworkCall()
  console.log("Deployed!")
}
```

**Correct (immediate feedback):**

```typescript
async function deploy() {
  console.error("Connecting to server...")
  const result = await slowNetworkCall()
  console.error("Deployed!")
}
```

**For operations >1 second, show progress:**

```typescript
import ora from 'ora'

const spinner = ora('Processing files...').start()
for (const file of files) {
  await process(file)
}
spinner.succeed('Processed all files')
```

**Output before slow operations:**

```typescript
// Tell user before network call
console.error("Fetching data from API...")
const data = await fetch(url)

// Tell user before computation
console.error("Analyzing results...")
const results = expensiveComputation(data)
```

**Why this matters:**

```bash

$ mycmd deploy
(30 seconds of silence... is it working? frozen? should I Ctrl-C?)

# With feedback - user knows what's happening
$ mycmd deploy
Connecting to server...
Uploading files...
Building application...
Deployed successfully!
```

**Perceived performance is as important as actual performance:**
- Immediate response feels faster
- Progress indicators make waits tolerable
- Silence causes anxiety and Ctrl-C mashing

Reference: https://www.nngroup.com/articles/response-times-3-important-limits/

---

## 44. Robustness Idempotent

---
title: Make Operations Idempotent
impact: MEDIUM
impactDescription: Safe to retry, arrow-up and enter works
tags: robustness, idempotency, reliability, recovery
---

## Make Operations Idempotent

Design operations to be safe to run multiple times. Running twice should have the same effect as running once.

**Incorrect (fails on retry):**

```typescript
async function deploy() {
  fs.mkdirSync('/var/app')     // Fails if already exists
  await uploadFiles()          // Re-uploads all files
  await startService()         // Fails if already running
}
```

**Correct (idempotent):**

```typescript
import fs from 'fs'

async function deploy() {
  // Creates only if doesn't exist
  fs.mkdirSync('/var/app', { recursive: true })
  
  // Uploads only changed files
  await syncFiles({ onlyIfDifferent: true })
  
  // Starts or restarts service
  if (await isRunning()) {
    await restartService()
  } else {
    await startService()
  }
}
```

**Check existing state:**

```typescript
async function setupDatabase() {
  if (await databaseExists()) {
    console.error("Database already exists, skipping creation")
    return
  }
  
  await createDatabase()
  await runMigrations()
}
```

**Idempotent file operations:**

```typescript
// Creates only if missing
fs.mkdirSync(path, { recursive: true })

// Writes or overwrites (same result)
fs.writeFileSync(path, content)

// Appends only if not present
function appendIfMissing(file: string, line: string) {
  const content = fs.readFileSync(file, 'utf-8')
  if (content.includes(line)) {
    return  // Already present
  }
  fs.appendFileSync(file, line + '\n')
}
```

**Benefits for users:**

```bash

$ mycmd deploy
Error: Connection lost

# Just hit up-arrow and enter - picks up where it left off
$ mycmd deploy
Already deployed, checking for updates...
Done!
```

**Provide status commands:**

```bash
$ mycmd deploy
Deployment already complete (ran 2 hours ago)
Use --force to redeploy anyway
```

**Atomic operations prevent partial state:**

```typescript
import fs from 'fs'
import os from 'os'
import path from 'path'

// Atomic file write
function atomicWrite(filePath: string, content: string) {
  const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}`)
  fs.writeFileSync(tempPath, content)
  fs.renameSync(tempPath, filePath)  // Atomic rename
}
```

Reference: https://lwn.net/Articles/191059/ (Crash-only software)

---

## 45. Robustness Network Timeouts

---
title: Set Timeouts on Network Operations
impact: HIGH
impactDescription: Prevents hanging forever on network issues
tags: robustness, network, timeouts, http, reliability
---

## Set Timeouts on Network Operations

Always set timeouts on network operations. Don't let your CLI hang forever.

**Incorrect (no timeout - hangs forever):**

```typescript
// Hangs forever if server doesn't respond
const response = await fetch(url)
```

**Correct (with timeout):**

```typescript
// Times out after 30 seconds
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 30000)

try {
  const response = await fetch(url, {
    signal: controller.signal
  })
  clearTimeout(timeout)
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Error: Request timed out after 30s')
    console.error('Check your network connection')
    process.exit(4)  // Network error exit code
  }
  throw error
}
```

**Using axios (simpler):**

```typescript
import axios from 'axios'

const response = await axios.get(url, {
  timeout: 30000  // 30 second timeout
})
```

**Make timeouts configurable:**

```typescript
program
  .option('--timeout <seconds>', 'network timeout', '30')
  .action(async (options) => {
    const timeoutMs = parseInt(options.timeout) * 1000
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs)
    })
  })
```

**Different timeouts for different operations:**

```typescript
const TIMEOUTS = {
  connect: 5000,      // 5s to establish connection
  read: 30000,        // 30s to read response
  upload: 300000,     // 5 minutes for large uploads
}

await fetch(url, {
  signal: AbortSignal.timeout(TIMEOUTS.read)
})
```

**Show timeout in error:**

```typescript
catch (error) {
  if (error.name === 'AbortError') {
    console.error(`Error: Request timed out after ${timeout/1000}s`)
    console.error('Try:')
    console.error(`  - Increase timeout: mycmd --timeout 60`)
    console.error(`  - Check network connection`)
    process.exit(4)
  }
}
```

**Retry with backoff for transient failures:**

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, {
        signal: AbortSignal.timeout(30000)
      })
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      
      const backoff = Math.pow(2, attempt) * 1000
      console.error(`Retry in ${backoff/1000}s...`)
      await sleep(backoff)
    }
  }
}
```

**Default timeouts:**
- Connection: 5-10 seconds
- Read: 30-60 seconds
- Large uploads: 5-10 minutes

---

## 46. Robustness Progress Indicators

---
title: Show Progress for Long Operations
impact: MEDIUM
impactDescription: Prevents users thinking program is frozen
tags: robustness, progress, ux, feedback
---

## Show Progress for Long Operations

Display progress indicators for operations taking more than ~1 second.

**Incorrect (silent during long operation):**

```typescript
async function processFiles(files: string[]) {
  // 5 minutes of silence
  for (const file of files) {
    await process(file)
  }
  console.log("Done")
}
```

**Correct (shows progress):**

```typescript
import ora from 'ora'
import cliProgress from 'cli-progress'

async function processFiles(files: string[]) {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(files.length, 0)
  
  for (let i = 0; i < files.length; i++) {
    await process(files[i])
    bar.update(i + 1)
  }
  
  bar.stop()
}

// Or with ora for spinners
const spinner = ora('Processing files...').start()
for (const file of files) {
  await process(file)
}
spinner.succeed('Processed all files')
```

Output:
```
Processing: ████████████░░░░░░░░░ 45% | 45/100 | ETA: 28s
```

**Progress indicator libraries:**
- **Node**: ora (spinners), cli-progress (bars), listr2 (tasks)
- Python: tqdm
- Go: schollz/progressbar
- Rust: indicatif

**Only show in TTY:**

```typescript
if (process.stderr.isTTY) {
  // Show progress bar
  const bar = new cliProgress.SingleBar({})
  bar.start(files.length, 0)
  for (let i = 0; i < files.length; i++) {
    await process(files[i])
    bar.update(i + 1)
  }
  bar.stop()
} else {
  // Plain output for scripts/CI
  console.error(`Processing ${files.length} files...`)
  for (const file of files) {
    await process(file)
  }
}
```

**Progress indicators should:**
- Show estimated time remaining
- Animate to indicate activity (not frozen)
- Stick to one line (don't spam)
- On error, reveal full logs (don't hide behind progress)

**For parallel operations:**

```
Downloading files:
  image1.png   [████████████████████] 100%
  image2.png   [██████████░░░░░░░░░░]  50%
  image3.png   [████░░░░░░░░░░░░░░░░]  20%
```

**Simple spinners for indeterminate waits:**

```bash
$ mycmd deploy
Deploying... ⠋
```

Use libraries to handle this—manual progress is hard to get right:
```typescript
import { Listr } from 'listr2'

// Automatic parallel progress with tasks
const tasks = new Listr([
  { title: 'Task 1', task: async () => await doTask1() },
  { title: 'Task 2', task: async () => await doTask2() },
], { concurrent: true })

await tasks.run()
```

---

## 47. Robustness Validate Early

---
title: Validate Input Early, Fail Fast
impact: MEDIUM-HIGH
impactDescription: Catches errors before work is done
tags: robustness, validation, errors, inputs
---

## Validate Input Early, Fail Fast

Validate all inputs before doing any work. Don't wait until halfway through to discover bad input.

**Incorrect (validates too late):**

```typescript
async function deploy(app: string, env: string, region: string) {
  console.error("Starting deployment...")
  await uploadFiles()        // 5 minutes
  await buildApplication()   // 10 minutes
  
  // Validates after 15 minutes of work!
  if (!['staging', 'production'].includes(env)) {
    console.error("Error: Invalid environment")
    process.exit(1)
  }
}
```

**Correct (validates first):**

```typescript
import fs from 'fs'

async function deploy(app: string, env: string, region: string) {
  // Validate everything upfront
  if (!fs.existsSync(app)) {
    console.error(`Error: App not found: ${app}`)
    process.exit(1)
  }
  
  if (!['staging', 'production'].includes(env)) {
    console.error(`Error: Invalid environment: ${env}`)
    console.error("Valid: staging, production")
    process.exit(1)
  }
  
  if (!isValidRegion(region)) {
    console.error(`Error: Invalid region: ${region}`)
    process.exit(1)
  }
  
  // Now do the work
  console.error("Starting deployment...")
  await uploadFiles()
  await buildApplication()
}
```

**Validate all inputs:**
- File paths exist and are readable
- Values are in expected format
- Enum values are valid options
- Credentials are present
- Network connectivity (if required)

**Structured validation:**

```typescript
function validateArgs(args: any) {
  const errors: string[] = []
  
  if (!fs.existsSync(args.input)) {
    errors.push(`Input file not found: ${args.input}`)
  }
  
  if (!isValidEmail(args.email)) {
    errors.push(`Invalid email: ${args.email}`)
  }
  
  if (args.port < 1 || args.port > 65535) {
    errors.push(`Port must be 1-65535, got: ${args.port}`)
  }
  
  if (errors.length > 0) {
    errors.forEach(error => console.error(`Error: ${error}`))
    process.exit(2)  // Exit code 2 for bad arguments
  }
}

validateArgs(options)
// Now safe to proceed
```

**Benefits:**
- Fails in <1 second instead of after minutes
- Clear, immediate feedback
- No wasted work
- Better user experience

---

## 48. Signals Crash Only Design

---
title: Design for Crash-Only Operation
impact: MEDIUM-HIGH
impactDescription: Program can be killed at any time without corruption
tags: signals, robustness, crash-only, recovery, cleanup
---

## Design for Crash-Only Operation

Design your CLI to be safely killed at any time. Don't rely on cleanup code running.

**Incorrect (relies on cleanup):**

```typescript
let tempFiles: string[] = []

async function process() {
  tempFiles.push('/tmp/data1', '/tmp/data2')
  await doWork()
  // Relies on cleanup - breaks if killed
  cleanupTempFiles()
}

process.on('exit', cleanupTempFiles)  // Not guaranteed to run
```

**Correct (crash-safe design):**

```typescript
import fs from 'fs'
import path from 'path'
import os from 'os'

async function process() {
  // Clean up stale temp files on startup
  cleanupOldTempFiles()
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mycmd-'))
  
  try {
    await doWork()
  } finally {
    // Try to cleanup, but don't rely on it
    try {
      fs.rmSync(tempDir, { recursive: true })
    } catch {
      // If cleanup fails, startup cleanup will handle it next time
    }
  }
}

function cleanupOldTempFiles() {
  // Remove any temp files from previous crashed runs
  const tmpDir = os.tmpdir()
  const files = fs.readdirSync(tmpDir)
  files.forEach(file => {
    if (file.startsWith('mycmd-') && isOldEnough(file)) {
      fs.rmSync(path.join(tmpDir, file), { recursive: true })
    }
  })
}
```

**Use atomic operations:**

```typescript
// Atomic file write - never leaves partial file
function atomicWrite(filePath: string, content: string) {
  const tempPath = `${filePath}.tmp.${Date.now()}`
  fs.writeFileSync(tempPath, content)
  fs.renameSync(tempPath, filePath)  // Atomic on same filesystem
}

// If killed during write, next run sees:
// - Old file (if rename didn't happen)
// - New file (if rename succeeded)
// Never a partial/corrupt file
```

**Check for stale state on startup:**

```typescript
async function start() {
  // Check for lock file from crashed run
  if (fs.existsSync('.mycmd.lock')) {
    const pid = fs.readFileSync('.mycmd.lock', 'utf-8')
    if (!isProcessRunning(pid)) {
      console.error('Cleaning up from previous crashed run...')
      fs.unlinkSync('.mycmd.lock')
    }
  }
  
  // Create lock file
  fs.writeFileSync('.mycmd.lock', process.pid.toString())
}
```

**Principles:**
- Don't require cleanup to complete
- Use atomic file operations
- Check for stale state on startup
- Clean up in next run, not during shutdown

Reference: https://lwn.net/Articles/191059/

---

## 49. Signals Exit On Ctrl C

---
title: Exit Immediately on Ctrl-C
impact: HIGH
impactDescription: Users expect Ctrl-C to always work
tags: signals, ctrl-c, sigint, responsiveness, ux
---

## Exit Immediately on Ctrl-C

When a user hits Ctrl-C (SIGINT), respond immediately and exit as soon as possible.

**Incorrect (ignores or delays Ctrl-C):**

```typescript
// Ctrl-C doesn't work during this
try {
  const result = await longRunningOperation()
} catch (error) {
  // Swallows interrupt!
}
```

**Correct (responds to Ctrl-C immediately):**

```typescript
process.on('SIGINT', () => {
  console.error("\nCancelled.")
  // Quick cleanup with timeout
  cleanupWithTimeout(5000)
  process.exit(130)  // 128 + SIGINT(2)
})

// Let errors propagate
const result = await longRunningOperation()
```

**For long cleanup, allow second Ctrl-C:**

```typescript
let forceQuit = false

process.on('SIGINT', () => {
  if (forceQuit) {
    console.error("\nForce quitting!")
    process.exit(130)
  }
  
  forceQuit = true
  console.error("\nStopping... (press Ctrl+C again to force)")
  gracefulShutdown().then(() => process.exit(0))
})
```

**Example from Docker Compose:**

```bash
$ docker-compose up
...
^CGracefully stopping... (press Ctrl+C again to force)
```

**Rules:**
- Say something immediately before cleanup
- Add timeout to cleanup (max 5 seconds)
- Exit with code 130 (128 + SIGINT signal 2)
- Allow second Ctrl-C to force quit

**Other languages:**

```go
c := make(chan os.Signal, 1)
signal.Notify(c, os.Interrupt)

go func() {
    <-c
    fmt.Fprintln(os.Stderr, "\nCancelled.")
    cleanup()
    os.Exit(130)
}()
```

```python
import signal
signal.signal(signal.SIGINT, lambda s, f: sys.exit(130))
```

---

## 50. Subcommands Consistency

---
title: Be Consistent Across Subcommands
impact: MEDIUM-HIGH
impactDescription: Reduces cognitive load and improves predictability
tags: subcommands, consistency, flags, ux
---

## Be Consistent Across Subcommands

Use the same flag names, output formats, and patterns across all subcommands.

**Incorrect (inconsistent flags):**

```bash

mycmd users list --output json
mycmd projects list --format json  # Different flag!
mycmd teams list -f json            # Different flag again!
```

**Correct (consistent flags):**

```bash
# Same flag everywhere
mycmd users list --format json
mycmd projects list --format json
mycmd teams list --format json

# Or all support -o shorthand
mycmd users list -o json
mycmd projects list -o json
```

**Use consistent verbs:**

| Action | Good | Avoid mixing |
|--------|------|--------------|
| Create | `create` | `new`, `add`, `make` |
| Read | `get`, `list`, `show` | `display`, `view` |
| Update | `update`, `set` | `modify`, `change` |
| Delete | `delete`, `remove` | `rm`, `destroy` |

**Example of good consistency (Docker):**

```bash
docker container create
docker container list
docker container start
docker container stop
docker container remove

docker image create
docker image list
docker image push
docker image pull
docker image remove
```

**Inconsistent patterns to avoid:**

```bash
# Bad - similar names, different meanings
mycmd update     # Update dependencies
mycmd upgrade    # Upgrade version??

# Good - clear distinction
mycmd update-deps
mycmd upgrade-version
```

**Shared behavior across subcommands:**
- Global flags work everywhere: `--verbose`, `--config`
- Output format flags: `--json`, `--plain`
- Authentication/credentials
- Help patterns: `mycmd help <subcommand>`

**Benefits:**
- Users learn once, apply everywhere
- Reduces documentation burden
- Predictable behavior
- Lower cognitive load

---

## 51. Subcommands Consistent Verbs

---
title: Use Consistent Verbs Across Subcommands
impact: MEDIUM
impactDescription: Reduces cognitive load, makes CLI guessable
tags: subcommands, verbs, consistency, api-design
---

## Use Consistent Verbs Across Subcommands

Use the same verb pattern for the same action across all resource types.

**Incorrect (inconsistent verbs):**

```bash
mycmd users create      # create
mycmd projects new      # new - different verb!
mycmd teams add         # add - another different verb!
mycmd servers make      # make - yet another verb!
```

**Correct (consistent verbs):**

```bash

mycmd users create
mycmd projects create
mycmd teams create
mycmd servers create
```

**Standard CRUD verb patterns:**

| Action | Recommended | Avoid mixing |
|--------|-------------|--------------|
| **Create** | `create`, `new`, `init` | `add`, `make`, `insert` |
| **Read** | `get`, `show`, `describe` | `display`, `view`, `read` |
| **List** | `list`, `ls` | `show`, `get-all` |
| **Update** | `update`, `set`, `edit` | `modify`, `change`, `patch` |
| **Delete** | `delete`, `remove`, `rm` | `destroy`, `drop`, `kill` |

**Pick one and stick with it:**

```typescript
// Good - consistent pattern
program.command('users create')
program.command('projects create')
program.command('teams create')

// Bad - mixed verbs
program.command('users create')
program.command('projects new')    // Different!
program.command('teams add')       // Different!
```

**Docker example (good consistency):**

```bash
docker container create
docker container list
docker container start
docker container stop
docker container remove

docker image create
docker image list
docker image push
docker image pull
docker image remove
```

**Kubernetes example (consistent):**

```bash
kubectl create deployment
kubectl get deployment
kubectl describe deployment
kubectl delete deployment

kubectl create pod
kubectl get pod
kubectl describe pod
kubectl delete pod
```

**Two-level subcommand patterns:**

```bash
# Noun-verb (more common)
mycmd resource action
mycmd users create
mycmd users list

# Verb-noun
mycmd action resource
mycmd create user
mycmd list users
```

Pick one pattern and use it everywhere. Don't mix `users create` and `create users` in the same CLI.

---

## 52. Subcommands No Abbreviations

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
const input = 'i'  // Could mean install, init, or info

// Finds first match
const match = commands.find(c => c.startsWith(input))
runCommand(match)  // Runs 'install'
```

**Problem:** If user runs `mycmd i` expecting `install`, you can never add a command starting with `i` (like `inspect`) without breaking scripts.

**Correct (explicit aliases only):**

```typescript
import { Command } from 'commander'

const program = new Command()

// Full command name required
program
  .command('install')
  .alias('i')  // Explicit, documented alias
  .action(install)

// Now 'mycmd install' and 'mycmd i' both work
// But 'mycmd ins' does NOT work
```

**Bad example from real tools:**

```bash

git comm      # Expands to 'commit'
git chec      # Expands to 'checkout'

# Now can't add 'git check' or 'git comment' without breaking scripts!
```

**Explicit aliases are fine:**

```typescript
program
  .command('install')
  .alias('i')
  .alias('add')  // Multiple aliases OK if documented

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
  'install': ['i', 'add'],
  'remove': ['rm', 'delete'],
  'list': ['ls'],
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

---

## 53. Subcommands No Catch All

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

program
  .command('run <cmd...>')
  .description('run a command')
  .action(runCommand)

program
  .command('deploy')
  .description('deploy application')
  .action(deploy)

// User must explicitly type 'run'
// mycmd run echo "hello"
```

**If brevity is important, use explicit alias:**

```typescript
program
  .command('run <cmd...>')
  .alias('r')  // Explicit, documented
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

---

## References

1. [https://clig.dev/](https://clig.dev/)
2. [https://github.com/cli-guidelines/cli-guidelines](https://github.com/cli-guidelines/cli-guidelines)
3. [https://en.wikipedia.org/wiki/The_Unix_Programming_Environment](https://en.wikipedia.org/wiki/The_Unix_Programming_Environment)
4. [https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html)
5. [https://www.gnu.org/prep/standards/html_node/Program-Behavior.html](https://www.gnu.org/prep/standards/html_node/Program-Behavior.html)
6. [https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)
7. [https://devcenter.heroku.com/articles/cli-style-guide](https://devcenter.heroku.com/articles/cli-style-guide)
