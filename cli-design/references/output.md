# Output Formatting

## Core Rules

- **stdout**: Primary output, machine-readable data
- **stderr**: Log messages, errors, progress, human messaging
- **Human-first**: Check TTY status to decide formatting

## TTY Detection

```python
import sys
if sys.stdout.isatty():
    # Use colors, formatting, animations
else:
    # Plain output, no escape codes
```

## Color Guidelines

**Disable colors when:**
- stdout/stderr is not a TTY
- `NO_COLOR` env var is set (non-empty)
- `TERM=dumb`
- `--no-color` flag passed

**Use color intentionally:**
- Highlight important info
- Red for errors (sparingly)
- Don't make everything colorful—defeats purpose

## Machine-Readable Output

### --json flag
Output structured JSON for complex data:
```json
{"status": "success", "files": ["a.txt", "b.txt"], "count": 2}
```

### --plain flag
One record per line, tab-separated, for grep/awk:
```
file1.txt	1024	2024-01-15
file2.txt	2048	2024-01-16
```

## Progress Indicators

**When to show:**
- Operations taking >1 second
- Network requests (show before starting)
- Multi-step processes

**Libraries:**
- Python: tqdm
- Go: schollz/progressbar
- Node: node-progress

**Rules:**
- Don't show in non-TTY (prevents CI log spam)
- Show estimated time or animate to indicate activity
- On error, print full logs (don't hide behind progress)

## Paging

Use pager (less) for long output:
```bash
# Good defaults for less
LESS="-FIRX" less
```
- `-F`: Don't page if fits on screen
- `-I`: Case-insensitive search
- `-R`: Pass through colors
- `-X`: Don't clear screen on exit

Only page if stdout is TTY.

## State Changes

When modifying state, tell the user what happened:
```
$ git push
Enumerating objects: 18, done.
Writing objects: 100% (10/10), 2.09 KiB
To github.com:org/repo.git
 + 6c22c90...a2a5217 main -> main
```

## Suggesting Next Steps

Guide users to next actions:
```
$ git status
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes)
```

## Symbols and Emoji

Use sparingly for clarity:
```
✅ Done! Deployment successful.
❌ Error: Could not connect to database.
🔐 Enter your password:
```

Don't overdo it—program shouldn't look like a toy.

## Don't Output

- Debug info by default (use `-v`/`--verbose`)
- Stack traces for expected errors
- Log level prefixes (ERR, WARN) unless verbose mode
- Info only developers understand
