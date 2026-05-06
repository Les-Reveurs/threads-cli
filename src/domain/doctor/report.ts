import type { AuthStatus } from '../auth/auth-status.js'

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
