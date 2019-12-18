import yargs from 'yargs/yargs'
import { Command } from '.'

export function program(description?: string) {
  return new Program(description)
}

export class Program {
  private yargs = yargs(process.argv.slice(2))
  private description: string | undefined
  private help = false
  private version = false

  constructor(description?: string) {
    this.description = description
  }

  add<T>(command: Command<T>) {
    // See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
    // @ts-ignore
    this.yargs.command(command.toYargs())
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

  repl() {
    // Do magic repl stuff
  }

  /**
   * If invoked with a command, this is used instead of process.argv.
   */
  run(command?: string | ReadonlyArray<string>) {
    if (this.description) {
      this.yargs.usage(this.description)
    }

    this.yargs.help(this.help)
    this.yargs.version(this.version)

    // This will make sure to display help when an invalid command is provided.
    this.yargs.strict()

    // This will make sure to display help when no command is provided.
    this.yargs.demandCommand()

    if (command) {
      this.yargs.parse(command)
    } else {
      this.yargs.parse()
    }
  }
}
