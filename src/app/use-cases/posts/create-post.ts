import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const createTextPost = async (api: ThreadsApiPort, text: string) => {
  return api.createTextPost(text)
}
