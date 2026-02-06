# Supabase Environments System

**Version 1.0.0**  
Supabase  
February 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring supabase environments system. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Internal guide for AI agents building the Supabase CLI environments system. Covers the three-environment model, variable resolution, pull/push workflows, secret handling, branch overrides, local file conventions, and environment CRUD operations. For Supabase internal development use.

---

## Table of Contents

1. [Branches Per Variable Override](#branches-per-variable-override)
2. [Envs Crud Consistency](#envs-crud-consistency)
3. [Envs Seed Workflow](#envs-seed-workflow)
4. [Local Env Files](#local-env-files)
5. [Local Resolution Order](#local-resolution-order)
6. [Model Development Local Only](#model-development-local-only)
7. [Model Flat Environments](#model-flat-environments)
8. [Model Three Defaults](#model-three-defaults)
9. [Pull Full Replace](#pull-full-replace)
10. [Pull Resolve Branch Overrides](#pull-resolve-branch-overrides)
11. [Push Base Values Only](#push-base-values-only)
12. [Push Bulk Upsert](#push-bulk-upsert)
13. [Push Diff Display](#push-diff-display)
14. [Security Secret Write Only](#security-secret-write-only)
15. [Security Sensitive Fields](#security-sensitive-fields)
16. [Transition Link Prompt](#transition-link-prompt)
17. [Variables Canonical Names](#variables-canonical-names)
18. [Variables Env Syntax](#variables-env-syntax)

---

## 1. Branches Per Variable Override

---
title: Branch Overrides Are Per-Variable, Per-Branch
impact: MEDIUM
impactDescription: Keeps override management simple and explicit
tags: branch-overrides, workflow, variables
---

## Branch Overrides Are Per-Variable, Per-Branch

Branch-specific overrides are set individually for each variable and each
branch. There is no bulk branch override operation — each override must be set
explicitly with `cli env set --branch <branch>`.

**Incorrect:**

Bulk branch override commands:

```
$ cli env push --env preview --branch feature-x

Pushing 10 variables as branch overrides for "feature-x"...
```

Wildcard branch patterns:

```
$ cli env set API_URL "https://preview.example.com" --env preview --branch "feature-*"

✓ Set branch override for API_URL in "preview" (branches: feature-*)
```

**Correct:**

Individual per-variable, per-branch overrides:

```
$ cli env set API_URL "https://feature-x.example.com" --env preview --branch feature-x

✓ Set branch override for API_URL in "preview" (branch: feature-x).

$ cli env set API_URL "https://feature-y.example.com" --env preview --branch feature-y

✓ Set branch override for API_URL in "preview" (branch: feature-y).
```

Listing shows the hierarchy clearly:

```
$ cli env list --env preview

preview environment:

API_URL = "https://preview.example.com"
  └─ feature-x = "https://feature-x.example.com"
  └─ feature-y = "https://feature-y.example.com"
DATABASE_URL = "postgres://preview-db:5432/app"
LOG_LEVEL = "info"
```

Removing an override is also per-variable, per-branch:

```
$ cli env unset API_URL --env preview --branch feature-x

✓ Removed branch override for API_URL in "preview" (branch: feature-x).
Base value remains: https://preview.example.com
```

When multiple branches need the same override, set each explicitly:

```
$ for branch in feature-a feature-b feature-c; do
    cli env set API_URL "https://$branch.example.com" --env preview --branch $branch
  done

✓ Set branch override for API_URL in "preview" (branch: feature-a).
✓ Set branch override for API_URL in "preview" (branch: feature-b).
✓ Set branch override for API_URL in "preview" (branch: feature-c).
```

---

## 2. Envs Crud Consistency

---
title: Environment CRUD Uses Consistent Verbs and Output
impact: MEDIUM
impactDescription: Provides predictable CLI UX across all environment operations
tags: environments, crud, cli-ux, consistency
---

## Environment CRUD Uses Consistent Verbs and Output

Environment CRUD commands use consistent verbs and output formats: `create`,
`delete`, `list-environments`, `seed`. Output follows a predictable structure
with clear success/error messages.

**Incorrect:**

Inconsistent verb choices:

```
$ cli env add staging        # create vs add
$ cli env remove staging     # delete vs remove
$ cli env show              # list vs show
$ cli env copy production --from preview   # seed vs copy
```

Inconsistent output formats:

```
$ cli env create staging

staging created

$ cli env delete staging

Deleted: staging

$ cli env list-environments

* production
* preview
* development
```

**Correct:**

Consistent verb choices:

```
$ cli env create staging

✓ Created "staging" environment.

$ cli env delete staging

✓ Deleted "staging" environment.

$ cli env list-environments

Environment   | Purpose                  | Used By
------------- | ------------------------ | ------------------
development   | Local execution          | cli dev
preview       | Deployed previews        | dev + feature branches
production    | Live deployment          | main branch
staging       | Custom environment       | (not mapped)

$ cli env seed production --from preview

Copying 14 variables from "preview" to "production"...
✓ Seeded "production" with 14 variables.
```

Creating with seeding:

```
$ cli env create staging --from preview

✓ Created "staging" environment.
Copying 12 variables from "preview"...
✓ Seeded "staging" with 12 variables.
```

Error messages follow the same pattern:

```
$ cli env delete production

Error: Cannot delete default environment "production".
Default environments (development, preview, production) are required for all projects.

$ cli env delete nonexistent

Error: Environment "nonexistent" not found.
```

---

## 3. Envs Seed Workflow

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

```

Non-interactive mode copies everything as-is:

```
$ cli env seed production --from preview

Copying 14 variables from "preview" to "production"...
✓ Seeded "production" with 14 variables.
```

---

## 4. Local Env Files

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

---

## 5. Local Resolution Order

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

$ export DATABASE_URL=$CI_DATABASE_URL
$ export API_KEY=$CI_API_KEY
$ cli dev

Starting local services...
DATABASE_URL = postgres://ci-db:5432/app (from OS environment)
API_KEY = ci-key-789 (from OS environment)
```

---

## 6. Model Development Local Only

---
title: Development Environment Is Local-Only
impact: CRITICAL
impactDescription: Prevents confusion about which environment maps to which branch
tags: environments, development, branch-mapping, core-model
---

## Development Environment Is Local-Only

The `development` environment is exclusively for local execution via `cli dev`.
It does NOT appear in the branch-to-environment mapping in config.json and is
NOT a deployment target.

**Incorrect:**

config.json with development in branch mapping:

```json
{
  "environments": {
    "development": "dev",
    "production": "main",
    "preview": "*"
  }
}
```

Deployment using development environment:

```
$ git checkout dev
$ cli deploy

Deploying to "development" environment...
```

**Correct:**

config.json without development in branch mapping:

```json
{
  "environments": {
    "production": "main",
    "preview": "*"
  }
}
```

The three environments serve different purposes:

```
$ cli env list-environments

Environment   | Purpose                  | Used By
------------- | ------------------------ | ------------------
development   | Local execution          | cli dev (not deployed)
preview       | Deployed previews        | dev + feature branches
production    | Live deployment          | main branch
```

When running locally, always use development:

```
$ cli dev

Starting local services...
Using "development" environment.
```

---

## 7. Model Flat Environments

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

---

## 8. Model Three Defaults

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

---

## 9. Pull Full Replace

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

---

## 10. Pull Resolve Branch Overrides

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

---

## 11. Push Base Values Only

---
title: Push Only Sets Base Values, Not Branch Overrides
impact: HIGH
impactDescription: Prevents confusion between base values and branch-specific overrides
tags: push, branch-overrides, workflow
---

## Push Only Sets Base Values, Not Branch Overrides

`cli env push` always operates on base values. Branch-specific overrides cannot
be set via push — they must be set individually with
`cli env set --branch <branch>`. This prevents accidentally turning base values
into branch-scoped ones.

**Incorrect:**

Push command accepting `--branch` flag:

```
$ cli env push --branch feature-x

Pushing to "preview" environment (branch: feature-x):

+ API_URL = "https://feature-x.example.com"   (add as branch override)
~ DATABASE_URL = "postgres://..."             (changed as branch override)

Continue? [y/N]
```

**Correct:**

Push command rejects `--branch` flag:

```
$ cli env push --branch feature-x

Error: --branch is not supported with push.
Push only sets base values for the environment.

To set branch-specific overrides, use:
  cli env set <KEY> <value> --env <environment> --branch <branch>
```

Normal push sets base values:

```
$ cli env push --env preview

Pushing to "preview" environment:

+ API_URL = "https://preview.example.com"   (add to base)
~ DATABASE_URL = "postgres://..."           (changed in base)

2 additions/changes. Continue? [y/N] y

✓ Pushed 2 base values to "preview".
```

Branch overrides must be set individually:

```
$ cli env set API_URL "https://feature-x.example.com" --env preview --branch feature-x

✓ Set branch override for API_URL in "preview" (branch: feature-x).

$ cli env set API_URL "https://feature-y.example.com" --env preview --branch feature-y

✓ Set branch override for API_URL in "preview" (branch: feature-y).
```

---

## 12. Push Bulk Upsert

---
title: Push Uses Bulk Upsert, Not One-at-a-Time Operations
impact: MEDIUM
impactDescription: Improves performance and atomicity by sending all changes in a single request
tags: push, api, performance, bulk-upsert
---

## Push Uses Bulk Upsert, Not One-at-a-Time Operations

`cli env push` sends all variable changes in a single bulk upsert request to the
platform API. This avoids the one-at-a-time problem that plagues other CLIs and
ensures atomic updates.

**Incorrect:**

One request per variable:

```
$ cli env push

Pushing to "development" environment:

+ NEW_VAR = "hello"                    (add)
~ DATABASE_URL = "postgres://..."      (changed)
~ API_KEY = "abc123"                   (changed)

3 additions/changes. Continue? [y/N] y

Setting NEW_VAR... ✓
Setting DATABASE_URL... ✓
Setting API_KEY... ✗ Error: Network timeout

Error: Failed to push 1 of 3 variables.
Environment is now in an inconsistent state.
```

**Correct:**

Single bulk request:

```
$ cli env push

Pushing to "development" environment:

+ NEW_VAR = "hello"                    (add)
~ DATABASE_URL = "postgres://..."      (changed)
~ API_KEY = "abc123"                   (changed)

3 additions/changes. Continue? [y/N] y

✓ Pushed 3 variables to "development" (1 request).
```

The API endpoint accepts an array of changes:

```http
PUT /projects/{id}/environments/{name}/variables
Content-Type: application/json

{
  "variables": [
    {"key": "NEW_VAR", "value": "hello", "secret": false},
    {"key": "DATABASE_URL", "value": "postgres://...", "secret": false},
    {"key": "API_KEY", "value": "abc123", "secret": false}
  ],
  "prune": false
}
```

Server computes the diff, applies all changes atomically, and returns results in
a single response.

---

## 13. Push Diff Display

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

---

## 14. Security Secret Write Only

---
title: Secret Variables Are Write-Only
impact: CRITICAL
impactDescription: Ensures high-sensitivity values cannot be extracted after storage
tags: security, secrets, write-only, pull, list
---

## Secret Variables Are Write-Only

Secret variables are write-only after creation. The value cannot be read back
from the dashboard, the API, or the CLI. They are excluded from `cli env pull`
and shown as `[secret]` in `cli env list`.

**Incorrect:**

Secret values visible in list output:

```
$ cli env list --env production

DATABASE_URL = "postgres://prod-db:5432/app"
STRIPE_KEY = "sk_live_abc123xyz789"
SIGNING_SECRET = "whsec_xyz"
```

Secret values included in pull output:

```
$ cli env pull --env production

✓ Pulled 3 variables to supabase/.env

$ cat supabase/.env

DATABASE_URL=postgres://prod-db:5432/app
STRIPE_KEY=sk_live_abc123xyz789
SIGNING_SECRET=whsec_xyz
```

**Correct:**

Secret values masked in list output:

```
$ cli env list --env production

DATABASE_URL = "postgres://prod-db:5432/app"
STRIPE_KEY = [secret]
SIGNING_SECRET = [secret]
```

Secret values excluded from pull with helpful comment:

```
$ cli env pull --env production

✓ Pulled 1 variable to supabase/.env (2 secrets excluded)

$ cat supabase/.env


#
# Secrets excluded (add to .env.local if needed):
#   STRIPE_KEY
#   SIGNING_SECRET

DATABASE_URL=postgres://prod-db:5432/app
```

Setting secrets uses the `--secret` flag:

```
$ cli env set STRIPE_KEY "sk_live_abc123" --env production --secret

✓ Set STRIPE_KEY in "production" (secret).
```

---

## 15. Security Sensitive Fields

---
title: Sensitive Fields Must Come from Environment Variables
impact: CRITICAL
impactDescription: Prevents accidental secret leaks through config.json committed to Git
tags: security, secrets, config, sensitive-fields
---

## Sensitive Fields Must Come from Environment Variables

The platform schema marks certain config fields as sensitive (secrets, keys,
tokens, passwords). These fields must come from environment variables — either
via implicit binding or explicit env() reference. Hardcoded values in
config.json must fail with a clear error and actionable guidance.

**Incorrect:**

config.json with hardcoded secret:

```json
{
  "auth": {
    "external": {
      "google": {
        "enabled": true,
        "client_id": "1234567890.apps.googleusercontent.com",
        "secret": "GOCSPX-abc123xyz789"
      }
    }
  }
}
```

CLI silently accepts the hardcoded secret:

```
$ cli dev

Starting local services...
✓ Running on http://localhost:54321
```

**Correct:**

CLI fails with actionable error:

```
$ cli dev

Error: auth.external.google.secret is a sensitive field and cannot be hardcoded in config.json.

Set it with:
  cli env set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "your-value" --env development --secret

Or add it to supabase/.env for local development:
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-value
```

Valid config.json (secret comes from environment):

```json
{
  "auth": {
    "external": {
      "google": {
        "enabled": true,
        "client_id": "1234567890.apps.googleusercontent.com"
      }
    }
  }
}
```

The platform resolves `secret` from `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`
automatically via implicit binding.

---

## 16. Transition Link Prompt

---
title: Prompt to Push Local Variables When Linking a Project
impact: MEDIUM
impactDescription: Ensures smooth transition from local-first to remote-first development
tags: transition, linking, workflow, local-first
---

## Prompt to Push Local Variables When Linking a Project

When linking a project or deploying for the first time, the CLI detects existing
`.env` files and prompts to push them to the platform. This ensures a smooth
transition from local-first to remote-first development.

**Incorrect:**

Silently ignoring local .env:

```
$ cli link

✓ Linked to project "my-project".
```

Automatically pushing without confirmation:

```
$ cli link

✓ Linked to project "my-project".
✓ Pushed 8 local variables to "development".
```

**Correct:**

Prompting with clear options:

```
$ cli link

✓ Linked to project "my-project".

Found local environment variables in supabase/.env (8 variables).
Push them to the "development" environment? [y/N] y

Pushing to "development" environment:

+ DATABASE_URL = "postgres://localhost:5432/app"   (add)
+ API_KEY = "abc123"                               (add)
+ OPENAI_KEY = [will be marked as secret]          (add)
... (5 more)

8 additions. Continue? [y/N] y

✓ Pushed 8 variables to "development".
```

Detecting conflict with existing remote variables:

```
$ cli link

✓ Linked to project "my-project".

The "development" environment already has 12 variables on the platform.
Your local .env has 8 variables.

[O]verwrite remote with local
[K]eep remote (discard local .env)
[M]erge (keep both, local values win on conflict)
[C]ancel

Choose: m

Merging local and remote variables...
✓ Merged 8 local + 12 remote variables (2 conflicts resolved).
```

If no local .env exists, no prompt:

```
$ cli link

✓ Linked to project "my-project".

Run "cli env pull" to download environment variables.
```

Declining the push keeps local-only mode:

```
$ cli link

Found local environment variables in supabase/.env.
Push them to the "development" environment? [y/N] n

✓ Linked to project "my-project".
Local .env file unchanged. Run "cli env push" later to sync.
```

---

## 17. Variables Canonical Names

---
title: Derive Canonical Variable Names from Config Paths
impact: HIGH
impactDescription: Provides predictable variable naming and eliminates boilerplate
tags: variables, naming, platform-variables, implicit-binding
---

## Derive Canonical Variable Names from Config Paths

Platform variables use canonical names derived from their config path:
`SUPABASE_` prefix + path components joined with underscores (uppercase). This
provides predictable naming and eliminates boilerplate.

**Incorrect:**

Arbitrary or inconsistent naming:

```
Config path: auth.external.google.client_id
Variable name: GOOGLE_CLIENT_ID

Config path: auth.external.google.secret
Variable name: GoogleSecret

Config path: db.pooler.default_pool_size
Variable name: pool_size
```

Missing prefix makes collisions likely:

```
Config path: auth.external.google.secret
Variable name: SECRET
```

**Correct:**

Systematic derivation with consistent prefix:

```
Config path: auth.external.google.client_id
Canonical variable: SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID

Config path: auth.external.google.secret
Canonical variable: SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET

Config path: db.pooler.default_pool_size
Canonical variable: SUPABASE_DB_POOLER_DEFAULT_POOL_SIZE
```

The platform resolves these automatically (implicit binding):

```json
{
  "auth": {
    "external": {
      "google": {
        "enabled": true
      }
    }
  }
}
```

```
$ cli dev

Starting local services...
Missing required variables:
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET

Set them with:
  cli env set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "your-value" --env development
  cli env set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "your-value" --env development --secret
```

Users can override with env() syntax if needed (rare):

```json
{
  "auth": {
    "external": {
      "google": {
        "enabled": true,
        "client_id": "env(MY_CUSTOM_GOOGLE_ID)"
      }
    }
  }
}
```

---

## 18. Variables Env Syntax

---
title: Use env() Syntax for Explicit Variable References
impact: HIGH
impactDescription: Provides clear distinction between static config and dynamic values
tags: variables, env-syntax, user-variables, config
---

## Use env() Syntax for Explicit Variable References

User variables (third-party keys, custom config) use explicit `env()` syntax in
config.json. This clearly distinguishes static values from dynamic ones and
gives users full control over naming.

**Incorrect:**

Implicit references without env() syntax:

```json
{
  "functions": {
    "my-function": {
      "env": {
        "OPENAI_API_KEY": "OPENAI_API_KEY",
        "FEATURE_FLAG_V2": "FEATURE_FLAG_V2"
      }
    }
  }
}
```

Magic variable interpolation:

```json
{
  "functions": {
    "my-function": {
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "FEATURE_FLAG_V2": "${FEATURE_FLAG_V2}"
      }
    }
  }
}
```

**Correct:**

Explicit env() syntax:

```json
{
  "functions": {
    "my-function": {
      "env": {
        "OPENAI_API_KEY": "env(OPENAI_API_KEY)",
        "FEATURE_FLAG_V2": "env(FEATURE_FLAG_V2)"
      }
    }
  }
}
```

Static values work without env():

```json
{
  "functions": {
    "my-function": {
      "env": {
        "NODE_ENV": "production",
        "API_VERSION": "v2",
        "OPENAI_API_KEY": "env(OPENAI_API_KEY)"
      }
    }
  }
}
```

Using env() to override canonical names (rare):

```json
{
  "auth": {
    "external": {
      "google": {
        "enabled": true,
        "client_id": "env(MY_GOOGLE_ID)",
        "secret": "env(MY_GOOGLE_SECRET)"
      }
    }
  }
}
```

Resolution at runtime:

```
$ cat supabase/.env

OPENAI_API_KEY=sk-abc123
FEATURE_FLAG_V2=true

$ cli dev

Starting local services...
Resolved variables:
  OPENAI_API_KEY = sk-abc123
  FEATURE_FLAG_V2 = true
```

---

## References

1. [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
2. [https://supabase.com/docs/guides/functions/secrets](https://supabase.com/docs/guides/functions/secrets)
3. [https://github.com/jgoux](https://github.com/jgoux)
