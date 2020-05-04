import { program, command } from '../src'
import { red, bgRed } from 'ansi-colors'

// All failures vanish into the void
const failWithMeaning = () => process.exit(42)

// We print errors in blue
const printer = {
  write(str: unknown) {
    str && console.log(str)
  },
  error(error: any) {
    const str = `${red('‼')} ${bgRed(error)}`
    console.error(str)
  }
}

program()
  .default(
    command().action(() => {
      throw new Error('Test throwing errors')
    })
  )
  .onError(failWithMeaning)
  .eval()
  .print(printer)
