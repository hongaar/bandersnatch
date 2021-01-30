import { Prompt } from 'enquirer'
import { CompleterResult } from 'readline'
import nodeRepl, { REPLServer } from 'repl'
import { parseArgsStringToArgv } from 'string-argv'
import { Context } from 'vm'
import { autocompleter, Autocompleter } from './autocompleter'
import { History } from './history'
import { Program } from './program'

/**
 * Create new REPL instance.
 */
export function repl(program: Program) {
  return new Repl(program)
}

export class Repl {
  private server?: REPLServer
  private history?: History
  private autocompleter: Autocompleter

  private successHandler: (value?: unknown) => void = () => {}
  private errorHandler: (reason?: any) => void = (reason) =>
    console.error(reason)

  constructor(private program: Program) {
    this.autocompleter = autocompleter(program)

    // Stop the server to avoid eval'ing stdin from prompts
    this.program.on('run', () => {
      this.stop()
    })
  }

  attachHistory(history: History) {
    this.history = history
  }

  /**
   * Start the REPL server. This method may change at any time, not
   * intended for public use.
   *
   * @private
   */
  public async start() {
    this.server = nodeRepl.start({
      prompt: this.program.options.prompt,
      eval: this.eval.bind(this),
      completer: this.completer.bind(this),
      ignoreUndefined: true,
    })

    // Setup history 
    this.history?.hydrateReplServer(this.server)


    // Fixes bug with hidden cursor after enquirer prompt
    // @ts-ignore
    new Prompt().cursorShow()
  }

  public stop() {
    this.server?.close()
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
   * Invokes the autocompleter and passes results to the REPL server.
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
   * Uses the bandersnatch program to run commands received by the REPL server.
   */
  private async eval(
    line: string,
    context: Context,
    file: string,
    cb: (err: Error | null, result: any) => void
  ) {
    try {
      const result = await this.program.run(line.trim())
      this.successHandler(result)
    } catch (error) {
      this.errorHandler(error)
    }

    // Since we stop the server when a command is executed (by listening to the
    // 'run' event in the constructor), we need to start a new instance when the
    // command is finished.
    this.start()

    // The result passed to this function is printed by the Node REPL server,
    // but we don't want to use that, so we pass undefined instead.
    cb(null, undefined)
  }
}
