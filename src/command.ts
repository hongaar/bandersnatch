import { Argv, CommandModule, InferredOptionType, Arguments } from 'yargs'
import { Argument, ArgumentOptions as BaseArgumentOptions } from './argument'
import { Option, OptionOptions as BaseOptionOptions } from './option'

interface ArgumentOptions extends BaseArgumentOptions {
  optional?: boolean
  variadic?: boolean
}

interface OptionOptions extends BaseOptionOptions {}

export interface HandlerFn<T = {}> {
  (args: Omit<T, '_' | '$0'>): Promise<void>
}

function isArgument(argOrOption: Argument | Option): argOrOption is Argument {
  return argOrOption.constructor.name === 'Argument'
}

function isOption(argOrOption: Argument | Option): argOrOption is Option {
  return argOrOption.constructor.name === 'Option'
}

export function command(command: string, description?: string) {
  return new Command(command, description)
}

export class Command<T = {}> {
  private command: string
  private description?: string
  private arguments: Argument[] = []
  private options: Option[] = []
  private handler?: HandlerFn<T>

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

  /*
   * This is shorthand for .add(argument())
   */
  argument<K extends string, O extends ArgumentOptions>(
    name: K,
    description?: string,
    options?: O
  ) {
    const argument = new Argument(name, description)
    const { optional, variadic, ...yargOptions } = options || {}

    optional && argument.optional()
    variadic && argument.variadic()
    argument.options(yargOptions)

    this.add(argument)

    return (this as unknown) as Command<
      T & { [key in K]: InferredOptionType<O> }
    >
  }

  /*
   * This is shorthand for .add(option())
   */
  option<K extends string, O extends OptionOptions>(
    name: K,
    description?: string,
    options?: O
  ) {
    const option = new Option(name, description)
    const { ...yargOptions } = options || {}

    option.options(yargOptions)

    this.add(option)

    return (this as unknown) as Command<
      T & { [key in K]: InferredOptionType<O> }
    >
  }

  add(argOrOption: Argument | Option) {
    if (isArgument(argOrOption)) {
      // If last argument is variadic, we should not add more arguments. See
      // https://github.com/yargs/yargs/blob/master/docs/advanced.md#variadic-positional-arguments
      const lastArgument = this.arguments[this.arguments.length - 1]
      if (lastArgument && lastArgument.isVariadic()) {
        throw new Error("Can't add more arguments")
      }

      this.arguments.push(argOrOption)
    } else if (isOption(argOrOption)) {
      this.options.push(argOrOption)
    } else {
      throw new Error('Not implemented')
    }
  }

  action(fn: HandlerFn<T>) {
    this.handler = fn
    return this
  }

  toYargs() {
    const module: CommandModule<{}, T> = {
      command: this.getCommand(),
      aliases: [],
      describe: this.description,
      builder: this.getBuilder(),
      handler: async argv => {
        if (this.handler) {
          const { _, $0, ...rest } = argv
          await this.handler(rest)
        }
      }
    }
    return module
  }

  /**
   * Returns a formatted command which can be used in the command() function
   * of yargs
   */
  private getCommand() {
    const args = this.arguments.map(arg => arg.toCommand()).join(' ')

    if (args !== '') {
      return `${this.command} ${args}`
    }

    return this.command
  }

  private getBuilder() {
    return (yargs: Argv) => {
      // Call toYargs on each argument to add it to the command.
      const withArguments = this.arguments.reduce(
        (yargs, argument) => argument.toYargs(yargs),
        yargs as Argv<T>
      )
      // Call toYargs on each option to add it to the command.
      const withOptions = this.options.reduce(
        (yargs, option) => option.toYargs(yargs),
        withArguments
      )
      return withOptions
    }
  }

  private getHandler() {
    return async (argv: Arguments<T>) => {
      console.log(this)
      if (this.handler) {
        const { _, $0, ...rest } = argv
        await this.handler(rest)
      }
    }
  }
}
