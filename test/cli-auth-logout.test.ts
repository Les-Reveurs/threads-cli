import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-logout-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('auth logout clears stored tokens and exits zero', async () => {
  await withTempConfigDir(async (configDir) => {
    const configFile = path.join(configDir, 'config.json')
    await writeFile(
      configFile,
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            accessToken: 'token-abc',
            refreshToken: 'refresh-abc',
            accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
          },
        },
      }, null, 2),
    )

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'auth', 'logout'], {
      cwd: repoRoot,
      env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
      encoding: 'utf8',
    })

    const saved = JSON.parse(await readFile(configFile, 'utf8'))

    assert.equal(result.status, 0)
    assert.match(result.stdout, /auth logout: done/)
    assert.match(result.stdout, /profile: default/)
    assert.match(result.stdout, /cleared_tokens: yes/)
    assert.equal('accessToken' in saved.profiles.default, false)
    assert.equal('refreshToken' in saved.profiles.default, false)
    assert.equal('accessTokenExpiresAt' in saved.profiles.default, false)
  })
})

test('auth logout reports no-op when tokens are absent', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'auth', 'logout'], {
      cwd: repoRoot,
      env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /cleared_tokens: no/)
  })
})
