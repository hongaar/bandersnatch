import { program, command } from '../src'

const syncOk = command('sync', 'Print sync message').action(function () {
  console.log('ok/sync')
})
const asyncOk = command('async', 'Print sync message').action(
  async function () {
    console.log('ok/async')
  }
)
const syncNok = command('sync', 'Throw sync error').action(function () {
  throw new Error('nok/sync')
})
const asyncNok = command('async', 'Throw async error').action(
  async function () {
    throw new Error('nok/async')
  }
)

// Say bye
const printBye = () => console.log('Bye!')

// Print error message only (omit stack trace) and exit with a meaningful status
const printError = (error: any) => {
  console.error(String(error))
  process.exit(42)
}

program()
  .add(command('ok', 'Print various messages').add(syncOk).add(asyncOk))
  .add(command('nok', 'Throw various errors').add(syncNok).add(asyncNok))
  .runOrRepl()
  .then(printBye)
  .catch(printError)
