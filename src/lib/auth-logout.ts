import { loadConfig, saveConfig } from './config.js'

export type AuthLogoutResult = {
  ok: boolean
  profile: string
  cleared: boolean
}

export const logoutAuth = async (): Promise<AuthLogoutResult> => {
  const config = await loadConfig()
  const profileName = config.activeProfile || 'default'
  const currentProfile = config.profiles[profileName] || {}
  const hadAnyAuth = Boolean(
    currentProfile.accessToken
      || currentProfile.refreshToken
      || currentProfile.accessTokenExpiresAt,
  )

  config.profiles[profileName] = {
    ...currentProfile,
    accessToken: undefined,
    refreshToken: undefined,
    accessTokenExpiresAt: undefined,
  }

  await saveConfig(config)

  return {
    ok: true,
    profile: profileName,
    cleared: hadAnyAuth,
  }
}
