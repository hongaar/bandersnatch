import { Argv, PositionalOptions } from 'yargs'

// We ignore some not-so-common use cases from the type to make using this
// library easier. They could still be used at runtime but won't be documented
// here.
type IgnoreOptions = 'desc' | 'describe' | 'conflicts' | 'implies'

export interface ArgumentOptions
  extends Omit<PositionalOptions, IgnoreOptions> {}

export function argument(name: string, description?: string) {
  return new Argument(name, description)
}

export class Argument {
  private name: string
  private description?: string
  private required = true
  private vary = false
  private opts: ArgumentOptions = {}

  constructor(name: string, description?: string) {
    this.name = name
    if (description) {
      this.describe(description)
    }
  }

  describe(description: string) {
    this.description = description
    return this
  }

  optional() {
    this.required = false
    return this
  }

  isOptional() {
    return !this.required
  }

  variadic() {
    this.vary = true
    return this
  }

  isVariadic() {
    return this.vary
  }

  options(options: ArgumentOptions) {
    this.opts = options
    return this
  }

  /**
   * Returns the formatted positional argument to be used in a command. See
   * https://github.com/yargs/yargs/blob/master/docs/advanced.md#positional-arguments
   */
  toCommand() {
    if (this.vary) {
      return `[${this.name}..]`
    }
    if (this.required) {
      return `<${this.name}>`
    }
    return `[${this.name}]`
  }

  /**
   * Calls the positional() method on the passed in yargs instance and returns
   * it. See http://yargs.js.org/docs/#api-positionalkey-opt
   */
  toYargs<T>(yargs: Argv<T>) {
    return yargs.positional(this.name, {
      description: this.description,
      ...this.opts
    })
  }
}
