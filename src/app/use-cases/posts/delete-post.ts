import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const deletePost = async (api: ThreadsApiPort, id: string) => {
  return api.deletePost(id)
}
