---
title: Push Must Show a Diff Before Applying
impact: HIGH
impactDescription: Prevents accidental variable changes and gives users control over what gets pushed
tags: push, diff, workflow, confirmation
---

## Push Must Show a Diff Before Applying

`cli env push` must display a clear diff showing additions, changes, and
removals before applying any changes. This prevents accidental overwrites and
gives users full visibility and control.

**Incorrect:**

Pushing without showing what will change:

```
$ cli env push

✓ Pushed 12 variables to "development".
```

Vague summary without details:

```
$ cli env push

Pushing 12 variables to "development"...
Some variables will be added or updated.
Continue? [y/N]
```

**Correct:**

Clear diff with symbols and confirmation:

```
$ cli env push

Pushing to "development" environment:

+ NEW_VAR = "hello"                    (add)
~ DATABASE_URL = "postgres://..."      (changed)
  API_KEY = "abc123"                   (unchanged, skipped)
  LOG_LEVEL = "info"                   (unchanged, skipped)

2 additions/changes. Continue? [y/N] y

✓ Pushed 2 variables to "development".
```

With `--prune`, removals are clearly marked:

```
$ cli env push --prune

Pushing to "development" environment:

+ NEW_VAR = "hello"                    (add)
~ DATABASE_URL = "postgres://..."      (changed)
- OLD_VAR                              (remove)

2 additions/changes, 1 removal. Continue? [y/N]
```

Dry run mode for preview without applying:

```
$ cli env push --dry-run

Pushing to "development" environment (dry run):

+ NEW_VAR = "hello"                    (add)
~ DATABASE_URL = "postgres://..."      (changed)

2 additions/changes. No changes applied.
```
