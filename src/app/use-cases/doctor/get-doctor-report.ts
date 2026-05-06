import type { DoctorCheck, DoctorReport } from '../../../domain/doctor/report.js'
import type { ConfigStorePort } from '../../ports/config-store.port.js'
import { getAuthStatus } from '../auth/status.js'

const statusFromBool = (ok: boolean): 'pass' | 'warn' => (ok ? 'pass' : 'warn')

export const getDoctorReport = async (store: ConfigStorePort): Promise<DoctorReport> => {
  const authStatus = await getAuthStatus(store)
  const { configDir, configFile } = store.resolveConfigPaths()

  const checks: DoctorCheck[] = [
    { key: 'config_dir', status: 'pass', message: `config directory: ${configDir}` },
    { key: 'config_file', status: 'pass', message: `config file: ${configFile}` },
    { key: 'active_profile', status: 'pass', message: `active profile: ${authStatus.profile}` },
    { key: 'client_id', status: statusFromBool(authStatus.hasClientId), message: authStatus.hasClientId ? 'client id configured' : 'client id missing' },
    { key: 'access_token', status: statusFromBool(authStatus.hasAccessToken), message: authStatus.hasAccessToken ? 'access token configured' : 'access token missing' },
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
