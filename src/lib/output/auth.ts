import pc from 'picocolors'

import type { AuthStatus } from '../auth-status.js'
import type { AuthLoginResult } from '../auth-login.js'
import type { AuthLogoutResult } from '../auth-logout.js'
import type { AuthExchangeResult } from '../auth-exchange.js'
import type { AuthImportResult } from '../auth-import.js'

export const renderAuthStatus = (status: AuthStatus): string => {
  const headline = status.ok ? pc.green('auth status: ready') : pc.yellow(`auth status: ${status.code}`)

  return [
    headline,
    `profile: ${status.profile}`,
    `client_id: ${status.hasClientId ? 'set' : 'missing'}`,
    `access_token: ${status.hasAccessToken ? 'set' : 'missing'}`,
    `expires_at: ${status.expiresAt ?? '-'}`,
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

export const renderAuthImport = (result: AuthImportResult): string => {
  return [
    pc.green('auth import: done'),
    `profile: ${result.profile}`,
    `client_id: ${result.savedProfile.clientId ? 'set' : 'missing'}`,
    'access_token: set',
    `expires_at: ${result.savedProfile.accessTokenExpiresAt ?? '-'}`,
  ].join('\n')
}

export const renderAuthLogout = (result: AuthLogoutResult): string => {
  return [
    pc.green('auth logout: done'),
    `profile: ${result.profile}`,
    `cleared_tokens: ${result.cleared ? 'yes' : 'no'}`,
  ].join('\n')
}
