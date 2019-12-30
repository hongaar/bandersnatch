import { program, command } from '../src'
import { blue, red, dim } from 'ansi-colors'

const echo = command(['echo', 'say'], 'Echo something to the terminal')
  .argument('words', { variadic: true })
  .option('blue', { type: 'boolean' })
  .option('red', { type: 'boolean' })
  .action(async function(args) {
    const str = args.words.join(' ')
    console.log(args.blue ? blue(str) : args.red ? red(str) : str)
  })

const app = program('simple repl app')
  .add(echo)
  .withHelp()
  .withVersion()
  .prompt(`${dim('command')} ${blue('$')} `)

app.repl()
