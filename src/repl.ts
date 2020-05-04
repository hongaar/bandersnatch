import nodeRepl, { REPLServer } from 'repl'
import { CompleterResult } from 'readline'
import { Context } from 'vm'
import { parseArgsStringToArgv } from 'string-argv'
import { red } from 'ansi-colors'
import { Program } from './program'
import { autocompleter, Autocompleter } from './autocompleter'

export function repl(program: Program, prefix: string = '> ') {
  return new Repl(program, prefix)
}

export class Repl {
  private server?: REPLServer
  private lastError: string | null = null
  private autocompleter: Autocompleter

  constructor(private program: Program, private prompt: string = '> ') {
    this.autocompleter = autocompleter(program)
  }

  async start() {
    this.server = nodeRepl.start({
      prompt: this.prompt,
      eval: this.eval.bind(this),
      completer: this.completer.bind(this),
      ignoreUndefined: true
    })
  }

  setError(err: string) {
    this.lastError = err
  }

  private async completer(
    line: string,
    cb: (err?: null | Error, result?: CompleterResult) => void
  ) {
    const addSpace = (str: string) => `${str} `
    const argv = parseArgsStringToArgv(line)
    const current = argv.slice(-1).toString()
    const completions = (await this.autocompleter.completions(argv)).map(
      addSpace
    )
    let hits = completions.filter(completion => completion.startsWith(current))

    // Show all completions if none found
    cb(null, [hits.length ? hits : completions, current])
  }

  private async eval(
    line: string,
    context: Context,
    file: string,
    cb: (err: Error | null, result: any) => void
  ) {
    this.lastError = null
    const result = await this.program.run(line.trim())
    if (this.lastError) {
      console.error(red(this.lastError))
    }

    cb(null, result)
  }
}
