import { option, Option } from '../src'

test('option should return new Option object', () => {
  expect(option('test')).toBeInstanceOf(Option)
})
