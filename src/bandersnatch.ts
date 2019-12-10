import yargs from 'yargs'
import { Command } from '.'

export function bandersnatch(name?: string) {
  return new Bandersnatch(name)
}

export class Bandersnatch {
  description: string | undefined

  constructor(description?: string) {
    this.description = description
  }

  add(command: Command) {
    // See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
    yargs.command({
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
      yargs.usage(this.description)
    }

    yargs.help().parse()
  }
}
