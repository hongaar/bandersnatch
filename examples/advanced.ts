import { program, command } from '../src'

const sync = command('sync', 'Throw sync error').action(function() {
  throw new Error('Sync error')
})
const async = command('async', 'Throw async error').action(async function() {
  throw new Error('Async error')
})

const string = command('string', 'Print a string').action(() => 'Test')
const object = command('object', 'Print an object').action(() => ({
  foo: 'bar',
  bar: 'foo'
}))

program('Showcase of advanced features')
  .add(
    command('error', 'Throw various errors')
      .add(sync)
      .add(async)
  )
  .add(
    command('print', 'Print various things')
      .add(string)
      .add(object)
  )
  .withHelp()
  .withVersion()
  .run()
