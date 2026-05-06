export type OAuthExchangeResult = {
  access_token: string
  token_type?: string
  user_id?: number
}

export interface ThreadsOAuthPort {
  exchangeAuthorizationCode(params: {
    clientId: string
    clientSecret: string
    redirectUri: string
    code: string
  }): Promise<OAuthExchangeResult>
}
