import yargs from 'yargs/yargs'
import { prompt } from 'inquirer'
import { Command } from '.'
import { Repl } from './repl'

export function program(description?: string) {
  return new Program(description)
}

export class Program {
  private yargs = yargs(process.argv.slice(2))
  private description: string | undefined
  private promptPrefix: string | undefined
  private help = false
  private version = false

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

  async repl() {
    const repl = new Repl(this, this.promptPrefix)

    this.setupYargs()
    // await repl.run()
  }

  /**
   * If invoked with a command, this is used instead of process.argv.
   */
  run(command?: string | ReadonlyArray<string>) {
    this.setupYargs()

    if (command) {
      this.yargs.parse(command)
    } else {
      this.yargs.parse()
    }
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

    // This will make sure to display help when an invalid command is provided.
    this.yargs.strict()

    // This will make sure to display help when no command is provided.
    this.yargs.demandCommand()
  }
}
