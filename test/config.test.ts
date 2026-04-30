import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'

import { loadConfig, saveConfig, resolveConfigPaths } from '../src/lib/config.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('loadConfig returns defaults when config file is missing', async () => {
  await withTempConfigDir(async () => {
    const config = await loadConfig()

    assert.equal(config.activeProfile, 'default')
    assert.deepEqual(config.profiles, {})
  })
})

test('saveConfig persists profiles and loadConfig reads them back', async () => {
  await withTempConfigDir(async () => {
    await saveConfig({
      activeProfile: 'work',
      profiles: {
        work: {
          clientId: 'client-123',
          accessToken: 'token-abc',
          accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
        },
      },
    })

    const loaded = await loadConfig()

    assert.equal(loaded.activeProfile, 'work')
    assert.equal(loaded.profiles.work?.clientId, 'client-123')
    assert.equal(loaded.profiles.work?.accessToken, 'token-abc')
  })
})

test('resolveConfigPaths honors THREADS_CLI_CONFIG_DIR override', async () => {
  await withTempConfigDir(async (configDir) => {
    const paths = resolveConfigPaths()

    assert.equal(paths.configDir, configDir)
    assert.equal(paths.configFile, path.join(configDir, 'config.json'))
  })
})
