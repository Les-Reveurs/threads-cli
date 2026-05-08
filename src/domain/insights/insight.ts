export type ThreadsPostInsightMetricName = 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'shares'
export type ThreadsUserInsightMetricName = 'views' | 'likes' | 'replies' | 'reposts' | 'quotes' | 'clicks' | 'followers_count'
export type ThreadsInsightMetricName = ThreadsPostInsightMetricName | ThreadsUserInsightMetricName | string

export type ThreadsInsightPrimitiveValue = number | string
export type ThreadsInsightObjectValue = Record<string, unknown>
export type ThreadsInsightAnyValue = ThreadsInsightPrimitiveValue | ThreadsInsightObjectValue

export type ThreadsInsightValue = {
  value?: ThreadsInsightAnyValue
  end_time?: string
}

export type ThreadsInsightBreakdownResult = {
  dimensionValues: string[]
  value?: ThreadsInsightAnyValue
}

export type ThreadsInsightBreakdown = {
  dimensionKeys: string[]
  results: ThreadsInsightBreakdownResult[]
}

export type ThreadsInsightTotalValue = {
  value?: ThreadsInsightAnyValue
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

const asString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined
  return String(value)
}

const asValue = (value: unknown): ThreadsInsightAnyValue | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string' || typeof value === 'number') return value
  const record = asRecord(value)
  return record
}

const toStringArray = (value: unknown): string[] => Array.isArray(value)
  ? value.map((entry) => String(entry))
  : []

const withDefined = <T extends Record<string, unknown>>(value: T): T => Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T

const normalizeInsightValues = (value: unknown): ThreadsInsightValue[] | undefined => {
  if (!Array.isArray(value)) return undefined

  return value.map((entry) => {
    const record = asRecord(entry)
    return withDefined({
      value: asValue(record?.value),
      end_time: asString(record?.end_time),
    })
  })
}

export const normalizeInsightBreakdowns = (value: unknown): ThreadsInsightBreakdown[] => {
  if (!Array.isArray(value)) return []

  return value.map((entry) => {
    const record = asRecord(entry)
    const results = Array.isArray(record?.results)
      ? record.results.map((result) => {
        const resultRecord = asRecord(result)
        return withDefined({
          dimensionValues: toStringArray(resultRecord?.dimension_values ?? resultRecord?.dimensionValues),
          value: asValue(resultRecord?.value),
        })
      })
      : []

    return withDefined({
      dimensionKeys: toStringArray(record?.dimension_keys ?? record?.dimensionKeys),
      results,
    })
  })
}

const normalizeInsightTotalValue = (value: unknown): ThreadsInsightTotalValue | undefined => {
  const record = asRecord(value)
  if (!record) return undefined

  const breakdowns = Array.isArray(record.breakdowns) ? normalizeInsightBreakdowns(record.breakdowns) : undefined
  const normalized = withDefined({
    value: asValue(record.value),
    breakdowns,
  })

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

const normalizeInsightRecord = (value: unknown): ThreadsInsight => {
  const record = asRecord(value)

  return withDefined({
    name: asString(record?.name) ?? 'unknown',
    period: asString(record?.period),
    title: asString(record?.title),
    description: asString(record?.description),
    id: asString(record?.id),
    values: normalizeInsightValues(record?.values),
    total_value: normalizeInsightTotalValue(record?.total_value),
  })
}

export const normalizeInsightsResult = (value: unknown): ThreadsInsightsResult => {
  const record = asRecord(value)
  const data = Array.isArray(record?.data) ? record.data.map(normalizeInsightRecord) : []
  const pagingRecord = asRecord(record?.paging)

  const paging = pagingRecord
    ? {
        previous: asString(pagingRecord.previous),
        next: asString(pagingRecord.next),
      }
    : undefined

  return {
    data,
    ...(paging ? { paging: withDefined(paging) } : {}),
  }
}

export const DEFAULT_POST_INSIGHT_METRICS: ThreadsPostInsightMetricName[] = ['views', 'likes', 'replies', 'reposts', 'quotes', 'shares']
export const DEFAULT_USER_INSIGHT_METRICS: ThreadsUserInsightMetricName[] = ['views', 'likes', 'replies', 'reposts', 'quotes', 'clicks', 'followers_count']

export const isSupportedPostInsightMetric = (metric: string): metric is ThreadsPostInsightMetricName => DEFAULT_POST_INSIGHT_METRICS.includes(metric as ThreadsPostInsightMetricName)
export const isSupportedUserInsightMetric = (metric: string): metric is ThreadsUserInsightMetricName => DEFAULT_USER_INSIGHT_METRICS.includes(metric as ThreadsUserInsightMetricName)
