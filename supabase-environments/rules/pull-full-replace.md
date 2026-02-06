---
title: Pull Performs Full File Replacement
impact: HIGH
impactDescription: Ensures .env file always reflects the exact remote state without merge conflicts
tags: pull, workflow, env-file, sync
---

## Pull Performs Full File Replacement

`cli env pull` performs a full replacement of the `.env` file — it does not
merge with existing content. This ensures the local file always reflects the
exact state of the remote environment without manual merge conflicts.

**Incorrect:**

Merging behavior that preserves local additions:

```
$ cat supabase/.env

DATABASE_URL=postgres://localhost:5432/app
API_KEY=local-key-123
MY_CUSTOM_VAR=foo

$ cli env pull

✓ Pulled 2 variables, merged with 1 existing local variable.

$ cat supabase/.env

DATABASE_URL=postgres://localhost:5432/app
API_KEY=platform-key-456
MY_CUSTOM_VAR=foo
```

**Correct:**

Full replacement with clear messaging:

```
$ cat supabase/.env

DATABASE_URL=postgres://localhost:5432/app
API_KEY=local-key-123
MY_CUSTOM_VAR=foo

$ cli env pull

✓ Pulled 2 variables to supabase/.env (replaced existing file).

$ cat supabase/.env

# Pulled from "development" environment

DATABASE_URL=postgres://localhost:5432/app
API_KEY=platform-key-456
```

The CLI warns if there is local content before overwriting:

```
$ cli env pull

Warning: supabase/.env exists and will be replaced.
Continue? [y/N] y

✓ Pulled 2 variables to supabase/.env
```

For personal overrides that should persist, use `.env.local`:

```
$ cat supabase/.env.local

MY_CUSTOM_VAR=foo

$ cli env pull

✓ Pulled 2 variables to supabase/.env

$ cli dev
# Reads .env.local first, then .env — MY_CUSTOM_VAR=foo is preserved
```
