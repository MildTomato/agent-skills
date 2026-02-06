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
