import { loadConfig, saveConfig } from './config.js'
import { ThreadsCliError, exchangeAuthorizationCode } from './threads-api.js'

export type AuthExchangeInput = {
  profile?: string
  code?: string
}

export type AuthExchangeResult = {
  ok: boolean
  profile: string
  userId: number | null
}

export const completeAuthExchange = async (input: AuthExchangeInput): Promise<AuthExchangeResult> => {
  const config = await loadConfig()
  const profileName = input.profile || config.activeProfile || 'default'
  const profile = config.profiles[profileName] || {}

  if (!input.code) {
    throw new ThreadsCliError('missing_code', 'authorization code is required (pass --code)')
  }

  if (!profile.clientId) {
    throw new ThreadsCliError('missing_client_id', 'client id is required before code exchange; run `threads auth login --client-id ...`')
  }

  if (!profile.clientSecret) {
    throw new ThreadsCliError('missing_client_secret', 'client secret is required before code exchange; run `threads auth login --client-secret ...`')
  }

  if (!profile.redirectUri) {
    throw new ThreadsCliError('missing_redirect_uri', 'redirect uri is required before code exchange; run `threads auth login --redirect-uri ...`')
  }

  const token = await exchangeAuthorizationCode({
    clientId: profile.clientId,
    clientSecret: profile.clientSecret,
    redirectUri: profile.redirectUri,
    code: input.code,
  })

  config.activeProfile = profileName
  config.profiles[profileName] = {
    ...profile,
    accessToken: token.access_token,
  }

  await saveConfig(config)

  return {
    ok: true,
    profile: profileName,
    userId: token.user_id ?? null,
  }
}
