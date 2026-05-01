import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'

import { logoutAuth } from '../src/lib/auth-logout.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-auth-logout-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('logoutAuth clears tokens but keeps static profile config', async () => {
  await withTempConfigDir(async (configDir) => {
    const configFile = path.join(configDir, 'config.json')
    await writeFile(
      configFile,
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            clientSecret: 'secret-123',
            redirectUri: 'https://example.com/callback',
            accessToken: 'token-abc',
            refreshToken: 'refresh-abc',
            accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
          },
        },
      }, null, 2),
    )

    const result = await logoutAuth()
    const saved = JSON.parse(await readFile(configFile, 'utf8'))

    assert.equal(result.ok, true)
    assert.equal(result.profile, 'default')
    assert.equal(result.cleared, true)
    assert.equal(saved.profiles.default.clientId, 'client-123')
    assert.equal(saved.profiles.default.clientSecret, 'secret-123')
    assert.equal(saved.profiles.default.redirectUri, 'https://example.com/callback')
    assert.equal('accessToken' in saved.profiles.default, false)
    assert.equal('refreshToken' in saved.profiles.default, false)
    assert.equal('accessTokenExpiresAt' in saved.profiles.default, false)
  })
})

test('logoutAuth succeeds even when no tokens are present', async () => {
  await withTempConfigDir(async () => {
    const result = await logoutAuth()

    assert.equal(result.ok, true)
    assert.equal(result.profile, 'default')
    assert.equal(result.cleared, false)
  })
})
