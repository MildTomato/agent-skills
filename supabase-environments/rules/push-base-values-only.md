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
