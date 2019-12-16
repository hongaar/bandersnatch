import { program, command } from '../src'

const app = program('simple cli app')

const cmd = command('say', 'Say something to the terminal')
  .argument('word', 'The word to say')
  .argument('any', 'The word to say', { optional: true })
  .argument('some', 'Say some words', { variadic: true })
  .action(async function(args) {
    console.log(args)
  })

app.add(cmd)
app.run()
