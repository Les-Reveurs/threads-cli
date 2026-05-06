import type { ThreadsPostsListResult } from '../../domain/posts/post.js'
import type { ThreadsProfile } from '../../domain/profiles/profile.js'

export interface ThreadsApiPort {
  getCurrentProfile(): Promise<ThreadsProfile>
  getUserProfile(usernameOrId: string): Promise<ThreadsProfile>
  listPosts(limit?: number, after?: string): Promise<ThreadsPostsListResult>
  createTextPost(text: string): Promise<{ id: string, creationId: string }>
  deletePost(id: string): Promise<{ id: string, deleted: boolean }>
}
