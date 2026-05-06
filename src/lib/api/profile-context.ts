import { loadConfig, type ThreadsProfileConfig } from '../config.js'
import { ensureValue } from '../errors.js'

export type ActiveProfileContext = {
  profileName: string
  profile: ThreadsProfileConfig
}

export const getActiveProfileContext = async (): Promise<ActiveProfileContext> => {
  const config = await loadConfig()
  const profileName = config.activeProfile || 'default'
  const profile = config.profiles[profileName] || {}

  return { profileName, profile }
}

export const requireAccessTokenProfile = async (): Promise<ActiveProfileContext> => {
  const context = await getActiveProfileContext()

  ensureValue(
    context.profile.accessToken,
    'access token is required; run `threads auth login` + `threads auth exchange --code <code>` first',
    'missing_access_token',
  )

  return context
}
