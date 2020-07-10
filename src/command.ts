import { Argv, CommandModule, Arguments as BaseArguments } from 'yargs'
import { Argument, ArgumentOptions } from './argument'
import { Option, OptionOptions } from './option'
import { InferArgType } from './baseArg'
import { prompter } from './prompter'

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

  /**
   * When set to true, creates a hidden command not visible in autocomplete or
   * help output. Can also be set by calling `command(...).hidden()`.
   *
   * Default to `false`.
   */
  hidden?: boolean
}

type CommandRunner = (command: string) => Promise<unknown>

export interface HandlerFn<T> {
  (args: Omit<T, '_' | '$0'>, commandRunner: CommandRunner): Promise<any> | any
}

function isArgument(obj: Argument | Option | Command): obj is Argument {
  return obj instanceof Argument
}

function isOption(obj: Argument | Option | Command): obj is Option {
  return obj instanceof Option
}

function isCommand(obj: Argument | Option | Command): obj is Command {
  return obj instanceof Command
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
  private parent?: Command<any>

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
   * Marks the command as hidden, i.e. not visible in autocomplete or help
   * output.
   */
  public hidden() {
    this.options.hidden = true
    return this
  }

  /**
   * Adds a new positional argument to the command.
   * This is shorthand for `.add(argument(...))`
   */
  public argument<K extends string, O extends ArgumentOptions>(
    name: K,
    options?: O
  ) {
    this.add(new Argument(name, options))

    return (this as unknown) as Command<
      T & { [key in K]: InferArgType<O, string> }
    >
  }

  /**
   * Adds a new option to the command.
   * This is shorthand for `.add(option(...))`
   */
  public option<K extends string, O extends OptionOptions>(
    name: K,
    options?: O
  ) {
    this.add(new Option(name, options))

    return (this as unknown) as Command<T & { [key in K]: InferArgType<O> }>
  }

  /**
   * This is the base method for adding arguments, options and commands, but it
   * doesn't provide type hints. Use `.argument()` and `.option()` instead.
   */
  public add(obj: Argument | Option | Command<any>) {
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
      obj.setParentCommand(this)
      this.args.push(obj)
    } else {
      console.log('add', { obj, command: this })
      throw new Error('Not implemented.')
    }

    return this
  }

  /**
   * Mark as the default command.
   */
  public default() {
    this.command = '$0'
    return this
  }

  /**
   * Provide a function to execute when this command is invoked.
   */
  public action(fn: HandlerFn<T>) {
    this.handler = fn
    return this
  }

  /**
   * Set the parent command. This method may change at any time, not
   * intended for public use.
   *
   * @private
   */
  public setParentCommand(parentCommand: Command<any>) {
    this.parent = parentCommand
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
   * Returns a fully qualified command name (including parent command names).
   */
  private getFqn(): string {
    if (!this.command) {
      throw new Error("Can't get command FQN for default commands.")
    }

    const command = Array.isArray(this.command) ? this.command[0] : this.command

    if (this.parent) {
      return `${this.parent.getFqn()} ${command}`
    }

    return command
  }

  /**
   * Calls the command() method on the passed in yargs instance and returns it.
   * Takes command runner.
   * See https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
   */
  public toYargs(yargs: Argv, commandRunner: CommandRunner) {
    return yargs.command(this.toModule(commandRunner))
  }

  /**
   * Returns a yargs module for this command. Takes command runner, which is
   * passed down to getHandler and getBuilder functions.
   */
  private toModule(commandRunner: CommandRunner) {
    const module: CommandModule<{}, T> = {
      command: this.toYargsCommand(),
      aliases: [],
      describe: this.options.hidden ? false : this.options.description || '',
      builder: this.getBuilder(commandRunner),
      handler: this.getHandler(commandRunner),
    }
    return module
  }

  /**
   * Returns a formatted command which can be used in the `command()` function
   * of yargs.
   */
  private toYargsCommand() {
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
   * Returns the builder function to be used with `yargs.command()`. Takes
   * command runner.
   */
  private getBuilder(commandRunner: CommandRunner) {
    return (yargs: Argv) => {
      // Call toYargs on each argument and option to add it to the command.
      yargs = [...this.getArguments(), ...this.getOptions()].reduce(
        (yargs, arg) => arg.toYargs(yargs),
        yargs
      )
      // Call toYargs on each subcommand to add it to the command.
      yargs = this.getCommands().reduce(
        (yargs, cmd) => cmd.toYargs(yargs, commandRunner),
        yargs
      )
      return yargs as Argv<T>
    }
  }

  /**
   * Wraps the actual command handler to insert prompt and async handler logic.
   * Takes command runner.
   */
  private getHandler(commandRunner: CommandRunner) {
    return async (argv: Arguments<T>) => {
      const { _, $0, ...rest } = argv
      const prompterInstance = prompter(
        [...this.getArguments(), ...this.getOptions()],
        rest
      )

      let promise = prompterInstance.prompt()

      promise = promise.then((args) => {
        if (this.handler) {
          return this.handler(args, commandRunner)
        }

        // Display help this command contains sub-commands
        if (this.getCommands().length) {
          return commandRunner(`${this.getFqn()} --help`)
        }

        throw new Error('No handler defined for this command.')
      })

      // Save promise chain on argv instance, so we can access it in parse
      // callback.
      argv.__promise = promise

      return promise
    }
  }
}
