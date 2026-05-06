import { FileConfigStore } from '../infra/config/file-config.store.js'
import { ThreadsApiAdapter } from '../infra/api/threads-api.adapter.js'
import { listPosts as listPostsUseCase } from '../app/use-cases/posts/list-posts.js'
import { deletePost as deletePostUseCase } from '../app/use-cases/posts/delete-post.js'
import { createTextPost as createTextPostUseCase } from '../app/use-cases/posts/create-post.js'

export type { ThreadsPost, ThreadsPostsListResult } from '../domain/posts/post.js'

const api = new ThreadsApiAdapter(new FileConfigStore())

export const listPosts = (limit?: number, after?: string) => listPostsUseCase(api, limit, after)
export const deletePost = (id: string) => deletePostUseCase(api, id)
export const createTextPost = (text: string) => createTextPostUseCase(api, text)
