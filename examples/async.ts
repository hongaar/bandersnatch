import { command, program } from '../src/index.js'

const async = command('test')
  .argument('arg', { choices: ['apple', 'pear'] as const })
  // .argument('sync-arg', { choices: () => ['apple', 'pear'] })
  // .argument('async-arg', { choices: async () => ['apple', 'pear'] })
  .option('opt', { choices: ['apple', 'pear'] as const })
  // .argument('sync-opt', { choices: () => ['apple', 'pear'] })
  // .argument('async-opt', { choices: async () => ['apple', 'pear'] })
  .action((args) => {
    console.log('Args are', args)
  })

const app = program()
  .description('Async arguments and option choices')
  .add(async)

app.runOrRepl()
