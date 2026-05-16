import type { ConfigStorePort } from '../../ports/config-store.port.js'

export type AuthLogoutResult = {
  ok: boolean
  profile: string
  cleared: boolean
}

export const logoutAuth = async (store: ConfigStorePort): Promise<AuthLogoutResult> => {
  const config = await store.loadConfig()
  const profileName = config.activeProfile || 'default'
  const currentProfile = config.profiles[profileName] || {}
  const hadAnyAuth = Boolean(
    currentProfile.accessToken
    || currentProfile.refreshToken
    || currentProfile.accessTokenExpiresAt
    || currentProfile.unofficialToken
    || currentProfile.password
    || currentProfile.userId,
  )

  config.profiles[profileName] = {
    ...currentProfile,
    accessToken: undefined,
    refreshToken: undefined,
    accessTokenExpiresAt: undefined,
    unofficialToken: undefined,
    password: undefined,
    userId: undefined,
  }
  await store.saveConfig(config)

  return { ok: true, profile: profileName, cleared: hadAnyAuth }
}
