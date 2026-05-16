import type { ConfigStorePort } from '../../ports/config-store.port.js'
import type { ThreadsProfileConfig } from '../../../shared/types/config.js'

export type AuthUnofficialLoginInput = {
  profile?: string
  username?: string
  password?: string
  deviceId?: string
  token?: string
  userId?: string
}

export type AuthUnofficialLoginResult = {
  ok: boolean
  profile: string
  savedProfile: ThreadsProfileConfig
}

export const loginUnofficial = async (store: ConfigStorePort, input: AuthUnofficialLoginInput): Promise<AuthUnofficialLoginResult> => {
  const config = await store.loadConfig()
  const profileName = input.profile || config.activeProfile || 'default'
  const currentProfile = config.profiles[profileName] || {}

  const nextProfile: ThreadsProfileConfig = {
    ...currentProfile,
    authProvider: 'unofficial',
    username: input.username || currentProfile.username,
    password: input.password || currentProfile.password,
    deviceId: input.deviceId || currentProfile.deviceId,
    userId: input.userId || currentProfile.userId,
    unofficialToken: input.token || currentProfile.unofficialToken,
  }

  config.activeProfile = profileName
  config.profiles[profileName] = nextProfile
  await store.saveConfig(config)

  return {
    ok: true,
    profile: profileName,
    savedProfile: nextProfile,
  }
}
