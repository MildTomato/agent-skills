---
title: Don't Echo Passwords as User Types
impact: HIGH
impactDescription: Prevents shoulder-surfing and accidental exposure
tags: security, passwords, interactivity, privacy
---

## Don't Echo Passwords as User Types

Never display passwords as the user types them. Use password input mode.

**Incorrect (echoes password):**

```typescript
import prompts from 'prompts'

// Shows password as user types!
const { password } = await prompts({
  type: 'text', // Wrong type
  name: 'password',
  message: 'Password',
})
```

**Correct (hides password):**

```typescript
import prompts from 'prompts'

const { password } = await prompts({
  type: 'password', // Correct - input is hidden
  name: 'password',
  message: 'Password',
})
```

**Using different libraries:**

```typescript
// With inquirer
import inquirer from 'inquirer'

const { password } = await inquirer.prompt([
  {
    type: 'password',
    name: 'password',
    message: 'Enter password',
    mask: '*', // Optional: show asterisks
  },
])

// With read (simpler)
import read from 'read'

const password = await read({
  prompt: 'Password: ',
  silent: true, // Don't echo
  replace: '*', // Optional: show asterisks instead
})
```

**For confirmation:**

```typescript
const { password } = await prompts({
  type: 'password',
  name: 'password',
  message: 'Password',
})

const { confirm } = await prompts({
  type: 'password',
  name: 'confirm',
  message: 'Confirm password',
})

if (password !== confirm) {
  console.error('Error: Passwords do not match')
  process.exit(1)
}
```

**Other secret inputs:**

```typescript
// API keys, tokens, etc. should also be hidden
const { apiKey } = await prompts({
  type: 'password',
  name: 'apiKey',
  message: 'API Key',
})
```

**Always provide non-interactive alternative:**

```bash
# Interactive (hidden input)
$ mycmd login
Password: ********

# Non-interactive (from file)
$ mycmd login --password-file ~/.mycmd/password

# Non-interactive (from stdin)
$ cat ~/.mycmd/password | mycmd login --password-stdin
```

**Security note:** Even with hidden input, prefer reading from files or environment for automation:

```typescript
if (options.passwordFile) {
  password = fs.readFileSync(options.passwordFile, 'utf-8').trim()
} else if (!process.stdin.isTTY) {
  // Read from stdin
  password = fs.readFileSync(0, 'utf-8').trim()
} else {
  // Interactive prompt
  const result = await prompts({
    type: 'password',
    name: 'password',
    message: 'Password',
  })
  password = result.password
}
```
