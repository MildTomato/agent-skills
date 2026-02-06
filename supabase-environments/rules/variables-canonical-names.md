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
