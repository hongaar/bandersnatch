import { isPromise } from '../src/utils'

test('isPromise should return true for promises', () => {
  expect(isPromise(Promise.resolve())).toBe(true)
  const rejected = Promise.reject()
  expect(isPromise(rejected)).toBe(true)
  expect(isPromise(new Promise(() => {}))).toBe(true)
  // Cleanup
  rejected.catch(() => {})
})

test('isPromise should return true for promise-like objects', () => {
  expect(isPromise({ then: () => {} })).toBe(true)
  const promiseFn = () => {}
  promiseFn.then = () => {}
  expect(isPromise(promiseFn)).toBe(true)
})

test('isPromise should return false for non-promises', () => {
  expect(isPromise(true)).toBe(false)
  expect(isPromise('string')).toBe(false)
  expect(isPromise(42)).toBe(false)
  expect(isPromise([])).toBe(false)
  expect(isPromise({})).toBe(false)
  expect(isPromise(() => {})).toBe(false)
})
