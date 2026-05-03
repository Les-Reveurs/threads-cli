# threads-cli

CLI toolkit for working with Threads from the terminal.

## Strategy

`threads-cli` targets the **official Threads API first**.

Why:

- more stable than browser automation
- lower anti-bot / ban risk
- clearer auth and publish flows
- easier long-term maintenance

Unofficial adapters can exist later as an optional experimental layer, not as the product core.

## v1 goals

- authenticate safely with OAuth
- inspect current account state
- create and delete posts
- list own posts
- look up supported public profile/post data
- provide scriptable output for local automation and CI

## Planned command surface

```bash
threads auth login
threads auth exchange --code <authorization-code>
threads auth status
threads me
threads post create --text "hello world"
threads post delete <id>
threads posts list
threads user <username-or-id>
threads doctor
```

## Quick start

```bash
npm install
npm run build
node dist/cli.js doctor
node dist/cli.js help
```

## Project structure

- `src/cli.ts` — CLI entrypoint
- `docs/architecture.md` — architecture and module boundaries
- `docs/api-capabilities.md` — official API capability snapshot
- `ROADMAP.md` — phased delivery plan

## Status

Bootstrap is done. The repo now assumes official API-first design and the next milestone is implementing auth/config/client layers behind the command contracts.

Current implemented pieces:
- `threads auth login` scaffold that persists profile OAuth inputs and prints an authorization URL/state
- `threads auth exchange --code ...` to store an access token from the OAuth callback
- `threads auth status`
- `threads auth logout`
- `threads me`
- `threads user <username-or-id>`
- `threads doctor`
