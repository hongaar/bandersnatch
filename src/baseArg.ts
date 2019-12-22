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
  protected description?: string
  protected options: ArgumentOptions | OptionOptions = {}

  constructor(name: string, description?: string) {
    this.name = name
    this.description = description
  }

  isPromptable() {
    return !!this.options.prompt
  }

  getPrompt() {
    return typeof this.options.prompt === 'string'
      ? this.options.prompt
      : this.description
      ? this.description
      : this.name
  }

  getName() {
    return this.name
  }

  getDescription() {
    return this.description
  }
}
