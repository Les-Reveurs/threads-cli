import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'

import { importAuthToken } from '../src/lib/auth-import.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-auth-import-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    delete process.env.THREADS_CLI_ACCESS_TOKEN
    delete process.env.THREADS_CLI_CLIENT_ID
    delete process.env.THREADS_CLI_CLIENT_SECRET
    delete process.env.THREADS_CLI_REDIRECT_URI
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('importAuthToken persists access token and optional metadata', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = await importAuthToken({
      profile: 'ci',
      accessToken: 'token-abc',
      refreshToken: 'refresh-xyz',
      expiresAt: '2030-01-01T00:00:00.000Z',
      clientId: 'client-123',
      scopes: ['threads_basic,threads_content_publish'],
    })

    const saved = JSON.parse(await readFile(path.join(configDir, 'config.json'), 'utf8'))

    assert.equal(result.ok, true)
    assert.equal(result.profile, 'ci')
    assert.equal(saved.activeProfile, 'ci')
    assert.equal(saved.profiles.ci.accessToken, 'token-abc')
    assert.equal(saved.profiles.ci.refreshToken, 'refresh-xyz')
    assert.equal(saved.profiles.ci.accessTokenExpiresAt, '2030-01-01T00:00:00.000Z')
    assert.equal(saved.profiles.ci.clientId, 'client-123')
    assert.deepEqual(saved.profiles.ci.scopes, ['threads_basic', 'threads_content_publish'])
  })
})

test('importAuthToken can resolve token from environment and preserve existing profile fields', async () => {
  await withTempConfigDir(async (configDir) => {
    process.env.THREADS_CLI_ACCESS_TOKEN = 'env-token'

    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'persisted-client',
            redirectUri: 'https://example.com/callback',
          },
        },
      }, null, 2),
    )

    const result = await importAuthToken({})

    assert.equal(result.profile, 'default')
    assert.equal(result.savedProfile.accessToken, 'env-token')
    assert.equal(result.savedProfile.clientId, 'persisted-client')
    assert.equal(result.savedProfile.redirectUri, 'https://example.com/callback')
  })
})

test('importAuthToken rejects invalid expires-at values', async () => {
  await withTempConfigDir(async () => {
    await assert.rejects(
      () => importAuthToken({ accessToken: 'token-abc', expiresAt: 'tomorrow-ish' }),
      /expires-at must be a valid ISO-8601 timestamp/,
    )
  })
})
