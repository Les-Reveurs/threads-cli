import type { ConfigStorePort } from '../ports/config-store.port.js'
import type { ThreadsApiPort } from '../ports/threads-api.port.js'
import type { ThreadsOAuthPort } from '../ports/oauth.port.js'
import { startAuthLogin } from '../use-cases/auth/login.js'
import { completeAuthExchange } from '../use-cases/auth/exchange.js'
import { importAuthToken } from '../use-cases/auth/import-token.js'
import { logoutAuth } from '../use-cases/auth/logout.js'
import { getAuthStatus } from '../use-cases/auth/status.js'
import { getDoctorReport } from '../use-cases/doctor/get-doctor-report.js'
import { getCurrentProfile } from '../use-cases/profiles/get-current-profile.js'
import { getUserProfile } from '../use-cases/profiles/get-user-profile.js'
import { listPosts } from '../use-cases/posts/list-posts.js'
import { createPost } from '../use-cases/posts/create-post.js'
import { deletePost } from '../use-cases/posts/delete-post.js'
import { hideReply, unhideReply } from '../use-cases/replies/manage-reply.js'
import { listReplies } from '../use-cases/replies/list-replies.js'
import { renderAuthExchange, renderAuthImport, renderAuthLogin, renderAuthLogout, renderAuthStatus, renderDoctorReport, renderPostCreated, renderPostDeleted, renderPostsList, renderProfile, renderRepliesList, renderReplyManaged } from '../../presentation/index.js'
import { CliError } from '../../shared/errors/cli-error.js'

export type RuntimeDeps = {
  store: ConfigStorePort
  api: ThreadsApiPort
  oauth: ThreadsOAuthPort
  args: string[]
}

const getFlagValue = (args: string[], name: string): string | undefined => {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  return args[index + 1]?.startsWith('--') ? undefined : args[index + 1]
}

const getFlagValues = (args: string[], name: string): string[] => {
  const values: string[] = []
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === name) {
      const value = args[index + 1]
      if (value && !value.startsWith('--')) values.push(value)
    }
  }
  return values
}

