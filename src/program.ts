import yargs from 'yargs/yargs'
import { prompt } from 'inquirer'
import { Command } from '.'
import { Repl } from './repl'
import { command } from './command'

export function program(description?: string) {
  return new Program(description)
}

export class Program {
  private yargs = yargs(process.argv.slice(2))
  private description: string | undefined
  private promptPrefix: string | undefined
  private help = false
  private version = false
  private exit = false

  constructor(description?: string) {
    this.description = description
  }

  add<T>(command: Command<T>) {
    this.yargs.command(command.toYargs())
    return this
  }

  default<T>(command: Command<T>) {
    this.yargs.command(command.default().toYargs())
    return this
  }

  prompt(prompt: string) {
    this.promptPrefix = prompt
    return this
  }

  withHelp() {
    this.help = true
    return this
  }

  withVersion() {
    this.version = true
    return this
  }

  withExit() {
    this.exit = true
    return this
  }

  repl() {
    const repl = new Repl(this, this.promptPrefix)

    this.setupYargs()

    // Don't exit on errors
    this.yargs.exitProcess(false)

    // Add exit command if needed
    if (this.exit) {
      this.add(
        command('exit', 'Exit the application').action(() => {
          process.exit()
        })
      )
    }

    repl.run()
  }

  /**
   * If invoked with a command, this is used instead of process.argv.
   */
  run(command?: string | ReadonlyArray<string>) {
    this.setupYargs()

    const cmd = command || process.argv.slice(2)

    // Return the promise returned from the handler.
    return new Promise((resolve, reject) => {
      this.yargs.parse(cmd, {}, (err, argv, output) => {
        console.log('in parse callback')
        console.log('argv', argv)
        console.log('argv.__promise', typeof argv.__handlerRetVal)
        const promise = argv.__promise as Promise<any> | undefined
        if (promise && promise.then && typeof promise.then === 'function') {
          promise.then(resolve)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Prepare our instance of yargs with program properties.
   */
  private setupYargs() {
    if (this.description) {
      this.yargs.usage(this.description)
    }

    // Enable help command
    this.yargs.help(this.help)

    // Enable version command
    if (this.version === true) {
      this.yargs.version()
    } else {
      this.yargs.version(false)
    }

    // Provide suggestions if no matching command is found.
    this.yargs.recommendCommands()

    // This will make sure to display help when an invalid command is provided.
    this.yargs.strict()

    // This will make sure to display help when no command is provided.
    this.yargs.demandCommand()

    // Maximize the width of yargs usage instructions.
    this.yargs.wrap(this.yargs.terminalWidth())
  }
}
