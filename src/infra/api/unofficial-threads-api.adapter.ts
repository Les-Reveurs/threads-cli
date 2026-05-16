import threadsApiPkg from 'threads-api'

import type { ThreadsApiPort } from '../../app/ports/threads-api.port.js'
import type { ConfigStorePort } from '../../app/ports/config-store.port.js'
import { normalizeCreatePostInput, type CreatePostInput, type CreatePostResult } from '../../domain/posts/create-post.js'
import type { ThreadsMentionsListResult } from '../../domain/mentions/mention.js'
import type { ThreadsInsightsResult } from '../../domain/insights/insight.js'
import type { ThreadsPostsListResult, ThreadsPost } from '../../domain/posts/post.js'
import type { ThreadsProfile } from '../../domain/profiles/profile.js'
import type { ManageReplyResult, ThreadsRepliesListResult } from '../../domain/replies/reply.js'
import { CliError, ensureValue } from '../../shared/errors/cli-error.js'
import type { ThreadsProfileConfig } from '../../shared/types/config.js'

const { ThreadsAPI } = threadsApiPkg as { ThreadsAPI: any }

type UnofficialContext = {
  profileName: string
  profile: ThreadsProfileConfig
}

const isNumericId = (value: string) => /^\d+$/.test(value)

const mapProfile = (value: any): ThreadsProfile => ({
  id: String(value?.pk ?? value?.id ?? value?.user?.pk ?? ''),
  username: value?.username ?? value?.user?.username,
  name: value?.full_name ?? value?.name ?? value?.user?.full_name,
  threads_profile_picture_url: value?.profile_pic_url ?? value?.hd_profile_pic_url_info?.url,
  threads_biography: value?.biography,
})

const mapPost = (value: any): ThreadsPost => {
  const thread = value?.thread_items?.[0]?.post ?? value?.post ?? value
  const user = thread?.user ?? value?.user
  const code = thread?.code ?? value?.code
  return {
    id: String(thread?.pk ?? value?.pk ?? value?.id ?? ''),
    text: thread?.caption?.text ?? thread?.text_post_app_info?.caption?.text ?? value?.text,
    permalink: code ? `https://www.threads.net/t/${code}` : undefined,
    media_product_type: thread?.media_product_type,
    media_type: thread?.image_versions2 ? 'IMAGE' : thread?.video_versions ? 'VIDEO' : 'TEXT',
    timestamp: thread?.taken_at ? new Date(Number(thread.taken_at) * 1000).toISOString() : undefined,
    shortcode: code,
    username: user?.username,
  }
}

export class UnofficialThreadsApiAdapter implements ThreadsApiPort {
  constructor(private readonly store: ConfigStorePort) {}

  private async getContext(): Promise<UnofficialContext> {
    const config = await this.store.loadConfig()
    const profileName = config.activeProfile || 'default'
    const profile = config.profiles[profileName] || {}
    if (profile.authProvider !== 'unofficial') throw new CliError('unsupported_auth_provider', 'unofficial auth is not configured for the active profile')
    return { profileName, profile }
  }

  private async saveProfile(nextProfile: ThreadsProfileConfig) {
    const config = await this.store.loadConfig()
    const profileName = config.activeProfile || 'default'
    config.profiles[profileName] = nextProfile
    await this.store.saveConfig(config)
  }

  private async createClient() {
    const { profile } = await this.getContext()
    const username = ensureValue(profile.username, 'username is required; run `threads auth login-unofficial --username ... --password ...`', 'missing_username')
    const password = ensureValue(profile.password, 'password is required; run `threads auth login-unofficial --username ... --password ...`', 'missing_password')
    const client = new ThreadsAPI({
      username,
      password,
      deviceID: profile.deviceId,
      token: profile.unofficialToken,
      userID: profile.userId,
    })

    const token = await client.getToken()
    if (!token) throw new CliError('login_failed', 'failed to obtain unofficial Threads token')

    const userId = profile.userId || await client.getCurrentUserID()
    const nextProfile: ThreadsProfileConfig = {
      ...profile,
      authProvider: 'unofficial',
      deviceId: client.deviceID,
      unofficialToken: client.token,
      userId: userId || profile.userId,
      username,
      password,
    }
    await this.saveProfile(nextProfile)
    return { client, profile: nextProfile }
  }

