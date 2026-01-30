# Agent Skills

A collection of skills for AI coding agents. Skills are packaged instructions and scripts that extend agent capabilities.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Available Skills

### cli-guidelines

Design and build well-crafted command-line interfaces following modern best practices. Based on the [Command Line Interface Guidelines](https://clig.dev/).

**Use when:**
- Creating CLI tools or adding commands/subcommands
- Implementing help text and documentation
- Handling errors and user input
- Parsing arguments/flags
- Improving CLI UX and output formatting
- Designing interactive prompts
- Setting up configuration systems
- Optimizing CLI robustness and performance

**Categories covered:**
- **The Basics** (must have) - Exit codes, stdout/stderr, argument parsing
- **Help & Documentation** - Help text, examples, web docs, man pages
- **Output & Errors** - TTY detection, JSON/plain output, error messages
- **Arguments & Flags** - Flag conventions, stdin/stdout support, secrets handling
- **Interactivity** - Prompts, passwords, Ctrl-C handling
- **Subcommands** - Multi-level commands, consistency patterns
- **Configuration** - Config precedence, XDG spec, environment variables
- **Robustness** - Progress indicators, timeouts, crash-only design
- **Signals** - Signal handling, cleanup operations
- **Future-proofing** - Versioning, deprecation, breaking changes
- **Naming & Distribution** - Command naming, packaging, installation
- **Analytics** - Telemetry, consent, privacy

**Philosophy:**
1. Human-first design: Design for humans, optimize for machines second
2. Simple parts that work together: Composable via stdin/stdout/stderr, exit codes, JSON
3. Consistency across programs: Follow existing patterns users already know
4. Saying (just) enough: Not too much output, not too little
5. Ease of discovery: Help users learn through suggestions, examples, and clear errors
6. Conversation as the norm: CLI interaction is iterative—guide the user through it
7. Robustness: Handle failures gracefully, be responsive, feel solid
8. Empathy: Be on the user's side, help them succeed
9. Chaos: Know when to break the rules—do so with intention

**Reference files:**
- `philosophy.md` - Design principles and philosophy
- `basics.md` - Exit codes, stdout/stderr, parsing libraries
- `help.md` - Implementing `--help`, subcommand help
- `documentation.md` - Web docs, man pages
- `output.md` - Colors, JSON, progress, paging
- `errors.md` - Error messages, debugging output
- `args-flags.md` - Parsing, standard flags, secrets
- `interactivity.md` - Prompts, passwords, escape handling
- `subcommands.md` - Multi-level commands, consistency
- `config.md` - Config files, env vars, XDG spec
- `robustness.md` - Progress, timeouts, crash-only
- `signals.md` - Ctrl-C handling, cleanup
- `future-proofing.md` - Versioning, deprecation
- `naming.md` - Command names, packaging
- `analytics.md` - Telemetry, consent

## Installation

```bash
npx skills add MildTomato/agent-skills --skill cli-guidelines
```

## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Examples:**
```
Create a CLI tool with proper help text and error handling
```
```
Review this CLI for best practices
```
```
Help me implement subcommands with consistent flags
```

## Skill Structure

Each skill contains:
- `SKILL.md` - Instructions for the agent
- `scripts/` - Helper scripts for automation (optional)
- `references/` - Supporting documentation (optional)

## License

MIT
