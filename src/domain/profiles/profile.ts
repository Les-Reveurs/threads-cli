export type ThreadsProfile = {
  id: string
  username?: string
  name?: string
  threads_profile_picture_url?: string
  threads_biography?: string
}

export const DEFAULT_PROFILE_FIELDS = ['id', 'username', 'name', 'threads_profile_picture_url', 'threads_biography']
