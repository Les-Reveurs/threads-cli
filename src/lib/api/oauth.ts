import { OAUTH_BASE_URL } from './constants.js'
import { ThreadsCliError } from '../errors.js'

export type OAuthExchangeResult = {
  access_token: string
  token_type?: string
  user_id?: number
}

export const exchangeAuthorizationCode = async (params: {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}): Promise<OAuthExchangeResult> => {
  const fakePayload = process.env.THREADS_CLI_FAKE_OAUTH_EXCHANGE_JSON
  if (fakePayload) {
    return JSON.parse(fakePayload) as OAuthExchangeResult
  }

  const response = await fetch(`${OAUTH_BASE_URL}/access_token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: params.redirectUri,
      code: params.code,
    }),
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ThreadsCliError(
      'oauth_exchange_failed',
      payload?.error?.message || `OAuth exchange failed with status ${response.status}`,
    )
  }

  return payload as OAuthExchangeResult
}
