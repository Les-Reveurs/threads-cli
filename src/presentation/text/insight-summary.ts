import { normalizeInsightBreakdowns, type ThreadsInsight } from '../../domain/insights/insight.js'

const insightPrimaryValue = (insight: ThreadsInsight): unknown => insight.total_value?.value ?? insight.values?.[0]?.value

export const buildInsightSummary = (insight: ThreadsInsight): string[] => {
  const value = insightPrimaryValue(insight)

  if (insight.name === 'views' && typeof value === 'number') {
    return [`summary: ${value} views`]
  }

  if (insight.name === 'likes' && typeof value === 'number') {
    return [`summary: ${value} likes`]
  }

  if (insight.name === 'replies' && typeof value === 'number') {
    return [`summary: ${value} replies`]
  }

  if (insight.name === 'followers_count' && typeof value === 'number') {
    const top = normalizeInsightBreakdowns(insight.total_value?.breakdowns)
      .flatMap((breakdown) => breakdown.results)
      .filter((entry) => typeof entry.value === 'number')
      .sort((left, right) => Number(right.value) - Number(left.value))[0]

    return [
      `summary: ${value} followers`,
      `top_breakdown: ${top ? `${top.dimensionValues.join(', ') || '-'} = ${top.value}` : '-'}`,
    ]
  }

  return []
}
