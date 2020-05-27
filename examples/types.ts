import { program, command } from '../src'

/**
 * Keep in mind that argument/option types are not validated at runtime.
 * For example, when providing a default value with type boolean, it can be set
 * to a string value at runtime.
 */

const string = command('string')
  .argument('arg', { description: 'Required string argument' })
  .option('opt', { description: 'Optional string option', type: 'string' })
  .action((args) => {
    console.log('Args are', args)
  })

const choices = command('choices')
  .argument('arg', {
    description: 'Argument with choices',
    choices: ['foo', 'bar'] as const,
  })
  .option('opt', {
    description: 'Option with choices',
    choices: ['option1', 'option2'] as const,
    default: 'option3',
  })
  .action((args) => {
    console.log('Args are', args)
  })

const defaultValues = command('default')
  .argument('arg', {
    description: 'Optional argument with default value',
    default: 5,
    optional: true,
  })
  .option('opt', { description: 'Default value', default: true })
  .action((args) => {
    console.log('Args are', args)
  })

const app = program()
  .description('All argument and option types')
  .add(string)
  .add(choices)
  .add(defaultValues)

app.withHelp().runOrRepl()
