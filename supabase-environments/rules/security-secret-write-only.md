---
title: Secret Variables Are Write-Only
impact: CRITICAL
impactDescription: Ensures high-sensitivity values cannot be extracted after storage
tags: security, secrets, write-only, pull, list
---

## Secret Variables Are Write-Only

Secret variables are write-only after creation. The value cannot be read back
from the dashboard, the API, or the CLI. They are excluded from `cli env pull`
and shown as `[secret]` in `cli env list`.

**Incorrect:**

Secret values visible in list output:

```
$ cli env list --env production

DATABASE_URL = "postgres://prod-db:5432/app"
STRIPE_KEY = "sk_live_abc123xyz789"
SIGNING_SECRET = "whsec_xyz"
```

Secret values included in pull output:

```
$ cli env pull --env production

✓ Pulled 3 variables to supabase/.env

$ cat supabase/.env

DATABASE_URL=postgres://prod-db:5432/app
STRIPE_KEY=sk_live_abc123xyz789
SIGNING_SECRET=whsec_xyz
```

**Correct:**

Secret values masked in list output:

```
$ cli env list --env production

DATABASE_URL = "postgres://prod-db:5432/app"
STRIPE_KEY = [secret]
SIGNING_SECRET = [secret]
```

Secret values excluded from pull with helpful comment:

```
$ cli env pull --env production

✓ Pulled 1 variable to supabase/.env (2 secrets excluded)

$ cat supabase/.env

# Pulled from "production" environment
#
# Secrets excluded (add to .env.local if needed):
#   STRIPE_KEY
#   SIGNING_SECRET

DATABASE_URL=postgres://prod-db:5432/app
```

Setting secrets uses the `--secret` flag:

```
$ cli env set STRIPE_KEY "sk_live_abc123" --env production --secret

✓ Set STRIPE_KEY in "production" (secret).
```
