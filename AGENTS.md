# AGENTS.md — threads-cli

## Purpose

CLI for working with the official Threads API from the terminal.

## Security rules for every agent

1. **Never commit secrets**
   - Do not commit access tokens, refresh tokens, client secrets, OAuth codes, cookies, session dumps, or `.env` files.
   - Keep real credentials only in untracked local files or external secret stores.

2. **Treat all auth material as sensitive**
   - Redact tokens in logs, screenshots, tests, docs, and examples.
   - If a command prints a token, do not paste it into the repo.
   - Use placeholders like `token-abc` only in tests.

3. **Do not weaken auth flows for convenience**
   - No hardcoded fallback tokens.
   - No bypasses that skip state validation or other OAuth safety checks unless explicitly marked as test-only and isolated from production code.

4. **Keep examples safe**
   - README, docs, and fixtures must use obviously fake values.
   - Never copy real API responses if they contain identifiers or secrets that should stay private.

5. **Prefer least-privilege debugging**
   - When debugging API calls, log status codes, endpoint names, and sanitized payload shapes.
   - Do not log full `Authorization` headers or raw credential blobs.

6. **Before commit**
   - Check `git diff --cached` for secrets.
   - Grep for obvious leaks: `token`, `secret`, `Authorization`, `Bearer`, `.env`.
   - If anything sensitive was committed by mistake, stop and clean the working tree or history before continuing.

## Cross-repo privacy rule

- If you reference other internal tools in docs/examples (for example iCloud / CalDAV / Apple account setup), use only template placeholders and never real personal email addresses, calendar names, or private URLs.
- For any Apple / iCloud integration docs, specify **app-specific password only** — never imply that a normal Apple ID password is acceptable.

## Repo-specific guardrails

- This repo is **official API first**. Do not add browser automation, cookie scraping, or unofficial login hacks as the default path.
- Auth/config should remain file-based and local; never auto-create tracked credential files.
- Test fixtures may contain fake values only. Keep them clearly fake and non-reusable.

## Safe file conventions

- Allowed tracked examples: `*.example`, sanitized JSON fixtures, docs with placeholders.
- Forbidden tracked secrets: `.env`, exported profiles with live tokens, raw HTTP captures with auth headers, copied browser storage.

## If you discover a leak

1. Remove it from the current tree.
2. Add ignore rules or example templates if missing.
3. If it was committed, rewrite history and force-push if the human approves or has already requested cleanup.
4. Tell the human what must be rotated.

## Minimal verification before finishing

Run the smallest relevant check:

```bash
npm run build
npm test
```

If you changed docs only, say so explicitly.
