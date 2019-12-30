import {
  autocompleter as createAutocompleter,
  Autocompleter,
  program as createProgram,
  command
} from '../src'

test('autocompleter should return new Autocompleter object', () => {
  const program = createProgram()
  expect(createAutocompleter(program)).toBeInstanceOf(Autocompleter)
})

test('autocompleter should complete commands', () => {
  const program = createProgram().add(command('test'))
  const autocompleter = createAutocompleter(program)
  expect(autocompleter.completions(['t'])).resolves.toContain('test')
})
