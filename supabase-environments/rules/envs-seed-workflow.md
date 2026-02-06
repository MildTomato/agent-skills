---
title: Seed New Environments with Keep/Edit/Skip Flow
impact: MEDIUM
impactDescription: Ensures environment values are reviewed and adjusted appropriately
tags: environments, seeding, interactive, workflow
---

## Seed New Environments with Keep/Edit/Skip Flow

When seeding one environment from another, the `--interactive` flag provides a
keep/edit/skip workflow. This ensures values are reviewed and adjusted rather
than blindly copied.

**Incorrect:**

No interactive option:

```
$ cli env seed production --from preview

✓ Copied 14 variables from "preview" to "production".
```

Interactive mode without edit capability:

```
$ cli env seed production --from preview --interactive

Seeding "production" from "preview":

DATABASE_URL = "postgres://preview-db:5432/app"
Copy this value? [y/N]
```

**Correct:**

Interactive keep/edit/skip workflow:

```
$ cli env seed production --from preview --interactive

Seeding "production" from "preview" (14 variables):

DATABASE_URL = "postgres://preview-db:5432/app"
[K]eep / [E]dit / [S]kip? e
New value: postgres://prod-db:5432/app ✓

API_ENDPOINT = "https://api.preview.example.com"
[K]eep / [E]dit / [S]kip? e
New value: https://api.example.com ✓

LOG_LEVEL = "debug"
[K]eep / [E]dit / [S]kip? e
New value: warn ✓

STRIPE_KEY = [secret]
[E]nter new value / [S]kip? e
New value (hidden): ••••••••••••• ✓
Mark as secret? [Y/n] y ✓

ANALYTICS_ID = "UA-12345"
[K]eep / [E]dit / [S]kip? k ✓

... (9 more)

✓ Seeded "production" with 13 variables (1 skipped).
```

Secret variables cannot be displayed:

```
STRIPE_KEY = [secret]
[E]nter new value / [S]kip?
# Cannot show or copy the value — must enter new or skip
```

Non-interactive mode copies everything as-is:

```
$ cli env seed production --from preview

Copying 14 variables from "preview" to "production"...
✓ Seeded "production" with 14 variables.
```
