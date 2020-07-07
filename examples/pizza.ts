import { program, command } from '../src'

const cmd = command()
  .argument('address', {
    prompt: 'Your address',
  })
  .option('name', {
    description: 'Your name',
    default: 'anonymous',
    prompt: true,
  })
  .option('size', {
    description: 'Choose pizza size',
    choices: ['small', 'medium', 'large'],
    default: 'medium',
    prompt: true,
  })
  .option('toppings', {
    description: 'Pick some toppings',
    choices: ['mozzarella', 'pepperoni', 'veggies'],
    default: ['mozzarella'],
    prompt: true,
  })
  .option('confirmed', {
    description: 'Order pizza?',
    default: true,
    prompt: true,
  })
  .action((args) => {
    console.log(args)
  })

program().description('Order food').default(cmd).run()
