import type { ThreadsInsightsResult } from '../../../domain/insights/insight.js'
import type { ThreadsApiPort } from '../../ports/threads-api.port.js'

export const getUserInsights = async (api: ThreadsApiPort, metrics?: string[], breakdown?: string): Promise<ThreadsInsightsResult> => {
  return api.getUserInsights(metrics, breakdown)
}
