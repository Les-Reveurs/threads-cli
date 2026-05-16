export type ThreadsAuthProvider = 'official' | 'unofficial'

export type ThreadsProfileConfig = {
  authProvider?: ThreadsAuthProvider
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  scopes?: string[]
  authState?: string
  accessToken?: string
  accessTokenExpiresAt?: string
  refreshToken?: string
  username?: string
  password?: string
  deviceId?: string
  userId?: string
  unofficialToken?: string
}

export type ThreadsCliConfig = {
  activeProfile: string
  profiles: Record<string, ThreadsProfileConfig>
}

export type ConfigPaths = {
  configDir: string
  configFile: string
}
