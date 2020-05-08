// @ts-ignore
import mockArgv from 'mock-argv'
import { program, Program, command } from '../src'

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
