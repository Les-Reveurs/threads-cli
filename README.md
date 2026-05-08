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
threads auth import --access-token <token>
threads auth status
threads me
threads post create --text "hello world"
threads post create --text "look at this" --media-url https://cdn.example.test/pic.png --alt-text "robot portrait"
threads post create --text "replying" --reply-to <post-id>
threads post create --text "quoting" --quote <post-id>
threads post create --text "carousel" --media-url https://cdn.example.test/1.png --media-url https://cdn.example.test/2.jpg
threads post create --text "video" --media-url https://cdn.example.test/clip.mp4 --publish-poll-ms 2000 --publish-timeout-ms 120000
threads post delete <id>
threads posts list
threads replies list <post-id>
threads replies hide <reply-id>
threads replies unhide <reply-id>
threads user <username-or-id>
threads doctor
```

## Quick start

```bash
npm install
npm run build
node dist/cli.js auth import --access-token "$THREADS_TOKEN" --json
node dist/cli.js doctor
node dist/cli.js auth status --json
node dist/cli.js help
```

## Project structure

This repo now follows the same layered CLI architecture as `icalendar`:

- `src/app/commands/*` — CLI contract layer
- `src/app/use-cases/*` — orchestration layer
- `src/domain/*` — domain entities, value objects, invariants
- `src/infra/*` — provider adapters, config, storage
- `src/presentation/*` — text renderers and JSON-ready DTO output
- `src/shared/*` — tiny cross-cutting helpers
- `docs/architecture.md` — target architecture and migration rules
- `docs/api-capabilities.md` — official API capability snapshot
- `ROADMAP.md` — phased delivery plan

## Status

The MVP command surface is implemented on top of the layered architecture (`app -> domain -> infra -> presentation`).

Current implemented pieces:
- `threads auth login` scaffold that persists profile OAuth inputs and prints an authorization URL/state
- `threads auth exchange --code ...` to store an access token from the OAuth callback
- `threads auth import --access-token ...` for CI/non-interactive setup
- `threads auth status`
- `threads auth logout`
- `threads me`
- `threads user <username-or-id>`
- `threads posts list`
- `threads post delete <id>`
- `threads post create` for text, image, video, carousel, quote, and reply posts via the official publish flow
- video posts poll container readiness before publish by default
- `threads doctor`
- `threads replies list <post-id>`
- `threads replies hide <reply-id>` / `threads replies unhide <reply-id>`
- `--json` output for the current stable command surface
- GitHub Actions CI for `typecheck`, `test`, and `build`
