import type { CreatePostInput, CreatePostResult } from '../../domain/posts/create-post.js'
import type { ThreadsPostsListResult } from '../../domain/posts/post.js'
import type { ThreadsProfile } from '../../domain/profiles/profile.js'

export interface ThreadsApiPort {
  getCurrentProfile(): Promise<ThreadsProfile>
  getUserProfile(usernameOrId: string): Promise<ThreadsProfile>
  listPosts(limit?: number, after?: string): Promise<ThreadsPostsListResult>
  createPost(input: CreatePostInput): Promise<CreatePostResult>
  deletePost(id: string): Promise<{ id: string, deleted: boolean }>
}
