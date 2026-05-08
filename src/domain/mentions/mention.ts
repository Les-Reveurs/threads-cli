export type ThreadsMention = {
  id: string
  text?: string
  username?: string
  timestamp?: string
  media_type?: string
  permalink?: string
}

export type ThreadsMentionsListResult = {
  data: ThreadsMention[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
  }
}

export const DEFAULT_MENTION_FIELDS = [
  'id',
  'text',
  'username',
  'timestamp',
  'media_type',
  'permalink',
]
