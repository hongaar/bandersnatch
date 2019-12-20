import { program, command, argument } from '../src'

type Args = { number: number[] }

const number = argument('number', undefined, { type: 'number', variadic: true })

const makeOutput = function(op: string, initial = 0) {
  return function(args: Args) {
    console.log(
      args.number.reduce((sum, arg) => eval(`${sum} ${op} ${arg}`), initial)
    )
  }
}

program('calculator')
  .add(
    command('add', 'Add two or more numbers together')
      .add(number)
      .action(makeOutput('+'))
  )
  .add(
    command('multiply', 'Multiply two or more numbers')
      .add(number)
      .action(makeOutput('*', 1))
  )
  .withHelp()
  .withVersion()
  .run()
