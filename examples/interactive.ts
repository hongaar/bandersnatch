import { program, command } from '../src'

const cmd = command('run', 'Take a survey')
  .argument('question1', 'First question', {
    prompt: true
  })
  .argument('question2', 'Second question', {
    prompt: "What's your favourite food?"
  })
  .action(args => {
    console.log(args)
  })

program('A survey')
  .default(cmd)
  .run()
  .then(() => {
    console.log('Bye!')
  })
