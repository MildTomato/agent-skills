# Architecture

This document covers the overall system architecture for the Supabase
environments system.

## Overview

Environments provide a way to manage sets of environment variables and secrets
for different stages of a project's lifecycle. They are the mechanism through
which configuration values in config.json are resolved at runtime, both locally
and on the platform.

## Core Concepts

### Environments

An environment is a named collection of key-value pairs (environment variables)
stored on the platform. Each variable belongs to exactly one environment. There
is no inheritance between environments — each is an independent, flat set of
variables.

### Default Environments

Every project is created with two branches (main and dev) and three
environments:

| Environment | Purpose                                                                                                        | Mapped to                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| development | Local development via cli dev. Contains values that work on a developer's machine (localhost URLs, debug mode) | Not mapped to a branch — mapped to local machine. |
| preview     | Deployed preview environments. Contains values for hosted preview infrastructure.                              | dev branch and all other non-production branches  |
| production  | Live, user-facing deployment. Starts empty and is populated when ready to go live.                             | main branch                                       |

All three default environments cannot be deleted or renamed.

**Key distinction:** `development` is for running locally, `preview` is for
deploying remotely. A developer on the dev branch uses `development` variables
when running `cli dev` on their machine, and `preview` variables when their code
is deployed as a preview on the platform.

### Custom Environments

Users can create additional environments (e.g., `staging`, `qa`, `testing`) for
specialized workflows. Custom environments behave identically to the defaults —
they are independent sets of variables with no special relationship to other
environments.

## Project Branches

A project branch is a forked copy of the project's infrastructure running
independently on its own URL. It is a first-class platform concept — not a Git
concept.

Three ways a project branch gets created:

1. **From the dashboard** — user creates a branch directly in the platform UI
2. **Via GitHub integration** — Git branch push triggers creation of
   corresponding project branch
3. **From the CLI** — user creates a project branch via CLI commands

Every project starts with two project branches: `main` and `dev`.

## Branch-to-Environment Mapping

Each project branch resolves to a single deployed environment. The mapping is
configured in `config.json`:

```json
{
  "environments": {
    "production": "main",
    "preview": "*"
  }
}
```

This is the default configuration. The `dev` project branch (and any other
non-production branch) maps to `preview` via the wildcard.

Users can add custom mappings:

```json
{
  "environments": {
    "production": "main",
    "staging": "staging",
    "preview": "*"
  }
}
```

**Rules:**

- The key is the environment name, the value is the project branch name or `"*"`
  for wildcard (catch-all)
- The wildcard defines the default environment for any project branch not
  explicitly listed
- If no wildcard is defined, unmapped branches fall back to `preview`
- Mapping is evaluated top-to-bottom; first explicit match wins, wildcard is
  always last
- A project branch can only map to one environment
- `development` does NOT appear in the branch mapping (local-only)

## Three-Environment Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   development         preview            production                │
│   ┌───────────┐      ┌───────────┐      ┌───────────┐             │
│   │ localhost │      │  hosted   │      │   live    │             │
│   │   URLs    │      │  preview  │      │ user-     │             │
│   │ debug keys│      │   infra   │      │ facing    │             │
│   │ test data │      │   URLs    │      │  values   │             │
│   └─────┬─────┘      └─────┬─────┘      └─────┬─────┘             │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│     cli dev            deployed              deployed               │
│  (local machine)        previews           to production            │
│                    (dev branch,              (main branch)          │
│                   feature branches,                                 │
│                  dashboard branches)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Branch Overrides

A variable within a deployed environment can optionally have overrides scoped to
a specific project branch. The base value applies to all project branches mapped
to that environment, and a branch override takes precedence for a specific
project branch only.

**Example:**

Three project branches all mapping to `preview`. Two need different API
endpoints:

```bash
# Base value — applies to all branches mapped to preview
cli env set API_URL "https://preview.example.com" --env preview

# Branch-specific overrides
cli env set API_URL "https://feature-x.example.com" --env preview --branch feature-x
cli env set API_URL "https://feature-y.example.com" --env preview --branch feature-y
```

The third branch (`feature-z`) gets the base value automatically.

**Note:** Branch-specific overrides do not apply to the `development`
environment, since it is not mapped to any project branch.

## Lifecycle Progression

The natural environment progression:

1. **Start local** — Create `.env` manually, work with `development` environment
2. **Link project** — Push local `.env` to platform's `development` environment
3. **Deploy previews** — Seed `preview` from `development`, adjust for hosted
   infrastructure
4. **Go live** — Seed `production` from `preview`, provide production secrets

Each step seeds from the previous with interactive review to adjust values.
