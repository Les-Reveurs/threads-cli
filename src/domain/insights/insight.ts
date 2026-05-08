export type ThreadsInsightMetricName = string

export type ThreadsInsightValue = {
  value?: number | string | Record<string, unknown>
  end_time?: string
}

export type ThreadsInsightTotalValue = {
  value?: number | string | Record<string, unknown>
  breakdowns?: Array<Record<string, unknown>>
}

export type ThreadsInsight = {
  name: ThreadsInsightMetricName
  period?: string
  title?: string
  description?: string
  id?: string
  values?: ThreadsInsightValue[]
  total_value?: ThreadsInsightTotalValue
}

export type ThreadsInsightsResult = {
  data: ThreadsInsight[]
  paging?: {
    previous?: string
    next?: string
  }
}

export const DEFAULT_POST_INSIGHT_METRICS = ['views', 'likes', 'replies', 'reposts', 'quotes', 'shares']
export const DEFAULT_USER_INSIGHT_METRICS = ['views', 'likes', 'replies', 'reposts', 'quotes', 'clicks', 'followers_count']