  async getCurrentProfile(): Promise<ThreadsProfile> {
    const { client, profile } = await this.createClient()
    const userId = ensureValue(profile.userId, 'user id missing after unofficial login', 'missing_user_id')
    const response = await client.getUserProfileLoggedIn(userId)
    return mapProfile(response?.user ?? response)
  }

  async getUserProfile(usernameOrId: string): Promise<ThreadsProfile> {
    const { client } = await this.createClient()
    const userId = isNumericId(usernameOrId) ? usernameOrId : await client.getUserIDfromUsername(usernameOrId)
    if (!userId) throw new CliError('profile_not_found', `failed to resolve user id for ${usernameOrId}`)
    const profile = await client.getUserProfile(userId)
    return mapProfile(profile)
  }

  async listPosts(limit?: number, after?: string): Promise<ThreadsPostsListResult> {
    const { client, profile } = await this.createClient()
    const userId = ensureValue(profile.userId, 'user id missing after unofficial login', 'missing_user_id')
    const response = await client.getUserProfileThreadsLoggedIn(userId, after || '')
    const items = (response?.threads || response?.items || []).map(mapPost)
    return {
      data: typeof limit === 'number' ? items.slice(0, limit) : items,
      paging: response?.next_max_id ? { cursors: { after: response.next_max_id } } : undefined,
    }
  }

  async listProfilePosts(username: string, limit?: number): Promise<ThreadsPostsListResult> {
    const { client } = await this.createClient()
    const userId = await client.getUserIDfromUsername(username)
    if (!userId) throw new CliError('profile_not_found', `failed to resolve user id for ${username}`)
    const response = await client.getUserProfileThreads(userId)
    const items = (response || []).map(mapPost)
    return { data: typeof limit === 'number' ? items.slice(0, limit) : items }
  }

  async createPost(input: CreatePostInput): Promise<CreatePostResult> {
    const normalized = normalizeCreatePostInput(input)
    const { client } = await this.createClient()

    if (normalized.mediaType === 'VIDEO') {
      throw new CliError('unsupported_media_type', 'unofficial mode does not support video publish yet')
    }

    let id: string | undefined
    if (normalized.mediaType === 'TEXT') {
      id = await client.publish({ text: normalized.text, replyControl: normalized.replyControl })
    } else if (normalized.mediaType === 'IMAGE') {
      id = await client.publish({
        text: normalized.text,
        image: normalized.mediaUrl,
        replyControl: normalized.replyControl,
      })
    } else if (normalized.mediaType === 'CAROUSEL') {
      id = await client.publish({
        text: normalized.text,
        attachment: { sidecar: normalized.mediaUrls },
        replyControl: normalized.replyControl,
      })
    }

    if (!id) throw new CliError('publish_failed', 'unofficial publish failed')
    return { id, creationId: id, mediaType: normalized.mediaType }
  }

  async deletePost(id: string): Promise<{ id: string, deleted: boolean }> {
    const { client } = await this.createClient()
    const deleted = await client.delete(id)
    return { id, deleted: Boolean(deleted) }
  }

  async listReplies(postId: string, after?: string): Promise<ThreadsRepliesListResult> {
    const { client } = await this.createClient()
    const response = await client.getThreadsLoggedIn(postId, after || '')
    const items = (response?.reply_threads || []).map(mapPost)
    return {
      data: items as any,
      paging: response?.paging_tokens?.downward ? { cursors: { after: response.paging_tokens.downward } } : undefined,
    }
  }

  async listMentions(_after?: string): Promise<ThreadsMentionsListResult> {
    throw new CliError('unsupported_command', 'mentions are not supported in unofficial mode yet')
  }

  async getPostInsights(_postId: string, _metrics?: string[]): Promise<ThreadsInsightsResult> {
    throw new CliError('unsupported_command', 'insights are not supported in unofficial mode')
  }

  async getUserInsights(_metrics?: string[], _breakdown?: string): Promise<ThreadsInsightsResult> {
    throw new CliError('unsupported_command', 'insights are not supported in unofficial mode')
  }

  async manageReply(_replyId: string, _hidden: boolean): Promise<ManageReplyResult> {
    throw new CliError('unsupported_command', 'reply moderation is not supported in unofficial mode')
  }
}
