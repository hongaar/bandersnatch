import { CommandModule } from 'yargs'
import { Argument } from './argument'
import { Option } from './option'

export type ArgValue = string | number | boolean

export interface ArgumentOptions {
  required?: boolean
  variadic?: boolean
  default?: any
}

export interface HandlerFn<T = {}> {
  (args: T): Promise<void>
}

export function command(command: string, description?: string) {
  return new Command(command, description)
}

export class Command {
  private command: string
  private description?: string
  private arguments: Argument[] = []
  private options: Option[] = []
  private handler?: Function

  constructor(command: string, description?: string) {
    this.command = command
    if (description) {
      this.describe(description)
    }
  }

  describe(description: string) {
    this.description = description
    return this
  }

  argument(name: string, description?: string, options: ArgumentOptions = {}) {
    const argument = new Argument(name, description)

    if (options.required) {
      argument.require()
    }
    if (options.variadic) {
      argument.vary()
    }

    this.arguments.push(argument)

    return this
  }

  action(fn: HandlerFn) {
    this.handler = fn
    return this
  }

  toYargs() {
    const module: CommandModule = {
      command: this.buildCommand(),
      aliases: [],
      describe: this.description,
      builder: yargs => {
        this.arguments.forEach(argument => argument.toBuilder(yargs))
        return yargs
      },
      handler: async argv => {
        if (this.handler) {
          await this.handler(argv)
        }
      }
    }
    return module
  }

  private buildCommand() {
    const args = this.arguments.map(arg => arg.toCommand()).join(' ')

    if (args !== '') {
      return `${this.command} ${args}`
    }

    return this.command
  }
}
