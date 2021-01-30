// @ts-ignore
import mockArgv from 'mock-argv'
import { mocked } from 'ts-jest/utils'
import { command, program, Program, Repl } from '../src'

jest.mock('../src/repl', () => {
  return {
    repl: jest.fn().mockImplementation(() => {
      return new MockedRepl()
    }),
    Repl: jest.fn().mockImplementation(() => {
      return MockedRepl
    }),
  }
})

// Repl mock
const replStartFn = jest.fn()
class MockedRepl {
  start = replStartFn
  attachHistory = jest.fn()
}

beforeEach(() => {
  const MockedRepl = mocked(Repl, true)
  MockedRepl.mockClear()
})

test('program should return new Program object', () => {
  expect(program()).toBeInstanceOf(Program)
})

test('program executes command', async () => {
  const app = program().add(
    command('test').action(() => {
      return 'foo'
    })
  )
  await expect(app.run('test')).resolves.toBe('foo')
})

test('program executes argv', async () => {
  await mockArgv(['test'], async () => {
    const app = program().add(
      command('test').action(() => {
        return 'foo'
      })
    )
    await expect(app.run()).resolves.toBe('foo')
  })
})

test('program starts repl', async () => {
  const app = program()
  expect(app.repl()).toBeInstanceOf(MockedRepl)
  expect(replStartFn).toHaveBeenCalled()
})
