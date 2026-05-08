import type { CreatePostInput } from '../../../domain/posts/create-post.js'
import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const createPost = async (api: ThreadsApiPort, input: CreatePostInput) => {
  return api.createPost(input)
}
