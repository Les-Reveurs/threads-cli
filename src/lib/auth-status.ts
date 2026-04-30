import { loadConfig, type ThreadsProfileConfig } from './config.js'

export type AuthStatusCode = 'ready' | 'missing_token' | 'expired_token'

export type AuthStatus = {
  ok: boolean
  code: AuthStatusCode
  profile: string
  hasClientId: boolean
  hasAccessToken: boolean
  expiresAt: string | null
  isExpired: boolean
}

const isExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return false

  return Date.parse(expiresAt) <= Date.now()
}

const toStatus = (profileName: string, profile?: ThreadsProfileConfig): AuthStatus => {
  const hasClientId = Boolean(profile?.clientId)
  const hasAccessToken = Boolean(profile?.accessToken)
  const expired = isExpired(profile?.accessTokenExpiresAt)

  if (!hasAccessToken) {
    return {
      ok: false,
      code: 'missing_token',
      profile: profileName,
      hasClientId,
      hasAccessToken,
      expiresAt: profile?.accessTokenExpiresAt ?? null,
      isExpired: false,
    }
  }

  if (expired) {
    return {
      ok: false,
      code: 'expired_token',
      profile: profileName,
      hasClientId,
      hasAccessToken,
      expiresAt: profile?.accessTokenExpiresAt ?? null,
      isExpired: true,
    }
  }

  return {
    ok: true,
    code: 'ready',
    profile: profileName,
    hasClientId,
    hasAccessToken,
    expiresAt: profile?.accessTokenExpiresAt ?? null,
    isExpired: false,
  }
}

export const getAuthStatus = async (): Promise<AuthStatus> => {
  const config = await loadConfig()
  const profileName = config.activeProfile || 'default'
  const profile = config.profiles[profileName]

  return toStatus(profileName, profile)
}
