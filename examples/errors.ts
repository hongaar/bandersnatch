import { command, program } from '../src'

const app = program()

const syncOk = command('sync')
  .description('Print sync message')
  .action(function () {
    console.log('ok/sync')
  })

const asyncOk = command('async')
  .description('Print async message')
  .action(async function () {
    console.log('ok/async')
  })

const syncNok = command('sync')
  .description('Throw sync error')
  .action(function () {
    throw new Error('nok/sync')
  })

const asyncNok = command('async')
  .description('Throw async error')
  .action(async function () {
    throw new Error('nok/async')
  })

const syncValidation = command('sync')
  .description('Test validation error with sync handler')
  .argument('required')
  .action(function () {
    console.log('call without arguments')
  })

const asyncValidation = command('async')
  .description('Test validation error with async handler')
  .argument('required')
  .action(async function () {
    console.log('call without arguments')
  })

const noHandler = command('no_handler').description(
  'Test missing command handler'
)

// Say bye
const success = (resolved: unknown) => console.log('[success]', resolved)

// Print error message only (omit stack trace) and exit with a meaningful status
const fail = (error: any) => {
  console.error('[failed]', String(error))

  if (!app.isRepl()) {
    process.exit(42)
  }
}

app
  .add(
    command('ok')
      .description('Print message to stdout from handler')
      .add(syncOk)
      .add(asyncOk)
  )
  .add(
    command('nok')
      .description('Throw various errors')
      .add(syncNok)
      .add(asyncNok)
  )
  .add(
    command('validation')
      .description('Validation errors')
      .add(syncValidation)
      .add(asyncValidation)
  )
  .add(noHandler)
  .runOrRepl()
  .then(success)
  .catch(fail)
