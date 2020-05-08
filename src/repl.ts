import nodeRepl, { REPLServer } from 'repl'
import { CompleterResult } from 'readline'
import { Context } from 'vm'
import { parseArgsStringToArgv } from 'string-argv'
import { Program } from './program'
import { autocompleter, Autocompleter } from './autocompleter'

export function repl(program: Program, prefix: string = '> ') {
  return new Repl(program, prefix)
}

export class Repl {
  private server?: REPLServer
  private autocompleter: Autocompleter

  private receivedYargsMsg: boolean = false
  private successHandler: (value?: unknown) => void = () => {}
  private errorHandler: (reason?: any) => void = (reason) =>
    console.error(reason)

  constructor(private program: Program, private prompt: string = '> ') {
    this.autocompleter = autocompleter(program)
  }

  /**
   * @todo Add meaningful comments here.
   */
  async start() {
    this.server = nodeRepl.start({
      prompt: this.prompt,
      eval: this.eval.bind(this),
      completer: this.completer.bind(this),
      ignoreUndefined: true,
    })
  }

  public gotYargsMsg() {
    this.receivedYargsMsg = true
  }

  /**
   * Emulates promise.then, but saves the callback instead to be executed on
   * each command which resolves.
   */
  public then(cb: (value?: unknown) => void) {
    this.successHandler = cb
    return this
  }

  /**
   * Emulates promise.catch, but saves the callback instead to be executed on
   * each command which rejects.
   */
  public catch(cb: (reason?: any) => void) {
    this.errorHandler = cb
    return this
  }

  /**
   * @todo Add meaningful comments here.
   */
  private async completer(
    line: string,
    cb: (err?: null | Error, result?: CompleterResult) => void
  ) {
    function addSpace(str: string) {
      return `${str} `
    }
    const argv = parseArgsStringToArgv(line)
    const current = argv.slice(-1).toString()
    const completions = (await this.autocompleter.completions(argv)).map(
      addSpace
    )
    let hits = completions.filter((completion) =>
      completion.startsWith(current)
    )

    // Show all completions if none found
    cb(null, [hits.length ? hits : completions, current])
  }

  /**
   * @todo Add meaningful comments here.
   */
  private async eval(
    line: string,
    context: Context,
    file: string,
    cb: (err: Error | null, result: any) => void
  ) {
    this.receivedYargsMsg = false

    try {
      const result = await this.program.run(line.trim())

      // Execute success handler only if we have not received a msg from yargs,
      // which was probably a validation error.
      this.receivedYargsMsg || this.successHandler(result)
    } catch (error) {
      this.errorHandler(error)
    }

    // The result passed to this function is printed by the Node REPL server,
    // but we don't want to use that, so we pass undefined instead.
    cb(null, undefined)
  }
}
