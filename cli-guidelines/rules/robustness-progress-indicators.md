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
  console.log('Done')
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
const tasks = new Listr(
  [
    { title: 'Task 1', task: async () => await doTask1() },
    { title: 'Task 2', task: async () => await doTask2() },
  ],
  { concurrent: true }
)

await tasks.run()
```
