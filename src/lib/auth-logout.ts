import { FileConfigStore } from '../infra/config/file-config.store.js'
import { logoutAuth as logoutAuthUseCase } from '../app/use-cases/auth/logout.js'

export type { AuthLogoutResult } from '../app/use-cases/auth/logout.js'

export const logoutAuth = () => logoutAuthUseCase(new FileConfigStore())
