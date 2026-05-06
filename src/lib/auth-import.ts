import { FileConfigStore } from '../infra/config/file-config.store.js'
import { importAuthToken as importAuthTokenUseCase } from '../app/use-cases/auth/import-token.js'

export type { AuthImportInput, AuthImportResult } from '../app/use-cases/auth/import-token.js'

export const importAuthToken = (input: import('../app/use-cases/auth/import-token.js').AuthImportInput) => {
  return importAuthTokenUseCase(new FileConfigStore(), input)
}
