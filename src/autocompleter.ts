import { Program } from './program'

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
      const yargs = this.program.createYargsInstance()

      // yargs.getCompletion() doesn't work for our use case.
      yargs.parse(
        ['$0', '--get-yargs-completions', '$0', ...argv],
        {},
        (err, argv, output) => {
          if (argv.getYargsCompletions) {
            resolve(output ? output.split('\n') : [])
          }
        }
      )
    })
  }
}
