import { argument, Argument } from '../src/argument'

test('argument should return new Argument object', () => {
  expect(argument('test')).toBeInstanceOf(Argument)
})
