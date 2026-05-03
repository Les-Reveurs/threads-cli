import { fetchThreadsApi, mutateThreadsApi } from './threads-api.js'
import { getCurrentProfile } from './me.js'

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

const DEFAULT_POST_FIELDS = [
  'id',
  'text',
  'media_type',
  'media_product_type',
  'permalink',
  'shortcode',
  'timestamp',
  'username',
]

export const listPosts = async (limit?: number, after?: string): Promise<ThreadsPostsListResult> => {
  const profile = await getCurrentProfile()

  return fetchThreadsApi<ThreadsPostsListResult>(`${profile.id}/threads`, {
    fields: DEFAULT_POST_FIELDS.join(','),
    limit: limit ? String(limit) : undefined,
    after,
  })
}

export const deletePost = async (id: string): Promise<{ id: string, deleted: boolean }> => {
  await mutateThreadsApi(id, { method: 'DELETE' })
  return { id, deleted: true }
}

export const createTextPost = async (text: string): Promise<{ id: string, creationId: string }> => {
  const profile = await getCurrentProfile()

  const creation = await mutateThreadsApi<{ id: string }>(`${profile.id}/threads`, {
    method: 'POST',
    query: {
      media_type: 'TEXT',
      text,
    },
  })

  const published = await mutateThreadsApi<{ id: string }>(`${profile.id}/threads_publish`, {
    method: 'POST',
    query: {
      creation_id: creation.id,
    },
  })

  return {
    id: published.id,
    creationId: creation.id,
  }
}
