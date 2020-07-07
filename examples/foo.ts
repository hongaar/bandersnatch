import { program, command } from '../src'

const foo = command('foo')
  .description('Outputs "bar".')
  .action(() => console.log('bar'))

program().default(foo).run()
