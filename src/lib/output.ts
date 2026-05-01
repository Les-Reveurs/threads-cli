import pc from 'picocolors'

import type { AuthStatus } from './auth-status.js'
import type { DoctorReport } from './doctor.js'

export const renderAuthStatus = (status: AuthStatus): string => {
  const headline = status.ok ? pc.green('auth status: ready') : pc.yellow(`auth status: ${status.code}`)
  const lines = [
    headline,
    `profile: ${status.profile}`,
    `client_id: ${status.hasClientId ? 'set' : 'missing'}`,
    `access_token: ${status.hasAccessToken ? 'set' : 'missing'}`,
    `expires_at: ${status.expiresAt ?? '-'}`,
  ]

  return lines.join('\n')
}

export const renderDoctorReport = (report: DoctorReport): string => {
  const headline = report.ok ? pc.green('doctor: ready') : pc.yellow('doctor: warnings found')
  const iconFor = (status: 'pass' | 'warn') => (status === 'pass' ? '✓' : '!')

  return [headline, ...report.checks.map((check) => `${iconFor(check.status)} ${check.message}`)].join('\n')
}
