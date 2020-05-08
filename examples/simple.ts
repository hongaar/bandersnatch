import { program, command } from '../src'

const echo = command('concat', 'Concatenate input')
  .argument('input', 'List of inputs to concatenate', { variadic: true })
  .option('delimiter', {
    type: 'string',
    alias: 'd',
    default: ' '
  })
  .action(args => {
    console.log(args.input.join(args.delimiter))
  })

program()
  .default(echo)
  .run()
