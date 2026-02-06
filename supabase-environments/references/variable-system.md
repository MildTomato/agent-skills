# Variable System

This document covers the variable system: platform vs user variables, canonical
names, env() syntax, sensitive fields, and secret handling.

## Platform Variables vs User Variables

Environment variables fall into two categories. Both live in the same
environment, use the same CLI commands, and appear in the same dashboard — the
difference is in how they are created and referenced in config.

### Platform Variables (Implicit Binding)

The platform knows its own config schema. Every config key that requires a
secret or environment-specific value has a canonical environment variable name
derived from the config path.

**Derivation rule:** `SUPABASE_` prefix + config path components joined with
underscores (uppercase).

| Config path                      | Canonical variable                        |
| -------------------------------- | ----------------------------------------- |
| `auth.external.google.client_id` | `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` |
| `auth.external.google.secret`    | `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`    |
| `db.pooler.default_pool_size`    | `SUPABASE_DB_POOLER_DEFAULT_POOL_SIZE`    |

The user does not need to write `env()` for these. The config block simply
declares the feature:

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

The platform knows that enabling Google auth requires
`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and
`SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, and resolves them from the environment
automatically.

### User Variables (env() Syntax)

For values the platform doesn't know about — third-party service keys,
application-specific config, custom feature flags — the user explicitly
references environment variables using the `env()` syntax in config:

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

The user controls the naming and is responsible for setting these values in the
environment.

### Overriding Canonical Names with env()

In rare cases, a user may want a platform config key to read from a
non-canonical variable name. The `env()` syntax serves as an escape hatch:

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

This overrides the implicit binding — the platform will look for
`MY_GOOGLE_SECRET` instead of `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`.

## Sensitive Fields

The platform schema marks certain config fields as sensitive (secrets, keys,
tokens, passwords). These fields **must** come from an environment variable —
either via implicit binding or explicit `env()` reference.

**Rule:** If the CLI detects a raw value in a sensitive field, it fails with a
clear error:

```
Error: auth.external.google.secret is a sensitive field and cannot be hardcoded in config.json.

Set it with:
  cli env set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "your-value" --env development --secret

Or add it to supabase/.env for local development:
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-value
```

This prevents accidental secret leaks through `config.json`, which is committed
to Git. All secrets live in `.env` files (gitignored) or on the platform.

### Non-Sensitive Fields

Non-sensitive fields can be hardcoded normally:

```json
{
  "db": {
    "pooler": {
      "default_pool_size": 10
    }
  }
}
```

For non-sensitive fields, the user has three options:

1. **Hardcode in config** — `"default_pool_size": 10`. Simple, committed to Git.
2. **Implicit binding** — omit the value, resolved from
   `SUPABASE_DB_POOLER_DEFAULT_POOL_SIZE` if set.
3. **Explicit env()** — `"default_pool_size": "env(MY_POOL_SIZE)"` for values
   that vary per environment.

## Variable Types

Every variable is encrypted at rest on the platform. There is no separate
"secrets" storage — all variables live in the same system. The distinction is a
flag on the variable.

### Standard Variables

- Can be read, written, listed, and pulled
- Visible in the dashboard and via `cli env list`
- Included when running `cli env pull`

### Secret Variables

- Write-only after creation
- Value cannot be read back from dashboard, API, or CLI
- `cli env list` displays the key but shows `[secret]` as the value
- Excluded from `cli env pull` — never land in local `.env` automatically
- Useful for production API keys, signing keys, high-sensitivity values

A variable is marked as secret at creation time using the `--secret` flag and
cannot be converted back to standard. To "unsecret" a variable, delete it and
recreate it as standard.

## Identifying Secrets During Push

The `.env` format has no built-in way to distinguish a secret from a normal
variable. Two mechanisms work together:

### 1. Annotation in .env File

A `# @secret` comment on the line immediately preceding a variable marks it as
secret:

```bash
DATABASE_URL=postgres://localhost:5432/app

# @secret
STRIPE_KEY=sk_live_abc123

# @secret
SIGNING_SECRET=whsec_xyz
```

The CLI parser looks for this annotation. The file remains valid for any other
tool — the annotation is just a comment. This is the primary mechanism for bulk
and scripted workflows.

### 2. Interactive Prompt for New Variables

When pushing variables that don't exist remotely and have no `# @secret`
annotation, the CLI prompts:

```
New variables detected:
  STRIPE_KEY = "sk_live_..." Mark as secret? [y/N]
  ANALYTICS_ID = "UA-123" Mark as secret? [y/N]
```

The CLI heuristically suggests `[Y/n]` (defaulting to yes) if the key matches
common sensitive patterns: `SECRET`, `TOKEN`, `PRIVATE_KEY`, `PASSWORD`,
`API_KEY`.

### Type Preservation

For variables that already exist on the platform, their current type (standard
or secret) is preserved — the push updates the value but does not change the
type.

### Non-Interactive Mode

When `--yes` is passed, variables without a `# @secret` annotation are pushed as
standard. The annotation is the only way to mark secrets in non-interactive
workflows.

## Scaffolding on Feature Activation

When a feature is enabled (via dashboard or CLI), the platform automatically
creates required variables as empty entries in the current environment, with the
appropriate type (standard or secret). The CLI prompts to fill them in:

```
Google OAuth requires 2 variables:

  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
  Value: 1234567890.apps.googleusercontent.com ✓

  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
  Value (hidden): ••••••••••••• ✓
  Stored as secret.

✓ Added to "development" environment.
```

## Missing Variable Warnings

When the CLI encounters an enabled feature with missing variables (e.g., during
`cli dev`), it warns with actionable guidance:

```
Warning: auth.external.google is enabled but missing required variables:
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET

Set them with:
  cli env set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "your-value" --env development
  cli env set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "your-value" --env development --secret

Or add them to supabase/.env.local for local development.
```

## Summary Table

| Mode                       | Config example                                    | When to use                              |
| -------------------------- | ------------------------------------------------- | ---------------------------------------- |
| Hardcoded (non-sensitive)  | `"default_pool_size": 10`                         | Static config safe to commit             |
| Implicit (platform)        | `"enabled": true` + canonical name in environment | Standard workflow — zero boilerplate     |
| Explicit env() (user vars) | `"OPENAI_API_KEY": "env(OPENAI_API_KEY)"`         | Third-party services, custom config      |
| Explicit env() (override)  | `"secret": "env(CUSTOM_NAME)"`                    | Edge cases requiring non-canonical names |
