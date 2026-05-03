import pc from 'picocolors'

import type { AuthStatus } from './auth-status.js'
import type { AuthLoginResult } from './auth-login.js'
import type { AuthLogoutResult } from './auth-logout.js'
import type { DoctorReport } from './doctor.js'
import type { AuthExchangeResult } from './auth-exchange.js'
import type { ThreadsProfile } from './me.js'

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

export const renderAuthLogout = (result: AuthLogoutResult): string => {
  return [
    pc.green('auth logout: done'),
    `profile: ${result.profile}`,
    `cleared_tokens: ${result.cleared ? 'yes' : 'no'}`,
  ].join('\n')
}

export const renderAuthLogin = (result: AuthLoginResult): string => {
  return [
    pc.green('auth login: ready'),
    `profile: ${result.profile}`,
    `redirect_uri: ${result.redirectUri}`,
    `scopes: ${result.scopes.join(',')}`,
    `state: ${result.state}`,
    `authorize_url: ${result.authorizationUrl}`,
  ].join('\n')
}

export const renderAuthExchange = (result: AuthExchangeResult): string => {
  return [
    pc.green('auth exchange: done'),
    `profile: ${result.profile}`,
    `user_id: ${result.userId ?? '-'}`,
  ].join('\n')
}

export const renderProfile = (headline: string, profile: ThreadsProfile): string => {
  return [
    pc.green(headline),
    `id: ${profile.id}`,
    `username: ${profile.username ?? '-'}`,
    `name: ${profile.name ?? '-'}`,
    `bio: ${profile.threads_biography ?? '-'}`,
    `avatar: ${profile.threads_profile_picture_url ?? '-'}`,
  ].join('\n')
}
