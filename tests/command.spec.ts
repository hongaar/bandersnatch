import { command, Command, argument } from '../src'

test('command should return new Command object', () => {
  expect(command('test')).toBeInstanceOf(Command)
})

test('variadic argument must be the last', () => {
  const cmd = command('cmd')
  const variadicArg = argument('var').variadic()
  const regularArg = argument('reg')
  cmd.add(variadicArg)
  expect(() => {
    cmd.add(regularArg)
  }).toThrowErrorMatchingSnapshot()
})
