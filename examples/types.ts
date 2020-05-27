import { program, command } from '../src'

const string = command('string')
  .argument('arg', 'Required string argument')
  .option('opt', 'Optional string option', { type: 'string' })
  .action((args) => {
    console.log('Args are', args)
  })

const app = program('All argument and option types').add(string)

app.withHelp().runOrRepl()
