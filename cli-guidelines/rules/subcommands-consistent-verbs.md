---
title: Use Consistent Verbs Across Subcommands
impact: MEDIUM
impactDescription: Reduces cognitive load, makes CLI guessable
tags: subcommands, verbs, consistency, api-design
---

## Use Consistent Verbs Across Subcommands

Use the same verb pattern for the same action across all resource types.

**Incorrect (inconsistent verbs):**

```bash
mycmd users create      # create
mycmd projects new      # new - different verb!
mycmd teams add         # add - another different verb!
mycmd servers make      # make - yet another verb!
```

**Correct (consistent verbs):**

```bash
# Same verb for creating any resource
mycmd users create
mycmd projects create
mycmd teams create
mycmd servers create
```

**Standard CRUD verb patterns:**

| Action     | Recommended               | Avoid mixing                |
| ---------- | ------------------------- | --------------------------- |
| **Create** | `create`, `new`, `init`   | `add`, `make`, `insert`     |
| **Read**   | `get`, `show`, `describe` | `display`, `view`, `read`   |
| **List**   | `list`, `ls`              | `show`, `get-all`           |
| **Update** | `update`, `set`, `edit`   | `modify`, `change`, `patch` |
| **Delete** | `delete`, `remove`, `rm`  | `destroy`, `drop`, `kill`   |

**Pick one and stick with it:**

```typescript
// Good - consistent pattern
program.command('users create')
program.command('projects create')
program.command('teams create')

// Bad - mixed verbs
program.command('users create')
program.command('projects new') // Different!
program.command('teams add') // Different!
```

**Docker example (good consistency):**

```bash
docker container create
docker container list
docker container start
docker container stop
docker container remove

docker image create
docker image list
docker image push
docker image pull
docker image remove
```

**Kubernetes example (consistent):**

```bash
kubectl create deployment
kubectl get deployment
kubectl describe deployment
kubectl delete deployment

kubectl create pod
kubectl get pod
kubectl describe pod
kubectl delete pod
```

**Two-level subcommand patterns:**

```bash
# Noun-verb (more common)
mycmd resource action
mycmd users create
mycmd users list

# Verb-noun
mycmd action resource
mycmd create user
mycmd list users
```

Pick one pattern and use it everywhere. Don't mix `users create` and `create users` in the same CLI.
