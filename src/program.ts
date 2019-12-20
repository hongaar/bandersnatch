import { Argv } from 'yargs'
import yargs from 'yargs/yargs'
import { red } from 'ansi-colors'
import { Command } from '.'
import { Repl } from './repl'
import { command, Arguments } from './command'
import { isPromise } from './utils'

export function program(description?: string) {
  return new Program(description)
}

type FailFn = (msg: string, err: Error, yargs: Argv) => void

export class Program {
  private yargs = yargs(process.argv.slice(2))
  private promptPrefix: string | undefined
  private failFn?: FailFn
  private replInstance?: Repl

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
   * If invoked with a command, this is used instead of process.argv.
   */
  run(command?: string | ReadonlyArray<string>) {
    const cmd = command || process.argv.slice(2)

    // Return promise resolving to the return value of the command handler.
    return new Promise((resolve, reject) => {
      this.yargs.parse(cmd, {}, (err, argv: Arguments, output) => {
        if (output) {
          console.log(output)
        }
        if (isPromise(argv.__promise)) {
          argv.__promise.then(resolve)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Run event loop which reads command from stdin.
   */
  repl() {
    this.replInstance = new Repl(this, this.promptPrefix)

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
    if (this.failFn) {
      this.failFn(msg, err, yargs)
    } else if (this.replInstance) {
      if (msg) {
        this.replInstance.setError(msg)
      } else if (err) {
        this.replInstance.setError(err.stack ?? err.message)
      }
    } else {
      if (msg) {
        console.error(red(msg))
      } else if (err) {
        console.error(red(err.stack ?? err.message))
      }
      console.error('')
      console.error(yargs.help())

      process.exit(1)
    }
  }
}
