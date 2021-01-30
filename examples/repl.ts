import { command, program } from '../src'

let url: string | null = null

const app = program()
  .add(
    command('connect')
      .description('Connect to a server')
      .argument('host', {
        default: 'example.com',
        prompt: true,
      })
      .argument('port', {
        default: '443',
        type: 'number',
        prompt: true,
      })
      .argument('tls', {
        default: true,
        type: 'boolean',
        prompt: true,
      })
      .action(async ({ host, port, tls }) => {
        url = `${tls ? 'https' : 'http'}://${host}:${port}`
        console.log(`Connecting to ${url}...`)
      })
  )
  .add(
    command('disconnect')
      .description('Disconnect from a server')
      .action(async () => {
        if (!url) {
          throw new Error('Not connected')
        }

        console.log(`Disconnecting from ${url}...`)
        url = null
      })
  )

app.runOrRepl()
