import { Argv } from 'yargs'
import yargs from 'yargs/yargs'
import { red } from 'ansi-colors'
import { Command } from '.'
import { Repl, repl } from './repl'
import { command, Arguments } from './command'
import { isPromise } from './utils'
import { container, Container } from './container'
import { runner, Runner } from './runner'

export function program(description?: string) {
  return new Program(description)
}

type FailFn = (msg: string, err: Error, args: Arguments, usage?: string) => void

export class Program {
  private yargs = yargs()
  private container: ReturnType<Container['withDefaults']>
  private promptPrefix: string | undefined
  private failFn?: FailFn
  private replInstance?: Repl
  private runnerInstance?: Runner

  constructor(description?: string) {
    if (description) {
      this.yargs.usage(description)
    }

    // Some defaults
    this.yargs.help(false)
    this.yargs.version(false)
    this.yargs.recommendCommands()
    this.yargs.strict()
    this.yargs.demandCommand()

    // Bind defaults to container
    this.container = container().withDefaults()

    // Custom fail function.
    // TODO current yargs types doesn't include the third parameter.
    this.yargs.fail(this.failHandler.bind(this) as any)
  }

  add<T>(command: Command<T>) {
    command.toYargs(this.yargs)
    return this
  }

  default<T>(command: Command<T>) {
    command.default().toYargs(this.yargs)
    return this
  }

  prompt(prompt: string) {
    this.promptPrefix = prompt
    return this
  }

  withHelp() {
    this.yargs.help(true)
    return this
  }

  withVersion() {
    this.yargs.version()
    return this
  }

  fail(fn: FailFn) {
    this.failFn = fn
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
      this.yargs.parse(cmd, {}, (err, argv: Arguments, output) => {
        // Output is a string for built-in commands like --version and --help
        if (output) {
          console.log(output)
        }

        // TODO When is err defined?
        if (err) {
          console.error(err)
        }

        if (isPromise(argv.__promise)) {
          // Delegate resolve/reject to promise returned from handler
          argv.__promise.then(resolve).catch(reject)
        } else {
          // Resolve with void if promise is not available, which is the case
          // e.g. with --version and --help
          resolve()
        }
      })
    }, this.container)

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
    this.replInstance = repl(this, this.promptPrefix)

    // Don't exit on errors.
    this.yargs.exitProcess(false)

    // Add exit command
    this.add(
      command('exit', 'Exit the application').action(() => {
        process.exit()
      })
    )

    this.replInstance.loop()
  }

  /**
   * Allow tweaking the underlaying yargs instance.
   */
  yargsInstance() {
    return this.yargs
  }

  private failHandler(msg: string, err: Error, yargs: Argv) {
    if (this.replInstance) {
      // In case we're in a REPL session, we don't want to exit the process
      // when an error occurs.
      this.replInstance.setError(msg ?? err.stack ?? err.message)
    } else {
      const args = yargs.argv
      const usage = (yargs.help() as unknown) as string
      const cb = () => {
        if (this.failFn) {
          // Call custom fail function.
          this.failFn(msg, err, args, usage)
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
      console.error(red(msg))
    }

    if (usage) {
      console.error('')
      console.error(usage)
    }

    process.exit(1)
  }
}
