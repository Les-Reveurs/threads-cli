import { cac } from 'cac'

import { FileConfigStore } from './infra/config/file-config.store.js'
import { HybridThreadsApiAdapter } from './infra/api/hybrid-threads-api.adapter.js'
import { ThreadsOAuthAdapter } from './infra/oauth/threads-oauth.adapter.js'
import { runCommand } from './app/commands/runtime.js'

const cli = cac('threads')
cli.command('doctor', 'check local environment and configuration')
cli.command('auth login', 'start OAuth login flow')
cli.command('auth exchange', 'exchange OAuth code for an access token')
cli.command('auth status', 'show local auth status')
cli.command('auth import', 'store auth tokens/config for non-interactive CI or local automation')
cli.command('auth login-unofficial', 'store credentials for the unofficial Threads login flow')
cli.command('auth logout', 'clear locally stored auth data')
cli.command('me', 'show current authenticated profile')
cli.command('user <usernameOrId>', 'show public profile info')
cli.command('posts list', 'list posts for the authenticated account or a public profile via --user <username>')
cli.command('post create [text]', 'create a Threads post')
cli.command('post delete <id>', 'delete an owned Threads post')
cli.command('replies list <postId>', 'list replies for a Threads post')
cli.command('replies hide <replyId>', 'hide a reply')
cli.command('replies unhide <replyId>', 'unhide a reply')
cli.command('mentions list', 'list mentions for the authenticated account')
cli.command('insights post <id>', 'show insights for a Threads post')
cli.command('insights user', 'show account insights for the authenticated user')
cli.help()
cli.version('0.1.0')

const args = process.argv.slice(2)
const store = new FileConfigStore()
const api = new HybridThreadsApiAdapter(store)
const oauth = new ThreadsOAuthAdapter()

if (!(await runCommand({ store, api, oauth, args }))) {
  cli.parse()
}
