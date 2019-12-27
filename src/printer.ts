import { red } from 'ansi-colors'

export function printer() {
  return new Printer()
}

export class Printer {
  write(str: unknown) {
    str && console.log(str)
  }

  error(error: unknown) {
    if (typeof error === 'string') {
      console.error(red(error))
    } else if (error instanceof Error) {
      console.error(red(error.stack ?? error.message))
    }
  }
}
