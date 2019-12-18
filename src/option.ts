import { Options as BaseOptions, Argv } from 'yargs'

// We ignore some not-so-common use cases from the type to make using this
// library easier. They could still be used at runtime but won't be documented
// here.
type IgnoreOptions =
  | 'require'
  | 'required'
  | 'desc'
  | 'describe'
  | 'conflicts'
  | 'implies'
  | 'demand'

export interface OptionOptions extends Omit<BaseOptions, IgnoreOptions> {}

export function option(name: string) {
  return new Option(name)
}

export class Option {
  private name: string
  private description?: string
  private options: OptionOptions = {}

  constructor(name: string, description?: string, options?: OptionOptions) {
    this.name = name
    this.description = description
    this.configure(options || {})
  }

  configure(options: OptionOptions) {
    this.options = options
    return this
  }

  /**
   * Calls the option() method on the passed in yargs instance and returns
   * it. See http://yargs.js.org/docs/#api-positionalkey-opt
   */
  toYargs<T>(yargs: Argv<T>) {
    return yargs.option(this.name, {
      description: this.description,
      ...this.options
    })
  }
}
