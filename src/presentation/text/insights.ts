import pc from 'picocolors'
import { normalizeInsightBreakdowns, type ThreadsInsight, type ThreadsInsightsResult } from '../../domain/insights/insight.js'
import { buildInsightSummary } from './insight-summary.js'

const stringifyValue = (value: unknown): string => {
  if (value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const insightPrimaryValue = (insight: ThreadsInsight): unknown => insight.total_value?.value ?? insight.values?.[0]?.value

const renderBreakdowns = (insight: ThreadsInsight): string[] => {
  const breakdowns = normalizeInsightBreakdowns(insight.total_value?.breakdowns)
  if (breakdowns.length === 0) return ['  breakdowns: -']

  const lines = ['  breakdowns:']

  for (const breakdown of breakdowns) {
    lines.push(`    - dimensions: ${breakdown.dimensionKeys.join(', ') || '-'}`)

    if (breakdown.results.length === 0) continue

    for (const result of breakdown.results) {
      lines.push(`      - ${result.dimensionValues.join(', ') || '-'}: ${stringifyValue(result.value)}`)
    }
  }

  return lines
}

const renderValues = (insight: ThreadsInsight): string => {
  const values = insight.values
    ?.map((entry) => ({ value: entry.value, end_time: entry.end_time }))
    .filter((entry) => entry.value !== undefined) ?? []

  return values.length ? stringifyValue(values) : '-'
}

const renderSummary = (insight: ThreadsInsight): string[] => {
  const summary = buildInsightSummary(insight)
  if (!summary) return []

  return [
    `  summary: ${summary.summary}`,
    ...(summary.topBreakdown ? [`  top_breakdown: ${summary.topBreakdown}`] : []),
  ]
}

const renderInsightLine = (insight: ThreadsInsight): string => [
  `- metric: ${insight.name}`,
  `  period: ${insight.period ?? '-'}`,
  `  title: ${insight.title ?? '-'}`,
  `  description: ${insight.description ?? '-'}`,
  `  value: ${stringifyValue(insightPrimaryValue(insight))}`,
  `  total_value: ${stringifyValue(insight.total_value?.value)}`,
  `  values: ${renderValues(insight)}`,
  ...renderSummary(insight),
  ...renderBreakdowns(insight),
].join('\n')

export const renderInsights = (label: string, result: ThreadsInsightsResult): string => [
  pc.green(`${label}: ${result.data.length} metric(s)`),
  ...result.data.map(renderInsightLine),
  `next: ${result.paging?.next ?? '-'}`,
].join('\n')
