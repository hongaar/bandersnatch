import { program, command } from '../src'

const echo = command('concat')
  .description('Concatenate input')
  .argument('input', {
    description: 'List of inputs to concatenate',
    variadic: true,
  })
  .option('delimiter', {
    type: 'string',
    alias: 'd',
    default: ' ',
  })
  .action((args) => {
    console.log(args.input.join(args.delimiter))
  })

program().default(echo).run()
