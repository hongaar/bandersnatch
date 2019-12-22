import { program, command } from '../src'

const echo = command('echo', 'Echo something in the terminal')
  .argument('words', 'Say some kind words', { variadic: true })
  .action(args => args.words.join(' '))

program()
  .add(echo)
  .run()
  .print()
