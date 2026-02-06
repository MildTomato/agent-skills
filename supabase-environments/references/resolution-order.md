# Resolution Order

This document covers the complete resolution logic for environment variables in
both local and deployed contexts.

## Overview

Resolution differs between local development and deployed environments.

## Local Development (cli dev)

When the CLI encounters `env(DATABASE_URL)` in config.json or resolves a
platform variable, the value is determined by (first match wins):

1. **OS environment variables** — CI/CD pipelines, Docker, shell overrides
2. **`.env.local`** — personal overrides, never synced
3. **`.env`** — pulled from the development environment or manually maintained

### Example

```bash
# .env
DATABASE_URL=postgres://localhost:5432/app
API_KEY=abc123
LOG_LEVEL=info

# .env.local
DATABASE_URL=postgres://localhost:5433/app
LOG_LEVEL=debug
```

Running `cli dev`:

```
Starting local services...

Resolved variables:
  DATABASE_URL = postgres://localhost:5433/app     (from .env.local)
  API_KEY = abc123                                 (from .env)
  LOG_LEVEL = debug                                (from .env.local)
```

With OS environment override:

```bash
export DATABASE_URL=postgres://custom:5432/app
cli dev
```

```
Starting local services...

Resolved variables:
  DATABASE_URL = postgres://custom:5432/app        (from OS environment)
  API_KEY = abc123                                 (from .env)
  LOG_LEVEL = debug                                (from .env.local)
```

### Why This Order?

- **OS environment first** — enables CI/CD, Docker Compose, and shell-based
  workflows
- **`.env.local` second** — personal machine-specific overrides without
  affecting teammates
- **`.env` last** — team-shared defaults from the platform

## Deployed Environments (Platform)

On the platform, local files are not involved. The resolution is:

1. **Branch-specific override** for the variable in the mapped environment (if
   one exists for the current branch)
2. **Base environment variable** in the mapped environment

### Example

Environment: `preview`

```
preview environment:

API_URL = "https://preview.example.com"           (base)
  └─ feature-x = "https://feature-x.example.com"  (branch override)
  └─ feature-y = "https://feature-y.example.com"  (branch override)
DATABASE_URL = "postgres://preview-db:5432/app"   (base)
LOG_LEVEL = "info"                                (base)
```

Project branch `feature-x` deployed:

```
Resolved variables:
  API_URL = https://feature-x.example.com     (branch override)
  DATABASE_URL = postgres://preview-db:5432/app    (base)
  LOG_LEVEL = info                            (base)
```

Project branch `feature-z` deployed (no overrides):

```
Resolved variables:
  API_URL = https://preview.example.com       (base)
  DATABASE_URL = postgres://preview-db:5432/app    (base)
  LOG_LEVEL = info                            (base)
```

## Complete Resolution Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ LOCAL DEVELOPMENT (cli dev)                                     │
│                                                                 │
│   config.json                                                   │
│   auth.external.google.secret                                   │
│         │                                                       │
│         ▼                                                       │
│   ┌─ Canonical variable: SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET  │
│   │  (or env() override, or hardcoded value in config)         │
│   │                                                             │
│   │  Resolved via:                                             │
│   │  1. OS environment ─── e.g. export in shell                │
│   │  2. .env.local ─────── personal overrides (rare)           │
│   │  3. .env ───────────── pulled from "development"           │
│   │                                                             │
│   └─ Final value                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DEPLOYED (platform)                                             │
│                                                                 │
│   Project branch: feature-x → Environment: preview             │
│                                                                 │
│   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET                          │
│   1. Branch override (feature-x) ─── if exists                 │
│   2. Base value (preview) ────────── fallback                  │
│                                                                 │
│   Final value injected at runtime                              │
└─────────────────────────────────────────────────────────────────┘
```

## Platform Variable Resolution

For a platform config value like `auth.external.google.secret`, the resolved
value is determined by (first match wins):

1. **Canonical environment variable**
   (`SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`) resolved via the standard resolution
   chain (OS env → `.env.local` → `.env`)
2. **env() override in config** — if the user writes
   `"secret": "env(MY_CUSTOM_NAME)"`, that variable name is used instead

If none of the above produce a value and the feature is enabled, the CLI warns
about the missing variable.

## Branch Mapping Resolution

When a deployed project branch needs to resolve its environment:

1. Look up the project branch name in `config.json` `environments` mapping
2. If exact match found, use that environment
3. If no exact match, check for wildcard (`"*"`) entry
4. If no wildcard, fall back to `preview`

**Example config.json:**

```json
{
  "environments": {
    "production": "main",
    "staging": "staging",
    "preview": "*"
  }
}
```

**Resolution:**

| Project branch | Mapped environment |
| -------------- | ------------------ |
| `main`         | `production`       |
| `staging`      | `staging`          |
| `dev`          | `preview` (via \*) |
| `feature-x`    | `preview` (via \*) |
| `feature-y`    | `preview` (via \*) |

## Pull Behavior with Branch Overrides

When running `cli env pull --env preview`, the CLI:

1. Determines the current project branch from the project context
2. Sends the branch name to the platform API
3. Server resolves branch overrides and returns final values
4. CLI writes resolved values to `.env` (not layers)

**Example:**

Current project branch: `feature-x`

```bash
cli env pull --env preview
```

Server responds with:

```
API_URL=https://feature-x.example.com
DATABASE_URL=postgres://preview-db:5432/app
LOG_LEVEL=info
```

The `.env` file contains the override value for `API_URL`, not the base value.

## Use Cases

### CI/CD Pipeline

```bash
# .env contains team defaults
# CI sets environment-specific overrides
export DATABASE_URL=$CI_DATABASE_URL
export API_KEY=$CI_API_KEY

cli dev
# OS environment takes priority
```

### Personal Development

```bash
# .env contains team defaults (from cli env pull)
# .env.local has personal overrides
cat .env.local
DATABASE_URL=postgres://localhost:5433/app

cli dev
# .env.local overrides .env
```

### Branch-Specific Deployment

```bash
# No local files involved
# Platform resolves based on project branch

# Project branch: feature-x
# Mapped environment: preview
# Branch override for API_URL: https://feature-x.example.com
# Result: override value used
```
