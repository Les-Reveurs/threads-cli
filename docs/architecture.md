# Unified CLI Architecture — threads-cli

## Goal

`threads-cli` and `icalendar` should follow the **same architectural shape** so that:

- commands are discovered and implemented the same way
- domain logic is isolated from transport and output
- modules stay small and replaceable
- tests can target the same layer boundaries in both repos
- future CLI projects can copy the same skeleton

This document defines the target architecture for `threads-cli`.

---

## Architectural principles

1. **Same layers in every CLI repo**
2. **One file = one clear reason to change**
3. **Transport and provider SDKs stay at the edges**
4. **Use-cases orchestrate; domain models decide**
5. **Presentation never talks directly to providers**
6. **Config parsing is not business logic**
7. **Every external dependency sits behind a port/interface**

---

## Target layer model

Both `threads-cli` and `icalendar` should use this exact layer stack:

### 1. Entrypoint layer
Responsible only for process bootstrapping.

Examples:
- read argv
- install top-level error handler
- call command runtime
- set exit code

### 2. Command layer
Responsible for CLI contracts.

Examples:
- command names
- flags/options
- argument validation
- mapping CLI input into use-case input DTOs

### 3. Application layer
Responsible for use-cases.

Examples:
- `login-auth`
- `exchange-auth-code`
- `get-current-profile`
- `list-posts`
- `create-post`
- `delete-post`
- `run-doctor`

Rules:
- no raw `process.env`
- no direct HTTP calls
- no formatting for terminal output
- depends only on domain + ports

### 4. Domain layer
Responsible for product meaning and invariants.

Examples:
- entities: `Profile`, `Post`, `OAuthSession`
- value objects: `AccessToken`, `ProfileId`, `PaginationCursor`
- domain services/policies
- validation rules not tied to CLI syntax or HTTP transport

Rules:
- no SDK imports
- no terminal printing
- no filesystem access

### 5. Infrastructure layer
Responsible for provider-specific and machine-specific adapters.

Examples:
- Threads HTTP client
- OAuth API adapter
- local profile/token store
- env/config loader
- fake test adapter

Rules:
- implements ports defined by application/domain
- may depend on Node APIs, files, HTTP, provider schemas

### 6. Presentation layer
Responsible for rendering results.

Examples:
- text renderers
- json serialization helpers
- doctor output formatting

Rules:
- only transform already prepared result objects
- no provider calls
- no business decisions

### 7. Shared layer
Small cross-cutting primitives only.

Examples:
- errors
- result types
- time helpers
- schema helpers

Keep this layer tiny. It must not become a junk drawer.

---

## Canonical folder layout

`threads-cli` should converge toward this layout:

```text
src/
  cli.ts
  app/
    commands/
      auth/
        login.command.ts
        exchange.command.ts
        import.command.ts
        logout.command.ts
        status.command.ts
      posts/
        list.command.ts
        create.command.ts
        delete.command.ts
      profiles/
        me.command.ts
        user.command.ts
      doctor/
        doctor.command.ts
    use-cases/
      auth/
      posts/
      profiles/
      doctor/
    ports/
      auth-store.port.ts
      threads-api.port.ts
      output.port.ts
  domain/
    auth/
    posts/
    profiles/
    shared/
  infra/
    config/
    auth/
    api/
      threads-http.client.ts
      oauth.client.ts
    storage/
      local-profile.store.ts
    testing/
      fake-threads-api.ts
  presentation/
    text/
    json/
  shared/
    errors/
    result/
    utils/
```

---

## Boundary rules

### Command -> Application
Commands may depend on use-cases only.

### Application -> Domain + Ports
Use-cases coordinate domain behavior and call ports.

### Infrastructure -> Ports
Infra implements the ports. It does not define business rules.

### Presentation -> Application result DTOs
Renderers format outputs from use-cases.

### Domain
Domain must be import-safe and provider-agnostic.

---

## threads-cli domain map

### Auth subdomain
- `OAuthClientConfig`
- `StoredProfileAuth`
- `AuthStatus`
- policies for required scopes / token presence / expiry interpretation

### Profile subdomain
- `Profile`
- `UserLookupQuery`

### Post subdomain
- `Post`
- `PostDraft`
- `PostDeletionResult`
- pagination contracts

### Diagnostics subdomain
- `DoctorCheck`
- `DoctorReport`

---

## Port model for threads-cli

Target ports:

- `ThreadsApiPort`
  - `getCurrentProfile()`
  - `getUserProfile(query)`
  - `listPosts(input)`
  - `createTextPost(input)`
  - `deletePost(input)`

- `ThreadsOAuthPort`
  - `buildAuthorizationUrl(input)`
  - `exchangeCode(input)`

- `AuthStorePort`
  - `readActiveProfile()`
  - `writeProfileAuth()`
  - `clearProfileAuth()`
  - `listProfiles()`

- `DoctorPort`
  - adapter-facing checks for config/runtime state

---

## Migration from current structure

Current `src/lib/*` can be migrated gradually:

- `lib/auth-*.ts` -> `app/use-cases/auth/*`
- `lib/posts.ts` -> split into `app/use-cases/posts/*` + `domain/posts/*`
- `lib/me.ts` -> `app/use-cases/profiles/*`
- `lib/api/*` -> `infra/api/*` and `infra/auth/*`
- `lib/config.ts` -> `infra/config/*`
- `lib/output/*` -> `presentation/text/*`
- `lib/errors.ts` -> `shared/errors/*`

Do not big-bang rewrite unless necessary. Move by command slice.

---

## Test strategy by layer

- **domain tests**: pure and fast
- **use-case tests**: ports mocked/faked
- **infra tests**: adapter-specific behavior
- **command tests**: argv -> DTO mapping
- **presentation tests**: formatter snapshots/string assertions

---

## Definition of architectural done

A command is considered well-structured when:

1. CLI parsing lives in `app/commands/*`
2. orchestration lives in one use-case
3. provider access happens only through a port
4. output rendering lives in `presentation/*`
5. no business logic is hidden in the CLI shell or HTTP client
