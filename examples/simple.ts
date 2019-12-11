import { program, command } from '../src'

const app = program('simple cli app')

app.add(
  command('say', 'Say something to the terminal')
    .argument('word', 'The word to say', { required: true })
    .action(async function(argv) {
      console.log(argv)
    })
)

app.run()
