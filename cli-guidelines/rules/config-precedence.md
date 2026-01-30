---
title: Follow Configuration Precedence
impact: MEDIUM
impactDescription: Predictable config behavior expected by users
tags: config, precedence, environment, flags
---

## Follow Configuration Precedence

Apply configuration in order of precedence from highest to lowest. Flags override everything.

**Precedence order (highest to lowest):**

1. **Flags** - `--config-value=X`
2. **Environment variables** - `MYAPP_CONFIG_VALUE=X`
3. **Project config** - `./.myapprc`, `./.env`
4. **User config** - `~/.config/myapp/config.json`
5. **System config** - `/etc/myapp/config`

**Incorrect (random precedence):**

```typescript
// Confusing - env var overrides flag!
let configValue = process.env.MYAPP_VALUE
if (options.value) {
  configValue = options.value // Wrong order
}
```

**Correct (proper precedence):**

```typescript
function getConfigValue(key: string, options: any): string {
  // 1. Flag (highest priority)
  if (options[key] !== undefined) {
    return options[key]
  }

  // 2. Environment variable
  const envKey = `MYAPP_${key.toUpperCase()}`
  if (process.env[envKey]) {
    return process.env[envKey]
  }

  // 3. Project config file
  const projectConfig = loadConfig('./.myapprc')
  if (projectConfig[key]) {
    return projectConfig[key]
  }

  // 4. User config file
  const userConfig = loadConfig('~/.config/myapp/config.json')
  if (userConfig[key]) {
    return userConfig[key]
  }

  // 5. System config (lowest priority)
  const systemConfig = loadConfig('/etc/myapp/config')
  return systemConfig[key]
}
```

**Example behavior:**

```bash
# System config: port = 8080
# User config: port = 3000
# Env var: MYAPP_PORT=4000
# Flag: --port=5000

$ mycmd start
# Uses 3000 (user config)

$ MYAPP_PORT=4000 mycmd start
# Uses 4000 (env var overrides user config)

$ mycmd start --port=5000
# Uses 5000 (flag overrides everything)
```

**This order makes sense because:**

- Flags are most explicit and immediate
- Env vars are session-specific
- Project config is shared with team
- User config is personal preference
- System config is global default
