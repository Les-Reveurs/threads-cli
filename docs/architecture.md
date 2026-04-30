# Architecture

## Product intent

`threads-cli` should make common Threads workflows scriptable from a terminal and CI pipeline.

## Design principles

- predictable CLI UX
- safe auth handling
- composable commands
- machine-readable output where useful (`--json`)
- transport layer isolated from command layer

## Proposed modules

### 1. Command layer
User-facing commands, flags, validation, help text.

### 2. Config layer
Local profiles, environment variables, secrets storage strategy.

### 3. Auth layer
Login/session bootstrap, validation, refresh/recovery flows.

### 4. Threads client
Thin wrapper over whichever transport/API strategy we settle on.

### 5. Output layer
Human-readable terminal rendering plus JSON mode.

## Open questions

1. Official API vs browser/session automation vs reverse-engineered private endpoints?
2. How should credentials be stored locally?
3. Which workflows matter first: posting, replying, reading notifications, analytics?
4. Do we optimize for individual operators, bots, or CI usage first?
