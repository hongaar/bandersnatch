import { Argv, PositionalOptions } from 'yargs'
import { BaseArg, BaseArgOptions } from './baseArg.js'

// We ignore some not-so-common use cases from the type to make using this
// library easier. They could still be used at runtime but won't be documented
// here.
type IgnoreOptions =
  | 'array'
  | 'conflicts'
  | 'demandOption'
  | 'desc'
  | 'describe'
  | 'implies'
  | 'normalize'

export interface ArgumentOptions
  extends Omit<PositionalOptions, IgnoreOptions>,
    BaseArgOptions {
  optional?: true
  variadic?: true
}

export function argument(name: string, options?: ArgumentOptions) {
  return new Argument(name, options)
}

export const defaultOptions: ArgumentOptions = { type: 'string' }

export class Argument extends BaseArg {
  protected options: ArgumentOptions = {}

  constructor(name: string, options?: ArgumentOptions) {
    super(name)

    this.configure(options || {})
  }

  configure(options: ArgumentOptions) {
    this.options = { type: 'string', ...options }

    if (this.isPromptable()) {
      this.options = { optional: true, ...this.options }
    }

    return this
  }

  isOptional() {
    return this.options.optional
  }

  isVariadic() {
    return this.options.variadic
  }

  /**
   * Returns the formatted positional argument to be used in a command. See
   * https://github.com/yargs/yargs/blob/master/docs/advanced.md#positional-arguments
   */
  toCommand() {
    if (this.isVariadic()) {
      return `[${this.name}..]`
    }
    if (this.isOptional()) {
      return `[${this.name}]`
    }
    return `<${this.name}>`
  }

  /**
   * Calls the positional() method on the passed in yargs instance and returns
   * it. See http://yargs.js.org/docs/#api-positionalkey-opt
   */
  toYargs<T>(yargs: Argv<T>) {
    return yargs.positional(this.name, this.options)
  }
}
