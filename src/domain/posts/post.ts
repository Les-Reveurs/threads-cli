export type ThreadsPost = {
  id: string
  text?: string
  permalink?: string
  media_product_type?: string
  media_type?: string
  timestamp?: string
  shortcode?: string
  username?: string
}

export type ThreadsPostsListResult = {
  data: ThreadsPost[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
  }
}

export const DEFAULT_POST_FIELDS = [
  'id',
  'text',
  'media_type',
  'media_product_type',
  'permalink',
  'shortcode',
  'timestamp',
  'username',
]
