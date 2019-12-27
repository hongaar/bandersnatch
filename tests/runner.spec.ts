import { runner as createRunner } from '../src'

// TODO runner seems to be broken

test('eval (resolves)', () => {
  expect(
    createRunner(resolve => {
      resolve('test')
    })
      .eval()
      .promise()
  ).resolves.toBe('test')
})

test('eval (rejects)', () => {
  expect(
    createRunner((resolve, reject) => {
      reject('test')
    }).eval()
  ).rejects.toBe('test')
})

test('then', () => {
  expect(
    createRunner(resolve => {
      resolve('test')
    })
      .eval()
      .then(() => 'foo')
      .promise()
  ).resolves.toBe('foo')
})

test('catch', () => {
  expect(
    createRunner((resolve, reject) => {
      reject('test')
    })
      .eval()
      .catch(() => 'bar')
      .promise()
  ).resolves.toBe('bar')
})

test('finally', () => {
  expect(
    createRunner(resolve => {
      resolve('test')
    })
      .eval()
      .finally(() => 'foo')
      .promise()
  ).resolves.toBe('foo')
})

test('uses custom printer (resolves)', async () => {
  let out
  await createRunner(resolve => {
    resolve('test')
  })
    .eval()
    .print({
      write: str => {
        out = str
      },
      error: err => {}
    })
  expect(out).toBe('test')
})

test('uses custom printer (rejects)', async () => {
  let out
  await createRunner((resolve, reject) => {
    reject('test')
  })
    .eval()
    .print({
      write: str => {},
      error: err => {
        out = err
      }
    })
  expect(out).toBe('test')
})
