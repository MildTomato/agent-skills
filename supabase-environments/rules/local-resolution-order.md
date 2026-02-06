---
title: Local Resolution Follows OS, .env.local, .env Priority
impact: HIGH
impactDescription: Provides predictable resolution order that works with CI/CD and personal overrides
tags: resolution, local-development, env-file, priority
---

## Local Resolution Follows OS, .env.local, .env Priority

When resolving variables during local development (`cli dev`), the resolution
order is: OS environment → `.env.local` → `.env`. First match wins.

**Incorrect:**

Wrong priority order (.env overrides .env.local):

```
$ cat supabase/.env

DATABASE_URL=postgres://localhost:5432/app

$ cat supabase/.env.local

DATABASE_URL=postgres://localhost:5433/app

$ cli dev

Starting local services...
DATABASE_URL = postgres://localhost:5432/app (from .env)
```

OS environment ignored:

```
$ export DATABASE_URL=postgres://custom:5432/app
$ cli dev

Starting local services...
DATABASE_URL = postgres://localhost:5432/app (from .env)
```

**Correct:**

Correct priority order:

```
$ cat supabase/.env

DATABASE_URL=postgres://localhost:5432/app
API_KEY=abc123

$ cat supabase/.env.local

DATABASE_URL=postgres://localhost:5433/app
LOG_LEVEL=debug

$ cli dev

Starting local services...
DATABASE_URL = postgres://localhost:5433/app (from .env.local)
API_KEY = abc123 (from .env)
LOG_LEVEL = debug (from .env.local)
```

OS environment takes highest priority:

```
$ export DATABASE_URL=postgres://custom:5432/app
$ cli dev

Starting local services...
DATABASE_URL = postgres://custom:5432/app (from OS environment)
API_KEY = abc123 (from .env)
LOG_LEVEL = debug (from .env.local)
```

This enables natural CI/CD patterns:

```
# CI/CD pipeline
$ export DATABASE_URL=$CI_DATABASE_URL
$ export API_KEY=$CI_API_KEY
$ cli dev

Starting local services...
DATABASE_URL = postgres://ci-db:5432/app (from OS environment)
API_KEY = ci-key-789 (from OS environment)
```
