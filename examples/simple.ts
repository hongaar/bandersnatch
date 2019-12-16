import { program, command } from '../src'

const app = program('simple cli app')

const say = command('say', 'Say something to the terminal')
  .argument('word', 'The word to say', { default: 54 })
  .argument('any', 'The word to say', { optional: true, type: 'boolean' })
  .argument('some', 'Say some words', { variadic: true })
  .action(async function(argv) {
    console.log(argv)
  })

app.add(say)

app.run()
