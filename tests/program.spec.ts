import { program, Program } from '../src'

test('program should return new Program object', () => {
  expect(program()).toBeInstanceOf(Program)
})
