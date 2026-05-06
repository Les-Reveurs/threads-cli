import { toAuthStatus, type AuthStatus } from '../../../domain/auth/auth-status.js'
import type { ConfigStorePort } from '../../ports/config-store.port.js'

export const getAuthStatus = async (store: ConfigStorePort): Promise<AuthStatus> => {
  const config = await store.loadConfig()
  const profileName = config.activeProfile || 'default'
  return toAuthStatus(profileName, config.profiles[profileName])
}
