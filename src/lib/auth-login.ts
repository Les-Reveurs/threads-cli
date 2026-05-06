import { FileConfigStore } from '../infra/config/file-config.store.js'
import { startAuthLogin as startAuthLoginUseCase } from '../app/use-cases/auth/login.js'

export type { AuthLoginInput, AuthLoginResult } from '../app/use-cases/auth/login.js'

export const startAuthLogin = (input: import('../app/use-cases/auth/login.js').AuthLoginInput) => {
  return startAuthLoginUseCase(new FileConfigStore(), input)
}
