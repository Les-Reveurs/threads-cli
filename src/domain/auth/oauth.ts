export const DEFAULT_REDIRECT_URI = 'https://localhost/callback'
export const AUTH_BASE_URL = 'https://threads.net/oauth/authorize'

export const buildAuthorizationUrl = (params: {
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
