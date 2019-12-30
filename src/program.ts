import { Argv } from 'yargs'
import createYargs from 'yargs/yargs'
import { yellow } from 'ansi-colors'
import { Command, command } from './command'
import { Repl, repl } from './repl'
import { Arguments } from './command'
import { isPromise } from './utils'
import { runner, Runner } from './runner'

type FailFn = (msg: string, err: Error, args: Arguments, usage?: string) => void

type ProgramOptions = {
  help?: boolean
  version?: boolean
  fail?: FailFn
  prompt?: string
  exitOnError?: boolean
}

export function program(description?: string, options: ProgramOptions = {}) {
  return new Program(description, options)
}

export class Program {
  private commands: Command<any>[] = []
  private replInstance?: Repl
  private runnerInstance?: Runner

  constructor(
    private description?: string,
    private options: ProgramOptions = {}
  ) {}

  /**
   * Create a new yargs instance. Not intended for public use.
   */
  createYargsInstance() {
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
    // TODO current yargs types doesn't include the third parameter.
    yargs.fail(this.failHandler.bind(this) as any)

    // Exit on errors?
    yargs.exitProcess(!!this.options.exitOnError)

    // Add commands
    this.commands.forEach(command => {
      command.toYargs(yargs)
    })

    return yargs
  }

  add<T>(command: Command<T>) {
    this.commands.push(command)
    return this
  }

  default<T>(command: Command<T>) {
    this.commands.push(command.default())
    return this
  }

  prompt(prompt: string) {
    this.options.prompt = prompt
    return this
  }

  withHelp() {
    this.options.help = true
    return this
  }

  withVersion() {
    this.options.version = true
    return this
  }

  fail(fn: FailFn) {
    this.options.fail = fn
    return this
  }

  /**
   * Evaluate command (or process.argv) and return runner instance.
   */
  eval(command?: string | ReadonlyArray<string>) {
    const cmd = command || process.argv.slice(2)

    // Set executor to promise resolving to the return value of the command
    // handler.
    this.runnerInstance = runner((resolve, reject) => {
      this.createYargsInstance().parse(
        cmd,
        {},
        (err, argv: Arguments, output) => {
          // Output is a string for built-in commands like --version and --help
          if (output) {
            console.log(output)
          }

          // TODO when is err defined?
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

    return this.runnerInstance.eval()
  }

  /**
   * Run a command (or process.argv) and print output.
   */
  run(command?: string | ReadonlyArray<string>) {
    return this.eval(command).print()
  }

  /**
   * Run event loop which reads command from stdin.
   */
  repl() {
    this.replInstance = repl(this, this.options.prompt)

    // Don't exit on errors.
    this.options.exitOnError = false

    // Add exit command
    this.add(
      command('exit', 'Exit the application').action(() => {
        process.exit()
      })
    )

    this.replInstance.start()
  }

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
        if (this.options.fail) {
          // Call custom fail function.
          this.options.fail(msg, err, args, usage)
        } else {
          // Call default fail function.
          this.defaultFailFn(msg, err, args, usage)
        }
      }

      // We call the fail function in the runner chain if available, to give
      // async printer a chance to complete first.
      this.runnerInstance
        ? this.runnerInstance.then(cb)
        : Promise.resolve().then(cb)
    }
  }

  private defaultFailFn: FailFn = (msg, err, args, usage) => {
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
