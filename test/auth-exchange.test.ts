import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'

import { completeAuthExchange } from '../src/lib/auth-exchange.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-auth-exchange-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    // @ts-ignore
    delete global.fetch
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('completeAuthExchange persists returned access token', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'work',
        profiles: {
          work: {
            clientId: 'client-123',
            clientSecret: 'secret-456',
            redirectUri: 'https://example.com/callback',
          },
        },
      }, null, 2),
    )

    global.fetch = async () => new Response(JSON.stringify({ access_token: 'token-abc', user_id: 42 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }) as typeof fetch

    const result = await completeAuthExchange({ code: 'code-123' })
    const saved = JSON.parse(await readFile(path.join(configDir, 'config.json'), 'utf8'))

    assert.equal(result.ok, true)
    assert.equal(result.profile, 'work')
    assert.equal(result.userId, 42)
    assert.equal(saved.profiles.work.accessToken, 'token-abc')
  })
})

test('completeAuthExchange requires configured client secret', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            redirectUri: 'https://example.com/callback',
          },
        },
      }, null, 2),
    )

    await assert.rejects(() => completeAuthExchange({ code: 'code-123' }), /client secret is required/)
  })
})
