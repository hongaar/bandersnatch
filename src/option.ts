import { Argv, Options as BaseOptions } from 'yargs'
import { BaseArg, BaseArgOptions } from './baseArg.js'

// We ignore some not-so-common use cases from the type to make using this
// library easier. They could still be used at runtime but won't be documented
// here.
type IgnoreOptions =
  | 'array'
  | 'boolean'
  | 'conflicts'
  | 'config'
  | 'configParser'
  | 'count'
  | 'defaultDescription'
  | 'demand'
  | 'demandOption'
  | 'deprecate'
  | 'desc'
  | 'describe'
  | 'global'
  | 'group'
  | 'hidden'
  | 'implies'
  | 'nargs'
  | 'normalize'
  | 'number'
  | 'require'
  | 'required'
  | 'requiresArg'
  | 'skipValidation'
  | 'string'
  | 'implies'

export interface OptionOptions
  extends Omit<BaseOptions, IgnoreOptions>,
    BaseArgOptions {}

export function option(name: string) {
  return new Option(name)
}

export class Option extends BaseArg {
  protected options: OptionOptions = {}

  constructor(name: string, options?: OptionOptions) {
    super(name)

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
    return yargs.option(this.name, this.options)
  }
}
