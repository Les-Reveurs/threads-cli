import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-exchange-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('auth exchange stores token returned by oauth endpoint', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            clientSecret: 'secret-456',
            redirectUri: 'https://example.com/callback',
          },
        },
      }, null, 2),
    )

    const result = spawnSync(
      'node',
      ['--import', 'tsx', 'src/cli.ts', 'auth', 'exchange', '--code', 'code-123'],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          THREADS_CLI_CONFIG_DIR: configDir,
          THREADS_CLI_FAKE_OAUTH_EXCHANGE_JSON: JSON.stringify({ access_token: 'token-abc', user_id: 42 }),
        },
        encoding: 'utf8',
      },
    )

    assert.equal(result.status, 0)
    assert.match(result.stdout, /auth exchange: done/)
    assert.match(result.stdout, /user_id: 42/)
  })
})
