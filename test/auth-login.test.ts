import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'

import { startAuthLogin } from '../src/lib/auth-login.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-auth-login-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    delete process.env.THREADS_CLI_CLIENT_ID
    delete process.env.THREADS_CLI_CLIENT_SECRET
    delete process.env.THREADS_CLI_REDIRECT_URI
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('startAuthLogin persists oauth inputs and returns authorization url', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = await startAuthLogin({
      clientId: 'client-123',
      clientSecret: 'secret-123',
      redirectUri: 'https://example.com/callback',
      scopes: ['threads_basic,threads_content_publish'],
      profile: 'work',
    })

    const saved = JSON.parse(await readFile(path.join(configDir, 'config.json'), 'utf8'))

    assert.equal(result.ok, true)
    assert.equal(result.profile, 'work')
    assert.equal(result.redirectUri, 'https://example.com/callback')
    assert.deepEqual(result.scopes, ['threads_basic', 'threads_content_publish'])
    assert.match(result.authorizationUrl, /^https:\/\/threads.net\/oauth\/authorize\?/)
    assert.match(result.authorizationUrl, /client_id=client-123/)
    assert.match(result.authorizationUrl, /redirect_uri=https%3A%2F%2Fexample.com%2Fcallback/)
    assert.match(result.authorizationUrl, /scope=threads_basic%2Cthreads_content_publish/)
    assert.ok(result.state.length > 10)
    assert.equal(saved.activeProfile, 'work')
    assert.equal(saved.profiles.work.clientId, 'client-123')
    assert.equal(saved.profiles.work.clientSecret, 'secret-123')
    assert.equal(saved.profiles.work.redirectUri, 'https://example.com/callback')
    assert.deepEqual(saved.profiles.work.scopes, ['threads_basic', 'threads_content_publish'])
    assert.equal(typeof saved.profiles.work.authState, 'string')
  })
})

test('startAuthLogin can resolve client id from environment and existing config', async () => {
  await withTempConfigDir(async (configDir) => {
    process.env.THREADS_CLI_CLIENT_ID = 'env-client'
    process.env.THREADS_CLI_REDIRECT_URI = 'https://env.example/callback'

    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientSecret: 'persisted-secret',
          },
        },
      }, null, 2),
    )

    const result = await startAuthLogin({})

    assert.equal(result.profile, 'default')
    assert.equal(result.redirectUri, 'https://env.example/callback')
    assert.match(result.authorizationUrl, /client_id=env-client/)
    assert.equal(result.savedProfile.clientSecret, 'persisted-secret')
  })
})

test('startAuthLogin throws when no client id is available', async () => {
  await withTempConfigDir(async () => {
    await assert.rejects(() => startAuthLogin({}), /client id is required/)
  })
})
