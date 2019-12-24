import { program, command } from 'bandersnatch'

export default program()
  .withHelp()
  .default(
    command('echo', 'Echo something in the terminal')
      .argument('words', 'Say some kind words', { variadic: true })
      .action(console.log)
  )
