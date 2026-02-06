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
