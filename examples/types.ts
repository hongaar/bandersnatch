import { command, program } from '../src'

/**
 * Keep in mind that argument/option types are not validated at runtime.
 * For example, when providing a default value with type boolean, it can be set
 * to a string value at runtime.
 */

const string = command('string')
  .argument('arg1', { description: 'Required string argument' })
  .argument('arg2', { optional: true, description: 'Optional string argument' })
  .argument('arg3', { variadic: true, description: 'Variadic string argument' })
  .option('opt1', { type: 'string', description: 'String option' })
  .option('opt2', {
    default: 'foo',
    description: 'String option with default',
  })
  .action((args) => {
    console.log('Args are', args)
  })

const number = command('number')
  .argument('arg1', { type: 'number', description: 'Required number argument' })
  .argument('arg2', {
    type: 'number',
    optional: true,
    description: 'Optional number argument',
  })
  .argument('arg3', {
    type: 'number',
    variadic: true,
    description: 'Variadic number argument',
  })
  .option('opt1', { type: 'number', description: 'number option' })
  .option('opt2', { default: 100, description: 'Number option with default' })
  .action((args) => {
    console.log('Args are', args)
  })

const boolean = command('boolean')
  .argument('arg1', {
    type: 'boolean',
    description: 'Required boolean argument',
  })
  .argument('arg2', {
    type: 'boolean',
    optional: true,
    description: 'Optional boolean argument',
  })
  .argument('arg3', {
    type: 'boolean',
    variadic: true,
    description: 'Variadic boolean argument',
  })
  .option('opt1', { type: 'boolean', description: 'number option' })
  .option('opt2', {
    type: 'boolean',
    default: false,
    description: 'Number option with default',
  })
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
  .add(number)
  .add(boolean)
  .add(choices)
  .add(defaultValues)

app.runOrRepl()
