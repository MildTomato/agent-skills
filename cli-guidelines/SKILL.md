---
name: cli-guidelines
description: Design and build well-crafted command-line interfaces following modern best practices. Use when creating CLI tools, adding commands/subcommands, implementing help text, handling errors, parsing arguments/flags, or improving CLI UX. Covers output formatting, interactivity, configuration, robustness, and naming conventions.
---

# CLI Design Skill

Design human-first CLIs that are composable, consistent, and robust. Based on the [Command Line Interface Guidelines](https://clig.dev/).

## Philosophy

Read [philosophy.md](references/philosophy.md) for full explanations. These are the fundamental principles:

1. **Human-first design**: Design for humans, optimize for machines second
2. **Simple parts that work together**: Composable via stdin/stdout/stderr, exit codes, JSON
3. **Consistency across programs**: Follow existing patterns users already know
4. **Saying (just) enough**: Not too much output, not too little
5. **Ease of discovery**: Help users learn through suggestions, examples, and clear errors
6. **Conversation as the norm**: CLI interaction is iterative—guide the user through it
7. **Robustness**: Handle failures gracefully, be responsive, feel solid
8. **Empathy**: Be on the user's side, help them succeed
9. **Chaos**: Know when to break the rules—do so with intention

## Quick Reference Checklist

### The Basics (must have)

See [basics.md](references/basics.md) for details.

- [ ] Use argument parsing library (don't roll your own)
- [ ] Return 0 on success, non-zero on failure
- [ ] Send output to `stdout`, messages/errors to `stderr`
- [ ] Support `-h` and `--help` flags
- [ ] Have full-length versions of all flags (`-v` → `--verbose`)

### Help & Documentation

See [help.md](references/help.md) and [documentation.md](references/documentation.md).

- [ ] Display concise help when run with no args (if args required)
- [ ] Display full help on `-h` and `--help`
- [ ] Lead with examples in help text
- [ ] Suggest corrections for typos
- [ ] Link to web docs from help text
- [ ] Provide web-based documentation
- [ ] Consider providing man pages

### Output & Errors

See [output.md](references/output.md) and [errors.md](references/errors.md).

- [ ] Check if TTY before using colors/animations
- [ ] Support `--json` for machine-readable output
- [ ] Support `--plain` for script-friendly output
- [ ] Catch errors and rewrite for humans
- [ ] Put important info at end of output (where eyes go)
- [ ] Use a pager for long output

### Arguments & Flags

See [args-flags.md](references/args-flags.md).

- [ ] Prefer flags over positional args
- [ ] Use standard flag names (`-f/--force`, `-n/--dry-run`, `-q/--quiet`)
- [ ] Never require prompts—always allow flag input
- [ ] Accept `-` to read from stdin / write to stdout
- [ ] Don't read secrets from flags (use `--password-file` or stdin)
- [ ] Make arguments, flags, and subcommands order-independent

### Interactivity

See [interactivity.md](references/interactivity.md).

- [ ] Only prompt if stdin is a TTY
- [ ] Support `--no-input` to disable prompts
- [ ] Don't echo passwords as user types
- [ ] Make Ctrl-C always work

### Subcommands

See [subcommands.md](references/subcommands.md).

- [ ] Be consistent across subcommands (same flags, same output)
- [ ] Use consistent verbs (create/get/update/delete)
- [ ] Don't allow arbitrary abbreviations
- [ ] Don't have catch-all subcommands

### Configuration

See [config.md](references/config.md).

- [ ] Follow precedence: Flags > Env vars > Project config > User config > System config
- [ ] Follow XDG Base Directory spec for config locations
- [ ] Don't store secrets in environment variables or flags

### Robustness

See [robustness.md](references/robustness.md).

- [ ] Print something within 100ms
- [ ] Show progress for long operations
- [ ] Make operations idempotent/recoverable
- [ ] Validate input early, fail fast
- [ ] Set timeouts on network operations

### Signals

See [signals.md](references/signals.md).

- [ ] Exit immediately on Ctrl-C
- [ ] Allow second Ctrl-C to force quit during cleanup
- [ ] Design for crash-only operation

### Future-proofing

See [future-proofing.md](references/future-proofing.md).

- [ ] Keep changes additive
- [ ] Warn before breaking changes
- [ ] Don't create time bombs (external dependencies)

### Naming & Distribution

See [naming.md](references/naming.md).

- [ ] Simple, memorable, lowercase command name
- [ ] Easy to type (test it!)
- [ ] Distribute as single binary if possible
- [ ] Make it easy to uninstall

### Analytics

See [analytics.md](references/analytics.md).

- [ ] Don't phone home without consent
- [ ] Prefer opt-in over opt-out
- [ ] Consider alternatives (instrument docs, talk to users)

## Decision Trees

### Choosing output format

```
Is stdout a TTY?
├─ Yes → Use colors, formatting, progress bars
└─ No → Plain text, no animations
         ├─ Was --json passed? → Output JSON
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
| Philosophy | [philosophy.md](references/philosophy.md) | Understanding design principles |
| The Basics | [basics.md](references/basics.md) | Exit codes, stdout/stderr, parsing |
| Help text | [help.md](references/help.md) | Implementing `--help`, subcommand help |
| Documentation | [documentation.md](references/documentation.md) | Web docs, man pages |
| Output formatting | [output.md](references/output.md) | Colors, JSON, progress, paging |
| Error handling | [errors.md](references/errors.md) | Error messages, debugging output |
| Arguments & flags | [args-flags.md](references/args-flags.md) | Parsing, standard flags, secrets |
| Interactivity | [interactivity.md](references/interactivity.md) | Prompts, passwords, escape handling |
| Subcommands | [subcommands.md](references/subcommands.md) | Multi-level commands, consistency |
| Configuration | [config.md](references/config.md) | Config files, env vars, XDG spec |
| Robustness | [robustness.md](references/robustness.md) | Progress, timeouts, crash-only |
| Signals | [signals.md](references/signals.md) | Ctrl-C handling, cleanup |
| Future-proofing | [future-proofing.md](references/future-proofing.md) | Versioning, deprecation |
| Naming & distribution | [naming.md](references/naming.md) | Command names, packaging |
| Analytics | [analytics.md](references/analytics.md) | Telemetry, consent |

## Common Argument Parsing Libraries

| Language | Libraries |
|----------|-----------|
| Go | Cobra, urfave/cli |
| Python | Click, Typer, argparse |
| Node | oclif, commander |
| Rust | clap |
| Ruby | TTY |
| Java | picocli |
| Swift | swift-argument-parser |
| Multi-platform | docopt |

## Further Reading

- [The Unix Programming Environment](https://en.wikipedia.org/wiki/The_Unix_Programming_Environment) — Kernighan and Pike
- [POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html)
- [Program Behavior for All Programs](https://www.gnu.org/prep/standards/html_node/Program-Behavior.html) — GNU Coding Standards
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46) — Jeff Dickey
- [CLI Style Guide](https://devcenter.heroku.com/articles/cli-style-guide) — Heroku
