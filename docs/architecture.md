# Architecture

## Product intent

`threads-cli` should make supported Threads workflows scriptable from a terminal and CI pipeline.

## Product direction

Version 1 is built around the **official Threads API only**.

That means:

- no browser automation in the core architecture
- no pretending unsupported app features exist in the public API
- command contracts should map to documented capabilities first

If an unofficial mode is ever added, it should be implemented as a separate adapter behind an explicit experimental flag.

## Design principles

- predictable CLI UX
- safe OAuth-based auth handling
- composable commands
- machine-readable output where useful (`--json`)
- command layer isolated from API transport
- capability-driven product scope

## Proposed modules

### 1. Command layer
User-facing commands, flags, validation, help text.

### 2. Config layer
Local profiles, environment variables, token storage, active profile selection.

### 3. Auth layer
OAuth bootstrap, token exchange, refresh, validation, logout.

### 4. Threads API client
Thin typed wrapper over official Threads API endpoints.

### 5. Output layer
Human-readable terminal rendering plus JSON mode.

### 6. Capability registry
A small internal map describing which commands are stable, beta, or unsupported by the official API.

## Initial command map

### Stable MVP targets
- `threads auth login`
- `threads auth status`
- `threads me`
- `threads post create`
- `threads post delete <id>`
- `threads posts list`
- `threads user <username|id>`
- `threads doctor`

### Later, after API-backed implementation lands
- replies management
- mentions
- search
- insights
- webhooks helper flows

## Open questions

1. Where should tokens live by default: env-only, local config, or OS keychain?
2. Should `threads user` default to username lookup, id lookup, or auto-detect?
3. Which output contract should be canonical for scripting: compact JSON objects or raw API-shaped JSON?
4. Do we ship webhooks tooling in the CLI core or as a separate subcommand/plugin package?
