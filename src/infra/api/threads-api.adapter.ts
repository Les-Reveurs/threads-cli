import type { ThreadsApiPort } from '../../app/ports/threads-api.port.js'
import type { ConfigStorePort } from '../../app/ports/config-store.port.js'
import { normalizeCreatePostInput, type CreatePostInput, type CreatePostResult } from '../../domain/posts/create-post.js'
import { DEFAULT_POST_FIELDS, type ThreadsPostsListResult } from '../../domain/posts/post.js'
import { DEFAULT_PROFILE_FIELDS, type ThreadsProfile } from '../../domain/profiles/profile.js'
import { API_BASE_URL } from './constants.js'
import { readFakeApiPayload } from '../testing/fake-payload.js'
import { ensureValue, CliError } from '../../shared/errors/cli-error.js'

export type ActiveProfileContext = {
  profileName: string
  profile: import('../../shared/types/config.js').ThreadsProfileConfig
}

const buildUrl = (path: string, query?: Record<string, string | undefined>): string => {
  const url = new URL(path, `${API_BASE_URL}/`)
  for (const [key, value] of Object.entries(query || {})) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export class ThreadsApiAdapter implements ThreadsApiPort {
  constructor(private readonly store: ConfigStorePort) {}

  async getActiveProfileContext(): Promise<ActiveProfileContext> {
    const config = await this.store.loadConfig()
    const profileName = config.activeProfile || 'default'
    const profile = config.profiles[profileName] || {}
    return { profileName, profile }
  }

  async requireAccessTokenProfile(): Promise<ActiveProfileContext> {
    const context = await this.getActiveProfileContext()
    ensureValue(context.profile.accessToken, 'access token is required; run `threads auth login` + `threads auth exchange --code <code>` first', 'missing_access_token')
    return context
  }

  private async withAccessToken(query?: Record<string, string | undefined>) {
    const { profile } = await this.requireAccessTokenProfile()
    const accessToken = ensureValue(profile.accessToken, 'access token missing', 'missing_access_token')
    return { ...query, access_token: accessToken }
  }

  async fetchThreadsApi<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
    const fakePayload = readFakeApiPayload<T>()
    if (fakePayload !== undefined) return fakePayload

    const url = buildUrl(path, await this.withAccessToken(query))
    const response = await fetch(url)
    const payload = await parseJson(response)
    if (!response.ok) {
      throw new CliError('api_error', (payload as { error?: { message?: string } } | null)?.error?.message || `Threads API request failed with status ${response.status}`)
    }
    return payload as T
  }

  async mutateThreadsApi<T>(path: string, options: { method: 'POST' | 'DELETE', query?: Record<string, string | undefined> }): Promise<T> {
    const fakePayload = readFakeApiPayload<T>()
    if (fakePayload !== undefined) return fakePayload

    const url = buildUrl(path, await this.withAccessToken(options.query))
    const response = await fetch(url, { method: options.method })
    const payload = await parseJson(response)
    if (!response.ok) {
      throw new CliError('api_error', (payload as { error?: { message?: string } } | null)?.error?.message || `Threads API request failed with status ${response.status}`)
    }
    return payload as T
  }

  async getCurrentProfile(): Promise<ThreadsProfile> {
    return this.fetchThreadsApi<ThreadsProfile>('me', { fields: DEFAULT_PROFILE_FIELDS.join(',') })
  }

  async getUserProfile(usernameOrId: string): Promise<ThreadsProfile> {
    return this.fetchThreadsApi<ThreadsProfile>(usernameOrId, { fields: DEFAULT_PROFILE_FIELDS.join(',') })
  }

  async listPosts(limit?: number, after?: string): Promise<ThreadsPostsListResult> {
    const profile = await this.getCurrentProfile()
    return this.fetchThreadsApi<ThreadsPostsListResult>(`${profile.id}/threads`, {
      fields: DEFAULT_POST_FIELDS.join(','),
      limit: limit ? String(limit) : undefined,
      after,
    })
  }

  async deletePost(id: string): Promise<{ id: string, deleted: boolean }> {
    await this.mutateThreadsApi(id, { method: 'DELETE' })
    return { id, deleted: true }
  }

  async createPost(input: CreatePostInput): Promise<CreatePostResult> {
    const profile = await this.getCurrentProfile()
    const normalized = normalizeCreatePostInput(input)

    const query: Record<string, string | undefined> = {
      media_type: normalized.mediaType,
      text: normalized.text,
      image_url: normalized.mediaType === 'IMAGE' ? normalized.mediaUrl : undefined,
      video_url: normalized.mediaType === 'VIDEO' ? normalized.mediaUrl : undefined,
      alt_text: normalized.altText,
      reply_to_id: normalized.replyToId,
      quote_post_id: normalized.quotePostId,
      reply_control: normalized.replyControl,
    }

    const creation = await this.mutateThreadsApi<{ id: string }>(`${profile.id}/threads`, { method: 'POST', query })
    const published = await this.mutateThreadsApi<{ id: string }>(`${profile.id}/threads_publish`, { method: 'POST', query: { creation_id: creation.id } })
    return { id: published.id, creationId: creation.id, mediaType: normalized.mediaType }
  }
}
