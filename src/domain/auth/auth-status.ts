import type { ThreadsProfileConfig } from '../../shared/types/config.js'

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

export const toAuthStatus = (profileName: string, profile?: ThreadsProfileConfig): AuthStatus => {
  const hasClientId = Boolean(profile?.clientId)
  const hasAccessToken = Boolean(profile?.accessToken || profile?.unofficialToken)
  const expired = profile?.authProvider === 'unofficial' ? false : isExpired(profile?.accessTokenExpiresAt)

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
