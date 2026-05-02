import { cac } from 'cac'
import pc from 'picocolors'

import { startAuthLogin } from './lib/auth-login.js'
import { logoutAuth } from './lib/auth-logout.js'
import { getAuthStatus } from './lib/auth-status.js'
import { getDoctorReport } from './lib/doctor.js'
import { renderAuthLogin, renderAuthLogout, renderAuthStatus, renderDoctorReport } from './lib/output.js'

const cli = cac('threads')

const printPlanned = (name: string, note?: string) => {
  console.log(pc.cyan(`planned command: ${name}`))
  console.log(note ?? 'This command is scaffolded but not implemented yet.')
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
    printPlanned('me')
    return true
  }

  if (args[0] === 'user' && args[1]) {
    printPlanned('user', `Lookup target: ${args[1]}`)
    return true
  }

  if (args[0] === 'posts' && args[1] === 'list') {
    printPlanned('posts list')
    return true
  }

  if (args[0] === 'post' && args[1] === 'create') {
    const text = args.slice(2).join(' ').trim()
    printPlanned('post create', text ? `Draft text: ${text}` : undefined)
    return true
  }

  if (args[0] === 'post' && args[1] === 'delete' && args[2]) {
    printPlanned('post delete', `Target post id: ${args[2]}`)
    return true
  }

  return false
}

cli.command('doctor', 'check local environment and configuration')
cli.command('auth login', 'start OAuth login flow')
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
