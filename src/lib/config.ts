export type { ThreadsProfileConfig, ThreadsCliConfig, ConfigPaths } from '../shared/types/config.js'
import { FileConfigStore } from '../infra/config/file-config.store.js'

const store = new FileConfigStore()
export const resolveConfigPaths = () => store.resolveConfigPaths()
export const loadConfig = async () => store.loadConfig()
export const saveConfig = async (config: import('../shared/types/config.js').ThreadsCliConfig) => store.saveConfig(config)
