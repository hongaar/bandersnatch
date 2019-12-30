import { runner as createRunner } from '../src'

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

test('finally', async () => {
  let counter = 0
  const result = await createRunner(resolve => {
    resolve('test')
  })
    .eval()
    .finally(() => {
      counter++
    })
    .promise()
  expect(result).toBe('test')
  expect(counter).toBe(1)
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
