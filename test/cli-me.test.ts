import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-me-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('me prints current profile from API', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            accessToken: 'token-abc',
          },
        },
      }, null, 2),
    )

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'me'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_JSON: JSON.stringify({ id: '1', username: 'bender', name: 'Bender' }),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /me: ok/)
    assert.match(result.stdout, /username: bender/)
  })
})

test('me supports --json output', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            accessToken: 'token-abc',
          },
        },
      }, null, 2),
    )

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'me', '--json'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_JSON: JSON.stringify({ id: '1', username: 'bender', name: 'Bender' }),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), { id: '1', username: 'bender', name: 'Bender' })
  })
})

test('user prints profile by id or username from API', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            accessToken: 'token-abc',
          },
        },
      }, null, 2),
    )

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'user', 'zuck'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_JSON: JSON.stringify({ id: '2', username: 'zuck', name: 'Mark' }),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /user: ok/)
    assert.match(result.stdout, /username: zuck/)
  })
})
