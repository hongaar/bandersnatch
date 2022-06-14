import { expectType } from 'tsd'
import { Command, command } from '../../src/command'

const cmd = command()

expectType<Command>(cmd)

// Chainable methods
expectType<Command>(cmd.description('foo'))
expectType<Command>(cmd.hidden())
expectType<Command>(cmd.add(cmd))
expectType<Command>(cmd.default())
expectType<Command>(cmd.action(() => {}))

// String argument types
cmd.argument('foo').action((args) => {
  // No options
  expectType<{ foo: string }>(args)
})
cmd.argument('foo', { default: 'bar' }).action((args) => {
  // With default
  expectType<{ foo: string }>(args)
})
cmd.argument('foo', { optional: true }).action((args) => {
  // Optional
  expectType<{ foo: string | undefined }>(args)
})
cmd.argument('foo', { optional: true, default: 'bar' }).action((args) => {
  // Optional with default
  expectType<{ foo: string }>(args)
})
cmd.argument('foo', { choices: ['bar', 'baz'] as const }).action((args) => {
  // Enum
  expectType<{ foo: 'bar' | 'baz' }>(args)
})
cmd
  .argument('foo', { choices: ['bar', 'baz'] as const, optional: true })
  .action((args) => {
    // Optional enum
    expectType<{ foo: 'bar' | 'baz' | undefined }>(args)
  })

// Numeric argument types
cmd.argument('foo', { type: 'number' }).action((args) => {
  // No options
  expectType<{ foo: number }>(args)
})
cmd.argument('foo', { type: 'number', default: 100 }).action((args) => {
  // With default
  expectType<{ foo: number }>(args)
})
cmd.argument('foo', { default: 100 }).action((args) => {
  // Inferred from default
  expectType<{ foo: number }>(args)
})
cmd.argument('foo', { type: 'number', optional: true }).action((args) => {
  // Optional
  expectType<{ foo: number | undefined }>(args)
})
cmd
  .argument('foo', { type: 'number', optional: true, default: 100 })
  .action((args) => {
    // Optional with default
    expectType<{ foo: number }>(args)
  })
cmd.argument('foo', { optional: true, default: 100 }).action((args) => {
  // Optional inferred from default
  expectType<{ foo: number }>(args)
})

// Boolean argument types
cmd.argument('foo', { type: 'boolean' }).action((args) => {
  // No options
  expectType<{ foo: boolean }>(args)
})
cmd.argument('foo', { type: 'boolean', default: false }).action((args) => {
  // With default
  expectType<{ foo: boolean }>(args)
})
cmd.argument('foo', { default: false }).action((args) => {
  // Inferred from default
  expectType<{ foo: boolean }>(args)
})
cmd.argument('foo', { type: 'boolean', optional: true }).action((args) => {
  // Optional
  expectType<{ foo: boolean | undefined }>(args)
})
cmd
  .argument('foo', { type: 'boolean', optional: true, default: false })
  .action((args) => {
    // Optional with default
    expectType<{ foo: boolean }>(args)
  })
cmd.argument('foo', { optional: true, default: false }).action((args) => {
  // Optional inferred from default
  expectType<{ foo: boolean }>(args)
})

// @todo: option types

// @fixme: unspecified options are omitted by yargs but are always present in
// the args.
