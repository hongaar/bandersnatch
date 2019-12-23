import { program, command } from '../src'
import { blue, bgMagenta } from 'ansi-colors'

// All failures vanish into the void
const blackhole = () => {}

// We print errors in blue
const printer = {
  write(str: unknown) {
    str && console.log(str)
  },
  error(error: any) {
    const str = `${bgMagenta('Oh noes!')}\n${blue(error)}`
    console.error(str)
  }
}

program()
  .default(
    command('test').action(() => {
      throw new Error('Test throwing errors')
    })
  )
  .fail(blackhole)
  .eval()
  .print(printer)
