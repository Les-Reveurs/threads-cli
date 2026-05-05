import { cac } from 'cac'

import { startAuthLogin } from './lib/auth-login.js'
import { completeAuthExchange } from './lib/auth-exchange.js'
import { logoutAuth } from './lib/auth-logout.js'
import { getAuthStatus } from './lib/auth-status.js'
import { getDoctorReport } from './lib/doctor.js'
import { getCurrentProfile, getUserProfile } from './lib/me.js'
import { createTextPost, deletePost, listPosts } from './lib/posts.js'
import { renderAuthExchange, renderAuthLogin, renderAuthLogout, renderAuthStatus, renderDoctorReport, renderPostCreated, renderPostDeleted, renderPostsList, renderProfile } from './lib/output.js'
import { ThreadsCliError } from './lib/threads-api.js'

const cli = cac('threads')

const parseIntegerFlag = (name: string): number | undefined => {
  const value = getFlagValue(name)
  if (!value) return undefined

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const args = process.argv.slice(2)

const getFlagValue = (name: string): string | undefined => {
  const index = args.indexOf(name)
  if (index === -1) return undefined

  return args[index + 1]?.startsWith('--') ? undefined : args[index + 1]
}

const hasFlag = (name: string): boolean => args.includes(name)

const printOutput = <T>(value: T, render: (value: T) => string) => {
  if (hasFlag('--json')) {
    console.log(JSON.stringify(value, null, 2))
    return
  }

  console.log(render(value))
}

const printError = (error: unknown) => {
  if (hasFlag('--json')) {
    const payload = error instanceof ThreadsCliError
      ? { ok: false, error: { code: error.code, message: error.message } }
      : { ok: false, error: { message: (error as Error).message } }

    console.error(JSON.stringify(payload, null, 2))
    return
  }

  console.error((error as Error).message)
}

const route = async () => {
  if (args.length === 0) return false

  if (args[0] === 'doctor') {
    const report = await getDoctorReport()
    printOutput(report, renderDoctorReport)
    process.exitCode = report.ok ? 0 : 1
    return true
  }

  if (args[0] === 'auth' && args[1] === 'login') {
    try {
      const result = await startAuthLogin({
        profile: getFlagValue('--profile'),
        clientId: getFlagValue('--client-id'),
        clientSecret: getFlagValue('--client-secret'),
        redirectUri: getFlagValue('--redirect-uri'),
        scopes: getFlagValue('--scopes') ? [getFlagValue('--scopes') as string] : undefined,
      })

      printOutput(result, renderAuthLogin)
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'auth' && args[1] === 'exchange') {
    try {
      const result = await completeAuthExchange({
        profile: getFlagValue('--profile'),
        code: getFlagValue('--code'),
      })

      printOutput(result, renderAuthExchange)
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'auth' && args[1] === 'status') {
    const status = await getAuthStatus()
    printOutput(status, renderAuthStatus)
    process.exitCode = status.ok ? 0 : 1
    return true
  }

  if (args[0] === 'auth' && args[1] === 'logout') {
    const result = await logoutAuth()
    printOutput(result, renderAuthLogout)
    process.exitCode = 0
    return true
  }

  if (args[0] === 'me') {
    try {
      const profile = await getCurrentProfile()
      printOutput(profile, (value) => renderProfile('me: ok', value))
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'user' && args[1]) {
    try {
      const profile = await getUserProfile(args[1])
      printOutput(profile, (value) => renderProfile('user: ok', value))
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'posts' && args[1] === 'list') {
    try {
      const posts = await listPosts(parseIntegerFlag('--limit'), getFlagValue('--after'))
      printOutput(posts, renderPostsList)
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'post' && args[1] === 'create') {
    try {
      const text = getFlagValue('--text') || args.slice(2).join(' ').trim()
      if (!text) {
        throw new Error('post text is required (pass [text] or --text)')
      }

      const created = await createTextPost(text)
      printOutput(created, (value) => renderPostCreated(value.id, value.creationId))
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'post' && args[1] === 'delete' && args[2]) {
    try {
      const deleted = await deletePost(args[2])
      printOutput(deleted, (value) => renderPostDeleted(value.id))
      process.exitCode = 0
    } catch (error) {
      printError(error)
      process.exitCode = 1
    }

    return true
  }

  return false
}

cli.command('doctor', 'check local environment and configuration')
cli.command('auth login', 'start OAuth login flow')
cli.command('auth exchange', 'exchange OAuth code for an access token')
cli.command('auth status', 'show local auth status')
cli.command('auth logout', 'clear locally stored auth data')
cli.command('me', 'show current authenticated profile')
cli.command('user <usernameOrId>', 'show public profile info')
cli.command('posts list', 'list posts for the authenticated account')
cli.command('post create [text]', 'create a Threads post')
cli.command('post delete <id>', 'delete an owned Threads post')

cli.help()
cli.version('0.1.0')

if (!(await route())) {
  cli.parse()
}
