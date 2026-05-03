import { loadConfig, type ThreadsProfileConfig } from './config.js'

const API_BASE_URL = 'https://graph.threads.net/v1.0'
const OAUTH_BASE_URL = 'https://graph.threads.net/oauth'

let fakeApiQueue: Array<unknown> | undefined

const shiftFakeApiPayload = (): unknown => {
  if (!fakeApiQueue) {
    const fakeQueue = process.env.THREADS_CLI_FAKE_API_QUEUE_JSON
    fakeApiQueue = fakeQueue ? JSON.parse(fakeQueue) as Array<unknown> : []
  }

  return fakeApiQueue.shift()
}

export class ThreadsCliError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ThreadsCliError'
    this.code = code
  }
}

export type ActiveProfileContext = {
  profileName: string
  profile: ThreadsProfileConfig
}

const ensureValue = (value: string | undefined, message: string, code: string): string => {
  if (!value) {
    throw new ThreadsCliError(code, message)
  }

  return value
}

export const getActiveProfileContext = async (): Promise<ActiveProfileContext> => {
  const config = await loadConfig()
  const profileName = config.activeProfile || 'default'
  const profile = config.profiles[profileName] || {}

  return { profileName, profile }
}

export const requireAccessTokenProfile = async (): Promise<ActiveProfileContext> => {
  const context = await getActiveProfileContext()

  ensureValue(context.profile.accessToken, 'access token is required; run `threads auth login` + `threads auth exchange --code <code>` first', 'missing_access_token')

  return context
}

const buildUrl = (path: string, query?: Record<string, string | undefined>): string => {
  const url = new URL(path, `${API_BASE_URL}/`)

  for (const [key, value] of Object.entries(query || {})) {
    if (value) {
      url.searchParams.set(key, value)
    }
  }

  return url.toString()
}

export const fetchThreadsApi = async <T>(path: string, query?: Record<string, string | undefined>): Promise<T> => {
  const queuedPayload = shiftFakeApiPayload()
  if (queuedPayload !== undefined) {
    return queuedPayload as T
  }

  const fakePayload = process.env.THREADS_CLI_FAKE_API_JSON
  if (fakePayload) {
    return JSON.parse(fakePayload) as T
  }

  const { profile } = await requireAccessTokenProfile()
  const accessToken = ensureValue(profile.accessToken, 'access token missing', 'missing_access_token')
  const url = buildUrl(path, { ...query, access_token: accessToken })

  const response = await fetch(url)
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ThreadsCliError(
      'api_error',
      payload?.error?.message || `Threads API request failed with status ${response.status}`,
    )
  }

  return payload as T
}

export const mutateThreadsApi = async <T>(path: string, options: {
  method: 'POST' | 'DELETE'
  query?: Record<string, string | undefined>
}): Promise<T> => {
  const queuedPayload = shiftFakeApiPayload()
  if (queuedPayload !== undefined) {
    return queuedPayload as T
  }

  const fakePayload = process.env.THREADS_CLI_FAKE_API_JSON
  if (fakePayload) {
    return JSON.parse(fakePayload) as T
  }

  const { profile } = await requireAccessTokenProfile()
  const accessToken = ensureValue(profile.accessToken, 'access token missing', 'missing_access_token')
  const url = buildUrl(path, { ...options.query, access_token: accessToken })

  const response = await fetch(url, {
    method: options.method,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ThreadsCliError(
      'api_error',
      payload?.error?.message || `Threads API request failed with status ${response.status}`,
    )
  }

  return payload as T
}

export const exchangeAuthorizationCode = async (params: {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}): Promise<{ access_token: string, token_type?: string, user_id?: number }> => {
  const fakePayload = process.env.THREADS_CLI_FAKE_OAUTH_EXCHANGE_JSON
  if (fakePayload) {
    return JSON.parse(fakePayload) as { access_token: string, token_type?: string, user_id?: number }
  }

  const response = await fetch(`${OAUTH_BASE_URL}/access_token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: params.redirectUri,
      code: params.code,
    }),
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ThreadsCliError(
      'oauth_exchange_failed',
      payload?.error?.message || `OAuth exchange failed with status ${response.status}`,
    )
  }

  return payload as { access_token: string, token_type?: string, user_id?: number }
}
