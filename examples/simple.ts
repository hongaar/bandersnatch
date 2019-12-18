import { program, command } from '../src'

const app = program('simple cli app')

const say = command('say', 'Say something to the terminal')
  .argument('word', 'The word to say')
  .argument('any', 'Maybe another', { optional: true })
  .argument('some', 'Say some words', { variadic: true, type: 'number' })
  .option('cache', 'Use cache', { type: 'boolean' })
  .action(function(args) {
    console.log(args)
  })

const cmd = command('say', 'Say something to the terminal')
  .argument('word', 'The word to say')
  .argument('any', 'The word to say', { optional: true })
  .argument('some', 'Say some words', { variadic: true, type: 'number' })
  .option('cache', 'Use cache', { type: 'boolean' })
  .action(function(args) {
    console.log(args)
  })

app.add(cmd)
app.run()
