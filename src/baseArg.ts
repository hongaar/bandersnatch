import { InferredOptionType, Options, PositionalOptions } from 'yargs'
import { ArgumentOptions } from './argument'
import { OptionOptions } from './option'

export interface BaseArgOptions {
  prompt?: true | string
}

export type InferArgType<
  O extends Options | PositionalOptions,
  D = unknown
> = O extends {
  variadic: true
  type: 'number'
} // Add support for numeric variadic arguments
  ? Array<number>
  : O extends {
      variadic: true
    } // Add support for string variadic arguments
  ? Array<string>
  : unknown extends InferredOptionType<O> // Allow default type
  ? D
  : InferredOptionType<O>

export class BaseArg {
  protected name: string
  protected options: ArgumentOptions | OptionOptions = {}

  constructor(name: string) {
    this.name = name
  }

  /**
   * Set the argument/option description.
   */
  public description(description: string) {
    this.options.description = description
    return this
  }

  /**
   * Whether this argument/option can be interactive.
   */
  isPromptable() {
    return !!this.options.prompt
  }

  /**
   * Returns the prompt line.
   */
  getPrompt() {
    return typeof this.options.prompt === 'string'
      ? this.options.prompt
      : this.options.description
      ? this.options.description
      : this.name
  }

  /**
   * Returns the argument/option identifier.
   */
  getName() {
    return this.name
  }

  /**
   * Returns the argument/option description.
   */
  getDescription() {
    return this.options.description
  }

  /**
   * Returns the argument/option options.
   */
  getOptions() {
    return this.options
  }
}
