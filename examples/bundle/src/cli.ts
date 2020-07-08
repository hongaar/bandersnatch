import { program, command } from 'bandersnatch'

export default program().default(
  command('echo')
    .description('Echo something in the terminal')
    .argument('words', { description: 'Say some kind words', variadic: true })
    .action(console.log)
)
