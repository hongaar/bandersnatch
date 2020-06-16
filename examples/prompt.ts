import { program, command } from '../src'

const cmd = command()
  .argument('name', {
    description: 'Your name',
    prompt: true,
  })
  .argument('question', {
    description: 'Your question',
    prompt: true,
  })
  .action((args) => `Hi ${args.name}, the answer to "${args.question}" is 42.`)

program().description('Ask me anything').default(cmd).run().then(console.log)
