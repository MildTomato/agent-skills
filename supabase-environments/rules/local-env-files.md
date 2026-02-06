---
title: Only Two Local Files, Both Gitignored
impact: HIGH
impactDescription: Prevents file proliferation and simplifies local development
tags: local-files, env-file, structure
---

## Only Two Local Files, Both Gitignored

There are exactly two local environment files: `.env` and `.env.local`. Both are
gitignored. There are no `.env.production`, `.env.preview`, or other
per-environment files sitting on disk.

**Incorrect:**

Multiple per-environment files:

```
supabase/
├── .env.development
├── .env.preview
├── .env.production
├── .env.local
└── config.json
```

CLI commands creating multiple files:

```
$ cli env pull --env preview

✓ Pulled 10 variables to supabase/.env.preview

$ cli env pull --env production

✓ Pulled 12 variables to supabase/.env.production

$ ls supabase/

.env.development
.env.preview
.env.production
.env.local
```

**Correct:**

Only two files:

```
supabase/
├── config.json       # project configuration
├── .env              # pulled from development, or manually maintained
├── .env.local        # personal overrides, never synced
└── .gitignore        # includes .env*
```

Pull overwrites the single `.env` file:

```
$ cli env pull

✓ Pulled 10 variables to supabase/.env

$ cli env pull --env preview

✓ Pulled 12 variables to supabase/.env (replaced existing file).
```

`.env` represents a snapshot of whichever environment was last pulled:

```
$ cat supabase/.env

# Pulled from "preview" environment
# Branch: feature-x

API_URL=https://feature-x.example.com
DATABASE_URL=postgres://preview-db:5432/app
```

`.env.local` for personal machine-specific overrides:

```
$ cat supabase/.env.local

DATABASE_URL=postgres://localhost:5433/app
LOG_LEVEL=debug
```

Both files are gitignored:

```
$ cat supabase/.gitignore

.env*
```
