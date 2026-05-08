import type { ThreadsRepliesListResult } from '../../../domain/replies/reply.js'
import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const listReplies = async (api: ThreadsApiPort, postId: string, after?: string): Promise<ThreadsRepliesListResult> => {
  return api.listReplies(postId, after)
}
