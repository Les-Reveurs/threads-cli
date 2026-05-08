import type { ThreadsInsight, ThreadsInsightsResult } from '../../domain/insights/insight.js'
import { buildInsightSummary, type ThreadsInsightSummary } from '../text/insight-summary.js'

export type JsonThreadsInsight = ThreadsInsight & {
  summary?: ThreadsInsightSummary
}

export type JsonThreadsInsightsResult = {
  data: JsonThreadsInsight[]
  paging?: ThreadsInsightsResult['paging']
}

const serializeInsight = (insight: ThreadsInsight): JsonThreadsInsight => {
  const summary = buildInsightSummary(insight)
  return summary ? { ...insight, summary } : { ...insight }
}

export const serializeInsightsResult = (result: ThreadsInsightsResult): JsonThreadsInsightsResult => ({
  data: result.data.map(serializeInsight),
  ...(result.paging ? { paging: result.paging } : {}),
})
