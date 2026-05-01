import path from 'node:path'
import os from 'node:os'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

export type ThreadsProfileConfig = {
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  accessToken?: string
  accessTokenExpiresAt?: string
  refreshToken?: string
}

export type ThreadsCliConfig = {
  activeProfile: string
  profiles: Record<string, ThreadsProfileConfig>
}

export type ConfigPaths = {
  configDir: string
  configFile: string
}

const defaultConfig = (): ThreadsCliConfig => ({
  activeProfile: 'default',
  profiles: {},
})

export const resolveConfigPaths = (): ConfigPaths => {
  const configDir = process.env.THREADS_CLI_CONFIG_DIR || path.join(os.homedir(), '.config', 'threads-cli')

  return {
    configDir,
    configFile: path.join(configDir, 'config.json'),
  }
}

export const loadConfig = async (): Promise<ThreadsCliConfig> => {
  const { configFile } = resolveConfigPaths()

  try {
    const raw = await readFile(configFile, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ThreadsCliConfig>

    return {
      activeProfile: parsed.activeProfile || 'default',
      profiles: parsed.profiles || {},
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code

    if (code === 'ENOENT') {
      return defaultConfig()
    }

    throw error
  }
}

export const saveConfig = async (config: ThreadsCliConfig): Promise<void> => {
  const { configDir, configFile } = resolveConfigPaths()

  await mkdir(configDir, { recursive: true })
  await writeFile(configFile, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

export const updateActiveProfile = async (
  updater: (profile: ThreadsProfileConfig, config: ThreadsCliConfig) => ThreadsProfileConfig,
): Promise<ThreadsCliConfig> => {
  const config = await loadConfig()
  const profileName = config.activeProfile || 'default'
  const currentProfile = config.profiles[profileName] || {}

  config.profiles[profileName] = updater(currentProfile, config)
  await saveConfig(config)

  return config
}
