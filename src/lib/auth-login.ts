import crypto from 'node:crypto'

import { loadConfig, saveConfig, type ThreadsProfileConfig } from './config.js'

export type AuthLoginInput = {
  profile?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  scopes?: string[]
}

export type AuthLoginResult = {
  ok: boolean
  profile: string
  authorizationUrl: string
  state: string
  redirectUri: string
  scopes: string[]
  savedProfile: ThreadsProfileConfig
}

const DEFAULT_REDIRECT_URI = 'https://localhost/callback'
const DEFAULT_SCOPES = ['threads_basic', 'threads_content_publish']
const AUTH_BASE_URL = 'https://threads.net/oauth/authorize'

const normalizeScopes = (scopes?: string[]): string[] => {
  const values = (scopes || DEFAULT_SCOPES)
    .flatMap((scope) => scope.split(','))
    .map((scope) => scope.trim())
    .filter(Boolean)

  return [...new Set(values)]
}

const buildAuthorizationUrl = (params: {
  clientId: string
  redirectUri: string
  scopes: string[]
  state: string
}): string => {
  const search = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: params.scopes.join(','),
    response_type: 'code',
    state: params.state,
  })

  return `${AUTH_BASE_URL}?${search.toString()}`
}

export const startAuthLogin = async (input: AuthLoginInput): Promise<AuthLoginResult> => {
  const config = await loadConfig()
  const profileName = input.profile || config.activeProfile || 'default'
  const currentProfile = config.profiles[profileName] || {}

  const clientId = input.clientId || currentProfile.clientId || process.env.THREADS_CLI_CLIENT_ID
  if (!clientId) {
    throw new Error('client id is required (pass --client-id or set THREADS_CLI_CLIENT_ID)')
  }

  const clientSecret = input.clientSecret || currentProfile.clientSecret || process.env.THREADS_CLI_CLIENT_SECRET
  const redirectUri = input.redirectUri || currentProfile.redirectUri || process.env.THREADS_CLI_REDIRECT_URI || DEFAULT_REDIRECT_URI
  const scopes = normalizeScopes(input.scopes)
  const state = crypto.randomUUID()

  const nextProfile: ThreadsProfileConfig = {
    ...currentProfile,
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    authState: state,
  }

  config.activeProfile = profileName
  config.profiles[profileName] = nextProfile
  await saveConfig(config)

  return {
    ok: true,
    profile: profileName,
    authorizationUrl: buildAuthorizationUrl({ clientId, redirectUri, scopes, state }),
    state,
    redirectUri,
    scopes,
    savedProfile: nextProfile,
  }
}
