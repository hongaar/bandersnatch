import { Argv } from 'yargs'
import { ArgValue } from './command'

export function argument(name: string) {
  return new Argument(name)
}

export class Argument {
  private name: string
  private description?: string
  private required = false
  private variadic = false
  private defaultValue?: ArgValue
  private defaultDescription?: string
  private choices?: Function

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

  require() {
    this.required = true
  }

  vary() {
    this.variadic = true
  }

  default(value: ArgValue, description?: string) {
    this.defaultValue = value

    if (description) {
      this.defaultDescription = description
    }
  }

  toCommand() {
    if (this.required) {
      return `<${this.name}>`
    }
    if (this.variadic) {
      return `[...${this.name}]`
    }
    return `[${this.name}]`
  }

  toBuilder(yargs: Argv) {
    yargs.positional(this.name, {
      default: this.defaultValue,
      defaultDescription: this.defaultDescription
    })
  }
}
