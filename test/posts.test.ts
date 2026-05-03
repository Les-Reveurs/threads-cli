import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'

import { createTextPost, deletePost, listPosts } from '../src/lib/posts.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-posts-test-'))
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

test('listPosts returns posts for current profile', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    let calls = 0
    global.fetch = async () => {
      calls += 1

      if (calls === 1) {
        return new Response(JSON.stringify({ id: 'user-1', username: 'bender' }), { status: 200 }) as typeof fetch
      }

      return new Response(JSON.stringify({ data: [{ id: 'post-1', text: 'hello world' }] }), { status: 200 }) as typeof fetch
    }

    const result = await listPosts(5, 'cursor-1')

    assert.equal(result.data[0]?.id, 'post-1')
    assert.equal(result.data[0]?.text, 'hello world')
  })
})

test('deletePost calls DELETE on the post id', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    let seenMethod = ''
    let seenUrl = ''
    global.fetch = async (input, init) => {
      seenMethod = init?.method || 'GET'
      seenUrl = String(input)
      return new Response('', { status: 200 }) as typeof fetch
    }

    const result = await deletePost('post-42')

    assert.equal(result.deleted, true)
    assert.equal(seenMethod, 'DELETE')
    assert.match(seenUrl, /\/post-42\?access_token=token-abc/)
  })
})

test('createTextPost creates container then publishes it', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const calls: Array<{ url: string, method: string }> = []
    global.fetch = async (input, init) => {
      calls.push({ url: String(input), method: init?.method || 'GET' })

      if (calls.length === 1) {
        return new Response(JSON.stringify({ id: 'user-1', username: 'bender' }), { status: 200 }) as typeof fetch
      }

      if (calls.length === 2) {
        return new Response(JSON.stringify({ id: 'creation-1' }), { status: 200 }) as typeof fetch
      }

      return new Response(JSON.stringify({ id: 'post-99' }), { status: 200 }) as typeof fetch
    }

    const result = await createTextPost('hello threads')

    assert.equal(result.creationId, 'creation-1')
    assert.equal(result.id, 'post-99')
    assert.equal(calls[1]?.method, 'POST')
    assert.match(calls[1]?.url || '', /\/user-1\/threads\?media_type=TEXT&text=hello\+threads&access_token=token-abc/)
    assert.equal(calls[2]?.method, 'POST')
    assert.match(calls[2]?.url || '', /\/user-1\/threads_publish\?creation_id=creation-1&access_token=token-abc/)
  })
})
