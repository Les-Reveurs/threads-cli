import { cac } from 'cac'
import pc from 'picocolors'

const cli = cac('threads')

const printPlanned = (name: string, note?: string) => {
  console.log(pc.cyan(`planned command: ${name}`))
  console.log(note ?? 'This command is scaffolded but not implemented yet.')
}

const printDoctor = () => {
  console.log(pc.green('threads-cli is alive 🧵'))
  console.log('Mode: official Threads API first')
  console.log('Scaffolded commands: auth, me, user, posts, post, doctor')
}

const args = process.argv.slice(2)
const route = () => {
  if (args.length === 0) return false

  if (args[0] === 'doctor') {
    printDoctor()
    return true
  }

  if (args[0] === 'auth' && args[1] === 'login') {
    printPlanned('auth login', 'OAuth flow will be implemented against the official Threads API.')
    return true
  }

  if (args[0] === 'auth' && args[1] === 'status') {
    printPlanned('auth status')
    return true
  }

  if (args[0] === 'auth' && args[1] === 'logout') {
    printPlanned('auth logout')
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

if (!route()) {
  cli.parse()
}
