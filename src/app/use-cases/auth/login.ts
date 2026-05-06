import crypto from 'node:crypto'

import { buildAuthorizationUrl, DEFAULT_REDIRECT_URI } from '../../../domain/auth/oauth.js'
import { normalizeScopes } from '../../../domain/auth/scopes.js'
import type { ConfigStorePort } from '../../ports/config-store.port.js'
import type { ThreadsProfileConfig } from '../../../shared/types/config.js'

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

export const startAuthLogin = async (store: ConfigStorePort, input: AuthLoginInput): Promise<AuthLoginResult> => {
  const config = await store.loadConfig()
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
  await store.saveConfig(config)

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
