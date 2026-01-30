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
# Bad - 100 identical errors
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
console.error('Error: Deployment failed')
console.error('Full logs written to: /tmp/mycmd-deploy.log')

// Verbose file logs
const logStream = fs.createWriteStream('/tmp/mycmd-deploy.log')
logStream.write(`[DEBUG] ${debugInfo}\n`)
```
