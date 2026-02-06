# API Design

This document covers the platform API endpoints required for the environments
system.

## Overview

The CLI commands require the following platform API endpoints. All endpoints
require authentication and operate within the context of a specific project.

## Endpoints

### List Environments

**Endpoint:** `GET /projects/{id}/environments`

**Returns:** List of all environments (default + custom)

**Response:**

```json
{
  "environments": [
    {
      "name": "development",
      "is_default": true,
      "created_at": "2026-01-01T00:00:00Z",
      "variable_count": 8
    },
    {
      "name": "preview",
      "is_default": true,
      "created_at": "2026-01-01T00:00:00Z",
      "variable_count": 12
    },
    {
      "name": "production",
      "is_default": true,
      "created_at": "2026-01-01T00:00:00Z",
      "variable_count": 0
    },
    {
      "name": "staging",
      "is_default": false,
      "created_at": "2026-01-15T10:30:00Z",
      "variable_count": 10
    }
  ]
}
```

### Create Environment

**Endpoint:** `POST /projects/{id}/environments`

**Request:**

```json
{
  "name": "staging",
  "from": "preview" // optional: seed from existing environment
}
```

**Response:**

```json
{
  "environment": {
    "name": "staging",
    "is_default": false,
    "created_at": "2026-02-07T14:22:00Z",
    "variable_count": 12
  },
  "seeded_from": "preview"
}
```

**Validation:**

- Name must be unique
- Name must be lowercase alphanumeric + hyphens
- Cannot create environments named `development`, `preview`, or `production`
  (already exist)
- If `from` is specified, source environment must exist

### Delete Environment

**Endpoint:** `DELETE /projects/{id}/environments/{name}`

**Response:**

```json
{
  "deleted": true,
  "environment": "staging"
}
```

**Validation:**

- Cannot delete default environments (`development`, `preview`, `production`)
- Environment must exist

**Error response for default environments:**

```json
{
  "error": "Cannot delete default environment",
  "message": "Default environments (development, preview, production) are required for all projects."
}
```

### Seed Environment

**Endpoint:** `POST /projects/{id}/environments/{name}/seed`

**Request:**

```json
{
  "from": "preview",
  "variables": [
    // Only needed for interactive mode (client-side review)
    {
      "key": "DATABASE_URL",
      "value": "postgres://prod-db:5432/app",
      "secret": false
    },
    {
      "key": "STRIPE_KEY",
      "value": "sk_live_xyz789",
      "secret": true
    }
  ]
}
```

**Response:**

```json
{
  "seeded": true,
  "environment": "production",
  "from": "preview",
  "variable_count": 13
}
```

**Behavior:**

- Without `variables` array: copy all variables from source as-is (bulk copy)
- With `variables` array: use provided variables (interactive mode handled
  client-side)

### List Variables

**Endpoint:** `GET /projects/{id}/environments/{name}/variables`

**Query parameters:**

- `branch` (optional): include branch-specific overrides for this branch

**Response:**

```json
{
  "variables": [
    {
      "key": "DATABASE_URL",
      "value": "postgres://preview-db:5432/app",
      "secret": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    },
    {
      "key": "STRIPE_KEY",
      "value": null,
      "secret": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    },
    {
      "key": "API_URL",
      "value": "https://preview.example.com",
      "secret": false,
      "branch_overrides": [
        {
          "branch": "feature-x",
          "value": "https://feature-x.example.com"
        },
        {
          "branch": "feature-y",
          "value": "https://feature-y.example.com"
        }
      ]
    }
  ]
}
```

**Note:** Secret values are returned as `null` (write-only).

### Bulk Upsert Variables

**Endpoint:** `PUT /projects/{id}/environments/{name}/variables`

**Request:**