const hasFlag = (args: string[], name: string): boolean => args.includes(name)
const parseIntegerFlag = (args: string[], name: string): number | undefined => {
  const value = getFlagValue(args, name)
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseBooleanFlag = (args: string[], positive: string, negative: string): boolean | undefined => {
  if (args.includes(positive)) return true
  if (args.includes(negative)) return false
  return undefined
}

const printOutput = <T>(args: string[], value: T, render: (value: T) => string) => {
  if (hasFlag(args, '--json')) {
    console.log(JSON.stringify(value, null, 2))
    return
  }
  console.log(render(value))
}

export const printError = (args: string[], error: unknown) => {
  if (hasFlag(args, '--json')) {
    const payload = error instanceof CliError
      ? { ok: false, error: { code: error.code, message: error.message } }
      : { ok: false, error: { message: (error as Error).message } }
    console.error(JSON.stringify(payload, null, 2))
    return
  }
  console.error((error as Error).message)
}

export const runCommand = async ({ store, api, oauth, args }: RuntimeDeps): Promise<boolean> => {
  if (args.length === 0) return false

  if (args[0] === 'doctor') {
    const report = await getDoctorReport(store)
    printOutput(args, report, renderDoctorReport)
    process.exitCode = report.ok ? 0 : 1
    return true
  }

  try {
    if (args[0] === 'auth' && args[1] === 'login') {
      const result = await startAuthLogin(store, {
        profile: getFlagValue(args, '--profile'),
        clientId: getFlagValue(args, '--client-id'),
        clientSecret: getFlagValue(args, '--client-secret'),
        redirectUri: getFlagValue(args, '--redirect-uri'),
        scopes: getFlagValue(args, '--scopes') ? [getFlagValue(args, '--scopes') as string] : undefined,
      })
      printOutput(args, result, renderAuthLogin)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'auth' && args[1] === 'exchange') {
      const result = await completeAuthExchange(store, oauth, { profile: getFlagValue(args, '--profile'), code: getFlagValue(args, '--code') })
      printOutput(args, result, renderAuthExchange)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'auth' && args[1] === 'status') {
      const status = await getAuthStatus(store)
      printOutput(args, status, renderAuthStatus)
      process.exitCode = status.ok ? 0 : 1
      return true
    }

    if (args[0] === 'auth' && args[1] === 'import') {
      const result = await importAuthToken(store, {
        profile: getFlagValue(args, '--profile'),
        accessToken: getFlagValue(args, '--access-token'),
        refreshToken: getFlagValue(args, '--refresh-token'),
        expiresAt: getFlagValue(args, '--expires-at'),
        clientId: getFlagValue(args, '--client-id'),
        clientSecret: getFlagValue(args, '--client-secret'),
        redirectUri: getFlagValue(args, '--redirect-uri'),
        scopes: getFlagValue(args, '--scopes') ? [getFlagValue(args, '--scopes') as string] : undefined,
      })
      printOutput(args, result, renderAuthImport)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'auth' && args[1] === 'logout') {
      const result = await logoutAuth(store)
      printOutput(args, result, renderAuthLogout)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'me') {
      const profile = await getCurrentProfile(api)
      printOutput(args, profile, (value) => renderProfile('me: ok', value))
      process.exitCode = 0
      return true
    }

    if (args[0] === 'user' && args[1]) {
      const profile = await getUserProfile(api, args[1])
      printOutput(args, profile, (value) => renderProfile('user: ok', value))
      process.exitCode = 0
      return true
    }

    if (args[0] === 'posts' && args[1] === 'list') {
      const posts = await listPosts(api, parseIntegerFlag(args, '--limit'), getFlagValue(args, '--after'))
      printOutput(args, posts, renderPostsList)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'post' && args[1] === 'create') {
      const text = getFlagValue(args, '--text') || args.slice(2).join(' ').trim() || undefined
      const mediaUrls = [...getFlagValues(args, '--media-url'), ...getFlagValues(args, '--media')]
      const created = await createPost(api, {
        text,
        mediaUrl: mediaUrls[0],
        mediaUrls,
        mediaType: getFlagValue(args, '--media-type') as 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | undefined,
        altText: getFlagValue(args, '--alt-text'),
        replyToId: getFlagValue(args, '--reply-to'),
        quotePostId: getFlagValue(args, '--quote'),
        replyControl: getFlagValue(args, '--reply-control') as 'everyone' | 'accounts_you_follow' | 'mentioned_only' | undefined,
        waitForPublish: parseBooleanFlag(args, '--wait', '--no-wait'),
        publishPollIntervalMs: parseIntegerFlag(args, '--publish-poll-ms'),
        publishTimeoutMs: parseIntegerFlag(args, '--publish-timeout-ms'),
      })
      printOutput(args, created, (value) => renderPostCreated(value.id, value.creationId, value.mediaType, value.containerStatus))
      process.exitCode = 0
      return true
    }

    if (args[0] === 'post' && args[1] === 'delete' && args[2]) {
      const deleted = await deletePost(api, args[2])
      printOutput(args, deleted, (value) => renderPostDeleted(value.id))
      process.exitCode = 0
      return true
    }

    if (args[0] === 'replies' && args[1] === 'list' && args[2]) {
      const replies = await listReplies(api, args[2], getFlagValue(args, '--after'))
      printOutput(args, replies, renderRepliesList)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'replies' && args[1] === 'hide' && args[2]) {
      const result = await hideReply(api, args[2])
      printOutput(args, result, renderReplyManaged)
      process.exitCode = 0
      return true
    }

    if (args[0] === 'replies' && args[1] === 'unhide' && args[2]) {
      const result = await unhideReply(api, args[2])
      printOutput(args, result, renderReplyManaged)
      process.exitCode = 0
      return true
    }
  } catch (error) {
    printError(args, error)
    process.exitCode = 1
    return true
  }

  return false
}
