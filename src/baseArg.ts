import type { InferredOptionType, Options, PositionalOptions } from 'yargs'
import type { ArgumentOptions } from './argument.js'
import type { OptionOptions } from './option.js'

export interface BaseArgOptions {
  prompt?: true | string
}

// prettier-ignore
export type InferArgType<O extends Options | PositionalOptions, F = unknown> =
  // Default number
  O extends { default: number } ? number :
  // Optional number
  O extends { type: 'number', optional: true } ? number | undefined :
  // Variadic number
  O extends { type: 'number', variadic: true } ? Array<number> :
  // Number
  O extends { type: 'number' } ? number :
  // Default boolean
  O extends { default: boolean } ? boolean :
  // Optional boolean
  O extends { type: 'boolean', optional: true } ? boolean | undefined :
  // Variadic boolean
  O extends { type: 'boolean', variadic: true } ? Array<boolean> :
  // Boolean
  O extends { type: 'boolean' } ? boolean :
  // Choices with array type
  O extends { choices: ReadonlyArray<infer C>; type: 'array' } ? C[] :
  // Choices with array default
  O extends { choices: ReadonlyArray<infer C>, default: ReadonlyArray<string> } ? C[] :
  // Choices, optional
  O extends { choices: ReadonlyArray<infer C>, optional: true } ? C | undefined :
  // Prefer choices over default
  O extends { choices: ReadonlyArray<infer C> } ? C :
  // Default string
  O extends { default: string } ? string :
  // Optional string
  O extends { optional: true } ? string | undefined :
  // Variadic string
  O extends { variadic: true } ? Array<string> :
  // Allow fallback type
  unknown extends InferredOptionType<O> ? F :
  // Base type from yargs
  InferredOptionType<O>

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
   * @todo See if we can add this to autocompleter
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
