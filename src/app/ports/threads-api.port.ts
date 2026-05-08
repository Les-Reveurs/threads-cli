import type { CreatePostInput, CreatePostResult } from '../../domain/posts/create-post.js'
import type { ThreadsPostsListResult } from '../../domain/posts/post.js'
import type { ThreadsProfile } from '../../domain/profiles/profile.js'
import type { ThreadsInsightsResult } from '../../domain/insights/insight.js'
import type { ThreadsMentionsListResult } from '../../domain/mentions/mention.js'
import type { ManageReplyResult, ThreadsRepliesListResult } from '../../domain/replies/reply.js'

export interface ThreadsApiPort {
  getCurrentProfile(): Promise<ThreadsProfile>
  getUserProfile(usernameOrId: string): Promise<ThreadsProfile>
  listPosts(limit?: number, after?: string): Promise<ThreadsPostsListResult>
  createPost(input: CreatePostInput): Promise<CreatePostResult>
  listReplies(postId: string, after?: string): Promise<ThreadsRepliesListResult>
  listMentions(after?: string): Promise<ThreadsMentionsListResult>
  getPostInsights(postId: string, metrics?: string[]): Promise<ThreadsInsightsResult>
  getUserInsights(metrics?: string[], breakdown?: string): Promise<ThreadsInsightsResult>
  manageReply(replyId: string, hidden: boolean): Promise<ManageReplyResult>
  deletePost(id: string): Promise<{ id: string, deleted: boolean }>
}
