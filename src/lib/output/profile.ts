import pc from 'picocolors'

import type { ThreadsProfile } from '../me.js'

export const renderProfile = (headline: string, profile: ThreadsProfile): string => {
  return [
    pc.green(headline),
    `id: ${profile.id}`,
    `username: ${profile.username ?? '-'}`,
    `name: ${profile.name ?? '-'}`,
    `bio: ${profile.threads_biography ?? '-'}`,
    `avatar: ${profile.threads_profile_picture_url ?? '-'}`,
  ].join('\n')
}
