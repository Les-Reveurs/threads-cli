import type { ThreadsApiPort } from '../../app/ports/threads-api.port.js'
import type { ConfigStorePort } from '../../app/ports/config-store.port.js'
import { ThreadsApiAdapter } from './threads-api.adapter.js'
import { UnofficialThreadsApiAdapter } from './unofficial-threads-api.adapter.js'

export class HybridThreadsApiAdapter implements ThreadsApiPort {
  private readonly official: ThreadsApiAdapter
  private readonly unofficial: UnofficialThreadsApiAdapter

  constructor(private readonly store: ConfigStorePort) {
    this.official = new ThreadsApiAdapter(store)
    this.unofficial = new UnofficialThreadsApiAdapter(store)
  }

  private async active(): Promise<ThreadsApiPort> {
    const config = await this.store.loadConfig()
    const profile = config.profiles[config.activeProfile || 'default'] || {}
    return profile.authProvider === 'unofficial' ? this.unofficial : this.official
  }

  async getCurrentProfile() { return (await this.active()).getCurrentProfile() }
  async getUserProfile(usernameOrId: string) { return (await this.active()).getUserProfile(usernameOrId) }
  async listPosts(limit?: number, after?: string) { return (await this.active()).listPosts(limit, after) }
  async listProfilePosts(username: string, limit?: number, after?: string) { return (await this.active()).listProfilePosts(username, limit, after) }
  async createPost(input: any) { return (await this.active()).createPost(input) }
  async listReplies(postId: string, after?: string) { return (await this.active()).listReplies(postId, after) }
  async listMentions(after?: string) { return (await this.active()).listMentions(after) }
  async getPostInsights(postId: string, metrics?: string[]) { return (await this.active()).getPostInsights(postId, metrics) }
  async getUserInsights(metrics?: string[], breakdown?: string) { return (await this.active()).getUserInsights(metrics, breakdown) }
  async manageReply(replyId: string, hidden: boolean) { return (await this.active()).manageReply(replyId, hidden) }
  async deletePost(id: string) { return (await this.active()).deletePost(id) }
}
