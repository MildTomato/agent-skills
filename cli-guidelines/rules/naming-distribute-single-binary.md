---
title: Distribute as Single Binary When Possible
impact: LOW-MEDIUM
impactDescription: Simplifies installation and reduces dependency issues
tags: distribution, packaging, installation, deployment
---

## Distribute as Single Binary When Possible

Distribute your CLI as a single executable file when possible. Simplifies installation.

**Good (single file):**

```bash
# User downloads one file, done
curl -L https://mycmd.dev/install.sh | bash
# Installs single binary to /usr/local/bin/mycmd
```

**For Node.js CLIs, use pkg or esbuild:**

```typescript
// package.json
{
  "scripts": {
    "build": "esbuild src/cli.ts --bundle --platform=node --outfile=dist/mycmd.js",
    "package": "pkg dist/mycmd.js --output dist/mycmd"
  },
  "bin": {
    "mycmd": "./dist/mycmd"
  }
}
```

**Using pkg for standalone binary:**

```bash
# Compile to standalone binaries
pkg package.json

# Outputs:
# mycmd-macos
# mycmd-linux
# mycmd-win.exe
```

**Using esbuild (keeps Node dependency):**

```bash
# Bundle all dependencies into one JS file
esbuild src/cli.ts --bundle --platform=node --outfile=mycmd.js

# Still needs Node runtime, but no node_modules
chmod +x mycmd.js
./mycmd.js
```

**Installation script:**

```bash
#!/bin/bash
# install.sh

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Download appropriate binary
curl -L "https://mycmd.dev/releases/latest/mycmd-${OS}-${ARCH}" \
  -o /usr/local/bin/mycmd

chmod +x /usr/local/bin/mycmd

echo "✓ mycmd installed to /usr/local/bin/mycmd"
```

**Alternative: npm global install**

```bash
npm install -g mycmd
```

**Benefits of single binary:**

- No dependency hell
- Fast installation
- Works offline after download
- Easy to verify checksums
- Simple to uninstall

**If you can't make a single binary:**

- Use npm/pip/cargo for language-specific tools
- Use system package managers (apt, brew, etc.)
- Document all dependencies clearly

**Make uninstall easy:**

```bash
# Self-uninstall command
mycmd uninstall
# Removes /usr/local/bin/mycmd and ~/.config/mycmd

# Or document manual removal
rm /usr/local/bin/mycmd
rm -rf ~/.config/mycmd
```

**Package for multiple platforms:**

```json
{
  "pkg": {
    "targets": ["node18-macos-x64", "node18-macos-arm64", "node18-linux-x64", "node18-win-x64"],
    "outputPath": "dist"
  }
}
```
