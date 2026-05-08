import type { ThreadsInsightsResult } from '../../../domain/insights/insight.js'
import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const getPostInsights = async (api: ThreadsApiPort, postId: string, metrics?: string[]): Promise<ThreadsInsightsResult> => {
  return api.getPostInsights(postId, metrics)
}
