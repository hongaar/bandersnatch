import { ArgumentOptions } from './argument'
import { OptionOptions } from './option'

export interface BaseArgOptions {
  prompt?: true | string
}

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
