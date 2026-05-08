import type { ManageReplyResult } from '../../../domain/replies/reply.js'
import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const hideReply = async (api: ThreadsApiPort, replyId: string): Promise<ManageReplyResult> => {
  return api.manageReply(replyId, true)
}

export const unhideReply = async (api: ThreadsApiPort, replyId: string): Promise<ManageReplyResult> => {
  return api.manageReply(replyId, false)
}
