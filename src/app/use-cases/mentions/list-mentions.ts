import type { ThreadsMentionsListResult } from '../../../domain/mentions/mention.js'
import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const listMentions = async (api: ThreadsApiPort, after?: string): Promise<ThreadsMentionsListResult> => {
  return api.listMentions(after)
}
