---
name: supabase-environments
description: Internal guide for building the Supabase CLI environments system. Covers three-environment model, variable resolution, pull/push workflows, secret handling, branch overrides, and local file conventions. For Supabase internal development - use when implementing the env CLI subsystem or environment variable infrastructure.
license: MIT
metadata:
  author: Julien Goux (jgoux), MildTomato
  version: '1.0.0'
---

# Supabase Environments System

**Internal development guide** for AI agents building the Supabase CLI
environments system. This skill covers the three-environment model (development,
preview, production), variable resolution, pull/push workflows, secret handling,
branch-to-environment mapping, local file structure, and environment CRUD
operations.

**Original specification by:** [Julien Goux](https://github.com/jgoux) (jgoux)

> **Note:** This skill is for Supabase internal development. Use when
> implementing the `supabase env` CLI subsystem or building the environments
> infrastructure.

## When to Apply

Reference these guidelines when:

- Implementing `env` CLI commands (pull, push, list, set, unset, create, delete,
  seed)
- Building variable resolution logic for local or deployed contexts
- Handling secret variables with write-only access patterns
- Implementing branch-to-environment mapping and branch-specific overrides
- Designing pull/push workflows with diff display and confirmation
- Managing local `.env` and `.env.local` file structure
- Building bulk upsert API endpoints for environment variables
- Creating interactive seed workflows for environment setup
- Transitioning from local-first to remote-first development mode
- Implementing platform variable (implicit binding) vs user variable (env()
  syntax) systems

## Rule Categories by Priority

Rules are organized by impact level and implementation priority:

| Priority | Category         | Impact   | Prefix        | Count |
| -------- | ---------------- | -------- | ------------- | ----- |
| 1        | Core Model       | CRITICAL | `model-`      | 3     |
| 2        | Security         | CRITICAL | `security-`   | 2     |
| 3        | Pull Workflow    | HIGH     | `pull-`       | 2     |
| 4        | Push Workflow    | HIGH     | `push-`       | 3     |
| 5        | Variable System  | HIGH     | `variables-`  | 2     |
| 6        | Local Files      | HIGH     | `local-`      | 2     |
| 7        | Branch Overrides | MEDIUM   | `branches-`   | 1     |
| 8        | Environment CRUD | MEDIUM   | `envs-`       | 2     |
| 9        | Transition       | MEDIUM   | `transition-` | 1     |

## Quick Reference

### CRITICAL — Core Model

- **model-three-defaults** — Protect the three default environments
  (development/preview/production cannot be deleted or renamed)
- **model-flat-environments** — Environments are flat with no inheritance
  (independent sets, no fallback chains)
- **model-development-local-only** — Development environment is local-only (not
  in branch mapping, used exclusively by cli dev)

### CRITICAL — Security

- **security-sensitive-fields** — Sensitive fields must come from environment
  variables (no hardcoded secrets in config.json)
- **security-secret-write-only** — Secret variables are write-only (excluded
  from pull/list, @secret annotation, interactive prompt on push)

### HIGH — Pull Workflow

- **pull-full-replace** — Pull performs full file replacement (no merge with
  existing .env)
- **pull-resolve-branch-overrides** — Pull resolves branch overrides
  automatically (server-side resolution, client gets final values)

### HIGH — Push Workflow

- **push-diff-display** — Push must show a diff before applying
  (additions/changes/removals with confirmation)
- **push-base-values-only** — Push only sets base values, not branch overrides
  (use env set --branch for overrides)
- **push-bulk-upsert** — Push uses bulk upsert, not one-at-a-time operations
  (single PUT request)

### HIGH — Variable System

- **variables-canonical-names** — Derive canonical variable names from config
  paths (SUPABASE\_ prefix, path-to-underscore)
- **variables-env-syntax** — Use env() syntax for explicit variable references
  (user variables, canonical name overrides)

### HIGH — Local Files

- **local-env-files** — Only two local files, both gitignored (.env +
  .env.local, no per-environment files)
- **local-resolution-order** — Local resolution follows OS, .env.local, .env
  priority

### MEDIUM — Branch Overrides

- **branches-per-variable-override** — Branch overrides are per-variable,
  per-branch (set individually, not bulk)

### MEDIUM — Environment CRUD

- **envs-seed-workflow** — Seed new environments with keep/edit/skip flow
  (interactive review)
- **envs-crud-consistency** — Environment CRUD uses consistent verbs and output

### MEDIUM — Transition

- **transition-link-prompt** — Prompt to push local variables when linking a
  project (local-first to remote-first)

## Structure

- **rules/** — Individual focused rules (50-70 lines each) showing terminal
  output and UX patterns
- **references/** — Comprehensive background documentation for deeper context
- **AGENTS.md** — Generated compilation of all rules (run `npm run build`)

Agents should start with rules for immediate guidance, then consult references
when deeper architectural understanding is needed.
