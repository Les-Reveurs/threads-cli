import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-doctor-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('doctor exits non-zero when required auth config is missing', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'doctor'], {
      cwd: repoRoot,
      env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
      encoding: 'utf8',
    })

    assert.equal(result.status, 1)
    assert.match(result.stdout, /doctor: warnings found/)
    assert.match(result.stdout, /client id missing/)
    assert.match(result.stdout, /access token missing/)
  })
})

test('doctor exits zero when required auth config is present', async () => {
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

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'doctor'], {
      cwd: repoRoot,
      env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /doctor: ready/)
    assert.match(result.stdout, /client id configured/)
    assert.match(result.stdout, /access token configured/)
  })
})
