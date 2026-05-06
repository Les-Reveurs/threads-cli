import pc from 'picocolors'
import type { ThreadsPost, ThreadsPostsListResult } from '../../domain/posts/post.js'

const renderPostLine = (post: ThreadsPost): string => [
  `- id: ${post.id}`,
  `  text: ${post.text ?? '-'}`,
  `  media_type: ${post.media_type ?? '-'}`,
  `  permalink: ${post.permalink ?? '-'}`,
  `  timestamp: ${post.timestamp ?? '-'}`,
].join('\n')

export const renderPostsList = (result: ThreadsPostsListResult): string => [
  pc.green(`posts list: ${result.data.length} item(s)`),
  ...result.data.map(renderPostLine),
  `next_after: ${result.paging?.cursors?.after ?? '-'}`,
].join('\n')

export const renderPostDeleted = (id: string): string => [pc.green('post delete: done'), `id: ${id}`].join('\n')
export const renderPostCreated = (id: string, creationId: string): string => [pc.green('post create: done'), `id: ${id}`, `creation_id: ${creationId}`].join('\n')
