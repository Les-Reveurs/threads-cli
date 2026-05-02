import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-login-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('auth login prints authorization url and saves config', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = spawnSync(
      'node',
      ['--import', 'tsx', 'src/cli.ts', 'auth', 'login', '--client-id', 'client-123', '--redirect-uri', 'https://example.com/callback', '--scopes', 'threads_basic,threads_content_publish', '--profile', 'work'],
      {
        cwd: repoRoot,
        env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
        encoding: 'utf8',
      },
    )

    const saved = JSON.parse(await readFile(path.join(configDir, 'config.json'), 'utf8'))

    assert.equal(result.status, 0)
    assert.match(result.stdout, /auth login: ready/)
    assert.match(result.stdout, /profile: work/)
    assert.match(result.stdout, /authorize_url: https:\/\/threads.net\/oauth\/authorize\?/)    
    assert.equal(saved.activeProfile, 'work')
    assert.equal(saved.profiles.work.clientId, 'client-123')
    assert.equal(saved.profiles.work.redirectUri, 'https://example.com/callback')
  })
})

test('auth login exits non-zero when client id is missing', async () => {
  await withTempConfigDir(async (configDir) => {
    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'auth', 'login'], {
      cwd: repoRoot,
      env: { ...process.env, THREADS_CLI_CONFIG_DIR: configDir },
      encoding: 'utf8',
    })

    assert.equal(result.status, 1)
    assert.match(result.stderr, /client id is required/)
  })
})
