---
title: Environments Are Flat with No Inheritance
impact: CRITICAL
impactDescription: Prevents complex inheritance bugs and makes variable resolution predictable
tags: environments, architecture, core-model
---

## Environments Are Flat with No Inheritance

Each environment is an independent, flat set of variables. There is no
inheritance between environments — no fallback chains, no parent-child
relationships. If a variable is needed in multiple environments, it must be set
explicitly in each one.

**Incorrect:**

```
$ cli env list --env preview

DATABASE_URL = "postgres://preview-db:5432/app"
API_KEY = [inherited from development]
LOG_LEVEL = "info"
```

```
$ cli env list --env production

DATABASE_URL = [inherited from preview]
API_KEY = [inherited from development]
LOG_LEVEL = [inherited from preview]
```

**Correct:**

```
$ cli env list --env preview

DATABASE_URL = "postgres://preview-db:5432/app"
LOG_LEVEL = "info"

$ cli env list --env production

(no variables set)
```

When creating or seeding environments, variables are copied at that moment, not
linked:

```
$ cli env seed production --from preview

Copying 12 variables from "preview" to "production"...
✓ Seeded "production" with 12 variables.

Changes to "preview" variables will NOT affect "production".
```
