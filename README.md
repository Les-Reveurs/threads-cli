# threads-cli

CLI toolkit for working with Threads from the terminal.

## Goals

- authenticate safely
- inspect account/session state
- draft and publish posts
- manage threads/replies from scripts and CI
- provide a clean developer UX for automation

## Initial command shape

```bash
threads auth login
threads auth status
threads post create --text "hello world"
threads thread create --file ./draft.md
threads doctor
```

## Quick start

```bash
npm install
npm run build
node dist/cli.js doctor
```

## Project structure

- `src/cli.ts` — CLI entrypoint
- `docs/architecture.md` — architecture and module boundaries
- `ROADMAP.md` — phased delivery plan

## Status

Bootstrap created. API/reverse-engineering strategy and command contracts are next.
