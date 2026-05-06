import { FileConfigStore } from '../infra/config/file-config.store.js'
import { ThreadsApiAdapter } from '../infra/api/threads-api.adapter.js'
import { getCurrentProfile as getCurrentProfileUseCase } from '../app/use-cases/profiles/get-current-profile.js'
import { getUserProfile as getUserProfileUseCase } from '../app/use-cases/profiles/get-user-profile.js'

export type { ThreadsProfile } from '../domain/profiles/profile.js'

const api = new ThreadsApiAdapter(new FileConfigStore())

export const getCurrentProfile = () => getCurrentProfileUseCase(api)
export const getUserProfile = (usernameOrId: string) => getUserProfileUseCase(api, usernameOrId)
