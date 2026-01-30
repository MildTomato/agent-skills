# Help Text Patterns

## Display Rules

- Show help on `-h`, `--help`, and (if git-like) `help` subcommand
- Display concise help when run with no args (if args are required)
- Ignore other flags when `-h` is passed—`mycmd --foo -h` should show help

## Concise Help Structure

When no args provided, show only:
1. One-line description
2. 1-2 example invocations
3. Common flags (if few)
4. Instruction to run `--help` for more

Example (jq):
```
$ jq
jq - commandline JSON processor [version 1.6]

Usage: jq [options] <jq filter> [file...]

jq is a tool for processing JSON inputs...

Example:
    $ echo '{"foo": 0}' | jq .
    {
        "foo": 0
    }

For a listing of options, use jq --help.
```

## Full Help Structure

```
USAGE
  $ myapp <command> [options]

DESCRIPTION
  Brief description of what the tool does.

EXAMPLES
  $ myapp init           # Create new project
  $ myapp build --prod   # Build for production

COMMANDS
  init      Initialize a new project
  build     Build the project
  deploy    Deploy to production

OPTIONS
  -h, --help     Show help
  -v, --version  Show version
  -q, --quiet    Suppress output

CONFIGURATION
  myapp reads from ~/.myapprc or $MYAPP_CONFIG

MORE INFO
  Docs: https://myapp.dev/docs
  Bugs: https://github.com/org/myapp/issues
```

## Best Practices

- **Lead with examples**: Users prefer examples over prose
- **Show common flags first**: Put most-used options at top
- **Use formatting**: Bold headings improve scannability
- **Link to web docs**: Include URLs for detailed docs
- **Provide support path**: GitHub link or support URL
- **Suggest corrections**: If typo detected, suggest `Did you mean X?`

## Git-like Help

If using subcommands, support all these patterns:
```
$ myapp help
$ myapp help subcommand
$ myapp subcommand --help
$ myapp subcommand -h
```

## Piped Input Handling

If expecting stdin and it's a TTY (no pipe), show help immediately:
```go
if isatty.IsTerminal(os.Stdin.Fd()) {
    showHelp()
    os.Exit(0)
}
```
