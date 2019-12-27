import { command, Command, program } from '../src'

let output: jest.MockInstance<any, any>

beforeEach(() => {
  output = jest.spyOn(console, 'log') //.mockImplementation(() => {})
})

afterEach(() => {
  output.mockRestore()
})

test('command should return new Command object', () => {
  expect(command('test')).toBeInstanceOf(Command)
})

test('variadic argument must be last', () => {
  const cmd = command('test').argument('var', { variadic: true })
  expect(() => {
    cmd.argument('reg')
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

// Argument tests
test('default argument', async () => {
  const cmd = command('test')
    .argument('foo')
    .action(args => {
      expect(args.foo).toBe('bar')
    })
  await program()
    .add(cmd)
    .run('test bar')
})

// Argument tests
test.skip('argument with description', async () => {
  const cmd = command('test').argument('foo', 'foo description')
  await program()
    .add(cmd)
    .withHelp()
    .run('help')
  expect(output.mock.calls).toContain('foo description')
})

// Option tests
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
