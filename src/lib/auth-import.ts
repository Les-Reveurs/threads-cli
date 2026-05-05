import { loadConfig, saveConfig, type ThreadsProfileConfig } from './config.js'
import { ThreadsCliError } from './threads-api.js'

export type AuthImportInput = {
  profile?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  scopes?: string[]
}

export type AuthImportResult = {
  ok: boolean
  profile: string
  savedProfile: ThreadsProfileConfig
}

const normalizeScopes = (scopes?: string[]): string[] | undefined => {
  if (!scopes?.length) return undefined

  const values = scopes
    .flatMap((scope) => scope.split(','))
    .map((scope) => scope.trim())
    .filter(Boolean)

  return values.length ? [...new Set(values)] : undefined
}

const validateIsoTimestamp = (value?: string): string | undefined => {
  if (!value) return undefined

  if (Number.isNaN(Date.parse(value))) {
    throw new ThreadsCliError('invalid_expires_at', 'expires-at must be a valid ISO-8601 timestamp')
  }

  return value
}

export const importAuthToken = async (input: AuthImportInput): Promise<AuthImportResult> => {
  const config = await loadConfig()
  const profileName = input.profile || config.activeProfile || 'default'
  const currentProfile = config.profiles[profileName] || {}
  const accessToken = input.accessToken || process.env.THREADS_CLI_ACCESS_TOKEN || currentProfile.accessToken

  if (!accessToken) {
    throw new ThreadsCliError('missing_access_token', 'access token is required (pass --access-token or set THREADS_CLI_ACCESS_TOKEN)')
  }

  const nextProfile: ThreadsProfileConfig = {
    ...currentProfile,
    clientId: input.clientId || currentProfile.clientId || process.env.THREADS_CLI_CLIENT_ID,
    clientSecret: input.clientSecret || currentProfile.clientSecret || process.env.THREADS_CLI_CLIENT_SECRET,
    redirectUri: input.redirectUri || currentProfile.redirectUri || process.env.THREADS_CLI_REDIRECT_URI,
    scopes: normalizeScopes(input.scopes) || currentProfile.scopes,
    accessToken,
    refreshToken: input.refreshToken || currentProfile.refreshToken || process.env.THREADS_CLI_REFRESH_TOKEN,
    accessTokenExpiresAt: validateIsoTimestamp(input.expiresAt || currentProfile.accessTokenExpiresAt),
  }

  config.activeProfile = profileName
  config.profiles[profileName] = nextProfile
  await saveConfig(config)

  return {
    ok: true,
    profile: profileName,
    savedProfile: nextProfile,
  }
}
