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
      console.log(JSON.stringify(result)) // Immediate output
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
  lines.forEach((line) => {
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
