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
  .option('greeting', {
    description: 'Use this greeting',
    choices: ['Hi', 'Hey', 'Hiya'],
    default: 'Hi',
    prompt: true,
  })
  .option('save', {
    description: 'Save the message',
    type: 'boolean',
    prompt: true,
  })
  .action((args) => {
    return `${args.greeting} ${args.name}, the answer to "${args.question}" is 42.`
  })

program().description('Ask me anything').default(cmd).run().then(console.log)
