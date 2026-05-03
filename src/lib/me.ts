import { fetchThreadsApi } from './threads-api.js'

export type ThreadsProfile = {
  id: string
  username?: string
  name?: string
  threads_profile_picture_url?: string
  threads_biography?: string
}

const DEFAULT_FIELDS = ['id', 'username', 'name', 'threads_profile_picture_url', 'threads_biography']

export const getCurrentProfile = async (): Promise<ThreadsProfile> => {
  return fetchThreadsApi<ThreadsProfile>('me', {
    fields: DEFAULT_FIELDS.join(','),
  })
}

export const getUserProfile = async (usernameOrId: string): Promise<ThreadsProfile> => {
  return fetchThreadsApi<ThreadsProfile>(usernameOrId, {
    fields: DEFAULT_FIELDS.join(','),
  })
}
