---
title: Prompt to Push Local Variables When Linking a Project
impact: MEDIUM
impactDescription: Ensures smooth transition from local-first to remote-first development
tags: transition, linking, workflow, local-first
---

## Prompt to Push Local Variables When Linking a Project

When linking a project or deploying for the first time, the CLI detects existing
`.env` files and prompts to push them to the platform. This ensures a smooth
transition from local-first to remote-first development.

**Incorrect:**

Silently ignoring local .env:

```
$ cli link

✓ Linked to project "my-project".
```

Automatically pushing without confirmation:

```
$ cli link

✓ Linked to project "my-project".
✓ Pushed 8 local variables to "development".
```

**Correct:**

Prompting with clear options:

```
$ cli link

✓ Linked to project "my-project".

Found local environment variables in supabase/.env (8 variables).
Push them to the "development" environment? [y/N] y

Pushing to "development" environment:

+ DATABASE_URL = "postgres://localhost:5432/app"   (add)
+ API_KEY = "abc123"                               (add)
+ OPENAI_KEY = [will be marked as secret]          (add)
... (5 more)

8 additions. Continue? [y/N] y

✓ Pushed 8 variables to "development".
```

Detecting conflict with existing remote variables:

```
$ cli link

✓ Linked to project "my-project".

The "development" environment already has 12 variables on the platform.
Your local .env has 8 variables.

[O]verwrite remote with local
[K]eep remote (discard local .env)
[M]erge (keep both, local values win on conflict)
[C]ancel

Choose: m

Merging local and remote variables...
✓ Merged 8 local + 12 remote variables (2 conflicts resolved).
```

If no local .env exists, no prompt:

```
$ cli link

✓ Linked to project "my-project".

Run "cli env pull" to download environment variables.
```

Declining the push keeps local-only mode:

```
$ cli link

Found local environment variables in supabase/.env.
Push them to the "development" environment? [y/N] n

✓ Linked to project "my-project".
Local .env file unchanged. Run "cli env push" later to sync.
```
