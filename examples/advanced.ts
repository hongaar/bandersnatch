import { program, command } from '../src'

const error = command('error', 'Throw various errors')

const sync = command('sync', 'Throw sync error').action(function() {
  throw new Error('Sync error')
})
const async = command('async', 'Throw async error').action(async function() {
  throw new Error('Async error')
})

error.add(sync)
error.add(async)

program('Showcase of advanced features')
  .add(error)
  .withHelp()
  .withVersion()
  .run()
