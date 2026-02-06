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
