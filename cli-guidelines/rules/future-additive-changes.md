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
# Version 1.0: --output means file path
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
  console.error('Warning: --old-flag is deprecated')
  console.error('Use --new-flag instead')
  console.error('--old-flag will be removed in v3.0')
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
