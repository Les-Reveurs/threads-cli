import type { ThreadsApiPort } from '../../ports/threads-api.port.js'
import type { ThreadsProfile } from '../../../domain/profiles/profile.js'

export const getCurrentProfile = async (api: ThreadsApiPort): Promise<ThreadsProfile> => {
  return api.getCurrentProfile()
}
