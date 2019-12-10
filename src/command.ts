export function command(command: string) {
  return new Command(command)
}

export class Command {
  command: string
  description?: string
  handler?: Function

  constructor(command: string) {
    this.command = command
  }

  describe(description: string) {
    this.description = description
    return this
  }

  runs(fn: Function) {
    this.handler = fn
    return this
  }
}
