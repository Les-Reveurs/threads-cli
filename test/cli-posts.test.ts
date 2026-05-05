import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-cli-posts-test-'))

  try {
    await fn(tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

const writeReadyConfig = async (configDir: string) => {
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
}

test('posts list prints fetched posts', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'posts', 'list'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { data: [{ id: 'post-1', text: 'hello world' }], paging: { cursors: { after: 'cursor-2' } } },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /posts list: 1 item\(s\)/)
    assert.match(result.stdout, /id: post-1/)
    assert.match(result.stdout, /next_after: cursor-2/)
  })
})

test('post delete prints success', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'post', 'delete', 'post-42'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([{}]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /post delete: done/)
    assert.match(result.stdout, /id: post-42/)
  })
})

test('posts list supports --json output', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'posts', 'list', '--json'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { data: [{ id: 'post-1', text: 'hello world' }], paging: { cursors: { after: 'cursor-2' } } },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), {
      data: [{ id: 'post-1', text: 'hello world' }],
      paging: { cursors: { after: 'cursor-2' } },
    })
  })
})

test('post create prints success for text posts', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'post', 'create', '--text', 'hello threads'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { id: 'creation-1' },
          { id: 'post-99' },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /post create: done/)
    assert.match(result.stdout, /id: post-99/)
    assert.match(result.stdout, /creation_id: creation-1/)
  })
})
