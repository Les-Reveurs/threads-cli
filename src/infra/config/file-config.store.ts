import path from 'node:path'
import os from 'node:os'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import type { ConfigPaths, ThreadsCliConfig } from '../../shared/types/config.js'
import type { ConfigStorePort } from '../../app/ports/config-store.port.js'

const defaultConfig = (): ThreadsCliConfig => ({ activeProfile: 'default', profiles: {} })

export class FileConfigStore implements ConfigStorePort {
  resolveConfigPaths(): ConfigPaths {
    const configDir = process.env.THREADS_CLI_CONFIG_DIR || path.join(os.homedir(), '.config', 'threads-cli')
    return { configDir, configFile: path.join(configDir, 'config.json') }
  }

  async loadConfig(): Promise<ThreadsCliConfig> {
    const { configFile } = this.resolveConfigPaths()
    try {
      const raw = await readFile(configFile, 'utf8')
      const parsed = JSON.parse(raw) as Partial<ThreadsCliConfig>
      return { activeProfile: parsed.activeProfile || 'default', profiles: parsed.profiles || {} }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'ENOENT') return defaultConfig()
      throw error
    }
  }

  async saveConfig(config: ThreadsCliConfig): Promise<void> {
    const { configDir, configFile } = this.resolveConfigPaths()
    await mkdir(configDir, { recursive: true })
    await writeFile(configFile, JSON.stringify(config, null, 2) + '\n', 'utf8')
  }
}
