export type ThreadsProfileConfig = {
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  scopes?: string[]
  authState?: string
  accessToken?: string
  accessTokenExpiresAt?: string
  refreshToken?: string
}

export type ThreadsCliConfig = {
  activeProfile: string
  profiles: Record<string, ThreadsProfileConfig>
}

export type ConfigPaths = {
  configDir: string
  configFile: string
}
