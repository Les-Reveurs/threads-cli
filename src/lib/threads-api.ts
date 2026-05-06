export { CliError as ThreadsCliError, ensureValue } from '../shared/errors/cli-error.js'
import { FileConfigStore } from '../infra/config/file-config.store.js'
import { ThreadsApiAdapter } from '../infra/api/threads-api.adapter.js'
import { ThreadsOAuthAdapter } from '../infra/oauth/threads-oauth.adapter.js'

const store = new FileConfigStore()
const api = new ThreadsApiAdapter(store)
const oauth = new ThreadsOAuthAdapter()

export type { ActiveProfileContext } from '../infra/api/threads-api.adapter.js'
export const getActiveProfileContext = async () => api.getActiveProfileContext()
export const requireAccessTokenProfile = async () => api.requireAccessTokenProfile()
export const fetchThreadsApi = async <T>(path: string, query?: Record<string, string | undefined>) => api.fetchThreadsApi<T>(path, query)
export const mutateThreadsApi = async <T>(path: string, options: { method: 'POST' | 'DELETE', query?: Record<string, string | undefined> }) => api.mutateThreadsApi<T>(path, options)
export const exchangeAuthorizationCode = async (params: { clientId: string, clientSecret: string, redirectUri: string, code: string }) => oauth.exchangeAuthorizationCode(params)
