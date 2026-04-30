# CLI specification

## Principles

- official Threads API first
- explicit over magical
- shell-friendly defaults
- JSON output for automation

## Command tree

```text
threads
├── auth
│   ├── login
│   ├── status
│   └── logout
├── me
├── user <username-or-id>
├── posts list
├── post create [text]
├── post delete <id>
└── doctor
```

## Command contracts

### `threads auth login`
Starts OAuth login flow and stores resulting tokens in the configured profile.

Possible flags:
- `--client-id`
- `--redirect-uri`
- `--scopes`
- `--profile <name>`
- `--no-open`

### `threads auth status`
Shows whether a profile is configured and whether the token looks usable.

Possible flags:
- `--profile <name>`
- `--json`

### `threads auth logout`
Clears locally stored auth material for a profile.

### `threads me`
Returns current authenticated account profile.

Possible flags:
- `--json`

### `threads user <username-or-id>`
Looks up public profile information using whichever official API lookup path is available.

Possible flags:
- `--json`

### `threads posts list`
Lists posts for the authenticated account.

Possible flags:
- `--limit <n>`
- `--after <cursor>`
- `--json`

### `threads post create [text]`
Creates a post through the official post creation flow.

Possible flags:
- `--text <text>`
- `--media <path-or-url>`
- `--reply-control <value>`
- `--quote <post-id>`
- `--reply-to <post-id>`
- `--json`

### `threads post delete <id>`
Deletes an owned post.

Possible flags:
- `--json`

### `threads doctor`
Checks local env, config, auth prerequisites, and API-related settings.

## Non-goals for MVP

- home feed scraping
- pretending unsupported mobile-app features are available
- hidden fallback to browser automation
