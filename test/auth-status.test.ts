import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'

import { getAuthStatus } from '../src/lib/auth-status.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-auth-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('getAuthStatus reports missing token for empty config', async () => {
  await withTempConfigDir(async () => {
    const status = await getAuthStatus()

    assert.equal(status.ok, false)
    assert.equal(status.profile, 'default')
    assert.equal(status.code, 'missing_token')
  })
})

test('getAuthStatus reports configured token and expiry metadata', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            accessToken: 'token-abc',
            accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
          },
        },
      }, null, 2),
    )

    const status = await getAuthStatus()

    assert.equal(status.ok, true)
    assert.equal(status.code, 'ready')
    assert.equal(status.profile, 'default')
    assert.equal(status.hasClientId, true)
    assert.equal(status.hasAccessToken, true)
    assert.equal(status.isExpired, false)
  })
})

test('getAuthStatus reports expired token', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            accessToken: 'token-abc',
            accessTokenExpiresAt: '2000-01-01T00:00:00.000Z',
          },
        },
      }, null, 2),
    )

    const status = await getAuthStatus()

    assert.equal(status.ok, false)
    assert.equal(status.code, 'expired_token')
    assert.equal(status.isExpired, true)
  })
})
