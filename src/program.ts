import { Argv } from 'yargs'
import createYargs from 'yargs/yargs'
import { yellow } from 'ansi-colors'
import { Command, command } from './command'
import { Repl, repl } from './repl'
import { Arguments } from './command'
import { isPromise } from './utils'

type ErrorHandler = (error: Error | unknown, args: Arguments) => void

type SuccessHandler = (resolved: unknown) => void

type ProgramOptions = {
  /**
   * Whether or not to add a global help command that displays an overview of
   * commands. Can also be enabled by calling `program().withHelp()`.
   *
   * Defaults to `false`.
   */
  help?: boolean

  /**
   * Whether or not to add a global version command that displays the version as
   * specified in the package.json file. Can also be enabled by calling
   * `program().withVersion()`.
   *
   * Defaults to `false`.
   */
  version?: boolean

  /**
   * Specifies a custom error handler. Can also be set by calling
   * `program().onError()`.
   */
  errorHandler?: ErrorHandler

  /**
   * Specifies a custom success handler. Can also be set by calling
   * `program().onSuccess()`.
   */
  successHandler?: SuccessHandler

  /**
   * Sets a custom REPL prompt.
   *
   * Defaults to `>`.
   */
  prompt?: string
}

/**
 * Creates a new bandersnatch program.
 */
export function program(description?: string, options: ProgramOptions = {}) {
  return new Program(description, options)
}

export class Program {
  private commands: Command<any>[] = []
  private replInstance?: Repl

  constructor(
    private description?: string,
    private options: ProgramOptions = {}
  ) {}

  /**
   * Create a new yargs instance. This method may change at any time, not
   * intended for public use.
   *
   * @private
   */
  public createYargsInstance() {
    const yargs = createYargs()

    this.description && yargs.usage(this.description)

    // Help accepts boolean
    yargs.help(!!this.options.help)

    // Version must be false or undefined
    !!this.options.version ? yargs.version() : yargs.version(false)

    // Non-configurable options
    yargs.recommendCommands()
    yargs.strict()
    yargs.demandCommand()

    // Hidden completion command
    yargs.completion('completion', false)

    // Custom fail function.
    yargs.fail(this.failHandler.bind(this))

    // In case we're in a REPL session, do not exit on errors.
    yargs.exitProcess(!this.replInstance)

    // Add commands
    this.commands.forEach(command => {
      command.toYargs(yargs)
    })

    return yargs
  }

  /**
   * Adds a new command to the program.
   */
  public add<T>(command: Command<T>) {
    this.commands.push(command)
    return this
  }

  /**
   * Adds a new command to the program and marks it as the default command.
   */
  public default<T>(command: Command<T>) {
    this.commands.push(command.default())
    return this
  }

  /**
   * Adds a global help command that displays an overview of commands.
   */
  public withHelp() {
    this.options.help = true
    return this
  }

  /**
   * Adds a global version command that displays the version as specified in the
   * package.json file.
   */
  public withVersion() {
    this.options.version = true
    return this
  }

  /**
   * Sets a custom REPL prompt.
   */
  public prompt(prompt: string) {
    this.options.prompt = prompt
    return this
  }

  /**
   * Specifies a custom error handler.
   */
  public onError(fn: ErrorHandler) {
    this.options.errorHandler = fn
    return this
  }

  /**
   * Specifies a custom success handler.
   */
  public onSuccess(fn: SuccessHandler) {
    this.options.successHandler = fn
    return this
  }

  /**
   * Evaluate command (or process.argv) and return promise.
   */
  public run(command?: string | ReadonlyArray<string>) {
    const cmd = command || process.argv.slice(2)

    // Set executor to promise resolving to the return value of the command
    // handler.
    return new Promise((resolve, reject) => {
      this.createYargsInstance().parse(
        cmd,
        {},
        (err, argv: Arguments, output) => {
          /**
           * From the yargs docs:
           * > any text that would have been output by yargs to the terminal,
           * > had a callback not been provided.
           * http://yargs.js.org/docs/#api-parseargs-context-parsecallback
           *
           * Seems that this is primarily used for built-in commands like
           * --version and --help.
           */
          if (output) {
            console.log(output)
          }

          /**
           * From the yargs docs:
           * > Populated if any validation errors raised while parsing.
           * http://yargs.js.org/docs/#api-parseargs-context-parsecallback
           */
          if (err) {
            console.error(err)
          }

          if (isPromise(argv.__promise)) {
            // Delegate resolve/reject to promise returned from handler
            argv.__promise.then(resolve).catch(reject)
          } else {
            // Resolve with void if promise is not available, which is the case
            // with e.g. --version and --help
            resolve()
          }
        }
      )
    })
  }

  /**
   * Run event loop which reads command from stdin.
   */
  public repl() {
    this.replInstance = repl(this, this.options.prompt)

    // Add exit command
    this.add(
      command('exit', 'Exit the application').action(() => {
        process.exit()
      })
    )

    this.replInstance.start()
  }

  /**
   * When invoked with arguments, run the program, otherwise start repl loop.
   */
  public runOrRepl() {
    process.argv.slice(2).length ? this.run() : this.repl()
  }

  /**
   * ...
   */
  private failHandler(msg: string, err: Error, yargs: Argv) {
    // TODO needs more use-cases: only do something when msg is set, and have
    // errors always handled in the runner?

    if (this.replInstance) {
      // In case we're in a REPL session, forward the message which may
      // originate from yargs. Errors are handled in the runner.
      msg && this.replInstance.setError(msg)
    } else {
      const args = yargs.argv
      const usage = (yargs.help() as unknown) as string
      const cb = () => {
        if (this.options.errorHandler) {
          // Call custom fail function.
          this.options.errorHandler(msg, err, args, usage)
        } else {
          // Call default fail function.
          this.errorHandler(msg, err, args, usage)
        }
      }

      // We call the fail function in the runner chain if available, to give
      // async printer a chance to complete first.
      this.runnerInstance
        ? this.runnerInstance.then(cb)
        : Promise.resolve().then(cb)
    }
  }

  private errorHandler: ErrorHandler = (error, args) => {
    if (msg) {
      console.error(yellow(msg))
    }

    if (usage) {
      console.error('')
      console.error(usage)
    }

    process.exit(1)
  }
}
