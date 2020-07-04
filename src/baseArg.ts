import type { InferredOptionType, Options, PositionalOptions } from 'yargs'
import type { ArgumentOptions } from './argument'
import type { OptionOptions } from './option'

export interface BaseArgOptions {
  prompt?: true | string
}

export type InferArgType<O extends Options | PositionalOptions, F = unknown> =
  /**
   * Add support for numeric variadic arguments
   */
  O extends {
    variadic: true
    type: 'number'
  }
    ? Array<number>
    : /**
     * Add support for string variadic arguments
     */
    O extends {
        variadic: true
      }
    ? Array<string>
    : /**
     * Prefer choices over default
     */
    O extends { choices: ReadonlyArray<infer C>; type: 'array' }
    ? C[]
    : O extends { choices: ReadonlyArray<infer C> }
    ? C
    : /**
     * Allow fallback type
     */
    unknown extends InferredOptionType<O>
    ? F
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
   * Get default value, if specified.
   */
  getDefault() {
    return this.options.default
  }

  /**
   * Get possible values, is specified.
   */
  getChoices() {
    return this.options.choices
  }

  /**
   * Get type, is specified.
   */
  getType() {
    return this.options.type
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
