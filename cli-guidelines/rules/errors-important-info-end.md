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
# ^ User's eyes go here
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
