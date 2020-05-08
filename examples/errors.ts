import { program, command } from '../src'

// All failures vanish into the void
const exitWithMeaning = () => process.exit(42)

// Print error message only (omit stack trace) and exit with a special status
const printError = (error: any) => {
  console.error(String(error))
  exitWithMeaning()
}

// Say bye
const printBye = () => console.log('Bye!')

program()
  .add(
    command('ok').action(() => {
      console.log("I'm okay, thanks.")
    })
  )
  .add(
    command('nok').action(() => {
      throw new Error('Test throwing errors.')
    })
  )
  .runOrRepl()
  .then(printBye)
  .catch(printError)
