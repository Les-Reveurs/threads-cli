import { cac } from 'cac'
import pc from 'picocolors'

import { startAuthLogin } from './lib/auth-login.js'
import { completeAuthExchange } from './lib/auth-exchange.js'
import { logoutAuth } from './lib/auth-logout.js'
import { getAuthStatus } from './lib/auth-status.js'
import { getDoctorReport } from './lib/doctor.js'
import { getCurrentProfile, getUserProfile } from './lib/me.js'
import { createTextPost, deletePost, listPosts } from './lib/posts.js'
import { renderAuthExchange, renderAuthLogin, renderAuthLogout, renderAuthStatus, renderDoctorReport, renderPostCreated, renderPostDeleted, renderPostsList, renderProfile } from './lib/output.js'

const cli = cac('threads')

const parseIntegerFlag = (name: string): number | undefined => {
  const value = getFlagValue(name)
  if (!value) return undefined

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const printDoctor = async () => {
  const report = await getDoctorReport()
  console.log(renderDoctorReport(report))
  process.exitCode = report.ok ? 0 : 1
}

const args = process.argv.slice(2)

const getFlagValue = (name: string): string | undefined => {
  const index = args.indexOf(name)
  if (index === -1) return undefined

  return args[index + 1]?.startsWith('--') ? undefined : args[index + 1]
}

const route = async () => {
  if (args.length === 0) return false

  if (args[0] === 'doctor') {
    await printDoctor()
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

      console.log(renderAuthLogin(result))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
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

      console.log(renderAuthExchange(result))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'auth' && args[1] === 'status') {
    const status = await getAuthStatus()
    console.log(renderAuthStatus(status))
    process.exitCode = status.ok ? 0 : 1
    return true
  }

  if (args[0] === 'auth' && args[1] === 'logout') {
    const result = await logoutAuth()
    console.log(renderAuthLogout(result))
    process.exitCode = 0
    return true
  }

  if (args[0] === 'me') {
    try {
      const profile = await getCurrentProfile()
      console.log(renderProfile('me: ok', profile))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'user' && args[1]) {
    try {
      const profile = await getUserProfile(args[1])
      console.log(renderProfile('user: ok', profile))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'posts' && args[1] === 'list') {
    try {
      const posts = await listPosts(parseIntegerFlag('--limit'), getFlagValue('--after'))
      console.log(renderPostsList(posts))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
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
      console.log(renderPostCreated(created.id, created.creationId))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
      process.exitCode = 1
    }

    return true
  }

  if (args[0] === 'post' && args[1] === 'delete' && args[2]) {
    try {
      const deleted = await deletePost(args[2])
      console.log(renderPostDeleted(deleted.id))
      process.exitCode = 0
    } catch (error) {
      console.error((error as Error).message)
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
