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
