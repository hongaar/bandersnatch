import {
  Argv,
  CommandModule,
  InferredOptionType,
  Arguments,
  Options,
  PositionalOptions
} from 'yargs'
import { prompt, QuestionCollection, Question } from 'inquirer'
import { Argument, ArgumentOptions } from './argument'
import { Option, OptionOptions } from './option'

type InferT<O extends Options | PositionalOptions, D = unknown> = O extends {
  variadic: true
  type: 'number'
} // Add support for numeric variadic arguments
  ? Array<number>
  : O extends {
      variadic: true
      type: 'string'
    } // Add support for string variadic arguments
  ? Array<string>
  : unknown extends InferredOptionType<O> // Allow default type
  ? D
  : InferredOptionType<O>

export interface HandlerFn<T = {}> {
  (args: Omit<T, '_' | '$0'>): void | Promise<void>
}

function isArgument(argOrOption: Argument | Option): argOrOption is Argument {
  return argOrOption.constructor.name === 'Argument'
}

function isOption(argOrOption: Argument | Option): argOrOption is Option {
  return argOrOption.constructor.name === 'Option'
}

export function command<T = {}>(command: string, description?: string) {
  return new Command<T>(command, description)
}

export class Command<T = {}> {
  private command: string
  private description?: string
  private args: (Argument | Option)[] = []
  private handler?: HandlerFn<T>

  constructor(command: string, description?: string) {
    this.command = command
    this.description = description
  }

  /*
   * This is shorthand for .add(argument(...))
   */
  argument<K extends string, O extends ArgumentOptions>(
    name: K,
    descriptionOrOptions?: string | O,
    options?: O
  ) {
    // Shift arguments
    if (typeof descriptionOrOptions !== 'string') {
      options = descriptionOrOptions
      descriptionOrOptions = undefined
    }

    this.add(new Argument(name, descriptionOrOptions, options))

    return (this as unknown) as Command<T & { [key in K]: InferT<O, string> }>
  }

  /*
   * This is shorthand for .add(option(...))
   */
  option<K extends string, O extends OptionOptions>(
    name: K,
    descriptionOrOptions?: string | O,
    options?: O
  ) {
    // Shift arguments
    if (typeof descriptionOrOptions !== 'string') {
      options = descriptionOrOptions
      descriptionOrOptions = undefined
    }

    this.add(new Option(name, descriptionOrOptions, options))

    return (this as unknown) as Command<T & { [key in K]: InferT<O> }>
  }

  /**
   * This is the base method for adding arguments and options, but it doesn't provide
   * type hints. Use .argument() and .option() instead.
   */
  add(argOrOption: Argument | Option) {
    if (isArgument(argOrOption)) {
      // If last argument is variadic, we should not add more arguments. See
      // https://github.com/yargs/yargs/blob/master/docs/advanced.md#variadic-positional-arguments
      const allArguments = this.getArguments()
      const lastArgument = allArguments[allArguments.length - 1]
      if (lastArgument && lastArgument.isVariadic()) {
        throw new Error("Can't add more arguments.")
      }

      this.args.push(argOrOption)
    } else if (isOption(argOrOption)) {
      this.args.push(argOrOption)
    } else {
      throw new Error('Not implemented.')
    }

    return this
  }

  default() {
    this.command = '$0'
    return this
  }

  action(fn: HandlerFn<T>) {
    this.handler = fn
    return this
  }

  getArguments() {
    return this.args.filter(isArgument)
  }

  getOptions() {
    return this.args.filter(isOption)
  }

  /**
   * Returns a command module.
   * See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
   */
  toYargs() {
    const module: CommandModule<{}, T> = {
      command: this.getCommand(),
      aliases: [],
      describe: this.description,
      builder: this.getBuilder(),
      handler: this.getHandler()
    }
    return module
  }

  /**
   * Returns a formatted command which can be used in the command() function
   * of yargs.
   */
  private getCommand() {
    const args = this.getArguments()
      .map(arg => arg.toCommand())
      .join(' ')

    if (args !== '') {
      return `${this.command} ${args}`
    }

    return this.command
  }

  /**
   * Returns the builder function to be used with yargs.command().
   */
  private getBuilder() {
    return (yargs: Argv) => {
      // Call toYargs on each argument or option to add it to the command.
      return this.args.reduce(
        (yargs, arg) => arg.toYargs(yargs),
        yargs as Argv<T>
      )
    }
  }

  /**
   * Returns the command handler
   */
  private getHandler() {
    return async (argv: Arguments<T>) => {
      if (this.handler) {
        const { _, $0, ...rest } = argv
        const args = await this.prompt(rest)

        await this.handler(args)
      } else {
        throw new Error('No handler defined for this command.')
      }
    }
  }

  private async prompt<T = {}>(args: T) {
    // If we need to prompt for things, fill questions array
    const questions = this.args.reduce((questions, arg) => {
      const name = arg.getName()
      const presentInArgs = Object.constructor.hasOwnProperty.call(args, name)
      if (!presentInArgs && arg.isPromptable()) {
        questions.push({
          name,
          message: arg.getPrompt()
        })
      }

      return questions
    }, [] as Question[])

    // Ask questions and add to args
    const answers = await prompt(questions)

    return { ...args, ...answers }
  }
}
