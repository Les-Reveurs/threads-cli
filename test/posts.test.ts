import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'

import { createPost } from '../src/app/use-cases/posts/create-post.js'
import { deletePost } from '../src/app/use-cases/posts/delete-post.js'
import { listPosts } from '../src/app/use-cases/posts/list-posts.js'
import { hideReply, unhideReply } from '../src/app/use-cases/replies/manage-reply.js'
import { listReplies } from '../src/app/use-cases/replies/list-replies.js'
import { FileConfigStore } from '../src/infra/config/file-config.store.js'
import { ThreadsApiAdapter } from '../src/infra/api/threads-api.adapter.js'

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

    const result = await listPosts(new ThreadsApiAdapter(new FileConfigStore()), 5, 'cursor-1')

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

    const result = await deletePost(new ThreadsApiAdapter(new FileConfigStore()), 'post-42')

    assert.equal(result.deleted, true)
    assert.equal(seenMethod, 'DELETE')
    assert.match(seenUrl, /\/post-42\?access_token=token-abc/)
  })
})

test('createPost creates text container then publishes it', async () => {
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

    const result = await createPost(new ThreadsApiAdapter(new FileConfigStore()), { text: 'hello threads' })

    assert.equal(result.creationId, 'creation-1')
    assert.equal(result.id, 'post-99')
    assert.equal(result.mediaType, 'TEXT')
    assert.equal(calls[1]?.method, 'POST')
    assert.match(calls[1]?.url || '', /\/user-1\/threads\?media_type=TEXT&text=hello\+threads&access_token=token-abc/)
    assert.equal(calls[2]?.method, 'POST')
    assert.match(calls[2]?.url || '', /\/user-1\/threads_publish\?creation_id=creation-1&access_token=token-abc/)
  })
})

test('createPost creates image quote reply container with metadata', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const calls: Array<{ url: string, method: string }> = []
    global.fetch = async (input, init) => {
      calls.push({ url: String(input), method: init?.method || 'GET' })

      if (calls.length === 1) {
        return new Response(JSON.stringify({ id: 'user-1', username: 'bender' }), { status: 200 }) as typeof fetch
      }

      if (calls.length === 2) {
        return new Response(JSON.stringify({ id: 'creation-2' }), { status: 200 }) as typeof fetch
      }

      return new Response(JSON.stringify({ id: 'post-100' }), { status: 200 }) as typeof fetch
    }

    const result = await createPost(new ThreadsApiAdapter(new FileConfigStore()), {
      text: 'look at this',
      mediaUrl: 'https://cdn.example.test/pic.png',
      altText: 'robot portrait',
      quotePostId: 'post-quote-1',
      replyToId: 'post-parent-1',
      replyControl: 'mentioned_only',
    })

    assert.equal(result.creationId, 'creation-2')
    assert.equal(result.id, 'post-100')
    assert.equal(result.mediaType, 'IMAGE')
    assert.equal(calls[1]?.method, 'POST')
    assert.match(calls[1]?.url || '', /media_type=IMAGE/)
    assert.match(calls[1]?.url || '', /image_url=https%3A%2F%2Fcdn\.example\.test%2Fpic\.png/)
    assert.match(calls[1]?.url || '', /alt_text=robot\+portrait/)
    assert.match(calls[1]?.url || '', /quote_post_id=post-quote-1/)
    assert.match(calls[1]?.url || '', /reply_to_id=post-parent-1/)
    assert.match(calls[1]?.url || '', /reply_control=mentioned_only/)
  })
})

test('createPost creates carousel container from multiple image urls', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const calls: Array<{ url: string, method: string }> = []
    global.fetch = async (input, init) => {
      calls.push({ url: String(input), method: init?.method || 'GET' })

      if (calls.length === 1) {
        return new Response(JSON.stringify({ id: 'user-1', username: 'bender' }), { status: 200 }) as typeof fetch
      }
      if (calls.length === 2) {
        return new Response(JSON.stringify({ id: 'child-1' }), { status: 200 }) as typeof fetch
      }
      if (calls.length === 3) {
        return new Response(JSON.stringify({ id: 'child-2' }), { status: 200 }) as typeof fetch
      }
      if (calls.length === 4) {
        return new Response(JSON.stringify({ id: 'creation-4' }), { status: 200 }) as typeof fetch
      }
      return new Response(JSON.stringify({ id: 'post-102' }), { status: 200 }) as typeof fetch
    }

    const result = await createPost(new ThreadsApiAdapter(new FileConfigStore()), {
      text: 'carousel time',
      mediaUrls: [
        'https://cdn.example.test/pic-1.png',
        'https://cdn.example.test/pic-2.jpg',
      ],
    })

    assert.equal(result.creationId, 'creation-4')
    assert.equal(result.id, 'post-102')
    assert.equal(result.mediaType, 'CAROUSEL')
    assert.match(calls[1]?.url || '', /media_type=IMAGE/)
    assert.match(calls[1]?.url || '', /is_carousel_item=true/)
    assert.match(calls[2]?.url || '', /image_url=https%3A%2F%2Fcdn\.example\.test%2Fpic-2\.jpg/)
    assert.match(calls[3]?.url || '', /media_type=CAROUSEL/)
    assert.match(calls[3]?.url || '', /children=child-1%2Cchild-2/)
    assert.match(calls[3]?.url || '', /text=carousel\+time/)
  })
})

