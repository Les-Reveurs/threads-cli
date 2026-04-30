# Official Threads API capabilities snapshot

This project targets the **official Threads API first**.

## Confirmed from Meta docs

The current public docs indicate support for:

- OAuth-based authorization and Threads user access tokens
- reading the current app-scoped profile
- reading public Threads profiles
- creating posts
  - text
  - image
  - video
  - carousel
  - quote posts
  - reposts
- deleting your own posts
- listing a user's posts
  - app-scoped user posts
  - public profile posts
- retrieving and managing replies to your own Threads
- mentions retrieval
- reply moderation
- keyword and topic-tag search
- insights
- webhooks for reply / mention / delete / publish notifications

## Product implication

`threads-cli` v1 should only expose commands backed by documented official API behavior.

## Recommended v1 surface

- `threads auth login`
- `threads auth status`
- `threads me`
- `threads post create`
- `threads post delete <id>`
- `threads posts list`
- `threads user <username|id>`
- `threads doctor`

## Deferred / conditional

These should stay out of the first MVP unless we verify enough value and API stability:

- feed/home-timeline style commands
- full unofficial browser/session mode
- advanced moderation flows in the first release
- media workflows beyond what official upload/publish flow supports cleanly

## Notes

This snapshot was derived from Meta Threads docs pages including:

- overview
- get-started
- create-posts
- delete-posts
- threads-profiles
- retrieve-and-discover-posts
- retrieve-and-manage-replies
- threads-mentions
- keyword-search
- insights
- webhooks
