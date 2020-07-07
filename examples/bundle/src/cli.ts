import { program, command } from 'bandersnatch'

export default program().default(
  command('echo', 'Echo something in the terminal')
    .argument('words', 'Say some kind words', { variadic: true })
    .action(console.log)
)
