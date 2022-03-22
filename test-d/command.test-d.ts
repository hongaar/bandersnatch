import { expectType } from 'tsd'
import { Command, command } from '../src/command'

const cmd = command()

expectType<Command>(cmd)

// Chainable methods
expectType<Command>(cmd.description('foo'))
expectType<Command>(cmd.hidden())
expectType<Command>(cmd.add(cmd))
expectType<Command>(cmd.default())
expectType<Command>(cmd.action(undefined))

// Argument types
cmd.argument('foo').action((args) => {
  // Argument without options
  expectType<{ foo: string }>(args)
})
cmd.argument('foo', { default: 'bar' }).action((args) => {
  // Argument with default
  expectType<{ foo: string }>(args)
})
cmd.argument('foo', { optional: true }).action((args) => {
  // Optional argument
  expectType<{ foo: string }>(args)
})
cmd
  .argument('foo', {
    type: 'number',
  })
  .action((args) => {
    expectType<{ foo: number }>(args)
  })

// Option types
cmd.option('foo').action((args) => {
  expectType<{ foo: unknown }>(args)
})
