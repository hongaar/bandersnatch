import { program, command, Command, argument } from '../src'

test('command should return new Command object', () => {
  expect(command('test')).toBeInstanceOf(Command)
})

test('variadic argument must be last', () => {
  const cmd = command('test')
  cmd.add(argument('var').configure({ variadic: true }))
  expect(() => {
    cmd.add(argument('reg'))
  }).toThrowErrorMatchingSnapshot()
})

test('handler should be executed', done => {
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
