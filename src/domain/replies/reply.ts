export type ThreadsReply = {
  id: string
  text?: string
  username?: string
  timestamp?: string
  media_type?: string
  permalink?: string
  hide_status?: boolean
  reply_audience?: string
}

export type ThreadsRepliesListResult = {
  data: ThreadsReply[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
  }
}

export const DEFAULT_REPLY_FIELDS = [
  'id',
  'text',
  'username',
  'timestamp',
  'media_type',
  'permalink',
  'hide_status',
  'reply_audience',
]

export type ManageReplyResult = {
  id: string
  hidden: boolean
  success: boolean
}
