import { command, program } from '../src/index.js'

const foo = command('foo')
  .description('Outputs "bar".')
  .action(() => console.log('bar'))

program().default(foo).run()
