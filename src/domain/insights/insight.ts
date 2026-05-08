export type ThreadsPostInsightMetricName = 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'shares'
export type ThreadsUserInsightMetricName = 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'clicks' | 'followers_count'
export type ThreadsInsightMetricName = ThreadsPostInsightMetricName | ThreadsUserInsightMetricName | string

export type ThreadsInsightPrimitiveValue = number | string

export type ThreadsInsightValue = {
  value?: ThreadsInsightPrimitiveValue | Record<string, unknown>
  end_time?: string
}

export type ThreadsInsightBreakdownResult = {
  dimensionValues: string[]
  value?: ThreadsInsightPrimitiveValue | Record<string, unknown>
}

export type ThreadsInsightBreakdown = {
  dimensionKeys: string[]
  results: ThreadsInsightBreakdownResult[]
}

export type ThreadsInsightTotalValue = {
  value?: ThreadsInsightPrimitiveValue | Record<string, unknown>
  breakdowns?: ThreadsInsightBreakdown[]
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

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

const toStringArray = (value: unknown): string[] => Array.isArray(value)
  ? value.map((entry) => String(entry))
  : []

export const normalizeInsightBreakdowns = (value: unknown): ThreadsInsightBreakdown[] => {
  if (!Array.isArray(value)) return []

  return value.map((entry) => {
    const record = asRecord(entry)
    const results = Array.isArray(record?.results)
      ? record.results.map((result) => {
        const resultRecord = asRecord(result)
        return {
          dimensionValues: toStringArray(resultRecord?.dimension_values),
          value: resultRecord?.value as ThreadsInsightBreakdownResult['value'],
        }
      })
      : []

    return {
      dimensionKeys: toStringArray(record?.dimension_keys),
      results,
    }
  })
}

export const DEFAULT_POST_INSIGHT_METRICS: ThreadsPostInsightMetricName[] = ['views', 'likes', 'replies', 'reposts', 'quotes', 'shares']
export const DEFAULT_USER_INSIGHT_METRICS: ThreadsUserInsightMetricName[] = ['views', 'likes', 'replies', 'reposts', 'quotes', 'clicks', 'followers_count']

export const isSupportedPostInsightMetric = (metric: string): metric is ThreadsPostInsightMetricName => DEFAULT_POST_INSIGHT_METRICS.includes(metric as ThreadsPostInsightMetricName)
export const isSupportedUserInsightMetric = (metric: string): metric is ThreadsUserInsightMetricName => DEFAULT_USER_INSIGHT_METRICS.includes(metric as ThreadsUserInsightMetricName)
