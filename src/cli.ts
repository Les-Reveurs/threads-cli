import { cac } from 'cac'

import { FileConfigStore } from './infra/config/file-config.store.js'
import { ThreadsApiAdapter } from './infra/api/threads-api.adapter.js'
import { ThreadsOAuthAdapter } from './infra/oauth/threads-oauth.adapter.js'
import { runCommand } from './app/commands/runtime.js'

const cli = cac('threads')
cli.command('doctor', 'check local environment and configuration')
cli.command('auth login', 'start OAuth login flow')
cli.command('auth exchange', 'exchange OAuth code for an access token')
cli.command('auth status', 'show local auth status')
cli.command('auth import', 'store auth tokens/config for non-interactive CI or local automation')
cli.command('auth logout', 'clear locally stored auth data')
cli.command('me', 'show current authenticated profile')
cli.command('user <usernameOrId>', 'show public profile info')
cli.command('posts list', 'list posts for the authenticated account')
cli.command('post create [text]', 'create a Threads post')
cli.command('post delete <id>', 'delete an owned Threads post')
cli.help()
cli.version('0.1.0')

const args = process.argv.slice(2)
const store = new FileConfigStore()
const api = new ThreadsApiAdapter(store)
const oauth = new ThreadsOAuthAdapter()

if (!(await runCommand({ store, api, oauth, args }))) {
  cli.parse()
}
