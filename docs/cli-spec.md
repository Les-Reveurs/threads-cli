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
│   ├── import
│   └── logout
├── me
├── user <username-or-id>
├── posts list
├── post create [text]
├── post delete <id>
├── replies list <post-id>
├── replies hide <reply-id>
├── replies unhide <reply-id>
├── mentions list
├── insights post <id>
├── insights user
└── doctor
```

## Command contracts

### `threads auth login`
Starts OAuth login flow and stores resulting tokens in the configured profile.

Possible flags:
- `--client-id`
- `--client-secret`
- `--redirect-uri`
- `--scopes`
- `--profile <name>`

### `threads auth status`
Shows whether a profile is configured and whether the token looks usable.

Possible flags:
- `--profile <name>`
- `--json`

### `threads auth import`
Stores access tokens and optional auth metadata without running the browser OAuth flow.
Useful for CI and local automation.

Possible flags:
- `--access-token <token>`
- `--refresh-token <token>`
- `--expires-at <iso-timestamp>`
- `--client-id <id>`
- `--client-secret <secret>`
- `--redirect-uri <uri>`
- `--scopes <a,b,c>`
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
- `--media-url <url>` (repeat for carousel)
- `--media-type <TEXT|IMAGE|VIDEO|CAROUSEL>`
- `--alt-text <text>`
- `--reply-to <post-id>`
- `--quote <post-id>`
- `--reply-control <everyone|accounts_you_follow|mentioned_only>`
- `--wait` / `--no-wait`
- `--publish-poll-ms <ms>`
- `--publish-timeout-ms <ms>`
- `--json`

### `threads post delete <id>`
Deletes an owned post.

Possible flags:
- `--json`

### `threads replies list <post-id>`
Lists replies for a Threads post.

Possible flags:
- `--after <cursor>`
- `--json`

### `threads replies hide <reply-id>`
Hides a reply.

Possible flags:
- `--json`

### `threads replies unhide <reply-id>`
Unhides a reply.

Possible flags:
- `--json`

### `threads mentions list`
Lists mentions for the authenticated account.

Possible flags:
- `--after <cursor>`
- `--json`

### `threads insights post <id>`
Returns official insight metrics for a single post.

Possible flags:
- `--metric <name[,name...]>` (repeatable)
- `--json`

### `threads insights user`
Returns official account insight metrics for the authenticated user.

Possible flags:
- `--metric <name[,name...]>` (repeatable)
- `--breakdown <dimension>`
- `--json`

### `threads doctor`
Checks local config paths plus auth prerequisites for the active profile.

## Non-goals for MVP

- home feed scraping
- pretending unsupported mobile-app features are available
- hidden fallback to browser automation
