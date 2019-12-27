// @ts-ignore
import mockArgv from 'mock-argv'
import { program, Program } from '../src/program'
import { command } from '../src/command'

test('program should return new Program object', () => {
  expect(program()).toBeInstanceOf(Program)
})

test('program executes command', async () => {
  const app = program().add(
    command('test').action(() => {
      return 'foo'
    })
  )
  await expect(app.eval('test')).resolves.toBe('foo')
})

test('program executes argv', async () => {
  await mockArgv(['test'], async () => {
    const app = program().add(
      command('test').action(() => {
        return 'foo'
      })
    )
    await expect(app.eval()).resolves.toBe('foo')
  })
})

test('program writes command return value to stdout', async () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
  const app = program().add(
    command('test').action(() => {
      return 'foo'
    })
  )
  await app.run('test')
  expect(spy).toHaveBeenCalledWith('foo')
  spy.mockRestore()
})

test('program writes command error to stderr and exits', async () => {
  const spyLog = jest.spyOn(console, 'error').mockImplementation(() => {})
  const app = program().add(
    command('test').action(() => {
      throw new Error('foo')
    })
  )
  // Custom fail function to prevent exiting
  await app.fail(() => {}).run('test')
  expect(spyLog.mock.calls[0][0]).toContain('Error: foo')
  spyLog.mockRestore()
})
