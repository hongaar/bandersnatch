import { Program } from './program'
import { isPromise } from './utils'

export function autocompleter(program: Program) {
  return new Autocompleter(program)
}

export class Autocompleter {
  constructor(private program: Program) {}

  completions(argv: string[]) {
    return this.yargsCompletions(argv)
  }

  private yargsCompletions(argv: string[]) {
    return new Promise<string[]>((resolve, reject) => {
      // We need to override 'strip-dashed' to make sure yargs can find the
      // '--get-yargs-completions' option.
      const yargs = this.program.createYargsInstance({ 'strip-dashed': false })

      // yargs.getCompletion() doesn't work for our use case.
      yargs.parse(
        ['$0', '--get-yargs-completions', '$0', ...argv],
        {},
        (err, argv, output) => {
          // We don't use yargs 17 promise style argv
          if (isPromise(argv)) {
            throw new Error('argv is of unexpected type')
          }

          if (argv.getYargsCompletions) {
            resolve(output ? output.split('\n') : [])
          }
        }
      )
    })
  }
}