```json
{
  "variables": [
    {
      "key": "DATABASE_URL",
      "value": "postgres://localhost:5432/app",
      "secret": false
    },
    {
      "key": "API_KEY",
      "value": "abc123",
      "secret": false
    },
    {
      "key": "OPENAI_KEY",
      "value": "sk-abc123",
      "secret": true
    }
  ],
  "prune": false // if true, delete variables not in the list
}
```

**Response:**

```json
{
  "updated": true,
  "added": 1,
  "changed": 1,
  "removed": 0,
  "total": 2
}
```

**Behavior:**

- Accepts full array of variables
- Server computes diff against current state
- Applies all changes atomically (single transaction)
- If `prune: true`, deletes variables not present in payload
- Returns counts of changes

**Critical for push performance:** This avoids one-at-a-time variable setting
and ensures atomic updates.

### Set Single Variable

**Endpoint:** `POST /projects/{id}/environments/{name}/variables`

**Request:**

```json
{
  "key": "API_KEY",
  "value": "abc123",
  "secret": false,
  "branch": "feature-x" // optional: create branch override
}
```

**Response:**

```json
{
  "updated": true,
  "variable": {
    "key": "API_KEY",
    "secret": false,
    "branch": "feature-x"
  }
}
```

**Behavior:**

- Without `branch`: sets/updates base value
- With `branch`: creates/updates branch-specific override

### Delete Single Variable

**Endpoint:** `DELETE /projects/{id}/environments/{name}/variables/{key}`

**Query parameters:**

- `branch` (optional): delete branch override instead of base value

**Response:**

```json
{
  "deleted": true,
  "key": "API_KEY",
  "branch": "feature-x"
}
```

**Behavior:**

- Without `branch`: deletes base value (and all branch overrides)
- With `branch`: deletes only the branch override, base value remains

### Pull Variables

**Endpoint:**
`GET /projects/{id}/environments/{name}/variables?decrypt=true&branch={branch}`

**Query parameters:**

- `decrypt=true`: return decrypted values for standard variables
- `branch` (optional): resolve branch overrides for this branch

**Response:**

```json
{
  "variables": [
    {
      "key": "DATABASE_URL",
      "value": "postgres://preview-db:5432/app",
      "secret": false
    },
    {
      "key": "API_URL",
      "value": "https://feature-x.example.com",
      "secret": false,
      "resolved_from_branch": "feature-x"
    }
  ],
  "secrets_excluded": ["STRIPE_KEY", "SIGNING_SECRET"]
}
```

**Behavior:**

- Returns standard variables with decrypted values
- Excludes secret variables (returned in `secrets_excluded` list)
- If `branch` is provided, resolves branch overrides and returns final values
- Used by `cli env pull`

## Request/Response Patterns

### Error Responses

All endpoints follow consistent error format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    // optional additional context
  }
}
```

**Common error codes:**

- `environment_not_found`
- `cannot_delete_default_environment`
- `environment_already_exists`
- `variable_not_found`
- `invalid_environment_name`
- `unauthorized`

### Authentication

All endpoints require authentication via Bearer token:

```http
Authorization: Bearer <token>
```

### Rate Limiting

Standard rate limits apply. Bulk upsert endpoint has higher limits to
accommodate large variable sets.

## Implementation Notes

### Bulk Upsert Atomicity

The bulk upsert endpoint must be atomic — either all changes succeed or none do.
If the transaction fails mid-way, the environment should remain in its previous
state.

### Secret Variable Handling

Secret values are never returned in responses (returned as `null`). The backend
encrypts all variables at rest but marks secret variables with a flag that
prevents reading the value back.

### Branch Override Resolution

When `branch` parameter is provided to the pull endpoint, the server resolves
branch overrides before returning values. The client receives final values, not
layers.

**Example:**

Base value: `API_URL = "https://preview.example.com"`
Branch override (feature-x): `API_URL = "https://feature-x.example.com"`

Request: `GET /variables?decrypt=true&branch=feature-x`

Response includes: `API_URL = "https://feature-x.example.com"`

The client doesn't need to know about the base value or perform resolution
logic.
