import type { ThreadsApiPort } from '../../ports/threads-api.port.js'
import type { ThreadsPostsListResult } from '../../../domain/posts/post.js'

export const listPosts = async (api: ThreadsApiPort, limit?: number, after?: string): Promise<ThreadsPostsListResult> => {
  return api.listPosts(limit, after)
}
