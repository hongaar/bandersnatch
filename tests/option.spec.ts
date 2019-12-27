import { option, Option } from '../src/option'

test('option should return new Option object', () => {
  expect(option('test')).toBeInstanceOf(Option)
})
