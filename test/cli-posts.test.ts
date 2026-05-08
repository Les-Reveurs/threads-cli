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
    assert.match(result.stdout, /media_type: TEXT/)
  })
})

test('post create supports media quote reply flags', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', [
      '--import', 'tsx', 'src/cli.ts', 'post', 'create',
      '--text', 'look at this',
      '--media-url', 'https://cdn.example.test/video.mp4',
      '--quote', 'post-quote-1',
      '--reply-to', 'post-parent-1',
      '--reply-control', 'accounts_you_follow',
      '--publish-poll-ms', '0',
      '--publish-timeout-ms', '100',
    ], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { id: 'creation-2' },
          { status_code: 'FINISHED' },
          { id: 'post-100' },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /post create: done/)
    assert.match(result.stdout, /id: post-100/)
    assert.match(result.stdout, /creation_id: creation-2/)
    assert.match(result.stdout, /media_type: VIDEO/)
  })
})

test('post create supports --json output for media posts', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', [
      '--import', 'tsx', 'src/cli.ts', 'post', 'create', '--json',
      '--text', 'hello',
      '--media-url', 'https://cdn.example.test/pic.png',
      '--alt-text', 'robot portrait',
    ], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { id: 'creation-3' },
          { id: 'post-101' },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), {
      id: 'post-101',
      creationId: 'creation-3',
      mediaType: 'IMAGE',
    })
  })
})

test('post create supports carousel posts with repeated --media-url flags', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', [
      '--import', 'tsx', 'src/cli.ts', 'post', 'create', '--json',
      '--text', 'carousel time',
      '--media-url', 'https://cdn.example.test/pic-1.png',
      '--media-url', 'https://cdn.example.test/pic-2.jpg',
    ], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { id: 'child-1' },
          { id: 'child-2' },
          { id: 'creation-4' },
          { id: 'post-102' },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), {
      id: 'post-102',
      creationId: 'creation-4',
      mediaType: 'CAROUSEL',
    })
  })
})

test('mentions list renders fetched mentions', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'mentions', 'list'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { data: [{ id: 'mention-1', username: 'fry', text: 'hey @bender' }], paging: { cursors: { after: 'cursor-3' } } },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /mentions list: 1 item\(s\)/)
    assert.match(result.stdout, /id: mention-1/)
    assert.match(result.stdout, /next_after: cursor-3/)
  })
})

test('replies list renders fetched replies', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'replies', 'list', 'post-1'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { data: [{ id: 'reply-1', username: 'bender', text: 'hi', hide_status: false }], paging: { cursors: { after: 'cursor-2' } } },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /replies list: 1 item\(s\)/)
    assert.match(result.stdout, /id: reply-1/)
    assert.match(result.stdout, /next_after: cursor-2/)
  })
})

test('replies hide and unhide support json output', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const hidden = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'replies', 'hide', 'reply-42', '--json'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([{ success: true }]),
      },
      encoding: 'utf8',
    })

    const unhidden = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'replies', 'unhide', 'reply-42', '--json'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([{ success: true }]),
      },
      encoding: 'utf8',
    })

    assert.equal(hidden.status, 0)
    assert.equal(unhidden.status, 0)
    assert.deepEqual(JSON.parse(hidden.stdout), { id: 'reply-42', hidden: true, success: true })
    assert.deepEqual(JSON.parse(unhidden.stdout), { id: 'reply-42', hidden: false, success: true })
  })
})

test('post create waits for video readiness by default', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', [
      '--import', 'tsx', 'src/cli.ts', 'post', 'create', '--json',
      '--text', 'video time',
      '--media-url', 'https://cdn.example.test/video.mp4',
      '--publish-poll-ms', '0',
      '--publish-timeout-ms', '100',
    ], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { id: 'user-1', username: 'bender' },
          { id: 'creation-video-1' },
          { status_code: 'IN_PROGRESS' },
          { status_code: 'FINISHED' },
          { id: 'post-video-1' },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), {
      id: 'post-video-1',
      creationId: 'creation-video-1',
      mediaType: 'VIDEO',
      containerStatus: 'FINISHED',
    })
  })
})

test('insights post renders fetched metrics', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'post', 'post-7'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { data: [{ name: 'views', period: 'lifetime', values: [{ value: 42 }] }] },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /insights post post-7: 1 metric\(s\)/)
    assert.match(result.stdout, /metric: views/)
    assert.match(result.stdout, /value: 42/)
  })
})

test('insights user supports json output and flags', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'user', '--metric', 'views,followers_count', '--breakdown', 'country', '--json'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { data: [{ name: 'followers_count', period: 'day', total_value: { value: 9000 } }] },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.deepEqual(JSON.parse(result.stdout), {
      data: [{ name: 'followers_count', period: 'day', total_value: { value: 9000 } }],
    })
  })
})


test('insights user renders breakdown metrics in readable form', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'user', '--metric', 'followers_count'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          {
            data: [{
              name: 'followers_count',
              period: 'lifetime',
              total_value: {
                value: 9000,
                breakdowns: [{
                  dimension_keys: ['country'],
                  results: [
                    { dimension_values: ['US'], value: 5000 },
                    { dimension_values: ['RS'], value: 4000 },
                  ],
                }],
              },
            }],
          },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /breakdowns:/)
    assert.match(result.stdout, /dimensions: country/)
    assert.match(result.stdout, /US: 5000/)
    assert.match(result.stdout, /RS: 4000/)
  })
})

test('insights post rejects unsupported metrics', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'post', 'post-7', '--metric', 'views,followers_count'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 1)
    assert.match(result.stderr, /unsupported post insight metric\(s\): followers_count/)
    assert.match(result.stderr, /allowed: views, likes, replies, reposts, quotes, shares/)
  })
})

test('insights user rejects unsupported metrics in --json mode', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'user', '--metric', 'shares', '--json'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 1)
    assert.deepEqual(JSON.parse(result.stderr), {
      ok: false,
      error: {
        code: 'invalid_insight_metric',
        message: 'unsupported user insight metric(s): shares. allowed: views, likes, replies, reposts, quotes, clicks, followers_count',
      },
    })
  })
})

test('insights post renders views metric with friendly summary', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'post', 'post-7'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { data: [{ name: 'views', period: 'lifetime', title: 'Views', values: [{ value: 42 }] }] },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /summary: 42 views/)
  })
})

test('insights user renders followers_count breakdown with friendly summary', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'user', '--metric', 'followers_count'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          {
            data: [{
              name: 'followers_count',
              period: 'lifetime',
              total_value: {
                value: 9000,
                breakdowns: [{
                  dimension_keys: ['country'],
                  results: [
                    { dimension_values: ['US'], value: 5000 },
                    { dimension_values: ['RS'], value: 4000 },
                  ],
                }],
              },
            }],
          },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /summary: 9000 followers/)
    assert.match(result.stdout, /top_breakdown: US = 5000/)
  })
})

test('insights post renders likes metric with friendly summary', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const result = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'insights', 'post', 'post-7'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        THREADS_CLI_CONFIG_DIR: configDir,
        THREADS_CLI_FAKE_API_QUEUE_JSON: JSON.stringify([
          { data: [{ name: 'likes', period: 'lifetime', values: [{ value: 12 }] }] },
        ]),
      },
      encoding: 'utf8',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /summary: 12 likes/)
  })
})
