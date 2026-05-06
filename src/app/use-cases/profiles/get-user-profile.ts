import type { ThreadsApiPort } from '../../ports/threads-api.port.js'
import type { ThreadsProfile } from '../../../domain/profiles/profile.js'

export const getUserProfile = async (api: ThreadsApiPort, usernameOrId: string): Promise<ThreadsProfile> => {
  return api.getUserProfile(usernameOrId)
}
