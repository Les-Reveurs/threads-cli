import pc from 'picocolors'
import type { ThreadsInsight, ThreadsInsightsResult } from '../../domain/insights/insight.js'

const stringifyValue = (value: unknown): string => {
  if (value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const renderInsightLine = (insight: ThreadsInsight): string => {
  const values = insight.values?.map((entry) => ({ value: entry.value, end_time: entry.end_time })).filter((entry) => entry.value !== undefined) ?? []
  return [
    `- metric: ${insight.name}`,
    `  period: ${insight.period ?? '-'}`,
    `  title: ${insight.title ?? '-'}`,
    `  value: ${stringifyValue(insight.total_value?.value ?? insight.values?.[0]?.value)}`,
    `  total_value: ${stringifyValue(insight.total_value?.value)}`,
    `  values: ${values.length ? stringifyValue(values) : '-'}`,
  ].join('\n')
}

export const renderInsights = (label: string, result: ThreadsInsightsResult): string => [
  pc.green(`${label}: ${result.data.length} metric(s)`),
  ...result.data.map(renderInsightLine),
  `next: ${result.paging?.next ?? '-'}`,
].join('\n')
