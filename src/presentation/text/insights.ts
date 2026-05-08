import pc from 'picocolors'
import type { ThreadsInsight, ThreadsInsightsResult } from '../../domain/insights/insight.js'

const stringifyValue = (value: unknown): string => {
  if (value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

const renderBreakdowns = (breakdowns: unknown): string[] => {
  if (!Array.isArray(breakdowns) || breakdowns.length === 0) return ['  breakdowns: -']

  const lines = ['  breakdowns:']

  for (const breakdown of breakdowns) {
    const item = asRecord(breakdown)
    if (!item) {
      lines.push(`    - ${stringifyValue(breakdown)}`)
      continue
    }

    const dimensionKeys = Array.isArray(item.dimension_keys)
      ? item.dimension_keys.map((value) => String(value))
      : []
    const results = Array.isArray(item.results) ? item.results : []

    if (results.length === 0) {
      lines.push(`    - dimensions: ${dimensionKeys.join(', ') || '-'}`)
      continue
    }

    lines.push(`    - dimensions: ${dimensionKeys.join(', ') || '-'}`)

    for (const result of results) {
      const resultRecord = asRecord(result)
      if (!resultRecord) {
        lines.push(`      value: ${stringifyValue(result)}`)
        continue
      }

      const dimensionValues = Array.isArray(resultRecord.dimension_values)
        ? resultRecord.dimension_values.map((value) => String(value)).join(', ')
        : '-'
      lines.push(`      - ${dimensionValues}: ${stringifyValue(resultRecord.value)}`)
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

const renderInsightLine = (insight: ThreadsInsight): string => [
  `- metric: ${insight.name}`,
  `  period: ${insight.period ?? '-'}`,
  `  title: ${insight.title ?? '-'}`,
  `  description: ${insight.description ?? '-'}`,
  `  value: ${stringifyValue(insight.total_value?.value ?? insight.values?.[0]?.value)}`,
  `  total_value: ${stringifyValue(insight.total_value?.value)}`,
  `  values: ${renderValues(insight)}`,
  ...renderBreakdowns(insight.total_value?.breakdowns),
].join('\n')

export const renderInsights = (label: string, result: ThreadsInsightsResult): string => [
  pc.green(`${label}: ${result.data.length} metric(s)`),
  ...result.data.map(renderInsightLine),
  `next: ${result.paging?.next ?? '-'}`,
].join('\n')
