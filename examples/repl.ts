import { program, command } from '../src'

const red = '\x1b[31m'
const green = '\x1b[32m'
const blue = '\x1b[36m'
const reset = '\x1b[0m'

const echo = command(['echo', 'say'])
  .description('Echo something to the terminal')
  .argument('words', { variadic: true })
  .option('red', { type: 'boolean' })
  .option('green', { type: 'boolean' })
  .option('blue', { type: 'boolean' })
  .action(async function (args) {
    const msg = args.words.join(' ')
    console.log(
      args.red
        ? `${red}${msg}${reset}`
        : args.green
        ? `${green}${msg}${reset}`
        : args.blue
        ? `${blue}${msg}${reset}`
        : msg
    )
  })

const app = program()
  .description('simple repl app')
  .add(echo)
  .withHelp()
  .withVersion()
  .prompt(`${green}command ${blue}$${reset} `)

app.repl().catch((err) => console.error(`${red}${err.message}${reset}`))
