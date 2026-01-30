---
name: cli-design
description: Design and build well-crafted command-line interfaces following modern best practices. Use when creating CLI tools, adding commands/subcommands, implementing help text, handling errors, parsing arguments/flags, or improving CLI UX. Covers output formatting, interactivity, configuration, robustness, and naming conventions.
---

# CLI Design Skill

Design human-first CLIs that are composable, consistent, and robust. Based on [clig.dev](https://clig.dev/).

## Core Philosophy

1. **Human-first**: Design for humans, optimize for machines second
2. **Composable**: Simple parts that work together (stdin/stdout/stderr, exit codes, JSON)
3. **Consistent**: Follow existing patterns users already know
4. **Discoverable**: Help users learn through suggestions, examples, and clear errors
5. **Robust**: Handle failures gracefully, be responsive, show progress

## Quick Reference Checklist

### Essentials (must have)

- [ ] Use argument parsing library (don't roll your own)
- [ ] Return 0 on success, non-zero on failure
- [ ] Send output to `stdout`, messages/errors to `stderr`
- [ ] Support `-h` and `--help` flags
- [ ] Have full-length versions of all flags (`-v` → `--verbose`)

### Help & Documentation

- [ ] Display concise help when run with no args (if args required)
- [ ] Lead with examples in help text
- [ ] Suggest corrections for typos
- [ ] Link to web docs from help text

### Output & Errors

- [ ] Check if TTY before using colors/animations
- [ ] Support `--json` for machine-readable output
- [ ] Support `--plain` for script-friendly output
- [ ] Catch errors and rewrite for humans
- [ ] Put important info at end of output (where eyes go)

### Arguments & Flags

- [ ] Prefer flags over positional args
- [ ] Use standard flag names (`-f/--force`, `-n/--dry-run`, `-q/--quiet`)
- [ ] Never require prompts—always allow flag input
- [ ] Accept `-` to read from stdin / write to stdout
- [ ] Don't read secrets from flags (use `--password-file` or stdin)

### Robustness

- [ ] Show progress for long operations
- [ ] Print something within 100ms
- [ ] Make operations idempotent/recoverable
- [ ] Handle Ctrl-C gracefully

## Decision Trees

### Choosing output format

```
Is stdout a TTY?
├─ Yes → Use colors, formatting, progress bars
└─ No → Plain text, no animations
         └─ Was --json passed? → Output JSON
         └─ Was --plain passed? → One record per line
```

### Handling dangerous operations

```
How dangerous is the operation?
├─ Mild (delete file) → Maybe prompt, maybe not
├─ Moderate (delete dir, remote resource) → Prompt y/n or require --force
└─ Severe (delete server/app) → Require typing resource name or --confirm="name"
```

### Configuration precedence (highest to lowest)

1. Flags
2. Environment variables
3. Project config (`.env`, `config.json`)
4. User config (`~/.config/myapp/`)
5. System config (`/etc/myapp/`)

## Reference Files

Load these as needed for detailed guidance:

| Topic | File | When to read |
|-------|------|--------------|
| Help text patterns | [help.md](references/help.md) | Implementing `--help`, subcommand help |
| Output formatting | [output.md](references/output.md) | Colors, JSON, progress, paging |
| Error handling | [errors.md](references/errors.md) | Error messages, debugging output |
| Arguments & flags | [args-flags.md](references/args-flags.md) | Parsing, standard flags, secrets |
| Interactivity | [interactivity.md](references/interactivity.md) | Prompts, passwords, escape handling |
| Subcommands | [subcommands.md](references/subcommands.md) | Multi-level commands, consistency |
| Configuration | [config.md](references/config.md) | Config files, env vars, XDG spec |
| Robustness | [robustness.md](references/robustness.md) | Progress, timeouts, crash-only |
| Naming & distribution | [naming.md](references/naming.md) | Command names, packaging |

## Common Argument Parsing Libraries

- **Go**: Cobra, urfave/cli
- **Python**: Click, Typer, argparse
- **Node**: oclif, commander
- **Rust**: clap
- **Ruby**: TTY
- **Multi-platform**: docopt