test('createPost waits for video container readiness before publish', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const calls: Array<{ url: string, method: string }> = []
    global.fetch = async (input, init) => {
      calls.push({ url: String(input), method: init?.method || 'GET' })

      if (calls.length === 1) return new Response(JSON.stringify({ id: 'user-1', username: 'bender' }), { status: 200 }) as typeof fetch
      if (calls.length === 2) return new Response(JSON.stringify({ id: 'creation-video-1' }), { status: 200 }) as typeof fetch
      if (calls.length === 3) return new Response(JSON.stringify({ status_code: 'IN_PROGRESS' }), { status: 200 }) as typeof fetch
      if (calls.length === 4) return new Response(JSON.stringify({ status_code: 'FINISHED' }), { status: 200 }) as typeof fetch
      return new Response(JSON.stringify({ id: 'post-video-1' }), { status: 200 }) as typeof fetch
    }

    const result = await createPost(new ThreadsApiAdapter(new FileConfigStore()), {
      text: 'video time',
      mediaUrl: 'https://cdn.example.test/video.mp4',
      publishPollIntervalMs: 0,
      publishTimeoutMs: 100,
    })

    assert.equal(result.id, 'post-video-1')
    assert.equal(result.mediaType, 'VIDEO')
    assert.equal(result.containerStatus, 'FINISHED')
    assert.match(calls[2]?.url || '', /creation-video-1\?fields=status%2Cstatus_code%2Cerror_message&access_token=token-abc/)
    assert.match(calls[4]?.url || '', /threads_publish\?creation_id=creation-video-1&access_token=token-abc/)
  })
})

test('listReplies returns replies for a post', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    let seenUrl = ''
    global.fetch = async (input) => {
      seenUrl = String(input)
      return new Response(JSON.stringify({ data: [{ id: 'reply-1', text: 'hi', hide_status: false }] }), { status: 200 }) as typeof fetch
    }

    const result = await listReplies(new ThreadsApiAdapter(new FileConfigStore()), 'post-1', 'cursor-1')

    assert.equal(result.data[0]?.id, 'reply-1')
    assert.match(seenUrl, /\/post-1\/replies\?fields=/)
    assert.match(seenUrl, /after=cursor-1/)
  })
})

test('hideReply and unhideReply call reply moderation endpoint', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    const calls: string[] = []
    global.fetch = async (input, _init) => {
      calls.push(String(input))
      return new Response(JSON.stringify({ success: true }), { status: 200 }) as typeof fetch
    }

    const hidden = await hideReply(new ThreadsApiAdapter(new FileConfigStore()), 'reply-42')
    const unhidden = await unhideReply(new ThreadsApiAdapter(new FileConfigStore()), 'reply-42')

    assert.equal(hidden.hidden, true)
    assert.equal(unhidden.hidden, false)
    assert.match(calls[0] || '', /\/reply-42\?hide=true&access_token=token-abc/)
    assert.match(calls[1] || '', /\/reply-42\?hide=false&access_token=token-abc/)
  })
})

test('createPost fails when video container processing errors', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeReadyConfig(configDir)

    let calls = 0
    global.fetch = async (_input, _init) => {
      calls += 1
      if (calls === 1) return new Response(JSON.stringify({ id: 'user-1', username: 'bender' }), { status: 200 }) as typeof fetch
      if (calls === 2) return new Response(JSON.stringify({ id: 'creation-video-2' }), { status: 200 }) as typeof fetch
      return new Response(JSON.stringify({ status_code: 'ERROR', error_message: 'transcode failed' }), { status: 200 }) as typeof fetch
    }

    await assert.rejects(() => createPost(new ThreadsApiAdapter(new FileConfigStore()), {
      text: 'video fail',
      mediaUrl: 'https://cdn.example.test/video.mp4',
      publishPollIntervalMs: 0,
      publishTimeoutMs: 100,
    }), /transcode failed/)
  })
})
