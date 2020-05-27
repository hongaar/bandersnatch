import { command, Command, program } from '../src'
import inquirer = require('inquirer')

const prompt = jest.fn()

let outputSpy: jest.MockInstance<any, any>
let errorSpy: jest.MockInstance<any, any>
let promptSpy: jest.MockInstance<any, any>

beforeEach(() => {
  outputSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  promptSpy = jest.spyOn(inquirer, 'prompt').mockImplementation(prompt)
})

afterEach(() => {
  outputSpy.mockRestore()
  errorSpy.mockRestore()
  promptSpy.mockRestore()
})

test('command should return new Command object', () => {
  expect(command('test')).toBeInstanceOf(Command)
})

test('with description', async () => {
  const cmd = command('test').description('foo description')
  await program().add(cmd).withHelp().run('help')
  expect(outputSpy.mock.calls[0][0]).toContain('foo description')
})

test('variadic argument must be last', () => {
  const cmd = command('test').argument('var', { variadic: true })
  expect(() => {
    cmd.argument('reg')
  }).toThrowErrorMatchingSnapshot()
})

test('handler is required', async () => {
  let error
  try {
    await program().add(command('test')).run('test')
  } catch (err) {
    error = err
  }
  expect(error).toMatchSnapshot()
})

test('sync handler should be executed', (done) => {
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
    .action((args) => {
      expect(args.foo).toBe('bar')
    })
  await program().add(cmd).run('test bar')
})

test('argument with description', async () => {
  const cmd = command('test').argument('foo', 'bar description')
  await program().add(cmd).withHelp().run('test --help')
  expect(outputSpy.mock.calls[0][0]).toContain('bar description')
})

test('prompt for argument', async () => {
  prompt.mockReturnValueOnce(Promise.resolve({ foo: 'bar' }))
  const cmd = command('test')
    .argument('foo', { prompt: true })
    .action((args) => {
      expect(args.foo).toBe('bar')
    })
  await program().add(cmd).run('test')
  expect(prompt).toHaveBeenCalled()
})

// Option tests
test('default option', async () => {
  const cmd = command('test')
    .option('foo')
    .action((args) => {
      expect(args.foo).toBe('bar')
    })
  await program().add(cmd).run('test --foo bar')
})

test('option with description', async () => {
  const cmd = command('test').option('foo', 'bar description')
  await program().add(cmd).withHelp().run('test --help')
})

test('prompt for option', async () => {
  prompt.mockReturnValueOnce(Promise.resolve({ foo: 'bar' }))
  const cmd = command('test')
    .option('foo', { prompt: true })
    .action((args) => {
      expect(args.foo).toBe('bar')
    })
  await program().add(cmd).run('test')
  expect(prompt).toHaveBeenCalled()
})
