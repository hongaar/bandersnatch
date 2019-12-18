import { Argv, PositionalOptions } from 'yargs'

// We ignore some not-so-common use cases from the type to make using this
// library easier. They could still be used at runtime but won't be documented
// here.
type IgnoreOptions = 'desc' | 'describe' | 'conflicts' | 'implies'

export interface ArgumentOptions
  extends Omit<PositionalOptions, IgnoreOptions> {
  optional?: boolean
  variadic?: boolean
}

export function argument(name: string, description?: string) {
  return new Argument(name, description)
}

export const defaultOptions: ArgumentOptions = { type: 'string' }

export class Argument {
  private name: string
  private description?: string
  private options: ArgumentOptions = {}

  constructor(name: string, description?: string, options?: ArgumentOptions) {
    this.name = name
    this.description = description
    this.configure(options || {})
  }

  configure(options: ArgumentOptions) {
    this.options = { type: 'string', ...options }
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
    return yargs.positional(this.name, {
      description: this.description,
      ...this.options
    })
  }
}
