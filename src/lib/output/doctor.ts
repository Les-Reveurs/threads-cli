import pc from 'picocolors'

import type { DoctorReport } from '../doctor.js'

export const renderDoctorReport = (report: DoctorReport): string => {
  const headline = report.ok ? pc.green('doctor: ready') : pc.yellow('doctor: warnings found')
  const iconFor = (status: 'pass' | 'warn') => (status === 'pass' ? '✓' : '!')

  return [headline, ...report.checks.map((check) => `${iconFor(check.status)} ${check.message}`)].join('\n')
}
