# Agent Skills

A collection of skills for AI coding agents. Skills are packaged instructions and scripts that extend agent capabilities.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Available Skills

### cli-guidelines

Design and build well-crafted command-line interfaces following modern best practices. Based on the [Command Line Interface Guidelines](https://clig.dev/). Contains 31 focused, actionable rules prioritized by impact.

**Use when:**

- Creating CLI tools or adding commands/subcommands
- Implementing help text and error handling
- Parsing arguments and flags
- Designing interactive prompts
- Setting up configuration systems
- Improving CLI UX and output formatting
- Reviewing CLI code for best practices
- Refactoring existing command-line tools

**Categories covered:**

- **The Basics** (CRITICAL) - Argument parsing, exit codes, stdout/stderr, help flags
- **Help & Documentation** (CRITICAL) - Concise help, examples, suggestions
- **Output Formatting** (HIGH) - TTY detection, JSON/plain output, state changes
- **Error Handling** (HIGH) - Human-friendly errors, signal-to-noise, important info placement
- **Arguments & Flags** (HIGH) - Prefer flags, standard names, no secrets in flags
- **Interactivity** (HIGH) - TTY checks, --no-input flag, prompts
- **Signals & Control** (HIGH) - Ctrl-C handling, graceful shutdown
- **Robustness** (MEDIUM-HIGH) - 100ms response, progress indicators, validation, idempotency
- **Subcommands** (MEDIUM-HIGH) - Consistency across commands
- **Configuration** (MEDIUM) - Precedence rules, XDG spec
- **Future-proofing** (MEDIUM) - Additive changes, deprecation warnings
- **Naming & Distribution** (LOW-MEDIUM) - Simple names, ergonomics

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

**Structure:**

- 31 focused rule files in `rules/` directory
- Each rule: ~50-80 lines with examples and implementation code
- Comprehensive reference docs in `references/` for deeper context
- AGENTS.md: Compiled guide with all rules (auto-generated)

**Rule prefixes by category:**

- `basics-` - Critical fundamentals (parsing, exit codes, streams, help)
- `help-` - Help text and documentation patterns
- `output-` - Output formatting (TTY, JSON, plain, state)
- `errors-` - Error handling and messaging
- `args-` - Arguments and flags (prefer flags, standards, secrets)
- `interactive-` - Prompts and interactivity
- `signals-` - Signal handling (Ctrl-C, cleanup)
- `robustness-` - Reliability (validation, progress, idempotency)
- `subcommands-` - Multi-command consistency
- `config-` - Configuration management
- `future-` - Future-proofing and compatibility
- `naming-` - Command naming and distribution

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
- `rules/` or `references/` - Supporting documentation (optional)

## License

MIT
