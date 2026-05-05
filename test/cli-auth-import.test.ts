import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-auth-import-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('auth import stores access token for automation flows', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = spawnSync(
      'node',
      ['--import', 'tsx', 'src/cli.ts', 'auth', 'import', '--profile', 'ci', '--access-token', 'token-abc', '--client-id', 'client-123', '--expires-at', '2030-01-01T00:00:00.000Z'],
      {
        cwd: repoRoot,
        env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
        encoding: 'utf8',
      },
    )

    const saved = JSON.parse(await readFile(path.join(configDir, 'config.json'), 'utf8'))

    assert.equal(result.status, 0)
    assert.match(result.stdout, /auth import: done/)
    assert.match(result.stdout, /profile: ci/)
    assert.equal(saved.profiles.ci.accessToken, 'token-abc')
    assert.equal(saved.profiles.ci.clientId, 'client-123')
  })
})

test('auth import supports --json output', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = spawnSync(
      'node',
      ['--import', 'tsx', 'src/cli.ts', 'auth', 'import', '--access-token', 'token-abc', '--json'],
      {
        cwd: repoRoot,
        env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
        encoding: 'utf8',
      },
    )

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), {
      ok: true,
      profile: 'default',
      savedProfile: {
        accessToken: 'token-abc',
      },
    })
  })
})
