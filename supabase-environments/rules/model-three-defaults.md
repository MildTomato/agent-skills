---
title: Protect the Three Default Environments
impact: CRITICAL
impactDescription: Prevents accidental deletion of core environments and maintains system integrity
tags: environments, defaults, core-model
---

## Protect the Three Default Environments

Every project has three default environments that cannot be deleted or renamed:
`development`, `preview`, and `production`. Attempts to delete or rename these
must fail with a clear error message.

**Incorrect:**

```
$ cli env delete development

✓ Deleted "development" environment.
```

```
$ cli env delete production

✓ Deleted "production" environment.
```

**Correct:**

```
$ cli env delete development

Error: Cannot delete default environment "development".
Default environments (development, preview, production) are required for all projects.
```

```
$ cli env delete production

Error: Cannot delete default environment "production".
Default environments (development, preview, production) are required for all projects.
```

**Creating custom environments works normally:**

```
$ cli env create staging

✓ Created "staging" environment.

$ cli env delete staging

✓ Deleted "staging" environment.
```
