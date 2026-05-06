import type { ConfigPaths, ThreadsCliConfig } from '../../shared/types/config.js'

export interface ConfigStorePort {
  resolveConfigPaths(): ConfigPaths
  loadConfig(): Promise<ThreadsCliConfig>
  saveConfig(config: ThreadsCliConfig): Promise<void>
}
