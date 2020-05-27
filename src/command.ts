import { Argv, CommandModule, Arguments as BaseArguments } from 'yargs'
import { prompt, Question } from 'inquirer'
import { Argument, ArgumentOptions } from './argument'
import { Option, OptionOptions } from './option'
import { InferArgType } from './baseArg'

export type Arguments<T = {}> = T &
  BaseArguments<T> & {
    __promise?: Promise<any>
  }

type CommandOptions = {
  /**
   * Command description. Can also be set by calling
   * `command(...).description(...)`.
   *
   * Defaults to `undefined`.
   */
  description?: string
}

export interface HandlerFn<T> {
  (args: Omit<T, '_' | '$0'>): Promise<any> | any
}

function isArgument(obj: Argument | Option | Command): obj is Argument {
  return obj.constructor.name === 'Argument'
}

function isOption(obj: Argument | Option | Command): obj is Option {
  return obj.constructor.name === 'Option'
}

function isCommand(obj: Argument | Option | Command): obj is Command {
  return obj.constructor.name === 'Command'
}

/**
 * Creates a new command, which can be added to a program.
 */
export function command<T = {}>(
  command?: string | string[],
  options: CommandOptions = {}
) {
  return new Command<T>(command, options)
}

export class Command<T = {}> {
  private args: (Argument | Option | Command)[] = []
  private handler?: HandlerFn<T>

  constructor(
    private command?: string | string[],
    private options: CommandOptions = {}
  ) {}

  /**
   * Set the command description.
   */
  public description(description: string) {
    this.options.description = description
    return this
  }

  /**
   * Adds a new positional argument to the command.
   * This is shorthand for `.add(argument(...))`
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

    return (this as unknown) as Command<
      T & { [key in K]: InferArgType<O, string> }
    >
  }

  /**
   * Adds a new option to the command.
   * This is shorthand for `.add(option(...))`
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

    return (this as unknown) as Command<T & { [key in K]: InferArgType<O> }>
  }

  /**
   * This is the base method for adding arguments, options and commands, but it
   * doesn't provide type hints. Use `.argument()` and `.option()` instead.
   */
  add(obj: Argument | Option | Command) {
    if (isArgument(obj)) {
      // If last argument is variadic, we should not add more arguments. See
      // https://github.com/yargs/yargs/blob/master/docs/advanced.md#variadic-positional-arguments
      const allArguments = this.getArguments()
      const lastArgument = allArguments[allArguments.length - 1]

      if (lastArgument && lastArgument.isVariadic()) {
        throw new Error("Can't add more arguments.")
      }

      this.args.push(obj)
    } else if (isOption(obj)) {
      this.args.push(obj)
    } else if (isCommand(obj)) {
      this.args.push(obj)
    } else {
      throw new Error('Not implemented.')
    }

    return this
  }

  /**
   * Mark as the default command.
   */
  default() {
    this.command = '$0'
    return this
  }

  /**
   * Provide a function to execute when this command is invoked.
   */
  action(fn: HandlerFn<T>) {
    this.handler = fn
    return this
  }

  private getArguments() {
    return this.args.filter(isArgument)
  }

  private getOptions() {
    return this.args.filter(isOption)
  }

  private getCommands() {
    return this.args.filter(isCommand)
  }

  /**
   * Calls the command() method on the passed in yargs instance and returns it.
   * See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
   */
  public toYargs(yargs: Argv) {
    return yargs.command(this.toModule())
  }

  /**
   * Returns a yargs module for this command.
   */
  private toModule() {
    const module: CommandModule<{}, T> = {
      command: this.getCommand(),
      aliases: [],
      describe: this.options.description || '',
      builder: this.getBuilder(),
      handler: this.getHandler(),
    }
    return module
  }

  /**
   * Returns a formatted command which can be used in the `command()` function
   * of yargs.
   */
  private getCommand() {
    if (!this.command) {
      throw new Error('Command name must be set')
    }

    const args = this.getArguments()
      .map((arg) => arg.toCommand())
      .join(' ')

    if (args !== '') {
      return Array.isArray(this.command)
        ? [`${this.command[0]} ${args}`, ...this.command.slice(1)]
        : `${this.command} ${args}`
    }

    return this.command
  }

  /**
   * Returns the builder function to be used with `yargs.command()`.
   */
  private getBuilder() {
    return (yargs: Argv) => {
      // Call toYargs on each argument and option to add it to the command.
      yargs = [...this.getArguments(), ...this.getOptions()].reduce(
        (yargs, arg) => arg.toYargs(yargs),
        yargs
      )
      // Call toYargs on each subcommand to add it to the command.
      yargs = this.getCommands().reduce(
        (yargs, cmd) => cmd.toYargs(yargs),
        yargs
      )
      return yargs as Argv<T>
    }
  }

  /**
   * Wraps the actual command handler to insert prompt and async handler logic.
   */
  private getHandler() {
    return (argv: Arguments<T>) => {
      const { _, $0, ...rest } = argv
      const questions = this.getQuestions(rest)
      let chain = Promise.resolve(rest)

      if (questions.length) {
        chain = chain.then(this.prompt(questions))
      }

      chain = chain.then(async (args) => {
        // @todo check if command has sub-commands, and if so, do not throw an
        // error but maybe show help instead?
        if (!this.handler) {
          throw new Error('No handler defined for this command.')
        }

        return this.handler(args)
      })

      // Save promise chain on argv instance, so we can access it in parse
      // callback.
      argv.__promise = chain

      return chain
    }
  }

  /**
   * Returns an array of arguments and options which should be prompted, because
   * they are promptable (`isPromptable()` returned true) and they are not
   * provided in the args passed in to this function.
   */
  private getQuestions<T = {}>(args: T) {
    // If we need to prompt for things, fill questions array
    return [...this.getArguments(), ...this.getOptions()].reduce(
      (questions, arg) => {
        const name = arg.getName()
        const presentInArgs = Object.constructor.hasOwnProperty.call(args, name)
        // @todo How can we force prompting when default was used?
        if (!presentInArgs && arg.isPromptable()) {
          questions.push({
            name,
            message: arg.getPrompt(),
          })
        }

        return questions
      },
      [] as Question[]
    )
  }

  /**
   * Ask questions and merge with passed in args.
   */
  private prompt = <Q = Question[]>(questions: Q) => <T = {}>(args: T) => {
    return prompt<{}>(questions).then((answers) => ({
      ...args,
      ...answers,
    }))
  }
}
