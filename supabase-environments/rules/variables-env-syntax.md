---
title: Use env() Syntax for Explicit Variable References
impact: HIGH
impactDescription: Provides clear distinction between static config and dynamic values
tags: variables, env-syntax, user-variables, config
---

## Use env() Syntax for Explicit Variable References

User variables (third-party keys, custom config) use explicit `env()` syntax in
config.json. This clearly distinguishes static values from dynamic ones and
gives users full control over naming.

**Incorrect:**

Implicit references without env() syntax:

```json
{
  "functions": {
    "my-function": {
      "env": {
        "OPENAI_API_KEY": "OPENAI_API_KEY",
        "FEATURE_FLAG_V2": "FEATURE_FLAG_V2"
      }
    }
  }
}
```

Magic variable interpolation:

```json
{
  "functions": {
    "my-function": {
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "FEATURE_FLAG_V2": "${FEATURE_FLAG_V2}"
      }
    }
  }
}
```

**Correct:**

Explicit env() syntax:

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

Static values work without env():

```json
{
  "functions": {
    "my-function": {
      "env": {
        "NODE_ENV": "production",
        "API_VERSION": "v2",
        "OPENAI_API_KEY": "env(OPENAI_API_KEY)"
      }
    }
  }
}
```

Using env() to override canonical names (rare):

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

Resolution at runtime:

```
$ cat supabase/.env

OPENAI_API_KEY=sk-abc123
FEATURE_FLAG_V2=true

$ cli dev

Starting local services...
Resolved variables:
  OPENAI_API_KEY = sk-abc123
  FEATURE_FLAG_V2 = true
```
