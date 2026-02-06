---
title: Environment CRUD Uses Consistent Verbs and Output
impact: MEDIUM
impactDescription: Provides predictable CLI UX across all environment operations
tags: environments, crud, cli-ux, consistency
---

## Environment CRUD Uses Consistent Verbs and Output

Environment CRUD commands use consistent verbs and output formats: `create`,
`delete`, `list-environments`, `seed`. Output follows a predictable structure
with clear success/error messages.

**Incorrect:**

Inconsistent verb choices:

```
$ cli env add staging        # create vs add
$ cli env remove staging     # delete vs remove
$ cli env show              # list vs show
$ cli env copy production --from preview   # seed vs copy
```

Inconsistent output formats:

```
$ cli env create staging

staging created

$ cli env delete staging

Deleted: staging

$ cli env list-environments

* production
* preview
* development
```

**Correct:**

Consistent verb choices:

```
$ cli env create staging

✓ Created "staging" environment.

$ cli env delete staging

✓ Deleted "staging" environment.

$ cli env list-environments

Environment   | Purpose                  | Used By
------------- | ------------------------ | ------------------
development   | Local execution          | cli dev
preview       | Deployed previews        | dev + feature branches
production    | Live deployment          | main branch
staging       | Custom environment       | (not mapped)

$ cli env seed production --from preview

Copying 14 variables from "preview" to "production"...
✓ Seeded "production" with 14 variables.
```

Creating with seeding:

```
$ cli env create staging --from preview

✓ Created "staging" environment.
Copying 12 variables from "preview"...
✓ Seeded "staging" with 12 variables.
```

Error messages follow the same pattern:

```
$ cli env delete production

Error: Cannot delete default environment "production".
Default environments (development, preview, production) are required for all projects.

$ cli env delete nonexistent

Error: Environment "nonexistent" not found.
```
