import { argument, Argument } from '../src'

test('argument should return new Argument object', () => {
  expect(argument('test')).toBeInstanceOf(Argument)
})

test('getName', () => {
  expect(argument('test').getName()).toBe('test')
})

test('getDescription', () => {
  expect(argument('test', 'foo').getDescription()).toBe('foo')
})

test('getOptions', () => {
  expect(argument('test', 'foo', { type: 'number' }).getOptions().type).toBe(
    'number'
  )
})

test('required argument', () => {
  expect(argument('test', 'test').toCommand()).toBe('<test>')
})

test('optional argument', () => {
  expect(argument('test', 'test', { optional: true }).toCommand()).toBe(
    '[test]'
  )
})

test('variadic argument', () => {
  expect(argument('test', 'test', { variadic: true }).toCommand()).toBe(
    '[test..]'
  )
})

test('promptable argument', () => {
  const arg1 = argument('test', 'foo', { prompt: true })
  expect(arg1.getPrompt()).toBe('foo')

  const arg2 = argument('test', undefined, { prompt: true })
  expect(arg2.getPrompt()).toBe('test')

  const arg3 = argument('test', 'foo', { prompt: 'bar' })
  expect(arg3.getPrompt()).toBe('bar')
})
