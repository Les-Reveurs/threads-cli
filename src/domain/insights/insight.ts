export type ThreadsPostInsightMetricName = 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'shares'
export type ThreadsUserInsightMetricName = 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'clicks' | 'followers_count'
export type ThreadsInsightMetricName = ThreadsPostInsightMetricName | ThreadsUserInsightMetricName | string

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

export const DEFAULT_POST_INSIGHT_METRICS: ThreadsPostInsightMetricName[] = ['views', 'likes', 'replies', 'reposts', 'quotes', 'shares']
export const DEFAULT_USER_INSIGHT_METRICS: ThreadsUserInsightMetricName[] = ['views', 'likes', 'replies', 'reposts', 'quotes', 'clicks', 'followers_count']

export const isSupportedPostInsightMetric = (metric: string): metric is ThreadsPostInsightMetricName => DEFAULT_POST_INSIGHT_METRICS.includes(metric as ThreadsPostInsightMetricName)
export const isSupportedUserInsightMetric = (metric: string): metric is ThreadsUserInsightMetricName => DEFAULT_USER_INSIGHT_METRICS.includes(metric as ThreadsUserInsightMetricName)
