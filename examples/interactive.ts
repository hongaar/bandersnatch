import { program, command } from '../src'

const cmd = command()
  .argument('name', "What's your name?", {
    prompt: true
  })
  .argument('question', "What's your question?", {
    prompt: true
  })
  .action(args => `Hi ${args.name}, the answer to "${args.question}" is 42.`)

program('Ask me anything')
  .default(cmd)
  .run()
