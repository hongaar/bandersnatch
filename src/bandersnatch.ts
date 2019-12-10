import yargs from 'yargs/yargs'
import { Command } from '.'

export function bandersnatch(name?: string) {
  return new Bandersnatch(name)
}

export class Bandersnatch {
  description: string | undefined
  yargs = yargs(process.argv.slice(2))

  constructor(description?: string) {
    this.description = description
  }

  add(command: Command) {
    // See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
    this.yargs.command({
      command: command.command,
      aliases: [],
      describe: command.description,
      builder: {},
      handler: function(argv) {
        if (command.handler) {
          command.handler(argv)
        }
      }
    })
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
