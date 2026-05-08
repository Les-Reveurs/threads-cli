import type { ThreadsApiPort } from '../../ports/threads-api.port.js'
import type { ThreadsPostsListResult } from '../../../domain/posts/post.js'

export const listPosts = async (api: ThreadsApiPort, limit?: number, after?: string, username?: string): Promise<ThreadsPostsListResult> => {
  if (username) return api.listProfilePosts(username, limit, after)
  return api.listPosts(limit, after)
}
