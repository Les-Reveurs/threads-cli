import { FileConfigStore } from '../infra/config/file-config.store.js'
import { ThreadsOAuthAdapter } from '../infra/oauth/threads-oauth.adapter.js'
import { completeAuthExchange as completeAuthExchangeUseCase } from '../app/use-cases/auth/exchange.js'

export type { AuthExchangeInput, AuthExchangeResult } from '../app/use-cases/auth/exchange.js'

export const completeAuthExchange = (input: import('../app/use-cases/auth/exchange.js').AuthExchangeInput) => {
  return completeAuthExchangeUseCase(new FileConfigStore(), new ThreadsOAuthAdapter(), input)
}
