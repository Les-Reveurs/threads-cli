import { API_BASE_URL } from './constants.js'
import { readFakeApiPayload } from './fake-payload.js'
import { requireAccessTokenProfile } from './profile-context.js'
import { ensureValue, ThreadsCliError } from '../errors.js'

const buildUrl = (path: string, query?: Record<string, string | undefined>): string => {
  const url = new URL(path, `${API_BASE_URL}/`)

  for (const [key, value] of Object.entries(query || {})) {
    if (value) {
      url.searchParams.set(key, value)
    }
  }

  return url.toString()
}

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const withAccessToken = async (query?: Record<string, string | undefined>) => {
  const { profile } = await requireAccessTokenProfile()
  const accessToken = ensureValue(profile.accessToken, 'access token missing', 'missing_access_token')

  return { ...query, access_token: accessToken }
}

export const fetchThreadsApi = async <T>(path: string, query?: Record<string, string | undefined>): Promise<T> => {
  const fakePayload = readFakeApiPayload<T>()
  if (fakePayload !== undefined) {
    return fakePayload
  }

  const url = buildUrl(path, await withAccessToken(query))
  const response = await fetch(url)
  const payload = await parseJson(response)

  if (!response.ok) {
    throw new ThreadsCliError(
      'api_error',
      (payload as { error?: { message?: string } } | null)?.error?.message || `Threads API request failed with status ${response.status}`,
    )
  }

  return payload as T
}

export const mutateThreadsApi = async <T>(path: string, options: {
  method: 'POST' | 'DELETE'
  query?: Record<string, string | undefined>
}): Promise<T> => {
  const fakePayload = readFakeApiPayload<T>()
  if (fakePayload !== undefined) {
    return fakePayload
  }

  const url = buildUrl(path, await withAccessToken(options.query))
  const response = await fetch(url, {
    method: options.method,
  })
  const payload = await parseJson(response)

  if (!response.ok) {
    throw new ThreadsCliError(
      'api_error',
      (payload as { error?: { message?: string } } | null)?.error?.message || `Threads API request failed with status ${response.status}`,
    )
  }

  return payload as T
}
