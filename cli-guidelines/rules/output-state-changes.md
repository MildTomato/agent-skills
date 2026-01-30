---
title: Tell the User When You Change State
impact: MEDIUM
impactDescription: Users need to understand what happened
tags: output, state, feedback, transparency
---

## Tell the User When You Change State

When a command changes system state, explain what happened. Help users build a mental model.

**Incorrect (silent state change):**

```
$ mycmd deploy
# Nothing... did it work?
$
```

**Correct (explains what happened):**

```
$ mycmd deploy
Uploading files... done (15 files, 2.3 MB)
Building application... done (1m 23s)
Deploying to production... done

✓ Deployed successfully
  URL: https://myapp.com
  Version: v1.2.3
  View logs: mycmd logs myapp
```

**Example from git push (explains every step):**

```
$ git push
Enumerating objects: 18, done.
Counting objects: 100% (18/18), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (10/10), 2.09 KiB | 2.09 MiB/s, done.
Total 10 (delta 8), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (8/8), completed with 8 local objects.
To github.com:user/repo.git
   6c22c90..a2a5217  main -> main
```

**Example from git status (shows current state + next steps):**

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   src/index.js

no changes added to commit (use "git add" and/or "git commit -a")
```

**For each state change, show:**

1. What's happening (during operation)
2. What happened (result)
3. What to do next (optional)

**Implementation:**

```typescript
async function deploy(app: string) {
  console.error(`Deploying ${app}...`)

  const url = await doDeploy(app)

  console.error(`✓ Deployed successfully`)
  console.error(`  URL: ${url}`)
  console.error(`  View logs: mycmd logs ${app}`)
}
```

**State inspection commands:**

```bash
mycmd status       # Show current state
mycmd list        # Show all resources
mycmd describe app # Show detailed state
```

**Suggest next steps:**

```bash
$ mycmd init myproject
Created project 'myproject'
  Config: myproject/.mycmdrc
  Docs: https://mycmd.dev/docs

Next steps:
  cd myproject
  mycmd start
```
