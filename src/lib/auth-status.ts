import { FileConfigStore } from '../infra/config/file-config.store.js'
import { getAuthStatus as getAuthStatusUseCase } from '../app/use-cases/auth/status.js'

export type { AuthStatus, AuthStatusCode } from '../domain/auth/auth-status.js'

export const getAuthStatus = () => getAuthStatusUseCase(new FileConfigStore())
