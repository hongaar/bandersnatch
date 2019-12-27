import { printer as createPrinter } from '../src'

test('printer writes to stdout', async () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
  const printer = createPrinter()
  printer.write('test')
  expect(spy).toHaveBeenCalledWith('test')
  spy.mockRestore()
})

test('printer writes to stderr', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
  const printer = createPrinter()
  printer.error(new Error('test'))
  // Error name
  expect(spy.mock.calls[0][0]).toContain('Error: test')
  // Stack trace
  expect(spy.mock.calls[0][0]).toContain('printer.spec.ts')
  spy.mockRestore()
})
