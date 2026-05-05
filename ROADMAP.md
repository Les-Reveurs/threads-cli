# Roadmap

## Phase 0 — bootstrap
- create public repo
- define architecture
- establish CLI skeleton

## Phase 1 — official API contract design
- verify public Threads API capabilities
- define stable command namespace around supported endpoints
- add structured config and profile loading
- define OAuth flow and token persistence strategy

## Phase 2 — MVP
- [x] `threads auth login`
- [x] `threads auth status`
- [x] `threads me`
- [x] `threads post create` (text-only MVP)
- [x] `threads post delete <id>`
- [x] `threads posts list`
- [x] `threads user <username|id>`
- [x] `threads doctor`
- [x] `threads auth exchange --code <code>` (bridge from OAuth redirect to usable token)

## Phase 3 — operator ergonomics
- [x] `--json` output
- draft files/templates
- retries and clear error mapping
- CI-friendly non-interactive auth flow
- better env/config diagnostics

## Phase 4 — official API expansion
- replies management
- mentions
- keyword/topic search
- insights
- webhook tooling

## Phase 5 — optional experimental adapters
- evaluate unofficial/browser-backed adapter only if official API leaves important gaps
- keep experimental mode opt-in and clearly separated from stable official flows
