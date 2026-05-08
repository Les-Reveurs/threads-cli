import { normalizeInsightBreakdowns, type ThreadsInsight } from '../../domain/insights/insight.js'

export type ThreadsInsightSummary = {
  summary: string
  topBreakdown?: string
}

const insightPrimaryValue = (insight: ThreadsInsight): unknown => insight.total_value?.value ?? insight.values?.[0]?.value

export const buildInsightSummary = (insight: ThreadsInsight): ThreadsInsightSummary | null => {
  const value = insightPrimaryValue(insight)

  if (insight.name === 'views' && typeof value === 'number') {
    return { summary: `${value} views` }
  }

  if (insight.name === 'likes' && typeof value === 'number') {
    return { summary: `${value} likes` }
  }

  if (insight.name === 'replies' && typeof value === 'number') {
    return { summary: `${value} replies` }
  }

  if (insight.name === 'clicks' && typeof value === 'number') {
    return { summary: `${value} clicks` }
  }

  if (insight.name === 'reposts' && typeof value === 'number') {
    return { summary: `${value} reposts` }
  }

  if (insight.name === 'quotes' && typeof value === 'number') {
    return { summary: `${value} quotes` }
  }

  if (insight.name === 'shares' && typeof value === 'number') {
    return { summary: `${value} shares` }
  }

  if (insight.name === 'followers_count' && typeof value === 'number') {
    const top = normalizeInsightBreakdowns(insight.total_value?.breakdowns)
      .flatMap((breakdown) => breakdown.results)
      .filter((entry) => typeof entry.value === 'number')
      .sort((left, right) => Number(right.value) - Number(left.value))[0]

    return {
      summary: `${value} followers`,
      topBreakdown: top ? `${top.dimensionValues.join(', ') || '-'} = ${top.value}` : '-',
    }
  }

  return null
}
