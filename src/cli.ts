import { cac } from 'cac'
import pc from 'picocolors'

const cli = cac('threads')

cli
  .command('doctor', 'check local environment and configuration')
  .action(() => {
    console.log(pc.green('threads-cli is alive 🧵'))
    console.log('Next step: define auth, profile, and posting flows.')
  })

cli.help()
cli.version('0.1.0')
cli.parse()
