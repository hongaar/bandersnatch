import { program, command } from '../src'

const say = command('say', 'Say something to the terminal')
  .argument('word', 'The word to say')
  .argument('any', 'Maybe another', { optional: true })
  .argument('some', 'Say some words', { variadic: true, type: 'number' })
  .option('cache', 'Use cache', { type: 'boolean' })
  .action(function(args) {
    console.log(args)
  })

program('simple cli app')
  .add(say)
  .prompt('repl:')
  .repl()
