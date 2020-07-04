import { program, command } from '../src'

const cmd = command()
  .argument('name', {
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
  .option('dough', {
    description: 'Choose pizza dough',
    choices: ['regular', 'wholegrain', 'veggie'],
    default: 'regular',
    prompt: true,
  })
  .option('toppings', {
    type: 'array',
    description: 'Choose some toppings',
    choices: ['mozarella', 'pepperoni', 'veggies'],
    default: ['mozarella'],
    prompt: true,
  })
  .option('confirmed', {
    description: 'Please confirm you want to order this pizza now',
    type: 'boolean',
    prompt: true,
  })
  .action(({ name, size, dough, toppings, confirmed }) => {
    if (!confirmed) {
      return console.log('Hope to see you another time.')
    }
    console.log(
      `Hi, ${name}, we'll start baking your pizza with the following options:`,
      { size, dough, toppings }
    )
  })

program().description('Ask me anything').default(cmd).run()
