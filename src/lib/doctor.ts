import { getAuthStatus, type AuthStatus } from './auth-status.js'
import { resolveConfigPaths } from './config.js'

export type DoctorCheckStatus = 'pass' | 'warn'

export type DoctorCheck = {
  key: string
  status: DoctorCheckStatus
  message: string
}

export type DoctorReport = {
  ok: boolean
  configDir: string
  configFile: string
  activeProfile: string
  checks: DoctorCheck[]
  authStatus: AuthStatus
}

const statusFromBool = (ok: boolean): DoctorCheckStatus => (ok ? 'pass' : 'warn')

export const getDoctorReport = async (): Promise<DoctorReport> => {
  const authStatus = await getAuthStatus()
  const { configDir, configFile } = resolveConfigPaths()

  const checks: DoctorCheck[] = [
    {
      key: 'config_dir',
      status: 'pass',
      message: `config directory: ${configDir}`,
    },
    {
      key: 'config_file',
      status: 'pass',
      message: `config file: ${configFile}`,
    },
    {
      key: 'active_profile',
      status: 'pass',
      message: `active profile: ${authStatus.profile}`,
    },
    {
      key: 'client_id',
      status: statusFromBool(authStatus.hasClientId),
      message: authStatus.hasClientId ? 'client id configured' : 'client id missing',
    },
    {
      key: 'access_token',
      status: statusFromBool(authStatus.hasAccessToken),
      message: authStatus.hasAccessToken ? 'access token configured' : 'access token missing',
    },
    {
      key: 'token_expiry',
      status: statusFromBool(!authStatus.isExpired),
      message: authStatus.expiresAt
        ? authStatus.isExpired
          ? `access token expired at ${authStatus.expiresAt}`
          : `access token expiry: ${authStatus.expiresAt}`
        : 'access token expiry: unknown',
    },
  ]

  return {
    ok: authStatus.ok && authStatus.hasClientId,
    configDir,
    configFile,
    activeProfile: authStatus.profile,
    checks,
    authStatus,
  }
}
