import {
  Autocompleter,
  autocompleter as createAutocompleter,
  command,
  program as createProgram,
} from '../../src/index.js'

test('autocompleter should return new Autocompleter object', () => {
  const program = createProgram()
  expect(createAutocompleter(program)).toBeInstanceOf(Autocompleter)
})

test('autocompleter should complete commands', () => {
  const program = createProgram().add(command('test'))
  const autocompleter = createAutocompleter(program)
  expect(autocompleter.completions(['t'])).resolves.toContain('test')
})
