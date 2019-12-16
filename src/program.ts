import yargs from 'yargs/yargs'
import { Command } from '.'

export function program(description?: string) {
  return new Program(description)
}

export class Program {
  private description: string | undefined
  private yargs = yargs(process.argv.slice(2))

  constructor(description?: string) {
    this.description = description
  }

  add<T>(command: Command<T>) {
    // See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
    this.yargs.command(command.toYargs())
    return this
  }

  repl() {
    // Do magic repl stuff
  }

  run() {
    if (this.description) {
      this.yargs.usage(this.description)
    }

    this.yargs.help().parse()
  }
}
