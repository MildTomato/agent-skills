---
title: Pull Resolves Branch Overrides Automatically
impact: HIGH
impactDescription: Ensures developers get correct values for their current branch without manual override management
tags: pull, branch-overrides, resolution, workflow
---

## Pull Resolves Branch Overrides Automatically

When pulling a deployed environment (preview, production, custom), branch
overrides for the current project branch are resolved server-side. The pulled
`.env` file contains final values, not layers or references.

**Incorrect:**

Showing base values with manual override instructions:

```
$ git checkout feature-x
$ cli env pull --env preview

✓ Pulled 3 variables to supabase/.env

$ cat supabase/.env

API_URL=https://preview.example.com (base)
# Override for feature-x: https://feature-x.example.com
# To use override, manually edit this file

DATABASE_URL=postgres://preview-db:5432/app
```

**Correct:**

Automatic resolution with the override value:

```
$ git checkout feature-x
$ cli env pull --env preview

✓ Pulled 3 variables to supabase/.env (resolved for branch: feature-x)

$ cat supabase/.env

# Pulled from "preview" environment
# Branch: feature-x

API_URL=https://feature-x.example.com
DATABASE_URL=postgres://preview-db:5432/app
```

When switching branches, pull again to get updated values:

```
$ git checkout feature-y
$ cli env pull --env preview

✓ Pulled 3 variables to supabase/.env (resolved for branch: feature-y)

$ cat supabase/.env

# Pulled from "preview" environment
# Branch: feature-y

API_URL=https://feature-y.example.com
DATABASE_URL=postgres://preview-db:5432/app
```

The CLI determines the current branch from the project context and sends it to
the platform API for server-side resolution.
