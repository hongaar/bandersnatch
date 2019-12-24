import { command, Command } from '../src/command'
import { program } from '../src/program'
import { argument } from '../src/argument'

test('command should return new Command object', () => {
  expect(command('test')).toBeInstanceOf(Command)
})

test('single argument', done => {
  const cmd = command('test')
    .argument('foo')
    .action(args => {
      expect(args.foo).toBe('bar')
      done()
    })
  const app = program().add(cmd)
  app.run('test bar')
})

test('single option', done => {
  const cmd = command('test')
    .option('foo')
    .action(args => {
      expect(args.foo).toBe('bar')
      done()
    })
  const app = program().add(cmd)
  app.run('test --foo bar')
})

test('variadic argument must be last', () => {
  const cmd = command('test')
  cmd.add(argument('var').configure({ variadic: true }))
  expect(() => {
    cmd.add(argument('reg'))
  }).toThrowErrorMatchingSnapshot()
})

test('sync handler should be executed', done => {
  const cmd = command('test').action(() => {
    done()
  })
  const app = program().add(cmd)
  app.run('test')
})

test('async handler should be executed', async () => {
  let handled = false
  const cmd = command('test').action(async () => {
    handled = true
  })
  const app = program().add(cmd)
  await app.run('test')
  expect(handled).toBeTruthy()
})
