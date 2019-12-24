// @ts-ignore
import mockArgv from 'mock-argv'
import { program, Program } from '../src/program'
import { command } from '../src/command'

test('program should return new Program object', () => {
  expect(program()).toBeInstanceOf(Program)
})

test('program executes command with run', async () => {
  await mockArgv(['test', 'bar'], async () => {
    const app = program().add(
      command('test')
        .argument('foo')
        .action(args => {
          expect(args.foo).toBe('bar')
        })
    )
    await app.run()
  })
})
